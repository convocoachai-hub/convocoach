import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdReward extends Document {
  userId?: string;
  ipAddress: string;
  unlocksToday: number;
  lastReset: Date;
}

const AdRewardSchema = new Schema<IAdReward>({
  userId:       { type: String, default: null, index: true },
  ipAddress:    { type: String, required: true, index: true },
  unlocksToday: { type: Number, default: 0 },
  lastReset:    { type: Date,   default: Date.now },
});

// Compound index for fast lookups
AdRewardSchema.index({ userId: 1, ipAddress: 1 });

const AdReward: Model<IAdReward> =
  mongoose.models.AdReward || mongoose.model<IAdReward>('AdReward', AdRewardSchema);

export default AdReward;
