const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

async function createDemoTournament() {
  try {
    const now = new Date();
    const startDate = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour from now
    const endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // 7 days from now

    const tournament = await prisma.tournaments.create({
      data: {
        id: crypto.randomUUID(),
        title: 'Weekend Crypto Challenge',
        description: 'Test your trading skills and win big prizes!',
        type: 'PROFIT_BASED',
        status: 'ACTIVE',
        entry_fee: 50,
        max_participants: 100,
        start_date: startDate,
        end_date: endDate,
        total_prize_pool: 10000,
        current_participants: 0,
        rules: `
1. All participants start with $10,000 virtual balance
2. Rankings based on total profit/loss
3. Top 3 traders win prizes
4. Fair trading rules apply
        `.trim(),
        prizes: {
          create: [
            {
              id: crypto.randomUUID(),
              rank: 1,
              prize_amount: 5000,
              prize_type: 'CASH',
              description: '1st Place - Grand Prize'
            },
            {
              id: crypto.randomUUID(),
              rank: 2,
              prize_amount: 3000,
              prize_type: 'CASH',
              description: '2nd Place - Runner Up'
            },
            {
              id: crypto.randomUUID(),
              rank: 3,
              prize_amount: 2000,
              prize_type: 'CASH',
              description: '3rd Place - Third Prize'
            }
          ]
        }
      },
      include: {
        prizes: true
      }
    });

    console.log('✅ Demo tournament created successfully!');
    console.log('Tournament ID:', tournament.id);
    console.log('Title:', tournament.title);
    console.log('Status:', tournament.status);
    console.log('Entry Fee: $' + tournament.entry_fee);
    console.log('Prize Pool: $' + tournament.total_prize_pool);
    console.log('Prizes:', tournament.prizes.length);
    
    return tournament;
  } catch (error) {
    console.error('❌ Error creating tournament:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoTournament();
