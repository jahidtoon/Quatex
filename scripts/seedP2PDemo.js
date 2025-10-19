const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🎬 Seeding P2P demo data...');

  try {
    // Create demo users with balances
    const demoUsers = [
      {
        email: 'alice@p2p.demo',
        name: 'Alice Seller',
        password: await bcrypt.hash('password123', 10),
        is_verified: true,
        balance: 50000,
      },
      {
        email: 'bob@p2p.demo', 
        name: 'Bob Buyer',
        password: await bcrypt.hash('password123', 10),
        is_verified: true,
        balance: 25000,
      },
      {
        email: 'charlie@p2p.demo',
        name: 'Charlie Trader',
        password: await bcrypt.hash('password123', 10),
        is_verified: true,
        balance: 75000,
      }
    ];

    console.log('📝 Creating demo users...');
    const users = [];
    for (const userData of demoUsers) {
      let user = await prisma.users.findUnique({ where: { email: userData.email } });
      if (!user) {
        user = await prisma.users.create({
          data: {
            email: userData.email,
            name: userData.name,
            password_hash: userData.password,
            is_verified: userData.is_verified,
            balance: userData.balance,
          }
        });
        console.log(`✅ Created user: ${user.email}`);
      } else {
        console.log(`🔄 User already exists: ${user.email}`);
      }
      users.push(user);
    }

    // Add crypto balances to wallet_ledger
    console.log('💰 Adding crypto balances...');
    const cryptoBalances = [
      { userId: users[0].id, asset: 'USDT', amount: 1000 },
      { userId: users[0].id, asset: 'BTC', amount: 0.5 },
      { userId: users[1].id, asset: 'USDT', amount: 500 },
      { userId: users[2].id, asset: 'USDT', amount: 2000 },
      { userId: users[2].id, asset: 'BTC', amount: 0.1 },
    ];

    for (const balance of cryptoBalances) {
      await prisma.wallet_ledger.create({
        data: {
          user_id: balance.userId,
          type: 'DEPOSIT',
          asset: balance.asset,
          amount: balance.amount,
          meta: { source: 'demo_seed' }
        }
      });
      console.log(`💸 Added ${balance.amount} ${balance.asset} to user ${balance.userId.slice(0,8)}...`);
    }

    // Create payment methods
    console.log('🏦 Creating payment methods...');
    const paymentMethods = [];
    
    for (const user of users) {
      const methods = [
        {
          user_id: user.id,
          type: 'BKASH',
          label: 'Personal Bkash',
          details: { number: `+8801${Math.floor(Math.random() * 100000000)}`, name: user.name },
          is_verified: true
        },
        {
          user_id: user.id,
          type: 'BANK',
          label: 'DBBL Account',
          details: { 
            bank_name: 'Dutch Bangla Bank', 
            account_number: `****${Math.floor(Math.random() * 10000)}`,
            account_name: user.name
          },
          is_verified: true
        }
      ];

      for (const method of methods) {
        const pm = await prisma.user_payment_methods.create({ data: method });
        paymentMethods.push(pm);
        console.log(`💳 Created ${method.type} for ${user.name}`);
      }
    }

    // Create P2P offers
    console.log('📊 Creating P2P offers...');
    const offers = [
      {
        user_id: users[0].id, // Alice
        side: 'SELL',
        asset_symbol: 'USDT',
        fiat_currency: 'BDT',
        price_type: 'FIXED',
        fixed_price: 110.50,
        min_amount_asset: 10,
        max_amount_asset: 500,
        min_limit_fiat: 1000,
        max_limit_fiat: 50000,
        terms: 'Payment within 15 minutes. Bkash/Bank transfer only.',
        auto_reply: 'Hi! Please make payment and upload receipt. Thanks!',
        status: 'ACTIVE'
      },
      {
        user_id: users[2].id, // Charlie
        side: 'SELL',
        asset_symbol: 'USDT',
        fiat_currency: 'BDT',
        price_type: 'FIXED',
        fixed_price: 109.80,
        min_amount_asset: 50,
        max_amount_asset: 1000,
        min_limit_fiat: 5000,
        max_limit_fiat: 100000,
        terms: 'Quick release. Trusted trader since 2022.',
        status: 'ACTIVE'
      },
      {
        user_id: users[1].id, // Bob
        side: 'BUY',
        asset_symbol: 'USDT',
        fiat_currency: 'BDT',
        price_type: 'FIXED',
        fixed_price: 108.50,
        min_amount_asset: 20,
        max_amount_asset: 300,
        min_limit_fiat: 2000,
        max_limit_fiat: 30000,
        terms: 'Looking to buy USDT regularly. Fast payment guaranteed.',
        status: 'ACTIVE'
      },
      {
        user_id: users[2].id, // Charlie
        side: 'SELL',
        asset_symbol: 'BTC',
        fiat_currency: 'BDT',
        price_type: 'FIXED',
        fixed_price: 4500000, // 45 lac BDT per BTC
        min_amount_asset: 0.001,
        max_amount_asset: 0.1,
        min_limit_fiat: 4500,
        max_limit_fiat: 450000,
        terms: 'Bitcoin trading. Serious buyers only.',
        status: 'ACTIVE'
      }
    ];

    const createdOffers = [];
    for (const offerData of offers) {
      const offer = await prisma.p2p_offers.create({ data: offerData });
      createdOffers.push(offer);
      console.log(`🎯 Created ${offer.side} offer for ${offer.asset_symbol} by ${offer.user_id.slice(0,8)}...`);

      // Link payment methods to offers
      const userPaymentMethods = paymentMethods.filter(pm => pm.user_id === offer.user_id);
      for (const pm of userPaymentMethods.slice(0, 2)) { // Link first 2 payment methods
        await prisma.p2p_offer_payment_methods.create({
          data: {
            offer_id: offer.id,
            payment_method_id: pm.id
          }
        });
      }
    }

    // Create a sample order
    console.log('📋 Creating sample order...');
    const sampleOffer = createdOffers.find(o => o.side === 'SELL' && o.asset_symbol === 'USDT');
    if (sampleOffer) {
      const order = await prisma.p2p_orders.create({
        data: {
          offer_id: sampleOffer.id,
          maker_id: sampleOffer.user_id,
          taker_id: users[1].id, // Bob as taker
          side: sampleOffer.side,
          asset_symbol: sampleOffer.asset_symbol,
          fiat_currency: sampleOffer.fiat_currency,
          price: sampleOffer.fixed_price,
          amount_asset: 50,
          amount_fiat: 50 * Number(sampleOffer.fixed_price),
          status: 'ESCROW_HELD',
          escrow_held: true,
          reference_code: 'P2P-' + Math.floor(Math.random() * 1000000),
          meta: { demo_order: true }
        }
      });

      // Create escrow hold ledger
      await prisma.wallet_ledger.create({
        data: {
          user_id: sampleOffer.user_id,
          type: 'P2P_ESCROW_HOLD',
          asset: sampleOffer.asset_symbol,
          amount: -50,
          meta: { order_id: order.id, escrow: true }
        }
      });

      console.log(`📦 Created sample order: ${order.reference_code}`);

      // Add sample messages
      const messages = [
        {
          order_id: order.id,
          sender_id: order.taker_id,
          message: 'Hi! I would like to buy 50 USDT. Will send payment now.'
        },
        {
          order_id: order.id,
          sender_id: order.maker_id,
          message: 'Hello! Sure, please send to my Bkash number and upload receipt.'
        },
        {
          order_id: order.id,
          sender_id: order.taker_id,
          message: 'Payment sent! TxID: BKH123456789. Please check and release.'
        }
      ];

      for (const msg of messages) {
        await prisma.p2p_messages.create({ data: msg });
      }
      console.log(`💬 Added sample messages to order`);
    }

    console.log('\n🎉 P2P Demo data seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`👥 Users: ${users.length}`);
    console.log(`💳 Payment Methods: ${paymentMethods.length}`);
    console.log(`🎯 Offers: ${createdOffers.length}`);
    console.log('🔐 Demo login credentials:');
    console.log('   alice@p2p.demo / password123 (Seller)');
    console.log('   bob@p2p.demo / password123 (Buyer)');
    console.log('   charlie@p2p.demo / password123 (Trader)');

  } catch (error) {
    console.error('❌ Error seeding P2P data:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });