// API Route for Forex Chart Data
// Provides historical and real-time forex data for charts

import { NextResponse } from 'next/server';
import historicalDataManager from '../../../../lib/historicalDataManager.js';
import finnhubService from '../../../../lib/finnhubService.js';

// GET: Fetch forex chart data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const interval = searchParams.get('interval') || '1m';
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = parseInt(searchParams.get('limit')) || 100;

    // Validate required parameters
    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol parameter is required' },
        { status: 400 }
      );
    }

    // Validate interval
    const validIntervals = ['1m', '5m', '15m', '1h', '4h', '1d'];
    if (!validIntervals.includes(interval)) {
      return NextResponse.json(
        { error: `Invalid interval. Valid options: ${validIntervals.join(', ')}` },
        { status: 400 }
      );
    }

    let candles = [];

    if (from && to) {
      // Historical data request with date range
      const startDate = new Date(from);
      const endDate = new Date(to);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)' },
          { status: 400 }
        );
      }

      candles = await historicalDataManager.getHistoricalData(
        symbol,
        interval,
        startDate,
        endDate
      );
    } else {
      // Recent data request
      candles = await historicalDataManager.getRecentData(symbol, interval, limit);
    }

    // Get current price for real-time display
    let currentPrice = null;
    try {
      console.log(`[API] Fetching current price for ${symbol}...`);
      const finnhubSymbol = finnhubService.formatSymbolForFinnhub(symbol);
      console.log(`[API] Finnhub symbol: ${finnhubSymbol}`);
      
      const quote = await finnhubService.getForexQuote(finnhubSymbol);
      console.log(`[API] Quote received:`, quote);
      
      currentPrice = {
        price: quote.current,
        timestamp: new Date(quote.timestamp),
        change: quote.current - quote.previousClose,
        changePercent: ((quote.current - quote.previousClose) / quote.previousClose) * 100
      };
      
      console.log(`[API] Processed current price:`, currentPrice);
    } catch (priceError) {
      console.warn('[API] Live quote failed, using latest candle data:', priceError.message);
      
      // Fallback: Use latest candle data for current price
      if (candles && candles.length > 0) {
        const latestCandle = candles[candles.length - 1];
        const previousCandle = candles.length > 1 ? candles[candles.length - 2] : latestCandle;
        
        // Create more realistic live movement based on time
        const now = Date.now();
        const timeVariation = Math.sin(now / 5000) * 0.0001; // Smooth sine wave movement
        const randomVariation = (Math.random() - 0.5) * 0.0003; // Random movement ±0.03%
        const totalVariation = timeVariation + randomVariation;
        
        const simulatedPrice = Number(latestCandle.close) * (1 + totalVariation);
        
        currentPrice = {
          price: simulatedPrice,
          timestamp: new Date(),
          change: simulatedPrice - Number(previousCandle.close),
          changePercent: ((simulatedPrice - Number(previousCandle.close)) / Number(previousCandle.close)) * 100,
          simulated: true, // Flag to indicate this is simulated
          movement: totalVariation > 0 ? 'up' : 'down' // Movement direction
        };
        
        console.log(`[API] Using simulated live price:`, currentPrice);
      }
    }

    // Calculate some basic statistics
    const stats = candles.length > 0 ? {
      total: candles.length,
      dateRange: {
        start: candles[0].time,
        end: candles[candles.length - 1].time
      },
      priceRange: {
        min: Math.min(...candles.map(c => c.low)),
        max: Math.max(...candles.map(c => c.high))
      }
    } : null;

    return NextResponse.json({
      symbol: symbol,
      interval: interval,
      candles: candles,
      currentPrice: currentPrice,
      stats: stats,
      rateLimitStatus: finnhubService.getRateLimitStatus(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] Error fetching forex chart data:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// POST: Update chart data with new price
export async function POST(request) {
  try {
    const body = await request.json();
    const { symbol, interval = '1m', price, timestamp } = body;

    // Validate required parameters
    if (!symbol || !price) {
      return NextResponse.json(
        { error: 'Symbol and price parameters are required' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    // Update the latest candle
    const result = await historicalDataManager.updateLatestCandle(
      symbol,
      interval,
      price,
      timestamp ? new Date(timestamp) : new Date()
    );

    return NextResponse.json({
      success: true,
      symbol: symbol,
      interval: interval,
      updated: result,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] Error updating chart data:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// PUT: Bulk update historical data
export async function PUT(request) {
  try {
    const body = await request.json();
    const { symbol, interval = '1m', startDate, endDate, forceRefresh = false } = body;

    // Validate required parameters
    if (!symbol || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Symbol, startDate, and endDate parameters are required' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Get data coverage
    const coverage = await historicalDataManager.getDataCoverage(symbol, interval, start, end);
    
    let result = { coverage };

    if (forceRefresh || coverage.gaps.length > 0) {
      // Fill gaps or refresh data
      const fillResults = await historicalDataManager.fillDataGaps(
        symbol, 
        interval, 
        forceRefresh ? [{ start, end }] : coverage.gaps
      );
      
      result.fillResults = fillResults;
    }

    return NextResponse.json({
      success: true,
      symbol: symbol,
      interval: interval,
      result: result,
      rateLimitStatus: finnhubService.getRateLimitStatus(),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[API] Error bulk updating chart data:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
