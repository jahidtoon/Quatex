"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [reportType, setReportType] = useState('financial');

  // Mock reports data
  const reports = {
    financial: {
      totalRevenue: 125000,
      totalDeposits: 890000,
      totalWithdrawals: 654000,
      netProfit: 235000,
      depositCount: 1450,
      withdrawalCount: 890,
      avgDepositAmount: 614,
      avgWithdrawalAmount: 735
    },
    trading: {
      totalTrades: 45678,
      successfulTrades: 31250,
      failedTrades: 14428,
      totalVolume: 12450000,
      avgTradeSize: 272,
      mostTradedPair: 'EUR/USD',
      topTrader: 'michael.chen@example.com',
      totalProfitLoss: 125000
    },
    users: {
      totalUsers: 15420,
      newUsers: 342,
      activeUsers: 8950,
      verifiedUsers: 12100,
      suspendedUsers: 45,
      deletedUsers: 12,
      avgSessionTime: '25 min',
      topCountry: 'United States'
    }
  };

  const recentReports = [
    {
      id: 'RPT-001',
      name: 'Monthly Financial Report',
      type: 'Financial',
      period: 'August 2025',
      generated: '2025-08-29 09:00:00',
      status: 'Ready',
      size: '2.3 MB'
    },
    {
      id: 'RPT-002',
      name: 'Weekly Trading Summary',
      type: 'Trading',
      period: 'Week 35, 2025',
      generated: '2025-08-26 06:00:00',
      status: 'Ready',
      size: '1.8 MB'
    },
    {
      id: 'RPT-003',
      name: 'User Growth Analysis',
      type: 'Users',
      period: 'Q3 2025',
      generated: '2025-08-25 10:30:00',
      status: 'Processing',
      size: '-'
    },
    {
      id: 'RPT-004',
      name: 'Risk Management Report',
      type: 'Risk',
      period: 'August 2025',
      generated: '2025-08-24 14:15:00',
      status: 'Ready',
      size: '3.1 MB'
    }
  ];

  const currentData = reports[reportType];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ready': return 'bg-green-600/20 text-green-400';
      case 'Processing': return 'bg-blue-600/20 text-blue-400';
      case 'Failed': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Financial': return '💰';
      case 'Trading': return '📈';
      case 'Users': return '👥';
      case 'Risk': return '⚠️';
      default: return '📊';
    }
  };

  return (
    <div>
      <AdminPageHeader 
        title="Reports & Analytics" 
        subtitle="Generate and download comprehensive platform reports" 
        actions={
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
            📊 Generate New Report
          </button>
        }
      />

      {/* Report Type Selector */}
      <div className="mb-6">
        <div className="flex space-x-1">
          {['financial', 'trading', 'users'].map((type) => (
            <button
              key={type}
              onClick={() => setReportType(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                reportType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
              }`}
            >
              {type} Reports
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {reportType === 'financial' && (
          <>
            <StatCard 
              title="Total Revenue" 
              value={`$${currentData.totalRevenue.toLocaleString()}`} 
              icon="💰"
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatCard 
              title="Net Profit" 
              value={`$${currentData.netProfit.toLocaleString()}`} 
              icon="📈"
              trend={{ value: 8.3, isPositive: true }}
            />
            <StatCard 
              title="Total Deposits" 
              value={`$${currentData.totalDeposits.toLocaleString()}`} 
              icon="⬇️"
              trend={{ value: 15.7, isPositive: true }}
            />
            <StatCard 
              title="Total Withdrawals" 
              value={`$${currentData.totalWithdrawals.toLocaleString()}`} 
              icon="⬆️"
              trend={{ value: -3.2, isPositive: false }}
            />
          </>
        )}
        {reportType === 'trading' && (
          <>
            <StatCard 
              title="Total Trades" 
              value={currentData.totalTrades.toLocaleString()} 
              icon="📊"
              trend={{ value: 18.4, isPositive: true }}
            />
            <StatCard 
              title="Success Rate" 
              value={`${((currentData.successfulTrades / currentData.totalTrades) * 100).toFixed(1)}%`} 
              icon="✅"
              trend={{ value: 4.2, isPositive: true }}
            />
            <StatCard 
              title="Total Volume" 
              value={`$${(currentData.totalVolume / 1000000).toFixed(1)}M`} 
              icon="💹"
              trend={{ value: 22.1, isPositive: true }}
            />
            <StatCard 
              title="Avg Trade Size" 
              value={`$${currentData.avgTradeSize}`} 
              icon="⚖️"
              trend={{ value: 6.8, isPositive: true }}
            />
          </>
        )}
        {reportType === 'users' && (
          <>
            <StatCard 
              title="Total Users" 
              value={currentData.totalUsers.toLocaleString()} 
              icon="👥"
              trend={{ value: 12.8, isPositive: true }}
            />
            <StatCard 
              title="New Users" 
              value={currentData.newUsers.toLocaleString()} 
              icon="🆕"
              trend={{ value: 25.6, isPositive: true }}
            />
            <StatCard 
              title="Active Users" 
              value={currentData.activeUsers.toLocaleString()} 
              icon="🟢"
              trend={{ value: 8.9, isPositive: true }}
            />
            <StatCard 
              title="Verified Users" 
              value={`${((currentData.verifiedUsers / currentData.totalUsers) * 100).toFixed(1)}%`} 
              icon="✅"
              trend={{ value: 3.4, isPositive: true }}
            />
          </>
        )}
      </div>

      {/* Reports Table */}
      <Card title="Generated Reports">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#101527] text-gray-300">
              <tr>
                <th className="text-left p-4">Report ID</th>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Type</th>
                <th className="text-left p-4">Period</th>
                <th className="text-left p-4">Generated</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Size</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentReports.map((report) => (
                <tr key={report.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                  <td className="p-4 font-medium text-blue-400">{report.id}</td>
                  <td className="p-4">
                    <div className="font-medium">{report.name}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getTypeIcon(report.type)}</span>
                      <span>{report.type}</span>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{report.period}</td>
                  <td className="p-4 text-gray-400">{report.generated}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-300">{report.size}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      {report.status === 'Ready' && (
                        <>
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            📥 Download
                          </button>
                          <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                            👁️ Preview
                          </button>
                        </>
                      )}
                      {report.status === 'Processing' && (
                        <span className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                          ⏳ Processing...
                        </span>
                      )}
                      <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-[#262b40] bg-[#101527] rounded-b-lg">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
              📊 Generate Monthly Report
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              📈 Trading Analytics
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
              👥 User Statistics
            </button>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
              ⚙️ Custom Report
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
