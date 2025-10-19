import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getToken(req) {
  // Try Authorization header first
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  if (m && m[1]) return m[1];
  // Fallback to httpOnly cookie
  try {
    const cookieTok = req.cookies?.get?.('auth_token')?.value;
    if (cookieTok) return cookieTok;
  } catch {}
  const cookieHeader = req.headers.get('cookie') || '';
  const tokenFromCookie = cookieHeader
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith('auth_token='))?.split('=')[1];
  return tokenFromCookie || null;
}

export async function GET(req) {
  try {
    const token = getToken(req);
    if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

    const userInfo = await verifyToken(token);
    if (!userInfo) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const user = await prisma.users.findUnique({ where: { id: userInfo.id } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const payload = {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      country: user.country,
      isVerified: user.is_verified,
      isSuspended: user.is_suspended,
      avatarUrl: user.avatar_url,
      balance: Number(user.balance || 0),
      demoBalance: Number(user.demo_balance || 0),
      tournamentBalance: Number(user.tournament_balance || 0)
    };

    // Echo back the same token so SPA can hydrate local state if needed
    return NextResponse.json({ ok: true, user: payload, token });
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
