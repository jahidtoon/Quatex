// utils/coingecko.ts
// CoinGecko API থেকে ডেটা ফেচ করার জন্য হেল্পার ফাংশন

// Use internal proxy to avoid CORS and reduce 429s
const BASE_URL = '/api';

export async function fetchMarketData(ids: string = 'bitcoin,ethereum', vs_currency: string = 'usd') {
  const url = `${BASE_URL}/markets?vs_currency=${encodeURIComponent(vs_currency)}&ids=${encodeURIComponent(ids)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Failed to fetch market data (${res.status})`);
  }
  return res.json();
}
