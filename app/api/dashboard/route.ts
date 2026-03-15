// app/api/dashboard/route.ts
export const dynamic = 'force-dynamic'; // 🔥 Kills the Next.js cache
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import ChatAnalysis from '@/models/ChatAnalysis';
import PracticeSession from '@/models/PracticeSession';
import User from '@/models/User';

// ─── CONSTANTS & HELPERS ──────────────────────────────────────────────────────
const POSITIVE_FLAGS = new Set(['good_hook','good_question','witty','specific','good_follow_up','showed_personality','high_effort','deep_question','matched_energy','recovered_well']);
const NEGATIVE_FLAGS = new Set(['too_eager','no_question','generic','needy','boring','low_effort','misread_vibe']);
const FLAG_LABELS: Record<string, string> = {
  good_hook:'Strong openers', good_question:'Good questions', witty:'Witty replies', specific:'Specific details', good_follow_up:'Follow-up quality', showed_personality:'Shows personality', deep_question:'Goes deep', matched_energy:'Matches energy', high_effort:'High effort', recovered_well:'Recovers from misses', too_eager:'Coming on too strong', no_question:'Not asking questions', generic:'Generic messages', needy:'Neediness detected', boring:'Low-energy replies', low_effort:'Low effort', misread_vibe:'Misreading the vibe',
};

function calcStreak(dates: Date[]): number {
  if (!dates.length) return 0;
  
  // 🔥 FIXED: Replaced [...new Set()] with Array.from(new Set())
  const unique = Array.from(new Set(dates.map(d => new Date(d).toDateString())))
    .map(s => new Date(s))
    .sort((a, b) => b.getTime() - a.getTime());
    
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  
  for (const day of unique) {
    const diff = Math.round((cursor.getTime() - day.getTime()) / 86_400_000);
    if (diff > 1) break;
    streak++;
    cursor = day;
  }
  return streak;
}

function scoreTrend(scores: number[]): 'up' | 'down' | 'flat' {
  if (scores.length < 4) return 'flat';
  const recent = scores.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const earlier = scores.slice(-6, -3);
  if (!earlier.length) return 'flat';
  const earlyAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
  if (recent - earlyAvg > 0.4) return 'up';
  if (earlyAvg - recent > 0.4) return 'down';
  return 'flat';
}

function getSkillLevel(points: number) {
  const levels = [
    { name: 'Dry Texter', threshold: 0 },
    { name: 'Average Talker', threshold: 50 },
    { name: 'Smooth Conversationalist', threshold: 150 },
    { name: 'Elite Charmer', threshold: 300 },
  ];
  let current = levels[0];
  let next = levels[1];
  for (let i = 0; i < levels.length; i++) {
    if (points >= levels[i].threshold) {
      current = levels[i];
      next = levels[i + 1] ?? null as any;
    }
  }
  const progressPct = next ? Math.min(100, Math.round(((points - current.threshold) / (next.threshold - current.threshold)) * 100)) : 100;
  return { level: current.name, nextLevel: next?.name ?? null, pointsToNext: next ? next.threshold - points : null, progressPct };
}

function buildSkillProfile(sessions: any[]) {
  const allFlags: string[] = [];
  const allScores: number[] = [];
  const earlyScores: number[] = [];
  const recentScores: number[] = [];

  const sorted = [...sessions].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  sorted.forEach((session, si) => {
    const msgs = (session.messages ?? []).filter((m: any) => m.role === 'user' && m.analysis?.score != null);
    msgs.forEach((m: any) => {
      const score = Number(m.analysis.score);
      allScores.push(score);
      if (si < sorted.length / 2) earlyScores.push(score);
      else recentScores.push(score);
      if (Array.isArray(m.analysis.flags)) allFlags.push(...m.analysis.flags);
    });
  });

  const flagCounts: Record<string, number> = {};
  allFlags.forEach(f => { flagCounts[f] = (flagCounts[f] ?? 0) + 1; });

  const strengths = Object.entries(flagCounts).filter(([f]) => POSITIVE_FLAGS.has(f)).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([flag, count]) => ({ flag, label: FLAG_LABELS[flag] ?? flag, count }));
  const weaknesses = Object.entries(flagCounts).filter(([f]) => NEGATIVE_FLAGS.has(f)).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([flag, count]) => ({ flag, label: FLAG_LABELS[flag] ?? flag, count }));

  const earlyAvg = earlyScores.length ? earlyScores.reduce((a, b) => a + b, 0) / earlyScores.length : null;
  const recentAvg = recentScores.length ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length : null;
  const improvement = earlyAvg != null && recentAvg != null ? Math.round((recentAvg - earlyAvg) * 10) / 10 : null;

  const charCounts: Record<string, number> = {};
  sessions.forEach(s => { if (s.characterType) charCounts[s.characterType] = (charCounts[s.characterType] ?? 0) + 1; });
  const topChar = Object.entries(charCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  const diffCounts = { easy: 0, normal: 0, hard: 0 };
  sessions.forEach(s => { if (s.difficulty in diffCounts) diffCounts[s.difficulty as keyof typeof diffCounts]++; });

  return {
    avgPracticeScore: allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : null,
    improvement, strengths, weaknesses, topCharacter: topChar, totalScoredMessages: allScores.length, difficultyBreakdown: diffCounts, scoreTrendPractice: scoreTrend(allScores), hasEnoughData: allScores.length >= 5,
  };
}

// ─── GET ──────────────────────────────────────────────────────────────────────
export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    await connectToDatabase();
    const dbUser = await User.findOne({ email: session.user.email }).lean() as any;
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userId = String(dbUser._id);
    const isPremium = dbUser.subscriptionStatus === 'paid' || dbUser.subscriptionStatus === 'lifetime';

    // 🔥 Force fetch Practice Sessions regardless of premium status so you can see your test data
    const [allAnalyses, allSessions] = await Promise.all([
      ChatAnalysis.find({ userId }).sort({ createdAt: -1 }).limit(100).select('conversationScore interestLevel attractionProbability conversationMomentum createdAt missedOpportunities').lean(),
      PracticeSession.find({ userId }).sort({ createdAt: -1 }).limit(100).select('characterId difficulty messageCount currentInterest createdAt messages').lean(),
    ]);

    const analysisScores = [...allAnalyses].reverse().map((a: any) => a.conversationScore ?? 0);
    const avgScore = analysisScores.length ? Math.round((analysisScores.reduce((s: number, v: number) => s + v, 0) / analysisScores.length) * 10) / 10 : 0;
    const totalPoints = allAnalyses.reduce((sum: number, a: any) => sum + Math.min(Math.round((a.conversationScore ?? 0) * 10), 100), 0);

    const momentumBreakdown = {
      escalating: allAnalyses.filter((a: any) => a.conversationMomentum === 'escalating').length,
      neutral: allAnalyses.filter((a: any) => a.conversationMomentum === 'neutral').length,
      dying: allAnalyses.filter((a: any) => a.conversationMomentum === 'dying').length,
    };

    return NextResponse.json({
      success: true,
      isPremium, // UI will still show upgrade prompts if false
      username: dbUser.username || null,
      usernameSetAt: dbUser.usernameSetAt || null,
      stats: {
        totalAnalyses: allAnalyses.length,
        practiceCount: allSessions.length, // Unlocked for data checking
        averageScore: avgScore,
        totalPoints,
        skillInfo: getSkillLevel(totalPoints),
        subscriptionStatus: dbUser.subscriptionStatus ?? 'free',
        freeTriesUsed: dbUser.freeTriesUsed ?? 0,
        streak: calcStreak(allAnalyses.map((a: any) => a.createdAt)),
        scoreTrend: scoreTrend(analysisScores),
        bestScore: analysisScores.length ? Math.max(...analysisScores) : null,
        avgInterest: allAnalyses.length ? Math.round(allAnalyses.reduce((s: number, a: any) => s + (a.interestLevel ?? 0), 0) / allAnalyses.length) : 0,
        momentumBreakdown,
      },
      skillProfile: buildSkillProfile(allSessions),
      recentAnalyses: allAnalyses.slice(0, 10).map((a: any) => ({
        _id: a._id, conversationScore: a.conversationScore, interestLevel: a.interestLevel, attractionProbability: a.attractionProbability ?? null, conversationMomentum: a.conversationMomentum, missedOpportunities: Array.isArray(a.missedOpportunities) ? a.missedOpportunities.length : 0, createdAt: a.createdAt,
      })),
      practiceSessions: allSessions.slice(0, 10).map((p: any) => ({
        _id: p._id, 
        characterType: p.characterId || p.characterType, // Maps the DB characterId back to the UI's characterType
        difficulty: p.difficulty, messageCount: p.messageCount ?? 0, currentInterest: p.currentInterest ?? 0, createdAt: p.createdAt,
      })),
      scoreHistory: analysisScores.map((score: number, i: number) => ({
        index: i, score, date: ([...allAnalyses].reverse()[i] as any)?.createdAt,
      })),
    });
  } catch (error) {
    console.error('[Dashboard API] Error:', error);
    return NextResponse.json({ error: 'Could not load dashboard data.' }, { status: 500 });
  }
}