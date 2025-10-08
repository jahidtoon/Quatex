import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getUserAnalyticsData, getDashboardMetrics } from '@/lib/adminMetrics';

function unauthorized(message = 'Authentication required') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.split(' ')[1];
}

async function getUserId(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const JWT_SECRET = process.env.JWT_SECRET || 'dev_change_me_please';

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.sub;
  } catch (error) {
    console.warn('[analytics] Invalid token', error.message);
    return null;
  }
}

// Combines user-specific trading + financial analytics
export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorized();
    }

    const analytics = await getUserAnalyticsData(userId);

    // Derive some extra computed fields for the frontend convenience
    const totalProfitApprox = analytics.financial.netDeposits; // placeholder until PnL calc implemented
    const successRate = analytics.trading.totalTrades > 0
      ? (analytics.trading.winningTrades / analytics.trading.totalTrades) * 100
      : 0;

    return NextResponse.json({
      ok: true,
      analytics,
      derived: {
        totalProfitApprox,
        successRate: Math.round(successRate * 100) / 100 // Round to 2 decimal places
      }
    }, { status: 200 });
  } catch (err) {
    console.error('Analytics summary error', err);
    return NextResponse.json({ ok: false, error: err.message || 'Failed to load analytics' }, { status: 500 });
  }
}
