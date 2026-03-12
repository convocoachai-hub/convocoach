// app/api/admin/route.ts
// ✅ Pure TypeScript API — NO React/JSX in this file
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
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = 20;
    const search = searchParams.get('search') ?? '';
    const filter = searchParams.get('filter') ?? 'all';

    // User query
    const userQuery: any = {};
    if (search) {
      userQuery.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }
    if (filter !== 'all') userQuery.subscriptionStatus = filter;

    const [users, totalUsers] = await Promise.all([
      User.find(userQuery).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      User.countDocuments(userQuery),
    ]);

    // Platform stats
    const [totalFree, totalPaid, totalAllUsers, totalAnalyses, totalPractice, recentSignups] =
      await Promise.all([
        User.countDocuments({ subscriptionStatus: 'free' }),
        User.countDocuments({ subscriptionStatus: { $in: ['paid', 'lifetime'] } }),
        User.countDocuments(),
        ChatAnalysis.countDocuments(),
        PracticeSession.countDocuments(),
        User.find().sort({ createdAt: -1 }).limit(5)
          .select('name email createdAt subscriptionStatus').lean(),
      ]);

    // 14-day activity
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
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

    // Fill missing days
    const activityMap: Record<string, { analyses: number; signups: number }> = {};
    for (let d = 0; d < 14; d++) {
      const date = new Date(twoWeeksAgo);
      date.setDate(date.getDate() + d);
      activityMap[date.toISOString().split('T')[0]] = { analyses: 0, signups: 0 };
    }
    dailyAnalyses.forEach((d: any) => { if (activityMap[d._id]) activityMap[d._id].analyses = d.count; });
    dailySignups.forEach((d: any) => { if (activityMap[d._id]) activityMap[d._id].signups = d.count; });
    const activityData = Object.entries(activityMap).map(([date, v]) => ({ date, ...v }));

    // Per-user counts
    const userIds = users.map((u: any) => String(u._id));
    const [analysisCountsRaw, practiceCountsRaw] = await Promise.all([
      ChatAnalysis.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
      PracticeSession.aggregate([
        { $match: { userId: { $in: userIds } } },
        { $group: { _id: '$userId', count: { $sum: 1 } } },
      ]),
    ]);

    const analysisCounts: Record<string, number> = {};
    analysisCountsRaw.forEach((r: any) => { analysisCounts[r._id] = r.count; });
    const practiceCounts: Record<string, number> = {};
    practiceCountsRaw.forEach((r: any) => { practiceCounts[r._id] = r.count; });

    return NextResponse.json({
      success: true,
      platform: {
        totalUsers: totalAllUsers,
        totalFree,
        totalPaid,
        totalAnalyses,
        totalPractice,
        conversionRate: totalAllUsers > 0
          ? Math.round((totalPaid / totalAllUsers) * 100)
          : 0,
        activityData,
      },
      users: users.map((u: any) => ({
        _id: String(u._id),
        name: u.name ?? 'Unknown',
        email: u.email,
        image: u.image ?? null,
        subscriptionStatus: u.subscriptionStatus ?? 'free',
        freeTriesUsed: u.freeTriesUsed ?? 0,
        analysisCount: analysisCounts[String(u._id)] ?? 0,
        practiceCount: practiceCounts[String(u._id)] ?? 0,
        skillPoints: u.skillPoints ?? 0,
        createdAt: u.createdAt,
      })),
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
      },
      recentSignups: recentSignups.map((u: any) => ({
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        subscriptionStatus: u.subscriptionStatus,
      })),
    });
  } catch (error) {
    console.error('[Admin API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}