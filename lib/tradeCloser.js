import prisma from './prisma.js';
import { fetchBatchPrices } from './priceProviders.js';
import { Prisma } from '@prisma/client';
import { updateTournamentStats, updateTournamentStatuses } from './tournamentTracker.js';

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

  // Update tournament statuses every minute
  setInterval(async () => {
    try {
      await updateTournamentStatuses();
    } catch (error) {
      console.error('[tradeCloser] Error updating tournament statuses:', error);
    }
  }, 60000); // Every 60 seconds
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
  const accountType = (trade.account_type || 'live').toLowerCase();

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

  // Prepare trade update payload
  const updateData = {
    status: 'closed',
    result,
    payout: payout > 0 ? payout : null,
    updated_at: new Date()
  };

  // Concurrency-safe, idempotent close: only one runner can transition open->closed
  const balanceField = accountType === 'demo' ? 'demo_balance' : accountType === 'tournament' ? 'tournament_balance' : 'balance';
  const totalReturn = isWin && payout > 0 ? amount + payout : 0;
  const incrementAmount = totalReturn > 0 ? new Prisma.Decimal(totalReturn.toFixed(2)) : null;

  try {
    await prisma.$transaction(async (tx) => {
      // Transition from OPEN to CLOSED atomically; if already closed, count will be 0
      const updated = await tx.trades.updateMany({
        where: { id: trade.id, status: 'open' },
        data: updateData
      });

      if (updated.count === 0) {
        // Already closed by another worker; do nothing
        return;
      }

      // Only credit on win after successful state transition
      if (incrementAmount) {
        await tx.users.update({
          where: { id: trade.user_id },
          data: { [balanceField]: { increment: incrementAmount } }
        });
      }
    });

    if (isWin && payout > 0) {
      console.log(`[tradeCloser] Closed trade ${trade.id}: ${result}, payout: $${payout.toFixed(2)}, returned: $${amount.toFixed(2)}, balance incremented by $${totalReturn.toFixed(2)}`);
    } else {
      console.log(`[tradeCloser] Closed trade ${trade.id}: ${result}, no payout`);
    }

    // Update tournament stats (non-financial) after closure
    await updateTournamentStats(trade.user_id, { ...trade, result, payout: isWin ? payout : 0, amount });
  } catch (error) {
    console.error(`[tradeCloser] Error closing trade ${trade.id} (safe close):`, error);
  }
}