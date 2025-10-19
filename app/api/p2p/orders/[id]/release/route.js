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
    if (order.maker_id !== user.id) return NextResponse.json({ error: 'Not your order' }, { status: 403 });
    if (order.status !== 'PAID') return NextResponse.json({ error: 'Order not ready for release' }, { status: 400 });

    // Release escrow: for SELL USD orders → buyer receives USD, seller gets FIAT off-chain.
    // 1) Credit buyer's USD balance and ledger
    const buyerCurrent = await prisma.users.findUnique({ where: { id: order.taker_id }, select: { balance: true } });
    await prisma.users.update({
      where: { id: order.taker_id },
      data: { balance: Number(buyerCurrent?.balance || 0) + Number(order.amount_asset) }
    });
    await prisma.wallet_ledger.create({
      data: {
        user_id: order.taker_id,
        type: 'P2P_ESCROW_RELEASE',
        asset: 'USD',
        amount: order.amount_asset,
        meta: { 
          order_id: order.id, 
          from_escrow: true,
          fiat_currency: order.fiat_currency,
          fiat_value: order.amount_fiat,
          trade_side: 'BUYER_RECEIVED_USD',
          seller_id: order.maker_id
        }
      }
    });

    // 2) Zero-out seller's escrow hold so balances don't show lingering -USD
    if (order.escrow_held && order.escrow_ledger_id) {
      await prisma.wallet_ledger.create({
        data: {
          user_id: order.maker_id,
          type: 'P2P_ESCROW_RELEASE',
          asset: 'USD',
          amount: order.amount_asset, // offset the -hold
          meta: { order_id: order.id, offset_original_escrow_id: order.escrow_ledger_id }
        }
      });
    }

    // 3) Optional: record seller received fiat (informational only)
    await prisma.wallet_ledger.create({
      data: {
        user_id: order.maker_id,
        type: 'P2P_ESCROW_RELEASE',
        asset: order.fiat_currency, // e.g., BDT informational
        amount: order.amount_fiat,
        meta: { order_id: order.id, info: 'SELLER_RECEIVED_FIAT' }
      }
    });
    // Mark order released
    const updated = await prisma.p2p_orders.update({
      where: { id },
      data: {
        status: 'RELEASED',
        released_at: new Date(),
      }
    });
    return NextResponse.json({ order: updated });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
