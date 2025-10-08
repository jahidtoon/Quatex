import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

async function getOrderForUser(orderId, userId) {
  const order = await prisma.p2p_orders.findUnique({ where: { id: orderId } });
  if (!order) return null;
  if (order.maker_id !== userId && order.taker_id !== userId) return null;
  return order;
}

export async function GET(req, { params }) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = await getOrderForUser(params.id, user.id);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const items = await prisma.p2p_messages.findMany({
      where: { order_id: params.id },
      orderBy: { created_at: 'asc' },
      take: 200,
    });
    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(req, { params }) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const order = await getOrderForUser(params.id, user.id);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const msg = (body?.message || '').toString().trim();
    if (!msg) return NextResponse.json({ error: 'message required' }, { status: 400 });

    const created = await prisma.p2p_messages.create({
      data: { order_id: params.id, sender_id: user.id, message: msg }
    });
    return NextResponse.json({ message: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
