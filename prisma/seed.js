// Converted to CommonJS so it runs with `node prisma/seed.js` without ESM config
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

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
        country: 'BD',
        balance: 0,
        demo_balance: 10000
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
        is_admin: true,
        balance: 0,
        demo_balance: 10000
      }
    });
    console.log('Seeded admin user:', adminEmail, 'password: Admin@1234');
  }
  await prisma.users.updateMany({
    where: { demo_balance: null },
    data: { demo_balance: 10000 }
  });
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

  // ---------------- P2P Demo Seed ----------------
  const demoUser = await prisma.users.findUnique({ where: { email: demoEmail } });
  const adminUser = await prisma.users.findUnique({ where: { email: adminEmail } });
  if (demoUser) {
    // Ensure demo has some wallet ledger balance in USDT (for SELL offers)
    const demoHasUSDT = await prisma.wallet_ledger.findFirst({ where: { user_id: demoUser.id, asset: 'USDT' } });
    if (!demoHasUSDT) {
      await prisma.wallet_ledger.create({
        data: {
          user_id: demoUser.id,
          type: 'ADJUST',
          asset: 'USDT',
          amount: 500, // give 500 USDT for demo
          meta: { seed: true, reason: 'p2p demo balance' }
        }
      });
    }

    // Payment methods for demo user
    const pm1 = await prisma.user_payment_methods.upsert({
      where: { id: 'seed-demo-bkash' },
      update: {},
      create: {
        id: 'seed-demo-bkash',
        user_id: demoUser.id,
        type: 'BKASH',
        label: 'Demo bKash',
        details: { number: '01XXXXXXXXX', name: 'Demo User' },
        is_verified: true
      }
    });
    const pm2 = await prisma.user_payment_methods.upsert({
      where: { id: 'seed-demo-nagad' },
      update: {},
      create: {
        id: 'seed-demo-nagad',
        user_id: demoUser.id,
        type: 'NAGAD',
        label: 'Demo Nagad',
        details: { number: '01YYYYYYYYY', name: 'Demo User' },
        is_verified: true
      }
    });

    // A SELL USDT offer in BDT
    const existingSell = await prisma.p2p_offers.findFirst({
      where: { user_id: demoUser.id, side: 'SELL', asset_symbol: 'USDT', fiat_currency: 'BDT', status: 'ACTIVE' }
    });
    if (!existingSell) {
      const offer = await prisma.p2p_offers.create({
        data: {
          user_id: demoUser.id,
          side: 'SELL',
          asset_symbol: 'USDT',
          fiat_currency: 'BDT',
          price_type: 'FIXED',
          fixed_price: 120, // 1 USDT = 120 BDT (demo)
          min_amount_asset: 10,
          max_amount_asset: 200,
          min_limit_fiat: 1200,
          max_limit_fiat: 24000,
          terms: 'Send from your own bKash/Nagad only.',
          auto_reply: 'Thanks for ordering! Pay and mark as paid.'
        }
      });
      const linkRows = [
        { offer_id: offer.id, payment_method_id: pm1.id },
        { offer_id: offer.id, payment_method_id: pm2.id }
      ];
      for (const row of linkRows) {
        try {
          await prisma.p2p_offer_payment_methods.create({ data: row });
        } catch (e) {
          // Ignore duplicate
          if (!(e && e.code === 'P2002')) throw e;
        }
      }
    }

    // A BUY USDT offer in BDT (demo)
    const existingBuy = await prisma.p2p_offers.findFirst({
      where: { user_id: demoUser.id, side: 'BUY', asset_symbol: 'USDT', fiat_currency: 'BDT', status: 'ACTIVE' }
    });
    if (!existingBuy) {
      const offer2 = await prisma.p2p_offers.create({
        data: {
          user_id: demoUser.id,
          side: 'BUY',
          asset_symbol: 'USDT',
          fiat_currency: 'BDT',
          price_type: 'FIXED',
          fixed_price: 118, // buy a bit cheaper
          min_amount_asset: 5,
          max_amount_asset: 100,
          min_limit_fiat: 590,
          max_limit_fiat: 11800,
          terms: 'We pay instantly to bKash/Nagad.',
          auto_reply: 'We will confirm ASAP.'
        }
      });
      const linkRows2 = [ { offer_id: offer2.id, payment_method_id: pm1.id } ];
      for (const row of linkRows2) {
        try {
          await prisma.p2p_offer_payment_methods.create({ data: row });
        } catch (e) {
          if (!(e && e.code === 'P2002')) throw e;
        }
      }
    }
  }

  // ---------------- Affiliate Demo Seed ----------------
  // Create a demo affiliate account for testing affiliate module
  const affEmail = 'affiliate@quatex.com';
  let affiliate = await prisma.affiliates.findUnique({ where: { email: affEmail } });
  if (!affiliate) {
    const affHash = await bcrypt.hash('affiliate123', 10);
    affiliate = await prisma.affiliates.create({
      data: {
        name: 'Demo Affiliate',
        email: affEmail,
        password_hash: affHash,
        country: 'BD',
        tier: 'Gold',
        commission_rate: 45,
        referral_code: 'AFF001',
        status: 'Active'
      }
    });
    console.log('Seeded demo affiliate:', affEmail, 'password: affiliate123');
  }

  // Create a few referred users if they don't exist
  const referredEmails = ['ahmed@example.com','sarah@example.com','mike@example.com'];
  const referredUsers = [];
  for (const [i, email] of referredEmails.entries()) {
    let u = await prisma.users.findUnique({ where: { email } });
    if (!u) {
      const hash = await bcrypt.hash('User@1234', 10);
      u = await prisma.users.create({
        data: {
          email,
          name: email.split('@')[0],
          password_hash: hash,
          is_verified: true,
          country: i === 0 ? 'Bangladesh' : i === 1 ? 'Pakistan' : 'USA'
        }
      });
    }
    referredUsers.push(u);
    // Link referral row
    const existsRef = await prisma.affiliate_referrals.findFirst({ where: { affiliate_id: affiliate.id, user_id: u.id } });
    if (!existsRef) {
      await prisma.affiliate_referrals.create({
        data: {
          affiliate_id: affiliate.id,
          user_id: u.id,
          status: i === 2 ? 'Pending' : 'Active',
          total_deposit: (i+1) * 500,
          total_trades: (i+1) * 10,
          earnings: (i+1) * 50
        }
      });
    }
  }

  // Some commissions
  const anyCommission = await prisma.affiliate_commissions.findFirst({ where: { affiliate_id: affiliate.id } });
  if (!anyCommission) {
    await prisma.affiliate_commissions.createMany({
      data: [
        {
          affiliate_id: affiliate.id,
          referral_user_id: referredUsers[0].id,
          type: 'REFERRAL_DEPOSIT',
          rate: 45,
          amount: 125.5,
          status: 'paid',
          description: 'Commission from user deposit',
          transaction_id: 'TXN001'
        },
        {
          affiliate_id: affiliate.id,
          referral_user_id: referredUsers[1].id,
          type: 'TRADE_VOLUME',
          rate: 45,
          amount: 89.25,
          status: 'pending',
          description: 'Commission from trading activity',
          transaction_id: 'TXN002'
        },
        {
          affiliate_id: affiliate.id,
          type: 'MONTHLY_BONUS',
          rate: 0,
          amount: 500,
          status: 'paid',
          description: 'Performance bonus',
          transaction_id: 'TXN003'
        }
      ]
    });
  }

  // A payout record
  const anyPayout = await prisma.affiliate_payouts.findFirst({ where: { affiliate_id: affiliate.id } });
  if (!anyPayout) {
    await prisma.affiliate_payouts.create({
      data: {
        affiliate_id: affiliate.id,
        amount: 150,
        method: 'Bitcoin',
        status: 'Paid',
        requested_at: new Date(Date.now() - 7*24*3600*1000),
        processed_at: new Date(Date.now() - 5*24*3600*1000),
        note: 'Seed payout'
      }
    });
  }
}

main()
  .then(async () => {
    console.log('Seed complete');
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
