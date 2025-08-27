import { prisma, requireAdmin, json } from '@/app/api/admin/_utils';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim() || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
  const where = {
    isDeleted: false,
    ...(q ? { OR: [
      { symbol: { contains: q, mode: 'insensitive' } },
      { base: { contains: q, mode: 'insensitive' } },
      { quote: { contains: q, mode: 'insensitive' } },
      { display: { contains: q, mode: 'insensitive' } },
    ] } : {}),
  };
  const [total, items] = await Promise.all([
    prisma.currency_pairs.count({ where }),
    prisma.currency_pairs.findMany({
      where,
      orderBy: { updated_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);
  return json({ total, page, pageSize, items });
}

export async function POST(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  const data = await request.json();
  // Basic required fields
  const { base, quote, symbol, display, payout, status, provider, provider_symbol, price_decimals } = data;
  if (!base || !quote || !symbol) return json({ error: 'base, quote, symbol required' }, 400);
  const created = await prisma.currency_pairs.create({
    data: {
      base, quote, symbol, display: display || `${base}/${quote}`, payout: payout ?? null, status: status || 'ACTIVE',
      provider: provider || null, provider_symbol: provider_symbol || null, price_decimals: price_decimals ?? null,
    }
  });
  return json(created, 201);
}
