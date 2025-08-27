// Demo Admin Account Creator
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createDemoAdmin() {
  try {
    // Demo admin credentials
    const demoAdmin = {
      email: 'admin@quatex.com',
      password: 'admin123',
      first_name: 'Admin',
      last_name: 'User',
      name: 'Admin User',
      country: 'Bangladesh',
      is_admin: true,
      is_verified: true
    };

    // Check if admin already exists
    const existingAdmin = await prisma.users.findUnique({
      where: { email: demoAdmin.email }
    });

    if (existingAdmin) {
      console.log('✅ Demo admin already exists!');
      console.log('📧 Email: admin@quatex.com');
      console.log('🔑 Password: admin123');
      return;
    }

    // Hash the password
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(demoAdmin.password, saltRounds);

    // Create the admin user
    const newAdmin = await prisma.users.create({
      data: {
        email: demoAdmin.email,
        password_hash,
        first_name: demoAdmin.first_name,
        last_name: demoAdmin.last_name,
        name: demoAdmin.name,
        country: demoAdmin.country,
        is_admin: demoAdmin.is_admin,
        is_verified: demoAdmin.is_verified
      }
    });

    console.log('✅ Demo admin account created successfully!');
    console.log('👤 Admin Details:');
    console.log('   ID:', newAdmin.id);
    console.log('   📧 Email: admin@quatex.com');
    console.log('   🔑 Password: admin123');
    console.log('   📛 Name:', newAdmin.name);
    console.log('   🌍 Country:', newAdmin.country);
    console.log('   ✅ Verified:', newAdmin.is_verified);
    console.log('   👑 Admin:', newAdmin.is_admin);
    console.log('');
    console.log('🚀 You can now login to admin panel at: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Error creating demo admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoAdmin();
