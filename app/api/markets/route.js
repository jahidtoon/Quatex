// Proxy markets endpoint to CoinGecko to support external chart components
// GET /api/markets?vs_currency=usd&ids=bitcoin,ethereum&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h

import { NextResponse } from 'next/server';

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const vs_currency = (searchParams.get('vs_currency') || 'usd').toLowerCase();
    const ids = searchParams.get('ids') || '';
    const order = searchParams.get('order') || 'market_cap_desc';
    const per_page = searchParams.get('per_page') || '50';
    const page = searchParams.get('page') || '1';
    const sparkline = searchParams.get('sparkline') || 'false';
    const price_change_percentage = searchParams.get('price_change_percentage') || '24h';

    const url = new URL(`${COINGECKO_BASE}/coins/markets`);
    url.searchParams.set('vs_currency', vs_currency);
    if (ids) url.searchParams.set('ids', ids);
    url.searchParams.set('order', order);
    url.searchParams.set('per_page', per_page);
    url.searchParams.set('page', page);
    url.searchParams.set('sparkline', sparkline);
    url.searchParams.set('price_change_percentage', price_change_percentage);

    const resp = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
      // Revalidation hint for Next.js caching layers
      next: { revalidate: 30 },
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json({ error: 'upstream error', status: resp.status, body: text }, { status: 502 });
    }

    const data = await resp.json();

    // Basic rate-limit friendly headers
    const headers = new Headers({
      'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
    });

    return new NextResponse(JSON.stringify(data), { status: 200, headers });
  } catch (err) {
    console.error('[markets] error:', err);
    return NextResponse.json({ error: 'internal server error', details: err.message }, { status: 500 });
  }
}
