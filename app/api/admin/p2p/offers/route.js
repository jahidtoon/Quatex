import { prisma, requireAdmin, json } from '@/app/api/admin/_utils';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '20')));
  const status = searchParams.get('status');
  const q = (searchParams.get('q') || '').trim();
  const where = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { asset_symbol: { contains: q, mode: 'insensitive' } },
      { fiat_currency: { contains: q, mode: 'insensitive' } },
      { users: { email: { contains: q, mode: 'insensitive' } } }
    ];
  }
  const [total, items] = await Promise.all([
    prisma.p2p_offers.count({ where }),
    prisma.p2p_offers.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { users: { select: { id: true, email: true } } }
    })
  ]);
  return json({ page, pageSize, total, items });
}
