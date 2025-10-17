import { requireAdmin, json } from '@/app/api/admin/_utils';
import prisma from '@/lib/prisma';

// GET - List all tournaments (Admin)
export async function GET(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  try {
    const tournaments = await prisma.tournaments.findMany({
      include: {
        prizes: {
          orderBy: { rank: 'asc' }
        },
        _count: {
          select: { participants: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Calculate stats
    const stats = {
      total: tournaments.length,
      active: tournaments.filter(t => t.status === 'ACTIVE').length,
      upcoming: tournaments.filter(t => t.status === 'UPCOMING').length,
      completed: tournaments.filter(t => t.status === 'COMPLETED').length,
      totalPrizePool: tournaments.reduce((sum, t) => sum + Number(t.total_prize_pool || 0), 0),
      totalParticipants: tournaments.reduce((sum, t) => sum + (t._count?.participants || 0), 0)
    };

    return json({ tournaments, stats });
  } catch (error) {
    console.error('[Admin Tournaments GET] Error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new tournament
export async function POST(request) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    const {
      title,
      description,
      type = 'PROFIT_BASED',
      entry_fee = 0,
      max_participants,
      start_date,
      end_date,
      prizes = [], // Array of { rank, prize_amount, description }
      rules
    } = body;

    // Validation
    if (!title || !start_date || !end_date) {
      return json({ 
        error: 'Title, start_date, and end_date are required' 
      }, { status: 400 });
    }

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    if (endDate <= startDate) {
      return json({ 
        error: 'End date must be after start date' 
      }, { status: 400 });
    }

    // Calculate total prize pool
    const totalPrizePool = prizes.reduce((sum, p) => sum + Number(p.prize_amount || 0), 0);

    // Determine status based on dates
    const now = new Date();
    let status = 'UPCOMING';
    if (now >= startDate && now <= endDate) {
      status = 'ACTIVE';
    } else if (now > endDate) {
      status = 'COMPLETED';
    }

    // Create tournament with prizes
    const tournament = await prisma.tournaments.create({
      data: {
        id: crypto.randomUUID(),
        title,
        description,
        type,
        status,
        entry_fee: Number(entry_fee),
        max_participants: max_participants ? parseInt(max_participants) : null,
        start_date: startDate,
        end_date: endDate,
        total_prize_pool: totalPrizePool,
        current_participants: 0,
        rules,
        prizes: {
          create: prizes.map(p => ({
            id: crypto.randomUUID(),
            rank: parseInt(p.rank),
            prize_amount: Number(p.prize_amount),
            prize_type: p.prize_type || 'CASH',
            description: p.description
          }))
        }
      },
      include: {
        prizes: {
          orderBy: { rank: 'asc' }
        }
      }
    });

    return json({ 
      success: true, 
      tournament 
    }, { status: 201 });
  } catch (error) {
    console.error('[Admin Tournaments POST] Error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
