import { prisma, requireAdmin, json } from '@/app/api/admin/_utils';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '20')));
  const status = searchParams.get('status'); // OPEN|RESOLVED|CANCELED
  const q = (searchParams.get('q') || '').trim();

  const where = {};
  if (status) where.status = status;

  // Simple search: by order reference_code or user email
  if (q) {
    where.OR = [
      { order: { reference_code: { contains: q, mode: 'insensitive' } } },
      { raised_by: { email: { contains: q, mode: 'insensitive' } } },
    ];
  }

  const [total, items] = await Promise.all([
    prisma.p2p_disputes.count({ where }),
    prisma.p2p_disputes.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        order: {
          select: {
            id: true,
            reference_code: true,
            status: true,
            side: true,
            asset_symbol: true,
            amount_asset: true,
            fiat_currency: true,
            amount_fiat: true,
            maker_id: true,
            taker_id: true,
          }
        },
        raised_by: { select: { id: true, email: true, first_name: true, last_name: true } },
      }
    })
  ]);

  return json({ page, pageSize, total, items });
}
