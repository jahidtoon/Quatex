// Alpha Vantage lightweight client for forex intraday rates
// Rate limit: 5 requests per minute (free). We keep a simple in-memory TTL cache to reduce calls.

const CACHE = new Map(); // key -> {ts, data}
const TTL_MS = 55 * 1000; // reuse within ~1 minute for same symbol+interval

function cacheKey(symbol, interval) { return symbol + '|' + interval; }

export async function fetchIntraday(symbol, interval = '1min') {
  const key = cacheKey(symbol, interval);
  const now = Date.now();
  const cached = CACHE.get(key);
  if (cached && now - cached.ts < TTL_MS) return cached.data;
  const apiKey = process.env.ALPHA_VANTAGE_KEY;
  if (!apiKey) throw new Error('ALPHA_VANTAGE_KEY missing');
  // Alpha Vantage expects from_currency, to_currency (EUR, USD)
  const [base, quote] = symbol.split('_');
  const url = `https://www.alphavantage.co/query?function=FX_INTRADAY&from_symbol=${base}&to_symbol=${quote}&interval=${interval}&outputsize=compact&apikey=${apiKey}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Alpha Vantage HTTP ' + res.status);
  const json = await res.json();
  console.log('Alpha Vantage response:', JSON.stringify(json, null, 2));
  if (!json['Time Series FX (' + interval + ')']) {
    throw new Error('Unexpected response: ' + JSON.stringify(json));
  }
  const series = json['Time Series FX (' + interval + ')'];
  const candles = Object.entries(series).map(([time, o]) => ({
    time: new Date(time + 'Z'),
    open: parseFloat(o['1. open']),
    high: parseFloat(o['2. high']),
    low: parseFloat(o['3. low']),
    close: parseFloat(o['4. close']),
  })).sort((a,b)=>a.time - b.time);
  CACHE.set(key, { ts: now, data: candles });
  return candles;
}
