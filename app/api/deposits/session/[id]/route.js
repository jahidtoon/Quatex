import { NextResponse } from 'next/server';
import { getDepositSession } from '@/lib/cryptoDepositService';
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req, { params }) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const token = auth.replace('Bearer ', '').trim();
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    const { id } = params;
    const session = await getDepositSession(id, user.id);
    const asset = await prisma.crypto_assets.findUnique({ where: { id: session.crypto_asset_id } });

    return NextResponse.json({
      id: session.id,
      address: session.address,
      status: session.status,
      expiresAt: session.expires_at,
      confirmations: session.confirmations,
      minConfirmations: session.min_confirmations,
      detectedAmount: session.detected_amount,
      isLate: session.is_late,
      amountExpected: session.amount_expected,
      asset: {
        symbol: asset.symbol,
        network: asset.network,
        displayName: asset.display_name,
        decimals: asset.decimals,
      }
    });
  } catch (e) {
    console.error('Fetch deposit session error', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
