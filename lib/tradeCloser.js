import prisma from './prisma.js';
import { fetchBatchPrices } from './priceProviders.js';
import { Prisma } from '@prisma/client';

let tradeCloserStarted = false;

export function startTradeCloser() {
  if (tradeCloserStarted) return;
  tradeCloserStarted = true;

  // Check for trades to close every 10 seconds
  setInterval(async () => {
    try {
      await closeExpiredTrades();
    } catch (error) {
      console.error('[tradeCloser] Error closing trades:', error);
    }
  }, 10000);
}

async function closeExpiredTrades() {
  const now = new Date();

  // Find all open trades that have expired
  const expiredTrades = await prisma.trades.findMany({
    where: {
      status: 'open',
      close_time: {
        lte: now
      }
    },
    include: {
      users: true
    }
  });

  if (expiredTrades.length === 0) return;

  console.log(`[tradeCloser] Found ${expiredTrades.length} expired trades to close`);

  // Get unique symbols to fetch current prices
  const symbols = [...new Set(expiredTrades.map(trade => trade.symbol))];

  // Fetch current prices
  let priceMap = {};
  try {
    priceMap = await fetchBatchPrices(symbols);
  } catch (error) {
    console.warn('[tradeCloser] Failed to fetch prices for closing trades:', error.message);
    // Use last known prices from currency_pairs as fallback
    const pairs = await prisma.currency_pairs.findMany({
      where: {
        symbol: { in: symbols }
      },
      select: {
        symbol: true,
        latest_price: true
      }
    });

    pairs.forEach(pair => {
      if (pair.latest_price) {
        priceMap[pair.symbol] = Number(pair.latest_price);
      }
    });
  }

  // Process each expired trade
  for (const trade of expiredTrades) {
    try {
      await closeTrade(trade, priceMap[trade.symbol]);
    } catch (error) {
      console.error(`[tradeCloser] Error closing trade ${trade.id}:`, error);
    }
  }
}

async function closeTrade(trade, closingPrice) {
  const entryPrice = Number(trade.entry_price);
  const direction = trade.direction; // 'BUY' or 'SELL'
  const amount = Number(trade.amount);
  const accountType = trade.account_type || 'live';

  // If we don't have a closing price, skip this trade
  if (!closingPrice || !Number.isFinite(closingPrice)) {
    console.warn(`[tradeCloser] No closing price for trade ${trade.id}, skipping`);
    return;
  }

  // Calculate profit/loss
  let isWin = false;
  let payout = 0;

  if (direction === 'BUY') {
    // BUY wins if closing price > entry price
    isWin = closingPrice > entryPrice;
  } else if (direction === 'SELL') {
    // SELL wins if closing price < entry price
    isWin = closingPrice < entryPrice;
  }

  // Calculate payout based on asset's payout percentage
  if (isWin) {
    // Get payout percentage from currency_pairs
    const pair = await prisma.currency_pairs.findUnique({
      where: { symbol: trade.symbol },
      select: { payout: true }
    });

    const payoutPercent = pair?.payout ? Number(pair.payout) : 80; // Default 80%
    payout = (amount * payoutPercent) / 100;
  }

  const result = isWin ? 'win' : 'loss';

  // Update trade
  const updateData = {
    status: 'closed',
    result,
    payout: payout > 0 ? payout : null,
    updated_at: new Date()
  };

  // Update user balance if they won
  if (isWin && payout > 0) {
    const balanceField = accountType === 'demo' ? 'demo_balance' : 'balance';
    const incrementAmount = new Prisma.Decimal(payout.toFixed(2));

    try {
      await prisma.$transaction([
        prisma.trades.update({
          where: { id: trade.id },
          data: updateData
        }),
        prisma.users.update({
          where: { id: trade.user_id },
          data: {
            [balanceField]: {
              increment: incrementAmount
            }
          }
        })
      ]);

      console.log(`[tradeCloser] Closed trade ${trade.id}: ${result}, payout: $${payout.toFixed(2)}, balance updated`);
    } catch (error) {
      console.error(`[tradeCloser] Error updating balance for trade ${trade.id}:`, error);
      // Still update the trade even if balance update fails
      await prisma.trades.update({
        where: { id: trade.id },
        data: updateData
      });
    }
  } else {
    await prisma.trades.update({
      where: { id: trade.id },
      data: updateData
    });

    console.log(`[tradeCloser] Closed trade ${trade.id}: ${result}, no payout`);
  }
}