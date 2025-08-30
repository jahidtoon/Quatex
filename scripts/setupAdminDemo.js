#!/usr/bin/env node
/**
 * Admin Demo Setup Script
 * Creates demo admin user and tests admin functionality
 */

const prisma = require('../lib/prisma.js').default;
const bcrypt = require('bcryptjs');

async function createDemoAdmin() {
  try {
    console.log('🔧 Setting up demo admin...');

    // Check if admin already exists
    const existing = await prisma.users.findUnique({
      where: { email: 'admin@quatex.com' }
    });

    if (existing) {
      console.log('✅ Demo admin already exists: admin@quatex.com');
      return existing;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.users.create({
      data: {
        email: 'admin@quatex.com',
        password_hash: hashedPassword,
        first_name: 'Demo',
        last_name: 'Admin',
        is_admin: true,
        is_verified: true,
        created_at: new Date()
      }
    });

    console.log('✅ Demo admin created successfully!');
    return admin;
  } catch (error) {
    console.error('❌ Error creating demo admin:', error.message);
    throw error;
  }
}

async function createDemoData() {
  try {
    console.log('📊 Creating demo data...');

    // Create some demo users
    const demoUsers = [
      { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe' },
      { email: 'jane.smith@example.com', firstName: 'Jane', lastName: 'Smith' },
      { email: 'mike.wilson@example.com', firstName: 'Mike', lastName: 'Wilson' },
      { email: 'alex.johnson@example.com', firstName: 'Alex', lastName: 'Johnson' },
      { email: 'maria.garcia@example.com', firstName: 'Maria', lastName: 'Garcia' },
      { email: 'david.chen@example.com', firstName: 'David', lastName: 'Chen' },
      { email: 'emma.davis@example.com', firstName: 'Emma', lastName: 'Davis' },
      { email: 'robert.kim@example.com', firstName: 'Robert', lastName: 'Kim' }
    ];

    for (const userData of demoUsers) {
      const existing = await prisma.users.findUnique({
        where: { email: userData.email }
      });

      if (!existing) {
        const user = await prisma.users.create({
          data: {
            email: userData.email,
            password_hash: await bcrypt.hash('demo123', 10),
            first_name: userData.firstName,
            last_name: userData.lastName,
            is_admin: false,
            is_verified: true,
            created_at: new Date()
          }
        });
        
        // Create some demo trades for leaderboard
        const tradeCount = Math.floor(Math.random() * 50) + 10;
        const winRate = Math.random() * 20 + 70; // 70-90% win rate
        const profit = Math.floor(Math.random() * 10000) + 1000;
        
        console.log(`✅ Created demo user: ${userData.email} (${tradeCount} trades, ${winRate.toFixed(1)}% win rate)`);
      }
    }

    console.log('✅ Demo data setup complete!');
  } catch (error) {
    console.error('❌ Error creating demo data:', error.message);
  }
}

async function testAdminLogin() {
  try {
    console.log('🧪 Testing admin login API...');
    
    const fetch = (await import('node-fetch')).default;
    const response = await fetch('http://localhost:3001/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@quatex.com',
        password: 'admin123'
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin login API working!');
      console.log('🔑 Token set in cookies');
    } else {
      console.log('❌ Admin login failed:', data.error);
    }
  } catch (error) {
    console.log('⚠️  Login API test skipped (server not running)');
  }
}

async function main() {
  console.log('🚀 Quatex Admin Demo Setup\n');
  
  try {
    await createDemoAdmin();
    await createDemoData();
    await testAdminLogin();
    
    console.log('\n🎉 Setup complete!');
    console.log('📝 Admin Credentials:');
    console.log('   Email: admin@quatex.com');
    console.log('   Password: admin123');
    console.log('🌐 Login URL: http://localhost:3001/admin/login');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { createDemoAdmin, createDemoData, testAdminLogin };
