import prisma from './prisma.js';
import { Prisma } from '@prisma/client';

/**
 * Update tournament statistics when a trade is closed
 * @param {string} userId - User ID
 * @param {object} trade - Trade object with amount, result, payout, etc.
 */
export async function updateTournamentStats(userId, trade) {
  try {
    // Find all ACTIVE tournaments user is participating in
    const participations = await prisma.tournament_participants.findMany({
      where: {
        user_id: userId,
        tournament: {
          status: 'ACTIVE'
        }
      },
      include: {
        tournament: true
      }
    });

    if (participations.length === 0) {
      return; // User not in any active tournaments
    }

    // Calculate profit for this trade
    const amount = Number(trade.amount || 0);
    const payout = Number(trade.payout || 0);
    const isWin = trade.result === 'win';
    
    // For binary options: loss = -stake, win = +payout
    const profit = isWin ? payout : -amount;

    // Update each tournament participation
    for (const participation of participations) {
      await prisma.tournament_participants.update({
        where: { id: participation.id },
        data: {
          total_trades: { increment: 1 },
          winning_trades: isWin ? { increment: 1 } : undefined,
          total_profit: { increment: new Prisma.Decimal(profit.toFixed(2)) },
          current_balance: { increment: new Prisma.Decimal(profit.toFixed(2)) }
        }
      });

      // Recalculate leaderboard for this tournament
      await recalculateTournamentLeaderboard(participation.tournament_id, participation.tournament.type);
    }

    console.log(`[tournamentTracker] Updated tournament stats for user ${userId}: ${participations.length} tournament(s)`);
  } catch (error) {
    console.error('[tournamentTracker] Error updating tournament stats:', error);
    // Don't throw - we don't want to break trade closing if tournament update fails
  }
}

/**
 * Recalculate and update tournament leaderboard
 * @param {string} tournamentId - Tournament ID
 * @param {string} tournamentType - PROFIT_BASED, WIN_RATE, VOLUME_BASED, or MIXED
 */
async function recalculateTournamentLeaderboard(tournamentId, tournamentType) {
  try {
    // Get all participants with their current stats
    const participants = await prisma.tournament_participants.findMany({
      where: { tournament_id: tournamentId },
      include: {
        user: {
          select: {
            email: true,
            name: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (participants.length === 0) return;

    // Sort based on tournament type
    let sortedParticipants = [...participants];

    switch (tournamentType) {
      case 'PROFIT_BASED':
        // Sort by total profit (highest first)
        sortedParticipants.sort((a, b) => 
          Number(b.total_profit) - Number(a.total_profit)
        );
        break;

      case 'WIN_RATE':
        // Sort by win rate (highest first), then by total trades
        sortedParticipants.sort((a, b) => {
          const winRateA = a.total_trades > 0 ? a.winning_trades / a.total_trades : 0;
          const winRateB = b.total_trades > 0 ? b.winning_trades / b.total_trades : 0;
          
          if (winRateB !== winRateA) {
            return winRateB - winRateA;
          }
          // Tie breaker: more trades = higher rank
          return b.total_trades - a.total_trades;
        });
        break;

      case 'VOLUME_BASED':
        // Sort by total trades (highest first)
        sortedParticipants.sort((a, b) => 
          b.total_trades - a.total_trades
        );
        break;

      case 'MIXED':
        // Weighted score: 50% profit, 30% win rate, 20% volume
        sortedParticipants.sort((a, b) => {
          const profitA = Number(a.total_profit);
          const profitB = Number(b.total_profit);
          
          const winRateA = a.total_trades > 0 ? a.winning_trades / a.total_trades : 0;
          const winRateB = b.total_trades > 0 ? b.winning_trades / b.total_trades : 0;
          
          const volumeA = a.total_trades;
          const volumeB = b.total_trades;
          
          // Normalize scores (simple approach - can be improved)
          const maxProfit = Math.max(...participants.map(p => Number(p.total_profit)));
          const maxVolume = Math.max(...participants.map(p => p.total_trades));
          
          const scoreA = (
            (profitA / (maxProfit || 1)) * 0.5 +
            winRateA * 0.3 +
            (volumeA / (maxVolume || 1)) * 0.2
          );
          
          const scoreB = (
            (profitB / (maxProfit || 1)) * 0.5 +
            winRateB * 0.3 +
            (volumeB / (maxVolume || 1)) * 0.2
          );
          
          return scoreB - scoreA;
        });
        break;

      default:
        // Default to profit-based
        sortedParticipants.sort((a, b) => 
          Number(b.total_profit) - Number(a.total_profit)
        );
    }

    // Update ranks in participants table and leaderboard
    const updatePromises = sortedParticipants.map(async (participant, index) => {
      const rank = index + 1;
      const winRate = participant.total_trades > 0 
        ? participant.winning_trades / participant.total_trades 
        : 0;

      // Update participant rank
      await prisma.tournament_participants.update({
        where: { id: participant.id },
        data: { rank }
      });

      // Upsert leaderboard entry
      await prisma.tournament_leaderboard.upsert({
        where: {
          tournament_id_user_id: {
            tournament_id: tournamentId,
            user_id: participant.user_id
          }
        },
        create: {
          id: crypto.randomUUID(),
          tournament_id: tournamentId,
          user_id: participant.user_id,
          rank,
          profit: participant.total_profit,
          trades: participant.total_trades,
          win_rate: new Prisma.Decimal(winRate.toFixed(4))
        },
        update: {
          rank,
          profit: participant.total_profit,
          trades: participant.total_trades,
          win_rate: new Prisma.Decimal(winRate.toFixed(4))
        }
      });
    });

    await Promise.all(updatePromises);

    console.log(`[tournamentTracker] Updated leaderboard for tournament ${tournamentId}: ${participants.length} participants`);
  } catch (error) {
    console.error('[tournamentTracker] Error recalculating leaderboard:', error);
  }
}

/**
 * Distribute prizes for completed tournaments
 * Called when tournament ends
 */
export async function distributeTournamentPrizes(tournamentId) {
  try {
    const tournament = await prisma.tournaments.findUnique({
      where: { id: tournamentId },
      include: {
        prizes: {
          orderBy: { rank: 'asc' }
        },
        participants: {
          orderBy: { rank: 'asc' },
          take: 10, // Top 10 participants
          include: {
            user: {
              select: { email: true, name: true, first_name: true, last_name: true }
            }
          }
        }
      }
    });

    if (!tournament || tournament.status !== 'COMPLETED') {
      console.warn(`[tournamentTracker] Cannot distribute prizes for tournament ${tournamentId}: not completed`);
      return;
    }

    // Distribute prizes to winners
    const prizeUpdates = [];
    
    for (const prize of tournament.prizes) {
      const participant = tournament.participants.find(p => p.rank === prize.rank);
      
      if (!participant) {
        console.warn(`[tournamentTracker] No participant found for rank ${prize.rank} in tournament ${tournamentId}`);
        continue;
      }

      const prizeAmount = Number(prize.prize_amount);
      
      // Add prize to user's balance
      await prisma.users.update({
        where: { id: participant.user_id },
        data: {
          balance: {
            increment: new Prisma.Decimal(prizeAmount.toFixed(2))
          }
        }
      });

      prizeUpdates.push({
        rank: prize.rank,
        userId: participant.user_id,
        email: participant.user.email,
        amount: prizeAmount
      });

      console.log(`[tournamentTracker] Awarded $${prizeAmount} to rank ${prize.rank} (${participant.user.email})`);
    }

    console.log(`[tournamentTracker] Distributed ${prizeUpdates.length} prizes for tournament ${tournament.title}`);
    // Safety: also reset tournament balances for participants now
    try {
      const participants = await prisma.tournament_participants.findMany({
        where: { tournament_id: tournamentId },
        select: { user_id: true }
      });
      const userIds = participants.map(p => p.user_id);
      if (userIds.length > 0) {
        await prisma.users.updateMany({ where: { id: { in: userIds } }, data: { tournament_balance: 0 } });
        console.log(`[tournamentTracker] (Immediate) Reset tournament_balance=0 for ${userIds.length} user(s)`);
      }
    } catch (e) {
      console.error('[tournamentTracker] Error in immediate reset of tournament balances:', e);
    }
    return prizeUpdates;
  } catch (error) {
    console.error('[tournamentTracker] Error distributing prizes:', error);
    throw error;
  }
}

/**
 * Update tournament statuses based on current time
 * Call this periodically (e.g., every minute)
 */
export async function updateTournamentStatuses() {
  try {
    const now = new Date();

    // Find tournaments that should change status
    const upcomingToActive = await prisma.tournaments.updateMany({
      where: {
        status: 'UPCOMING',
        start_date: { lte: now }
      },
      data: { status: 'ACTIVE' }
    });

    const activeToCompleted = await prisma.tournaments.updateMany({
      where: {
        status: 'ACTIVE',
        end_date: { lte: now }
      },
      data: { status: 'COMPLETED' }
    });

    if (upcomingToActive.count > 0) {
      console.log(`[tournamentTracker] Activated ${upcomingToActive.count} tournament(s)`);
    }

    if (activeToCompleted.count > 0) {
      console.log(`[tournamentTracker] Completed ${activeToCompleted.count} tournament(s)`);
      
      // Distribute prizes for newly completed tournaments
      const completedTournaments = await prisma.tournaments.findMany({
        where: {
          status: 'COMPLETED',
          end_date: {
            gte: new Date(now.getTime() - 60000), // Completed in last minute
            lte: now
          }
        },
        select: { id: true, title: true }
      });

      for (const tournament of completedTournaments) {
        console.log(`[tournamentTracker] Distributing prizes for "${tournament.title}"`);
        await distributeTournamentPrizes(tournament.id);
        // After prizes, reset participants' tournament balances to 0
        try {
          const participants = await prisma.tournament_participants.findMany({
            where: { tournament_id: tournament.id },
            select: { user_id: true }
          });
          const userIds = participants.map(p => p.user_id);
          if (userIds.length > 0) {
            await prisma.users.updateMany({
              where: { id: { in: userIds } },
              data: { tournament_balance: 0 }
            });
            console.log(`[tournamentTracker] Reset tournament_balance to 0 for ${userIds.length} user(s) of "${tournament.title}"`);
          }
        } catch (resetErr) {
          console.error('[tournamentTracker] Error resetting tournament balances:', resetErr);
        }
      }
    }

    // Global cleanup: ensure users not in any ACTIVE tournament have tournament_balance = 0
    await resetInactiveUsersTournamentBalance();
  } catch (error) {
    console.error('[tournamentTracker] Error updating tournament statuses:', error);
  }
}

/**
 * Reset tournament balance for users who are NOT participating in any ACTIVE tournament
 */
export async function resetInactiveUsersTournamentBalance() {
  try {
    const usersToReset = await prisma.users.findMany({
      where: {
        tournament_balance: { gt: 0 },
        tournament_participants: {
          none: {
            tournament: { status: 'ACTIVE' }
          }
        }
      },
      select: { id: true }
    });
    if (!usersToReset.length) return 0;

    const ids = usersToReset.map(u => u.id);
    const result = await prisma.users.updateMany({
      where: { id: { in: ids } },
      data: { tournament_balance: 0 }
    });
    console.log(`[tournamentTracker] Reset tournament_balance to 0 for ${result.count} user(s) without ACTIVE tournaments`);
    return result.count;
  } catch (error) {
    console.error('[tournamentTracker] Error resetting inactive users tournament balances:', error);
    return 0;
  }
}
