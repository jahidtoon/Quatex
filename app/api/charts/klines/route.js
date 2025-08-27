import { NextResponse } from 'next/server';

// Binance API proxy to avoid CORS issues
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const interval = searchParams.get('interval') || '1m';
  const limit = searchParams.get('limit') || '100';

  if (!symbol) {
    return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
  }

  try {
    // Fetch candlestick data from Binance
    const klineResponse = await fetch(
      `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { cache: 'no-store' }
    );

    if (!klineResponse.ok) {
      throw new Error('Failed to fetch kline data');
    }

    const klineData = await klineResponse.json();

    // Fetch current ticker data
    const tickerResponse = await fetch(
      `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`,
      { cache: 'no-store' }
    );

    const tickerData = tickerResponse.ok ? await tickerResponse.json() : null;

    // Format the data
    const formattedData = klineData.map(candle => ({
      time: candle[0],
      open: parseFloat(candle[1]),
      high: parseFloat(candle[2]),
      low: parseFloat(candle[3]),
      close: parseFloat(candle[4]),
      volume: parseFloat(candle[5])
    }));

    return NextResponse.json({
      symbol,
      interval,
      data: formattedData,
      ticker: tickerData ? {
        currentPrice: parseFloat(tickerData.lastPrice),
        change: parseFloat(tickerData.priceChange),
        changePercent: parseFloat(tickerData.priceChangePercent),
        volume: parseFloat(tickerData.volume),
        high24h: parseFloat(tickerData.highPrice),
        low24h: parseFloat(tickerData.lowPrice)
      } : null
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
}
