import prisma from '../../../../lib/prisma.js';
import { aggregateForexCandles, backfillForexData } from '../../../../lib/forexCandleStore.js';
import { classifyPair } from '../../../../lib/forexPriceFeed.js';

// Convert frontend interval format to internal format
function normalizeInterval(interval) {
  const map = {
    '1min': '1m',
    '5min': '5m', 
    '15min': '15m',
    '30min': '30m',
    '60min': '1h',
    '240min': '4h',
    'daily': '1d'
  };
  return map[interval] || interval;
}

// GET /api/public/candles?symbol=EUR_USD&interval=1min
// API removed as per request.
