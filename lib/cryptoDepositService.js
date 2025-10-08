// Crypto Deposit Service Layer (MVP Skeleton)
// Responsibilities:
// - Generate per-deposit unique address (placeholder HD derivation)
// - Create deposit session with 30m expiry
// - Fetch session status
// - (Later) integrate with blockchain scan provider

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const crypto = require('crypto');
const { deriveAddress } = require('./addressGenerator');

// In future: store XPUBs per network in secure env
// Example env: XPUB_ETH=..., XPUB_BTC=...
// For now placeholder generates a pseudo address (NOT REAL BLOCKCHAIN ADDRESS!)
// Replace with real derivation using libraries: bitcoinjs-lib / ethers / tronweb etc.

function pseudoDeriveAddress(symbol, network) {
  const rand = crypto.randomBytes(8).toString('hex');
  // Simple deterministic style label (NOT production safe)
  return `${symbol}_${network}_${rand}`;
}

async function generateAddressForAsset(asset) {
  // Use incremental index per asset
  const count = await prisma.deposit_sessions.count({ where: { crypto_asset_id: asset.id } });
  const hasMnemonic = !!process.env.HD_MNEMONIC;
  if (hasMnemonic) {
    const { address, derivationPath, warning } = deriveAddress({ network: asset.network, index: count });
    if (!address) {
      // fallback to pseudo if something failed
      const pseudo = pseudoDeriveAddress(asset.symbol, asset.network);
      return { address: pseudo, derivationPath: derivationPath || 'pseudo', warning };
    }
    return { address, derivationPath };
  }
  // Fallback pseudo when no mnemonic configured
  const derivationPath = `pseudo`;
  const address = pseudoDeriveAddress(asset.symbol, asset.network);
  return { address, derivationPath };
}

async function createDepositSession({ userId, assetId, amountExpected }) {
  const asset = await prisma.crypto_assets.findUnique({ where: { id: assetId } });
  if (!asset || !asset.is_active) throw new Error('Asset not active');

  const { address, derivationPath } = await generateAddressForAsset(asset);
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  const session = await prisma.deposit_sessions.create({
    data: {
      user_id: userId,
      crypto_asset_id: asset.id,
      address,
      derivation_path: derivationPath,
      amount_expected: amountExpected ? amountExpected : null,
      expires_at: expiresAt,
      status: 'PENDING',
      min_confirmations: 1,
    },
  });

  return session;
}

async function getDepositSession(id, userId) {
  const session = await prisma.deposit_sessions.findFirst({ where: { id, user_id: userId } });
  if (!session) throw new Error('Session not found');
  return session;
}

module.exports = {
  createDepositSession,
  getDepositSession,
};
