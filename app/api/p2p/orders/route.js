import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

// GET: List my orders (maker/taker)
export async function GET(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role'); // 'maker'|'taker'|undefined
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20', 10), 100);

    let where = {};
    if (role === 'maker') where.maker_id = user.id;
    else if (role === 'taker') where.taker_id = user.id;
    else where.OR = [{ maker_id: user.id }, { taker_id: user.id }];
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.p2p_orders.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.p2p_orders.count({ where }),
    ]);
    return NextResponse.json({ items, page, pageSize, total });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// POST: Create order (escrow hold for SELL)
export async function POST(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { offer_id, amount_asset, amount_fiat } = body || {};
    if (!offer_id || (!amount_asset && !amount_fiat)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Fetch offer
    const offer = await prisma.p2p_offers.findUnique({ where: { id: offer_id } });
    if (!offer || offer.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Offer not found or inactive' }, { status: 404 });
    }

    // Calculate amounts
    let assetAmount = amount_asset;
    let fiatAmount = amount_fiat;
    if (!assetAmount && fiatAmount) {
      // Calculate asset from fiat
      if (offer.price_type === 'FIXED' && offer.fixed_price) {
        assetAmount = fiatAmount / Number(offer.fixed_price);
      } else {
        return NextResponse.json({ error: 'Floating price not supported in demo' }, { status: 400 });
      }
    }
    if (!fiatAmount && assetAmount) {
      if (offer.price_type === 'FIXED' && offer.fixed_price) {
        fiatAmount = assetAmount * Number(offer.fixed_price);
      } else {
        return NextResponse.json({ error: 'Floating price not supported in demo' }, { status: 400 });
      }
    }

    // Validate limits
    if (assetAmount < offer.min_amount_asset || assetAmount > offer.max_amount_asset) {
      return NextResponse.json({ error: 'Asset amount out of offer limits' }, { status: 400 });
    }
    if (fiatAmount < offer.min_limit_fiat || fiatAmount > offer.max_limit_fiat) {
      return NextResponse.json({ error: 'Fiat amount out of offer limits' }, { status: 400 });
    }

    // SELL: escrow hold
    let escrowLedgerId = null;
    if (offer.side === 'SELL') {
      // Seller must have enough available balance
      const sellerId = offer.user_id;
      const sellerBalance = await prisma.wallet_ledger.aggregate({
        _sum: { amount: true },
        where: { user_id: sellerId, asset: offer.asset_symbol }
      });
      const available = Number(sellerBalance._sum.amount || 0);
      if (available < assetAmount) {
        return NextResponse.json({ error: 'Seller has insufficient balance for escrow' }, { status: 400 });
      }
      // Create escrow hold ledger
      const escrow = await prisma.wallet_ledger.create({
        data: {
          user_id: sellerId,
          type: 'P2P_ESCROW_HOLD',
          asset: offer.asset_symbol,
          amount: -assetAmount,
          meta: { order_escrow: true, offer_id: offer.id }
        }
      });
      escrowLedgerId = escrow.id;
    }

    // Create order
    const order = await prisma.p2p_orders.create({
      data: {
        offer_id: offer.id,
        maker_id: offer.user_id,
        taker_id: user.id,
        side: offer.side,
        asset_symbol: offer.asset_symbol,
        fiat_currency: offer.fiat_currency,
        price: offer.fixed_price,
        amount_asset: assetAmount,
        amount_fiat: fiatAmount,
        status: offer.side === 'SELL' ? 'ESCROW_HELD' : 'PENDING',
        escrow_held: offer.side === 'SELL',
        escrow_ledger_id: escrowLedgerId,
        reference_code: 'P2P-' + Math.floor(Math.random()*1000000),
        meta: { from_offer: offer.id }
      }
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
