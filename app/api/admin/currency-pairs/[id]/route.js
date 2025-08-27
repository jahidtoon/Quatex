import { prisma, requireAdmin, json } from '@/app/api/admin/_utils';

export async function GET(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  const item = await prisma.currency_pairs.findUnique({ where: { id: params.id } });
  if (!item || item.isDeleted) return json({ error: 'Not found' }, 404);
  return json(item);
}

export async function PATCH(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  const data = await request.json();
  const updated = await prisma.currency_pairs.update({ where: { id: params.id }, data });
  return json(updated);
}

export async function DELETE(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  await prisma.currency_pairs.update({ where: { id: params.id }, data: { isDeleted: true } });
  return json({ ok: true });
}
