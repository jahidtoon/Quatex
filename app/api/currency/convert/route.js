import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function toNumberSafe(v, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

export async function GET() {
  try {
    const rates = await prisma.currency_rates.findMany({
      where: { is_active: true },
      orderBy: [{ from_currency: 'asc' }, { to_currency: 'asc' }],
    });
    return NextResponse.json({ rates });
  } catch (e) {
    console.error('GET /api/currency/convert error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const from_currency = (body.from_currency || 'USD').toUpperCase();
    const to_currency = (body.to_currency || 'USD').toUpperCase();
    const amount = toNumberSafe(body.amount, 0);

    if (!from_currency || !to_currency) {
      return NextResponse.json({ error: 'from_currency and to_currency are required' }, { status: 400 });
    }
    if (from_currency === to_currency) {
      return NextResponse.json({ converted_amount: amount, rate: 1, limits: null });
    }

    // Try direct rate first
    let rateRow = await prisma.currency_rates.findUnique({
      where: { from_currency_to_currency: { from_currency, to_currency } },
    });

    let rate = null;
    let min_amount = null;
    let max_amount = null;

    if (rateRow && rateRow.is_active !== false) {
      rate = Number(rateRow.rate);
      min_amount = toNumberSafe(rateRow.min_amount, 0);
      max_amount = toNumberSafe(rateRow.max_amount, Number.MAX_SAFE_INTEGER);
    } else {
      // Try reverse pair and invert
      const rev = await prisma.currency_rates.findUnique({
        where: { from_currency_to_currency: { from_currency: to_currency, to_currency: from_currency } },
      });
      if (rev && rev.is_active !== false) {
        const r = Number(rev.rate);
        rate = r > 0 ? 1 / r : null;
        // For limits, mirror source currency constraints if available
        min_amount = toNumberSafe(rev.min_amount, 0);
        max_amount = toNumberSafe(rev.max_amount, Number.MAX_SAFE_INTEGER);
      }
    }

    if (!rate || rate <= 0) {
      return NextResponse.json({ error: 'Conversion rate not found' }, { status: 404 });
    }

    const converted = Number(amount) * rate;
    return NextResponse.json({
      from_currency,
      to_currency,
      amount,
      rate,
      converted_amount: converted,
      limits: { min_amount, max_amount },
    });
  } catch (e) {
    console.error('POST /api/currency/convert error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}