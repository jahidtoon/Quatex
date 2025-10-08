import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createDepositSession } from '@/lib/cryptoDepositService';
import { verifyToken } from '@/lib/auth';

// POST /api/deposits/session  -> create new session
export async function POST(req) {
  try {
    const auth = req.headers.get('authorization');
    let token = null;
    if (auth?.startsWith('Bearer ')) token = auth.slice(7).trim();
    // Cookie fallback
    if (!token) {
      const cookieHeader = req.headers.get('cookie');
      if (cookieHeader) {
        const authCookie = cookieHeader.split(';').map(c=>c.trim()).find(c=>c.startsWith('auth_token='));
        if (authCookie) token = decodeURIComponent(authCookie.split('=')[1]);
      }
    }
    if (!token) return NextResponse.json({ error: 'Missing token (send Authorization: Bearer <token>)' }, { status: 401 });
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });

    const body = await req.json();
    const { assetId, amountExpected } = body;
    if (!assetId) return NextResponse.json({ error: 'assetId required' }, { status: 400 });

    const session = await createDepositSession({ userId: user.id, assetId, amountExpected });

    return NextResponse.json({
      id: session.id,
      address: session.address,
      expiresAt: session.expires_at,
      status: session.status,
      amountExpected: session.amount_expected,
      networkInfo: await prisma.crypto_assets.findUnique({ where: { id: session.crypto_asset_id }, select: { symbol: true, network: true, decimals: true, display_name: true } }),
    });
  } catch (e) {
    console.error('Create deposit session error', e);
    return NextResponse.json({ error: 'Internal error: ' + e.message }, { status: 500 });
  }
}

// GET unsupported here (dynamic route used for fetch by id)
export async function GET() {
  return NextResponse.json({ error: 'Use /api/deposits/session/[id]' }, { status: 400 });
}
