import { requireAdmin, json } from '@/app/api/admin/_utils';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return json({ authenticated: false }, 200);
  // Return decoded token info for convenience
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.split(/;\s*/).find(s=>s.startsWith('admin_token='))?.split('=')[1];
  if (!token) return json({ authenticated: true });
  try {
    const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
    const payload = jwt.verify(decodeURIComponent(token), secret);
    return json({ authenticated: true, payload });
  } catch {
    return json({ authenticated: true });
  }
}
