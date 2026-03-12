// models/ChatAnalysis.ts — REPLACE your existing file

import mongoose, { Document, Model } from 'mongoose';

export interface IMissedOpportunity {
  moment: string;
  suggestion: string;
}

export interface IChatAnalysis extends Document {
  userId?: string;
  sessionId?: string;         // For anonymous tracking

  // Core scores
  conversationScore: number;
  interestLevel: number;

  // New deep scores
  humorScore: number;
  confidenceScore: number;
  engagementScore: number;
  curiosityScore: number;
  emotionalTone: 'positive' | 'neutral' | 'negative' | 'mixed';
  conversationMomentum: 'escalating' | 'neutral' | 'dying';
  replyEnergyMatch: 'matched' | 'low' | 'high';
  attractionProbability: number;   // 0-100

  // Analysis arrays
  strengths: string[];
  mistakes: string[];
  suggestions: string[];
  possibleNextMoves: string[];
  missedOpportunities: IMissedOpportunity[];
  attractionSignals: string[];

  // Roast
  roastMode: boolean;
  roastText?: string;

  // Raw data
  extractedText: string;
  createdAt: Date;
}

const MissedOpportunitySchema = new mongoose.Schema({
  moment: String,
  suggestion: String,
});

const ChatAnalysisSchema = new mongoose.Schema<IChatAnalysis>(
  {
    userId: { type: String, index: true },
    sessionId: { type: String, index: true },

    conversationScore: { type: Number, required: true, min: 0, max: 10 },
    interestLevel: { type: Number, required: true, min: 0, max: 100 },
    humorScore: { type: Number, default: 0, min: 0, max: 10 },
    confidenceScore: { type: Number, default: 0, min: 0, max: 10 },
    engagementScore: { type: Number, default: 0, min: 0, max: 10 },
    curiosityScore: { type: Number, default: 0, min: 0, max: 10 },
    emotionalTone: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed'],
      default: 'neutral',
    },
    conversationMomentum: {
      type: String,
      enum: ['escalating', 'neutral', 'dying'],
      default: 'neutral',
    },
    replyEnergyMatch: {
      type: String,
      enum: ['matched', 'low', 'high'],
      default: 'matched',
    },
    attractionProbability: { type: Number, default: 0, min: 0, max: 100 },

    strengths: [String],
    mistakes: [String],
    suggestions: [String],
    possibleNextMoves: [String],
    missedOpportunities: [MissedOpportunitySchema],
    attractionSignals: [String],

    roastMode: { type: Boolean, default: false },
    roastText: String,
    extractedText: { type: String, required: true },
  },
  { timestamps: true }
);

const ChatAnalysis: Model<IChatAnalysis> =
  mongoose.models.ChatAnalysis ||
  mongoose.model<IChatAnalysis>('ChatAnalysis', ChatAnalysisSchema);

export default ChatAnalysis;