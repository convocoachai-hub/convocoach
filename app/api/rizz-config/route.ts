// app/api/rizz-config/route.ts — Get/update rizzPageConfig
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';

const VALID_TRAITS = ['flirting', 'humor', 'confidence', 'dryText', 'overall'];
const VALID_AVATARS = ['cat', 'dog', 'fox', 'robot', 'panda'];
const VALID_THEMES = ['minimal', 'vintage', 'gothic'];

// GET — fetch current config
export async function GET(_req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email }).select('rizzPageConfig username').lean() as any;
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      config: user.rizzPageConfig ?? {
        avatar: 'cat', theme: 'minimal',
        enabledTraits: ['flirting', 'humor', 'confidence', 'dryText', 'overall'],
        allowMessage: true, customQuestion: '', showFinalCTA: true,
      },
      username: user.username || null,
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

// POST — update config
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Auth required' }, { status: 401 });

    const body = await req.json();

    // Validate + sanitize
    const config = {
      avatar: VALID_AVATARS.includes(body.avatar) ? body.avatar : 'cat',
      theme: VALID_THEMES.includes(body.theme) ? body.theme : 'minimal',
      enabledTraits: Array.isArray(body.enabledTraits)
        ? body.enabledTraits.filter((t: string) => VALID_TRAITS.includes(t))
        : ['flirting', 'humor', 'confidence', 'dryText', 'overall'],
      allowMessage: body.allowMessage !== false,
      customQuestion: typeof body.customQuestion === 'string'
        ? body.customQuestion.trim().slice(0, 200) : '',
      showFinalCTA: body.showFinalCTA !== false,
    };

    if (config.enabledTraits.length === 0) config.enabledTraits = ['overall'];

    await connectToDatabase();
    await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: { rizzPageConfig: config } }
    );

    return NextResponse.json({ success: true, config });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
  }
}
