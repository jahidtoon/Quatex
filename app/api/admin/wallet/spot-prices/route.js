import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

import { fetchBatchPrices } from '@/lib/priceProviders.js';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const symbolsParam = searchParams.get('symbols');
    const defaultSymbols = ['ETH_USD', 'BNB_USD', 'TRX_USD'];
    const symbols = symbolsParam
      ? symbolsParam.split(',').map(s => s.trim()).filter(Boolean)
      : defaultSymbols;

    const prices = await fetchBatchPrices(symbols);
    return NextResponse.json({ prices });
  } catch (e) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch prices' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Use GET with optional ?symbols=ETH_USD,BNB_USD,TRX_USD' }, { status: 405 });
}
