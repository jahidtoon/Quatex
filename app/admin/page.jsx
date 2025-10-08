"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from './components/AdminPageHeader';
import StatCard from './components/StatCard';
import Card from './components/Card';

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return Number(value).toLocaleString();
};

const formatCurrency = (value) => {
  if (!value) return '$0';
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const formatAmountCell = (activity) => {
  if (!activity) return '—';
  if (activity.type === 'trade') {
    return activity.symbol || 'Trade';
  }
  const prefix = activity.type === 'deposit' ? '+' : '-';
  return `${prefix}$${formatNumber(Math.abs(activity.amount || 0))}`;
};

const formatActivityStatusClass = (status) => {
  const normalized = (status || '').toLowerCase();
  if (['completed', 'success'].includes(normalized)) return 'bg-green-600/20 text-green-400';
  if (['pending', 'processing'].includes(normalized)) return 'bg-yellow-600/20 text-yellow-400';
  if (['failed', 'cancelled', 'rejected'].includes(normalized)) return 'bg-red-600/20 text-red-400';
  if (['open', 'active'].includes(normalized)) return 'bg-blue-600/20 text-blue-400';
  return 'bg-gray-600/20 text-gray-300';
};

const formatTimestamp = (value) => {
  if (!value) return '—';
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleString();
  } catch (error) {
    return '—';
  }
};

const formatUptime = (seconds) => {
  if (!seconds) return '—';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/dashboard', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load dashboard (${response.status})`);
      }
      const payload = await response.json();
      setData(payload);
    } catch (err) {
      setError(err.message || 'Unable to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statsCards = useMemo(() => {
    if (!data?.stats) return [];
    const { stats, pending } = data;
    return [
      {
        label: 'Total Users',
        value: formatNumber(stats.totalUsers),
        hint: `${formatNumber(stats.adminUsers)} admins`
      },
      {
        label: 'Verified Users',
        value: formatNumber(stats.verifiedUsers),
        hint: `${formatNumber((stats.totalUsers || 0) - (stats.verifiedUsers || 0))} unverified`
      },
      {
        label: 'Total Deposits',
        value: formatCurrency(stats.totalDeposits),
        hint: `${formatNumber(stats.totalDepositsCount)} transactions`
      },
      {
        label: 'Total Withdrawals',
        value: formatCurrency(stats.totalWithdrawals),
        hint: `${formatNumber(stats.totalWithdrawalsCount)} requests`
      },
      {
        label: 'Open Trades',
        value: formatNumber(stats.openTrades),
        hint: `${formatNumber(stats.totalTrades)} total trades`
      },
      {
        label: 'Trade Volume',
        value: formatCurrency(stats.totalTradeVolume),
        hint: `${formatCurrency(stats.netDeposits)} net deposits`
      },
      pending
        ? {
            label: 'Pending Actions',
            value: formatNumber(
              (pending.deposits || 0) + (pending.withdrawals || 0) + (pending.supportTickets || 0)
            ),
            hint: `${formatNumber(pending.deposits)} deposits • ${formatNumber(pending.withdrawals)} withdrawals • ${formatNumber(pending.supportTickets)} tickets`
          }
        : null
    ].filter(Boolean);
  }, [data]);

  const recentActivities = data?.recentActivities || [];
  const systemStatus = data?.system;
  const pending = data?.pending;

  return (
    <div>
      <AdminPageHeader
        title="Admin Dashboard"
        subtitle="Welcome to Quatex Admin Panel - Key system metrics and overview."
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="p-4 text-sm text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={loadDashboard}
              className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
        {loading && statsCards.length === 0 ? (
          [...Array(6)].map((_, index) => (
            <div key={index} className="h-28 bg-[#151a2e] border border-[#262b40] rounded-xl animate-pulse" />
          ))
        ) : (
          statsCards.map((card) => (
            <StatCard key={card.label} label={card.label} value={card.value} hint={card.hint} />
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Quick Actions">
          <div className="p-4 space-y-3">
            <a
              href="/admin/users"
              className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors"
            >
              <div className="font-medium text-white">👥 Manage Users</div>
              <div className="text-sm text-gray-400">View and manage user accounts</div>
            </a>
            <a
              href="/admin/deposits"
              className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors"
            >
              <div className="font-medium text-white">💰 Review Deposits</div>
              <div className="text-sm text-gray-400">
                Process pending deposits ({formatNumber(pending?.deposits)})
              </div>
            </a>
            <a
              href="/admin/withdrawals"
              className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors"
            >
              <div className="font-medium text-white">💸 Handle Withdrawals</div>
              <div className="text-sm text-gray-400">
                Review withdrawal requests ({formatNumber(pending?.withdrawals)})
              </div>
            </a>
            <a
              href="/admin/support"
              className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors"
            >
              <div className="font-medium text-white">🎧 Support Tickets</div>
              <div className="text-sm text-gray-400">
                Manage customer support ({formatNumber(pending?.supportTickets)})
              </div>
            </a>
            <a
              href="/admin/live-monitoring"
              className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors"
            >
              <div className="font-medium text-white">📊 Live Monitoring</div>
              <div className="text-sm text-gray-400">Real-time platform monitoring</div>
            </a>
            <a
              href="/admin/risk-management"
              className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors"
            >
              <div className="font-medium text-white">⚠️ Risk Management</div>
              <div className="text-sm text-gray-400">Monitor risk exposure</div>
            </a>
          </div>
        </Card>

        <Card title="System Status">
          <div className="p-4 space-y-4 text-sm">
            {loading && !systemStatus ? (
              <div className="space-y-2">
                <div className="h-4 bg-[#1a1f33] rounded animate-pulse" />
                <div className="h-4 bg-[#1a1f33] rounded animate-pulse" />
                <div className="h-4 bg-[#1a1f33] rounded animate-pulse" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Server Status</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    systemStatus?.serverStatus === 'online'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {systemStatus?.serverStatus === 'online' ? '✅ Online' : '⚠️ Issue'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Database</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    systemStatus?.databaseStatus === 'connected'
                      ? 'bg-green-600/20 text-green-400'
                      : 'bg-red-600/20 text-red-400'
                  }`}>
                    {systemStatus?.databaseStatus === 'connected' ? '✅ Connected' : '⚠️ Issue'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">CPU Load</span>
                  <span className="text-gray-200 font-semibold">
                    {systemStatus ? `${systemStatus.cpuLoadPercent}%` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Memory Usage</span>
                  <span className="text-gray-200 font-semibold">
                    {systemStatus ? `${systemStatus.memoryUsagePercent}%` : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Uptime</span>
                  <span className="text-gray-200 font-semibold">
                    {formatUptime(systemStatus?.uptimeSeconds)}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
        {loading && recentActivities.length === 0 ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="text-gray-400 mt-2">Loading recent activity...</p>
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No recent activity recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Action</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivities.map((activity) => (
                  <tr key={`${activity.type}-${activity.id}`} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-3 text-gray-400 text-xs">{formatTimestamp(activity.timestamp)}</td>
                    <td className="p-3">{activity.user || 'Unknown'}</td>
                    <td className="p-3 capitalize">{activity.type}</td>
                    <td className="p-3 font-medium text-blue-400">{formatAmountCell(activity)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs ${formatActivityStatusClass(activity.status)}`}>
                        {(activity.status || 'unknown').toString().toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}