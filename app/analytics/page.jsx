"use client";
import React, { useState, useEffect, useCallback } from 'react';
// import Link from 'next/link';
import MainAppLayout from '../components/MainAppLayout';
import { authUtils } from '../../lib/auth';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedAsset, setSelectedAsset] = useState('all');
  const [viewType, setViewType] = useState('overview'); // overview, portfolio, performance, risk

  const periods = [
    { value: '1d', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const viewTypes = [
    { value: 'overview', label: 'Overview', icon: 'fa-eye' },
    { value: 'portfolio', label: 'Portfolio', icon: 'fa-briefcase' },
    { value: 'performance', label: 'Performance', icon: 'fa-trophy' },
    { value: 'risk', label: 'Risk Analysis', icon: 'fa-shield-alt' }
  ];

  // State for real data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const token = authUtils.isAuthenticated() ? localStorage.getItem('auth_token') : null;
      if (!token) {
        throw new Error('Authentication required');
      }

      const res = await fetch('/api/analytics/summary', {
        cache: 'no-store',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const analytics = data?.analytics;
  const derived = data?.derived;

  // Map to previous variable names / structures
  const stats = {
    totalTrades: analytics?.trading?.totalTrades || 0,
    successRate: derived?.successRate ?? 0,
    totalProfit: derived?.totalProfitApprox ?? 0,
    totalLoss: 0, // placeholder until we store realized losses separately
    netProfit: derived?.totalProfitApprox ?? 0,
    avgTradeTime: '—',
    bestDay: '—',
    worstDay: '—',
    portfolioValue: analytics?.financial?.netDeposits || 0,
    dailyChange: '—',
    weeklyChange: '—',
    monthlyChange: '—',
    sharpeRatio: '—',
    maxDrawdown: '—',
    volatility: '—',
    riskScore: 0,
    winStreak: analytics?.trading?.winStreak || 0,
    lossStreak: analytics?.trading?.lossStreak || 0,
    averageDailyProfit: analytics?.trading?.averageDailyProfit || 0
  };

  const assetPerformance = analytics?.popularPairs?.map(p => ({
    asset: p.symbol,
    trades: p.trades,
    winRate: 0, // Will be calculated properly once we have win/loss data per symbol
    profit: `$${p.volume.toFixed(2)}`
  })) || [];

  const recentTrades = analytics?.recentTrades?.map(t => ({
    id: t.id,
    asset: t.symbol,
    direction: t.direction,
    amount: t.amount,
    result: t.result || 'open',
    profit: t.result === 'WIN' ? `+$${(t.amount).toFixed(2)}` : t.result === 'LOSS' ? `-$${(t.amount).toFixed(2)}` : '—',
    time: new Date(t.openTime).toLocaleTimeString()
  })) || [];

  const portfolioBreakdown = assetPerformance.slice(0,5).map((a,i) => ({
    asset: a.asset,
    allocation: 0,
    value: a.trades, // placeholder mapping
    change: '—',
    color: ['bg-orange-500','bg-blue-500','bg-gray-500','bg-green-500','bg-yellow-500'][i%5]
  }));

  const performanceMetrics = [
    { label: 'Total Trades', value: stats.totalTrades, change: '', icon: 'fa-exchange-alt' },
    { label: 'Net Deposits', value: `$${(analytics?.financial?.netDeposits||0).toFixed(2)}` , change: '', icon: 'fa-wallet' },
    { label: 'Avg Trade Size', value: `$${(analytics?.trading?.averageTradeSize||0).toFixed(2)}`, change: '', icon: 'fa-balance-scale' },
    { label: 'Win Rate', value: `${stats.successRate}%`, change: '', icon: 'fa-trophy' }
  ];

  const riskMetrics = [
    { label: 'Total Trades', value: `${stats.totalTrades}`, status: 'medium' },
    { label: 'Win Rate', value: `${stats.successRate}%`, status: stats.successRate >= 60 ? 'low' : stats.successRate >= 40 ? 'medium' : 'high' },
    { label: 'Net Deposits', value: `$${(analytics?.financial?.netDeposits||0).toFixed(2)}`, status: 'low' }
  ];

  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl md:text-3xl font-bold">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={fetchData} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <i className="fas fa-rotate-right"></i>
              Refresh
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              <i className="fas fa-download mr-2"></i>Export Report
            </button>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mt-4">
          {viewTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setViewType(type.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewType === type.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <i className={`fas ${type.icon} mr-2`}></i>
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {/* Loading / Error states */}
        {loading && (
          <div className="p-10 text-center text-gray-400">Loading analytics…</div>
        )}
        {error && !loading && (
          <div className="p-6 mb-6 bg-red-900/40 border border-red-700 rounded text-red-300">
            <p className="font-semibold mb-2">Failed to load analytics</p>
            <p className="text-sm mb-4">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm">Retry</button>
          </div>
        )}

        {/* Portfolio Value Header */}
        {!loading && !error && (
        <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Portfolio Value</h2>
              <p className="text-4xl font-bold">${Number(stats.portfolioValue).toLocaleString()}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-green-400 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {stats.dailyChange} Today
                </span>
                <span className="text-green-400 flex items-center">
                  <i className="fas fa-arrow-up mr-1"></i>
                  {stats.weeklyChange} This Week
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="text-sm text-gray-300">Monthly Performance</div>
                <div className="text-2xl font-bold text-green-400">{stats.monthlyChange}</div>
              </div>
            </div>
          </div>
  </div>
  )}

        {/* Dynamic Content Based on View Type */}
        {!loading && !error && viewType === 'overview' && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Trades</p>
                    <p className="text-2xl font-bold">{stats.totalTrades}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-exchange-alt text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Success Rate</p>
                    <p className="text-2xl font-bold text-green-400">{stats.successRate}%</p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-percentage text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Net Profit</p>
                    <p className="text-2xl font-bold text-green-400">${stats.netProfit}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-dollar-sign text-xl"></i>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Trade Time</p>
                    <p className="text-2xl font-bold">{stats.avgTradeTime}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-clock text-xl"></i>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && viewType === 'portfolio' && (
          <>
            {/* Portfolio Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Asset Allocation</h2>
                <div className="space-y-4">
                  {portfolioBreakdown.map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full ${asset.color}`}></div>
                        <div>
                          <div className="font-semibold">{asset.asset}</div>
                          <div className="text-sm text-gray-400">{asset.allocation}% allocation</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${asset.value.toLocaleString()}</div>
                        <div className={`text-sm ${asset.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                          {asset.change}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Portfolio Overview</h2>
                <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center border border-gray-700">
                  <div className="text-center">
                    <i className="fas fa-pie-chart text-5xl text-gray-600 mb-4"></i>
                    <p className="text-gray-400">Portfolio Distribution</p>
                    <p className="text-sm text-gray-500">Interactive pie chart here</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {!loading && !error && viewType === 'performance' && (
          <>
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <i className={`fas ${metric.icon} text-blue-400`}></i>
                      <span className="text-sm text-gray-400">{metric.label}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className={`text-sm ${metric.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {metric.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {!loading && !error && viewType === 'risk' && (
          <>
            {/* Risk Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Risk Metrics</h2>
                <div className="space-y-4">
                  {riskMetrics.map((metric, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <span className="text-gray-300">{metric.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{metric.value}</span>
                        <div className={`w-3 h-3 rounded-full ${
                          metric.status === 'low' ? 'bg-green-400' : 
                          metric.status === 'medium' ? 'bg-yellow-400' : 'bg-red-400'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">Risk Score</h2>
                <div className="text-center">
                  <div className="text-6xl font-bold mb-4">{stats.riskScore}</div>
                  <div className="text-gray-400 mb-4">out of 10</div>
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                    <div 
                      className="bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 h-4 rounded-full"
                      style={{ width: `${(stats.riskScore / 10) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-400">Moderate Risk Level</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Common Sections - Always Visible */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profit/Loss Chart */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">
              {viewType === 'portfolio' ? 'Portfolio Growth' : 'Profit/Loss Trend'}
            </h2>
            <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <i className={`fas ${
                  viewType === 'portfolio' ? 'fa-line-chart' : 
                  viewType === 'performance' ? 'fa-bar-chart' :
                  viewType === 'risk' ? 'fa-shield-alt' : 'fa-area-chart'
                } text-5xl text-gray-600 mb-4`}></i>
                <p className="text-gray-400">
                  {viewType === 'portfolio' ? 'Portfolio Value Over Time' :
                   viewType === 'performance' ? 'Performance Analytics' :
                   viewType === 'risk' ? 'Risk Analysis Chart' : 'Profit/Loss Chart'}
                </p>
                <p className="text-sm text-gray-500">Interactive chart visualization</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {viewType === 'risk' ? 'Risk Level' : 'Total Profit'}
                </p>
                <p className="text-lg font-semibold text-green-400">
                  {viewType === 'risk' ? 'Moderate' : `$${stats.totalProfit}`}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">
                  {viewType === 'risk' ? 'Max Drawdown' : 'Total Loss'}
                </p>
                <p className="text-lg font-semibold text-red-400">
                  {viewType === 'risk' ? stats.maxDrawdown : `$${stats.totalLoss}`}
                </p>
              </div>
            </div>
          </div>

          {/* Dynamic Right Panel */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            {viewType === 'overview' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Performance Breakdown</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Best Trading Day</span>
                    <span className="text-green-400 font-semibold">{stats.bestDay}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Worst Trading Day</span>
                    <span className="text-red-400 font-semibold">{stats.worstDay}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Average Daily Profit</span>
                    <span className="text-green-400 font-semibold">${stats.averageDailyProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Win Streak</span>
                    <span className="text-blue-400 font-semibold">{stats.winStreak} trades</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Loss Streak</span>
                    <span className="text-red-400 font-semibold">{stats.lossStreak} trades</span>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Success Rate</span>
                    <span>{stats.successRate}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${stats.successRate}%` }}
                    ></div>
                  </div>
                </div>
              </>
            )}

            {viewType === 'portfolio' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Portfolio Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total Value</span>
                    <span className="text-green-400 font-semibold">${stats.portfolioValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Daily Change</span>
                    <span className="text-green-400 font-semibold">{stats.dailyChange}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Weekly Change</span>
                    <span className="text-green-400 font-semibold">{stats.weeklyChange}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Monthly Change</span>
                    <span className="text-green-400 font-semibold">{stats.monthlyChange}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Assets</span>
                    <span className="text-blue-400 font-semibold">{portfolioBreakdown.length}</span>
                  </div>
                </div>
              </>
            )}

            {viewType === 'performance' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Key Ratios</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Sharpe Ratio</span>
                    <span className="text-green-400 font-semibold">{stats.sharpeRatio}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">ROI</span>
                    <span className="text-green-400 font-semibold">{stats.monthlyChange}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Drawdown</span>
                    <span className="text-red-400 font-semibold">{stats.maxDrawdown}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Volatility</span>
                    <span className="text-yellow-400 font-semibold">{stats.volatility}</span>
                  </div>
                </div>
              </>
            )}

            {viewType === 'risk' && (
              <>
                <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold mb-2">{stats.riskScore}/10</div>
                  <div className="text-gray-400">Overall Risk Score</div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Risk Level</span>
                    <span className="text-yellow-400 font-semibold">Moderate</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Volatility</span>
                    <span className="text-yellow-400 font-semibold">{stats.volatility}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Max Drawdown</span>
                    <span className="text-red-400 font-semibold">{stats.maxDrawdown}</span>
                  </div>
                </div>
              </>
            )}
          </div>
  </div>
  )}

  {/* Asset Performance & Recent Activity */}
        {!loading && !error && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Asset Performance */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">
              {viewType === 'portfolio' ? 'Top Holdings' : 'Asset Performance'}
            </h2>
            <div className="space-y-3">
              {assetPerformance.map((asset, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{asset.asset}</span>
                    <span className={`font-semibold ${asset.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.profit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{asset.trades} trades</span>
                    <span>{asset.winRate}% win rate</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${asset.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trades/Activity */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${trade.result === 'WIN' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <div className="font-semibold">{trade.asset}</div>
                        <div className="text-sm text-gray-400">{trade.direction} • ${trade.amount}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${trade.result === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit}
                      </div>
                      <div className="text-sm text-gray-400">{trade.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </div>
        )}

        {/* Ensure prior conditional is closed before next section */}
      </div>
    </div>
    </MainAppLayout>
  );
}
