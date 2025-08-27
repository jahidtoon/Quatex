// Finnhub API Service for Forex Data
// Handles authentication, rate limiting, and data formatting

class FinnhubService {
  constructor() {
    this.apiKey = process.env.FINNHUB_API_KEY || 'demo'; // Use demo for testing
    this.baseUrl = 'https://finnhub.io/api/v1';
    this.rateLimit = {
      calls: 0,
      resetTime: Date.now() + 60000, // Reset every minute
      maxCalls: 60 // Free tier limit
    };
  }

  // Check rate limit before making API calls
  checkRateLimit() {
    const now = Date.now();
    if (now > this.rateLimit.resetTime) {
      this.rateLimit.calls = 0;
      this.rateLimit.resetTime = now + 60000;
    }
    
    if (this.rateLimit.calls >= this.rateLimit.maxCalls) {
      throw new Error('Rate limit exceeded. Please wait before making more requests.');
    }
    
    this.rateLimit.calls++;
  }

  // Get current forex quote
  async getForexQuote(symbol) {
    this.checkRateLimit();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Finnhub forex quote format: { c: current, h: high, l: low, o: open, pc: previous_close, t: timestamp }
      return {
        symbol: symbol,
        current: data.c,
        open: data.o,
        high: data.h,
        low: data.l,
        previousClose: data.pc,
        timestamp: data.t * 1000, // Convert to milliseconds
        source: 'finnhub'
      };
    } catch (error) {
      console.error(`[FinnhubService] Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  // Get historical forex candles
  async getForexCandles(symbol, resolution = '1', from, to) {
    this.checkRateLimit();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/forex/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Check if data is valid
      if (data.s !== 'ok' || !data.t || !data.c || !data.o || !data.h || !data.l) {
        throw new Error('Invalid data received from Finnhub');
      }

      // Convert Finnhub format to our candle format
      const candles = [];
      for (let i = 0; i < data.t.length; i++) {
        candles.push({
          symbol: symbol,
          time: new Date(data.t[i] * 1000), // Convert to Date object
          open: data.o[i],
          high: data.h[i],
          low: data.l[i],
          close: data.c[i],
          volume: data.v ? data.v[i] : 0, // Volume might not be available for forex
          source: 'finnhub'
        });
      }

      return candles;
    } catch (error) {
      console.error(`[FinnhubService] Error fetching candles for ${symbol}:`, error);
      throw error;
    }
  }

  // Convert our internal symbol format (EUR_USD) to Finnhub format
  formatSymbolForFinnhub(internalSymbol) {
    // Finnhub uses format like 'OANDA:EUR_USD' or 'FX:EURUSD'
    // We'll use OANDA format as it's more reliable
    return `OANDA:${internalSymbol}`;
  }

  // Convert Finnhub symbol back to our internal format
  parseSymbolFromFinnhub(finnhubSymbol) {
    return finnhubSymbol.replace('OANDA:', '').replace('FX:', '');
  }

  // Get available forex symbols
  async getForexSymbols() {
    this.checkRateLimit();
    
    try {
      const response = await fetch(
        `${this.baseUrl}/forex/symbol?exchange=oanda&token=${this.apiKey}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Finnhub API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Format symbols for our use
      return data.map(item => ({
        symbol: item.symbol.replace('OANDA:', ''),
        displaySymbol: item.displaySymbol,
        description: item.description
      }));
    } catch (error) {
      console.error('[FinnhubService] Error fetching forex symbols:', error);
      throw error;
    }
  }

  // Get rate limit status
  getRateLimitStatus() {
    const timeUntilReset = Math.max(0, this.rateLimit.resetTime - Date.now());
    return {
      remainingCalls: Math.max(0, this.rateLimit.maxCalls - this.rateLimit.calls),
      totalCalls: this.rateLimit.maxCalls,
      timeUntilReset: timeUntilReset,
      resetTime: new Date(this.rateLimit.resetTime)
    };
  }
}

// Export singleton instance
const finnhubService = new FinnhubService();
export default finnhubService;
