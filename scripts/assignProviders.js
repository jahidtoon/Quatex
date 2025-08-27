#!/usr/bin/env node
import prisma from '../lib/prisma.js';
import { classifyPair } from '../lib/cryptoPriceFeed.js';

async function main() {
  const pairs = await prisma.currency_pairs.findMany({});
  let updated = 0;
  for (const p of pairs) {
    if (p.provider) continue;
    const cls = classifyPair(p.symbol);
    let provider = 'SIMULATED';
    if (cls.type === 'CRYPTO') provider = 'BINANCE';
    else if (cls.type === 'FOREX') provider = 'ALPHAVANTAGE';
    let provider_symbol = p.symbol;
    if (provider === 'BINANCE') provider_symbol = p.symbol.replace('_','');
    await prisma.currency_pairs.update({ where: { id: p.id }, data: { provider, provider_symbol } });
    updated++;
  }
  console.log(`Updated ${updated} pairs with provider assignments.`);
  process.exit(0);
}
main().catch(e=>{ console.error(e); process.exit(1); });
