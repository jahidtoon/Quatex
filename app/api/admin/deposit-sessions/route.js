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

export async function GET(req) {
  try {
    // Accept Authorization bearer or admin_token/auth_token cookies
    const auth = req.headers.get('authorization');
    const bearer = auth?.startsWith('Bearer ') ? auth.slice(7).trim() : null;
    const cookieHeader = req.headers.get('cookie');
    const adminCookie = cookieHeader?.split(';').map(c=>c.trim()).find(c=>c.startsWith('admin_token='))?.split('=')[1];
    const userCookie = cookieHeader?.split(';').map(c=>c.trim()).find(c=>c.startsWith('auth_token='))?.split('=')[1];
    const token = bearer || (adminCookie && decodeURIComponent(adminCookie)) || (userCookie && decodeURIComponent(userCookie)) || req.headers.get('x-dev-user');
    if (!token && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    let user;
    if (process.env.NODE_ENV === 'production') {
      user = await verifyToken(token);
      if (!user || !user.is_admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    } else {
      // Dev: allow access to ease debugging
      user = { is_admin: true };
    }

    const url = new URL(req.url);
    const status = url.searchParams.get('status');
    const where = status ? { status } : {};

    const sessions = await prisma.deposit_sessions.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100,
      select: {
        id: true,
        user_id: true,
        status: true,
        address: true,
        derivation_path: true,
        tx_hash: true,
        detected_amount: true,
        created_at: true,
        expires_at: true,
        is_late: true,
        crypto_assets: { select: { symbol: true, network: true } },
        users: { select: { email: true } }
      }
    });

    // Optional sender lookup for sessions with tx_hash (best-effort, short timeouts)
    async function ethLikeGetSender(rpcUrl, txHash) {
      try {
        const body = { jsonrpc: '2.0', id: 1, method: 'eth_getTransactionByHash', params: [txHash] };
        const res = await fetch(rpcUrl, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) return null;
        const j = await res.json();
        return j?.result?.from || null;
      } catch { return null; }
    }

    async function tronGetSender(txHash) {
      try {
        const tw = await import('tronweb');
        const TronWeb = tw.TronWeb;
        const tron = new TronWeb({ fullHost: (process.env.RPC_TRON || 'https://api.trongrid.io').replace(/\/$/, '') });
        const tx = await tron.trx.getTransaction(txHash);
        const raw = tx?.raw_data?.contract?.[0]?.parameter?.value;
        const fromHex = raw?.owner_address; // hex format
        if (!fromHex) return null;
        return tron.address.fromHex(fromHex);
      } catch { return null; }
    }

    const out = [];
    for (const s of sessions) {
      let sender = null;
      if (s.tx_hash) {
        const net = s.crypto_assets.network;
        if (net === 'ethereum' && process.env.RPC_ETH) {
          sender = await ethLikeGetSender(process.env.RPC_ETH, s.tx_hash);
        } else if (net === 'bsc' && process.env.RPC_BSC) {
          sender = await ethLikeGetSender(process.env.RPC_BSC, s.tx_hash);
        } else if (net === 'tron' && process.env.RPC_TRON) {
          sender = await tronGetSender(s.tx_hash);
        }
      }
      out.push({
        id: s.id,
        user_id: s.user_id,
        user_email: s.users?.email || null,
        status: s.status,
        address: s.address,
        sender_address: sender,
        derivation_path: s.derivation_path,
        tx_hash: s.tx_hash,
        amount: s.detected_amount,
        createdAt: s.created_at,
        expiresAt: s.expires_at,
        isLate: s.is_late,
        asset_symbol: s.crypto_assets.symbol,
        asset_network: s.crypto_assets.network
      });
    }

    return NextResponse.json(out);
  } catch (e) {
    console.error('Admin sessions fetch error', e);
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 });
  }
}
