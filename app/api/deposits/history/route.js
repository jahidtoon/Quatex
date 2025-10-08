import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(req) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.replace('Bearer ', '').trim();
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);

    const sessions = await prisma.deposit_sessions.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: Math.min(limit, 50),
      select: {
        id: true,
        status: true,
        address: true,
        detected_amount: true,
        created_at: true,
        expires_at: true,
        is_late: true,
        crypto_assets: { select: { symbol: true, network: true } }
      }
    });

    return NextResponse.json(sessions.map(s => ({
      id: s.id,
      status: s.status,
      symbol: s.crypto_assets.symbol,
      network: s.crypto_assets.network,
      amount: s.detected_amount,
      createdAt: s.created_at,
      expiresAt: s.expires_at,
      isLate: s.is_late
    })));
  } catch (e) {
    console.error('History fetch error', e);
    return NextResponse.json({ error: 'Failed to load history' }, { status: 500 });
  }
}
