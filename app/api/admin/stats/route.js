import { prisma, requireAdmin, json } from '@/app/api/admin/_utils';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const [usersCount, adminsCount, activePairs, candlesCount] = await Promise.all([
    prisma.users.count(),
    prisma.users.count({ where: { is_admin: true } }),
    prisma.currency_pairs.count({ where: { status: 'ACTIVE', isDeleted: false } }),
    prisma.forex_candles.count(),
  ]);

  return json({ usersCount, adminsCount, activePairs, candlesCount });
}
