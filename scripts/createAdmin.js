// Usage:
//   npm run create:admin -- <email> <password> [firstName] [lastName]
// Or with env vars:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_FIRST=... ADMIN_LAST=... npm run create:admin

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const args = process.argv.slice(2);
  const email = process.env.ADMIN_EMAIL || args[0];
  const password = process.env.ADMIN_PASSWORD || args[1];
  const first = process.env.ADMIN_FIRST || args[2] || 'Admin';
  const last = process.env.ADMIN_LAST || args[3] || 'User';

  if (!email || !password) {
    console.error('Provide email and password.');
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash(password, 10);
    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
      const updated = await prisma.users.update({
        where: { email },
        data: {
          first_name: first,
          last_name: last,
          name: `${first} ${last}`,
          password_hash: hash,
          is_verified: true,
          is_admin: true,
        },
      });
      console.log('Updated admin user:', updated.email);
    } else {
      const created = await prisma.users.create({
        data: {
          email,
          first_name: first,
          last_name: last,
          name: `${first} ${last}`,
          password_hash: hash,
          is_verified: true,
          is_admin: true,
        },
      });
      console.log('Created admin user:', created.email);
    }
    console.log('Password:', password);
  } catch (e) {
    console.error('Error creating admin:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
