import mongoose, { Document, Model } from 'mongoose';

interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: {
    score: number;
    flags: string[];
    interestChange?: number;
  };
}

export interface IPracticeSession extends Document {
  userId?: string;
  scenarioType?: string;
  characterId: string; // The main identifier
  characterGender?: string;
  difficulty: string;
  messages: IMessage[];
  messageCount: number;
  currentInterest: number;
  peakInterest: number;
  avgScore: number;
  totalScore: number;
  scoredMessageCount: number;
  isCompleted: boolean;
  endReason?: string;
  finalGrade?: string;
  lastActivity: Date;
  linkedAnalysisId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema<IMessage>({
  role: { type: String, enum: ['user', 'assistant'], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  analysis: {
    score: Number,
    flags: [String],
    interestChange: Number,
  },
});

const PracticeSessionSchema = new mongoose.Schema<IPracticeSession>(
  {
    userId: { type: String, index: true },
    scenarioType: { type: String, default: 'dating' },
    characterId: { type: String, required: true }, // We will use characterId
    characterGender: { type: String, default: 'neutral' },
    difficulty: { type: String, default: 'easy' },
    messages: [MessageSchema],
    messageCount: { type: Number, default: 0 },
    currentInterest: { type: Number, default: 35, min: 0, max: 100 },
    peakInterest: { type: Number, default: 35 },
    avgScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    scoredMessageCount: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    endReason: { type: String },
    finalGrade: { type: String },
    lastActivity: { type: Date, default: Date.now },
    linkedAnalysisId: { type: String },
  },
  { timestamps: true }
);

PracticeSessionSchema.index({ userId: 1, createdAt: -1 });

// This is where Mongoose caches the schema!
const PracticeSession: Model<IPracticeSession> =
  mongoose.models.PracticeSession ||
  mongoose.model<IPracticeSession>('PracticeSession', PracticeSessionSchema);

export default PracticeSession;