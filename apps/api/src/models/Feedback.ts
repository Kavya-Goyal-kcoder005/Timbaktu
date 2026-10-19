import mongoose, { Document, Schema, Model } from 'mongoose';
import { FeedbackCategory, FeedbackStatus, FeedbackItem } from '@timbaktu/shared';

export interface IFeedbackDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  name?: string;
  email?: string;
  category: FeedbackCategory;
  message: string;
  status: FeedbackStatus;
  ipHash?: string;
  createdAt: Date;
  updatedAt: Date;
  toFeedbackJSON(): FeedbackItem;
}

const FeedbackSchema = new Schema<IFeedbackDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    name: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 150,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'feature_idea',
        'improvement',
        'bug_issue',
        'user_experience',
        'something_i_love',
        'other',
      ],
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 2000,
    },
    status: {
      type: String,
      required: true,
      enum: ['NEW', 'REVIEWED', 'PLANNED', 'RESOLVED'],
      default: 'NEW',
      index: true,
    },
    ipHash: {
      type: String,
      default: '',
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

FeedbackSchema.methods.toFeedbackJSON = function (): FeedbackItem {
  const userDoc = this.userId as unknown as { _id: mongoose.Types.ObjectId; username: string; displayName: string; avatarUrl?: string } | undefined;
  
  return {
    id: this._id.toString(),
    userId: this.userId ? this.userId.toString() : undefined,
    user: userDoc && userDoc.username ? {
      id: userDoc._id ? userDoc._id.toString() : this.userId.toString(),
      username: userDoc.username,
      displayName: userDoc.displayName,
      avatarUrl: userDoc.avatarUrl,
    } : undefined,
    name: this.name || undefined,
    email: this.email || undefined,
    category: this.category as FeedbackCategory,
    message: this.message,
    status: this.status as FeedbackStatus,
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

export const FeedbackModel: Model<IFeedbackDocument> =
  mongoose.models.Feedback || mongoose.model<IFeedbackDocument>('Feedback', FeedbackSchema);
