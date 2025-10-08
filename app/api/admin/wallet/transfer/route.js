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

export async function POST(req) {
  try {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('admin_token')?.value || req.cookies.get('auth_token')?.value || req.headers.get('x-dev-user');
    let user;
    if (process.env.NODE_ENV === 'production') {
      user = await verifyToken(token);
      if (!user || !user.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } else {
      // Dev: permit easy testing similar to addresses API
      user = await verifyToken(token) || { id: 'dev-admin', email: 'dev@local', is_admin: true };
    }

    const body = await req.json();
    const { network, to, amount, assetSymbol, fromIndex = 0 } = body || {};
    if (!network || !to || !amount) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    if (process.env.HOT_WALLET_ENABLED !== '1') return NextResponse.json({ error: 'Hot wallet disabled. Set HOT_WALLET_ENABLED=1 in env.' }, { status: 403 });

    const hwmod = await import('@/lib/hotWallet');
    const { sendEthLike, sendTron } = hwmod.default || hwmod;
    let result;
    let txHash;
    if (network === 'eth' || network === 'bsc') {
      result = await sendEthLike({ network, to, amountEth: amount, fromIndex });
      // ethers receipt has transactionHash
      txHash = result?.transactionHash || result?.hash;
    } else if (network === 'tron') {
      result = await sendTron({ to, amountTrx: amount, fromIndex });
      txHash = result?.txid || result?.transaction?.txID || result?.transaction?.txId;
    } else {
      return NextResponse.json({ error: 'Unsupported network' }, { status: 400 });
    }

    // Optional: record admin transfer in ledger
    await prisma.wallet_ledger.create({
      data: {
        user_id: user.id,
        type: 'WITHDRAWAL',
        amount: Number(amount),
        asset: assetSymbol || network.toUpperCase(),
        meta: {
          kind: 'ADMIN_TRANSFER',
          to,
          network,
          tx_hash: txHash || null,
          raw: result || null,
        },
      },
    });

    return NextResponse.json({ ok: true, tx_hash: txHash, result });
  } catch (e) {
    console.error('transfer error', e);
    return NextResponse.json({ error: e.message || 'Transfer failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ message: 'POST to transfer funds: { network: eth|bsc|tron, to, amount, assetSymbol?, fromIndex? }' });
}
