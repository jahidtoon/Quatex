const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function createDemoUser() {
  try {
    const email = process.env.USER_EMAIL || 'user@quatex.com';
    const password = process.env.USER_PASSWORD || 'user123';
    const name = process.env.USER_NAME || 'Demo User';

    // Check if user already exists
    const existingUser = await prisma.users.findUnique({
      where: { email }
    });

    if (existingUser) {
      console.log(`⚠️  User ${email} already exists`);
      return;
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email,
        name,
        password_hash,
        is_admin: false,
        is_verified: true,
        is_suspended: false,
        balance: 1000, // Starting balance $1000
        demo_balance: 10000, // Demo balance $10,000
        tournament_balance: 0
      }
    });

    console.log('✅ Created demo user:', email);
    console.log('   Password:', password);
    console.log('   Balance: $1000');
    console.log('   Demo Balance: $10,000');

  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createDemoUser();
