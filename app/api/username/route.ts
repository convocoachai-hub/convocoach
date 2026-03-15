// app/api/username/route.ts — Set or update username
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

// Reserved words that cannot be used as usernames
const RESERVED = new Set([
  'admin', 'api', 'upload', 'dashboard', 'upgrade', 'practice', 'results',
  'about', 'contact', 'help', 'settings', 'auth', 'login', 'signup',
  'convocoach', 'support', 'mod', 'moderator', 'system', 'null', 'undefined',
]);

// GET — check username availability
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username')?.toLowerCase().trim();

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  if (!USERNAME_REGEX.test(username)) {
    return NextResponse.json({ available: false, reason: 'Username must be 3–20 characters: letters, numbers, underscores only.' });
  }

  if (RESERVED.has(username)) {
    return NextResponse.json({ available: false, reason: 'This username is reserved.' });
  }

  await connectToDatabase();
  const existing = await User.findOne({ username }).lean();

  return NextResponse.json({ available: !existing });
}

// POST — set or update username
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Sign in to set a username' }, { status: 401 });
    }

    const { username: rawUsername } = await req.json();
    const username = rawUsername?.toLowerCase().trim();

    // Validate format
    if (!username || !USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        { error: 'Username must be 3–20 characters: letters, numbers, and underscores only.' },
        { status: 400 }
      );
    }

    // Check reserved words
    if (RESERVED.has(username)) {
      return NextResponse.json({ error: 'This username is reserved.' }, { status: 400 });
    }

    await connectToDatabase();

    // Get current user
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Free users: can only set username once
    const isPremium = user.subscriptionStatus === 'paid' || user.subscriptionStatus === 'lifetime';
    if (!isPremium && user.usernameSetAt) {
      return NextResponse.json(
        { error: 'Free users can only set their username once. Upgrade to Premium to change it.' },
        { status: 403 }
      );
    }

    // Check if username is already taken (by another user)
    const existing = await User.findOne({ username, email: { $ne: session.user.email } });
    if (existing) {
      return NextResponse.json({ error: 'This username is already taken.' }, { status: 409 });
    }

    // Update username
    user.username = username;
    user.usernameSetAt = new Date();
    await user.save();

    return NextResponse.json({
      success: true,
      username: user.username,
      rizzLink: `/u/${user.username}`,
    });
  } catch (error: any) {
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return NextResponse.json({ error: 'This username is already taken.' }, { status: 409 });
    }
    console.error('Username error:', error);
    return NextResponse.json({ error: 'Failed to update username' }, { status: 500 });
  }
}
