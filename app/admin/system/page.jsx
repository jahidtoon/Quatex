"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function SystemPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Mock system data
  const systemStats = {
    serverStatus: 'Online',
    uptime: '99.9%',
    totalUsers: 12485,
    activeUsers: 3421,
    todayTrades: 8947,
    serverLoad: 42.3,
    memoryUsage: 68.7,
    diskUsage: 34.2,
    dbConnections: 45,
    apiCalls: 125689
  };

  const recentLogs = [
    { time: '2025-08-29 16:45:23', level: 'INFO', message: 'User login successful: alex.j@example.com', service: 'AUTH' },
    { time: '2025-08-29 16:44:18', level: 'INFO', message: 'Trade executed: EUR/USD Buy $500', service: 'TRADING' },
    { time: '2025-08-29 16:43:52', level: 'WARN', message: 'High API rate limit usage detected', service: 'API' },
    { time: '2025-08-29 16:42:30', level: 'INFO', message: 'Deposit processed: $1000 via Credit Card', service: 'PAYMENT' },
    { time: '2025-08-29 16:41:15', level: 'ERROR', message: 'Failed to connect to price feed temporarily', service: 'MARKET' },
    { time: '2025-08-29 16:40:03', level: 'INFO', message: 'Database backup completed successfully', service: 'BACKUP' }
  ];

  const services = [
    { name: 'Web Server', status: 'running', uptime: '15d 4h 23m', cpu: 23.5, memory: 45.2 },
    { name: 'Database', status: 'running', uptime: '15d 4h 23m', cpu: 12.8, memory: 78.9 },
    { name: 'Redis Cache', status: 'running', uptime: '15d 4h 23m', cpu: 5.2, memory: 34.1 },
    { name: 'Trading Engine', status: 'running', uptime: '15d 4h 23m', cpu: 45.7, memory: 62.3 },
    { name: 'Price Feed', status: 'running', uptime: '15d 4h 22m', cpu: 18.9, memory: 28.6 },
    { name: 'Email Service', status: 'running', uptime: '15d 4h 23m', cpu: 2.1, memory: 15.7 }
  ];

  const getLogLevelColor = (level) => {
    switch (level) {
      case 'ERROR': return 'text-red-400 bg-red-900/30';
      case 'WARN': return 'text-yellow-400 bg-yellow-900/30';
      case 'INFO': return 'text-blue-400 bg-blue-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-900/30';
      case 'stopped': return 'text-red-400 bg-red-900/30';
      case 'warning': return 'text-yellow-400 bg-yellow-900/30';
      default: return 'text-gray-400 bg-gray-900/30';
    }
  };

  const getUsageColor = (usage) => {
    if (usage > 80) return 'text-red-400';
    if (usage > 60) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div>
      <AdminPageHeader 
        title="System Management" 
        subtitle="Monitor system health, services, and performance" 
      />

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Server Status" 
          value={systemStats.serverStatus} 
          icon="🟢"
          trend={{ value: systemStats.uptime, isPositive: true, label: 'Uptime' }}
        />
        <StatCard 
          title="Active Users" 
          value={systemStats.activeUsers.toLocaleString()} 
          icon="👥"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard 
          title="Today's Trades" 
          value={systemStats.todayTrades.toLocaleString()} 
          icon="📈"
          trend={{ value: 8.7, isPositive: true }}
        />
        <StatCard 
          title="API Calls" 
          value={systemStats.apiCalls.toLocaleString()} 
          icon="🔄"
          trend={{ value: 15.2, isPositive: true }}
        />
      </div>

      {/* System Tabs */}
      <Card title="System Monitor">
        <div className="p-4 border-b border-[#262b40]">
          <div className="flex space-x-1">
            {['overview', 'services', 'logs', 'performance'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="bg-[#1a1f33] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Server Load</div>
                <div className="text-2xl font-bold text-white mb-2">{systemStats.serverLoad}%</div>
                <div className="w-full bg-[#262b40] rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${systemStats.serverLoad}%` }}
                  />
                </div>
              </div>
              <div className="bg-[#1a1f33] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Memory Usage</div>
                <div className="text-2xl font-bold text-white mb-2">{systemStats.memoryUsage}%</div>
                <div className="w-full bg-[#262b40] rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${systemStats.memoryUsage}%` }}
                  />
                </div>
              </div>
              <div className="bg-[#1a1f33] rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Disk Usage</div>
                <div className="text-2xl font-bold text-white mb-2">{systemStats.diskUsage}%</div>
                <div className="w-full bg-[#262b40] rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${systemStats.diskUsage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {selectedTab === 'services' && (
          <div className="p-4">
            <div className="space-y-3">
              {services.map((service, index) => (
                <div key={index} className="bg-[#1a1f33] rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      <span className="font-medium">{service.name}</span>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(service.status)}`}>
                      {service.status}
                    </span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <div>
                      <span className="text-gray-400">Uptime: </span>
                      <span className="text-green-400">{service.uptime}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">CPU: </span>
                      <span className={getUsageColor(service.cpu)}>{service.cpu}%</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Memory: </span>
                      <span className={getUsageColor(service.memory)}>{service.memory}%</span>
                    </div>
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                      Restart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logs Tab */}
        {selectedTab === 'logs' && (
          <div className="p-4">
            <div className="space-y-2">
              {recentLogs.map((log, index) => (
                <div key={index} className="bg-[#1a1f33] rounded-lg p-3 font-mono text-sm">
                  <div className="flex items-center space-x-3">
                    <span className="text-gray-400">{log.time}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getLogLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                    <span className="text-blue-400">[{log.service}]</span>
                    <span className="text-white">{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                View Full Logs
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Clear Logs
              </button>
            </div>
          </div>
        )}

        {/* Performance Tab */}
        {selectedTab === 'performance' && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#1a1f33] rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Database Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Active Connections</span>
                    <span className="text-blue-400">{systemStats.dbConnections}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Query Response Time</span>
                    <span className="text-green-400">24ms avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transactions/sec</span>
                    <span className="text-yellow-400">156</span>
                  </div>
                </div>
              </div>
              <div className="bg-[#1a1f33] rounded-lg p-4">
                <h3 className="text-lg font-semibold mb-4">Network Performance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Bandwidth Usage</span>
                    <span className="text-blue-400">45.2 MB/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Request Latency</span>
                    <span className="text-green-400">12ms avg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Error Rate</span>
                    <span className="text-red-400">0.02%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
