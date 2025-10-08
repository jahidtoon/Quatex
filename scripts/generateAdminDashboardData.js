#!/usr/bin/env node
/**
 * Admin Dashboard Demo Data Generator
 * This script populates the database with comprehensive demo data for testing the admin dashboard
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createDemoUsers(count = 25) {
  console.log(`Creating ${count} demo users...`);
  
  const countries = ['US', 'UK', 'CA', 'AU', 'DE', 'FR', 'JP', 'SG', 'BD', 'IN'];
  const users = [];
  
  for (let i = 1; i <= count; i++) {
    const firstName = `User${i}`;
    const lastName = `Demo`;
    const email = `user${i}@quatex-demo.com`;
    
    // Check if user already exists
    const existing = await prisma.users.findUnique({
      where: { email }
    });
    
    if (!existing) {
      const user = await prisma.users.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email: email,
          password_hash: await bcrypt.hash('demo123', 10),
          is_verified: Math.random() > 0.2, // 80% verified
          country: countries[Math.floor(Math.random() * countries.length)],
          balance: Math.floor(Math.random() * 5000) + 100,
          demo_balance: 10000,
          created_at: new Date(Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000) // Up to 90 days ago
        }
      });
      users.push(user);
      console.log(`Created user: ${email}`);
    } else {
      users.push(existing);
      console.log(`User exists: ${email}`);
    }
  }
  
  return users;
}

async function createDemoDeposits(users) {
  console.log('Creating demo deposits...');
  const depositMethods = ['Credit Card', 'Bank Transfer', 'Crypto', 'PayPal', 'Skrill'];
  const statuses = ['completed', 'completed', 'completed', 'completed', 'pending', 'failed']; // 4/6 completed
  
  const deposits = [];
  
  for (const user of users) {
    // Create 1-5 deposits per user
    const numDeposits = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < numDeposits; i++) {
      const deposit = await prisma.deposits.create({
        data: {
          user_id: user.id,
          amount: Math.floor(Math.random() * 1000) + 100,
          method: depositMethods[Math.floor(Math.random() * depositMethods.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          created_at: new Date(Date.now() - Math.floor(Math.random() * 60) * 24 * 60 * 60 * 1000) // Up to 60 days ago
        }
      });
      deposits.push(deposit);
    }
  }
  
  console.log(`Created ${deposits.length} deposits`);
  return deposits;
}

async function createDemoWithdrawals(users) {
  console.log('Creating demo withdrawals...');
  const withdrawalMethods = ['Bank Transfer', 'Crypto', 'PayPal', 'Skrill'];
  const statuses = ['completed', 'completed', 'completed', 'pending', 'pending', 'failed']; // 3/6 completed
  
  const withdrawals = [];
  
  for (const user of users) {
    // Create 0-3 withdrawals per user
    const numWithdrawals = Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numWithdrawals; i++) {
      const withdrawal = await prisma.withdrawals.create({
        data: {
          user_id: user.id,
          amount: Math.floor(Math.random() * 500) + 50,
          method: withdrawalMethods[Math.floor(Math.random() * withdrawalMethods.length)],
          status: statuses[Math.floor(Math.random() * statuses.length)],
          created_at: new Date(Date.now() - Math.floor(Math.random() * 45) * 24 * 60 * 60 * 1000) // Up to 45 days ago
        }
      });
      withdrawals.push(withdrawal);
    }
  }
  
  console.log(`Created ${withdrawals.length} withdrawals`);
  return withdrawals;
}

async function createDemoTrades(users) {
  console.log('Creating demo trades...');
  const symbols = ['EUR_USD', 'GBP_USD', 'AUD_CHF', 'EUR_JPY', 'CAD_JPY', 'BTC_USD', 'ETH_USD'];
  const directions = ['up', 'down'];
  const results = ['win', 'loss', 'win', 'win', null]; // 3/5 win, some still open
  const accountTypes = ['live', 'demo'];
  
  const trades = [];
  
  for (const user of users) {
    // Create 3-20 trades per user
    const numTrades = Math.floor(Math.random() * 18) + 3;
    
    for (let i = 0; i < numTrades; i++) {
      const isOpen = results[Math.floor(Math.random() * results.length)] === null;
      const openTime = new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000);
      const closeTime = isOpen ? null : new Date(openTime.getTime() + Math.floor(Math.random() * 60) * 60 * 1000);
      
      const trade = await prisma.trades.create({
        data: {
          user_id: user.id,
          symbol: symbols[Math.floor(Math.random() * symbols.length)],
          amount: Math.floor(Math.random() * 200) + 10,
          direction: directions[Math.floor(Math.random() * directions.length)],
          open_time: openTime,
          close_time: closeTime,
          result: isOpen ? null : results[Math.floor(Math.random() * (results.length - 1))], // Skip null for closed trades
          status: isOpen ? 'open' : 'closed',
          account_type: accountTypes[Math.floor(Math.random() * accountTypes.length)],
          entry_price: Math.random() * 100 + 10,
          payout: Math.random() * 50 + 5
        }
      });
      trades.push(trade);
    }
  }
  
  console.log(`Created ${trades.length} trades`);
  return trades;
}

async function createDemoSupportMessages(users) {
  console.log('Creating demo support messages...');
  const subjects = [
    'Account verification issue',
    'Withdrawal problem',
    'Trading platform question',
    'Deposit not showing up',
    'Password reset request',
    'API access request',
    'General inquiry'
  ];
  
  const messages = [];
  
  for (const user of users) {
    // 30% chance of having support messages
    if (Math.random() > 0.7) {
      const numMessages = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < numMessages; i++) {
        const message = await prisma.support_messages.create({
          data: {
            user_id: user.id,
            name: `${user.first_name} ${user.last_name}`,
            email: user.email,
            subject: subjects[Math.floor(Math.random() * subjects.length)],
            message: `This is a demo support message from ${user.email}. Please help with my issue.`,
            created_at: new Date(Date.now() - Math.floor(Math.random() * 14) * 24 * 60 * 60 * 1000) // Up to 14 days ago
          }
        });
        messages.push(message);
      }
    }
  }
  
  console.log(`Created ${messages.length} support messages`);
  return messages;
}

async function createDemoLeaderboard(users) {
  console.log('Creating demo leaderboard entries...');
  
  // Clean existing entries
  await prisma.leaderboard.deleteMany({});
  
  // Add users to leaderboard with random amounts
  const leaderboard = [];
  let rank = 1;
  
  // Sort users by random amounts for leaderboard
  const leaderboardUsers = [...users]
    .map(user => ({ 
      user, 
      amount: Math.floor(Math.random() * 10000) + 1000 
    }))
    .sort((a, b) => b.amount - a.amount);
  
  for (const entry of leaderboardUsers) {
    const leaderboardEntry = await prisma.leaderboard.create({
      data: {
        user_id: entry.user.id,
        amount: entry.amount,
        rank: rank++
      }
    });
    leaderboard.push(leaderboardEntry);
  }
  
  console.log(`Created ${leaderboard.length} leaderboard entries`);
  return leaderboard;
}

async function ensureCurrencyPairs() {
  console.log('Ensuring currency pairs are set up...');
  
  const pairs = [
    { base: 'EUR', quote: 'USD', payout: 80 },
    { base: 'GBP', quote: 'USD', payout: 78 },
    { base: 'AUD', quote: 'CHF', payout: 75 },
    { base: 'EUR', quote: 'JPY', payout: 82 },
    { base: 'CAD', quote: 'JPY', payout: 74 },
    { base: 'USD', quote: 'JPY', payout: 78 },
    { base: 'BTC', quote: 'USD', payout: 85 },
    { base: 'ETH', quote: 'USD', payout: 83 }
  ];
  
  for (const pair of pairs) {
    const symbol = `${pair.base}_${pair.quote}`;
    const display = `${pair.base}/${pair.quote}`;
    
    const existing = await prisma.currency_pairs.findUnique({
      where: { symbol }
    });
    
    if (!existing) {
      await prisma.currency_pairs.create({
        data: {
          symbol,
          base: pair.base,
          quote: pair.quote,
          display,
          payout: pair.payout,
          provider_symbol: symbol,
          status: "ACTIVE"
        }
      });
      console.log(`Created currency pair: ${display}`);
    } else {
      console.log(`Currency pair exists: ${display}`);
    }
  }
}

async function main() {
  console.log('🚀 Starting Admin Dashboard Demo Data Generator');
  
  try {
    // Ensure admin exists
    const adminEmail = 'admin@quatex.com';
    const existingAdmin = await prisma.users.findUnique({
      where: { email: adminEmail }
    });
    
    if (!existingAdmin) {
      const adminHash = await bcrypt.hash('admin123', 10);
      await prisma.users.create({
        data: {
          email: adminEmail,
          first_name: 'Admin',
          last_name: 'User',
          name: 'Admin User',
          password_hash: adminHash,
          is_verified: true,
          is_admin: true,
          balance: 0,
          demo_balance: 10000
        }
      });
      console.log('✅ Created admin user:', adminEmail, 'password: admin123');
    } else {
      console.log('✅ Admin user already exists:', adminEmail);
    }
    
    // Add currency pairs
    await ensureCurrencyPairs();
    
    // Create demo data
    const users = await createDemoUsers();
    await createDemoDeposits(users);
    await createDemoWithdrawals(users);
    await createDemoTrades(users);
    await createDemoSupportMessages(users);
    await createDemoLeaderboard(users);
    
    console.log('\n🎉 Admin dashboard demo data generation complete!');
    console.log('📊 The dashboard should now show real metrics and data.');
    console.log('👤 Admin credentials:');
    console.log('   Email: admin@quatex.com');
    console.log('   Password: admin123');
    
  } catch (error) {
    console.error('❌ Error generating demo data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { main };