"use client";
import React, { useState, useEffect } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function LiveMonitoringPage() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  // Mock real-time data
  const [liveData, setLiveData] = useState({
    activeUsers: 1245,
    activeTrades: 567,
    totalVolume: 2450000,
    serverLoad: 42.3,
    responseTime: 145,
    errorRate: 0.02
  });

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, type: 'trade', user: 'john.doe@example.com', action: 'Opened EUR/USD position', amount: 1500, time: '14:32:15' },
    { id: 2, type: 'deposit', user: 'maria.garcia@example.com', action: 'Deposit processed', amount: 2000, time: '14:31:45' },
    { id: 3, type: 'withdrawal', user: 'alex.johnson@example.com', action: 'Withdrawal approved', amount: 750, time: '14:30:12' },
    { id: 4, type: 'login', user: 'emma.davis@example.com', action: 'User logged in', amount: null, time: '14:28:33' },
    { id: 5, type: 'trade', user: 'mike.wilson@example.com', action: 'Closed GBP/USD position', amount: 500, time: '14:25:18' }
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    { id: 1, level: 'warning', message: 'High API rate limit usage detected', time: '14:30:00', resolved: false },
    { id: 2, level: 'info', message: 'Database backup completed successfully', time: '14:15:00', resolved: true },
    { id: 3, level: 'error', message: 'Temporary connection issue with price feed', time: '14:10:00', resolved: true },
    { id: 4, level: 'warning', message: 'Unusual trading pattern detected for user ID 12345', time: '14:05:00', resolved: false }
  ]);

  const [activeTradesByPair, setActiveTradesByPair] = useState([
    { pair: 'EUR/USD', trades: 145, volume: 450000, avgSize: 310 },
    { pair: 'GBP/USD', trades: 89, volume: 298000, avgSize: 335 },
    { pair: 'USD/JPY', trades: 76, volume: 234000, avgSize: 308 },
    { pair: 'AUD/USD', trades: 54, volume: 167000, avgSize: 309 },
    { pair: 'USD/CAD', trades: 43, volume: 132000, avgSize: 307 }
  ]);

  const [topActiveUsers, setTopActiveUsers] = useState([
    { user: 'trader1@example.com', trades: 23, volume: 45000, profit: 2450 },
    { user: 'trader2@example.com', trades: 18, volume: 38000, profit: 1890 },
    { user: 'trader3@example.com', trades: 15, volume: 32000, profit: 1560 },
    { user: 'trader4@example.com', trades: 12, volume: 28000, profit: 1340 },
    { user: 'trader5@example.com', trades: 10, volume: 24000, profit: 1120 }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLiveData(prev => ({
        ...prev,
        activeUsers: prev.activeUsers + Math.floor(Math.random() * 10) - 5,
        activeTrades: prev.activeTrades + Math.floor(Math.random() * 20) - 10,
        totalVolume: prev.totalVolume + Math.floor(Math.random() * 10000) - 5000,
        serverLoad: Math.max(0, Math.min(100, prev.serverLoad + Math.random() * 10 - 5)),
        responseTime: Math.max(50, prev.responseTime + Math.floor(Math.random() * 20) - 10),
        errorRate: Math.max(0, Math.min(1, prev.errorRate + Math.random() * 0.01 - 0.005))
      }));
      setLastUpdate(new Date().toLocaleTimeString());
    }, 3000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'trade': return '📈';
      case 'deposit': return '💰';
      case 'withdrawal': return '💸';
      case 'login': return '🔐';
      default: return '📊';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'trade': return 'text-blue-400';
      case 'deposit': return 'text-green-400';
      case 'withdrawal': return 'text-red-400';
      case 'login': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getAlertLevelColor = (level) => {
    switch (level) {
      case 'error': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'warning': return 'bg-yellow-600/20 text-yellow-400 border-yellow-600/30';
      case 'info': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-600/30';
    }
  };

  return (
    <div>
      <AdminPageHeader 
        title="Live Monitoring" 
        subtitle="Real-time platform monitoring and system status" 
        actions={
          <div className="flex gap-2 items-center">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">Auto Refresh:</span>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded text-xs font-medium ${
                  autoRefresh 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-600 text-gray-300'
                }`}
              >
                {autoRefresh ? '🟢 ON' : '🔴 OFF'}
              </button>
            </div>
            <span className="text-xs text-gray-400">Last update: {lastUpdate}</span>
          </div>
        }
      />

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <StatCard 
          title="Active Users" 
          value={liveData.activeUsers.toString()} 
          icon="👥"
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatCard 
          title="Active Trades" 
          value={liveData.activeTrades.toString()} 
          icon="📈"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard 
          title="Volume (24h)" 
          value={`$${(liveData.totalVolume / 1000000).toFixed(1)}M`} 
          icon="💹"
          trend={{ value: 15.7, isPositive: true }}
        />
        <StatCard 
          title="Server Load" 
          value={`${liveData.serverLoad.toFixed(1)}%`} 
          icon="🖥️"
          trend={{ value: -3.2, isPositive: true }}
        />
        <StatCard 
          title="Response Time" 
          value={`${liveData.responseTime}ms`} 
          icon="⚡"
          trend={{ value: -8.1, isPositive: true }}
        />
        <StatCard 
          title="Error Rate" 
          value={`${(liveData.errorRate * 100).toFixed(2)}%`} 
          icon="🚨"
          trend={{ value: -15.3, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Activities */}
        <Card title="Live Activity Feed">
          <div className="p-4 max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-[#101527] rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getActivityIcon(activity.type)}</span>
                    <div>
                      <div className="text-sm font-medium">{activity.action}</div>
                      <div className="text-xs text-gray-400">{activity.user}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {activity.amount && (
                      <div className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                        {activity.type === 'withdrawal' ? '-' : '+'}${activity.amount.toLocaleString()}
                      </div>
                    )}
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* System Alerts */}
        <Card title="System Alerts">
          <div className="p-4 max-h-80 overflow-y-auto">
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className={`p-3 border rounded-lg ${getAlertLevelColor(alert.level)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{alert.message}</div>
                      <div className="text-xs opacity-75 mt-1">{alert.time}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {alert.resolved ? (
                        <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">
                          ✅ Resolved
                        </span>
                      ) : (
                        <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Trades by Pair */}
        <Card title="Active Trades by Currency Pair">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-3">Pair</th>
                  <th className="text-left p-3">Trades</th>
                  <th className="text-left p-3">Volume</th>
                  <th className="text-left p-3">Avg Size</th>
                </tr>
              </thead>
              <tbody>
                {activeTradesByPair.map((item, index) => (
                  <tr key={index} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-3 font-medium text-blue-400">{item.pair}</td>
                    <td className="p-3">{item.trades}</td>
                    <td className="p-3">${item.volume.toLocaleString()}</td>
                    <td className="p-3">${item.avgSize}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Top Active Users */}
        <Card title="Most Active Traders (Live)">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Trades</th>
                  <th className="text-left p-3">Volume</th>
                  <th className="text-left p-3">P&L</th>
                </tr>
              </thead>
              <tbody>
                {topActiveUsers.map((user, index) => (
                  <tr key={index} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-3">{user.user}</td>
                    <td className="p-3">{user.trades}</td>
                    <td className="p-3">${user.volume.toLocaleString()}</td>
                    <td className={`p-3 font-medium ${user.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {user.profit > 0 ? '+' : ''}${user.profit.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
