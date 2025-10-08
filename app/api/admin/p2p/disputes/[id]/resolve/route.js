import { prisma, requireAdmin, json } from '@/app/api/admin/_utils';

export async function POST(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  const id = params.id;
  let body;
  try {
    body = await request.json();
  } catch {
    body = {};
  }
  const decision = (body.decision || '').toUpperCase(); // RELEASE | REFUND
  const note = (body.note || '').toString().slice(0, 1000);
  if (!['RELEASE', 'REFUND'].includes(decision)) {
    return json({ error: 'Invalid decision' }, 400);
  }

  const dispute = await prisma.p2p_disputes.findUnique({
    where: { id },
    include: { order: true }
  });
  if (!dispute) return json({ error: 'Not found' }, 404);
  if (dispute.status !== 'OPEN') return json({ error: 'Dispute already resolved' }, 400);

  const order = dispute.order;
  if (!order) return json({ error: 'Order missing' }, 400);

  // Only allow actions on relevant order states
  if (!['PAID', 'ESCROW_HELD', 'DISPUTED', 'PENDING', 'WAITING_PAYMENT'].includes(order.status)) {
    return json({ error: `Order not actionable in status ${order.status}` }, 400);
  }

  const now = new Date();

  if (order.side === 'SELL') {
    // For SELL offers, escrow was held at order creation; ensure hold exists
    const escrowLedgerId = order.escrow_ledger_id;

    if (decision === 'RELEASE') {
      // Credit buyer (taker) with asset, mark released
      const tx = await prisma.$transaction(async (tx) => {
        // Create credit to buyer
        await tx.wallet_ledger.create({
          data: {
            user_id: order.taker_id,
            type: 'P2P_ESCROW_RELEASE',
            asset: order.asset_symbol,
            amount: order.amount_asset,
            meta: { order_id: order.id, dispute_id: dispute.id }
          }
        });

        const updatedOrder = await tx.p2p_orders.update({
          where: { id: order.id },
          data: { status: 'RELEASED', released_at: now }
        });

        const updatedDispute = await tx.p2p_disputes.update({
          where: { id: dispute.id },
          data: {
            status: 'RESOLVED',
            resolved_by_admin_id: auth.admin?.id || null,
            resolution_note: `[ADMIN RELEASE] ${note}`,
            resolved_at: now
          }
        });
        return { updatedOrder, updatedDispute };
      });
      return json({ ok: true, ...tx });
    } else {
      // REFUND: Return escrow to seller (maker)
      const tx = await prisma.$transaction(async (tx) => {
        await tx.wallet_ledger.create({
          data: {
            user_id: order.maker_id,
            type: 'P2P_ESCROW_REFUND',
            asset: order.asset_symbol,
            amount: order.amount_asset,
            meta: { order_id: order.id, dispute_id: dispute.id, escrow_ledger_id: escrowLedgerId }
          }
        });

        const updatedOrder = await tx.p2p_orders.update({
          where: { id: order.id },
          data: { status: 'CANCELED', canceled_at: now }
        });
        const updatedDispute = await tx.p2p_disputes.update({
          where: { id: dispute.id },
          data: {
            status: 'RESOLVED',
            resolved_by_admin_id: auth.admin?.id || null,
            resolution_note: `[ADMIN REFUND] ${note}`,
            resolved_at: now
          }
        });
        return { updatedOrder, updatedDispute };
      });
      return json({ ok: true, ...tx });
    }
  } else {
    // BUY side offers: no escrow hold at creation; admin decisions translate to
    // directly updating order status to RELEASED (mark completed) or CANCELED.
    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.p2p_orders.update({
        where: { id: order.id },
        data: { status: decision === 'RELEASE' ? 'RELEASED' : 'CANCELED', updated_at: now, canceled_at: decision === 'REFUND' ? now : undefined, released_at: decision === 'RELEASE' ? now : undefined }
      });
      const updatedDispute = await tx.p2p_disputes.update({
        where: { id: dispute.id },
        data: {
          status: 'RESOLVED',
          resolved_by_admin_id: auth.admin?.id || null,
          resolution_note: `[ADMIN ${decision}] ${note}`,
          resolved_at: now
        }
      });
      return { updatedOrder, updatedDispute };
    });
    return json({ ok: true, ...updated });
  }
}
