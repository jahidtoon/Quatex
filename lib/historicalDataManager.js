// Historical Data Manager
// Manages historical forex data fetching, storage, and gap detection

import prisma from './prisma.js';
import finnhubService from './finnhubService.js';

class HistoricalDataManager {
  constructor() {
    this.maxBatchSize = 1000; // Maximum candles to fetch in one request
    this.timeframeMapping = {
      '1m': { resolution: '1', minutes: 1 },
      '5m': { resolution: '5', minutes: 5 },
      '15m': { resolution: '15', minutes: 15 },
      '1h': { resolution: '60', minutes: 60 },
      '4h': { resolution: '240', minutes: 240 },
      '1d': { resolution: 'D', minutes: 1440 }
    };
  }

  // Check what data we have in database for a symbol and timeframe
  async getDataCoverage(symbol, interval, startDate, endDate) {
    try {
      const existingCandles = await prisma.forex_candles.findMany({
        where: {
          symbol: symbol,
          interval: interval,
          time: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          time: true
        },
        orderBy: {
          time: 'asc'
        }
      });

      return {
        totalCandles: existingCandles.length,
        dateRange: existingCandles.length > 0 ? {
          start: existingCandles[0].time,
          end: existingCandles[existingCandles.length - 1].time
        } : null,
        gaps: this.detectDataGaps(existingCandles.map(c => c.time), interval, startDate, endDate)
      };
    } catch (error) {
      console.error('[HistoricalDataManager] Error checking data coverage:', error);
      throw error;
    }
  }

  // Detect gaps in historical data
  detectDataGaps(existingTimes, interval, startDate, endDate) {
    if (existingTimes.length === 0) {
      return [{ start: startDate, end: endDate }];
    }

    const intervalMinutes = this.timeframeMapping[interval]?.minutes || 1;
    const intervalMs = intervalMinutes * 60 * 1000;
    const gaps = [];

    // Sort times to ensure proper order
    const sortedTimes = existingTimes.sort((a, b) => a.getTime() - b.getTime());

    // Check gap before first candle
    const firstTime = sortedTimes[0].getTime();
    if (startDate.getTime() < firstTime - intervalMs) {
      gaps.push({
        start: startDate,
        end: new Date(firstTime - intervalMs)
      });
    }

    // Check gaps between candles
    for (let i = 0; i < sortedTimes.length - 1; i++) {
      const currentTime = sortedTimes[i].getTime();
      const nextTime = sortedTimes[i + 1].getTime();
      const expectedNextTime = currentTime + intervalMs;

      if (nextTime > expectedNextTime + intervalMs) {
        gaps.push({
          start: new Date(expectedNextTime),
          end: new Date(nextTime - intervalMs)
        });
      }
    }

    // Check gap after last candle
    const lastTime = sortedTimes[sortedTimes.length - 1].getTime();
    if (endDate.getTime() > lastTime + intervalMs) {
      gaps.push({
        start: new Date(lastTime + intervalMs),
        end: endDate
      });
    }

    return gaps;
  }

  // Fill data gaps by fetching from Finnhub
  async fillDataGaps(symbol, interval, gaps) {
    const results = [];
    
    for (const gap of gaps) {
      try {
        console.log(`[HistoricalDataManager] Filling gap for ${symbol} ${interval}: ${gap.start} to ${gap.end}`);
        
        const finnhubSymbol = finnhubService.formatSymbolForFinnhub(symbol);
        const resolution = this.timeframeMapping[interval]?.resolution || '1';
        
        // Convert dates to Unix timestamps
        const fromTimestamp = Math.floor(gap.start.getTime() / 1000);
        const toTimestamp = Math.floor(gap.end.getTime() / 1000);
        
        // Fetch data from Finnhub
        const candles = await finnhubService.getForexCandles(
          finnhubSymbol,
          resolution,
          fromTimestamp,
          toTimestamp
        );

        if (candles.length > 0) {
          // Store candles in database
          const storedCandles = await this.storeCandles(symbol, interval, candles);
          results.push({
            gap: gap,
            candlesFetched: candles.length,
            candlesStored: storedCandles.length
          });
        }

        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1100)); // 1.1 seconds
        
      } catch (error) {
        console.error(`[HistoricalDataManager] Error filling gap for ${symbol}:`, error);
        results.push({
          gap: gap,
          error: error.message
        });
      }
    }

    return results;
  }

  // Store candles in database
  async storeCandles(symbol, interval, candles) {
    try {
      const candleData = candles.map(candle => ({
        symbol: symbol,
        interval: interval,
        time: candle.time,
        open: String(candle.open),
        high: String(candle.high),
        low: String(candle.low),
        close: String(candle.close)
      }));

      // Use upsert to handle potential duplicates
      const operations = candleData.map(candle => 
        prisma.forex_candles.upsert({
          where: {
            symbol_interval_time: {
              symbol: candle.symbol,
              interval: candle.interval,
              time: candle.time
            }
          },
          update: {
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            updated_at: new Date()
          },
          create: candle
        })
      );

      const results = await prisma.$transaction(operations);
      return results;
    } catch (error) {
      console.error('[HistoricalDataManager] Error storing candles:', error);
      throw error;
    }
  }

  // Get historical data ensuring all gaps are filled
  async getHistoricalData(symbol, interval, startDate, endDate) {
    try {
      // First check what data we have
      const coverage = await this.getDataCoverage(symbol, interval, startDate, endDate);
      
      // Fill any gaps if they exist
      if (coverage.gaps.length > 0) {
        console.log(`[HistoricalDataManager] Found ${coverage.gaps.length} gaps for ${symbol} ${interval}`);
        await this.fillDataGaps(symbol, interval, coverage.gaps);
      }

      // Now fetch the complete data from database
      const candles = await prisma.forex_candles.findMany({
        where: {
          symbol: symbol,
          interval: interval,
          time: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: {
          time: 'asc'
        }
      });

      return candles.map(candle => ({
        time: candle.time,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close)
      }));
    } catch (error) {
      console.error('[HistoricalDataManager] Error getting historical data:', error);
      throw error;
    }
  }

  // Get recent data for real-time updates
  async getRecentData(symbol, interval, limit = 100) {
    try {
      const candles = await prisma.forex_candles.findMany({
        where: {
          symbol: symbol,
          interval: interval
        },
        orderBy: {
          time: 'desc'
        },
        take: limit
      });

      return candles.reverse().map(candle => ({
        time: candle.time,
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close)
      }));
    } catch (error) {
      console.error('[HistoricalDataManager] Error getting recent data:', error);
      throw error;
    }
  }

  // Update latest candle with new price data
  async updateLatestCandle(symbol, interval, price, timestamp = new Date()) {
    try {
      const roundedTime = this.roundTimeToInterval(timestamp, interval);
      const priceStr = String(price);
      // We cannot compute high/low without existing row; so attempt transactional logic:
      // 1. Try update first (optimistic) using conditional high/low via query of existing
      const existing = await prisma.forex_candles.findUnique({
        where: { symbol_interval_time: { symbol, interval, time: roundedTime } }
      });
      if (!existing) {
        await prisma.forex_candles.create({
          data: { symbol, interval, time: roundedTime, open: priceStr, high: priceStr, low: priceStr, close: priceStr }
        });
      } else {
        const newHigh = price > Number(existing.high) ? priceStr : existing.high;
        const newLow = price < Number(existing.low) ? priceStr : existing.low;
        await prisma.forex_candles.update({
          where: { id: existing.id },
            data: { high: newHigh, low: newLow, close: priceStr, updated_at: new Date() }
        });
      }
      return { success: true, time: roundedTime, price };
    } catch (error) {
      console.error('[HistoricalDataManager] Error updating latest candle:', error);
      throw error;
    }
  }

  // Round time to interval boundary
  roundTimeToInterval(timestamp, interval) {
    const date = new Date(timestamp);
    const minutes = this.timeframeMapping[interval]?.minutes || 1;
    
    // Round down to the nearest interval
    date.setSeconds(0, 0);
    const currentMinutes = date.getMinutes();
    const roundedMinutes = Math.floor(currentMinutes / minutes) * minutes;
    date.setMinutes(roundedMinutes);
    
    return date;
  }
}

// Export singleton instance
const historicalDataManager = new HistoricalDataManager();
export default historicalDataManager;
