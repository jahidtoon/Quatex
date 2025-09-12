import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Simple test script to create demo user without external dependencies
export async function createDemoUser() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email: 'demo@quatex.com' }
    });

    if (existingUser) {
      console.log('Demo user already exists!');
      return { success: true, user: existingUser };
    }

    // Hash password for 'demo123'
    const password_hash = await bcrypt.hash('demo123', 10);

    // Create demo user
    const user = await prisma.users.create({
      data: {
        first_name: 'Demo',
        last_name: 'User',
        email: 'demo@quatex.com',
        password_hash,
        phone: '+1-555-123-4567',
        country: 'United States',
        date_of_birth: '1990-01-15',
        address: '123 Demo Street',
        city: 'Demo City',
        postal_code: '12345',
        balance: 1000.00,
        is_verified: true
      }
    });

    console.log('✅ Demo user created:', user.email);
    return { success: true, user };

  } catch (error) {
    console.error('❌ Error creating demo user:', error);
    return { success: false, error: error.message };
  }
}

// Create demo data for user
export async function createDemoData(userId) {
  try {
    // Create demo deposits
    await prisma.deposits.createMany({
      data: [
        {
          user_id: userId,
          amount: 500.00,
          method: 'Credit Card',
          status: 'completed'
        },
        {
          user_id: userId,
          amount: 300.00,
          method: 'Bank Transfer',
          status: 'completed'
        }
      ]
    });

    // Create demo withdrawals
    await prisma.withdrawals.createMany({
      data: [
        {
          user_id: userId,
          amount: 150.00,
          method: 'Bank Transfer',
          status: 'completed'
        }
      ]
    });

    // Create demo trades
    await prisma.trades.createMany({
      data: [
        {
          user_id: userId,
          symbol: 'EURUSD',
          amount: 50.00,
          direction: 'up',
          result: 'win',
          open_time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          close_time: new Date(Date.now() - 2 * 60 * 60 * 1000 + 5 * 60 * 1000) // 5 minutes later
        },
        {
          user_id: userId,
          symbol: 'GBPUSD',
          amount: 25.00,
          direction: 'down',
          result: 'loss',
          open_time: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          close_time: new Date(Date.now() - 24 * 60 * 60 * 1000 + 10 * 60 * 1000) // 10 minutes later
        },
        {
          user_id: userId,
          symbol: 'BTCUSD',
          amount: 100.00,
          direction: 'up',
          result: 'win',
          open_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          close_time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000) // 15 minutes later
        }
      ]
    });

    console.log('✅ Demo data created successfully!');
    return { success: true };

  } catch (error) {
    console.error('❌ Error creating demo data:', error);
    return { success: false, error: error.message };
  }
}
