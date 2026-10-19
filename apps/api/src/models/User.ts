import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { User as IUser, UserPreferences, PublicUserProfile } from '@timbaktu/shared';

export interface IUserDocument extends Document {
  username: string;
  email: string;
  passwordHash: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  preferences: UserPreferences;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
  toAuthJSON(): IUser;
  toPublicProfile(stats?: { postCount: number; totalAudioDuration: number }): PublicUserProfile;
}

const UserSchema = new Schema<IUserDocument>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 250,
      default: '',
    },
    avatarUrl: {
      type: String,
      default: '',
    },
    preferences: {
      soundEnabled: { type: Boolean, default: true },
      introEnabled: { type: Boolean, default: true },
      reducedMotion: { type: Boolean, default: false },
      theme: { type: String, enum: ['parchment', 'dark-bark'], default: 'parchment' },
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
  },
  {
    timestamps: true,
  }
);

// Password comparison method
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

// Serializes user for client response without sensitive fields
UserSchema.methods.toAuthJSON = function (): IUser {
  return {
    id: this._id.toString(),
    username: this.username,
    email: this.email,
    displayName: this.displayName,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    preferences: this.preferences,
    role: this.role || 'user',
    createdAt: this.createdAt.toISOString(),
    updatedAt: this.updatedAt.toISOString(),
  };
};

UserSchema.methods.toPublicProfile = function (
  stats: { postCount: number; totalAudioDuration: number } = { postCount: 0, totalAudioDuration: 0 }
): PublicUserProfile {
  return {
    id: this._id.toString(),
    username: this.username,
    displayName: this.displayName,
    bio: this.bio,
    avatarUrl: this.avatarUrl,
    createdAt: this.createdAt.toISOString(),
    postCount: stats.postCount,
    totalAudioDuration: stats.totalAudioDuration,
  };
};

export const UserModel: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', UserSchema);
