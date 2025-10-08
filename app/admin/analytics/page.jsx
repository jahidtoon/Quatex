"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return Number(value).toLocaleString();
};

const formatCurrency = (value) => {
  if (!value) return '$0';
  if (Math.abs(value) >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${Number(value).toLocaleString()}`;
};

const formatPercentage = (value) => `${(value ?? 0).toFixed(1)}%`;

export default function AnalyticsPage() {
  const [timeFrame, setTimeFrame] = useState('7d');
  const [reportType, setReportType] = useState('overview');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/analytics', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load analytics (${response.status})`);
      const payload = await response.json();
      setAnalytics(payload);
    } catch (err) {
      setError(err.message || 'Unable to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const userMetrics = useMemo(() => {
    if (!analytics?.users) return null;
    const { total = 0, verified = 0, unverified = 0 } = analytics.users;
    const computedUnverified = unverified || Math.max(total - verified, 0);
    const verificationRate = total ? (verified / total) * 100 : 0;
    return { total, verified, unverified: computedUnverified, verificationRate };
  }, [analytics]);

  const tradingMetrics = analytics?.trading;
  const financialMetrics = analytics?.financial;
  const topTraders = analytics?.topTraders || [];
  const popularPairs = analytics?.popularPairs || [];
  const recentTrades = analytics?.recentTrades || [];

  const getTimeFrameLabel = (tf) => {
    switch(tf) {
      case '24h': return 'Last 24 Hours';
      case '7d': return 'Last 7 Days';
      case '30d': return 'Last 30 Days';
      case '90d': return 'Last 90 Days';
      default: return 'Last 7 Days';
    }
  };

  const exportReport = () => {
    alert(`Exporting ${reportType} report for ${getTimeFrameLabel(timeFrame)}`);
  };

  return (
    <div>
      <AdminPageHeader 
        title="Analytics & Reports" 
        subtitle="Comprehensive platform analytics and performance metrics" 
      />

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-300">Time Frame:</label>
          <select 
            value={timeFrame} 
            onChange={(e) => setTimeFrame(e.target.value)}
            className="px-3 py-1 bg-[#1a1f33] border border-[#262b40] rounded text-white text-sm"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-300">Report Type:</label>
          <select 
            value={reportType} 
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-1 bg-[#1a1f33] border border-[#262b40] rounded text-white text-sm"
          >
            <option value="overview">Overview</option>
            <option value="users">User Analytics</option>
            <option value="trading">Trading Analytics</option>
            <option value="financial">Financial Report</option>
            <option value="performance">Performance Metrics</option>
          </select>
        </div>

        <button 
          onClick={exportReport}
          className="px-4 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          📊 Export Report
        </button>
      </div>

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="text-sm text-red-200 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchAnalytics}
              className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Users"
          value={formatNumber(userMetrics?.total)}
          hint={`${formatNumber(userMetrics?.verified)} verified`}
        />
        <StatCard
          label="Trading Volume"
          value={formatCurrency(tradingMetrics?.totalVolume)}
          hint={`${formatNumber(tradingMetrics?.totalTrades)} trades`}
        />
        <StatCard
          label="Average Trade Size"
          value={formatCurrency(tradingMetrics?.averageTradeSize)}
          hint="Across all trades"
        />
        <StatCard
          label="Net Deposits"
          value={formatCurrency(financialMetrics?.netDeposits)}
          hint={`${formatCurrency(financialMetrics?.totalDeposits)} deposits`}
        />
      </div>

      {loading ? (
        <div className="p-12 bg-[#151a2e] border border-[#262b40] rounded-xl text-center text-gray-400">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3" />
          Loading analytics data...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* User Analytics */}
            <Card title="User Analytics">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#101527] p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{formatNumber(userMetrics?.verified)}</div>
                    <div className="text-sm text-gray-400">Verified Users</div>
                    <div className="text-xs text-gray-400 mt-1">{formatPercentage(userMetrics?.verificationRate)} verification rate</div>
                  </div>
                  <div className="bg-[#101527] p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{formatNumber(userMetrics?.unverified)}</div>
                    <div className="text-sm text-gray-400">Unverified Users</div>
                    <div className="text-xs text-gray-400 mt-1">{formatNumber(userMetrics?.total)} total</div>
                  </div>
                </div>
                <div className="bg-[#101527] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Verification Progress</span>
                    <span className="text-sm text-white">{formatPercentage(userMetrics?.verificationRate)}</span>
                  </div>
                  <div className="w-full bg-[#262b40] rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(userMetrics?.verificationRate || 0, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Trading Performance */}
            <Card title="Trading Performance">
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-[#101527] p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-400">{formatNumber(tradingMetrics?.totalTrades)}</div>
                    <div className="text-sm text-gray-400">Total Trades</div>
                    <div className="text-xs text-gray-400 mt-1">Across all pairs</div>
                  </div>
                  <div className="bg-[#101527] p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{formatCurrency(tradingMetrics?.averageTradeSize)}</div>
                    <div className="text-sm text-gray-400">Avg Trade Size</div>
                    <div className="text-xs text-gray-400 mt-1">Mean trade amount</div>
                  </div>
                </div>
                <div className="bg-[#101527] p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Total Volume</span>
                    <span className="text-sm text-white">{formatCurrency(tradingMetrics?.totalVolume)}</span>
                  </div>
                  <div className="text-xs text-gray-400">Includes open and closed trades</div>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Top Traders */}
            <Card title="Top Performers">
              <div className="p-6">
                {topTraders.length === 0 ? (
                  <div className="text-center text-gray-400">No leaderboard data available.</div>
                ) : (
                  <div className="space-y-3">
                    {topTraders.map((trader, index) => (
                      <div key={`${trader.userId || trader.email}-${index}`} className="flex items-center justify-between p-3 bg-[#101527] rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                            {trader.rank ?? index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-white">{trader.name}</div>
                            <div className="text-xs text-gray-400">{formatNumber(trader.trades)} trades</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400">{formatCurrency(trader.volume)}</div>
                          <div className="text-xs text-gray-400">{trader.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Popular Currency Pairs */}
            <Card title="Popular Currency Pairs">
              <div className="p-6">
                {popularPairs.length === 0 ? (
                  <div className="text-center text-gray-400">No trading pair data available.</div>
                ) : (
                  <div className="space-y-3">
                    {popularPairs.map((pair, index) => (
                      <div key={pair.symbol || index} className="flex items-center justify-between p-3 bg-[#101527] rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-white">{pair.symbol}</div>
                            <div className="text-xs text-gray-400">{formatNumber(pair.trades)} trades</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-400">{formatCurrency(pair.volume)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          <Card title="Recent Trades">
            <div className="p-6">
              {recentTrades.length === 0 ? (
                <div className="text-center text-gray-400">No recent trades recorded.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-[#101527] text-gray-300">
                      <tr>
                        <th className="text-left p-3">ID</th>
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Symbol</th>
                        <th className="text-left p-3">Direction</th>
                        <th className="text-left p-3">Amount</th>
                        <th className="text-left p-3">Opened</th>
                        <th className="text-left p-3">Result</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentTrades.map((trade) => (
                        <tr key={trade.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                          <td className="p-3 font-mono">#{trade.id}</td>
                          <td className="p-3">{trade.user}</td>
                          <td className="p-3 font-semibold">{trade.symbol}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              trade.direction === 'BUY'
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {trade.direction}
                            </span>
                          </td>
                          <td className="p-3">{formatCurrency(trade.amount)}</td>
                          <td className="p-3 text-gray-400 text-xs">{new Date(trade.openTime).toLocaleString()}</td>
                          <td className="p-3 text-xs text-gray-300">{(trade.result || 'open').toUpperCase()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Analytics */}
        <Card title="User Analytics">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#101527] p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{analytics.users.new.toLocaleString()}</div>
                <div className="text-sm text-gray-400">New Users</div>
                <div className="text-xs text-green-400 mt-1">+12.5% vs last period</div>
              </div>
              <div className="bg-[#101527] p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-400">{analytics.users.active.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Active Users</div>
                <div className="text-xs text-green-400 mt-1">+8.3% vs last period</div>
              </div>
            </div>
            
            <div className="bg-[#101527] p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Verification Rate</span>
                <span className="text-sm text-white">{((analytics.users.verified / analytics.users.total) * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full bg-[#262b40] rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(analytics.users.verified / analytics.users.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Trading Performance */}
        <Card title="Trading Performance">
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#101527] p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{analytics.trading.totalTrades.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Trades</div>
                <div className="text-xs text-green-400 mt-1">+18.2% vs last period</div>
              </div>
              <div className="bg-[#101527] p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-400">${analytics.trading.avgTradeSize}</div>
                <div className="text-sm text-gray-400">Avg Trade Size</div>
                <div className="text-xs text-green-400 mt-1">+5.7% vs last period</div>
              </div>
            </div>
            
            <div className="bg-[#101527] p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Success Rate</span>
                <span className="text-sm text-white">{analytics.trading.successRate}%</span>
              </div>
              <div className="w-full bg-[#262b40] rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${analytics.trading.successRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Traders */}
        <Card title="Top Performers">
          <div className="p-6">
            <div className="space-y-3">
              {topTraders.map((trader) => (
                <div key={trader.rank} className="flex items-center justify-between p-3 bg-[#101527] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {trader.rank}
                    </div>
                    <div>
                      <div className="font-medium text-white">{trader.name}</div>
                      <div className="text-xs text-gray-400">{trader.trades} trades</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-400">+${trader.profit.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">{trader.winRate}% win rate</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Popular Currency Pairs */}
        <Card title="Popular Currency Pairs">
          <div className="p-6">
            <div className="space-y-3">
              {popularPairs.map((pair, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-[#101527] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-white">{pair.symbol}</div>
                      <div className="text-xs text-gray-400">{pair.trades.toLocaleString()} trades</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-400">${(pair.volume / 1000).toFixed(0)}K</div>
                    <div className={`text-xs ${pair.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pair.change >= 0 ? '+' : ''}{pair.change}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* System Health */}
      <div className="mt-6">
        <Card title="System Health & Performance">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#101527] p-4 rounded-lg">
                <div className="text-lg font-bold text-green-400">{analytics.performance.serverUptime}%</div>
                <div className="text-sm text-gray-400">Server Uptime</div>
                <div className="text-xs text-green-400 mt-1">Excellent</div>
              </div>
              <div className="bg-[#101527] p-4 rounded-lg">
                <div className="text-lg font-bold text-blue-400">{analytics.performance.avgResponseTime}ms</div>
                <div className="text-sm text-gray-400">Avg Response Time</div>
                <div className="text-xs text-green-400 mt-1">Good</div>
              </div>
              <div className="bg-[#101527] p-4 rounded-lg">
                <div className="text-lg font-bold text-yellow-400">{analytics.performance.errorRate}%</div>
                <div className="text-sm text-gray-400">Error Rate</div>
                <div className="text-xs text-green-400 mt-1">Very Low</div>
              </div>
              <div className="bg-[#101527] p-4 rounded-lg">
                <div className="text-lg font-bold text-purple-400">{analytics.performance.activeSessions.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Active Sessions</div>
                <div className="text-xs text-green-400 mt-1">Normal</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
