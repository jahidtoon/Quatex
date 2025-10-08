// HD wallet based address generator
// Networks supported: bitcoin(btc p2pkh), ethereum (and bsc/erc20), tron (trc20)
// ENV: HD_MNEMONIC (required for real addresses)

const bip39 = require('bip39');
const ecc = require('tiny-secp256k1');
const bip32 = require('bip32').default(ecc);
const bitcoin = require('bitcoinjs-lib');
const { ethers } = require('ethers');
const { keccak_256 } = require('js-sha3');
const bs58check = require('bs58check');

function getRootFromMnemonic(mnemonic) {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  return bip32.fromSeed(seed);
}

function getEthLikeAddressFromNode(node) {
  const wallet = new ethers.Wallet(node.privateKey);
  return { address: wallet.address, privateKey: node.privateKey.toString('hex') };
}

function getTronAddressFromNode(node) {
  // Derive TRON base58 address from secp256k1 public key
  // Steps: pubkey (uncompressed) -> keccak256 -> last 20 bytes -> prefix 0x41 -> base58check
  // Compute uncompressed public key from private key using tiny-secp256k1
  if (!node.privateKey) throw new Error('Missing private key for TRON derivation');
  const pubUncompressed = Buffer.from(ecc.pointFromScalar(node.privateKey, false)); // 65 bytes (0x04 + X + Y)
  const uncompressed = pubUncompressed;
  const hash = Buffer.from(keccak_256.arrayBuffer(uncompressed.slice(1))); // drop 0x04
  const addr20 = hash.slice(-20);
  const tronPrefix = Buffer.from([0x41]);
  const payload = Buffer.concat([tronPrefix, Buffer.from(addr20)]);
  let addressBase58;
  const b58 = (bs58check && (bs58check.encode ? bs58check : bs58check.default)) || bs58check;
  if (!b58) throw new Error('bs58check not available');
  if (typeof b58 === 'function') addressBase58 = b58(payload);
  else if (typeof b58.encode === 'function') addressBase58 = b58.encode(payload);
  else throw new Error('bs58check encode not available');
  return { address: addressBase58, privateKey: node.privateKey.toString('hex') };
}

function getBtcP2PKHFromNode(node, network = bitcoin.networks.bitcoin) {
  const { address } = bitcoin.payments.p2pkh({ pubkey: node.publicKey, network });
  return { address, privateKey: node.toWIF() };
}

/**
 * deriveAddress
 * @param {Object} opts
 * @param {string} opts.network - 'bitcoin' | 'ethereum' | 'bsc' | 'tron'
 * @param {number} opts.index - address index
 */
function deriveAddress({ network, index }) {
  const mnemonic = process.env.HD_MNEMONIC;
  if (!mnemonic) {
    return { address: null, warning: 'HD_MNEMONIC not set' };
  }
  const root = getRootFromMnemonic(mnemonic);

  switch (network) {
    case 'bitcoin': {
      const path = `m/44'/0'/0'/0/${index}`; // simple P2PKH
      const node = root.derivePath(path);
      const { address } = getBtcP2PKHFromNode(node);
      return { address, derivationPath: path };
    }
    case 'ethereum':
    case 'bsc': {
      const path = `m/44'/60'/0'/0/${index}`;
      const node = root.derivePath(path);
      const { address } = getEthLikeAddressFromNode(node);
      return { address, derivationPath: path };
    }
    case 'tron': {
      const path = `m/44'/195'/0'/0/${index}`; // SLIP-0044 for TRON = 195
      const node = root.derivePath(path);
      const { address } = getTronAddressFromNode(node);
      return { address, derivationPath: path };
    }
    default:
      return { address: null, warning: 'Unsupported network' };
  }
}

function derivePrivateKey({ network, index }) {
  const mnemonic = process.env.HD_MNEMONIC;
  if (!mnemonic) return { privateKey: null, warning: 'HD_MNEMONIC not set' };
  const root = getRootFromMnemonic(mnemonic);
  switch (network) {
    case 'bitcoin': {
      const path = `m/44'/0'/0'/0/${index}`;
      const node = root.derivePath(path);
      return { privateKey: node.toWIF(), derivationPath: path };
    }
    case 'ethereum':
    case 'bsc': {
      const path = `m/44'/60'/0'/0/${index}`;
      const node = root.derivePath(path);
  // Ensure hex string (no 0x, no commas) for compatibility
  return { privateKey: node.privateKey.toString('hex'), derivationPath: path };
    }
    case 'tron': {
      const path = `m/44'/195'/0'/0/${index}`;
      const node = root.derivePath(path);
  // Ensure hex string (no 0x, no commas)
  return { privateKey: node.privateKey.toString('hex'), derivationPath: path };
    }
    default:
      return { privateKey: null, warning: 'Unsupported network' };
  }
}

module.exports = { deriveAddress, derivePrivateKey };
