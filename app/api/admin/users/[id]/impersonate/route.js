import { json, requireAdmin, prisma } from '@/app/api/admin/_utils';
import jwt from 'jsonwebtoken';

export async function POST(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;
  const { id } = params;
  const user = await prisma.users.findUnique({ where: { id } });
  if (!user) return json({ error: 'User not found' }, 404);

  const JWT_SECRET = process.env.JWT_SECRET || 'dev_change_me_please';
  // Issue a regular user token to impersonate as that user
  const token = jwt.sign({ sub: user.id, email: user.email }, JWT_SECRET, { expiresIn: '2h' });

  return json({ token, user: {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    balance: Number(user.balance || 0),
    demoBalance: Number(user.demo_balance || 0)
  }});
}
