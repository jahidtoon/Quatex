import os from 'os';
import prisma from './prisma';

// Helper to safely convert values to numbers, default to 0 for null/undefined
const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const num = Number(value);
  return Number.isNaN(num) ? 0 : num;
};

const normalizeStatus = (value) => (value || '').toLowerCase();

export async function getDashboardMetrics() {
  try {
    // Separate the user counting operations from the rest to better identify any issues
    let totalUsers = 0, verifiedUsers = 0, adminUsers = 0;
    try {
      [totalUsers, verifiedUsers, adminUsers] = await Promise.all([
        prisma.users.count(),
        prisma.users.count({ where: { is_verified: true } }),
        prisma.users.count({ where: { is_admin: true } })
      ]);
      console.log("User counts fetched successfully:", { totalUsers, verifiedUsers, adminUsers });
    } catch (userCountError) {
      console.error("Error fetching user counts:", userCountError);
      // Continue with default values for user counts
    }
    
    const [
      depositsAgg,
      withdrawalsAgg,
      tradesAgg,
      openTrades,
      recentDeposits,
      recentWithdrawals,
      recentTrades,
      pendingDeposits,
      pendingWithdrawals,
      supportMessages
    ] = await Promise.all([
      prisma.deposits.aggregate({ _sum: { amount: true }, _count: { _all: true } }).catch(e => ({ _sum: { amount: null }, _count: { _all: 0 } })),
      prisma.withdrawals.aggregate({ _sum: { amount: true }, _count: { _all: true } }).catch(e => ({ _sum: { amount: null }, _count: { _all: 0 } })),
      prisma.trades.aggregate({ _sum: { amount: true }, _count: { _all: true } }).catch(e => ({ _sum: { amount: null }, _count: { _all: 0 } })),
      prisma.trades.count({ where: { result: null } }).catch(e => 0),
      prisma.deposits.findMany({
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          created_at: true,
          users: { select: { email: true } }
        }
      }),
      prisma.withdrawals.findMany({
        orderBy: { created_at: 'desc' },
        take: 10,
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          created_at: true,
          users: { select: { email: true } }
        }
      }),
      prisma.trades.findMany({
        orderBy: { open_time: 'desc' },
        take: 10,
        select: {
          id: true,
          amount: true,
          symbol: true,
          direction: true,
          result: true,
          open_time: true,
          users: { select: { email: true } }
        }
      }),
      prisma.deposits.count({ where: { status: { contains: 'pending', mode: 'insensitive' } } }),
      prisma.withdrawals.count({ where: { status: { contains: 'pending', mode: 'insensitive' } } }),
      prisma.support_messages.count()
  ]);

    const recentActivities = [
      ...recentDeposits.map((item) => ({
        id: item.id,
        type: 'deposit',
        user: item.users?.email || 'Unknown user',
        amount: toNumber(item.amount),
        method: item.method,
        status: item.status,
        timestamp: item.created_at
      })),
      ...recentWithdrawals.map((item) => ({
        id: item.id,
        type: 'withdrawal',
        user: item.users?.email || 'Unknown user',
        amount: toNumber(item.amount),
        method: item.method,
        status: item.status,
        timestamp: item.created_at
      })),
      ...recentTrades.map((item) => ({
        id: item.id,
        type: 'trade',
        user: item.users?.email || 'Unknown user',
        amount: toNumber(item.amount),
        method: item.direction,
        symbol: item.symbol,
        status: item.result || 'open',
        timestamp: item.open_time
      }))
    ]
      .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
      .slice(0, 10);

    const memoryUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const usedMem = memoryUsage.rss;
    const memoryUsagePercent = totalMem ? Number(((usedMem / totalMem) * 100).toFixed(2)) : 0;

    const loadAvg = os.loadavg()[0] || 0;
    const cpuCount = os.cpus()?.length || 1;
    const cpuLoadPercent = Number(((loadAvg / cpuCount) * 100).toFixed(2));

    return {
      stats: {
        totalUsers,
        verifiedUsers,
        adminUsers,
        totalDeposits: toNumber(depositsAgg._sum.amount),
        totalDepositsCount: depositsAgg._count._all,
        totalWithdrawals: toNumber(withdrawalsAgg._sum.amount),
        totalWithdrawalsCount: withdrawalsAgg._count._all,
        netDeposits: toNumber(depositsAgg._sum.amount) - toNumber(withdrawalsAgg._sum.amount),
        totalTrades: tradesAgg._count._all,
        totalTradeVolume: toNumber(tradesAgg._sum.amount),
        openTrades
      },
      pending: {
        deposits: pendingDeposits,
        withdrawals: pendingWithdrawals,
        supportTickets: supportMessages
      },
      recentActivities,
      system: {
        uptimeSeconds: Math.round(process.uptime()),
        memoryUsagePercent,
        cpuLoadPercent,
        serverStatus: 'online',
        databaseStatus: 'connected'
      }
    };
  } catch (err) {
    console.error("Admin dashboard metrics error:", err);
    
    // Try to fetch just the user counts before giving up completely
    let totalUsers = 0, verifiedUsers = 0, adminUsers = 0;
    try {
      [totalUsers, verifiedUsers, adminUsers] = await Promise.all([
        prisma.users.count(),
        prisma.users.count({ where: { is_verified: true } }),
        prisma.users.count({ where: { is_admin: true } })
      ]);
      console.log("Fallback user counts:", { totalUsers, verifiedUsers, adminUsers });
    } catch (userCountError) {
      console.error("Fallback user count fetch also failed:", userCountError);
    }
    
    // Return default values so dashboard doesn't break, but include any user counts we did manage to get
    return {
      stats: {
        totalUsers,
        verifiedUsers,
        adminUsers,
        totalDeposits: 0,
        totalDepositsCount: 0,
        totalWithdrawals: 0,
        totalWithdrawalsCount: 0,
        netDeposits: 0,
        totalTrades: 0,
        totalTradeVolume: 0,
        openTrades: 0
      },
      pending: {
        deposits: 0,
        withdrawals: 0,
        supportTickets: 0
      },
      recentActivities: [],
      system: {
        uptimeSeconds: Math.round(process.uptime()),
        memoryUsagePercent: 0,
        cpuLoadPercent: 0,
        serverStatus: 'issue',
        databaseStatus: 'issue'
      },
      error: err.message || 'Dashboard metrics error'
    };
  }
}

export async function getUsersSummary() {
  try {
    // Split user counts and other operations to better handle errors
    let totalUsers = 0, verified = 0, admins = 0;
    
    try {
      [totalUsers, verified, admins] = await Promise.all([
        prisma.users.count(),
        prisma.users.count({ where: { is_verified: true } }),
        prisma.users.count({ where: { is_admin: true } })
      ]);
      console.log("getUsersSummary user counts:", { totalUsers, verified, admins });
    } catch (userCountError) {
      console.error("Error fetching user counts in getUsersSummary:", userCountError);
      // Continue with default values (zeros)
    }

    let balanceAggregate = { _sum: { balance: null } };
    let recent = [];
    
    try {
      [balanceAggregate, recent] = await Promise.all([
        prisma.users.aggregate({
          _sum: { balance: true }
        }),
        prisma.users.findMany({
          orderBy: { created_at: 'desc' },
          take: 5,
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            created_at: true,
            country: true
          }
        })
      ]);
    } catch (otherError) {
      console.error("Error fetching additional user data:", otherError);
      // Continue with default values
    }

    const totalBalance = toNumber(balanceAggregate?._sum?.balance);
    const unverified = Math.max(0, totalUsers - verified);

    return { totalUsers, verified, unverified, admins, totalBalance, recent };
  } catch (error) {
    console.error("getUsersSummary failed:", error);
    return { 
      totalUsers: 0, 
      verified: 0, 
      unverified: 0, 
      admins: 0, 
      totalBalance: 0, 
      recent: [] 
    };
  }
}

export async function getUsersData({ page = 1, pageSize = 20, status = 'all', search = '' } = {}) {
  const normalizedStatus = (status || 'all').toLowerCase();
  const skip = (page - 1) * pageSize;
  const where = {};

  if (normalizedStatus !== 'all') {
    if (['active', 'verified'].includes(normalizedStatus)) {
      where.is_verified = true;
      where.is_suspended = false;
    } else if (['pending', 'inactive', 'unverified'].includes(normalizedStatus)) {
      where.is_verified = false;
      where.is_suspended = false;
    } else if (['suspended', 'suspend'].includes(normalizedStatus)) {
      where.is_suspended = true;
    } else if (['admin', 'admins'].includes(normalizedStatus)) {
      where.is_admin = true;
    }
  }

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { first_name: { contains: search, mode: 'insensitive' } },
      { last_name: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { country: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [total, rawUsers] = await Promise.all([
    prisma.users.count({ where }),
    prisma.users.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        name: true,
        country: true,
        created_at: true,
        updated_at: true,
        is_verified: true,
        is_admin: true,
        is_suspended: true,
        balance: true,
        demo_balance: true
      }
    })
  ]);

  const ids = rawUsers.map((user) => user.id);

  const [summary, tradeGroups, depositGroups, withdrawalGroups] = await Promise.all([
    getUsersSummary(),
    ids.length
      ? prisma.trades.groupBy({
          by: ['user_id'],
          where: { user_id: { in: ids } },
          _count: { _all: true }
        })
      : [],
    ids.length
      ? prisma.deposits.groupBy({
          by: ['user_id'],
          where: { user_id: { in: ids } },
          _sum: { amount: true }
        })
      : [],
    ids.length
      ? prisma.withdrawals.groupBy({
          by: ['user_id'],
          where: { user_id: { in: ids } },
          _sum: { amount: true }
        })
      : []
  ]);

  const tradeMap = Object.fromEntries(tradeGroups.map((entry) => [entry.user_id, entry._count._all]));
  const depositMap = Object.fromEntries(depositGroups.map((entry) => [entry.user_id, toNumber(entry._sum.amount)]));
  const withdrawalMap = Object.fromEntries(withdrawalGroups.map((entry) => [entry.user_id, toNumber(entry._sum.amount)]));

  const items = rawUsers.map((user) => {
    const fullName = user.name || [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email;
    const statusLabel = user.is_admin
      ? 'admin'
      : user.is_suspended
        ? 'suspended'
        : user.is_verified
          ? 'active'
          : 'pending';

    return {
      id: user.id,
      name: fullName,
      email: user.email,
      country: user.country || '—',
      joinDate: user.created_at,
      updatedAt: user.updated_at,
      balance: toNumber(user.balance),
      demoBalance: toNumber(user.demo_balance),
      verified: user.is_verified,
      isAdmin: user.is_admin,
      status: statusLabel,
      tradesCount: tradeMap[user.id] || 0,
      totalDeposits: depositMap[user.id] || 0,
      totalWithdrawals: withdrawalMap[user.id] || 0,
      lastActivity: user.updated_at
    };
  });

  return {
    total,
    page,
    pageSize,
    items,
    summary
  };
}

export async function getTradesData({ page = 1, pageSize = 20, status, search } = {}) {
  const skip = (page - 1) * pageSize;
  const where = {};

  if (status && status !== 'all') {
    where.result = status === 'open' ? null : status;
  }

  if (search) {
    where.OR = [
      { symbol: { contains: search, mode: 'insensitive' } },
      {
        users: {
          email: { contains: search, mode: 'insensitive' }
        }
      }
    ];
  }

  const [total, items, aggregates, openTrades] = await Promise.all([
    prisma.trades.count({ where }),
    prisma.trades.findMany({
      where,
      orderBy: { open_time: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        symbol: true,
        amount: true,
        direction: true,
        open_time: true,
        close_time: true,
        result: true,
        users: { select: { email: true } }
      }
    }),
    prisma.trades.aggregate({
      where,
      _sum: { amount: true }
    }),
    prisma.trades.count({ where: { result: null } })
  ]);

  const formatted = items.map((trade) => ({
    id: trade.id,
    symbol: trade.symbol,
    amount: toNumber(trade.amount),
    direction: trade.direction,
    result: trade.result,
    openTime: trade.open_time,
    closeTime: trade.close_time,
    user: trade.users?.email || 'Unknown'
  }));

  return {
    total,
    page,
    pageSize,
    items: formatted,
    summary: {
      totalVolume: toNumber(aggregates._sum.amount),
      openTrades,
      totalTrades: total
    }
  };
}

export async function getTransactionsData(type, { page = 1, pageSize = 20, status, search } = {}) {
  const skip = (page - 1) * pageSize;
  const model = type === 'deposit' ? prisma.deposits : prisma.withdrawals;
  const where = {};

  if (status && status !== 'all') {
    where.status = { equals: status, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      {
        users: {
          email: { contains: search, mode: 'insensitive' }
        }
      },
      { id: { contains: search, mode: 'insensitive' } }
    ];
  }

  const [total, items, aggregates, pendingCount, completedCount] = await Promise.all([
    model.count({ where }),
    model.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        amount: true,
        method: true,
        status: true,
        created_at: true,
        users: { select: { email: true } }
      }
    }),
    model.aggregate({
      where,
      _sum: { amount: true }
    }),
    model.count({ where: { ...where, status: { contains: 'pending', mode: 'insensitive' } } }),
    model.count({ where: { ...where, status: { contains: 'completed', mode: 'insensitive' } } })
  ]);

  const formatted = items.map((entry) => ({
    id: entry.id,
    amount: toNumber(entry.amount),
    method: entry.method,
    status: entry.status,
    createdAt: entry.created_at,
    user: entry.users?.email || 'Unknown'
  }));

  return {
    total,
    page,
    pageSize,
    items: formatted,
    summary: {
      totalAmount: toNumber(aggregates._sum.amount),
      pending: pendingCount,
      completed: completedCount
    }
  };
}

export async function getAnalyticsData() {
  const [
    userCounts,
    tradeAgg,
    depositAgg,
    withdrawalAgg,
    tradesBySymbol,
    topUsers,
    recentTrades
  ] = await Promise.all([
    prisma.users.groupBy({
      by: ['is_verified'],
      _count: { _all: true }
    }),
    prisma.trades.aggregate({
      _count: { _all: true },
      _sum: { amount: true }
    }),
    prisma.deposits.aggregate({
      _sum: { amount: true }
    }),
    prisma.withdrawals.aggregate({
      _sum: { amount: true }
    }),
    prisma.trades.groupBy({
      by: ['symbol'],
      _count: { _all: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    }),
    prisma.trades.groupBy({
      by: ['user_id'],
      _count: { _all: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    }),
    prisma.trades.findMany({
      orderBy: { open_time: 'desc' },
      take: 20,
      select: {
        id: true,
        amount: true,
        symbol: true,
        direction: true,
        open_time: true,
        result: true,
        users: { select: { email: true } }
      }
    })
  ]);

  const verified = userCounts.find((entry) => entry.is_verified) || { _count: { _all: 0 } };
  const unverified = userCounts.find((entry) => !entry.is_verified) || { _count: { _all: 0 } };

  const popularPairs = tradesBySymbol.map((entry) => ({
    symbol: entry.symbol,
    trades: entry._count._all,
    volume: toNumber(entry._sum.amount)
  }));

  const traderIds = topUsers.map((entry) => entry.user_id).filter(Boolean);
  const traderDetails = traderIds.length
    ? await prisma.users.findMany({
        where: { id: { in: traderIds } },
        select: { id: true, email: true, first_name: true, last_name: true }
      })
    : [];

  const traderMap = traderDetails.reduce((acc, user) => {
    acc[user.id] = user;
    return acc;
  }, {});

  const topTraders = topUsers
    .map((entry, index) => ({
      rank: index + 1,
      userId: entry.user_id,
      trades: entry._count._all,
      volume: toNumber(entry._sum.amount),
      email: traderMap[entry.user_id]?.email || 'Unknown trader',
      name: traderMap[entry.user_id]?.first_name
        ? `${traderMap[entry.user_id]?.first_name} ${traderMap[entry.user_id]?.last_name || ''}`.trim()
        : traderMap[entry.user_id]?.email || 'Unknown trader'
    }))
    .filter((entry) => entry.userId);

  return {
    users: {
      total: verified._count._all + unverified._count._all,
      verified: verified._count._all,
      unverified: unverified._count._all
    },
    trading: {
      totalTrades: tradeAgg._count._all,
      totalVolume: toNumber(tradeAgg._sum.amount),
      averageTradeSize: tradeAgg._count._all
        ? toNumber(tradeAgg._sum.amount) / tradeAgg._count._all
        : 0
    },
    financial: {
      totalDeposits: toNumber(depositAgg._sum.amount),
      totalWithdrawals: toNumber(withdrawalAgg._sum.amount),
      netDeposits: toNumber(depositAgg._sum.amount) - toNumber(withdrawalAgg._sum.amount)
    },
    popularPairs,
    topTraders,
    recentTrades: recentTrades.map((trade) => ({
      id: trade.id,
      symbol: trade.symbol,
      amount: toNumber(trade.amount),
      direction: trade.direction,
      result: trade.result,
      openTime: trade.open_time,
      user: trade.users?.email || 'Unknown'
    }))
  };
}

export async function getLeaderboardData() {
  const leaderboard = await prisma.leaderboard.findMany({
    orderBy: [{ rank: 'asc' }, { amount: 'desc' }],
    select: {
      id: true,
      user_id: true,
      amount: true,
      rank: true,
      updated_at: true,
      users: { select: { email: true, first_name: true, last_name: true } }
    }
  });

  return leaderboard.map((entry) => ({
    id: entry.id,
    userId: entry.user_id,
    amount: toNumber(entry.amount),
    rank: entry.rank,
    updatedAt: entry.updated_at,
    email: entry.users?.email || 'Unknown',
    name: entry.users?.first_name
      ? `${entry.users?.first_name} ${entry.users?.last_name || ''}`.trim()
      : entry.users?.email || 'Unknown'
  }));
}

export async function getTournamentsData() {
  const tournaments = await prisma.tournaments.findMany({
    orderBy: { created_at: 'desc' }
  });

  return tournaments.map((item) => ({
    ...item,
    prize_pool: toNumber(item.prize_pool),
    entry_fee: toNumber(item.entry_fee)
  }));
}

export async function getSupportTickets() {
  const tickets = await prisma.support_messages.findMany({
    orderBy: { created_at: 'desc' }
  });

  return tickets.map((ticket) => ({
    id: ticket.id,
    user_id: ticket.user_id,
    name: ticket.name,
    email: ticket.email,
    subject: ticket.subject,
    message: ticket.message,
    createdAt: ticket.created_at
  }));
}

export async function getSystemLogs(limit = 100) {
  const logFiles = [
    '/root/underdevjs/quatex/logs/combined-0.log',
    '/root/underdevjs/quatex/logs/combined-1.log',
    '/root/underdevjs/quatex/logs/out-0.log',
    '/root/underdevjs/quatex/logs/out-1.log',
    '/root/underdevjs/quatex/logs/err-0.log',
    '/root/underdevjs/quatex/logs/err-1.log'
  ];

  const fs = await import('fs/promises');
  const entries = [];

  for (const file of logFiles) {
    try {
      const content = await fs.readFile(file, 'utf8');
      const lines = content.trim().split('\n').slice(-limit);
      for (const line of lines) {
        entries.push({ source: file.split('/').pop(), line });
      }
    } catch (err) {
      // ignore missing files
    }
  }

  return entries.slice(-limit).reverse();
}

export async function getNotifications() {
  const notifications = await prisma.notifications?.findMany?.({
    orderBy: { created_at: 'desc' }
  });

  if (!notifications) {
    return [];
  }

  return notifications.map((notification) => ({
    id: notification.id,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    target: notification.target,
    status: notification.status,
    priority: notification.priority,
    scheduledFor: notification.scheduled_for,
    sentCount: notification.sent_count,
    createdAt: notification.created_at
  }));
}

export async function getRiskData() {
  const [
    tradesAgg,
    usersWithBalances,
    highExposure,
    pendingWithdrawals,
    topSymbols
  ] = await Promise.all([
    prisma.trades.aggregate({
      _sum: { amount: true },
      _count: { _all: true }
    }),
    prisma.users.findMany({
      select: {
        id: true,
        email: true,
        balance: true
      }
    }),
    prisma.trades.findMany({
      where: { amount: { gt: 5000 } },
      orderBy: { amount: 'desc' },
      take: 10,
      select: {
        id: true,
        symbol: true,
        amount: true,
        users: { select: { email: true } },
        open_time: true
      }
    }),
    prisma.withdrawals.count({
      where: { status: { contains: 'pending', mode: 'insensitive' } }
    }),
    prisma.trades.groupBy({
      by: ['symbol'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5
    })
  ]);

  const balances = usersWithBalances.map((user) => toNumber(user.balance));
  const totalBalance = balances.reduce((acc, value) => acc + value, 0);
  const averageBalance = balances.length ? totalBalance / balances.length : 0;

  return {
    exposure: {
      totalVolume: toNumber(tradesAgg._sum.amount),
      totalTrades: tradesAgg._count._all,
      averageTradeSize: tradesAgg._count._all
        ? toNumber(tradesAgg._sum.amount) / tradesAgg._count._all
        : 0
    },
    balances: {
      total: totalBalance,
      average: averageBalance
    },
    highExposureTrades: highExposure.map((trade) => ({
      id: trade.id,
      symbol: trade.symbol,
      amount: toNumber(trade.amount),
      user: trade.users?.email || 'Unknown',
      openTime: trade.open_time
    })),
    pendingWithdrawals,
    topSymbols: topSymbols.map((entry) => ({
      symbol: entry.symbol,
      volume: toNumber(entry._sum.amount)
    }))
  };
}

export async function getLiveMonitoringData() {
  const [activeUsers, openTrades, recentActivities] = await Promise.all([
    prisma.users.count({ where: { is_verified: true } }),
    prisma.trades.count({ where: { result: null } }),
    prisma.trades.findMany({
      orderBy: { open_time: 'desc' },
      take: 20,
      select: {
        id: true,
        symbol: true,
        amount: true,
        direction: true,
        open_time: true,
        users: { select: { email: true } }
      }
    })
  ]);

  return {
    summary: {
      activeUsers,
      openTrades
    },
    recentTrades: recentActivities.map((trade) => ({
      id: trade.id,
      symbol: trade.symbol,
      amount: toNumber(trade.amount),
      direction: trade.direction,
      openTime: trade.open_time,
      user: trade.users?.email || 'Unknown'
    }))
  };
}

export async function getUserAnalyticsData(userId) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  const [
    tradeAgg,
    depositAgg,
    withdrawalAgg,
    tradesBySymbol,
    recentTrades,
    allUserTrades
  ] = await Promise.all([
    prisma.trades.aggregate({
      where: { user_id: userId },
      _count: { _all: true },
      _sum: { amount: true }
    }),
    prisma.deposits.aggregate({
      where: { user_id: userId },
      _sum: { amount: true }
    }),
    prisma.withdrawals.aggregate({
      where: { user_id: userId },
      _sum: { amount: true }
    }),
    prisma.trades.groupBy({
      by: ['symbol'],
      where: { user_id: userId },
      _count: { _all: true },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 10
    }),
    prisma.trades.findMany({
      where: { user_id: userId },
      orderBy: { open_time: 'desc' },
      take: 20,
      select: {
        id: true,
        amount: true,
        symbol: true,
        direction: true,
        open_time: true,
        close_time: true,
        result: true,
        payout: true
      }
    }),
    prisma.trades.findMany({
      where: { user_id: userId },
      orderBy: { open_time: 'asc' },
      select: {
        id: true,
        amount: true,
        symbol: true,
        direction: true,
        open_time: true,
        close_time: true,
        result: true,
        payout: true
      }
    })
  ]);

  const popularPairs = tradesBySymbol.map((entry) => ({
    symbol: entry.symbol,
    trades: entry._count._all,
    volume: toNumber(entry._sum.amount)
  }));

  // Calculate win/loss statistics
  const winningTrades = allUserTrades.filter(trade => (trade.result || '').toString().toLowerCase() === 'win').length;
  const losingTrades = allUserTrades.filter(trade => (trade.result || '').toString().toLowerCase() === 'loss').length;

  // Calculate streaks (case-insensitive)
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;

  // Calculate streaks by going through trades in chronological order
  for (const trade of allUserTrades) {
    const res = (trade.result || '').toString().toLowerCase();
    if (res === 'win') {
      currentWinStreak++;
      currentLossStreak = 0;
      maxWinStreak = Math.max(maxWinStreak, currentWinStreak);
    } else if (res === 'loss') {
      currentLossStreak++;
      currentWinStreak = 0;
      maxLossStreak = Math.max(maxLossStreak, currentLossStreak);
    }
  }

  // Calculate daily profits using true PnL: win => +payout, loss => -amount
  const dailyProfits = {};
  allUserTrades.forEach(trade => {
    const res = (trade.result || '').toString().toLowerCase();
    const ts = trade.close_time || trade.open_time;
    if (!ts || !res) return;
    const date = new Date(ts).toDateString();
    let profit = 0;
    if (res === 'win') {
      profit = toNumber(trade.payout); // profit amount only
    } else if (res === 'loss') {
      profit = -toNumber(trade.amount); // lost stake
    } else {
      profit = 0; // open/pending
    }
    dailyProfits[date] = (dailyProfits[date] || 0) + profit;
  });

  const dailyProfitValues = Object.values(dailyProfits);
  const averageDailyProfit = dailyProfitValues.length > 0
    ? dailyProfitValues.reduce((sum, profit) => sum + profit, 0) / dailyProfitValues.length
    : 0;

  return {
    trading: {
      totalTrades: tradeAgg._count._all,
      totalVolume: toNumber(tradeAgg._sum.amount),
      averageTradeSize: tradeAgg._count._all
        ? toNumber(tradeAgg._sum.amount) / tradeAgg._count._all
        : 0,
      winningTrades,
      losingTrades,
      winStreak: currentWinStreak,
      lossStreak: currentLossStreak,
      maxWinStreak,
      maxLossStreak,
      averageDailyProfit
    },
    financial: {
      totalDeposits: toNumber(depositAgg._sum.amount),
      totalWithdrawals: toNumber(withdrawalAgg._sum.amount),
      netDeposits: toNumber(depositAgg._sum.amount) - toNumber(withdrawalAgg._sum.amount)
    },
    popularPairs,
    recentTrades: recentTrades.map((trade) => ({
      id: trade.id,
      symbol: trade.symbol,
      amount: toNumber(trade.amount),
      direction: trade.direction,
      result: trade.result,
      openTime: trade.open_time,
      closeTime: trade.close_time,
      payout: toNumber(trade.payout)
    }))
  };
}
