import { json, requireAdmin, prisma } from '@/app/api/admin/_utils';
import bcrypt from 'bcryptjs';

export async function PUT(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  const { id } = params;
  const body = await request.json();

  const data = {};
  if (body.email) data.email = body.email;
  if (body.first_name !== undefined) data.first_name = body.first_name;
  if (body.last_name !== undefined) data.last_name = body.last_name;
  if (body.name !== undefined) data.name = body.name;
  if (body.country !== undefined) data.country = body.country;
  if (body.is_verified !== undefined) data.is_verified = !!body.is_verified;
  if (body.is_admin !== undefined) data.is_admin = !!body.is_admin;
  if (body.is_suspended !== undefined) data.is_suspended = !!body.is_suspended;
  if (body.balance !== undefined) data.balance = body.balance;
  if (body.demo_balance !== undefined) data.demo_balance = body.demo_balance;
  if (body.password) {
    data.password_hash = await bcrypt.hash(body.password, 10);
  }

  const updated = await prisma.users.update({ where: { id }, data });
  return json({
    success: true,
    user: {
      id: updated.id,
      email: updated.email,
      first_name: updated.first_name,
      last_name: updated.last_name,
      is_verified: updated.is_verified,
      is_admin: updated.is_admin,
      is_suspended: updated.is_suspended,
      balance: Number(updated.balance || 0),
      demo_balance: Number(updated.demo_balance || 0),
    }
  });
}
