import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) return authHeader.split(' ')[1];
  const cookieToken = request.cookies?.get?.('auth_token')?.value;
  if (cookieToken) return cookieToken;
  const cookieHeader = request.headers.get('cookie') || '';
  return cookieHeader.split(';').map(c => c.trim()).find(c => c.startsWith('auth_token='))?.split('=')[1] || null;
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

// POST - Join tournament
export async function POST(request, { params }) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { id: tournamentId } = params;

    // Get tournament details
    const tournament = await prisma.tournaments.findUnique({
      where: { id: tournamentId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Check if tournament is joinable
    if (tournament.status !== 'ACTIVE' && tournament.status !== 'UPCOMING') {
      return NextResponse.json({ 
        error: 'Tournament is not accepting new participants' 
      }, { status: 400 });
    }

    // Check if already joined
    const existing = await prisma.tournament_participants.findUnique({
      where: {
        tournament_id_user_id: {
          tournament_id: tournamentId,
          user_id: userId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ 
        error: 'You have already joined this tournament' 
      }, { status: 400 });
    }

    // Check max participants
    if (tournament.max_participants && tournament._count.participants >= tournament.max_participants) {
      return NextResponse.json({ 
        error: 'Tournament is full' 
      }, { status: 400 });
    }

    // Get user and check balance
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: { 
        balance: true, 
        tournament_balance: true 
      }
    });

    const entryFee = Number(tournament.entry_fee || 0);
    const userBalance = Number(user.balance || 0);

    if (entryFee > 0 && userBalance < entryFee) {
      return NextResponse.json({ 
        error: `Insufficient balance. Entry fee: $${entryFee}` 
      }, { status: 400 });
    }

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Deduct entry fee from user balance
      if (entryFee > 0) {
        await tx.users.update({
          where: { id: userId },
          data: {
            balance: { decrement: entryFee }
          }
        });
      }

      // Give tournament balance (default $10,000 or configurable)
      const startingBalance = 10000;
      await tx.users.update({
        where: { id: userId },
        data: {
          tournament_balance: startingBalance
        }
      });

      // Create participant entry
      const participant = await tx.tournament_participants.create({
        data: {
          id: crypto.randomUUID(),
          tournament_id: tournamentId,
          user_id: userId,
          entry_paid: entryFee,
          starting_balance: startingBalance,
          current_balance: startingBalance,
          total_trades: 0,
          winning_trades: 0,
          total_profit: 0,
          total_volume: 0
        }
      });

      // Update tournament participant count
      await tx.tournaments.update({
        where: { id: tournamentId },
        data: {
          current_participants: { increment: 1 }
        }
      });

      // Create initial leaderboard entry
      await tx.tournament_leaderboard.create({
        data: {
          id: crypto.randomUUID(),
          tournament_id: tournamentId,
          user_id: userId,
          rank: tournament._count.participants + 1,
          total_profit: 0,
          total_trades: 0,
          win_rate: 0,
          total_volume: 0
        }
      });

      return participant;
    });

    return NextResponse.json({ 
      success: true,
      message: 'Successfully joined tournament',
      participant: result
    }, { status: 201 });

  } catch (error) {
    console.error('[Tournament Join] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
