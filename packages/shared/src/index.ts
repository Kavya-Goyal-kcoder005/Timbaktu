import { z } from 'zod';

// ================= USER & AUTH TYPES =================
export interface UserPreferences {
  soundEnabled: boolean;
  introEnabled: boolean;
  reducedMotion: boolean;
  theme: 'parchment' | 'dark-bark';
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  role?: 'user' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface PublicUserProfile {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: string;
  postCount: number;
  totalAudioDuration: number;
}

// ================= MEDIA METADATA =================
export type MediaProvider = 'local' | 'cloudinary' | 's3';

export interface MediaMetadata {
  id?: string;
  provider: MediaProvider;
  publicId: string;
  url: string;
  mimeType: string;
  fileSizeBytes: number;
  durationSeconds?: number | null;
  mediaType?: string;
  createdAt?: string;
}

// ================= POST TYPES =================
export type PostStatus = 'draft' | 'published';
export type PostVisibility = 'public' | 'unlisted' | 'private';

export interface Post {
  id: string;
  authorId: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
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
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ================= VALIDATION SCHEMAS =================
export const registerSchema = z.object({
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(50, 'Display name is too long'),
  username: z.string().trim()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain alphanumeric characters, underscores, and dashes'),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password')
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  login: z.string().trim().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required')
});

export type LoginInput = z.infer<typeof loginSchema>;

export const postInputSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120, 'Title cannot exceed 120 characters'),
  excerpt: z.string().trim().max(300, 'Excerpt cannot exceed 300 characters').optional(),
  contentHtml: z.string().trim().min(10, 'Article content must be at least 10 characters'),
  contentJson: z.record(z.any()).optional(),
  coverImage: z.object({
    id: z.string().optional(),
    provider: z.enum(['local', 'cloudinary', 's3']),
    publicId: z.string(),
    url: z.string().min(1, 'Cover image URL cannot be empty'),
    mimeType: z.string(),
    fileSizeBytes: z.number(),
    mediaType: z.string().optional().default('image'),
    createdAt: z.string().optional()
  }).optional().nullable(),
  audio: z.object({
    id: z.string().optional(),
    provider: z.enum(['local', 'cloudinary', 's3']),
    publicId: z.string(),
    url: z.string().min(1, 'Audio URL cannot be empty'),
    mimeType: z.string(),
    fileSizeBytes: z.number(),
    durationSeconds: z.number().optional().nullable(),
    mediaType: z.string().optional().default('audio'),
    createdAt: z.string().optional()
  }).optional().nullable(),
  tags: z.array(
    z.string()
      .trim()
      .transform(v => v.toLowerCase().replace(/[^a-z0-9-]/g, ''))
      .refine(v => v.length > 0 && /^[a-z0-9-]+$/.test(v), 'Tags can only contain lowercase letters, numbers, and hyphens')
  ).max(6, 'Maximum 6 tags allowed').default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  visibility: z.enum(['public', 'unlisted', 'private']).default('public')
});

export type PostInput = z.infer<typeof postInputSchema>;

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  bio: z.string().trim().max(250).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  preferences: z.object({
    soundEnabled: z.boolean().optional(),
    introEnabled: z.boolean().optional(),
    reducedMotion: z.boolean().optional(),
    theme: z.enum(['parchment', 'dark-bark']).optional()
  }).optional()
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const reportSchema = z.object({
  reason: z.enum(['spam', 'offensive', 'harassment', 'copyright', 'other']),
  details: z.string().trim().max(500).optional()
});

export type ReportInput = z.infer<typeof reportSchema>;

// ================= FEEDBACK SCHEMAS =================
export const feedbackCategories = [
  { id: 'feature_idea', label: 'Feature Idea' },
  { id: 'improvement', label: 'Improvement Suggestion' },
  { id: 'bug_issue', label: 'Bug or Issue' },
  { id: 'user_experience', label: 'User Experience' },
  { id: 'something_i_love', label: 'Something I Love' },
  { id: 'other', label: 'Other' },
] as const;

export const feedbackCategoryEnum = z.enum([
  'feature_idea',
  'improvement',
  'bug_issue',
  'user_experience',
  'something_i_love',
  'other'
]);
export type FeedbackCategory = z.infer<typeof feedbackCategoryEnum>;

export const feedbackStatusEnum = z.enum([
  'NEW',
  'REVIEWED',
  'PLANNED',
  'RESOLVED'
]);
export type FeedbackStatus = z.infer<typeof feedbackStatusEnum>;

export const feedbackSubmissionSchema = z.object({
  name: z.string().trim().max(100, 'Name cannot exceed 100 characters').optional().or(z.literal('')),
  email: z.string().trim().email('Please enter a valid email address').optional().or(z.literal('')),
  category: feedbackCategoryEnum,
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(2000, 'Message cannot exceed 2000 characters')
});
export type FeedbackSubmissionInput = z.infer<typeof feedbackSubmissionSchema>;

export interface FeedbackItem {
  id: string;
  userId?: string;
  user?: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  name?: string;
  email?: string;
  category: FeedbackCategory;
  message: string;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackSummaryCounts {
  NEW: number;
  REVIEWED: number;
  PLANNED: number;
  RESOLVED: number;
  total: number;
}

// ================= API RESPONSES =================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

// ================= UTILITIES =================
export function calculateReadingTimeMinutes(text: string): number {
  const wordsPerMinute = 200;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
}

export function formatAudioDuration(seconds?: number | null): string {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
