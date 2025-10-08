#!/usr/bin/env node
/**
 * Deposit watcher (MVP skeleton):
 * -            if (isLate) {
              // For late payments, mark as FAILED - don't credit
              await prisma.deposit_sessions.update({ where: { id: s.id }, data: { status: 'FAILED', detected_amount: String(bal), confirmations: 1, is_late: true } });
              console.log('Late ETH detected (marked as FAILED)', s.id, 'amountETH=', bal);
            } else { active deposit_sessions (stat            if (isLate) {
              // For late payments, mark as FAILED - don't credit
              await prisma.deposit_sessions.update({ where: { id: s.id }, data: { status: 'FAILED', detected_amount: String(bal), confirmations: 1, is_late: true } });
              console.log('Late BSC detected (marked as FAILED)', s.id, 'amountBNB=', bal);
            } else {NDING/DETECTED, not expired)
 * - Placeholder: randomly mark some as DETECTED/CONFIRMED for testing
 * Replace logic with real blockchain API calls later.
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
const { PrismaClient } = require('@prisma/client');
const { ethers } = require('ethers');
const prisma = new PrismaClient();

const DRY_RUN = process.env.DRY_RUN === '1';
const SIMULATE = process.env.WATCHER_SIMULATE === '1'; // enable demo simulation only when explicitly set

async function simulateDetection(session) {
  // 30% chance detect
  if (Math.random() < 0.3 && !session.detected_amount) {
    return { detected_amount: '0.001', status: 'DETECTED', confirmations: 0 };
  }
  // If detected, 50% chance to confirm
  if (session.status === 'DETECTED' && Math.random() < 0.5) {
    return { status: 'CONFIRMED', confirmations: session.min_confirmations, detected_amount: session.detected_amount || '0.001' };
  }
  return null;
}

async function processSessions() {
  const now = new Date();
  const sessions = await prisma.deposit_sessions.findMany({
    where: {
      OR: [ { status: 'PENDING' }, { status: 'DETECTED' } ],
      expires_at: { gt: new Date(now.getTime() - 60 * 60 * 1000) }, // keep an hour window
    },
    take: 25,
  });

  for (const s of sessions) {
    // Try real ETH detection if RPC available
    try {
      const asset = await prisma.crypto_assets.findUnique({ where: { id: s.crypto_asset_id } });
      if (asset && asset.network === 'ethereum' && process.env.RPC_ETH) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_ETH);
        const balWei = await provider.getBalance(s.address);
        const bal = parseFloat(ethers.utils.formatEther(balWei));
        if (bal > 0) {
          const isLate = now > s.expires_at;
          let usdPer = 0;
          try {
            const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
            if (cgRes.ok) { const js = await cgRes.json(); usdPer = js?.ethereum?.usd || 0; }
          } catch (e) {}
          const creditUsd = usdPer > 0 ? bal * usdPer : 10;
          if (!DRY_RUN) {
            await prisma.$transaction(async (tx) => {
              await tx.deposit_sessions.update({ where: { id: s.id }, data: { status: isLate ? 'LATE_CONFIRMED' : 'CONFIRMED', detected_amount: String(bal), confirmations: 1, is_late: isLate } });
              await tx.wallet_ledger.create({ data: { user_id: s.user_id, type: 'DEPOSIT', asset: 'USD', amount: creditUsd, meta: { sessionId: s.id, network: 'ethereum', amount_eth: bal, usd_per_eth: usdPer, late: isLate } } });
              await tx.users.update({ where: { id: s.user_id }, data: { balance: { increment: creditUsd } } });
            });
            console.log((isLate ? 'Late ' : '') + 'ETH confirmed & credited', s.id, 'amountETH=', bal, 'creditUSD=', creditUsd.toFixed(2));
          }
          continue;
        }
      }
    } catch (e) { console.log('ETH detect error for session', s.id, e.message); }

    // Try real BSC (BNB) detection first if RPC available
    try {
      const asset = await prisma.crypto_assets.findUnique({ where: { id: s.crypto_asset_id } });
      if (asset && asset.network === 'bsc' && process.env.RPC_BSC) {
        const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_BSC);
        const balWei = await provider.getBalance(s.address);
        const bal = parseFloat(ethers.utils.formatEther(balWei));
        if (bal > 0) {
          const isLate = now > s.expires_at;
          // Fetch USD price for BNB outside transaction
          let usdPerBnb = 0;
          try {
            const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd');
            if (cgRes.ok) {
              const js = await cgRes.json();
              usdPerBnb = js?.binancecoin?.usd || 0;
            }
          } catch (e) { /* ignore price fetch error */ }
          const creditUsd = usdPerBnb > 0 ? bal * usdPerBnb : 10; // fallback $10
          if (!DRY_RUN) {
            await prisma.$transaction(async (tx) => {
              await tx.deposit_sessions.update({ where: { id: s.id }, data: { status: isLate ? 'LATE_CONFIRMED' : 'CONFIRMED', detected_amount: String(bal), confirmations: 1, is_late: isLate } });
              await tx.wallet_ledger.create({ data: { user_id: s.user_id, type: 'DEPOSIT', asset: 'USD', amount: creditUsd, meta: { sessionId: s.id, network: 'bsc', amount_bnb: bal, usd_per_bnb: usdPerBnb, late: isLate } } });
              await tx.users.update({ where: { id: s.user_id }, data: { balance: { increment: creditUsd } } });
            });
            console.log((isLate ? 'Late ' : '') + 'BSC confirmed & credited', s.id, 'amountBNB=', bal, 'creditUSD=', creditUsd.toFixed(2));
          }
          continue;
        }
      }
    } catch (e) {
      console.log('BSC detect error for session', s.id, e.message);
    }

    // Try real TRON (TRX) detection if RPC available
    try {
      const asset = await prisma.crypto_assets.findUnique({ where: { id: s.crypto_asset_id } });
      if (asset && asset.network === 'tron' && process.env.RPC_TRON) {
        const base = process.env.RPC_TRON.replace(/\/$/, '');
        const res = await fetch(`${base}/v1/accounts/${s.address}`);
        if (res.ok) {
          const js = await res.json();
          const balSun = (js && Array.isArray(js.data) && js.data[0] && js.data[0].balance) ? js.data[0].balance : 0;
          const bal = balSun / 1e6; // TRX
          if (bal > 0) {
            const isLate = now > s.expires_at;
            let usdPer = 0;
            try {
              const cgRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tron&vs_currencies=usd');
              if (cgRes.ok) { const j2 = await cgRes.json(); usdPer = j2?.tron?.usd || 0; }
            } catch (e) {}
            const creditUsd = usdPer > 0 ? bal * usdPer : 10;
            if (!DRY_RUN) {
              await prisma.$transaction(async (tx) => {
                await tx.deposit_sessions.update({ where: { id: s.id }, data: { status: isLate ? 'LATE_CONFIRMED' : 'CONFIRMED', detected_amount: String(bal), confirmations: 1, is_late: isLate } });
                await tx.wallet_ledger.create({ data: { user_id: s.user_id, type: 'DEPOSIT', asset: 'USD', amount: creditUsd, meta: { sessionId: s.id, network: 'tron', amount_trx: bal, usd_per_trx: usdPer } } });
                // Use atomic increment to avoid Decimal math issues
                await tx.users.update({ where: { id: s.user_id }, data: { balance: { increment: creditUsd } } });
              });
            }
            console.log((now > s.expires_at ? 'Late' : 'Real') + ' TRX confirmed & credited', s.id, 'amountTRX=', bal, 'creditUSD=', creditUsd.toFixed(2));
            continue;
          }
        }
      }
    } catch (e) { console.log('TRON detect error for session', s.id, e.message); }

    // Expire logic
    if (s.status === 'PENDING' && now > s.expires_at) {
      await prisma.deposit_sessions.update({ where: { id: s.id }, data: { status: 'EXPIRED' } });
      console.log('Expired session', s.id);
      continue;
    }

  if (!SIMULATE) continue; // skip demo simulation unless enabled
    if (process.env.DEPOSIT_SIMULATE === '1') {
      const sim = await simulateDetection(s);
      if (!sim) continue;

    // Late payment detection
    const isLate = now > s.expires_at;
    if (sim.status === 'CONFIRMED') {
      if (!DRY_RUN) {
        await prisma.$transaction(async (tx) => {
          await tx.deposit_sessions.update({ where: { id: s.id }, data: { status: isLate ? 'LATE_CONFIRMED' : 'CONFIRMED', detected_amount: sim.detected_amount, confirmations: sim.confirmations, is_late: isLate } });
          await tx.wallet_ledger.create({ data: { user_id: s.user_id, type: 'DEPOSIT', asset: 'USD', amount: 10, meta: { sessionId: s.id, note: isLate ? 'Late confirmed' : 'Simulated credit' } } });
          // Use atomic increment to avoid Decimal math issues
          await tx.users.update({ where: { id: s.user_id }, data: { balance: { increment: 10 } } });
        });
      }
      console.log(isLate ? 'Late confirmed & credited' : 'Confirmed & credited', s.id);
    } else if (sim.status === 'DETECTED') {
      if (!DRY_RUN) {
        await prisma.deposit_sessions.update({ where: { id: s.id }, data: { status: 'DETECTED', detected_amount: sim.detected_amount, confirmations: 0, is_late: isLate } });
      }
      console.log(isLate ? 'Late detected payment' : 'Detected payment', s.id);
    }
    }
  }
}

async function loop() {
  await processSessions();
  setTimeout(loop, 5000);
}

loop();
