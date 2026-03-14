// models/User.ts
import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;

  // Free tier tracking
  freeTriesUsed: number;

  // Subscription
  subscriptionStatus: 'free' | 'paid' | 'lifetime';
  subscriptionExpiry?: Date;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;

  // Skill system (harder to level up)
  skillPoints: number;
  analysisCount: number;
  practiceMessageCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:   { type: String, required: true },
    image:  { type: String },

    freeTriesUsed:    { type: Number, default: 0 },

    subscriptionStatus: { type: String, default: 'free', enum: ['free', 'paid', 'lifetime'] },
    subscriptionExpiry: { type: Date },
    razorpayPaymentId:  { type: String },
    razorpayOrderId:    { type: String },

    // Skill points - max 30/analysis, max 5/practice message
    // Level thresholds: Dry Texter 0 | Average 200 | Smooth 600 | Elite 1500
    skillPoints:          { type: Number, default: 0 },
    analysisCount:        { type: Number, default: 0 },
    practiceMessageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;