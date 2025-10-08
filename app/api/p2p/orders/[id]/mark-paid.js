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
    if (order.taker_id !== user.id) return NextResponse.json({ error: 'Not your order' }, { status: 403 });
    if (order.status !== 'ESCROW_HELD' && order.status !== 'PENDING') return NextResponse.json({ error: 'Order not markable as paid' }, { status: 400 });

    const updated = await prisma.p2p_orders.update({
      where: { id },
      data: {
        status: 'PAID',
        paid_at: new Date(),
      }
    });
    return NextResponse.json({ order: updated });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
