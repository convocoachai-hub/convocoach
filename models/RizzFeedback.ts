// models/RizzFeedback.ts
import mongoose, { Document, Model } from 'mongoose';

export interface IRizzFeedback extends Document {
  targetUserId: string;
  targetUsername: string;
  flirtingScore: number;
  humorScore: number;
  confidenceScore: number;
  dryTextScore: number;
  overallScore: number;
  message?: string;
  ipHash: string;
  createdAt: Date;
}

const RizzFeedbackSchema = new mongoose.Schema<IRizzFeedback>(
  {
    targetUserId:  { type: String, required: true, index: true },
    targetUsername:{ type: String, required: true, lowercase: true },
    flirtingScore: { type: Number, required: true, min: 1, max: 10 },
    humorScore:    { type: Number, required: true, min: 1, max: 10 },
    confidenceScore:{ type: Number, required: true, min: 1, max: 10 },
    dryTextScore:  { type: Number, required: true, min: 1, max: 10 },
    overallScore:  { type: Number, required: true, min: 1, max: 10 },
    message:       { type: String, maxlength: 400 },
    ipHash:        { type: String, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'rizz_feedback',
  }
);

// Compound indexes for efficient querying
RizzFeedbackSchema.index({ targetUserId: 1, createdAt: -1 });
// One submission per IP per target per hour — enforced in code, not DB
RizzFeedbackSchema.index({ ipHash: 1, targetUserId: 1, createdAt: 1 });

const RizzFeedback: Model<IRizzFeedback> =
  mongoose.models.RizzFeedback ||
  mongoose.model<IRizzFeedback>('RizzFeedback', RizzFeedbackSchema);

export default RizzFeedback;
