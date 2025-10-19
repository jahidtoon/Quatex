// Reconcile historical P2P escrow holds and releases
// - Offsets lingering P2P_ESCROW_HOLD with matching P2P_ESCROW_RELEASE for seller
// - Credits buyer USD if missing
// - Fixes incorrect seller USD credit entries to fiat currency

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  let fixedOrders = 0;
  let fixedBuyerCredits = 0;
  let fixedSellerOffsets = 0;
  let correctedSellerFiatLines = 0;

  const orders = await prisma.p2p_orders.findMany({
    where: { status: 'RELEASED', escrow_held: true, NOT: { escrow_ledger_id: null } },
    orderBy: { released_at: 'desc' },
    take: 200,
  });

  for (const order of orders) {
    const { id, maker_id, taker_id, amount_asset, amount_fiat, fiat_currency, escrow_ledger_id } = order;

    // Load recent ledgers for both users
    const [makerLedgers, buyerLedgers] = await Promise.all([
      prisma.wallet_ledger.findMany({ where: { user_id: maker_id }, orderBy: { created_at: 'desc' }, take: 200 }),
      prisma.wallet_ledger.findMany({ where: { user_id: taker_id }, orderBy: { created_at: 'desc' }, take: 200 })
    ]);

    // 1) Ensure buyer USD credit exists
    const buyerHasCredit = buyerLedgers.some(l => l.type === 'P2P_ESCROW_RELEASE' && l.asset === 'USD' && Number(l.amount) === Number(amount_asset) && l.meta && l.meta.order_id === id);
    if (!buyerHasCredit) {
      const buyer = await prisma.users.findUnique({ where: { id: taker_id }, select: { balance: true } });
      await prisma.users.update({ where: { id: taker_id }, data: { balance: Number(buyer?.balance || 0) + Number(amount_asset) } });
      await prisma.wallet_ledger.create({
        data: {
          user_id: taker_id,
          type: 'P2P_ESCROW_RELEASE',
          asset: 'USD',
          amount: amount_asset,
          meta: { order_id: id, reconciled: true }
        }
      });
      fixedBuyerCredits++;
    }

    // 2) Ensure seller offset exists for escrow hold
    const sellerHasOffset = makerLedgers.some(l => l.type === 'P2P_ESCROW_RELEASE' && l.asset === 'USD' && Number(l.amount) === Number(amount_asset) && l.meta && (l.meta.offset_original_escrow_id === escrow_ledger_id || l.meta.order_id === id));
    if (!sellerHasOffset) {
      await prisma.wallet_ledger.create({
        data: {
          user_id: maker_id,
          type: 'P2P_ESCROW_RELEASE',
          asset: 'USD',
          amount: amount_asset,
          meta: { order_id: id, offset_original_escrow_id: escrow_ledger_id, reconciled: true }
        }
      });
      fixedSellerOffsets++;
    }

    // 3) Fix incorrect seller USD credit lines (should be fiat currency)
    const wrongSellerUsd = makerLedgers.filter(l => l.type === 'P2P_ESCROW_RELEASE' && l.asset === 'USD' && Number(l.amount) === Number(amount_fiat) && l.meta && l.meta.trade_type === 'fiat_received');
    for (const line of wrongSellerUsd) {
      await prisma.wallet_ledger.update({
        where: { id: line.id },
        data: { asset: fiat_currency || 'USD', meta: { ...(line.meta || {}), corrected_from: 'USD' } }
      });
      correctedSellerFiatLines++;
    }

    fixedOrders++;
  }

  console.log(JSON.stringify({ fixedOrders, fixedBuyerCredits, fixedSellerOffsets, correctedSellerFiatLines }, null, 2));
}

run()
  .catch(err => { console.error(err); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
