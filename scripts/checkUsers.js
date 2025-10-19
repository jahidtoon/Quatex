const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  try {
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        first_name: true,
        last_name: true,
        is_admin: true,
        is_suspended: true,
        password_hash: true
      }
    });

    console.log('🔍 Total users in database:', users.length);
    console.log('');

    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 Create a user first with: npm run create:admin -- email password');
    } else {
      users.forEach((u, i) => {
        console.log(`${i + 1}. Email: ${u.email}`);
        console.log(`   Name: ${u.name || u.first_name || 'N/A'}`);
        console.log(`   Admin: ${u.is_admin ? 'Yes' : 'No'}`);
        console.log(`   Suspended: ${u.is_suspended ? 'Yes' : 'No'}`);
        console.log(`   Has Password: ${u.password_hash ? 'Yes ✅' : 'No ❌'}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers();
