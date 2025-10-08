const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  try {
    console.log("\n--- Testing adminMetrics.js functionality ---");

    console.log("\n1. Testing user counts:");
    const totalUsers = await prisma.users.count();
    const verifiedUsers = await prisma.users.count({ where: { is_verified: true } });
    const adminUsers = await prisma.users.count({ where: { is_admin: true } });
    console.log(`Total users: ${totalUsers}`);
    console.log(`Verified users: ${verifiedUsers}`);
    console.log(`Admin users: ${adminUsers}`);

    console.log("\n2. Testing deposits aggregation:");
    const depositsAgg = await prisma.deposits.aggregate({ _sum: { amount: true }, _count: { _all: true } });
    console.log(`Total deposits: ${depositsAgg._sum.amount || 0}`);
    console.log(`Number of deposits: ${depositsAgg._count._all || 0}`);

    console.log("\n3. Testing withdrawals aggregation:");
    const withdrawalsAgg = await prisma.withdrawals.aggregate({ _sum: { amount: true }, _count: { _all: true } });
    console.log(`Total withdrawals: ${withdrawalsAgg._sum.amount || 0}`);
    console.log(`Number of withdrawals: ${withdrawalsAgg._count._all || 0}`);

    console.log("\n4. Testing trades aggregation:");
    const tradesAgg = await prisma.trades.aggregate({ _sum: { amount: true }, _count: { _all: true } });
    console.log(`Total trades volume: ${tradesAgg._sum.amount || 0}`);
    console.log(`Number of trades: ${tradesAgg._count._all || 0}`);

    console.log("\n5. Testing open trades count:");
    const openTrades = await prisma.trades.count({ where: { result: null } });
    console.log(`Open trades: ${openTrades}`);

    console.log("\n6. Testing recent activities:");
    const recentDeposits = await prisma.deposits.findMany({
      orderBy: { created_at: 'desc' },
      take: 3,
      include: { users: true }
    });
    console.log(`Recent deposits: ${recentDeposits.length}`);
    if (recentDeposits.length > 0) {
      console.log(`Sample deposit: id=${recentDeposits[0].id}, amount=${recentDeposits[0].amount}, user=${recentDeposits[0].users?.email || 'unknown'}`);
    }

    console.log("\n7. Checking SQL queries execution:");
    await prisma.$queryRaw`SELECT COUNT(*) FROM users`;
    console.log("Basic SQL query executed successfully");

  } catch (err) {
    console.error("Test error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();