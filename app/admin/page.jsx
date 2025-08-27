"use client";
import React from 'react';
import AdminPageHeader from './components/AdminPageHeader';
import StatCard from './components/StatCard';
import Card from './components/Card';

export default function AdminPage() {
  // Mock stats data for demo
  const stats = {
    totalUsers: 1250,
    activeUsers: 890,
    totalDeposits: 125000,
    totalWithdrawals: 98500,
    openTrades: 234,
    totalVolume: 2500000
  };

  return (
    <div>
      <AdminPageHeader 
        title="Admin Dashboard" 
        subtitle="Welcome to Quatex Admin Panel - Key system metrics and overview." 
      />
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon="👥"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Active Users" 
          value={stats.activeUsers.toLocaleString()} 
          icon="✅"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard 
          title="Total Deposits" 
          value={`$${stats.totalDeposits.toLocaleString()}`} 
          icon="💰"
          trend={{ value: 15.2, isPositive: true }}
        />
        <StatCard 
          title="Total Withdrawals" 
          value={`$${stats.totalWithdrawals.toLocaleString()}`} 
          icon="💸"
          trend={{ value: 5.8, isPositive: false }}
        />
        <StatCard 
          title="Open Trades" 
          value={stats.openTrades.toLocaleString()} 
          icon="📈"
          trend={{ value: 23, isPositive: true }}
        />
        <StatCard 
          title="Total Volume" 
          value={`$${(stats.totalVolume / 1000000).toFixed(1)}M`} 
          icon="💹"
          trend={{ value: 18.7, isPositive: true }}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Quick Actions">
          <div className="p-4 space-y-3">
            <a href="/admin/users" className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors">
              <div className="font-medium text-white">👥 Manage Users</div>
              <div className="text-sm text-gray-400">View and manage user accounts</div>
            </a>
            <a href="/admin/deposits" className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors">
              <div className="font-medium text-white">💰 Review Deposits</div>
              <div className="text-sm text-gray-400">Process pending deposits</div>
            </a>
            <a href="/admin/withdrawals" className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors">
              <div className="font-medium text-white">💸 Handle Withdrawals</div>
              <div className="text-sm text-gray-400">Review withdrawal requests</div>
            </a>
            <a href="/admin/support" className="block p-3 bg-[#1a1f33] hover:bg-[#232945] rounded-lg transition-colors">
              <div className="font-medium text-white">🎧 Support Tickets</div>
              <div className="text-sm text-gray-400">Manage customer support</div>
            </a>
          </div>
        </Card>

        <Card title="System Status">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Server Status</span>
              <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm font-medium">
                ✅ Online
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Database</span>
              <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm font-medium">
                ✅ Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Trading Engine</span>
              <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm font-medium">
                ✅ Running
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300">API Status</span>
              <span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-sm font-medium">
                ✅ Operational
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card title="Recent Activity">
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
              <tr className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                <td className="p-3 text-gray-400">14:32</td>
                <td className="p-3">john@example.com</td>
                <td className="p-3">Deposit</td>
                <td className="p-3 font-medium text-green-400">+$500</td>
                <td className="p-3"><span className="px-2 py-1 bg-green-600/20 text-green-400 rounded text-xs">Completed</span></td>
              </tr>
              <tr className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                <td className="p-3 text-gray-400">14:28</td>
                <td className="p-3">maria@example.com</td>
                <td className="p-3">Trade</td>
                <td className="p-3 font-medium text-blue-400">EUR/USD</td>
                <td className="p-3"><span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">Active</span></td>
              </tr>
              <tr className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                <td className="p-3 text-gray-400">14:25</td>
                <td className="p-3">alex@example.com</td>
                <td className="p-3">Withdrawal</td>
                <td className="p-3 font-medium text-red-400">-$200</td>
                <td className="p-3"><span className="px-2 py-1 bg-yellow-600/20 text-yellow-400 rounded text-xs">Pending</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}