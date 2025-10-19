const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function testTournamentTracking() {
  try {
    console.log('🧪 Testing Tournament Tracking System\n');

    // 1. Find an active tournament
    const tournament = await prisma.tournaments.findFirst({
      where: { status: 'ACTIVE' },
      include: {
        prizes: true,
        participants: {
          include: {
            user: {
              select: { email: true, name: true, first_name: true, last_name: true }
            }
          }
        }
      }
    });

    if (!tournament) {
      console.log('❌ No active tournament found. Creating one...');
      
      const now = new Date();
      const newTournament = await prisma.tournaments.create({
        data: {
          id: crypto.randomUUID(),
          title: 'Test Tournament',
          description: 'Testing tournament tracking',
          type: 'PROFIT_BASED',
          status: 'ACTIVE',
          entry_fee: 10,
          max_participants: 50,
          start_date: new Date(now.getTime() - 1000 * 60 * 60), // Started 1 hour ago
          end_date: new Date(now.getTime() + 1000 * 60 * 60 * 24), // Ends in 1 day
          total_prize_pool: 1000,
          current_participants: 0,
          rules: 'Test rules',
          prizes: {
            create: [
              {
                id: crypto.randomUUID(),
                rank: 1,
                prize_amount: 500,
                prize_type: 'CASH',
                description: '1st Place'
              },
              {
                id: crypto.randomUUID(),
                rank: 2,
                prize_amount: 300,
                prize_type: 'CASH',
                description: '2nd Place'
              },
              {
                id: crypto.randomUUID(),
                rank: 3,
                prize_amount: 200,
                prize_type: 'CASH',
                description: '3rd Place'
              }
            ]
          }
        },
        include: {
          prizes: true,
          participants: true
        }
      });

      console.log(`✅ Created test tournament: ${newTournament.title} (ID: ${newTournament.id})\n`);
      return newTournament;
    }

    console.log(`📊 Active Tournament: ${tournament.title}`);
    console.log(`   ID: ${tournament.id}`);
    console.log(`   Type: ${tournament.type}`);
    console.log(`   Participants: ${tournament.participants.length}/${tournament.max_participants}`);
    console.log(`   Prize Pool: $${tournament.total_prize_pool}`);
    console.log(`   Prizes: ${tournament.prizes.length} tiers\n`);

    // 2. Check participants
    if (tournament.participants.length === 0) {
      console.log('⚠️ No participants in tournament yet');
      console.log('💡 Users need to join via /tournaments page or API\n');
    } else {
      console.log('👥 Current Participants:');
      tournament.participants.forEach((p, i) => {
        const displayName = p.user.name || `${p.user.first_name || ''} ${p.user.last_name || ''}`.trim() || p.user.email || 'Unknown';
        console.log(`   ${i + 1}. ${displayName}`);
        console.log(`      Rank: #${p.rank || 'Unranked'}`);
        console.log(`      Trades: ${p.total_trades} (${p.winning_trades} wins)`);
        console.log(`      Profit: $${p.total_profit}`);
        console.log(`      Balance: $${p.current_balance}`);
      });
      console.log('');
    }

    // 3. Check leaderboard
    const leaderboard = await prisma.tournament_leaderboard.findMany({
      where: { tournament_id: tournament.id },
      orderBy: { rank: 'asc' },
      take: 5,
      include: {
        user: {
          select: { email: true, name: true, first_name: true, last_name: true }
        }
      }
    });

    if (leaderboard.length > 0) {
      console.log('🏆 Current Leaderboard (Top 5):');
      leaderboard.forEach((entry) => {
        const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : '  ';
        const displayName = entry.user.name || `${entry.user.first_name || ''} ${entry.user.last_name || ''}`.trim() || entry.user.email;
        console.log(`   ${medal} #${entry.rank}. ${displayName}`);
        console.log(`      Profit: $${entry.profit} | Trades: ${entry.trades} | Win Rate: ${(Number(entry.win_rate) * 100).toFixed(1)}%`);
      });
      console.log('');
    } else {
      console.log('📋 Leaderboard is empty (no trades yet)\n');
    }

    // 4. Instructions
    console.log('📝 Testing Instructions:');
    console.log('   1. Join the tournament as a user via /tournaments');
    console.log('   2. Place a trade (binary options)');
    console.log('   3. Wait for trade to expire and auto-close');
    console.log('   4. Check tournament leaderboard - it should update automatically!');
    console.log('   5. Run this script again to see updated stats\n');

    console.log('🔍 Next Steps:');
    console.log('   - Tournament stats update on every trade close');
    console.log('   - Leaderboard recalculates automatically');
    console.log('   - Prize distribution runs when tournament ends');
    console.log('   - Status auto-updates (UPCOMING → ACTIVE → COMPLETED)\n');

    return tournament;
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testTournamentTracking();
