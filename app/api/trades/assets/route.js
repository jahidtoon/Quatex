import { NextResponse } from 'next/server';
import { listTradableAssets } from '@/lib/tradeAssets';

export async function GET() {
  try {
    const assets = await listTradableAssets();

    return NextResponse.json({ success: true, assets });
  } catch (error) {
    console.error('[trades/assets] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
