// models/User.ts
import mongoose, { Document, Model } from 'mongoose';

export interface IUser extends Document {
  email: string;
  name: string;
  image?: string;

  // Username for Rizz Links
  username?: string;
  usernameSetAt?: Date;

  // Rizz Link Page Configuration
  rizzPageConfig?: {
    avatar: string;
    theme: 'minimal' | 'vintage' | 'gothic';
    enabledTraits: string[];
    allowMessage: boolean;
    customQuestion?: string;
    showFinalCTA: boolean;
  };

  // Free tier tracking
  freeTriesUsed: number;

  // Subscription
  subscriptionStatus: 'free' | 'paid' | 'lifetime';
  subscriptionExpiry?: Date;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  planType?: string;

  // Skill system
  skillPoints: number;
  analysisCount: number;
  practiceMessageCount: number;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const RizzPageConfigSchema = new mongoose.Schema({
  avatar:        { type: String, default: 'cat' },
  theme:         { type: String, default: 'minimal', enum: ['minimal', 'vintage', 'gothic'] },
  enabledTraits: { type: [String], default: ['flirting', 'humor', 'confidence', 'dryText', 'overall'] },
  allowMessage:  { type: Boolean, default: true },
  customQuestion:{ type: String, maxlength: 200 },
  showFinalCTA:  { type: Boolean, default: true },
}, { _id: false });

const UserSchema = new mongoose.Schema<IUser>(
  {
    email:  { type: String, required: true, unique: true, lowercase: true, trim: true },
    name:   { type: String, required: true },
    image:  { type: String },

    username:      { type: String, unique: true, sparse: true, trim: true, lowercase: true },
    usernameSetAt: { type: Date },

    freeTriesUsed:    { type: Number, default: 0 },

    subscriptionStatus: { type: String, default: 'free', enum: ['free', 'paid', 'lifetime'] },
    subscriptionExpiry: { type: Date },
    razorpayPaymentId:  { type: String },
    razorpayOrderId:    { type: String },
    planType:           { type: String },

    rizzPageConfig: { type: RizzPageConfigSchema, default: () => ({}) },

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