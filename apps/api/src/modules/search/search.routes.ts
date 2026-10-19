import { Router, Request, Response, NextFunction } from 'express';
import { PostModel } from '../../models/Post';

const router = Router();

// GET /api/v1/search
router.get('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const q = (req.query.q as string || '').trim();
    const tag = (req.query.tag as string || '').trim().toLowerCase();
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(30, Math.max(1, parseInt(req.query.limit as string || '10', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      status: 'published',
      visibility: 'public',
    };

    if (tag) {
      filter.tags = tag;
    }

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    const [posts, total] = await Promise.all([
      PostModel.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'username displayName avatarUrl'),
      PostModel.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        items: posts.map(p => p.toPostJSON()),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    next(error);
  }
});

export const searchRouter = router;
