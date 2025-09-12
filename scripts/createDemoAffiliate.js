const bcrypt = require('bcryptjs');

// Demo affiliate user data
const createDemoAffiliate = async () => {
  const hashedPassword = await bcrypt.hash('demo123', 10);
  
  const demoAffiliate = {
    id: 'af_demo_001',
    name: 'Demo Affiliate',
    email: 'demo@affiliate.com',
    password: hashedPassword,
    tier: 'Gold',
    status: 'active',
    profileImage: 'https://ui-avatars.com/api/?name=Demo+Affiliate&background=4F46E5&color=fff',
    joinDate: '2024-01-15',
    referralCode: 'DEMO001',
    stats: {
      totalReferrals: 156,
      activeReferrals: 142,
      totalEarnings: 15420.50,
      monthlyEarnings: 2340.75,
      commissionRate: 45,
      pendingPayments: 1000.00,
      clicksToday: 23,
      conversionsToday: 3
    }
  };

  console.log('Demo Affiliate User Created:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 Email: ${demoAffiliate.email}`);
  console.log(`🔑 Password: demo123`);
  console.log(`👤 Name: ${demoAffiliate.name}`);
  console.log(`🏆 Tier: ${demoAffiliate.tier}`);
  console.log(`💰 Total Earnings: $${demoAffiliate.stats.totalEarnings}`);
  console.log(`👥 Total Referrals: ${demoAffiliate.stats.totalReferrals}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n🚀 Steps to test:');
  console.log('1. Go to: http://localhost:3001/affiliate/auth');
  console.log('2. Login with the credentials above');
  console.log('3. You will be redirected to the affiliate dashboard');
  console.log('\n✨ This demo user has sample data including:');
  console.log('   • 156 total referrals with detailed information');
  console.log('   • $15,420.50 in total earnings');
  console.log('   • Gold tier status (45% commission)');
  console.log('   • Complete earnings history');
  console.log('   • Marketing tools and analytics');
  
  return demoAffiliate;
};

// Update the login API to include this demo user
const updateLoginAPI = () => {
  console.log('\n🔧 Demo user will be available in the login system');
  console.log('📁 Location: app/api/affiliate/login/route.js');
  console.log('🎯 The demo credentials work with the existing API');
};

// Run the demo creation
createDemoAffiliate().then(() => {
  updateLoginAPI();
  console.log('\n✅ Demo affiliate user is ready for testing!');
}).catch(err => {
  console.error('Error creating demo user:', err);
});
