// app/api/ad-reward/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import AdReward from '@/models/AdReward';
import User from '@/models/User';

const COOLDOWN_SECONDS = 15; // 15s cooldown between ad unlocks

function getIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? '0.0.0.0';
}

// GET — check if user can watch an ad
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id ?? null;
  const ip = getIP(req);

  // Premium users never see ads
  if (userId) {
    await connectToDatabase();
    const dbUser = await User.findById(userId).lean() as any;
    if (dbUser?.subscriptionStatus === 'paid' || dbUser?.subscriptionStatus === 'lifetime') {
      return NextResponse.json({ canWatch: false, reason: 'premium' });
    }
  }

  await connectToDatabase();
  const record = await AdReward.findOne(
    userId ? { userId } : { ipAddress: ip, userId: null }
  ).lean() as any;

  // Check cooldown — no daily limit, just cooldown between unlocks
  if (record?.lastReset) {
    const elapsed = (Date.now() - new Date(record.lastReset).getTime()) / 1000;
    if (elapsed < COOLDOWN_SECONDS) {
      return NextResponse.json({
        canWatch: false,
        cooldownRemaining: Math.ceil(COOLDOWN_SECONDS - elapsed),
        reason: 'cooldown',
      });
    }
  }

  return NextResponse.json({ canWatch: true });
}

// POST — grant ad reward (after ad completion)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id ?? null;
  const ip = getIP(req);

  // Premium users can't use this
  if (userId) {
    await connectToDatabase();
    const dbUser = await User.findById(userId).lean() as any;
    if (dbUser?.subscriptionStatus === 'paid' || dbUser?.subscriptionStatus === 'lifetime') {
      return NextResponse.json({ error: 'Premium users don\'t need ads' }, { status: 400 });
    }
  }

  await connectToDatabase();
  const now = new Date();
  const filter = userId ? { userId } : { ipAddress: ip, userId: null };
  let record = await AdReward.findOne(filter) as any;

  if (!record) {
    record = await AdReward.create({ userId, ipAddress: ip, unlocksToday: 0, lastReset: now });
  }

  // Check cooldown
  const elapsed = (Date.now() - new Date(record.lastReset).getTime()) / 1000;
  if (elapsed < COOLDOWN_SECONDS) {
    return NextResponse.json({
      rewardGranted: false,
      cooldownRemaining: Math.ceil(COOLDOWN_SECONDS - elapsed),
      message: `Please wait ${Math.ceil(COOLDOWN_SECONDS - elapsed)} seconds before watching another ad.`,
    });
  }

  // Grant the reward — update timestamp for cooldown tracking
  record.unlocksToday += 1;
  record.lastReset = now;
  await record.save();

  // If signed in, give them 1 extra free try
  if (userId) {
    await User.findByIdAndUpdate(userId, { $inc: { freeTriesUsed: -1 } });
  }

  return NextResponse.json({
    rewardGranted: true,
    message: 'You unlocked 1 additional analysis!',
  });
}
