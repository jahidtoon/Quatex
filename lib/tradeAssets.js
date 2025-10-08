import prisma from '@/lib/prisma';
import { classifyPair } from '@/lib/forexPriceFeed';

const DEFAULT_CRYPTO_ASSETS = [
  { symbol: 'BTCUSDT', display: 'BTC/USDT', type: 'CRYPTO', payout: 80 },
  { symbol: 'ETHUSDT', display: 'ETH/USDT', type: 'CRYPTO', payout: 78 },
  { symbol: 'BNBUSDT', display: 'BNB/USDT', type: 'CRYPTO', payout: 75 },
  { symbol: 'SOLUSDT', display: 'SOL/USDT', type: 'CRYPTO', payout: 74 },
  { symbol: 'XRPUSDT', display: 'XRP/USDT', type: 'CRYPTO', payout: 72 },
];

export function getDefaultCryptoAssets() {
  return DEFAULT_CRYPTO_ASSETS;
}

export async function listTradableAssets() {
  const pairs = await prisma.currency_pairs.findMany({
    where: { isDeleted: false, status: 'ACTIVE' },
    select: { symbol: true, display: true, payout: true },
    orderBy: { display: 'asc' },
  });

  const forexAssets = pairs.map((pair) => {
    const info = classifyPair(pair.symbol || '');
    return {
      symbol: pair.symbol,
      display: pair.display || pair.symbol?.replace('_', '/') || pair.symbol,
      type: info.type || 'FOREX',
      payout: pair.payout != null ? Number(pair.payout) : 80,
    };
  });

  const cryptoFallback = DEFAULT_CRYPTO_ASSETS.filter(
    (asset) => !forexAssets.some((forex) => forex.symbol === asset.symbol),
  );

  return [...forexAssets, ...cryptoFallback].sort((a, b) => a.display.localeCompare(b.display));
}

export async function findTradableAsset(symbol) {
  if (!symbol) return null;

  if (symbol.includes('_')) {
    const pair = await prisma.currency_pairs.findUnique({
      where: { symbol },
      select: { symbol: true, display: true, payout: true },
    });
    if (pair) {
      const info = classifyPair(pair.symbol || '');
      return {
        symbol: pair.symbol,
        display: pair.display || pair.symbol?.replace('_', '/') || pair.symbol,
        type: info.type || 'FOREX',
        payout: pair.payout != null ? Number(pair.payout) : 80,
      };
    }
  }

  const fallback = DEFAULT_CRYPTO_ASSETS.find((asset) => asset.symbol === symbol);
  if (fallback) {
    return fallback;
  }

  return null;
}
