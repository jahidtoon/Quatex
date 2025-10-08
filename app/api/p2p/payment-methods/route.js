import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Helpers
function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

// GET: List my payment methods
export async function GET(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const methods = await prisma.user_payment_methods.findMany({
      where: { user_id: user.id, is_active: true },
      orderBy: { created_at: 'desc' },
    });
    return NextResponse.json({ methods });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Create a payment method
export async function POST(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { type, label, details } = body || {};

    if (!type) return NextResponse.json({ error: 'type required' }, { status: 400 });

    const created = await prisma.user_payment_methods.create({
      data: {
        user_id: user.id,
        type,
        label: label || null,
        details: details || {},
      },
    });
    return NextResponse.json({ method: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
