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

    // Release escrow: buyer receives asset credit, seller receives fiat payment
    
    // Credit buyer with the purchased asset (as a virtual asset credit)
    await prisma.wallet_ledger.create({
      data: {
        user_id: order.taker_id,
        type: 'P2P_ESCROW_RELEASE',
        asset: order.asset_symbol, // Buyer receives the actual asset (USDT, BTC, etc.)
        amount: order.amount_asset,
        meta: { 
          order_id: order.id, 
          from_escrow: true,
          usd_value: order.amount_fiat,
          trade_type: 'asset_received',
          seller_id: order.maker_id
        }
      }
    });

    // Credit seller with fiat payment (they get the money for selling their asset)
    const sellerCurrentBalance = await prisma.users.findUnique({
      where: { id: order.maker_id },
      select: { balance: true }
    });
    
    await prisma.users.update({
      where: { id: order.maker_id },
      data: { balance: Number(sellerCurrentBalance?.balance || 0) + Number(order.amount_fiat) }
    });

    // Record seller receiving fiat payment
    await prisma.wallet_ledger.create({
      data: {
        user_id: order.maker_id,
        type: 'P2P_ESCROW_RELEASE',
        asset: 'USD', // Seller receives USD (fiat equivalent)
        amount: order.amount_fiat,
        meta: { 
          order_id: order.id, 
          from_escrow: true,
          sold_asset_symbol: order.asset_symbol,
          sold_asset_amount: order.amount_asset,
          trade_type: 'fiat_received',
          buyer_id: order.taker_id
        }
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
