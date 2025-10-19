import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

function getTokenFromRequest(request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  try {
    const cookieToken = request.cookies?.get?.('auth_token')?.value;
    if (cookieToken) return cookieToken;
  } catch {}
  
  const cookieHeader = request.headers.get('cookie') || '';
  const tokenFromCookie = cookieHeader
    .split(';')
    .map(c => c.trim())
    .find(c => c.startsWith('auth_token='))?.split('=')[1];
  
  return tokenFromCookie || null;
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

// GET - List all tournaments for users
export async function GET(request) {
  try {
    const userId = await getUserId(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // UPCOMING, ACTIVE, COMPLETED
    const limit = parseInt(searchParams.get('limit')) || 50;

    const where = {};
    if (status) {
      where.status = status.toUpperCase();
    }

    const tournaments = await prisma.tournaments.findMany({
      where,
      include: {
        prizes: {
          orderBy: { rank: 'asc' },
          take: 3 // Top 3 prizes
        },
        _count: {
          select: { participants: true }
        },
        ...(userId && {
          participants: {
            where: { user_id: userId },
            select: {
              id: true,
              joined_at: true,
              rank: true,
              total_profit: true
            }
          }
        })
      },
      orderBy: [
        { status: 'asc' }, // ACTIVE first
        { start_date: 'asc' }
      ],
      take: limit
    });

    // Calculate time left for active tournaments
    const now = new Date();
    const enrichedTournaments = tournaments.map(t => {
      const timeLeft = t.status === 'ACTIVE' && t.end_date 
        ? Math.max(0, new Date(t.end_date).getTime() - now.getTime())
        : null;

      return {
        ...t,
        timeLeftMs: timeLeft,
        isJoined: userId ? t.participants?.length > 0 : false,
        myParticipation: userId && t.participants?.[0] ? t.participants[0] : null,
        participantCount: t._count?.participants || 0,
        spotsLeft: t.max_participants ? t.max_participants - (t._count?.participants || 0) : null
      };
    });

    // Get summary stats
    const stats = {
      active: tournaments.filter(t => t.status === 'ACTIVE').length,
      upcoming: tournaments.filter(t => t.status === 'UPCOMING').length,
      totalPrizePool: tournaments
        .filter(t => t.status === 'ACTIVE' || t.status === 'UPCOMING')
        .reduce((sum, t) => sum + Number(t.total_prize_pool || 0), 0),
      totalParticipants: tournaments
        .filter(t => t.status === 'ACTIVE')
        .reduce((sum, t) => sum + (t._count?.participants || 0), 0)
    };

    return NextResponse.json({ 
      tournaments: enrichedTournaments,
      stats
    });
  } catch (error) {
    console.error('[Tournaments GET] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
