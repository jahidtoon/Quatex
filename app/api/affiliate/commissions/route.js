import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const auth = request.headers.get('authorization');
    const token = auth?.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

    const list = await prisma.affiliate_commissions.findMany({
      where: { affiliate_id: decoded.affiliateId },
      orderBy: { created_at: 'desc' }
    });

    const stats = {
      totalCommission: list.reduce((s, e) => s + Number(e.amount || 0), 0),
      thisMonth: list.filter(e => e.created_at.getMonth() === new Date().getMonth())
                     .reduce((s, e) => s + Number(e.amount || 0), 0),
      pendingAmount: list.filter(e => e.status !== 'paid').reduce((s, e) => s + Number(e.amount || 0), 0),
      paidAmount: list.filter(e => e.status === 'paid').reduce((s, e) => s + Number(e.amount || 0), 0),
      avgCommissionRate: Math.round(list.reduce((s, e) => s + Number(e.rate || 0), 0) / (list.length || 1))
    };

    const commissions = list.map((c) => ({
      id: c.id,
      referralName: '',
      referralEmail: '',
      tradeAmount: 0,
      commissionRate: c.rate,
      commissionAmount: Number(c.amount || 0),
      date: c.created_at.toISOString().slice(0,10),
      status: c.status === 'paid' ? 'paid' : 'pending',
      transactionId: c.transaction_id || undefined
    }));

    return NextResponse.json({ success: true, stats, commissions, tiers: [
      { name: 'Bronze', rate: 30, minReferrals: 0 },
      { name: 'Silver', rate: 35, minReferrals: 51 },
      { name: 'Gold', rate: 45, minReferrals: 101 },
      { name: 'Platinum', rate: 60, minReferrals: 201 }
    ] });
  } catch (e) {
    console.error('commissions GET error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
