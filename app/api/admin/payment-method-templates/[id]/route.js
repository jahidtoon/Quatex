import { prisma, requireAdmin, json } from '@/app/api/admin/_utils';

export async function PATCH(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const { id } = params;
  const body = await request.json();
  const data = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.type !== undefined) data.type = body.type;
  if (body.fields !== undefined) data.fields = body.fields;
  if (body.currency !== undefined) data.currency = body.currency;
  if (body.country !== undefined) data.country = body.country;
  if (body.is_active !== undefined) data.is_active = !!body.is_active;

  const updated = await prisma.payment_method_templates.update({ where: { id }, data });
  return json({ template: updated });
}

export async function DELETE(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const { id } = params;
  // Soft deactivate
  const updated = await prisma.payment_method_templates.update({ where: { id }, data: { is_active: false } });
  return json({ template: updated });
}
