import prisma from '../lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  // Demo user seeding
  const demoEmail = 'demo@example.com';
  const demoPassword = 'Demo@1234';
  const existingDemo = await prisma.users.findUnique({ where: { email: demoEmail } });
  if (!existingDemo) {
    const password_hash = await bcrypt.hash(demoPassword, 10);
    await prisma.users.create({
      data: {
        email: demoEmail,
        first_name: 'Demo',
        last_name: 'User',
        name: 'Demo User',
        password_hash,
        is_verified: true,
        country: 'BD'
      }
    });
    console.log('Seeded demo user:', demoEmail, 'password:', demoPassword);
  }

  // Seed admin user
  const adminEmail = 'admin@example.com';
  const existingAdmin = await prisma.users.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const adminHash = await bcrypt.hash('Admin@1234', 10);
    await prisma.users.create({
      data: {
        email: adminEmail,
        first_name: 'Admin',
        last_name: 'User',
        name: 'Admin User',
        password_hash: adminHash,
        is_verified: true,
        is_admin: true
      }
    });
    console.log('Seeded admin user:', adminEmail, 'password: Admin@1234');
  }
  const defaults = [
    ['EUR','USD',80],
    ['GBP','USD',78],
    ['AUD','CHF',75],
    ['EUR','JPY',82],
    ['CAD','JPY',74]
  ];
  for (const [base, quote, payout] of defaults) {
    const symbol = `${base}_${quote}`;
    const exists = await prisma.currency_pairs.findUnique({ where: { symbol } });
    if (!exists) {
      await prisma.currency_pairs.create({ data: { base, quote, symbol, display: `${base}/${quote}`, payout } });
    }
  }
}

main().then(()=>{ console.log('Seed complete'); process.exit(0);}).catch(e=>{ console.error(e); process.exit(1);});
