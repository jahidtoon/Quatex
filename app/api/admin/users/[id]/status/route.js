import { json, requireAdmin, prisma } from '@/app/api/admin/_utils';

export async function POST(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  const { id } = params;
  const { status } = await request.json();
  const normalized = String(status || '').toLowerCase();

  let data = {};
  if (normalized === 'active') {
    data = { is_verified: true, is_suspended: false };
  } else if (normalized === 'pending') {
    data = { is_verified: false, is_suspended: false };
  } else if (normalized === 'suspend' || normalized === 'suspended') {
    data = { is_suspended: true };
  } else {
    return json({ error: 'Invalid status' }, 400);
  }

  const updated = await prisma.users.update({ where: { id }, data });
  return json({
    success: true,
    status: normalized,
    user: {
      id: updated.id,
      is_verified: updated.is_verified,
      is_suspended: updated.is_suspended,
    }
  });
}
