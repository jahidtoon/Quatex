"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function TournamentsPage() {
  const [selectedTab, setSelectedTab] = useState('active');

  // Mock tournament data
  const tournaments = {
    active: [
      {
        id: 1,
        name: 'Weekly Forex Challenge',
        type: 'Weekly',
        participants: 245,
        prize: 5000,
        startDate: '2025-08-26',
        endDate: '2025-09-02',
        status: 'Active',
        description: 'Trade forex pairs and compete for the weekly prize pool',
        rules: 'Minimum 10 trades, maximum risk 5% per trade'
      },
      {
        id: 2,
        name: 'Crypto Masters Cup',
        type: 'Monthly',
        participants: 892,
        prize: 15000,
        startDate: '2025-08-01',
        endDate: '2025-08-31',
        status: 'Active',
        description: 'Cryptocurrency trading tournament with huge rewards',
        rules: 'Crypto pairs only, minimum $100 entry'
      }
    ],
    upcoming: [
      {
        id: 3,
        name: 'September Super Challenge',
        type: 'Monthly',
        participants: 0,
        prize: 25000,
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        status: 'Upcoming',
        description: 'The biggest tournament of the season',
        rules: 'All pairs allowed, professional traders only'
      },
      {
        id: 4,
        name: 'Newbie Friendly Contest',
        type: 'Weekly',
        participants: 0,
        prize: 2000,
        startDate: '2025-09-03',
        endDate: '2025-09-10',
        status: 'Upcoming',
        description: 'Perfect for beginners to test their skills',
        rules: 'Account age less than 3 months, maximum 20 trades'
      }
    ],
    completed: [
      {
        id: 5,
        name: 'August Forex Masters',
        type: 'Monthly',
        participants: 1205,
        prize: 20000,
        startDate: '2025-07-15',
        endDate: '2025-08-15',
        status: 'Completed',
        description: 'Completed monthly championship',
        rules: 'Professional level tournament',
        winner: 'David Chen',
        winnerProfit: 18500
      }
    ]
  };

  const stats = {
    activeTournaments: 2,
    totalParticipants: 1137,
    totalPrizePool: 67000,
    completedThisMonth: 3
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-600/20 text-green-400';
      case 'Upcoming': return 'bg-blue-600/20 text-blue-400';
      case 'Completed': return 'bg-gray-600/20 text-gray-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Weekly': return '📅';
      case 'Monthly': return '🗓️';
      case 'Special': return '⭐';
      default: return '🏆';
    }
  };

  return (
    <div>
      <AdminPageHeader 
        title="Trading Tournaments" 
        subtitle="Manage trading competitions and challenges" 
        actions={
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Create Tournament
          </button>
        }
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Active Tournaments" 
          value={stats.activeTournaments.toString()} 
          icon="🏆"
          trend={{ value: 25, isPositive: true }}
        />
        <StatCard 
          title="Total Participants" 
          value={stats.totalParticipants.toLocaleString()} 
          icon="👥"
          trend={{ value: 18.5, isPositive: true }}
        />
        <StatCard 
          title="Prize Pool" 
          value={`$${stats.totalPrizePool.toLocaleString()}`} 
          icon="💰"
          trend={{ value: 12.3, isPositive: true }}
        />
        <StatCard 
          title="Completed This Month" 
          value={stats.completedThisMonth.toString()} 
          icon="✅"
          trend={{ value: 50, isPositive: true }}
        />
      </div>

      {/* Tournament Tabs */}
      <Card title="Tournament Management">
        <div className="p-4 border-b border-[#262b40]">
          <div className="flex space-x-1">
            {['active', 'upcoming', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
                }`}
              >
                {tab} ({tournaments[tab].length})
              </button>
            ))}
          </div>
        </div>

        {/* Tournament List */}
        <div className="p-4 space-y-4">
          {tournaments[selectedTab].map((tournament) => (
            <div key={tournament.id} className="bg-[#1a1f33] rounded-lg p-4 border border-[#262b40]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getTypeIcon(tournament.type)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{tournament.name}</h3>
                    <p className="text-sm text-gray-400">{tournament.description}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                  {tournament.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Type</div>
                  <div className="font-medium">{tournament.type}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Participants</div>
                  <div className="font-medium text-blue-400">{tournament.participants.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Prize Pool</div>
                  <div className="font-medium text-green-400">${tournament.prize.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">Duration</div>
                  <div className="font-medium">{tournament.startDate} to {tournament.endDate}</div>
                </div>
              </div>

              {tournament.winner && (
                <div className="mb-4 p-3 bg-yellow-600/10 border border-yellow-600/30 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400">🏆</span>
                    <span className="text-sm">
                      <strong>Winner:</strong> {tournament.winner} with ${tournament.winnerProfit.toLocaleString()} profit
                    </span>
                  </div>
                </div>
              )}

              <div className="mb-4">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Rules</div>
                <div className="text-sm text-gray-300">{tournament.rules}</div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                    View Details
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                    Participants
                  </button>
                  {tournament.status === 'Active' && (
                    <button className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700">
                      Live Rankings
                    </button>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-[#262b40] text-gray-300 rounded text-sm hover:bg-[#2a3142]">
                    Edit
                  </button>
                  {tournament.status === 'Upcoming' && (
                    <button className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {tournaments[selectedTab].length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-lg mb-2">No {selectedTab} tournaments</div>
            <div className="text-sm">Create a new tournament to get started</div>
          </div>
        )}
      </Card>
    </div>
  );
}
