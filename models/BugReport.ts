import mongoose, { Document, Model } from 'mongoose';

export interface IBugReport extends Document {
  email: string;
  page: string;
  description: string;
  screenshotUrl?: string;
  status: 'open' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const BugReportSchema = new mongoose.Schema<IBugReport>(
  {
    email: { type: String, required: true },
    page: { type: String, required: true },
    description: { type: String, required: true },
    screenshotUrl: { type: String },
    status: { type: String, enum: ['open', 'resolved', 'closed'], default: 'open' },
  },
  { timestamps: true }
);

const BugReport: Model<IBugReport> =
  mongoose.models.BugReport ||
  mongoose.model<IBugReport>('BugReport', BugReportSchema);

export default BugReport;
