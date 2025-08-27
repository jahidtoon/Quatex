// Lightweight CoinGecko client for client-side usage
// Docs: https://www.coingecko.com/en/api/documentation

const BASE_URL = 'https://api.coingecko.com/api/v3';

// Map common symbols to CoinGecko IDs
export const symbolToId = {
  'BTC/USD': 'bitcoin',
  'ETH/USD': 'ethereum',
  'BNB/USD': 'binancecoin',
  'ADA/USD': 'cardano',
  'SOL/USD': 'solana',
  'DOT/USD': 'polkadot',
};

function toId(symbolOrId) {
  if (!symbolOrId) return null;
  if (symbolOrId.includes('/')) return symbolToId[symbolOrId] || null;
  return symbolOrId; // already an id
}

export async function getCryptoPrice(symbolOrId, vs = 'usd') {
  const id = toId(symbolOrId);
  if (!id) throw new Error(`Unknown crypto: ${symbolOrId}`);
  const url = `${BASE_URL}/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=${encodeURIComponent(vs)}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`CoinGecko price error: ${res.status}`);
  const json = await res.json();
  const price = json?.[id]?.[vs];
  if (price == null) throw new Error('Price not found');
  return { symbol: symbolOrId, id, price };
}

// Build OHLC candles from market_chart minute prices
export async function getCryptoHistorical(symbolOrId, days = 1, vs = 'usd') {
  const id = toId(symbolOrId);
  if (!id) throw new Error(`Unknown crypto: ${symbolOrId}`);
  const url = `${BASE_URL}/coins/${encodeURIComponent(id)}/market_chart?vs_currency=${encodeURIComponent(vs)}&days=${days}&interval=minute`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`CoinGecko historical error: ${res.status}`);
  const json = await res.json();
  const prices = json?.prices; // [ [ts, price], ... ]
  if (!Array.isArray(prices)) return [];

  // Group by minute
  const byMinute = new Map();
  for (const [ts, price] of prices) {
    const minute = Math.floor(ts / 60000) * 60000; // ms at minute start
    let arr = byMinute.get(minute);
    if (!arr) { arr = []; byMinute.set(minute, arr); }
    arr.push(price);
  }

  const candles = Array.from(byMinute.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([minuteTs, arr]) => {
      const open = arr[0];
      const close = arr[arr.length - 1];
      let high = -Infinity, low = Infinity;
      for (const p of arr) { if (p > high) high = p; if (p < low) low = p; }
      return {
        time: minuteTs,
        open,
        high,
        low,
        close,
        volume: 0,
      };
    });

  // Keep last 200 to limit rendering cost
  return candles.slice(-200);
}
