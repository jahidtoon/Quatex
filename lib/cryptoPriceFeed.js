// Lightweight crypto price helpers – Binance public API (primary) utilities
// For few symbols polling REST every 5s is OK. For many symbols or lower latency, move to WebSocket streaming or websockets.

const BINANCE_ENDPOINT = 'https://api.binance.com/api/v3/ticker/price';

// Internal stored symbol uses BASE_QUOTE (e.g. BTC_USDT) -> Binance wants BTCUSDT
function toBinanceSymbol(internalSymbol) {
  return internalSymbol.replace('_', '');
}

// Batch fetch prices for internal symbols; returns { internalSymbol: number }
export async function fetchBinancePrices(internalSymbols = []) {
  if (!internalSymbols.length) return {};
  const binanceSymbols = internalSymbols.map(toBinanceSymbol);
  
  // Helper function for fetch with timeout
  const fetchWithTimeout = async (url, options = {}, timeoutMs = 5000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
  };
  
  // Try batch request first
  try {
    const url = BINANCE_ENDPOINT + '?symbols=' + encodeURIComponent(JSON.stringify(binanceSymbols));
    const res = await fetchWithTimeout(url, { cache: 'no-store' }, 5000);
    
    if (res.ok) {
      const data = await res.json();
      const out = {};
      for (const row of data) {
        const idx = binanceSymbols.indexOf(row.symbol);
        if (idx !== -1 && row.price !== undefined) {
          out[internalSymbols[idx]] = Number(row.price);
        }
      }
      return out;
    }
    
    // If batch fails with 400, it might be due to invalid symbols
    if (res.status === 400) {
      rateLimitedLog('[binance] batch 400, falling back per-symbol');
    } else {
      rateLimitedLog(`[binance] batch failed with status ${res.status}`);
    }
  } catch (e) {
    rateLimitedLog('[binance] batch error: ' + (e?.message || e));
  }
  
  // Fallback: try individual requests with rate limiting
  const out = {};
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
  for (let i = 0; i < binanceSymbols.length; i++) {
    try {
      const sym = binanceSymbols[i];
      const r = await fetchWithTimeout(
        BINANCE_ENDPOINT + '?symbol=' + sym, 
        { cache: 'no-store' }, 
        3000
      );
      
      if (r.ok) {
        const j = await r.json();
        if (j.price !== undefined) {
          out[internalSymbols[i]] = Number(j.price);
        }
      } else if (r.status === 400) {
        // Symbol not found, skip silently
        continue;
      } else {
        rateLimitedLog(`[binance] individual request failed for ${sym}: ${r.status}`);
      }
      
      // Small delay between requests to avoid rate limits
      if (i < binanceSymbols.length - 1) {
        await delay(50); // 50ms delay
      }
    } catch (e) {
      rateLimitedLog(`[binance] individual request error for ${binanceSymbols[i]}: ${e?.message || e}`);
    }
  }
  
  return out;
}

// Classification sets
const STABLE_QUOTES = new Set(['USDT','USDC','BUSD']); // primary stablecoins
const CRYPTO_BASES = new Set(['BTC','ETH','BNB','SOL','XRP','ADA','DOGE','LTC','TRX','DOT','LINK','MATIC','AVAX','SHIB']);
const FIAT_CODES = new Set(['USD','EUR','GBP','JPY','CHF','AUD','CAD','NZD','CNY']);

export function classifyPair(symbol) {
  const [base, quote] = symbol.split('_');
  if (CRYPTO_BASES.has(base) && (STABLE_QUOTES.has(quote) || CRYPTO_BASES.has(quote))) return { type: 'CRYPTO', base, quote };
  if (FIAT_CODES.has(base) && FIAT_CODES.has(quote)) return { type: 'FOREX', base, quote };
  return { type: 'OTHER', base, quote };
}

export function isCryptoPair(p) { return classifyPair(p.symbol).type === 'CRYPTO'; }
export function isCryptoSymbol(symbol) { return classifyPair(symbol).type === 'CRYPTO'; }

// In-memory validation cache to reduce repeated exchangeInfo lookups
const VALIDATE_CACHE = new Map(); // binanceSymbol -> { ok, ts }
const VALIDATE_TTL_MS = 10 * 60 * 1000; // 10 minutes
let lastErrorLog = 0;
function rateLimitedLog(msg) {
  const now = Date.now();
  if (now - lastErrorLog > 60000) { // 1 minute window
    console.warn(msg);
    lastErrorLog = now;
  }
}

// Validate a single internal symbol against Binance exchange info (e.g. BTC_USDT -> BTCUSDT)
export async function validateBinanceSymbol(internalSymbol) {
  try {
    if (!internalSymbol) return false;
    const binSym = internalSymbol.replace('_', '');
    const now = Date.now();
    const cached = VALIDATE_CACHE.get(binSym);
    if (cached && (now - cached.ts) < VALIDATE_TTL_MS) return cached.ok;
    const url = 'https://api.binance.com/api/v3/exchangeInfo?symbol=' + encodeURIComponent(binSym);
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) {
      VALIDATE_CACHE.set(binSym, { ok: false, ts: now });
      return false;
    }
    const data = await res.json();
    const ok = Array.isArray(data.symbols) ? data.symbols.length > 0 : !!data.symbol;
    VALIDATE_CACHE.set(binSym, { ok, ts: now });
    return ok;
  } catch (e) {
    console.warn('validateBinanceSymbol error', e?.message || e);
    return false;
  }
}

export function formatCryptoPrice(num, decimalsOverride) {
  if (typeof decimalsOverride === 'number' && decimalsOverride >= 0 && decimalsOverride <= 10) {
    return Number(num.toFixed(decimalsOverride));
  }
  if (num >= 100) return Number(num.toFixed(2));
  if (num >= 1) return Number(num.toFixed(4));
  return Number(num.toFixed(6));
}
