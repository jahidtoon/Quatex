// Test Admin Login
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testAdminLogin() {
  try {
    const user = await prisma.users.findUnique({ 
      where: { email: 'admin@quatex.com' } 
    });
    
    if (!user) {
      console.log('❌ Admin user not found');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('   ID:', user.id);
    console.log('   Email:', user.email);
    console.log('   Name:', user.name);
    console.log('   Is Admin:', user.is_admin);
    console.log('   Is Verified:', user.is_verified);
    console.log('   Has Password:', !!user.password_hash);
    
    if (user.password_hash) {
      const isValidPassword = await bcrypt.compare('admin123', user.password_hash);
      console.log('   Password Valid:', isValidPassword);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAdminLogin();
