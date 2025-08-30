"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function AnalyticsPage() {
  const [timeFrame, setTimeFrame] = useState('7d');
  const [reportType, setReportType] = useState('overview');

  // Mock analytics data
  const analytics = {
    users: {
      total: 15420,
      new: 342,
      active: 8950,
      verified: 12100
    },
    trading: {
      totalVolume: 2450000,
      totalTrades: 98765,
      avgTradeSize: 245,
      successRate: 67.8
    },
    financial: {
      revenue: 125000,
      deposits: 890000,
      withdrawals: 654000,
      profit: 65000
    },
    performance: {
      serverUptime: 99.8,
      avgResponseTime: 145,
      errorRate: 0.02,
      activeSessions: 1250
    }
  };

  const topTraders = [
    { rank: 1, name: 'Michael Chen', profit: 15420, trades: 156, winRate: 89.2 },
    { rank: 2, name: 'Sarah Williams', profit: 12890, trades: 143, winRate: 84.6 },
    { rank: 3, name: 'David Rodriguez', profit: 11230, trades: 189, winRate: 76.8 },
    { rank: 4, name: 'Emma Thompson', profit: 9870, trades: 134, winRate: 82.1 },
    { rank: 5, name: 'Alex Johnson', profit: 8945, trades: 167, winRate: 73.5 }
  ];

  const popularPairs = [
    { symbol: 'EUR/USD', volume: 345000, trades: 12450, change: 12.5 },
    { symbol: 'GBP/USD', volume: 289000, trades: 9870, change: 8.3 },
    { symbol: 'USD/JPY', volume: 234000, trades: 8920, change: -2.1 },
    { symbol: 'AUD/USD', volume: 198000, trades: 7650, change: 15.7 },
    { symbol: 'USD/CHF', volume: 167000, trades: 6540, change: 4.2 }
  ];

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
    // Mock export functionality
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

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Users" 
          value={analytics.users.total.toLocaleString()} 
          icon="👥"
          trend={{ value: 8.5, isPositive: true }}
        />
        <StatCard 
          title="Trading Volume" 
          value={`$${(analytics.trading.totalVolume / 1000000).toFixed(1)}M`} 
          icon="📈"
          trend={{ value: 15.2, isPositive: true }}
        />
        <StatCard 
          title="Revenue" 
          value={`$${analytics.financial.revenue.toLocaleString()}`} 
          icon="💰"
          trend={{ value: 22.3, isPositive: true }}
        />
        <StatCard 
          title="Server Uptime" 
          value={`${analytics.performance.serverUptime}%`} 
          icon="🖥️"
          trend={{ value: 0.1, isPositive: true }}
        />
      </div>

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
