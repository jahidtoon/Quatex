import { NextResponse } from 'next/server';
export const runtime = 'nodejs';

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
try {
  dotenv.config();
  const envLocal = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
} catch {}

import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { ethers } from 'ethers';

async function getPriceUSD(network) {
  const map = { eth: 'ethereum', bsc: 'binancecoin', tron: 'tron' };
  const id = map[network] || 'ethereum';
  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
    if (res.ok) { const js = await res.json(); return js?.[id]?.usd || 0; }
  } catch {}
  return 0;
}

function getProvider(network) {
  if (network === 'bsc') {
    if (!process.env.RPC_BSC) throw new Error('RPC_BSC not set');
    return new ethers.providers.JsonRpcProvider(process.env.RPC_BSC);
  } else if (network === 'eth') {
    if (!process.env.RPC_ETH) throw new Error('RPC_ETH not set');
    return new ethers.providers.JsonRpcProvider(process.env.RPC_ETH);
  } else if (network === 'tron') {
    throw new Error('Use TRON-specific inspector later');
  }
  throw new Error('Unsupported network');
}

export async function GET(req) {
  try {
    // Auth
    const authHeader = req.headers.get('authorization');
    const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    const cookieHeader = req.headers.get('cookie');
    const adminCookie = cookieHeader?.split(';').map(c=>c.trim()).find(c=>c.startsWith('admin_token='))?.split('=')[1];
    const userCookie = cookieHeader?.split(';').map(c=>c.trim()).find(c=>c.startsWith('auth_token='))?.split('=')[1];
    const token = bearer || (adminCookie && decodeURIComponent(adminCookie)) || (userCookie && decodeURIComponent(userCookie)) || req.headers.get('x-dev-user');
    const user = await verifyToken(token);
    if (!user || !user.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const txHash = url.searchParams.get('tx');
    const network = (url.searchParams.get('network') || 'bsc').toLowerCase();
    if (!txHash) return NextResponse.json({ error: 'Missing tx' }, { status: 400 });

    const provider = getProvider(network);
    const [tx, receipt, currentBlock] = await Promise.all([
      provider.getTransaction(txHash),
      provider.getTransactionReceipt(txHash).catch(()=>null),
      provider.getBlockNumber(),
    ]);
    if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    const to = (tx.to || '').toString();
    const valueNative = parseFloat(ethers.utils.formatEther(tx.value || 0));

    // Find matching deposit session by address and network
    const session = await prisma.deposit_sessions.findFirst({
      where: {
        address: to,
        OR: [ { status: 'PENDING' }, { status: 'DETECTED' }, { status: 'EXPIRED' } ]
      },
      include: { crypto_assets: true }
    });
    if (!session) {
      return NextResponse.json({ ok: false, reason: 'No matching session by address', to, valueNative, network }, { status: 404 });
    }
    const assetNet = session.crypto_assets.network;
    if ((network === 'bsc' && assetNet !== 'bsc') || (network === 'eth' && assetNet !== 'ethereum')) {
      return NextResponse.json({ ok: false, reason: `Session network mismatch (${assetNet})`, to, valueNative, network }, { status: 400 });
    }

    const isLate = new Date() > session.expires_at;
    let confirmations = 0;
    if (receipt && receipt.blockNumber) confirmations = Math.max(0, currentBlock - receipt.blockNumber + 1);
    const usdPer = await getPriceUSD(network);
    const creditUsd = (usdPer > 0 ? valueNative * usdPer : 10);

    // If already confirmed, return info
    if (session.status === 'CONFIRMED' || session.status === 'LATE_CONFIRMED') {
      return NextResponse.json({ ok: true, already: true, sessionId: session.id, status: session.status });
    }

    // Confirm and credit
    await prisma.$transaction(async (txdb) => {
      await txdb.deposit_sessions.update({ where: { id: session.id }, data: { status: isLate ? 'LATE_CONFIRMED' : 'CONFIRMED', detected_amount: String(valueNative), confirmations, is_late: isLate, tx_hash: txHash } });
      await txdb.wallet_ledger.create({ data: { user_id: session.user_id, type: 'DEPOSIT', asset: 'USD', amount: creditUsd, meta: { sessionId: session.id, network, amount_native: valueNative, usd_per: usdPer, tx: txHash } } });
      await txdb.users.update({ where: { id: session.user_id }, data: { balance: { increment: creditUsd } } });
    });

    return NextResponse.json({ ok: true, sessionId: session.id, creditedUSD: creditUsd, amount: valueNative, network, confirmations });
  } catch (e) {
    console.error('inspect error', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
