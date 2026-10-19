import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import slugify from 'slugify';
import sanitizeHtml from 'sanitize-html';
import { Post as IPost, PostStatus, PostVisibility, MediaMetadata, calculateReadingTimeMinutes } from '@timbaktu/shared';

export interface IPostDocument extends Document {
  authorId: Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  contentJson?: Record<string, unknown>;
  coverImage?: MediaMetadata;
  audio?: MediaMetadata;
  tags: string[];
  readingTimeMinutes: number;
  status: PostStatus;
  visibility: PostVisibility;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  toPostJSON(authorInfo?: { id: string; username: string; displayName: string; avatarUrl?: string }): IPost;
}

const MediaMetadataSchema = new Schema(
  {
    id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    provider: { type: String, enum: ['local', 'cloudinary', 's3'], default: 'local' },
    publicId: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, default: 'application/octet-stream' },
    fileSizeBytes: { type: Number, default: 0 },
    durationSeconds: { type: Number, default: 0 },
    mediaType: { type: String, default: 'audio' },
    createdAt: { type: String, default: () => new Date().toISOString() },
  },
  { _id: false }
);

const PostSchema = new Schema<IPostDocument>(
  {
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: 300,
      default: '',
    },
    contentHtml: {
      type: String,
      required: true,
    },
    contentJson: {
      type: Schema.Types.Mixed,
    },
    coverImage: {
      type: MediaMetadataSchema,
    },
    audio: {
      type: MediaMetadataSchema,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    readingTimeMinutes: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'published'],
      default: 'draft',
      index: true,
    },
    visibility: {
      type: String,
      enum: ['public', 'unlisted', 'private'],
      default: 'public',
      index: true,
    },
    publishedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for feed discovery and author dashboard
PostSchema.index({ status: 1, visibility: 1, publishedAt: -1 });
PostSchema.index({ authorId: 1, status: 1, updatedAt: -1 });
PostSchema.index({ title: 'text', excerpt: 'text', tags: 'text' });

export function sanitizeArticleHtml(rawHtml: string): string {
  return sanitizeHtml(rawHtml, {
    allowedTags: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote',
      'ul', 'ol', 'li', 'b', 'i', 'strong', 'em', 'strike',
      'code', 'hr', 'br', 'a', 'span'
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel', 'title'],
      span: ['class'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

export async function generateUniqueSlug(title: string, currentPostId?: string): Promise<string> {
  const baseSlug = slugify(title, { lower: true, strict: true, trim: true }) || 'untitled-story';
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await mongoose.model<IPostDocument>('Post').findOne({ slug });
    if (!existing || (currentPostId && existing._id.toString() === currentPostId)) {
      return slug;
    }
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
}

PostSchema.methods.toPostJSON = function (
  authorInfo?: { id: string; username: string; displayName: string; avatarUrl?: string }
): IPost {
  const author = authorInfo || (this.authorId && (this.authorId as unknown as { username?: string }).username ? {
    id: (this.authorId as unknown as { _id: Types.ObjectId })._id.toString(),
    username: (this.authorId as unknown as { username: string }).username,
    displayName: (this.authorId as unknown as { displayName: string }).displayName,
    avatarUrl: (this.authorId as unknown as { avatarUrl?: string }).avatarUrl,
  } : {
    id: this.authorId.toString(),
    username: 'storyteller',
    displayName: 'Storyteller',
  });

  return {
    id: this._id.toString(),
    authorId: this.authorId.toString(),
    author,
    title: this.title,
    slug: this.slug,
    excerpt: this.excerpt || '',
    contentHtml: this.contentHtml,
    contentJson: this.contentJson,
    coverImage: this.coverImage,
    audio: this.audio,
    tags: this.tags || [],
    readingTimeMinutes: this.readingTimeMinutes || calculateReadingTimeMinutes(this.contentHtml),
    status: this.status,
    visibility: this.visibility,
    publishedAt: this.publishedAt ? this.publishedAt.toISOString() : undefined,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

export const PostModel: Model<IPostDocument> =
  mongoose.models.Post || mongoose.model<IPostDocument>('Post', PostSchema);
