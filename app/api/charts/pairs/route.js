import { NextResponse } from 'next/server';

// Get available trading pairs from Binance
export async function GET() {
  try {
    // Fetch exchange info from Binance
    const response = await fetch(
      'https://api.binance.com/api/v3/exchangeInfo',
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch exchange info');
    }

    const data = await response.json();

    // Filter for popular USDT pairs only
    const popularBases = ['BTC', 'ETH', 'BNB', 'ADA', 'XRP', 'SOL', 'DOGE', 'DOT', 'LINK', 'LTC', 'BCH', 'UNI', 'AVAX', 'MATIC'];
    
    const usdtPairs = data.symbols
      .filter(symbol => 
        symbol.quoteAsset === 'USDT' && 
        popularBases.includes(symbol.baseAsset) &&
        symbol.status === 'TRADING'
      )
      .map(symbol => ({
        symbol: symbol.symbol,
        baseAsset: symbol.baseAsset,
        quoteAsset: symbol.quoteAsset,
        display: `${symbol.baseAsset}/${symbol.quoteAsset}`,
        status: symbol.status
      }))
      .sort((a, b) => {
        // Sort by popularity (BTC first, then ETH, etc.)
        const order = ['BTC', 'ETH', 'BNB', 'ADA', 'XRP', 'SOL', 'DOGE', 'DOT', 'LINK', 'LTC'];
        return order.indexOf(a.baseAsset) - order.indexOf(b.baseAsset);
      });

    return NextResponse.json({
      pairs: usdtPairs,
      count: usdtPairs.length
    });

  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trading pairs' },
      { status: 500 }
    );
  }
}
