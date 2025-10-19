import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;

    const rows = await prisma.leaderboard.findMany({
      orderBy: [{ rank: 'asc' }, { amount: 'desc' }],
      take: limit,
      select: {
        id: true,
        user_id: true,
        amount: true,
        rank: true,
        updated_at: true,
        users: { select: { email: true, first_name: true, last_name: true } }
      }
    });

    let items = rows.map((entry) => ({
      id: entry.id,
      userId: entry.user_id,
      amount: entry.amount ? Number(entry.amount) : 0,
      rank: entry.rank ?? null,
      updatedAt: entry.updated_at,
      email: entry.users?.email || 'Unknown',
      name: entry.users?.first_name
        ? `${entry.users?.first_name} ${entry.users?.last_name || ''}`.trim()
        : entry.users?.email || 'Unknown'
    }));

    // Fallback: compute top performers from trades if leaderboard has no entries
    if (!items.length) {
      // Compute net profit = sum(payout for wins) - sum(amount for losses)
      const [winsAgg, lossesAgg] = await Promise.all([
        prisma.trades.groupBy({
          by: ['user_id'],
          where: { user_id: { not: null }, result: 'win' },
          _sum: { payout: true },
        }),
        prisma.trades.groupBy({
          by: ['user_id'],
          where: { user_id: { not: null }, result: 'loss' },
          _sum: { amount: true },
        }),
      ]);

      const winMap = winsAgg.reduce((acc, r) => { acc[r.user_id] = Number(r._sum?.payout ?? 0) || 0; return acc; }, {});
      const lossMap = lossesAgg.reduce((acc, r) => { acc[r.user_id] = Number(r._sum?.amount ?? 0) || 0; return acc; }, {});
      const userIds = Array.from(new Set([...Object.keys(winMap), ...Object.keys(lossMap)])).filter(Boolean);

      // Compose list with net profit and trades count
      const [tradesCountAgg, users] = await Promise.all([
        prisma.trades.groupBy({
          by: ['user_id'],
          where: { user_id: { in: userIds } },
          _count: { _all: true },
        }),
        userIds.length
          ? prisma.users.findMany({
              where: { id: { in: userIds } },
              select: { id: true, email: true, first_name: true, last_name: true }
            })
          : [],
      ]);

      const countMap = tradesCountAgg.reduce((acc, r) => { acc[r.user_id] = r._count?._all ?? 0; return acc; }, {});
      const userMap = users.reduce((acc, u) => { acc[u.id] = u; return acc; }, {});

      const computed = userIds.map((uid) => {
        const profit = (winMap[uid] || 0) - (lossMap[uid] || 0);
        return { uid, profit };
      })
      .filter((e) => Number.isFinite(e.profit))
      .sort((a, b) => b.profit - a.profit)
      .slice(0, limit);

      items = computed.map((entry, idx) => {
        const u = userMap[entry.uid] || {};
        const name = u.first_name ? `${u.first_name} ${u.last_name || ''}`.trim() : (u.email || 'Unknown');
        return {
          id: entry.uid,
          userId: entry.uid,
          amount: entry.profit, // net profit
          rank: idx + 1,
          updatedAt: null,
          email: u.email || 'Unknown',
          name,
          tradesCount: countMap[entry.uid] || 0,
        };
      });
    }

    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error('[leaderboard][GET] error:', err);
    return NextResponse.json({ ok: false, error: 'Failed to load leaderboard' }, { status: 500 });
  }
}
