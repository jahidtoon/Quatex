import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Get user statistics and recent activity
export async function GET(request) {
  try {
    // Get token from Authorization header or auth_token cookie
    let token = null;
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = request.cookies?.get?.('auth_token')?.value || (request.headers.get('cookie')||'').split(';').map(c=>c.trim()).find(c=>c.startsWith('auth_token='))?.split('=')[1] || null;
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }
    
    try {
      const authUser = await verifyToken(token);
      if (!authUser) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      const userId = authUser.id;

      // Get user basic info (tolerate older Prisma clients without tournament_balance)
      const supportsTournament = (() => {
        try { return Boolean(prisma.users?.fields?.tournament_balance); } catch { return false; }
      })();
      const baseSelect = { balance: true, demo_balance: true };
      const user = await prisma.users.findUnique({
        where: { id: userId },
        select: supportsTournament ? { ...baseSelect, tournament_balance: true } : baseSelect,
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Get deposits summary
      const depositsData = await prisma.deposits.aggregate({
        where: { user_id: userId },
        _sum: { amount: true },
        _count: true
      });

      // Get withdrawals summary
      const withdrawalsData = await prisma.withdrawals.aggregate({
        where: { user_id: userId },
        _sum: { amount: true },
        _count: true
      });

      // Get trades summary
      const tradesData = await prisma.trades.aggregate({
        where: { user_id: userId },
        _count: true
      });

      // Get winning trades count
      const winningTrades = await prisma.trades.count({
        where: {
          user_id: userId,
          result: { in: ['win', 'WIN'] }
        }
      });

      // Get recent deposits
      const recentDeposits = await prisma.deposits.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          created_at: true
        }
      });

      // Get recent withdrawals
      const recentWithdrawals = await prisma.withdrawals.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          created_at: true
        }
      });

      // Get recent trades
      const recentTrades = await prisma.trades.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          symbol: true,
          amount: true,
          direction: true,
          result: true,
          open_time: true,
          close_time: true
        }
      });

      // Determine if user is in any ACTIVE tournament (controls visibility of Tournament account)
      let activeTournamentCount = 0;
      try {
        activeTournamentCount = await prisma.tournament_participants.count({
          where: {
            user_id: userId,
            tournament: { status: 'ACTIVE' }
          }
        });
      } catch {}

      // Current balance is the trading account balance from users table.
      // Note: Crypto wallet balances are separate and shown via /api/users/wallet.
  const currentBalance = Number(user.balance || 0);

      // Calculate statistics
      const totalDeposits = Number(depositsData._sum.amount || 0);
      const totalWithdrawals = Number(withdrawalsData._sum.amount || 0);
    const demoBalance = Number(user.demo_balance || 0);
    const tournamentBalance = supportsTournament ? Number(user?.tournament_balance || 0) : 0;
      const totalTrades = tradesData._count;
      const successRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
      const profitLoss = currentBalance - totalDeposits + totalWithdrawals;

      // Format recent activity
      const recentActivity = [];

      // Add recent deposits
      recentDeposits.forEach(deposit => {
        recentActivity.push({
          id: deposit.id,
          type: 'deposit',
          description: `${deposit.method} Deposit`,
          amount: `+$${Number(deposit.amount).toFixed(2)}`,
          date: deposit.created_at,
          status: deposit.status || 'completed'
        });
      });

      // Add recent withdrawals
      recentWithdrawals.forEach(withdrawal => {
        recentActivity.push({
          id: withdrawal.id,
          type: 'withdrawal',
          description: `${withdrawal.method} Withdrawal`,
          amount: `-$${Number(withdrawal.amount).toFixed(2)}`,
          date: withdrawal.created_at,
          status: withdrawal.status || 'pending'
        });
      });

      // Add recent trades
      recentTrades.forEach(trade => {
        const isWin = trade.result === 'win';
        const amount = Number(trade.amount || 0);
        recentActivity.push({
          id: trade.id,
          type: 'trade',
          description: `${trade.symbol} ${trade.direction?.toUpperCase()} Trade`,
          amount: `${isWin ? '+' : '-'}$${amount.toFixed(2)}`,
          date: trade.close_time || trade.open_time,
          status: 'completed'
        });
      });

      // Sort by date (most recent first)
      recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));

      return NextResponse.json({
        success: true,
        stats: {
          totalDeposits,
          totalWithdrawals,
          currentBalance,
          demoBalance,
          tournamentBalance,
          isInActiveTournament: activeTournamentCount > 0,
          totalTrades,
          successRate: Math.round(successRate * 10) / 10,
          profitLoss
        },
        recentActivity: recentActivity.slice(0, 10) // Return top 10
      });

    } catch (jwtError) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
