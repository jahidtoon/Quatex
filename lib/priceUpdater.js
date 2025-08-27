import prisma from './prisma.js';
import { isForexPair, formatForexPrice, classifyPair } from './forexPriceFeed.js';
import { updateForexCandle } from './forexCandleStore.js';
import { fetchBatchPrices } from './priceProviders.js';

let started = false;

export function startPriceUpdater() {
  if (started) return;
  started = true;
  setInterval(async () => {
    try {
      const pairs = await prisma.currency_pairs.findMany({ where: { status: 'ACTIVE', isDeleted: false } });
      if (!pairs.length) return;

      // Separate forex and crypto pairs
      const forexPairs = pairs.filter(p => {
        const cls = classifyPair(p.symbol);
        return cls.type === 'FOREX';
      });
      
      const cryptoPairs = pairs.filter(p => {
        const cls = classifyPair(p.symbol);
        if (cls.type !== 'CRYPTO') return false;
        // Only attempt external fetch for crypto pairs where provider is BINANCE or COINGECKO (or auto / undefined)
        if (!p.provider || p.provider === 'BINANCE' || p.provider === 'COINGECKO') return true;
        return false;
      });

      let priceMap = {};
      const allPairs = [...forexPairs, ...cryptoPairs];
      
      if (allPairs.length) {
        try {
          priceMap = await fetchBatchPrices(allPairs.map(p => p.symbol));
        } catch (e) {
          console.warn('[priceUpdater] Provider batch fetch failed, drift fallback. Reason:', e?.message || e);
        }
      }

      const now = new Date();
      const ops = [];
      
      for (const p of pairs) {
        let next;
        const classification = classifyPair(p.symbol);
        
        if (priceMap[p.symbol] !== undefined) {
          // Use real price from API
          if (classification.type === 'FOREX') {
            next = formatForexPrice(priceMap[p.symbol], p.price_decimals ?? undefined);
          } else {
            // Fallback for any crypto pairs
            next = Number(priceMap[p.symbol].toFixed(p.price_decimals || 4));
          }
        } else {
          // Simulate price movement for pairs without real data
          const basePrice = p.latest_price ? parseFloat(p.latest_price) : Math.random() * 1 + 0.5;
          
          // Forex has lower volatility than crypto
          const volatility = classification.type === 'FOREX' ? 0.0005 : 0.0015;
          const drift = (Math.random() - 0.5) * (basePrice * volatility);
          const tmp = +(basePrice + drift);
          
          if (classification.type === 'FOREX') {
            next = formatForexPrice(tmp, p.price_decimals ?? undefined);
          } else {
            next = Number(tmp.toFixed(p.price_decimals || 4));
          }
        }
        
        ops.push(
          prisma.currency_pairs.update({ 
            where: { id: p.id }, 
            data: { latest_price: next, last_updated: now } 
          }).then(() => {
            // Store candle data based on pair type
            if (classification.type === 'FOREX') {
              updateForexCandle(p.symbol, Number(next), now).catch(() => {});
            }
            // Note: crypto candle storage removed as per user request
          })
        );
      }
      
      await Promise.allSettled(ops);
    } catch (e) {
      console.error('Price updater error', e);
    }
  }, 5000); // every 5s
}
