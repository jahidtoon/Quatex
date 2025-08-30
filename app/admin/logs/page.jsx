"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function LogsPage() {
  const [selectedLogType, setSelectedLogType] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('24h');

  // Mock log data
  const logs = [
    {
      id: 1,
      timestamp: '2025-08-29 14:32:15',
      level: 'info',
      type: 'auth',
      message: 'User login successful',
      details: 'User john.doe@example.com logged in from IP 192.168.1.100',
      userId: 'user_123',
      ip: '192.168.1.100'
    },
    {
      id: 2,
      timestamp: '2025-08-29 14:31:45',
      level: 'warning',
      type: 'trade',
      message: 'High frequency trading detected',
      details: 'User maria.garcia@example.com executed 15 trades in 2 minutes',
      userId: 'user_456',
      ip: '10.0.0.50'
    },
    {
      id: 3,
      timestamp: '2025-08-29 14:30:12',
      level: 'error',
      type: 'payment',
      message: 'Payment processing failed',
      details: 'Deposit of $500 failed for user alex.johnson@example.com - Insufficient funds',
      userId: 'user_789',
      ip: '172.16.0.25'
    },
    {
      id: 4,
      timestamp: '2025-08-29 14:28:33',
      level: 'info',
      type: 'system',
      message: 'Database backup completed',
      details: 'Automated database backup completed successfully (Size: 2.3GB)',
      ip: 'system'
    },
    {
      id: 5,
      timestamp: '2025-08-29 14:25:18',
      level: 'critical',
      type: 'security',
      message: 'Potential security breach detected',
      details: 'Multiple failed login attempts from IP 203.0.113.45',
      ip: '203.0.113.45'
    },
    {
      id: 6,
      timestamp: '2025-08-29 14:22:07',
      level: 'info',
      type: 'withdrawal',
      message: 'Withdrawal request processed',
      details: 'Withdrawal of $750 approved for user emma.davis@example.com',
      userId: 'user_321',
      ip: '192.168.1.200'
    }
  ];

  const auditLogs = [
    {
      id: 1,
      timestamp: '2025-08-29 14:30:00',
      admin: 'admin@quatex.com',
      action: 'User Account Modified',
      target: 'john.doe@example.com',
      details: 'Updated user verification status to verified',
      ip: '10.0.0.1'
    },
    {
      id: 2,
      timestamp: '2025-08-29 14:15:00',
      admin: 'admin@quatex.com',
      action: 'Currency Pair Added',
      target: 'GBP/JPY',
      details: 'Added new currency pair with 2.5 pip spread',
      ip: '10.0.0.1'
    },
    {
      id: 3,
      timestamp: '2025-08-29 13:45:00',
      admin: 'admin@quatex.com',
      action: 'Withdrawal Approved',
      target: 'WDR-002',
      details: 'Approved withdrawal request of $1250',
      ip: '10.0.0.1'
    }
  ];

  const stats = {
    totalLogs: 45678,
    errorCount: 234,
    warningCount: 567,
    criticalCount: 12
  };

  const getLevelColor = (level) => {
    switch (level.toLowerCase()) {
      case 'info': return 'bg-blue-600/20 text-blue-400';
      case 'warning': return 'bg-yellow-600/20 text-yellow-400';
      case 'error': return 'bg-red-600/20 text-red-400';
      case 'critical': return 'bg-purple-600/20 text-purple-400';
      case 'debug': return 'bg-gray-600/20 text-gray-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'auth': return '🔐';
      case 'trade': return '📈';
      case 'payment': return '💳';
      case 'withdrawal': return '💸';
      case 'system': return '⚙️';
      case 'security': return '🛡️';
      default: return '📄';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = selectedLogType === 'all' || log.type === selectedLogType;
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesSearch = !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesLevel && matchesSearch;
  });

  const [activeTab, setActiveTab] = useState('system');

  return (
    <div>
      <AdminPageHeader 
        title="System Logs & Audit Trail" 
        subtitle="Monitor system activity and administrative actions" 
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Logs" 
          value={stats.totalLogs.toLocaleString()} 
          icon="📋"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard 
          title="Critical Issues" 
          value={stats.criticalCount.toString()} 
          icon="🚨"
          trend={{ value: -1, isPositive: true }}
        />
        <StatCard 
          title="Errors" 
          value={stats.errorCount.toString()} 
          icon="❌"
          trend={{ value: -3.2, isPositive: true }}
        />
        <StatCard 
          title="Warnings" 
          value={stats.warningCount.toString()} 
          icon="⚠️"
          trend={{ value: 2.1, isPositive: false }}
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'system', label: 'System Logs', icon: '📋' },
          { id: 'audit', label: 'Audit Trail', icon: '🔍' },
          { id: 'export', label: 'Export Logs', icon: '📤' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* System Logs Tab */}
      {activeTab === 'system' && (
        <Card title="System Logs">
          {/* Filters */}
          <div className="p-4 border-b border-[#262b40] space-y-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">Type:</label>
                <select 
                  value={selectedLogType} 
                  onChange={(e) => setSelectedLogType(e.target.value)}
                  className="px-3 py-1 bg-[#1a1f33] border border-[#262b40] rounded text-white text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="auth">Authentication</option>
                  <option value="trade">Trading</option>
                  <option value="payment">Payments</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="system">System</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">Level:</label>
                <select 
                  value={selectedLevel} 
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-3 py-1 bg-[#1a1f33] border border-[#262b40] rounded text-white text-sm"
                >
                  <option value="all">All Levels</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">Time:</label>
                <select 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-1 bg-[#1a1f33] border border-[#262b40] rounded text-white text-sm"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-4">Timestamp</th>
                  <th className="text-left p-4">Level</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Message</th>
                  <th className="text-left p-4">Details</th>
                  <th className="text-left p-4">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-4 text-gray-400 text-xs font-mono">{log.timestamp}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                        {log.level.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span>{getTypeIcon(log.type)}</span>
                        <span className="capitalize">{log.type}</span>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{log.message}</td>
                    <td className="p-4 text-gray-400 max-w-md truncate">{log.details}</td>
                    <td className="p-4 text-gray-400 font-mono text-xs">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <div className="text-4xl mb-2">🔍</div>
              <div className="text-lg mb-2">No logs found</div>
              <div className="text-sm">Try adjusting your filters or search terms</div>
            </div>
          )}
        </Card>
      )}

      {/* Audit Trail Tab */}
      {activeTab === 'audit' && (
        <Card title="Administrator Audit Trail">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-4">Timestamp</th>
                  <th className="text-left p-4">Administrator</th>
                  <th className="text-left p-4">Action</th>
                  <th className="text-left p-4">Target</th>
                  <th className="text-left p-4">Details</th>
                  <th className="text-left p-4">IP Address</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((audit) => (
                  <tr key={audit.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-4 text-gray-400 text-xs font-mono">{audit.timestamp}</td>
                    <td className="p-4 text-blue-400">{audit.admin}</td>
                    <td className="p-4 font-medium">{audit.action}</td>
                    <td className="p-4 text-yellow-400">{audit.target}</td>
                    <td className="p-4 text-gray-400">{audit.details}</td>
                    <td className="p-4 text-gray-400 font-mono text-xs">{audit.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <Card title="Export System Logs">
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Export Options</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Date Range</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date" 
                      className="px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded text-white"
                      defaultValue="2025-08-28"
                    />
                    <input 
                      type="date" 
                      className="px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded text-white"
                      defaultValue="2025-08-29"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Log Types</label>
                  <div className="space-y-2">
                    {['auth', 'trade', 'payment', 'withdrawal', 'system', 'security'].map(type => (
                      <label key={type} className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span className="text-sm text-gray-300 capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                  <select className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded text-white">
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="xlsx">Excel (XLSX)</option>
                    <option value="pdf">PDF Report</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Export Summary</h3>
                
                <div className="bg-[#101527] p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Records:</span>
                    <span className="text-white">~15,420</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">File Size:</span>
                    <span className="text-white">~2.3 MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Estimated Time:</span>
                    <span className="text-white">~30 seconds</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                    📊 Generate Report
                  </button>
                  <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                    📧 Email Report
                  </button>
                  <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                    ⏰ Schedule Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
