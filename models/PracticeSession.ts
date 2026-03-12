// models/PracticeSession.ts
// Stores practice chat sessions with AI characters.

import mongoose, { Document, Model } from 'mongoose';

// A single message in the chat
interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface IPracticeSession extends Document {
  userId?: string;
  characterType: 'shy_girl' | 'sarcastic_girl' | 'interested_girl' | 'bored_girl';
  messages: IMessage[];
  sessionScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const PracticeSessionSchema = new mongoose.Schema<IPracticeSession>(
  {
    userId: {
      type: String,
      index: true,
    },
    characterType: {
      type: String,
      enum: ['shy_girl', 'sarcastic_girl', 'interested_girl', 'bored_girl'],
      required: true,
    },
    messages: [MessageSchema],
    sessionScore: {
      type: Number,
      min: 0,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

const PracticeSession: Model<IPracticeSession> =
  mongoose.models.PracticeSession ||
  mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);

export default PracticeSession;