const prisma = require('../lib/prisma').default || require('../lib/prisma');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const email = process.argv[2] || 'affiliate@quatex.com';
    const password = process.argv[3] || 'affiliate123';
    const aff = await prisma.affiliates.findUnique({ where: { email } });
    if (!aff) { console.log('not found'); process.exit(0); }
    const ok = await bcrypt.compare(password, aff.password_hash || '');
    console.log('found:', aff.email, 'pass ok?', ok);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
})();
