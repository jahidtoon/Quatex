const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🏦 Seeding payment method templates...');

  const templates = [
    // Bangladesh Payment Methods
    {
      title: 'bKash Personal Account',
      type: 'BKASH',
      fields: [
        { key: 'number', label: 'bKash Number', required: true, placeholder: '01xxxxxxxxx' },
        { key: 'name', label: 'Account Holder Name', required: true, placeholder: 'Your name as registered' },
        { key: 'type', label: 'Account Type', required: false, placeholder: 'Personal/Agent' }
      ],
      currency: 'BDT',
      country: 'Bangladesh',
      is_active: true
    },
    {
      title: 'Nagad Personal Account', 
      type: 'NAGAD',
      fields: [
        { key: 'number', label: 'Nagad Number', required: true, placeholder: '01xxxxxxxxx' },
        { key: 'name', label: 'Account Holder Name', required: true, placeholder: 'Your name as registered' }
      ],
      currency: 'BDT',
      country: 'Bangladesh',
      is_active: true
    },
    {
      title: 'Bank Account (Bangladesh)',
      type: 'BANK',
      fields: [
        { key: 'bank_name', label: 'Bank Name', required: true, placeholder: 'e.g., Dutch Bangla Bank' },
        { key: 'account_number', label: 'Account Number', required: true, placeholder: '123456789' },
        { key: 'account_name', label: 'Account Holder Name', required: true, placeholder: 'Full name' },
        { key: 'branch', label: 'Branch', required: false, placeholder: 'Branch name' },
        { key: 'routing_number', label: 'Routing Number', required: false, placeholder: '9 digit routing' }
      ],
      currency: 'BDT',
      country: 'Bangladesh', 
      is_active: true
    },
    {
      title: 'Credit/Debit Card',
      type: 'CARDBANK',
      fields: [
        { key: 'card_number', label: 'Card Number', required: true, placeholder: '**** **** **** 1234' },
        { key: 'card_name', label: 'Cardholder Name', required: true, placeholder: 'Name on card' },
        { key: 'bank_name', label: 'Bank Name', required: true, placeholder: 'Issuing bank' }
      ],
      currency: 'BDT',
      country: 'Bangladesh',
      is_active: true
    },

    // US Payment Methods
    {
      title: 'US Bank Account',
      type: 'BANK', 
      fields: [
        { key: 'bank_name', label: 'Bank Name', required: true, placeholder: 'e.g., Chase Bank' },
        { key: 'account_number', label: 'Account Number', required: true, placeholder: 'Account number' },
        { key: 'routing_number', label: 'Routing Number', required: true, placeholder: '9 digit ABA routing' },
        { key: 'account_name', label: 'Account Holder Name', required: true, placeholder: 'Full legal name' },
        { key: 'account_type', label: 'Account Type', required: false, placeholder: 'Checking/Savings' }
      ],
      currency: 'USD',
      country: 'United States',
      is_active: true
    },
    {
      title: 'PayPal Account',
      type: 'OTHERS',
      fields: [
        { key: 'email', label: 'PayPal Email', required: true, placeholder: 'your@email.com' },
        { key: 'name', label: 'Account Name', required: true, placeholder: 'Full name' }
      ],
      currency: 'USD',
      country: 'United States',
      is_active: true
    },

    // UK Payment Methods
    {
      title: 'UK Bank Account',
      type: 'BANK',
      fields: [
        { key: 'bank_name', label: 'Bank Name', required: true, placeholder: 'e.g., Barclays' },
        { key: 'account_number', label: 'Account Number', required: true, placeholder: '8 digit account' },
        { key: 'sort_code', label: 'Sort Code', required: true, placeholder: '12-34-56' },
        { key: 'account_name', label: 'Account Holder Name', required: true, placeholder: 'Full name' }
      ],
      currency: 'GBP',
      country: 'United Kingdom',
      is_active: true
    }
  ];

  console.log('💳 Creating payment method templates...');
  let created = 0;

  for (const template of templates) {
    try {
      // Check if template already exists
      const existing = await prisma.payment_method_templates.findFirst({
        where: {
          title: template.title,
          type: template.type,
          country: template.country
        }
      });

      if (!existing) {
        await prisma.payment_method_templates.create({ data: template });
        console.log(`✅ Created: ${template.title} (${template.country})`);
        created++;
      } else {
        console.log(`⏭️  Skipped: ${template.title} (already exists)`);
      }
    } catch (error) {
      console.error(`❌ Failed to create ${template.title}:`, error.message);
    }
  }

  console.log(`\n🎉 Payment method templates seeded successfully!`);
  console.log(`📊 Created: ${created} new templates`);
  console.log(`📋 Total templates: ${templates.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding payment templates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });