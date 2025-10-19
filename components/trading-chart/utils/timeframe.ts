// @ts-nocheck
// Utilities for timeframe bucket sizes

export type Tf = '5s' | '10s' | '15s' | '30s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export function getBucketSeconds(tf: Tf): number {
  switch (tf) {
    case '5s': return 5;
    case '10s': return 10;
    case '15s': return 15;
    case '30s': return 30;
    case '1m': return 60;
    case '5m': return 60 * 5;
    case '15m': return 60 * 15;
    case '1h': return 60 * 60;
    case '4h': return 60 * 60 * 4;
    case '1d': return 60 * 60 * 24;
    default: return 60;
  }
}
