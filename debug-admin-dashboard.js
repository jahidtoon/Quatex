const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAdminDashboard() {
  try {
    console.log("\n--- Debugging Admin Dashboard API ---");

    // Step 1: Check for SQLite database connection
    console.log("\n1. Checking database connection:");
    try {
      const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
      console.log("✅ Database connection successful:", testQuery);
    } catch (dbErr) {
      console.error("❌ Database connection error:", dbErr);
    }

    // Step 2: Check if getDashboardMetrics function would work
    console.log("\n2. Testing dashboard metrics data retrieval:");

    // These are the same queries used in adminMetrics.js getDashboardMetrics
    try {
      const totalUsers = await prisma.users.count();
      console.log(`✅ Users count query successful: ${totalUsers} users`);
    } catch (err) {
      console.error("❌ Users count query failed:", err);
    }

    try {
      const verifiedUsers = await prisma.users.count({ where: { is_verified: true } });
      console.log(`✅ Verified users query successful: ${verifiedUsers} verified users`);
    } catch (err) {
      console.error("❌ Verified users query failed:", err);
    }

    try {
      const depositsAgg = await prisma.deposits.aggregate({ 
        _sum: { amount: true }, 
        _count: { _all: true } 
      });
      console.log(`✅ Deposits aggregate successful:`, {
        sum: depositsAgg._sum.amount,
        count: depositsAgg._count._all
      });
    } catch (err) {
      console.error("❌ Deposits aggregate failed:", err);
    }

    // Step 3: Test API simulation
    console.log("\n3. Simulating full dashboard metrics retrieval:");
    try {
      const [
        totalUsers,
        verifiedUsers,
        adminUsers,
        depositsAgg,
        withdrawalsAgg,
        tradesAgg,
        openTrades,
      ] = await Promise.all([
        prisma.users.count(),
        prisma.users.count({ where: { is_verified: true } }),
        prisma.users.count({ where: { is_admin: true } }),
        prisma.deposits.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
        prisma.withdrawals.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
        prisma.trades.aggregate({ _sum: { amount: true }, _count: { _all: true } }),
        prisma.trades.count({ where: { result: null } }),
      ]);

      console.log("✅ Full dashboard metrics successfully retrieved:");
      console.log({
        totalUsers,
        verifiedUsers,
        adminUsers,
        totalDeposits: depositsAgg._sum.amount,
        totalDepositsCount: depositsAgg._count._all,
        totalWithdrawals: withdrawalsAgg._sum.amount,
        totalWithdrawalsCount: withdrawalsAgg._count._all,
        totalTrades: tradesAgg._count._all,
        totalTradeVolume: tradesAgg._sum.amount,
        openTrades
      });
    } catch (err) {
      console.error("❌ Full dashboard metrics retrieval failed:", err);
    }

    console.log("\n4. Testing recentActivities retrieval:");
    try {
      const recentDeposits = await prisma.deposits.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          created_at: true,
          users: { select: { email: true } }
        }
      });
      console.log(`✅ Recent deposits query successful: ${recentDeposits.length} results`);
      
      if (recentDeposits.length > 0) {
        const sample = recentDeposits[0];
        console.log("Sample deposit:", {
          id: sample.id,
          amount: sample.amount,
          userEmail: sample.users?.email || 'Unknown user'
        });
      }
    } catch (err) {
      console.error("❌ Recent deposits query failed:", err);
    }

  } catch (err) {
    console.error("Debug error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

debugAdminDashboard();