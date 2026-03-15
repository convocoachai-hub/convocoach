import mongoose, { Document, Model } from 'mongoose';

export interface IContactMessage extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'resolved' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const ContactMessageSchema = new mongoose.Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'resolved', 'closed'], default: 'new' },
  },
  { timestamps: true }
);

const ContactMessage: Model<IContactMessage> =
  mongoose.models.ContactMessage ||
  mongoose.model<IContactMessage>('ContactMessage', ContactMessageSchema);

export default ContactMessage;
