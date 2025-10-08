import { NextResponse } from 'next/server';
export const runtime = 'nodejs';
// Ensure env vars are loaded even if process manager/cwd causes Next to skip .env.local
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
try {
  dotenv.config();
  const envLocal = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });
} catch {}
import { verifyToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

import { ethers } from 'ethers';

export async function GET(req) {
  try {
  // Auth (admin only) — accept Authorization bearer, admin_token cookie, or auth_token cookie
  const authHeader = req.headers.get('authorization');
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  const cookieHeader = req.headers.get('cookie');
  const adminCookie = cookieHeader?.split(';').map(c=>c.trim()).find(c=>c.startsWith('admin_token='))?.split('=')[1];
  const userCookie = cookieHeader?.split(';').map(c=>c.trim()).find(c=>c.startsWith('auth_token='))?.split('=')[1];
  const token = bearer || (adminCookie && decodeURIComponent(adminCookie)) || (userCookie && decodeURIComponent(userCookie)) || req.headers.get('x-dev-user');
  let user;
  if (process.env.NODE_ENV === 'production') {
    user = await verifyToken(token);
    if (!user || !user.is_admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } else {
    // Dev: allow access to ease debugging
    user = { is_admin: true };
  }

    // Params
    const { searchParams } = new URL(req.url);
    const networksParam = searchParams.get('networks') || 'eth,bsc,tron';
    const countParam = Math.min(parseInt(searchParams.get('count') || '5', 10), 20);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
    const networks = networksParam.split(',').map(s => s.trim()).filter(Boolean);

    // Dynamic import CJS address generator
    const genmod = await import('@/lib/addressGenerator');
    const { deriveAddress } = genmod.default || genmod;

    const out = [];
    const warnings = [];

    // Providers (use static network to avoid "could not detect network" in some runtimes)
    // Helper: direct JSON-RPC call for ETH-like getBalance to avoid ethers provider quirks in Next runtime
    async function rpcGetBalance(rpcUrl, address) {
      const body = {
        jsonrpc: '2.0',
        id: Math.floor(Math.random() * 1e6),
        method: 'eth_getBalance',
        params: [String(address).toLowerCase(), 'latest']
      };
      const res = await fetch(rpcUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
      const json = await res.json();
      if (!json || json.error) throw new Error(`RPC error: ${json?.error?.message || 'unknown'}`);
      const hex = json.result;
      if (!hex) return '0';
      // format wei hex -> ether string using BigInt
      const wei = BigInt(hex);
      const denom = 10n ** 18n;
      const whole = wei / denom;
      const frac = wei % denom;
      const fracStr = frac.toString().padStart(18, '0').replace(/0+$/, '');
      return fracStr ? `${whole.toString()}.${fracStr}` : whole.toString();
    }
    
    const providers = {
      eth: process.env.RPC_ETH ? null : null,
      bsc: process.env.RPC_BSC ? null : null,
    };

    let TronWeb;
    try {
      const tw = await import('tronweb');
      TronWeb = tw.TronWeb;
    } catch (e) {
      warnings.push('tronweb import failed: ' + e.message);
    }
    const tronHost = (process.env.RPC_TRON || 'https://api.trongrid.io').replace(/\/$/, '');
    const tron = TronWeb ? new TronWeb({ fullHost: tronHost }) : null;

    for (const net of networks) {
      const section = { network: net, unit: net === 'eth' ? 'ETH' : net === 'bsc' ? 'BNB' : net === 'tron' ? 'TRX' : net.toUpperCase(), addresses: [] };
      for (let i = offset; i < offset + countParam; i++) {
        let addr = null; let balance = null;
        try {
          if (net === 'eth' || net === 'bsc') {
            const d = deriveAddress({ network: net === 'eth' ? 'ethereum' : 'bsc', index: i });
            addr = d.address;
            if (d.warning) warnings.push(`${net}[${i}] ${d.warning}`);
            if (addr && process.env[`RPC_${net.toUpperCase()}`]) {
              const etherStr = await rpcGetBalance(process.env[`RPC_${net.toUpperCase()}`], addr);
              balance = etherStr;
            }
          } else if (net === 'tron') {
            const d = deriveAddress({ network: 'tron', index: i });
            addr = d.address;
            if (d.warning) warnings.push(`${net}[${i}] ${d.warning}`);
            if (addr) {
              if (tron) {
                const sun = await tron.trx.getBalance(addr);
                balance = (sun / 1e6).toString();
              } else {
                // HTTP fallback to TronGrid if tronweb not available
                try {
                  const res = await fetch(`${tronHost}/v1/accounts/${addr}`);
                  if (res.ok) {
                    const js = await res.json();
                    const sun = (js && Array.isArray(js.data) && js.data[0] && js.data[0].balance) ? js.data[0].balance : 0;
                    balance = (sun / 1e6).toString();
                  }
                } catch (e) {
                  warnings.push(`tron[${i}] http fetch failed: ${e.message}`);
                }
              }
            }
          }
        } catch (e) {
          warnings.push(`${net}[${i}] balance fetch failed: ${e.message}`);
        }
        section.addresses.push({ index: i, address: addr, balance });
      }
      out.push(section);
    }

    return NextResponse.json({ networks: out, warnings });
  } catch (e) {
    console.error('addresses API error', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ error: 'Use GET with optional params: ?networks=eth,bsc,tron&count=5&offset=0' }, { status: 405 });
}
