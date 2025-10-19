import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

export async function GET(req, { params }) {
  try {
    const id = params.id;
    const offer = await prisma.p2p_offers.findUnique({ where: { id } });
    if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ offer });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const id = params.id;

    const offer = await prisma.p2p_offers.findUnique({ where: { id } });
    if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (offer.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const data = {};
    if ('fixed_price' in body) data.fixed_price = body.fixed_price === null ? null : Number(body.fixed_price);
    if ('min_amount_asset' in body) data.min_amount_asset = Number(body.min_amount_asset || 0);
    if ('max_amount_asset' in body) data.max_amount_asset = Number(body.max_amount_asset || 0);
    if ('terms' in body) data.terms = body.terms ?? null;
    if ('status' in body) data.status = body.status;

    // If fixed price or limits changed, recalc fiat limits
    if ('fixed_price' in data || 'min_amount_asset' in data || 'max_amount_asset' in data) {
      const price = 'fixed_price' in data ? data.fixed_price : offer.fixed_price;
      const minA = 'min_amount_asset' in data ? data.min_amount_asset : offer.min_amount_asset;
      const maxA = 'max_amount_asset' in data ? data.max_amount_asset : offer.max_amount_asset;
      if (price != null) {
        data.min_limit_fiat = Number(minA) * Number(price);
        data.max_limit_fiat = Number(maxA) * Number(price);
      }
    }

    const updated = await prisma.p2p_offers.update({ where: { id }, data });
    return NextResponse.json({ offer: updated });
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

    const offer = await prisma.p2p_offers.findUnique({ where: { id } });
    if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (offer.user_id !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    await prisma.p2p_offers.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
