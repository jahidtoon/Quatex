import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

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
  } catch {
    return null;
  }
}

export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) return unauthorized();

    // Fetch most recent trade
    const lastTrade = await prisma.trades.findFirst({
      where: { user_id: userId },
      orderBy: { open_time: 'desc' },
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
    });

    if (!lastTrade) {
      return NextResponse.json({ ok: true, message: 'No trades found', trade: null });
    }

    const accountType = (lastTrade.account_type || 'live').toLowerCase();
    const useDemo = accountType === 'demo';

    // Current balance for appropriate account type
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { balance: true, demo_balance: true },
    });
    const currentBalance = Number(useDemo ? user?.demo_balance || 0 : user?.balance || 0);

    // Pull a reasonable window of events
    const [deposits, withdrawals, trades] = await Promise.all([
      prisma.deposits.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' }, take: 150 }),
      prisma.withdrawals.findMany({ where: { user_id: userId }, orderBy: { created_at: 'desc' }, take: 150 }),
      prisma.trades.findMany({
        where: { user_id: userId },
        orderBy: { open_time: 'desc' },
        take: 300,
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
      }),
    ]);

    // Build event stream (live only; demo trades affect demo_balance but we still include for audit)
    const events = [];

    // Deposits and withdrawals only affect live balance by business rule
    for (const d of deposits) {
      events.push({ type: 'deposit', id: d.id, ts: d.created_at, delta: Number(d.amount || 0), label: 'Deposit' });
    }
    for (const w of withdrawals) {
      events.push({ type: 'withdrawal', id: w.id, ts: w.created_at, delta: -Number(w.amount || 0), label: 'Withdrawal' });
    }

    for (const t of trades) {
      const amount = Number(t.amount || 0);
      const payout = Number(t.payout || 0);
      const res = (t.result || '').toString().toLowerCase();
      const isDemo = (t.account_type || 'live').toLowerCase() === 'demo';

      // Only include trades of same account type as the last trade, to keep balance stream consistent
      if (useDemo !== isDemo) continue;

      if (t.open_time) {
        events.push({ type: 'trade_open', id: t.id, ts: t.open_time, delta: -amount, label: `OPEN ${t.symbol}` });
      }
      if (t.close_time && (res === 'win' || res === 'loss')) {
        const closeDelta = res === 'win' ? amount + payout : 0;
        events.push({ type: 'trade_close', id: t.id, ts: t.close_time, delta: closeDelta, label: `${res.toUpperCase()} ${t.symbol}` });
      }
    }

    // Sort ascending and compute running from inferred start so that sum of deltas reaches currentBalance
    events.sort((a, b) => new Date(a.ts) - new Date(b.ts));
    const totalDelta = events.reduce((s, e) => s + e.delta, 0);
    const inferredStart = currentBalance - totalDelta;

    let running = inferredStart;
    const timeline = events.map((e) => {
      const before = running;
      running += e.delta;
      const after = running;
      return { ...e, before, after };
    });

    // Extract snapshots for the last trade
    const openEvt = timeline.reverse().find((e) => e.type === 'trade_open' && e.id === lastTrade.id);
    timeline.reverse();
    const closeEvt = timeline.find((e) => e.type === 'trade_close' && e.id === lastTrade.id) || null;

    const snapshots = {
      inferredStartingBalance: Number(inferredStart.toFixed(2)),
      currentBalance: Number(currentBalance.toFixed(2)),
      balanceBeforeOpen: openEvt ? Number(openEvt.before.toFixed(2)) : null,
      balanceAfterOpen: openEvt ? Number(openEvt.after.toFixed(2)) : null,
      balanceAfterClose: closeEvt ? Number(closeEvt.after.toFixed(2)) : null,
      deltas: {
        open: openEvt ? Number((openEvt.after - openEvt.before).toFixed(2)) : null,
        close: closeEvt ? Number((closeEvt.after - closeEvt.before).toFixed(2)) : null,
      },
    };

    return NextResponse.json({ ok: true, trade: {
      id: lastTrade.id,
      symbol: lastTrade.symbol,
      amount: Number(lastTrade.amount || 0),
      direction: lastTrade.direction,
      status: lastTrade.status,
      result: lastTrade.result,
      payout: Number(lastTrade.payout || 0),
      open_time: lastTrade.open_time,
      close_time: lastTrade.close_time,
      account_type: lastTrade.account_type || 'live',
    }, snapshots });
  } catch (err) {
    console.error('[trades/last/summary] error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Failed to summarize last trade' }, { status: 500 });
  }
}
