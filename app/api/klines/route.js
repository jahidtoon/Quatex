// Simple in-memory cache for shared data
const cache = new Map();
const CACHE_TTL = 200; // 200ms for smoother updates

function getCacheKey(symbol, interval, limit) {
  return `${symbol}-${interval}-${limit}`;
}

function getCachedData(key) {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  return null;
}

function setCachedData(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

// Unified klines endpoint to support external chart consumer
// Returns { symbol, interval, candles: [{ time, open, high, low, close, volume }] }
// - time is in seconds (Unix epoch seconds)

import { NextResponse } from 'next/server';
import historicalDataManager from '../../../lib/historicalDataManager.js';
import { getCryptoHistorical } from '../../../lib/coinGeckoService.js';
import { getBinanceKlines } from '../../../lib/binanceService.js';

// Accepted intervals; forex supports a subset
const VALID_INTERVALS = ['1s', '30s', '1m', '5m', '15m', '1h', '4h', '1d'];

function isForexSymbol(symbol) {
  return symbol.includes('_'); // e.g., EUR_USD
}

function minutesForInterval(interval) {
  switch (interval) {
    case '1s': return 1/60;
    case '30s': return 0.5;
    case '1m': return 1;
    case '5m': return 5;
    case '15m': return 15;
    case '1h': return 60;
    case '4h': return 240;
    case '1d': return 1440;
    default: return null;
  }
}

function parseTimeParam(value) {
  if (!value) return null;
  if (/^\d+$/.test(value)) {
    const num = Number(value);
    const ms = num >= 1_000_000_000_000 ? num : num * 1000; // ms vs s
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function toSeconds(t) {
  const ms = t instanceof Date ? t.getTime() : new Date(t).getTime();
  return Math.floor(ms / 1000);
}

function aggregateCandles(candles, interval) {
  const minutes = minutesForInterval(interval);
  if (!minutes || minutes === 1) return candles;
  const bucketMs = minutes * 60 * 1000;
  const buckets = new Map();
  for (const c of candles) {
    const tMs = c.time instanceof Date ? c.time.getTime() : (typeof c.time === 'number' ? c.time : new Date(c.time).getTime());
    const bucketStart = tMs - (tMs % bucketMs);
    const key = bucketStart;
    const vol = c.volume ?? 0;
    if (!buckets.has(key)) {
      buckets.set(key, { time: new Date(bucketStart), open: c.open, high: c.high, low: c.low, close: c.close, volume: vol });
    } else {
      const b = buckets.get(key);
      b.high = Math.max(b.high, c.high);
      b.low = Math.min(b.low, c.low);
      b.close = c.close;
      b.volume += vol;
    }
  }
  return Array.from(buckets.values()).sort((a, b) => a.time - b.time);
}

function generateSyntheticCandles({ count = 200, startTime = new Date(Date.now() - count * 60_000), interval = '1m', startPrice = 1.1 }) {
  const result = [];
  const minutes = minutesForInterval(interval) || 1;
  const stepMs = minutes * 60 * 1000;
  let last = startPrice;
  let t = startTime instanceof Date ? startTime.getTime() : new Date(startTime).getTime();
  for (let i = 0; i < count; i++) {
    const open = last;
    let high = open;
    let low = open;
    let price = open;
    const moves = 3 + Math.floor(Math.random() * 3);
    for (let j = 0; j < moves; j++) {
      price = price * (1 + (Math.random() - 0.5) * 0.001);
      if (price > high) high = price;
      if (price < low) low = price;
    }
    const close = price * (1 + (Math.random() - 0.5) * 0.0005);
    result.push({ time: new Date(t), open, high, low, close, volume: 0 });
    last = close;
    t += stepMs;
  }
  return result;
}

export async function GET(request) {
  let cacheKey;
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = (searchParams.get('interval') || '1m').toLowerCase();
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 1000);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');
    const vs = (searchParams.get('vs_currency') || 'usd').toLowerCase();

    if (!symbol) return NextResponse.json({ error: 'symbol is required' }, { status: 400 });
    if (!VALID_INTERVALS.includes(interval)) return NextResponse.json({ error: `invalid interval. valid: ${VALID_INTERVALS.join(', ')}` }, { status: 400 });

    cacheKey = getCacheKey(symbol, interval, limit);
    const cached = getCachedData(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    const from = parseTimeParam(fromParam);
    const to = parseTimeParam(toParam);

    if (isForexSymbol(symbol)) {
      let candles = [];
      if (from && to) {
        candles = await historicalDataManager.getHistoricalData(symbol, interval, from, to);
        if (!candles || candles.length === 0) {
          // Synthetic fallback for empty ranges
          const minutes = minutesForInterval(interval) || 1;
          const count = Math.max(50, Math.min(limit || 200, Math.floor((to.getTime() - from.getTime()) / (minutes * 60 * 1000))));
          candles = generateSyntheticCandles({ count, startTime: from, interval, startPrice: 1.1 });
        }
      } else {
        // Try recent DB data first
        candles = await historicalDataManager.getRecentData(symbol, interval, limit);
        if (!candles || candles.length === 0) {
          // Backfill a reasonable window, then pull again
          const now = new Date();
          const minutes = minutesForInterval(interval) || 1;
          const windowByInterval = { '1m': 6 * 60, '5m': 24 * 60, '15m': 5 * 24 * 60, '1h': 30 * 24 * 60, '4h': 120 * 24 * 60, '1d': 365 * 24 * 60 };
          const totalMinutes = windowByInterval[interval] || 6 * 60;
          const start = new Date(now.getTime() - totalMinutes * 60 * 1000);
          try {
            await historicalDataManager.getHistoricalData(symbol, interval, start, now);
            candles = await historicalDataManager.getRecentData(symbol, interval, limit);
          } catch (e) {
            const count = Math.min(limit || 200, Math.floor(totalMinutes / minutes));
            candles = generateSyntheticCandles({ count, startTime: start, interval, startPrice: 1.1 });
          }
          if (!candles || candles.length === 0) {
            const count = Math.min(limit || 200, Math.floor(totalMinutes / minutes));
            candles = generateSyntheticCandles({ count, startTime: start, interval, startPrice: 1.1 });
          }
        }
      }

      const out = candles.map(c => ({ time: toSeconds(c.time), open: Number(c.open), high: Number(c.high), low: Number(c.low), close: Number(c.close), volume: Number(c.volume || 0) }));
      const result = { symbol, interval, candles: out };
      setCachedData(cacheKey, result);
      return NextResponse.json(result);
    }

    // Crypto via Binance (free, no API key needed)
    let cryptoCandles = [];
    try {
      cryptoCandles = await getBinanceKlines(symbol, interval, limit || 500);
    } catch (err) {
      console.warn('[klines] Binance failed, using synthetic data:', err.message);
      const count = Math.min(limit || 200, 200);
      cryptoCandles = generateSyntheticCandles({ count, interval, startPrice: 50000 }); // BTC price around 50k
    }
    if (interval !== '1m') cryptoCandles = aggregateCandles(cryptoCandles, interval);
    if (limit && cryptoCandles.length > limit) cryptoCandles = cryptoCandles.slice(-limit);
    if (!cryptoCandles || cryptoCandles.length === 0) {
      const count = Math.min(limit || 200, 200);
      cryptoCandles = generateSyntheticCandles({ count, interval, startPrice: 100 });
    }
    const out = cryptoCandles.map(c => ({ time: toSeconds(c.time), open: Number(c.open), high: Number(c.high), low: Number(c.low), close: Number(c.close), volume: Number(c.volume || 0) }));
    const result = { symbol, interval, candles: out };
    setCachedData(cacheKey, result);
    return NextResponse.json(result);
  } catch (err) {
    console.error('[klines] error:', err);
    const errorResult = { error: 'internal server error', details: err.message };
    if (cacheKey) {
      setCachedData(cacheKey, errorResult); // Cache errors too to avoid repeated failures
    }
    return NextResponse.json(errorResult, { status: 500 });
  }
}
