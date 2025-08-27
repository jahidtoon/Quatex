// Free Forex price provider using multiple free APIs
// Primary: Fixer.io (free tier), Fallback: ExchangeRate-API

const FIXER_ENDPOINT = 'https://api.fixer.io/latest';
const EXCHANGERATE_ENDPOINT = 'https://api.exchangerate-api.com/v4/latest';
const RATES_ENDPOINT = 'https://api.exchangerate.host/latest';

// Convert internal symbol format (EUR_USD) to API format
function parseForexSymbol(internalSymbol) {
  const [base, quote] = internalSymbol.split('_');
  return { base, quote };
}

// Try multiple free APIs for better reliability
async function fetchFromMultipleAPIs(baseCurrency, quoteCurrencies) {
  const apis = [
    {
      name: 'ExchangeRate-API',
      url: `${EXCHANGERATE_ENDPOINT}/${baseCurrency}`,
      parseResponse: (data) => data.rates
    },
    {
      name: 'Rates-Host',
      url: `${RATES_ENDPOINT}?base=${baseCurrency}&symbols=${quoteCurrencies.join(',')}`,
      parseResponse: (data) => data.success ? data.rates : null
    }
  ];

  for (const api of apis) {
    try {
      const res = await fetch(api.url, { 
        cache: 'no-store',
        timeout: 5000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!res.ok) continue;
      
      const data = await res.json();
      const rates = api.parseResponse(data);
      
      if (rates && typeof rates === 'object') {
        console.log(`[forex] Success with ${api.name} for ${baseCurrency}`);
        return rates;
      }
    } catch (error) {
      console.warn(`[forex] ${api.name} failed for ${baseCurrency}:`, error.message);
    }
  }
  
  return null;
}

// Batch fetch forex prices for internal symbols; returns { internalSymbol: number }
export async function fetchForexPrices(internalSymbols = []) {
  if (!internalSymbols.length) return {};
  
  const results = {};
  
  // Group by base currency to minimize API calls
  const symbolsByBase = new Map();
  for (const symbol of internalSymbols) {
    const { base, quote } = parseForexSymbol(symbol);
    if (!symbolsByBase.has(base)) {
      symbolsByBase.set(base, []);
    }
    symbolsByBase.get(base).push({ symbol, base, quote });
  }
  
  // Fetch rates for each base currency
  for (const [baseCurrency, symbols] of symbolsByBase.entries()) {
    const quoteCurrencies = symbols.map(s => s.quote);
    const rates = await fetchFromMultipleAPIs(baseCurrency, quoteCurrencies);
    
    if (rates) {
      // Map rates back to internal symbols
      for (const { symbol, quote } of symbols) {
        if (rates[quote] !== undefined) {
          results[symbol] = Number(rates[quote]);
        }
      }
    }
  }
  
  return results;
}

// Classification for forex pairs
const MAJOR_CURRENCIES = new Set(['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'NZD']);
const CRYPTO_CURRENCIES = new Set(['BTC', 'ETH', 'USDT', 'USDC', 'BNB']);

export function classifyPair(symbol) {
  const [base, quote] = symbol.split('_');
  
  // Forex pairs (both currencies are fiat)
  if (MAJOR_CURRENCIES.has(base) && MAJOR_CURRENCIES.has(quote)) {
    return { type: 'FOREX', base, quote };
  }
  
  // Crypto pairs
  if (CRYPTO_CURRENCIES.has(base) || CRYPTO_CURRENCIES.has(quote)) {
    return { type: 'CRYPTO', base, quote };
  }
  
  return { type: 'OTHER', base, quote };
}

export function isForexPair(p) { 
  return classifyPair(p.symbol).type === 'FOREX'; 
}

export function isForexSymbol(symbol) { 
  return classifyPair(symbol).type === 'FOREX'; 
}

// Validate forex symbol against supported currencies
export async function validateForexSymbol(internalSymbol) {
  try {
    const { base, quote } = parseForexSymbol(internalSymbol);
    
    // Check if both currencies are supported
    if (!MAJOR_CURRENCIES.has(base) || !MAJOR_CURRENCIES.has(quote)) {
      return false;
    }
    
    // Test with API to confirm availability
    const url = `${EXCHANGERATES_ENDPOINT}/latest?base=${base}&symbols=${quote}`;
    const res = await fetch(url, { cache: 'no-store' });
    
    if (!res.ok) return false;
    
    const data = await res.json();
    return data.success && data.rates && data.rates[quote] !== undefined;
    
  } catch (error) {
    console.warn('validateForexSymbol error:', error.message);
    return false;
  }
}

// Format forex price with appropriate decimals
export function formatForexPrice(num, decimalsOverride) {
  if (typeof decimalsOverride === 'number' && decimalsOverride >= 0 && decimalsOverride <= 10) {
    return Number(num.toFixed(decimalsOverride));
  }
  
  // Most forex pairs use 4-5 decimal places
  // JPY pairs typically use 2-3 decimal places
  if (num < 1) return Number(num.toFixed(5));
  if (num < 10) return Number(num.toFixed(4));
  if (num < 100) return Number(num.toFixed(4));
  return Number(num.toFixed(2)); // For JPY pairs
}

// Get historical forex data (limited free tier)
export async function fetchForexHistorical(symbol, date) {
  try {
    const { base, quote } = parseForexSymbol(symbol);
    const url = `${EXCHANGERATES_ENDPOINT}/${date}?base=${base}&symbols=${quote}`;
    
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    
    const data = await res.json();
    if (!data.success || !data.rates || !data.rates[quote]) return null;
    
    return Number(data.rates[quote]);
  } catch (error) {
    console.warn(`[forex] Historical data error for ${symbol}:`, error.message);
    return null;
  }
}
