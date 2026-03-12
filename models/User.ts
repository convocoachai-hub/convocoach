// models/User.ts — REPLACE your existing file with this

import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;
  password?: string;

  // Free tier tracking
  freeTriesUsed: number;          // Counts toward the 4 free total (1 anon + 3 logged in)
  anonymousTriesUsed: number;     // Tracked via cookie before login

  // Subscription
  subscriptionStatus: 'free' | 'paid' | 'lifetime';
  subscriptionExpiry?: Date;
  razorpayPaymentId?: string;

  // Skill system
  skillPoints: number;
  skillLevel: string;
  analysisCount: number;
  totalScore: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    name: { type: String, required: true },
    image: { type: String },
    password: { type: String },

    freeTriesUsed: { type: Number, default: 0 },
    anonymousTriesUsed: { type: Number, default: 0 },

    subscriptionStatus: {
      type: String,
      default: 'free',
      enum: ['free', 'paid', 'lifetime'],
    },
    subscriptionExpiry: { type: Date },
    razorpayPaymentId: { type: String },

    skillPoints: { type: Number, default: 0 },
    skillLevel: {
      type: String,
      default: 'Dry Texter',
      enum: ['Dry Texter', 'Average Talker', 'Smooth Conversationalist', 'Elite Charmer'],
    },
    analysisCount: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;