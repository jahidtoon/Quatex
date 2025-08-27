import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export function requireAdmin(reqHeaders) {
  const headerToken = reqHeaders.get('x-admin-token') || reqHeaders.get('authorization');
  const cookieHeader = reqHeaders.get('cookie') || '';
  const cookieToken = cookieHeader.split(/;\s*/).map(s=>s.trim()).find(s=>s.startsWith('admin_token='))?.split('=')[1];
  const token = (cookieToken && decodeURIComponent(cookieToken)) || headerToken?.replace(/^Bearer\s+/i, '');
  // Allow static ADMIN_TOKEN for scripts or fallback
  if (token === process.env.ADMIN_TOKEN) return { ok: true };

  // Try JWT admin token
  if (token) {
    try {
      const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
      const payload = jwt.verify(token, secret);
      if (payload && payload.role === 'admin') return { ok: true };
    } catch (e) {
      // fallthrough
    }
  }
  return { ok: false, response: new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 }) };
}

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

export { prisma };
