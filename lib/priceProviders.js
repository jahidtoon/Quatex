// Unified price provider abstraction with Forex (primary) + fallback support
// Returns map: { INTERNAL_SYMBOL: priceNumber }

import { fetchForexPrices } from './forexPriceFeed.js';
import { fetchBinancePrices } from './cryptoPriceFeed.js';

// Common crypto base symbol => CoinGecko ID map (extend as needed)
const COINGECKO_IDS = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  BNB: 'binancecoin',
  SOL: 'solana',
  XRP: 'ripple',
  ADA: 'cardano',
  DOGE: 'dogecoin',
  LTC: 'litecoin',
  TRX: 'tron',
  DOT: 'polkadot',
  LINK: 'chainlink',
  MATIC: 'matic-network',
  AVAX: 'avalanche-2',
  SHIB: 'shiba-inu'
};

function coinGeckoId(base) {
  return COINGECKO_IDS[base]; // undefined => unsupported (skip)
}

async function fetchFromCoinGecko(internalSymbols = []) {
  if (!internalSymbols.length) return {};
  // Group by quote (vs_currency)
  const byQuote = new Map();
  for (const sym of internalSymbols) {
    const [base, quote] = sym.split('_');
    const id = coinGeckoId(base);
    if (!id) continue; // skip unknown base
    const list = byQuote.get(quote) || [];
    list.push({ internal: sym, id });
    byQuote.set(quote, list);
  }
  if (!byQuote.size) return {};
  const out = {};
  for (const [quote, arr] of byQuote.entries()) {
    const ids = [...new Set(arr.map(o => o.id))].join(',');
    const vs = quote.toLowerCase();
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(ids)}&vs_currencies=${encodeURIComponent(vs)}`;
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) continue;
      const data = await res.json();
      for (const item of arr) {
        const price = data[item.id]?.[vs];
        if (price !== undefined) out[item.internal] = Number(price);
      }
    } catch (e) {
      console.warn('CoinGecko fetch error', e?.message || e);
    }
  }
  return out;
}

// Fetch with Forex API for forex pairs, Binance for crypto pairs
export async function fetchBatchPrices(internalSymbols = []) {
  if (!internalSymbols.length) return {};
  
  // Separate forex and crypto symbols
  const forexSymbols = [];
  const cryptoSymbols = [];
  
  for (const symbol of internalSymbols) {
    const [base, quote] = symbol.split('_');
    const majorCurrencies = new Set(['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD']);
    
    if (majorCurrencies.has(base) && majorCurrencies.has(quote)) {
      forexSymbols.push(symbol);
    } else {
      cryptoSymbols.push(symbol);
    }
  }
  
  // Fetch prices from appropriate providers
  const results = {};
  
  if (forexSymbols.length > 0) {
    try {
      const forexPrices = await fetchForexPrices(forexSymbols);
      Object.assign(results, forexPrices);
    } catch (e) {
      console.warn('Forex price fetch failed:', e?.message || e);
    }
  }
  
  if (cryptoSymbols.length > 0) {
    try {
      const cryptoPrices = await fetchBinancePrices(cryptoSymbols);
      Object.assign(results, cryptoPrices);
      
      // Fill crypto gaps with CoinGecko fallback
      const missing = cryptoSymbols.filter(s => results[s] === undefined);
      if (missing.length > 0) {
        const fallback = await fetchFromCoinGecko(missing);
        Object.assign(results, fallback);
      }
    } catch (e) {
      console.warn('Crypto price fetch failed:', e?.message || e);
    }
  }
  
  return results;
}

export const _internal = { fetchFromCoinGecko };
