import { Router, Request, Response, NextFunction } from 'express';
import { profileUpdateSchema } from '@timbaktu/shared';
import { UserModel } from '../../models/User';
import { requireAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';

const router = Router();

// GET /api/v1/users/:username
router.get('/:username', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const rawUsername = Array.isArray(req.params.username) ? req.params.username[0] : req.params.username;
    const username = (rawUsername || '').toLowerCase();
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new AppError('User profile not found.', 404, 'USER_NOT_FOUND');
    }

    // Dynamic stats aggregation from Post collection
    const PostModel = (await import('../../models/Post')).PostModel;
    const posts = await PostModel.find({
      authorId: user._id,
      status: 'published',
      visibility: 'public',
    });

    const totalAudioDuration = posts.reduce((acc, p) => acc + (p.audio?.durationSeconds || 0), 0);

    res.status(200).json({
      success: true,
      data: user.toPublicProfile({
        postCount: posts.length,
        totalAudioDuration,
      }),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/users/me
router.patch('/me', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const validated = profileUpdateSchema.parse(req.body);

    if (validated.displayName !== undefined) {
      req.user.displayName = validated.displayName;
    }
    if (validated.bio !== undefined) {
      req.user.bio = validated.bio;
    }
    if (validated.avatarUrl !== undefined) {
      req.user.avatarUrl = validated.avatarUrl;
    }
    if (validated.preferences) {
      req.user.preferences = {
        ...req.user.preferences,
        ...validated.preferences,
      };
    }

    await req.user.save();

    res.status(200).json({
      success: true,
      data: req.user.toAuthJSON(),
    });
  } catch (error) {
    next(error);
  }
});

export const userRouter = router;
