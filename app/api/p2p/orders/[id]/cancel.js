import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

export async function POST(req, { params }) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = params.id;
    const order = await prisma.p2p_orders.findUnique({ where: { id } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    // Only taker or maker can cancel
    if (order.taker_id !== user.id && order.maker_id !== user.id) return NextResponse.json({ error: 'Not your order' }, { status: 403 });
    if (['RELEASED','CANCELED','REFUNDED'].includes(order.status)) return NextResponse.json({ error: 'Order already closed' }, { status: 400 });

    // Refund escrow if held - restore USD to seller
    if (order.escrow_held && order.escrow_ledger_id) {
      // Get escrow details
      const escrowEntry = await prisma.wallet_ledger.findUnique({
        where: { id: order.escrow_ledger_id },
        select: { meta: true }
      });

      const escrowUSD = Number(escrowEntry?.meta?.escrow_amount_usd || 0);
      
      if (escrowUSD > 0) {
        // Restore USD to seller's main balance
        const sellerCurrentBalance = await prisma.users.findUnique({
          where: { id: order.maker_id },
          select: { balance: true }
        });

        await prisma.users.update({
          where: { id: order.maker_id },
          data: { balance: Number(sellerCurrentBalance?.balance || 0) + escrowUSD }
        });

        // Record the refund
        await prisma.wallet_ledger.create({
          data: {
            user_id: order.maker_id,
            type: 'P2P_ESCROW_REFUND',
            asset: 'USD',
            amount: escrowUSD,
            meta: { order_id: order.id, refund: true, original_escrow_id: order.escrow_ledger_id }
          }
        });
      }
    }
    // Mark order canceled
    const updated = await prisma.p2p_orders.update({
      where: { id },
      data: {
        status: 'CANCELED',
        canceled_at: new Date(),
      }
    });
    return NextResponse.json({ order: updated });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
