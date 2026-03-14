// app/api/admin/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import ChatAnalysis from '@/models/ChatAnalysis';
import PracticeSession from '@/models/PracticeSession';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const page    = Math.max(1, parseInt(searchParams.get('page')   ?? '1'));
    const limit   = parseInt(searchParams.get('limit') ?? '25');
    const search  = searchParams.get('search') ?? '';
    const filter  = searchParams.get('filter') ?? 'all';
    const sort    = searchParams.get('sort')   ?? 'newest';
    const detail  = searchParams.get('detail');

    // ── Single user detail view ─────────────────────────────────────────
    if (detail) {
      const user = await User.findById(detail).lean() as any;
      if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const uid = String(user._id);
      const [analyses, sessions] = await Promise.all([
        ChatAnalysis.find({ userId: uid }).sort({ createdAt: -1 }).limit(50).lean(),
        PracticeSession.find({ userId: uid }).sort({ createdAt: -1 }).limit(20).lean(),
      ]);

      const avgScore = analyses.length
        ? analyses.reduce((s: number, a: any) => s + (a.conversationScore ?? 0), 0) / analyses.length
        : 0;

      return NextResponse.json({
        success: true,
        user: {
          _id:                String(user._id),
          name:               user.name,
          email:              user.email,
          image:              user.image ?? null,
          subscriptionStatus: user.subscriptionStatus ?? 'free',
          subscriptionExpiry: user.subscriptionExpiry ?? null,
          freeTriesUsed:      user.freeTriesUsed ?? 0,
          skillPoints:        user.skillPoints ?? 0,
          analysisCount:      user.analysisCount ?? 0,
          practiceMessageCount: user.practiceMessageCount ?? 0,
          razorpayPaymentId:  user.razorpayPaymentId ?? null,
          createdAt:          user.createdAt,
        },
        analyses: analyses.map((a: any) => ({
          _id:                   String(a._id),
          conversationScore:     a.conversationScore,
          interestLevel:         a.interestLevel,
          attractionProbability: a.attractionProbability,
          conversationMomentum:  a.conversationMomentum,
          context:               a.context,
          inputMode:             a.inputMode,
          roastMode:             a.roastMode,
          createdAt:             a.createdAt,
        })),
        sessions: sessions.map((s: any) => ({
          _id:             String(s._id),
          characterType:   s.characterType,
          scenarioCategory: s.scenarioCategory ?? 'dating',
          difficulty:      s.difficulty,
          messageCount:    s.messageCount,
          currentInterest: s.currentInterest,
          createdAt:       s.createdAt,
        })),
        stats: {
          totalAnalyses:   analyses.length,
          totalSessions:   sessions.length,
          avgScore:        Math.round(avgScore * 10) / 10,
        },
      });
    }

    // ── User list with filters ──────────────────────────────────────────
    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name:  { $regex: search, $options: 'i' } },
      ];
    }
    if (filter === 'paid')     query.subscriptionStatus = { $in: ['paid', 'lifetime'] };
    else if (filter === 'free') query.subscriptionStatus = 'free';
    else if (filter !== 'all')  query.subscriptionStatus = filter;

    const sortMap: Record<string, any> = {
      newest:   { createdAt: -1 },
      oldest:   { createdAt: 1 },
      points:   { skillPoints: -1 },
      analyses: { analysisCount: -1 },
    };
    const sortObj = sortMap[sort] ?? sortMap.newest;

    const [users, totalUsers] = await Promise.all([
      User.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    // ── Platform stats ──────────────────────────────────────────────────
    const now        = new Date();
    const last24h    = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d     = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d    = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalAllUsers, totalFree, totalPaid,
      totalAnalyses, totalPractice,
      newUsers24h, newUsers7d, newUsers30d,
      analyses24h, analyses7d,
      recentSignups,
      topUsers,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ subscriptionStatus: 'free' }),
      User.countDocuments({ subscriptionStatus: { $in: ['paid', 'lifetime'] } }),
      ChatAnalysis.countDocuments(),
      PracticeSession.countDocuments(),
      User.countDocuments({ createdAt: { $gte: last24h } }),
      User.countDocuments({ createdAt: { $gte: last7d } }),
      User.countDocuments({ createdAt: { $gte: last30d } }),
      ChatAnalysis.countDocuments({ createdAt: { $gte: last24h } }),
      ChatAnalysis.countDocuments({ createdAt: { $gte: last7d } }),
      User.find().sort({ createdAt: -1 }).limit(8).select('name email createdAt subscriptionStatus skillPoints').lean(),
      User.find().sort({ skillPoints: -1 }).limit(5).select('name email skillPoints subscriptionStatus').lean(),
    ]);

    // 14-day activity
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const [dailyAnalyses, dailySignups] = await Promise.all([
      ChatAnalysis.aggregate([
        { $match: { createdAt: { $gte: twoWeeksAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: twoWeeksAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const activityMap: Record<string, { analyses: number; signups: number }> = {};
    for (let d = 0; d < 14; d++) {
      const date = new Date(twoWeeksAgo);
      date.setDate(date.getDate() + d);
      activityMap[date.toISOString().split('T')[0]] = { analyses: 0, signups: 0 };
    }
    dailyAnalyses.forEach((d: any) => { if (activityMap[d._id]) activityMap[d._id].analyses = d.count; });
    dailySignups.forEach((d: any) => { if (activityMap[d._id]) activityMap[d._id].signups = d.count; });
    const activityData = Object.entries(activityMap).map(([date, v]) => ({ date, ...v }));

    // Per-user counts for the current page
    const userIds = users.map((u: any) => String(u._id));
    const [analysisCountsRaw, practiceCountsRaw] = await Promise.all([
      ChatAnalysis.aggregate([{ $match: { userId: { $in: userIds } } }, { $group: { _id: '$userId', count: { $sum: 1 } } }]),
      PracticeSession.aggregate([{ $match: { userId: { $in: userIds } } }, { $group: { _id: '$userId', count: { $sum: 1 } } }]),
    ]);
    const aCounts: Record<string, number> = {};
    analysisCountsRaw.forEach((r: any) => { aCounts[r._id] = r.count; });
    const pCounts: Record<string, number> = {};
    practiceCountsRaw.forEach((r: any) => { pCounts[r._id] = r.count; });

    return NextResponse.json({
      success: true,
      platform: {
        totalUsers: totalAllUsers, totalFree, totalPaid,
        totalAnalyses, totalPractice,
        conversionRate: totalAllUsers > 0 ? Math.round((totalPaid / totalAllUsers) * 100) : 0,
        growth: { newUsers24h, newUsers7d, newUsers30d, analyses24h, analyses7d },
        activityData,
      },
      users: users.map((u: any) => ({
        _id:                String(u._id),
        name:               u.name ?? 'Unknown',
        email:              u.email,
        image:              u.image ?? null,
        subscriptionStatus: u.subscriptionStatus ?? 'free',
        freeTriesUsed:      u.freeTriesUsed ?? 0,
        skillPoints:        u.skillPoints ?? 0,
        analysisCount:      aCounts[String(u._id)] ?? 0,
        practiceCount:      pCounts[String(u._id)] ?? 0,
        createdAt:          u.createdAt,
      })),
      pagination: { page, limit, total: totalUsers, pages: Math.ceil(totalUsers / limit) },
      recentSignups: recentSignups.map((u: any) => ({
        name: u.name, email: u.email, createdAt: u.createdAt,
        subscriptionStatus: u.subscriptionStatus, skillPoints: u.skillPoints ?? 0,
      })),
      topUsers: topUsers.map((u: any) => ({
        name: u.name, email: u.email,
        skillPoints: u.skillPoints ?? 0, subscriptionStatus: u.subscriptionStatus,
      })),
    });

  } catch (error) {
    console.error('[Admin API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}