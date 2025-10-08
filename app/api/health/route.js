import { NextResponse } from 'next/server';
import { startPriceUpdater } from '@/lib/priceUpdater';
import { startTradeCloser } from '@/lib/tradeCloser';

// Start background processes on first health check
let initialized = false;

function initializeBackgroundProcesses() {
  if (initialized) return;
  initialized = true;

  try {
    startPriceUpdater();
    startTradeCloser();
    console.log('[health] Background processes started');
  } catch (error) {
    console.error('[health] Failed to start background processes:', error);
  }
}

export async function GET() {
  initializeBackgroundProcesses();
  return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
