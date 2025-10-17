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
    
    // Both maker and taker can confirm payment
    if (order.maker_id !== user.id && order.taker_id !== user.id) {
      return NextResponse.json({ error: 'Not your order' }, { status: 403 });
    }
    
    if (!['ESCROW_HELD', 'PENDING'].includes(order.status)) {
      return NextResponse.json({ error: 'Order not markable as paid' }, { status: 400 });
    }

    let updateData = {};
    let statusMessage = '';

    // Determine who is confirming
    if (user.id === order.maker_id) {
      updateData.maker_confirmed = true;
      statusMessage = 'Seller confirmed payment';
    } else if (user.id === order.taker_id) {
      updateData.taker_confirmed = true;
      statusMessage = 'Buyer confirmed payment';
    }

    // Check if both have confirmed
    const bothConfirmed = (order.maker_confirmed || updateData.maker_confirmed) && 
                         (order.taker_confirmed || updateData.taker_confirmed);

    if (bothConfirmed) {
      updateData.status = 'PAID';
      updateData.paid_at = new Date();
      statusMessage = 'Both parties confirmed - Order marked as PAID';
    }

    const updated = await prisma.p2p_orders.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ 
      order: updated, 
      message: statusMessage,
      bothConfirmed 
    });
  } catch (e) {
    console.error('Mark paid error:', e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
