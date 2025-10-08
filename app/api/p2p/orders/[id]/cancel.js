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

    // Refund escrow if held
    if (order.escrow_held && order.escrow_ledger_id) {
      // Refund to seller (maker)
      await prisma.wallet_ledger.create({
        data: {
          user_id: order.maker_id,
          type: 'P2P_ESCROW_REFUND',
          asset: order.asset_symbol,
          amount: order.amount_asset,
          meta: { order_id: order.id, refund: true }
        }
      });
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
