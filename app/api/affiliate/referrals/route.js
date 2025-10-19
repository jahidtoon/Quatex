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

    const rows = await prisma.affiliate_referrals.findMany({
      where: { affiliate_id: decoded.affiliateId },
      include: { user: true },
      orderBy: { created_at: 'desc' }
    });

    const countries = Array.from(new Set(rows.map(r => r.user?.country).filter(Boolean)));
    const resp = {
      success: true,
      stats: {
        totalReferrals: rows.length,
        activeReferrals: rows.filter(r => r.status === 'Active').length,
        pendingReferrals: rows.filter(r => r.status !== 'Active').length,
        thisMonth: rows.filter(r => r.created_at.getMonth() === new Date().getMonth()).length,
        conversionRate: 0
      },
      referrals: rows.map(r => ({
        id: r.id,
        name: r.user?.name || r.user?.email,
        email: r.user?.email,
        phone: r.user?.phone,
        country: r.user?.country,
        joinDate: r.created_at.toISOString().slice(0,10),
        lastActivity: r.updated_at.toISOString().slice(0,10),
        status: r.status,
        totalDeposit: Number(r.total_deposit || 0),
        totalTrades: r.total_trades || 0,
        earnings: Number(r.earnings || 0),
        tier: 'N/A'
      })),
      countries
    };
    return NextResponse.json(resp);
  } catch (e) {
    console.error('referrals GET error', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
