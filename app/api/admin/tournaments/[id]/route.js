import { requireAdmin, json } from '@/app/api/admin/_utils';
import prisma from '@/lib/prisma';

// GET - Single tournament details
export async function GET(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  try {
    const { id } = params;
    
    const tournament = await prisma.tournaments.findUnique({
      where: { id },
      include: {
        prizes: {
          orderBy: { rank: 'asc' }
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar_url: true
              }
            }
          },
          orderBy: { rank: 'asc' }
        },
        leaderboard: {
          orderBy: { rank: 'asc' },
          take: 100
        }
      }
    });

    if (!tournament) {
      return json({ error: 'Tournament not found' }, { status: 404 });
    }

    return json({ tournament });
  } catch (error) {
    console.error('[Admin Tournament GET] Error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update tournament
export async function PATCH(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      title,
      description,
      type,
      status,
      entry_fee,
      max_participants,
      start_date,
      end_date,
      rules,
      prizes
    } = body;

    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (entry_fee !== undefined) updateData.entry_fee = Number(entry_fee);
    if (max_participants !== undefined) updateData.max_participants = max_participants ? parseInt(max_participants) : null;
    if (start_date !== undefined) updateData.start_date = new Date(start_date);
    if (end_date !== undefined) updateData.end_date = new Date(end_date);
    if (rules !== undefined) updateData.rules = rules;

    // Update prizes if provided
    if (prizes && Array.isArray(prizes)) {
      // Delete existing prizes and create new ones
      await prisma.tournament_prizes.deleteMany({
        where: { tournament_id: id }
      });

      updateData.prizes = {
        create: prizes.map(p => ({
          id: crypto.randomUUID(),
          rank: parseInt(p.rank),
          prize_amount: Number(p.prize_amount),
          prize_type: p.prize_type || 'CASH',
          description: p.description
        }))
      };

      updateData.total_prize_pool = prizes.reduce((sum, p) => sum + Number(p.prize_amount || 0), 0);
    }

    const tournament = await prisma.tournaments.update({
      where: { id },
      data: updateData,
      include: {
        prizes: {
          orderBy: { rank: 'asc' }
        }
      }
    });

    return json({ success: true, tournament });
  } catch (error) {
    console.error('[Admin Tournament PATCH] Error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete tournament
export async function DELETE(request, { params }) {
  const auth = requireAdmin(request.headers);
  if (!auth.ok) return auth.response;

  try {
    const { id } = params;
    
    // Check if tournament has participants
    const participantCount = await prisma.tournament_participants.count({
      where: { tournament_id: id }
    });

    if (participantCount > 0) {
      return json({ 
        error: 'Cannot delete tournament with participants. Please refund entries first.' 
      }, { status: 400 });
    }

    await prisma.tournaments.delete({
      where: { id }
    });

    return json({ success: true });
  } catch (error) {
    console.error('[Admin Tournament DELETE] Error:', error);
    return json({ error: error.message }, { status: 500 });
  }
}
