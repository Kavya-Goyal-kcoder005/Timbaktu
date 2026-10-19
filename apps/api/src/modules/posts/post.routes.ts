import { Router, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { postInputSchema, calculateReadingTimeMinutes } from '@timbaktu/shared';
import { PostModel, generateUniqueSlug, sanitizeArticleHtml } from '../../models/Post';
import { requireAuth, optionalAuth } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { mediaService } from '../../services/mediaService';

const router = Router();

// GET /api/v1/posts (List & Search Posts)
router.get('/', optionalAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string || '10', 10)));
    const skip = (page - 1) * limit;

    const tag = req.query.tag as string;
    const authorUsername = req.query.author as string;
    const searchQuery = req.query.q as string;
    const authorOnly = req.query.mine === 'true';

    // Base query conditions
    const filter: Record<string, unknown> = {};

    if (authorOnly) {
      if (!req.user) {
        throw new AppError('Authentication required to view your posts.', 401, 'UNAUTHORIZED');
      }
      filter.authorId = req.user._id;
      if (req.query.status) {
        filter.status = req.query.status;
      }
    } else {
      // Public feed: only published and public posts
      filter.status = 'published';
      filter.visibility = 'public';

      if (authorUsername) {
        const UserModel = (await import('../../models/User')).UserModel;
        const authorUser = await UserModel.findOne({ username: authorUsername.toLowerCase() });
        if (authorUser) {
          filter.authorId = authorUser._id;
        } else {
          // Author doesn't exist, return empty list
          res.status(200).json({
            success: true,
            data: { items: [], total: 0, page, limit, totalPages: 0, hasMore: false },
          });
          return;
        }
      }
    }

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    if (searchQuery && searchQuery.trim() !== '') {
      filter.$text = { $search: searchQuery.trim() };
    }

    const [posts, total] = await Promise.all([
      PostModel.find(filter)
        .sort(authorOnly ? { updatedAt: -1 } : { publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('authorId', 'username displayName avatarUrl'),
      PostModel.countDocuments(filter),
    ]);

    const items = posts.map(p => p.toPostJSON());

    res.status(200).json({
      success: true,
      data: {
        items,
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

// POST /api/v1/posts (Create Post)
router.post('/', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const validated = postInputSchema.parse(req.body);
    const slug = await generateUniqueSlug(validated.title);
    const sanitizedHtml = sanitizeArticleHtml(validated.contentHtml);
    const readingTimeMinutes = calculateReadingTimeMinutes(sanitizedHtml);

    const isPublishing = validated.status === 'published';

    const newPost = await PostModel.create({
      authorId: req.user._id,
      title: validated.title,
      slug,
      excerpt: validated.excerpt || '',
      contentHtml: sanitizedHtml,
      contentJson: validated.contentJson,
      coverImage: validated.coverImage || undefined,
      audio: validated.audio || undefined,
      tags: validated.tags,
      readingTimeMinutes,
      status: validated.status,
      visibility: validated.visibility,
      publishedAt: isPublishing ? new Date() : undefined,
    });

    res.status(201).json({
      success: true,
      data: newPost.toPostJSON({
        id: req.user._id.toString(),
        username: req.user.username,
        displayName: req.user.displayName,
        avatarUrl: req.user.avatarUrl,
      }),
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/posts/:slug (Get single post by slug)
router.get('/:slug', optionalAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const post = await PostModel.findOne({ slug: req.params.slug })
      .populate('authorId', 'username displayName avatarUrl');

    if (!post) {
      throw new AppError('Post not found.', 404, 'POST_NOT_FOUND');
    }

    const authorDoc = post.authorId as unknown as { _id: mongoose.Types.ObjectId; username: string };
    const isAuthor = req.user && authorDoc && authorDoc._id.toString() === req.user._id.toString();

    // Enforce private / draft visibility permissions
    if (post.status === 'draft' && !isAuthor) {
      throw new AppError('Post is currently an unpublished draft.', 404, 'POST_NOT_FOUND');
    }

    if (post.visibility === 'private' && !isAuthor) {
      throw new AppError('Post is private to the author.', 403, 'POST_PRIVATE');
    }

    res.status(200).json({
      success: true,
      data: post.toPostJSON(),
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/posts/:id (Update post with strict server-side ownership)
router.patch('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      throw new AppError('Post not found.', 404, 'POST_NOT_FOUND');
    }

    // SERVER-SIDE OWNERSHIP ENFORCEMENT
    if (!post.authorId.equals(req.user._id)) {
      throw new AppError('Forbidden: You can only edit your own posts.', 403, 'FORBIDDEN');
    }

    const validated = postInputSchema.partial().parse(req.body);

    if (validated.title && validated.title !== post.title) {
      post.title = validated.title;
      post.slug = await generateUniqueSlug(validated.title, post._id.toString());
    }

    if (validated.excerpt !== undefined) {
      post.excerpt = validated.excerpt;
    }

    if (validated.contentHtml !== undefined) {
      post.contentHtml = sanitizeArticleHtml(validated.contentHtml);
      post.readingTimeMinutes = calculateReadingTimeMinutes(post.contentHtml);
    }

    if (validated.contentJson !== undefined) {
      post.contentJson = validated.contentJson;
    }

    if (validated.coverImage !== undefined) {
      post.coverImage = validated.coverImage || undefined;
    }

    if (validated.audio !== undefined) {
      post.audio = validated.audio || undefined;
    }

    if (validated.tags !== undefined) {
      post.tags = validated.tags;
    }

    if (validated.visibility !== undefined) {
      post.visibility = validated.visibility;
    }

    if (validated.status !== undefined) {
      if (validated.status === 'published' && post.status !== 'published') {
        post.publishedAt = new Date();
      }
      post.status = validated.status;
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: post.toPostJSON({
        id: req.user._id.toString(),
        username: req.user.username,
        displayName: req.user.displayName,
        avatarUrl: req.user.avatarUrl,
      }),
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/posts/:id (Delete post with strict ownership)
router.delete('/:id', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      throw new AppError('Post not found.', 404, 'POST_NOT_FOUND');
    }

    // SERVER-SIDE OWNERSHIP ENFORCEMENT
    if (!post.authorId.equals(req.user._id)) {
      throw new AppError('Forbidden: You can only delete your own posts.', 403, 'FORBIDDEN');
    }

    // Clean up audio asset if local
    if (post.audio?.publicId) {
      try {
        await mediaService.getProvider().deleteFile(post.audio.publicId);
      } catch (err) {
        console.warn('Failed to delete associated audio file:', err);
      }
    }

    await PostModel.findByIdAndDelete(post._id);

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/posts/:id/publish
router.post('/:id/publish', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      throw new AppError('Post not found.', 404, 'POST_NOT_FOUND');
    }

    if (!post.authorId.equals(req.user._id)) {
      throw new AppError('Forbidden: You can only publish your own posts.', 403, 'FORBIDDEN');
    }

    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post published successfully.',
      data: post.toPostJSON(),
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/posts/:id/unpublish
router.post('/:id/unpublish', requireAuth, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError('Authentication required.', 401, 'UNAUTHORIZED');
    }

    const post = await PostModel.findById(req.params.id);
    if (!post) {
      throw new AppError('Post not found.', 404, 'POST_NOT_FOUND');
    }

    if (!post.authorId.equals(req.user._id)) {
      throw new AppError('Forbidden: You can only unpublish your own posts.', 403, 'FORBIDDEN');
    }

    post.status = 'draft';
    await post.save();

    res.status(200).json({
      success: true,
      message: 'Post reverted to draft.',
      data: post.toPostJSON(),
    });
  } catch (error) {
    next(error);
  }
});

export const postRouter = router;
