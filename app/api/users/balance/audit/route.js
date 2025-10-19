import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

function unauthorized(message = 'Authentication required') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Fallback to auth_token cookie
    try {
      const cookieToken = request.cookies?.get?.('auth_token')?.value;
      if (cookieToken) return cookieToken;
    } catch {}
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenFromCookie = cookieHeader
      .split(';')
      .map((c) => c.trim())
      .find((c) => c.startsWith('auth_token='))?.split('=')[1];
    return tokenFromCookie || null;
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
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return unauthorized();

  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get('limit'));
  const typeParam = (searchParams.get('type') || 'live').toLowerCase();
  const accountFilter = ['live','demo','tournament'].includes(typeParam) ? typeParam : 'live';
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 100) : 50;

  // Fetch current balance for selected account type
  const user = await prisma.users.findUnique({ where: { id: userId }, select: { balance: true, demo_balance: true, tournament_balance: true } });
  const currentBalance = Number(accountFilter === 'demo' ? user?.demo_balance || 0 : accountFilter === 'tournament' ? user?.tournament_balance || 0 : user?.balance || 0);

    // Fetch recent events - simplified approach
    const [deposits, withdrawals, trades] = await Promise.all([
      prisma.deposits.findMany({ 
        where: { user_id: userId }, 
        orderBy: { created_at: 'desc' }, 
        take: limit 
      }).catch(() => []),
      prisma.withdrawals.findMany({ 
        where: { user_id: userId }, 
        orderBy: { created_at: 'desc' }, 
        take: limit 
      }).catch(() => []),
      prisma.trades.findMany({
        where: { user_id: userId },
        orderBy: { open_time: 'desc' },
        take: limit,
        select: {
          id: true,
          symbol: true,
          amount: true,
          direction: true,
          result: true,
          payout: true,
          open_time: true,
          close_time: true,
          status: true,
          account_type: true,
        },
      }).catch(() => []),
    ]);

    const events = [];

    // Deposits/Withdrawals affect only LIVE balance
    if (accountFilter === 'live') {
      const isCompleted = (val) => {
        const s = (val || '').toString().toLowerCase();
        return s.includes('complete') || s.includes('confirmed') || s === 'paid' || s === 'success';
      };
      for (const d of deposits) {
        if (!isCompleted(d.status)) continue; // only count finalized deposits
        events.push({
          type: 'deposit',
          id: d.id,
          ts: d.created_at,
          delta: Number(d.amount || 0),
          label: `${d.method || 'Deposit'} (${d.status || 'completed'})`,
        });
      }
      for (const w of withdrawals) {
        if (!isCompleted(w.status)) continue; // only count finalized withdrawals
        events.push({
          type: 'withdrawal',
          id: w.id,
          ts: w.created_at,
          delta: -Number(w.amount || 0),
          label: `${w.method || 'Withdrawal'} (${w.status || 'completed'})`,
        });
      }
    }

    // Trades: open (-amount), close (win => +amount+payout; loss => +0)
    for (const t of trades) {
      const amount = Number(t.amount || 0);
      const payout = Number(t.payout || 0);
      const res = (t.result || '').toString().toLowerCase();
      const acct = (t.account_type || 'live').toLowerCase();

      if (acct !== accountFilter) continue;

      // open event
      if (t.open_time) {
        events.push({
          type: 'trade_open',
          id: t.id,
          ts: t.open_time,
          delta: -amount,
          label: `Trade OPEN ${t.symbol} ${t.direction} (${acct})`,
        });
      }

      // close event
      if (t.close_time && (res === 'win' || res === 'loss')) {
        const closeDelta = res === 'win' ? amount + payout : 0;
        events.push({
          type: 'trade_close',
          id: t.id,
          ts: t.close_time,
          delta: closeDelta,
          label: `Trade ${res.toUpperCase()} ${t.symbol} ${t.direction} (${acct}, payout: ${payout.toFixed(2)})`,
        });
      }
    }

    // Sort by time ascending
    events.sort((a, b) => new Date(a.ts) - new Date(b.ts));

    // Compute totals and inferred starting balance
    const totalDelta = events.reduce((s, e) => s + e.delta, 0);
    const inferredStart = currentBalance - totalDelta;

    // Build running balance forward from inferred start
    let running = inferredStart;
    const withRunning = events.map((e) => {
      running += e.delta;
      return { ...e, runningBalance: Number(running.toFixed(2)) };
    });

    return NextResponse.json({
      ok: true,
      currentBalance: Number(currentBalance.toFixed(2)),
      inferredStartingBalance: Number(inferredStart.toFixed(2)),
      totalDelta: Number(totalDelta.toFixed(2)),
      count: withRunning.length,
      events: withRunning,
      accountType: accountFilter,
    });
  } catch (err) {
    console.error('[balance/audit] error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Failed to build audit' }, { status: 500 });
  }
}
