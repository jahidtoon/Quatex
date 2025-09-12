import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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

// Mock affiliate dashboard data
const mockAffiliateData = {
  id: 'AFF001',
  name: 'Demo Affiliate',
  email: 'affiliate@quatex.com',
  status: 'Active',
  tier: 'Gold',
  commissionRate: 45,
  referralCode: 'AFF001',
  joinDate: '2024-01-15',
  
  // Overview stats
  stats: {
    totalReferrals: 156,
    activeReferrals: 89,
    totalEarnings: 15420.50,
    monthlyEarnings: 2840.25,
    weeklyEarnings: 710.14,
    commissionBalance: 1250.75,
    pendingPayments: 500.00,
    clicksToday: 47,
    conversionsToday: 3,
    conversionRate: 17.0
  },

  // Referral data
  referrals: [
    { 
      id: 1, 
      name: 'Ahmed Hassan', 
      email: 'ahmed@example.com', 
      joinDate: '2024-12-08', 
      status: 'Active', 
      earnings: 125.50,
      country: 'Bangladesh',
      totalDeposit: 2500,
      lastActivity: '2 hours ago',
      tier: 'Bronze'
    },
    { 
      id: 2, 
      name: 'Sarah Khan', 
      email: 'sarah@example.com', 
      joinDate: '2024-12-07', 
      status: 'Active', 
      earnings: 89.25,
      country: 'Pakistan',
      totalDeposit: 1800,
      lastActivity: '1 day ago',
      tier: 'Silver'
    },
    { 
      id: 3, 
      name: 'Mike Johnson', 
      email: 'mike@example.com', 
      joinDate: '2024-12-06', 
      status: 'Pending', 
      earnings: 0,
      country: 'USA',
      totalDeposit: 0,
      lastActivity: '3 days ago',
      tier: 'None'
    },
    { 
      id: 4, 
      name: 'Fatima Ali', 
      email: 'fatima@example.com', 
      joinDate: '2024-12-05', 
      status: 'Active', 
      earnings: 234.75,
      country: 'UAE',
      totalDeposit: 4500,
      lastActivity: '5 hours ago',
      tier: 'Gold'
    },
    { 
      id: 5, 
      name: 'David Chen', 
      email: 'david@example.com', 
      joinDate: '2024-12-04', 
      status: 'Active', 
      earnings: 156.80,
      country: 'Singapore',
      totalDeposit: 3200,
      lastActivity: '30 mins ago',
      tier: 'Silver'
    }
  ],

  // Earnings history
  earnings: [
    { 
      id: 1, 
      date: '2024-12-08', 
      type: 'Referral Commission', 
      amount: 125.50, 
      status: 'Paid',
      referralName: 'Ahmed Hassan',
      description: 'Commission from user deposit',
      transactionId: 'TXN001'
    },
    { 
      id: 2, 
      date: '2024-12-07', 
      type: 'Monthly Bonus', 
      amount: 500.00, 
      status: 'Paid',
      description: 'Performance bonus for November 2024',
      transactionId: 'TXN002'
    },
    { 
      id: 3, 
      date: '2024-12-06', 
      type: 'Referral Commission', 
      amount: 89.25, 
      status: 'Pending',
      referralName: 'Sarah Khan',
      description: 'Commission from user trading activity',
      transactionId: 'TXN003'
    }
  ],

  // Commission tiers
  commissionTiers: [
    { name: 'Bronze', range: '0-50 Active', rate: 30, current: false },
    { name: 'Silver', range: '51-100 Active', rate: 40, current: false },
    { name: 'Gold', range: '101-200 Active', rate: 45, current: true },
    { name: 'Platinum', range: '200+ Active', rate: 60, current: false }
  ],

  // Marketing materials
  marketingMaterials: {
    banners: [
      { size: '300x250', format: 'PNG', downloads: 1250 },
      { size: '728x90', format: 'PNG', downloads: 980 },
      { size: '160x600', format: 'PNG', downloads: 750 }
    ],
    emailTemplates: [
      { name: 'Welcome Email', language: 'English', downloads: 340 },
      { name: 'Trading Tips', language: 'Bengali', downloads: 290 }
    ]
  },

  referralLink: 'https://quatex.com/register?ref=AFF001'
};

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
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (decoded?.type !== 'affiliate') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameter to determine what data to return
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all';

    let responseData = {
      success: true,
      affiliate: {
        id: mockAffiliateData.id,
        name: mockAffiliateData.name,
        email: mockAffiliateData.email,
        status: mockAffiliateData.status,
        tier: mockAffiliateData.tier,
        commissionRate: mockAffiliateData.commissionRate,
        referralCode: mockAffiliateData.referralCode,
        joinDate: mockAffiliateData.joinDate
      }
    };

    // Return specific data based on type
    switch (type) {
      case 'stats':
        responseData.stats = mockAffiliateData.stats;
        responseData.referralLink = mockAffiliateData.referralLink;
        break;
      
      case 'referrals':
        responseData.referrals = mockAffiliateData.referrals;
        break;
      
      case 'earnings':
        responseData.earnings = mockAffiliateData.earnings;
        responseData.stats = {
          totalEarnings: mockAffiliateData.stats.totalEarnings,
          commissionBalance: mockAffiliateData.stats.commissionBalance,
          pendingPayments: mockAffiliateData.stats.pendingPayments
        };
        break;
      
      case 'marketing':
        responseData.marketingMaterials = mockAffiliateData.marketingMaterials;
        responseData.commissionTiers = mockAffiliateData.commissionTiers;
        responseData.referralLink = mockAffiliateData.referralLink;
        break;
      
      default: // 'all'
        responseData.stats = mockAffiliateData.stats;
        responseData.referrals = mockAffiliateData.referrals;
        responseData.earnings = mockAffiliateData.earnings;
        responseData.marketingMaterials = mockAffiliateData.marketingMaterials;
        responseData.commissionTiers = mockAffiliateData.commissionTiers;
        responseData.referralLink = mockAffiliateData.referralLink;
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
      
      // Mock payout request
      const payout = {
        id: `P-${Date.now()}`,
        requested: new Date().toISOString().slice(0, 10),
        amount,
        method,
        status: 'Pending',
        message: 'Payout request submitted successfully'
      };
      
      return NextResponse.json({ 
        success: true, 
        message: 'Payout request submitted! You will receive confirmation within 24 hours.',
        payout 
      });
    }

    if (action === 'generate_link') {
      const { campaign = '', source = '', medium = '' } = body;
      const baseLink = mockAffiliateData.referralLink;
      const utmParams = new URLSearchParams();
      
      if (campaign) utmParams.append('utm_campaign', campaign);
      if (source) utmParams.append('utm_source', source);
      if (medium) utmParams.append('utm_medium', medium);
      
      const customLink = utmParams.toString() 
        ? `${baseLink}&${utmParams.toString()}`
        : baseLink;
      
      return NextResponse.json({ 
        success: true, 
        link: customLink,
        message: 'Custom referral link generated successfully'
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });

  } catch (error) {
    console.error('Affiliate dashboard POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
