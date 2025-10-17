import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

// GET: public offers with filters
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const asset = searchParams.get('asset') || undefined;
    const fiat = searchParams.get('fiat') || undefined;
    const side = searchParams.get('side') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);

    const where = {
      status: 'ACTIVE',
      ...(asset ? { asset_symbol: asset } : {}),
      ...(fiat ? { fiat_currency: fiat } : {}),
      ...(side ? { side } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.p2p_offers.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.p2p_offers.count({ where }),
    ]);

    return NextResponse.json({ items, page, pageSize, total });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: create my offer
export async function POST(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const {
      side,
      fiat_currency,
      price_type,
      fixed_price,
      margin_percent,
      min_amount,
      max_amount,
      terms,
      auto_reply,
      payment_method_ids,
    } = body || {};

    if (!side || !fiat_currency || !price_type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (price_type === 'FIXED' && !fixed_price) {
      return NextResponse.json({ error: 'fixed_price required for FIXED pricing' }, { status: 400 });
    }

    // Professional validation for SELL offers - check main USD balance
    if (side === 'SELL') {
      // Get user's main USD balance
      const userProfile = await prisma.users.findUnique({ 
        where: { id: user.id }, 
        select: { balance: true } 
      });

      const mainBalance = Number(userProfile?.balance || 0);
      const requiredUSD = min_amount;
      const maxRequiredUSD = max_amount;
      
      if (mainBalance < requiredUSD) {
        return NextResponse.json({ 
          error: `Insufficient balance. You have $${mainBalance.toLocaleString()}, but minimum offer requires $${requiredUSD.toLocaleString()}` 
        }, { status: 400 });
      }

      if (mainBalance < maxRequiredUSD) {
        return NextResponse.json({ 
          error: `Insufficient balance. You have $${mainBalance.toLocaleString()}, but maximum offer requires $${maxRequiredUSD.toLocaleString()}` 
        }, { status: 400 });
      }
    }

    const created = await prisma.p2p_offers.create({
      data: {
        user_id: user.id,
        side,
        asset_symbol: 'USD', // We're trading USD
        fiat_currency,
        price_type,
        fixed_price: fixed_price ?? null,
        margin_percent: margin_percent ?? null,
        min_amount_asset: min_amount,
        max_amount_asset: max_amount,
        min_limit_fiat: min_amount * Number(fixed_price || 1),
        max_limit_fiat: max_amount * Number(fixed_price || 1),
        terms: terms ?? null,
        auto_reply: auto_reply ?? null,
      },
    });

    if (payment_method_ids?.length) {
      const links = payment_method_ids.map((pmId) => ({ offer_id: created.id, payment_method_id: pmId }));
      // Some Prisma versions/environments (e.g., SQLite) don't support skipDuplicates in createMany.
      // Do safe per-row inserts and ignore unique constraint duplicates.
      await Promise.all(
        links.map(async (link) => {
          try {
            await prisma.p2p_offer_payment_methods.create({ data: link });
          } catch (err) {
            if (err?.code === 'P2002') {
              // Unique constraint violation (offer_id, payment_method_id) — safe to ignore
              return;
            }
            throw err;
          }
        })
      );
    }

    return NextResponse.json({ offer: created }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
