import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

export async function PATCH(req, { params }) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = params.id;
    const body = await req.json();

    // Ensure belongs to user
    const found = await prisma.user_payment_methods.findFirst({ where: { id, user_id: user.id } });
    if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.user_payment_methods.update({
      where: { id },
      data: {
        label: body.label ?? found.label,
        details: body.details ?? found.details,
        is_active: body.is_active ?? found.is_active,
      },
    });
    return NextResponse.json({ method: updated });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const id = params.id;
    const found = await prisma.user_payment_methods.findFirst({ where: { id, user_id: user.id } });
    if (!found) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Soft delete: set is_active=false
    const updated = await prisma.user_payment_methods.update({ where: { id }, data: { is_active: false } });
    return NextResponse.json({ method: updated });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
