// app/api/rizz-feedback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import RizzFeedback from '@/models/RizzFeedback';
import User from '@/models/User';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.NEXTAUTH_SECRET ?? 'salt')).digest('hex').slice(0, 32);
}

function clamp(val: number): number {
  return Math.max(1, Math.min(10, Math.round(val)));
}

// ─── POST — submit feedback ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const ip = getIP(req);
    const ipHash = hashIP(ip);

    const body = await req.json();
    const { targetUsername, flirtingScore, humorScore, confidenceScore, dryTextScore, overallScore, message } = body;

    // Validate scores
    if (!targetUsername || typeof targetUsername !== 'string') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const scores = [flirtingScore, humorScore, confidenceScore, dryTextScore, overallScore];
    if (scores.some(s => typeof s !== 'number' || isNaN(s))) {
      return NextResponse.json({ error: 'All trait scores are required' }, { status: 400 });
    }

    // Sanitize message
    const sanitizedMsg = typeof message === 'string'
      ? message.trim().slice(0, 400).replace(/[<>]/g, '')
      : undefined;

    await connectToDatabase();

    // Look up the target user
    const targetUser = await User.findOne({ username: targetUsername.toLowerCase() }).lean() as any;
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const targetUserId = String(targetUser._id);

    // Rate-limit: max 5 submissions per IP per user per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = await RizzFeedback.countDocuments({
      ipHash,
      targetUserId,
      createdAt: { $gte: oneHourAgo },
    });

    if (recentCount >= 5) {
      return NextResponse.json(
        { error: 'You\'ve already submitted several times. Come back later.' },
        { status: 429 }
      );
    }

    // Also block same IP from submitting for themselves (logged-in user)
    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const sessionUser = await User.findOne({ email: session.user.email }).lean() as any;
      if (sessionUser && String(sessionUser._id) === targetUserId) {
        return NextResponse.json({ error: 'You cannot rate yourself.' }, { status: 403 });
      }
    }

    await RizzFeedback.create({
      targetUserId,
      targetUsername: targetUsername.toLowerCase(),
      flirtingScore: clamp(flirtingScore),
      humorScore: clamp(humorScore),
      confidenceScore: clamp(confidenceScore),
      dryTextScore: clamp(dryTextScore),
      overallScore: clamp(overallScore),
      message: sanitizedMsg || undefined,
      ipHash,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Rizz feedback POST error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}

// ─── GET — fetch feedback for logged-in user (dashboard) ──────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    await connectToDatabase();

    const dbUser = await User.findOne({ email: session.user.email }).lean() as any;
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userId = String(dbUser._id);

    const feedback = await RizzFeedback.find({ targetUserId: userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean() as any[];

    if (!feedback.length) {
      return NextResponse.json({ success: true, total: 0, averages: null, messages: [], feedback: [] });
    }

    // Compute averages
    const avg = (arr: number[]) => +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1);

    const averages = {
      flirting:   avg(feedback.map(f => f.flirtingScore)),
      humor:      avg(feedback.map(f => f.humorScore)),
      confidence: avg(feedback.map(f => f.confidenceScore)),
      dryText:    avg(feedback.map(f => f.dryTextScore)),
      overall:    avg(feedback.map(f => f.overallScore)),
    };

    // Overall Rizz Score (out of 100): exclude dryText from upside, invert it
    const rizzScore = Math.round(
      ((averages.flirting + averages.humor + averages.confidence + averages.overall) / 4
        + (10 - averages.dryText) / 2) / 1.5 * 10
    );

    const messages = feedback
      .filter(f => f.message && f.message.trim())
      .map(f => ({ message: f.message, createdAt: f.createdAt }));

    return NextResponse.json({
      success: true,
      total: feedback.length,
      rizzScore: Math.max(0, Math.min(100, rizzScore)),
      averages,
      messages: messages.slice(0, 30),
      recentFeedback: feedback.slice(0, 10).map(f => ({
        flirtingScore: f.flirtingScore,
        humorScore: f.humorScore,
        confidenceScore: f.confidenceScore,
        dryTextScore: f.dryTextScore,
        overallScore: f.overallScore,
        createdAt: f.createdAt,
      })),
    });
  } catch (error) {
    console.error('Rizz feedback GET error:', error);
    return NextResponse.json({ error: 'Failed to load feedback' }, { status: 500 });
  }
}
