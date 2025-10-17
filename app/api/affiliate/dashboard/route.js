import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Helper: get token from Authorization header or cookie
function getToken(req) {
  try {
    const auth = req.headers.get('authorization');
    if (auth && auth.startsWith('Bearer ')) return auth.substring(7);
  } catch {}
  try {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(/affiliate_token=([^;]+)/);
    if (match) return decodeURIComponent(match[1]);
  } catch {}
  return null;
}

// Helper to gather DB-backed data for the affiliate
async function buildAffiliateData(affiliateId) {
  const aff = await prisma.affiliates.findUnique({ where: { id: affiliateId } });
  if (!aff) return null;

  const referrals = await prisma.affiliate_referrals.findMany({
    where: { affiliate_id: affiliateId },
    include: { user: true },
    orderBy: { created_at: 'desc' },
    take: 100
  });

  const earningsAll = await prisma.affiliate_commissions.findMany({
    where: { affiliate_id: affiliateId },
    orderBy: { created_at: 'desc' },
    take: 100
  });

  const stats = {
    totalReferrals: referrals.length,
    activeReferrals: referrals.filter(r => r.status === 'Active').length,
    totalEarnings: earningsAll.reduce((s, e) => s + Number(e.amount || 0), 0),
    commissionBalance: earningsAll
      .filter(e => e.status === 'pending')
      .reduce((s, e) => s + Number(e.amount || 0), 0),
    pendingPayments: (await prisma.affiliate_payouts.aggregate({
      where: { affiliate_id: affiliateId, status: 'Pending' },
      _sum: { amount: true }
    }))._sum.amount || 0,
  };

  const referralDTO = referrals.map((r) => ({
    id: r.id,
    name: r.user?.name || r.user?.email || 'User',
    email: r.user?.email || '',
    joinDate: r.created_at.toISOString().slice(0,10),
    status: r.status,
    earnings: Number(r.earnings || 0),
    country: r.user?.country || '',
    totalDeposit: Number(r.total_deposit || 0),
    lastActivity: r.updated_at.toISOString(),
    tier: 'N/A'
  }));

  const earningsDTO = earningsAll.map((e) => ({
    id: e.id,
    date: e.created_at.toISOString().slice(0,10),
    type: e.type,
    amount: Number(e.amount || 0),
    status: e.status === 'paid' ? 'Paid' : 'Pending',
    referralName: undefined,
    description: e.description || undefined,
    transactionId: e.transaction_id || undefined
  }));

  return {
    affiliate: {
      id: aff.id,
      name: aff.name,
      email: aff.email,
      status: aff.status,
      tier: aff.tier,
      commissionRate: aff.commission_rate,
      referralCode: aff.referral_code,
      joinDate: aff.created_at.toISOString().slice(0,10)
    },
    stats,
    referrals: referralDTO,
    earnings: earningsDTO,
    marketingMaterials: { banners: [], emailTemplates: [] },
    commissionTiers: [
      { name: 'Bronze', range: '0-50 Active', rate: 30 },
      { name: 'Silver', range: '51-100 Active', rate: 40 },
      { name: 'Gold', range: '101-200 Active', rate: 45 },
      { name: 'Platinum', range: '200+ Active', rate: 60 },
    ],
    referralLink: `https://quatex.com/register?ref=${aff.referral_code}`
  };
}

export async function GET(request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (e) {
      console.error('JWT verify failed:', e && (e.stack || e.message || e));
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded?.type !== 'affiliate') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameter to determine what data to return
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    const data = await buildAffiliateData(decoded.affiliateId);
    if (!data) return NextResponse.json({ error: 'Affiliate not found' }, { status: 404 });

    let responseData = { success: true, affiliate: data.affiliate };

    // Return specific data based on type
    switch (type) {
      case 'stats':
        responseData.stats = data.stats;
        responseData.referralLink = data.referralLink;
        break;
      
      case 'referrals':
        responseData.referrals = data.referrals;
        break;
      
      case 'earnings':
        responseData.earnings = data.earnings;
        responseData.stats = {
          totalEarnings: data.stats.totalEarnings,
          commissionBalance: data.stats.commissionBalance,
          pendingPayments: data.stats.pendingPayments
        };
        break;
      
      case 'marketing':
        responseData.marketingMaterials = data.marketingMaterials;
        responseData.commissionTiers = data.commissionTiers;
        responseData.referralLink = data.referralLink;
        break;
      
      default: // 'all'
        responseData.stats = data.stats;
        responseData.referrals = data.referrals;
        responseData.earnings = data.earnings;
        responseData.marketingMaterials = data.marketingMaterials;
        responseData.commissionTiers = data.commissionTiers;
        responseData.referralLink = data.referralLink;
        break;
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Affiliate dashboard GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const token = getToken(request);
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    try {
      jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    } catch (e) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body || {};

    if (action === 'request_payout') {
      const { amount = 0, method = 'Bitcoin' } = body;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const payout = await prisma.affiliate_payouts.create({
        data: { affiliate_id: decoded.affiliateId, amount, method, status: 'Pending' }
      });
      return NextResponse.json({ success: true, message: 'Payout request submitted', payout });
    }

    if (action === 'generate_link') {
      const { campaign = '', source = '', medium = '' } = body;
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const aff = await prisma.affiliates.findUnique({ where: { id: decoded.affiliateId } });
      const baseLink = `https://quatex.com/register?ref=${aff?.referral_code || ''}`;
      const utmParams = new URLSearchParams();
      
      if (campaign) utmParams.append('utm_campaign', campaign);
      if (source) utmParams.append('utm_source', source);
      if (medium) utmParams.append('utm_medium', medium);
      
      const customLink = utmParams.toString() 
        ? `${baseLink}&${utmParams.toString()}`
        : baseLink;
      
      return NextResponse.json({ success: true, link: customLink, message: 'Custom referral link generated successfully' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('Affiliate dashboard POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
