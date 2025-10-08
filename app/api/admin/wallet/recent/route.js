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

async function fetchEthLikeStatus(rpc, txHash) {
  try {
    const res = await fetch(rpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [txHash] })
    });
    const data = await res.json();
    const rcpt = data?.result;
    if (!rcpt) return { status: 'PENDING' };
    const success = rcpt.status === '0x1';
    const confs = rcpt.blockNumber ? 1 : 0; // minimal indicator
    return { status: success ? 'CONFIRMED' : 'FAILED', confirmations: confs, blockNumber: rcpt.blockNumber };
  } catch (e) {
    return { status: 'UNKNOWN', error: e.message };
  }
}

async function fetchTronStatus(rpc, txid) {
  try {
    const url = (rpc || 'https://api.trongrid.io') + '/wallet/gettransactionbyid';
    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ value: txid }) });
    const data = await res.json();
    const ret = data?.ret?.[0]?.contractRet;
    if (!ret) return { status: 'PENDING' };
    return { status: ret === 'SUCCESS' ? 'CONFIRMED' : 'FAILED' };
  } catch (e) {
    return { status: 'UNKNOWN', error: e.message };
  }
}

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('admin_token')?.value || req.cookies.get('auth_token')?.value || req.headers.get('x-dev-user');
    const user = await verifyToken(token);
    if (!user || !user.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // last 5 admin transfers from ledger
    const rows = await prisma.wallet_ledger.findMany({
      where: { type: 'WITHDRAWAL' },
      orderBy: { created_at: 'desc' },
      take: 5,
      select: { id: true, created_at: true, asset: true, amount: true, meta: true }
    });

    const enriched = [];
    for (const r of rows) {
      const meta = r.meta || {};
      const network = meta.network;
      const txHash = meta.tx_hash;
      let chainStatus = { status: 'N/A' };
      if (network === 'eth') chainStatus = await fetchEthLikeStatus(process.env.RPC_ETH, txHash);
      else if (network === 'bsc') chainStatus = await fetchEthLikeStatus(process.env.RPC_BSC, txHash);
      else if (network === 'tron') chainStatus = await fetchTronStatus(process.env.RPC_TRON, txHash);
      enriched.push({ id: r.id, created_at: r.created_at, asset: r.asset, amount: r.amount, to: meta.to || null, network, tx_hash: txHash, chain: chainStatus });
    }

    return NextResponse.json({ items: enriched });
  } catch (e) {
    console.error('recent transfers error', e);
    return NextResponse.json({ error: e.message || 'Failed to load recent transfers' }, { status: 500 });
  }
}
