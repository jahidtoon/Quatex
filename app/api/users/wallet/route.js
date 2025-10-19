import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

// GET: return wallet ledger entries and computed balances
export async function GET(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const entries = await prisma.wallet_ledger.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
      take: 100,
      select: { id: true, type: true, asset: true, amount: true, meta: true, created_at: true }
    });

    const balances = {};
    for (const e of entries) {
      const a = e.asset;
      const v = Number(e.amount);
      balances[a] = (balances[a] || 0) + v;
    }

    return NextResponse.json({ entries, balances });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
