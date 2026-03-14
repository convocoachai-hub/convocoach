// app/api/admin/users/[id]/route.ts
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

    switch (action) {
      // ── Toggle free ↔ paid ─────────────────────────────────────────────
      case 'togglePremium': {
        const isPaid = user.subscriptionStatus !== 'free';
        user.subscriptionStatus = isPaid ? 'free' : 'paid';
        user.subscriptionExpiry = isPaid
          ? undefined
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
        await user.save();
        return NextResponse.json({
          success: true,
          message: `${user.email} → ${user.subscriptionStatus}`,
          subscriptionStatus: user.subscriptionStatus,
        });
      }

      // ── Set explicit status ────────────────────────────────────────────
      case 'setStatus': {
        const valid = ['free', 'paid', 'lifetime'];
        if (!valid.includes(value))
          return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        user.subscriptionStatus = value;
        user.subscriptionExpiry =
          value !== 'free'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            : undefined;
        await user.save();
        return NextResponse.json({
          success: true,
          message: `${user.email} set to ${value}`,
          subscriptionStatus: user.subscriptionStatus,
        });
      }

      // ── Reset free tries to 0 (THIS is what resets the analysis limit) ─
      case 'resetTrials': {
        user.freeTriesUsed = 0;
        await user.save();
        return NextResponse.json({
          success: true,
          message: `Free tries reset → ${user.email} can do 3 more analyses`,
          freeTriesUsed: 0,
        });
      }

      // ── Reset skill points to 0 ────────────────────────────────────────
      case 'resetPoints': {
        user.skillPoints = 0;
        await user.save();
        return NextResponse.json({
          success: true,
          message: `Skill points reset to 0 for ${user.email}`,
          skillPoints: 0,
        });
      }

      // ── Set skill points to exact value ───────────────────────────────
      case 'setPoints': {
        const pts = Math.max(0, parseInt(value) || 0);
        user.skillPoints = pts;
        await user.save();
        return NextResponse.json({
          success: true,
          message: `Points set to ${pts} for ${user.email}`,
          skillPoints: pts,
        });
      }

      // ── Add (or subtract) points ──────────────────────────────────────
      case 'addPoints': {
        const delta = parseInt(value) || 0;
        user.skillPoints = Math.max(0, (user.skillPoints ?? 0) + delta);
        await user.save();
        return NextResponse.json({
          success: true,
          message: `${delta >= 0 ? '+' : ''}${delta} pts → now ${user.skillPoints}`,
          skillPoints: user.skillPoints,
        });
      }

      // ── Delete all analyses for this user ─────────────────────────────
      case 'clearAnalyses': {
        const uid = String(user._id);
        const { deletedCount } = await ChatAnalysis.deleteMany({ userId: uid });
        user.analysisCount = 0;
        user.freeTriesUsed = 0; // also reset the limit counter
        await user.save();
        return NextResponse.json({
          success: true,
          message: `Deleted ${deletedCount} analyses + reset trial counter`,
        });
      }

      // ── Delete all practice sessions for this user ────────────────────
      case 'clearPractice': {
        const uid = String(user._id);
        const { deletedCount } = await PracticeSession.deleteMany({ userId: uid });
        user.practiceMessageCount = 0;
        await user.save();
        return NextResponse.json({
          success: true,
          message: `Deleted ${deletedCount} practice sessions`,
        });
      }

      // ── Delete user account + all data (called from detail panel) ──────
      case 'deleteUser': {
        const uid   = String(user._id);
        const email = user.email;
        await Promise.all([
          ChatAnalysis.deleteMany({ userId: uid }),
          PracticeSession.deleteMany({ userId: uid }),
          User.findByIdAndDelete(params.id),
        ]);
        return NextResponse.json({
          success: true,
          message: `Deleted ${email} and all associated data`,
        });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (error) {
    console.error('[Admin PATCH]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// ── DELETE — called from the user list row delete button ─────────────────────
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

    const uid   = String(user._id);
    const email = user.email;

    await Promise.all([
      ChatAnalysis.deleteMany({ userId: uid }),
      PracticeSession.deleteMany({ userId: uid }),
      User.findByIdAndDelete(params.id),
    ]);

    return NextResponse.json({
      success: true,
      message: `Deleted ${email} and all data`,
    });
  } catch (error) {
    console.error('[Admin DELETE]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}