const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const email = process.argv[2] || 'affiliate@quatex.com';
    const password = process.argv[3] || 'affiliate123';
    const aff = await prisma.affiliates.findUnique({ where: { email } });
    console.log('affiliate row:', aff);
    if (!aff) return;
    const ok = await bcrypt.compare(password, aff.password_hash || '');
    console.log('password ok?', ok);
  } catch (e) {
    console.error('error:', e);
  } finally {
    await prisma.$disconnect();
  }
})();
