// Hot wallet utilities (admin-controlled)
// ENV needed: HOT_WALLET_ENABLED=1, RPC_ETH, RPC_BSC, RPC_TRON (optional), HD_MNEMONIC

const { ethers } = require('ethers');
const TronWeb = require('tronweb');
const { derivePrivateKey } = require('./addressGenerator');

function normalizeHexPrivateKey(pk) {
  if (!pk) throw new Error('No private key');
  // If Buffer or Uint8Array
  if (Buffer.isBuffer(pk)) pk = pk.toString('hex');
  if (Array.isArray(pk)) pk = Buffer.from(pk).toString('hex');
  if (typeof pk !== 'string') pk = String(pk);
  // Handle comma-separated decimals (e.g., "245,138,...")
  if (pk.includes(',') && !pk.startsWith('0x')) {
    try {
      const bytes = pk.split(',').map((b) => parseInt(b.trim(), 10));
      pk = Buffer.from(bytes).toString('hex');
    } catch {}
  }
  pk = pk.trim().toLowerCase();
  if (pk.startsWith('0x')) pk = pk.slice(2);
  // Left-pad if shorter than 32 bytes
  if (pk.length < 64) pk = pk.padStart(64, '0');
  return '0x' + pk;
}

function ensureEnabled() {
  if (process.env.HOT_WALLET_ENABLED !== '1') throw new Error('Hot wallet disabled');
}

async function sendEthLike({ network, fromIndex = 0, to, amountEth }) {
  ensureEnabled();
  const rpc = network === 'bsc' ? process.env.RPC_BSC : process.env.RPC_ETH;
  if (!rpc) throw new Error('Missing RPC for ' + network);
  const { privateKey } = derivePrivateKey({ network, index: fromIndex });
  if (!privateKey) throw new Error('No private key derived');
  const fromPk = normalizeHexPrivateKey(privateKey);
  const wallet = new ethers.Wallet(fromPk);

  async function rpcCall(method, params) {
    const body = { jsonrpc: '2.0', id: Math.floor(Math.random()*1e6), method, params };
    const res = await fetch(rpc, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`RPC HTTP ${res.status}`);
    const json = await res.json();
    if (json.error) throw new Error(`RPC ${method} error: ${json.error.message || 'unknown'}`);
    return json.result;
  }

  const from = await wallet.getAddress();
  const [chainIdHex, nonceHex, gasPriceHex] = await Promise.all([
    rpcCall('eth_chainId', []),
    rpcCall('eth_getTransactionCount', [from, 'pending']),
    rpcCall('eth_gasPrice', [])
  ]);
  const chainId = parseInt(chainIdHex, 16);
  const nonce = parseInt(nonceHex, 16);
  const gasPrice = ethers.BigNumber.from(gasPriceHex);
  const value = ethers.utils.parseEther(amountEth);
  let gasLimit;
  try {
    const est = await rpcCall('eth_estimateGas', [{ from, to, value: ethers.utils.hexlify(value) }]);
    gasLimit = ethers.BigNumber.from(est);
  } catch {
    gasLimit = ethers.BigNumber.from(21000);
  }
  const tx = { chainId, nonce, to, value, gasPrice, gasLimit, type: 0 };
  const signed = await wallet.signTransaction(tx);
  const txHash = await rpcCall('eth_sendRawTransaction', [signed]);
  return { transactionHash: txHash };
}

async function sendTron({ fromIndex = 0, to, amountTrx }) {
  ensureEnabled();
  const rpc = process.env.RPC_TRON || 'https://api.trongrid.io';
  const { privateKey } = derivePrivateKey({ network: 'tron', index: fromIndex });
  if (!privateKey) throw new Error('No private key derived');
  const tronWeb = new TronWeb({ fullHost: rpc, privateKey });
  const trade = await tronWeb.transactionBuilder.sendTrx(to, tronWeb.toSun(amountTrx), tronWeb.address.fromPrivateKey(privateKey));
  const signed = await tronWeb.trx.sign(trade, privateKey);
  const receipt = await tronWeb.trx.sendRawTransaction(signed);
  return receipt;
}

module.exports = { sendEthLike, sendTron };
