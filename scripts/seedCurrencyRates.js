const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedCurrencyRates() {
  console.log('Seeding currency rates...');

  const rates = [
    // USD to other currencies
    { from_currency: 'USD', to_currency: 'BDT', rate: 119.50, min_amount: 1, max_amount: 100000 },
    { from_currency: 'USD', to_currency: 'EUR', rate: 0.92, min_amount: 1, max_amount: 100000 },
    { from_currency: 'USD', to_currency: 'GBP', rate: 0.79, min_amount: 1, max_amount: 100000 },
    { from_currency: 'USD', to_currency: 'INR', rate: 83.50, min_amount: 1, max_amount: 100000 },
    { from_currency: 'USD', to_currency: 'JPY', rate: 150.0, min_amount: 1, max_amount: 100000 },
    { from_currency: 'USD', to_currency: 'CAD', rate: 1.35, min_amount: 1, max_amount: 100000 },
    { from_currency: 'USD', to_currency: 'AUD', rate: 1.52, min_amount: 1, max_amount: 100000 },
    { from_currency: 'USD', to_currency: 'CHF', rate: 0.91, min_amount: 1, max_amount: 100000 },
    { from_currency: 'USD', to_currency: 'CNY', rate: 7.25, min_amount: 1, max_amount: 100000 },

    // Reverse rates (for conversion in both directions)
    { from_currency: 'BDT', to_currency: 'USD', rate: 0.00837, min_amount: 100, max_amount: 10000000 },
    { from_currency: 'EUR', to_currency: 'USD', rate: 1.09, min_amount: 1, max_amount: 100000 },
    { from_currency: 'GBP', to_currency: 'USD', rate: 1.27, min_amount: 1, max_amount: 100000 },
    { from_currency: 'INR', to_currency: 'USD', rate: 0.012, min_amount: 50, max_amount: 5000000 },
    { from_currency: 'JPY', to_currency: 'USD', rate: 0.00667, min_amount: 100, max_amount: 10000000 },
    { from_currency: 'CAD', to_currency: 'USD', rate: 0.74, min_amount: 1, max_amount: 100000 },
    { from_currency: 'AUD', to_currency: 'USD', rate: 0.66, min_amount: 1, max_amount: 100000 },
    { from_currency: 'CHF', to_currency: 'USD', rate: 1.10, min_amount: 1, max_amount: 100000 },
    { from_currency: 'CNY', to_currency: 'USD', rate: 0.138, min_amount: 10, max_amount: 1000000 },
  ];

  for (const rate of rates) {
    try {
      await prisma.currency_rates.upsert({
        where: {
          from_currency_to_currency: {
            from_currency: rate.from_currency,
            to_currency: rate.to_currency
          }
        },
        update: {
          rate: rate.rate,
          min_amount: rate.min_amount,
          max_amount: rate.max_amount,
          last_updated: new Date()
        },
        create: rate
      });
      console.log(`✓ Added/Updated ${rate.from_currency} to ${rate.to_currency}`);
    } catch (error) {
      console.error(`✗ Failed to add ${rate.from_currency} to ${rate.to_currency}:`, error.message);
    }
  }

  console.log('Currency rates seeding completed!');
}

seedCurrencyRates()
  .catch((e) => {
    console.error('Error seeding currency rates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });