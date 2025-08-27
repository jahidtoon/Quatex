// Forex candle aggregation and storage system
// Handles 1m base candles and aggregates to higher timeframes

import prisma from './prisma.js';
import { fetchForexPrices } from './forexPriceFeed.js';

// Round down to nearest minute bucket for consistent time alignment
function minuteBucket(date) {
  const d = new Date(date);
  d.setSeconds(0, 0);
  return d;
}

// Update or create a 1m candle from price data
export async function updateForexCandle(symbol, price, timestamp = new Date()) {
  const time = minuteBucket(timestamp);
  const priceDecimal = String(price);
  
  try {
    // Try to find existing candle for this minute
    const existing = await prisma.forex_candles.findUnique({
      where: {
        symbol_interval_time: {
          symbol,
          interval: '1m',
          time
        }
      }
    });
    
    if (existing) {
      // Update existing candle (high/low/close)
      await prisma.forex_candles.update({
        where: { id: existing.id },
        data: {
          high: price > Number(existing.high) ? priceDecimal : existing.high,
          low: price < Number(existing.low) ? priceDecimal : existing.low,
          close: priceDecimal,
          updated_at: new Date()
        }
      });
    } else {
      // Create new candle (open=high=low=close=price)
      await prisma.forex_candles.create({
        data: {
          symbol,
          interval: '1m',
          time,
          open: priceDecimal,
          high: priceDecimal,
          low: priceDecimal,
          close: priceDecimal
        }
      });
    }
    
    return true;
  } catch (error) {
    console.warn(`[forex-candles] Update failed for ${symbol}:`, error.message);
    return false;
  }
}

// Aggregate 1m candles to higher timeframes
export async function aggregateForexCandles(symbol, interval, startTime, endTime) {
  const intervalMinutes = getIntervalMinutes(interval);
  if (intervalMinutes <= 1) {
    // For 1m, just return stored data
    return await prisma.forex_candles.findMany({
      where: {
        symbol,
        interval: '1m',
        time: { gte: startTime, lte: endTime }
      },
      orderBy: { time: 'asc' }
    });
  }
  
  // Aggregate 1m candles for higher timeframes
  const oneMinuteCandles = await prisma.forex_candles.findMany({
    where: {
      symbol,
      interval: '1m',
      time: { gte: startTime, lte: endTime }
    },
    orderBy: { time: 'asc' }
  });
  
  if (!oneMinuteCandles.length) return [];
  
  // Group by time buckets
  const buckets = new Map();
  for (const candle of oneMinuteCandles) {
    const bucketTime = getTimeBucket(candle.time, intervalMinutes);
    const key = bucketTime.getTime();
    
    if (!buckets.has(key)) {
      buckets.set(key, {
        symbol,
        interval,
        time: bucketTime,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        created_at: candle.created_at,
        updated_at: candle.updated_at
      });
    } else {
      const bucket = buckets.get(key);
      bucket.high = Math.max(bucket.high, Number(candle.high));
      bucket.low = Math.min(bucket.low, Number(candle.low));
      bucket.close = Number(candle.close); // Latest close
      bucket.updated_at = candle.updated_at;
    }
  }
  
  return Array.from(buckets.values());
}

// Get time bucket for aggregation
function getTimeBucket(time, intervalMinutes) {
  const date = new Date(time);
  
  if (intervalMinutes < 60) {
    // For minutes, round down to nearest interval
    const minutes = Math.floor(date.getMinutes() / intervalMinutes) * intervalMinutes;
    date.setMinutes(minutes, 0, 0);
  } else if (intervalMinutes < 1440) {
    // For hours, round down to nearest hour
    const hours = Math.floor(intervalMinutes / 60);
    const roundedHour = Math.floor(date.getHours() / hours) * hours;
    date.setHours(roundedHour, 0, 0, 0);
  } else {
    // For days, start of day
    date.setHours(0, 0, 0, 0);
  }
  
  return date;
}

// Convert interval string to minutes
function getIntervalMinutes(interval) {
  const map = {
    '1m': 1,
    '5m': 5,
    '15m': 15,
    '30m': 30,
    '1h': 60,
    '4h': 240,
    '1d': 1440
  };
  return map[interval] || 1;
}

// Backfill forex data for testing (simulated historical data)
export async function backfillForexData(symbol, hours = 24) {
  console.log(`[forex-candles] Backfilling ${symbol} for ${hours} hours`);
  
  const now = new Date();
  const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
  
  // Get current price as base
  const prices = await fetchForexPrices([symbol]);
  const currentPrice = prices[symbol];
  
  if (!currentPrice) {
    console.warn(`[forex-candles] No current price for ${symbol}`);
    return;
  }
  
  // Generate simulated historical data
  let price = currentPrice * (0.98 + Math.random() * 0.04); // Start with slight variation
  
  for (let i = 0; i < hours * 60; i++) {
    const timestamp = new Date(startTime.getTime() + i * 60 * 1000);
    
    // Simulate forex price movement (smaller than crypto volatility)
    const change = (Math.random() - 0.5) * 0.002; // ±0.1% per minute max
    price *= (1 + change);
    
    // Keep price within reasonable bounds
    price = Math.max(price, currentPrice * 0.95);
    price = Math.min(price, currentPrice * 1.05);
    
    await updateForexCandle(symbol, price, timestamp);
  }
  
  console.log(`[forex-candles] Backfilled ${hours * 60} candles for ${symbol}`);
}

// Cleanup old forex candles (keep last 30 days)
export async function cleanupOldForexCandles() {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  
  const deleted = await prisma.forex_candles.deleteMany({
    where: {
      time: { lt: cutoff }
    }
  });
  
  console.log(`[forex-candles] Cleaned up ${deleted.count} old candles`);
  return deleted.count;
}
