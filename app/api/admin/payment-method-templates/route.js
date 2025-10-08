import { prisma, requireAdmin, json } from '@/app/api/admin/_utils';

// GET: list templates with optional filters
export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || '20')));
  const q = (searchParams.get('q') || '').trim();
  const country = (searchParams.get('country') || '').trim();
  const currency = (searchParams.get('currency') || '').trim();
  const active = searchParams.get('active');

  const where = {};
  if (q) where.OR = [
    { title: { contains: q, mode: 'insensitive' } },
    { country: { contains: q, mode: 'insensitive' } },
    { currency: { contains: q, mode: 'insensitive' } },
  ];
  if (country) where.country = { equals: country, mode: 'insensitive' };
  if (currency) where.currency = { equals: currency, mode: 'insensitive' };
  if (active === 'true') where.is_active = true;
  if (active === 'false') where.is_active = false;

  const [total, items] = await Promise.all([
    prisma.payment_method_templates.count({ where }),
    prisma.payment_method_templates.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    })
  ]);

  return json({ page, pageSize, total, items });
}

// POST: create a template
export async function POST(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const body = await request.json();
  const { title, type, fields, currency, country, is_active } = body || {};
  if (!title || !type || !fields || !currency || !country) {
    return json({ error: 'title, type, fields, currency, country are required' }, 400);
  }
  const created = await prisma.payment_method_templates.create({
    data: {
      title,
      type,
      fields,
      currency,
      country,
      is_active: is_active ?? true,
    }
  });
  return json({ template: created }, 201);
}
