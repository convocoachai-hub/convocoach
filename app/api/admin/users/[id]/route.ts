// app/api/admin/users/[id]/route.ts
// ✅ Pure TypeScript API — NO React/JSX in this file
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import ChatAnalysis from '@/models/ChatAnalysis';
import PracticeSession from '@/models/PracticeSession';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    const { action, value } = await request.json();
    await connectToDatabase();

    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (action === 'togglePremium') {
      const isPaid = user.subscriptionStatus !== 'free';
      user.subscriptionStatus = isPaid ? 'free' : 'paid';
      if (!isPaid) {
        user.subscriptionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      } else {
        user.subscriptionExpiry = undefined;
      }
      await user.save();
      return NextResponse.json({
        success: true,
        message: `${user.email} is now ${user.subscriptionStatus}`,
        subscriptionStatus: user.subscriptionStatus,
      });
    }

    if (action === 'setStatus' && ['free', 'paid', 'lifetime'].includes(value)) {
      user.subscriptionStatus = value;
      if (value !== 'free') {
        user.subscriptionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }
      await user.save();
      return NextResponse.json({ success: true, subscriptionStatus: user.subscriptionStatus });
    }

    if (action === 'resetTrials') {
      user.freeTriesUsed = 0;
      await user.save();
      return NextResponse.json({ success: true, message: 'Trials reset' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    console.error('[Admin Users PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const user = await User.findById(params.id);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const userId = String(user._id);
    const email = user.email;

    await Promise.all([
      ChatAnalysis.deleteMany({ userId }),
      PracticeSession.deleteMany({ userId }),
      User.findByIdAndDelete(params.id),
    ]);

    return NextResponse.json({ success: true, message: `Deleted ${email} and all data` });
  } catch (error) {
    console.error('[Admin Users DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}