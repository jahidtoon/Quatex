import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
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

// GET - Get tournament details
export async function GET(request, { params }) {
  try {
    const userId = await getUserId(request);
    const { id } = params;

    const tournament = await prisma.tournaments.findUnique({
      where: { id },
      include: {
        prizes: {
          orderBy: { rank: 'asc' }
        },
        leaderboard: {
          orderBy: { rank: 'asc' },
          take: 100,
          select: {
            id: true,
            user_id: true,
            rank: true,
            total_profit: true,
            total_trades: true,
            win_rate: true,
            total_volume: true,
            updated_at: true
          }
        },
        participants: userId ? {
          where: { user_id: userId },
          select: {
            id: true,
            joined_at: true,
            rank: true,
            total_profit: true,
            total_trades: true,
            winning_trades: true,
            current_balance: true
          }
        } : false,
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!tournament) {
      return NextResponse.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Get user info for leaderboard
    const userIds = tournament.leaderboard.map(l => l.user_id);
    const users = await prisma.users.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        avatar_url: true
      }
    });

    const userMap = {};
    users.forEach(u => userMap[u.id] = u);

    const leaderboard = tournament.leaderboard.map(l => ({
      ...l,
      user: userMap[l.user_id] || { name: 'Unknown User' }
    }));

    const now = new Date();
    const timeLeft = tournament.status === 'ACTIVE' && tournament.end_date
      ? Math.max(0, new Date(tournament.end_date).getTime() - now.getTime())
      : null;

    return NextResponse.json({
      tournament: {
        ...tournament,
        leaderboard,
        timeLeftMs: timeLeft,
        isJoined: userId ? tournament.participants?.length > 0 : false,
        myParticipation: userId && tournament.participants?.[0] ? tournament.participants[0] : null,
        participantCount: tournament._count?.participants || 0,
        spotsLeft: tournament.max_participants 
          ? tournament.max_participants - (tournament._count?.participants || 0) 
          : null
      }
    });
  } catch (error) {
    console.error('[Tournament GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
