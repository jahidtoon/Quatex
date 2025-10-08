#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');

// Load env (prefer .env.local if present)
dotenv.config();
const envLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal });

async function jsonRpcBlockNumber(url) {
  try {
    const res = await axios.post(url, { jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] }, { timeout: 10000 });
    if (res.data && res.data.result) return parseInt(res.data.result, 16);
    return { error: res.data?.error || 'No result' };
  } catch (e) {
    return { error: e.message };
  }
}

async function tronBlockNumber(url) {
  try {
    const base = url.replace(/\/$/, '');
    const res = await axios.post(base + '/wallet/getnowblock', {}, { timeout: 10000 });
    const num = res.data?.block_header?.raw_data?.number;
    return typeof num === 'number' ? num : { error: 'No number' };
  } catch (e) {
    return { error: e.message };
  }
}

(async () => {
  const { RPC_ETH, RPC_BSC, RPC_TRON } = process.env;
  const out = {};
  if (RPC_ETH) out.eth = await jsonRpcBlockNumber(RPC_ETH);
  if (RPC_BSC) out.bsc = await jsonRpcBlockNumber(RPC_BSC);
  if (RPC_TRON) out.tron = await tronBlockNumber(RPC_TRON);
  console.log(JSON.stringify(out, null, 2));
})().catch(e => { console.error('RPC test failed', e); process.exit(1); });
