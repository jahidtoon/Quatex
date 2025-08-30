"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function LeaderboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  // Mock leaderboard data
  const leaderboardData = {
    weekly: [
      { rank: 1, name: 'Alex Johnson', email: 'alex.j@example.com', trades: 145, winRate: 87.2, profit: 4250, avatar: '🏆' },
      { rank: 2, name: 'Maria Garcia', email: 'maria.g@example.com', trades: 132, winRate: 84.1, profit: 3890, avatar: '🥈' },
      { rank: 3, name: 'John Smith', email: 'john.s@example.com', trades: 118, winRate: 81.5, profit: 3640, avatar: '🥉' },
      { rank: 4, name: 'Sarah Wilson', email: 'sarah.w@example.com', trades: 105, winRate: 79.3, profit: 3120, avatar: '⭐' },
      { rank: 5, name: 'Mike Brown', email: 'mike.b@example.com', trades: 98, winRate: 76.8, profit: 2890, avatar: '🔥' }
    ],
    monthly: [
      { rank: 1, name: 'David Chen', email: 'david.c@example.com', trades: 580, winRate: 88.5, profit: 18500, avatar: '👑' },
      { rank: 2, name: 'Emma Davis', email: 'emma.d@example.com', trades: 542, winRate: 86.2, profit: 16800, avatar: '🏆' },
      { rank: 3, name: 'Robert Kim', email: 'robert.k@example.com', trades: 515, winRate: 84.7, profit: 15200, avatar: '💎' },
      { rank: 4, name: 'Lisa Taylor', email: 'lisa.t@example.com', trades: 492, winRate: 82.3, profit: 14100, avatar: '⚡' },
      { rank: 5, name: 'James Lee', email: 'james.l@example.com', trades: 478, winRate: 80.9, profit: 13600, avatar: '🎯' }
    ],
    yearly: [
      { rank: 1, name: 'Michael Chang', email: 'michael.c@example.com', trades: 6850, winRate: 89.3, profit: 245000, avatar: '👑' },
      { rank: 2, name: 'Sofia Rodriguez', email: 'sofia.r@example.com', trades: 6420, winRate: 87.8, profit: 228000, avatar: '💰' },
      { rank: 3, name: 'Tom Anderson', email: 'tom.a@example.com', trades: 6180, winRate: 86.1, profit: 210000, avatar: '🚀' },
      { rank: 4, name: 'Anna Miller', email: 'anna.m@example.com', trades: 5920, winRate: 84.6, profit: 195000, avatar: '💫' },
      { rank: 5, name: 'Chris Wong', email: 'chris.w@example.com', trades: 5750, winRate: 83.2, profit: 180000, avatar: '🎖️' }
    ]
  };

  const currentData = leaderboardData[selectedPeriod] || [];
  const stats = {
    totalTraders: 1248,
    activeToday: 342,
    topWinRate: 89.3,
    totalProfit: selectedPeriod === 'yearly' ? 1058000 : selectedPeriod === 'monthly' ? 78500 : 18790
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-blue-400';
    }
  };

  const getWinRateColor = (rate) => {
    if (rate >= 85) return 'text-green-400';
    if (rate >= 75) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div>
      <AdminPageHeader 
        title="Trading Leaderboard" 
        subtitle="Top performing traders and ranking statistics" 
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Traders" 
          value={stats.totalTraders.toLocaleString()} 
          icon="👥"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard 
          title="Active Today" 
          value={stats.activeToday.toLocaleString()} 
          icon="🔥"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard 
          title="Top Win Rate" 
          value={`${stats.topWinRate}%`} 
          icon="🎯"
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard 
          title="Total Profits" 
          value={`$${stats.totalProfit.toLocaleString()}`} 
          icon="💰"
          trend={{ value: 15.7, isPositive: true }}
        />
      </div>

      {/* Period Selector */}
      <Card title="Top Traders">
        <div className="p-4 border-b border-[#262b40]">
          <div className="flex space-x-1">
            {['weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#101527] text-gray-300">
              <tr>
                <th className="text-left p-4">Rank</th>
                <th className="text-left p-4">Trader</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Trades</th>
                <th className="text-left p-4">Win Rate</th>
                <th className="text-left p-4">Profit</th>
                <th className="text-left p-4">Badge</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((trader) => (
                <tr key={trader.rank} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                  <td className="p-4">
                    <span className={`font-bold text-xl ${getRankColor(trader.rank)}`}>
                      #{trader.rank}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{trader.name}</td>
                  <td className="p-4 text-gray-400">{trader.email}</td>
                  <td className="p-4">
                    <span className="font-medium text-blue-400">{trader.trades.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className={`font-medium ${getWinRateColor(trader.winRate)}`}>
                      {trader.winRate}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-green-400">
                      ${trader.profit.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4 text-2xl">{trader.avatar}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        View Profile
                      </button>
                      <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                        Reward
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-[#262b40] flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Showing top {currentData.length} traders of {stats.totalTraders}
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-[#1a1f33] text-gray-400 rounded text-sm">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 bg-[#1a1f33] text-gray-400 rounded text-sm">
              2
            </button>
            <button className="px-3 py-1 bg-[#1a1f33] text-gray-400 rounded text-sm">
              Next
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
