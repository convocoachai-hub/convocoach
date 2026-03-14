import mongoose, { Document, Model } from 'mongoose';

export interface IIpLog extends Document {
  ip: string;
  uses: number;
  lastUsed: Date;
}

const IpLogSchema = new mongoose.Schema<IIpLog>({
  ip: { type: String, required: true, unique: true },
  uses: { type: Number, default: 1 },
  lastUsed: { type: Date, default: Date.now },
});

const IpLog: Model<IIpLog> = mongoose.models.IpLog || mongoose.model<IIpLog>('IpLog', IpLogSchema);
export default IpLog;