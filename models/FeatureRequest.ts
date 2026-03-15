import mongoose, { Document, Model } from 'mongoose';

export interface IFeatureRequest extends Document {
  email: string;
  idea: string;
  description: string;
  status: 'open' | 'planned' | 'completed' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const FeatureRequestSchema = new mongoose.Schema<IFeatureRequest>(
  {
    email: { type: String, required: true },
    idea: { type: String, required: true },
    description: { type: String, required: true },
    status: { type: String, enum: ['open', 'planned', 'completed', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

const FeatureRequest: Model<IFeatureRequest> =
  mongoose.models.FeatureRequest ||
  mongoose.model<IFeatureRequest>('FeatureRequest', FeatureRequestSchema);

export default FeatureRequest;
