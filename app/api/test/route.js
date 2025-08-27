// Simple API test without external dependencies
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    console.log('[API Test] Simple test endpoint called');
    
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol') || 'EUR_USD';
    
    // Simple test response without Prisma/Finnhub
    const testResponse = {
      status: 'success',
      symbol: symbol,
      message: 'API route is working',
      timestamp: new Date().toISOString(),
      test: true
    };
    
    console.log('[API Test] Sending response:', testResponse);
    
    return NextResponse.json(testResponse);
    
  } catch (error) {
    console.error('[API Test] Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Test API error', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
