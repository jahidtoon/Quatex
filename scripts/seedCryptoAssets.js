#!/usr/bin/env node
/**
 * Seed initial crypto_assets for deposit system.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const assets = [
  // Base coins
  { symbol: 'BTC', network: 'bitcoin', display_name: 'Bitcoin', decimals: 8, min_deposit: '0.00005' },
  { symbol: 'ETH', network: 'ethereum', display_name: 'Ethereum', decimals: 18, min_deposit: '0.0005' },
  // USDT variants
  { symbol: 'USDT', network: 'ethereum', display_name: 'Tether USD (ERC20)', contract: 'ERC20-USDT', decimals: 6, min_deposit: '5' },
  { symbol: 'USDT', network: 'tron', display_name: 'Tether USD (TRC20)', contract: 'TRC20-USDT', decimals: 6, min_deposit: '5' },
  // BNB (BSC)
  { symbol: 'BNB', network: 'bsc', display_name: 'BNB (BSC)', decimals: 18, min_deposit: '0.01' },
];

async function main() {
  for (const a of assets) {
    const existing = await prisma.crypto_assets.findFirst({ where: { symbol: a.symbol, network: a.network } });
    if (existing) {
      console.log(`SKIP: ${a.symbol} on ${a.network} already exists`);
      continue;
    }
    await prisma.crypto_assets.create({ data: a });
    console.log(`CREATED: ${a.symbol} on ${a.network}`);
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
