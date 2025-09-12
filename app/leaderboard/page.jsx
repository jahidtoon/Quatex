"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  // Mock leaderboard data
  useEffect(() => {
    setTimeout(() => {
      setLeaderboardData([
        {
          rank: 1,
          name: 'CryptoKing',
          avatar: '👑',
          profit: 15420.50,
          trades: 142,
          winRate: 78.5,
          country: 'US',
          badge: 'gold'
        },
        {
          rank: 2,
          name: 'ForexMaster',
          avatar: '🥇',
          profit: 12850.75,
          trades: 98,
          winRate: 72.4,
          country: 'UK',
          badge: 'silver'
        },
        {
          rank: 3,
          name: 'TradingPro',
          avatar: '🥈',
          profit: 11245.30,
          trades: 156,
          winRate: 69.8,
          country: 'DE',
          badge: 'bronze'
        },
        {
          rank: 4,
          name: 'MarketWolf',
          avatar: '🐺',
          profit: 9850.25,
          trades: 89,
          winRate: 75.3,
          country: 'CA',
          badge: null
        },
        {
          rank: 5,
          name: 'BullTrader',
          avatar: '🐂',
          profit: 8965.80,
          trades: 134,
          winRate: 67.2,
          country: 'AU',
          badge: null
        },
        {
          rank: 6,
          name: 'SignalHunter',
          avatar: '🎯',
          profit: 7420.45,
          trades: 76,
          winRate: 71.1,
          country: 'JP',
          badge: null
        },
        {
          rank: 7,
          name: 'QuickTrader',
          avatar: '⚡',
          profit: 6850.90,
          trades: 203,
          winRate: 64.5,
          country: 'FR',
          badge: null
        },
        {
          rank: 8,
          name: 'ChartReader',
          avatar: '📊',
          profit: 6245.15,
          trades: 92,
          winRate: 69.6,
          country: 'IT',
          badge: null
        }
      ]);
      setUserRank({
        rank: 23,
        name: 'You',
        profit: 2450.75,
        trades: 45,
        winRate: 66.7
      });
      setLoading(false);
    }, 1000);
  }, []);

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'gold': return '🏆';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '';
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'text-yellow-400';
      case 2: return 'text-gray-300';
      case 3: return 'text-orange-400';
      default: return 'text-white';
    }
  };

  const periods = ['daily', 'weekly', 'monthly', 'all-time'];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Trading
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-trophy text-yellow-400 mr-3"></i>
              Leaderboard
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Your Rank</div>
              <div className="text-xl font-bold text-blue-400">#{userRank?.rank || '---'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Period Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setActiveTab(period)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === period
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {period.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold flex items-center">
                  <i className="fas fa-ranking-star mr-2 text-yellow-400"></i>
                  Top Traders - {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h2>
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 px-6">Rank</th>
                        <th className="text-left py-3 px-6">Trader</th>
                        <th className="text-left py-3 px-6">Profit</th>
                        <th className="text-left py-3 px-6">Trades</th>
                        <th className="text-left py-3 px-6">Win Rate</th>
                        <th className="text-left py-3 px-6">Country</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboardData.map((trader) => (
                        <tr key={trader.rank} className="border-b border-gray-700 hover:bg-gray-750">
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <span className={`text-lg font-bold ${getRankColor(trader.rank)}`}>
                                #{trader.rank}
                              </span>
                              {getBadgeIcon(trader.badge) && (
                                <span className="text-lg">{getBadgeIcon(trader.badge)}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">{trader.avatar}</span>
                              <span className="font-semibold">{trader.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-green-400 font-bold">
                              +${trader.profit.toLocaleString()}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-gray-300">{trader.trades}</td>
                          <td className="py-4 px-6">
                            <span className="text-blue-400 font-semibold">
                              {trader.winRate}%
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-gray-400">{trader.country}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Your Performance */}
            {userRank && (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <i className="fas fa-user-circle mr-2 text-blue-400"></i>
                  Your Performance
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Rank:</span>
                    <span className="font-bold text-blue-400">#{userRank.rank}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Profit:</span>
                    <span className="font-bold text-green-400">+${userRank.profit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Trades:</span>
                    <span className="font-bold">{userRank.trades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate:</span>
                    <span className="font-bold text-blue-400">{userRank.winRate}%</span>
                  </div>
                </div>
                <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  View Full Stats
                </button>
              </div>
            )}

            {/* Achievements */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <i className="fas fa-medal mr-2 text-yellow-400"></i>
                Achievements
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                  <span className="text-2xl">🏆</span>
                  <div>
                    <div className="font-semibold">First Win</div>
                    <div className="text-xs text-gray-400">Complete your first profitable trade</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                  <span className="text-2xl">💯</span>
                  <div>
                    <div className="font-semibold">Century Club</div>
                    <div className="text-xs text-gray-400">Complete 100 trades</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-gray-700 rounded opacity-50">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-semibold">Sharpshooter</div>
                    <div className="text-xs text-gray-400">Achieve 80% win rate</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Competition */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2 text-white">
                <i className="fas fa-crown mr-2"></i>
                Weekly Competition
              </h3>
              <p className="text-purple-100 text-sm mb-4">
                Compete for the top spot and win amazing prizes!
              </p>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$5,000</div>
                <div className="text-purple-200 text-sm">Prize Pool</div>
              </div>
              <button className="w-full mt-4 bg-white text-purple-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors">
                Join Competition
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
