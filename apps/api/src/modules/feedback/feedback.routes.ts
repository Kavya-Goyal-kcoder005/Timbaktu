import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { feedbackSubmissionSchema, feedbackStatusEnum, FeedbackCategory, FeedbackStatus } from '@timbaktu/shared';
import { FeedbackModel } from '../../models/Feedback';
import { optionalAuth, requireAdmin } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

// In-memory rate limiter & duplicate spam prevention
interface SubmissionRecord {
  timestamp: number;
  messageHash: string;
}
const recentSubmissions = new Map<string, SubmissionRecord[]>();

// Clean up old rate limit records every 10 minutes
setInterval(() => {
  const cutoff = Date.now() - 10 * 60 * 1000;
  for (const [key, records] of recentSubmissions.entries()) {
    const fresh = records.filter(r => r.timestamp > cutoff);
    if (fresh.length === 0) {
      recentSubmissions.delete(key);
    } else {
      recentSubmissions.set(key, fresh);
    }
  }
}, 10 * 60 * 1000);

const router = Router();

// POST /api/v1/feedback (Public submission endpoint)
router.post('/', optionalAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = feedbackSubmissionSchema.parse(req.body);

    // Rate limiting & spam detection via client IP hash
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').substring(0, 16);
    const messageHash = crypto.createHash('md5').update(validated.message.trim().toLowerCase()).digest('hex');

    const now = Date.now();
    const tenMinutesAgo = now - 10 * 60 * 1000;
    const records = recentSubmissions.get(ipHash) || [];
    const recentFromIp = records.filter(r => r.timestamp > tenMinutesAgo);

    // Max 10 submissions per 10 minutes per IP
    if (recentFromIp.length >= 10) {
      throw new AppError('You have submitted several thoughts recently. Please take a breather and try again in a few minutes.', 429, 'RATE_LIMITED');
    }

    // Duplicate message spam check within 60 seconds
    const duplicate = recentFromIp.find(r => r.messageHash === messageHash && (now - r.timestamp) < 60 * 1000);
    if (duplicate) {
      throw new AppError('This exact message was already received a moment ago. Thank you for your enthusiasm!', 400, 'DUPLICATE_SUBMISSION');
    }

    // Record submission
    recentFromIp.push({ timestamp: now, messageHash });
    recentSubmissions.set(ipHash, recentFromIp);

    // Sanitize message: strip HTML tags
    const sanitizedMessage = validated.message
      .replace(/<[^>]*>?/gm, '')
      .trim();

    const sanitizedName = validated.name ? validated.name.replace(/<[^>]*>?/gm, '').trim() : '';

    const newFeedback = await FeedbackModel.create({
      userId: req.user ? req.user._id : undefined,
      name: sanitizedName || (req.user ? req.user.displayName : undefined),
      email: validated.email || (req.user ? req.user.email : undefined),
      category: validated.category,
      message: sanitizedMessage,
      status: 'NEW',
      ipHash,
    });

    logger.info(`New community feedback received [${validated.category}]: ${newFeedback._id}`);

    res.status(201).json({
      success: true,
      message: 'Thank you for being part of Timbaktu! 🌱 Your thoughts have been received. Every suggestion helps us think about how to make this community better.',
      data: {
        id: newFeedback._id.toString(),
        createdAt: newFeedback.createdAt.toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/feedback (Admin / Creator dashboard list)
router.get('/', requireAdmin, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const statusFilter = req.query.status as FeedbackStatus | undefined;
    const categoryFilter = req.query.category as FeedbackCategory | undefined;

    const filter: Record<string, unknown> = {};
    if (statusFilter && ['NEW', 'REVIEWED', 'PLANNED', 'RESOLVED'].includes(statusFilter)) {
      filter.status = statusFilter;
    }
    if (categoryFilter) {
      filter.category = categoryFilter;
    }

    const [items, total, newCount, reviewedCount, plannedCount, resolvedCount, allTotal] = await Promise.all([
      FeedbackModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'username displayName avatarUrl'),
      FeedbackModel.countDocuments(filter),
      FeedbackModel.countDocuments({ status: 'NEW' }),
      FeedbackModel.countDocuments({ status: 'REVIEWED' }),
      FeedbackModel.countDocuments({ status: 'PLANNED' }),
      FeedbackModel.countDocuments({ status: 'RESOLVED' }),
      FeedbackModel.countDocuments({}),
    ]);

    const serializedItems = items.map(f => f.toFeedbackJSON());

    res.status(200).json({
      success: true,
      data: {
        items: serializedItems,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
        counts: {
          NEW: newCount,
          REVIEWED: reviewedCount,
          PLANNED: plannedCount,
          RESOLVED: resolvedCount,
          total: allTotal,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/feedback/:id/status (Update feedback status)
router.patch('/:id/status', requireAdmin, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const validatedStatus = feedbackStatusEnum.parse(status);

    const feedback = await FeedbackModel.findById(req.params.id);
    if (!feedback) {
      throw new AppError('Feedback item not found.', 404, 'FEEDBACK_NOT_FOUND');
    }

    feedback.status = validatedStatus;
    await feedback.save();

    res.status(200).json({
      success: true,
      message: `Feedback status marked as ${validatedStatus}.`,
      data: feedback.toFeedbackJSON(),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/feedback/:id (Delete inappropriate submission)
router.delete('/:id', requireAdmin, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const feedback = await FeedbackModel.findById(req.params.id);
    if (!feedback) {
      throw new AppError('Feedback item not found.', 404, 'FEEDBACK_NOT_FOUND');
    }

    await FeedbackModel.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export const feedbackRouter = router;
