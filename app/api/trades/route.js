import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { findTradableAsset } from '@/lib/tradeAssets';
import { Prisma } from '@prisma/client';
import { startTradeCloser } from '@/lib/tradeCloser';
import { startPriceUpdater } from '@/lib/priceUpdater';

let backgroundStarted = false;
function ensureBackground() {
  if (backgroundStarted) return;
  backgroundStarted = true;
  try {
    startPriceUpdater();
    startTradeCloser();
    console.log('[trades] background processes ensured');
  } catch (e) {
    console.warn('[trades] failed starting background jobs', e.message);
  }
}

function unauthorized(message = 'Authentication required') {
  return NextResponse.json({ error: message }, { status: 401 });
}

function badRequest(message) {
  return NextResponse.json({ error: message }, { status: 400 });
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
    console.warn('[trades] Invalid token', error.message);
    return null;
  }
}

function serializeTrade(trade) {
  return {
    id: trade.id,
    symbol: trade.symbol,
    amount: trade.amount ? Number(trade.amount) : 0,
    direction: trade.direction,
    result: trade.result || 'pending',
    status: trade.status || trade.result || 'pending',
    entryPrice: trade.entry_price ? Number(trade.entry_price) : null,
    payout: trade.payout ? Number(trade.payout) : null,
    openTime: trade.open_time,
    closeTime: trade.close_time,
    createdAt: trade.created_at ?? trade.open_time,
    updatedAt: trade.updated_at ?? trade.close_time,
  };
}

export async function GET(request) {
  try {
    ensureBackground();
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const limitParam = Number(searchParams.get('limit'));
    const offsetParam = Number(searchParams.get('offset'));
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 20;
    const offset = Number.isFinite(offsetParam) && offsetParam > 0 ? Math.floor(offsetParam) : 0;
    const statusFilter = searchParams.get('status');
    const resultFilter = searchParams.get('result');

    const andConditions = [{ user_id: userId }];

    if (resultFilter) {
      andConditions.push({ result: resultFilter });
    }

    if (statusFilter) {
      const orConditions = [{ status: statusFilter }];
      if (!resultFilter) {
        orConditions.push({ result: statusFilter });
      }
      andConditions.push({ OR: orConditions });
    }

    const trades = await prisma.trades.findMany({
      where: { AND: andConditions },
      orderBy: { open_time: 'desc' },
      take: limit,
      skip: offset,
    });

    return NextResponse.json({
      success: true,
      trades: trades.map(serializeTrade),
    });
  } catch (error) {
    console.error('[trades][GET] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    ensureBackground();
    const userId = await getUserId(request);
    if (!userId) {
      return unauthorized();
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.warn('[trades][POST] invalid json body', parseError);
      return badRequest('Invalid JSON payload');
    }

    const {
      symbol,
      amount,
      duration,
      direction,
      price,
      accountType = 'live',
    } = body || {};

    const normalizedAccountType = typeof accountType === 'string'
      ? accountType.trim().toLowerCase()
      : 'live';
    const isDemo = normalizedAccountType === 'demo';
    const isTournament = normalizedAccountType === 'tournament';

    if (!symbol || typeof symbol !== 'string') {
      return badRequest('Symbol is required');
    }

    const tradableAsset = await findTradableAsset(symbol);
    if (!tradableAsset) {
      return badRequest('Selected asset is not tradable');
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return badRequest('Amount must be a positive number');
    }

    const numericDuration = Number(duration);
    if (!Number.isFinite(numericDuration) || numericDuration < 10 || numericDuration > 24 * 60 * 60) {
      return badRequest('Duration must be between 10 seconds and 24 hours');
    }

  const normalizedDirection = typeof direction === 'string' ? direction.toUpperCase() : '';
    if (!['BUY', 'SELL'].includes(normalizedDirection)) {
      return badRequest('Direction must be BUY or SELL');
    }

    const numericPrice = Number(price);
    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      return badRequest('Price must be a positive number');
    }

    // Fetch user record with both balances; gracefully fallback if demo_balance is unavailable
    let userRecord;
    let supportsDemoBalance = true;
    const supportsDemoColumn = (() => {
      try {
        return prisma.users.fields?.demo_balance != null;
      } catch {
        return true;
      }
    })();
    supportsDemoBalance = supportsDemoColumn;
    try {
      userRecord = await prisma.users.findUnique({
        where: { id: userId },
  select: { balance: true, demo_balance: true, tournament_balance: true, is_suspended: true },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientValidationError && error.message.includes('demo_balance')) {
        console.warn('[trades][POST] demo_balance not present in Prisma client – falling back to full user fetch');
        supportsDemoBalance = false;
      } else {
        throw error;
      }
    }

    if (!userRecord) {
      if (supportsDemoBalance) {
        userRecord = await prisma.users.findUnique({ where: { id: userId } });
      } else {
  const fallbackRows = await prisma.$queryRaw`SELECT balance, demo_balance, tournament_balance FROM users WHERE id = ${userId} LIMIT 1`;
        userRecord = Array.isArray(fallbackRows) ? fallbackRows[0] : null;
      }
    }

    // Block trading for suspended accounts
    if (userRecord?.is_suspended) {
      return NextResponse.json({ error: 'Account suspended' }, { status: 403 });
    }

    if (!userRecord) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const hasDemoBalance = userRecord && (
      Object.prototype.hasOwnProperty.call(userRecord, 'demo_balance') ||
      Object.prototype.hasOwnProperty.call(userRecord, 'demoBalance')
    );

    const hasTournamentBalance = userRecord && (
      Object.prototype.hasOwnProperty.call(userRecord, 'tournament_balance') ||
      Object.prototype.hasOwnProperty.call(userRecord, 'tournamentBalance')
    );

    const supportsAccountType = (() => {
      try {
        return Boolean(prisma.trades.fields.account_type);
      } catch {
        return !!(userRecord && (userRecord.account_type || userRecord.accountType));
      }
    })();

    if (!supportsDemoBalance && !hasDemoBalance) {
      console.warn('[trades][POST] demo_balance column missing in database or Prisma schema – demo trades will use live balance');
    }

    const toNumber = (value) => {
      if (value == null) return 0;
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      if (value instanceof Prisma.Decimal) {
        return Number(value.toString());
      }
      if (typeof value === 'object' && value !== null && 'toString' in value) {
        const parsed = Number(value.toString());
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };

  const balanceValue = userRecord.balance ?? 0;
  const rawDemoBalance = userRecord.demo_balance ?? userRecord.demoBalance ?? null;
  const rawTournamentBalance = userRecord.tournament_balance ?? userRecord.tournamentBalance ?? null;

    const currentLive = toNumber(balanceValue);
  const currentDemo = hasDemoBalance ? toNumber(rawDemoBalance) : currentLive;
  const currentTournament = hasTournamentBalance ? toNumber(rawTournamentBalance) : currentLive;
    const currentBalance = isDemo ? currentDemo : isTournament ? currentTournament : currentLive;
    if (currentBalance < numericAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    const openTime = new Date();
    const closeTime = new Date(openTime.getTime() + numericDuration * 1000);

    const amountDecimal = new Prisma.Decimal(numericAmount.toFixed(2));
    const priceDecimal = new Prisma.Decimal(numericPrice.toFixed(8));
    const updatedBalance = new Prisma.Decimal(currentBalance.toString()).minus(amountDecimal);

    let trade;
    let userBalance;
  if (isDemo && hasDemoBalance) {
      if (supportsDemoBalance) {
        [trade, userBalance] = await prisma.$transaction([
          prisma.trades.create({
            data: {
              symbol,
              amount: amountDecimal,
              direction: normalizedDirection,
              result: 'pending',
              status: 'open',
              ...(supportsAccountType ? { account_type: 'demo' } : {}),
              open_time: openTime,
              close_time: closeTime,
              entry_price: priceDecimal,
              users: {
                connect: { id: userId },
              },
            },
          }),
          prisma.users.update({
            where: { id: userId },
            data: { demo_balance: updatedBalance },
            select: { demo_balance: true },
          }),
        ]);
        return NextResponse.json({
          success: true,
          trade: serializeTrade(trade),
          balance: Number(userBalance.demo_balance),
        });
      }

      const amountForSql = amountDecimal.toString();
      const result = await prisma.$transaction(async (tx) => {
        const createdTrade = await tx.trades.create({
          data: {
            symbol,
            amount: amountDecimal,
            direction: normalizedDirection,
            result: 'pending',
            status: 'open',
            ...(supportsAccountType ? { account_type: 'demo' } : {}),
            open_time: openTime,
            close_time: closeTime,
            entry_price: priceDecimal,
            users: {
              connect: { id: userId },
            },
          },
        });

        await tx.$executeRaw`UPDATE users SET demo_balance = demo_balance - ${amountForSql} WHERE id = ${userId}`;
        const updatedRows = await tx.$queryRaw`SELECT demo_balance FROM users WHERE id = ${userId} LIMIT 1`;

        return {
          tradeRecord: createdTrade,
          updatedDemoBalance: Array.isArray(updatedRows) ? updatedRows[0]?.demo_balance ?? updatedRows[0]?.demoBalance ?? null : null,
        };
      });

      return NextResponse.json({
        success: true,
        trade: serializeTrade(result.tradeRecord),
        balance: toNumber(result.updatedDemoBalance),
      });
    }

    [trade, userBalance] = await prisma.$transaction([
      prisma.trades.create({
        data: {
          symbol,
          amount: amountDecimal,
          direction: normalizedDirection,
          result: 'pending',
          status: 'open',
          ...(supportsAccountType ? { account_type: isDemo ? 'demo' : isTournament ? 'tournament' : 'live' } : {}),
          open_time: openTime,
          close_time: closeTime,
          entry_price: priceDecimal,
          users: {
            connect: { id: userId },
          },
        },
      }),
      prisma.users.update({
        where: { id: userId },
        data: isDemo && !hasDemoBalance
          ? { balance: updatedBalance }
          : isDemo
            ? { demo_balance: updatedBalance }
            : isTournament && hasTournamentBalance
              ? { tournament_balance: updatedBalance }
              : { balance: updatedBalance },
        select: isDemo && !hasDemoBalance
          ? { balance: true }
          : isDemo
            ? { demo_balance: true }
            : isTournament && hasTournamentBalance
              ? { tournament_balance: true }
              : { balance: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      trade: serializeTrade(trade),
      balance: isDemo && hasDemoBalance
        ? toNumber(userBalance.demo_balance)
        : isTournament && hasTournamentBalance
          ? toNumber(userBalance.tournament_balance)
          : toNumber(userBalance.balance),
    });
  } catch (error) {
    console.error('[trades][POST] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
