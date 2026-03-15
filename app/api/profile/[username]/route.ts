// app/api/profile/[username]/route.ts — Public profile data for Rizz Links
import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import ChatAnalysis from '@/models/ChatAnalysis';
import PracticeSession from '@/models/PracticeSession';

export async function GET(
  _req: NextRequest,
  { params }: { params: { username: string } }
) {
  try {
    const username = params.username?.toLowerCase().trim();
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    await connectToDatabase();

    const user = await User.findOne({ username }).lean() as any;
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userId = String(user._id);

    // Fetch stats
    const [analyses, sessions] = await Promise.all([
      ChatAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(20).lean() as Promise<any[]>,
      PracticeSession.find({ userId }).sort({ createdAt: -1 }).limit(20).lean() as Promise<any[]>,
    ]);

    // Compute public stats
    const scores = analyses.map((a: any) => a.conversationScore || 0).filter(Boolean);
    const avgScore = scores.length ? +(scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1) : null;
    const bestScore = scores.length ? Math.max(...scores) : null;

    // Skill level
    const pts = user.skillPoints || 0;
    let level = 'Dry Texter';
    let emoji = '🏜️';
    if (pts >= 300) { level = 'Elite Charmer'; emoji = '👑'; }
    else if (pts >= 150) { level = 'Smooth Conversationalist'; emoji = '🎯'; }
    else if (pts >= 50) { level = 'Average Talker'; emoji = '💬'; }

    // Score distribution
    const distribution = { high: 0, mid: 0, low: 0 };
    scores.forEach((s: number) => {
      if (s >= 7) distribution.high++;
      else if (s >= 4) distribution.mid++;
      else distribution.low++;
    });

    // Recent score trend
    const recentScores = scores.slice(0, 5);

    return NextResponse.json({
      username: user.username,
      rizzPageConfig: user.rizzPageConfig ?? {
        avatar: 'cat', theme: 'minimal',
        enabledTraits: ['flirting', 'humor', 'confidence', 'dryText', 'overall'],
        allowMessage: true, customQuestion: '', showFinalCTA: true,
      },
    });
  } catch (error) {
    console.error('Profile API error:', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}
