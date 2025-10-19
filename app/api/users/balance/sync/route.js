import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

export async function POST(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const agg = await prisma.wallet_ledger.aggregate({ where: { user_id: user.id, asset: 'USD' }, _sum: { amount: true } });
    const usd = Number(agg._sum.amount || 0);
    await prisma.users.update({ where: { id: user.id }, data: { balance: usd } });
    return NextResponse.json({ success: true, balance: usd });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
