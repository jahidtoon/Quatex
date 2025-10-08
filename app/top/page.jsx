"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TopPage() {
  const [selectedCategory, setSelectedCategory] = useState('traders');
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [showAchievements, setShowAchievements] = useState(false);
  const [followedTraders, setFollowedTraders] = useState(new Set());

  const categories = [
    { id: 'traders', label: 'Top Traders', icon: 'fa-user-star' },
    { id: 'assets', label: 'Top Assets', icon: 'fa-coins' },
    { id: 'achievements', label: 'Achievements', icon: 'fa-trophy' },
    { id: 'community', label: 'Community', icon: 'fa-users' }
  ];

  const periods = [
    { value: 'daily', label: 'Today' },
    { value: 'weekly', label: 'This Week' },
    { value: 'monthly', label: 'This Month' },
    { value: 'yearly', label: 'This Year' },
    { value: 'alltime', label: 'All Time' }
  ];

  const topTraders = [
    { 
      rank: 1, name: 'CryptoKing', avatar: '👑', profit: '+$15,240', winRate: 89.5, trades: 1250, country: 'USA',
      followers: 12500, following: 45, level: 'Legendary', achievements: ['First Million', 'Master Trader', 'Risk Manager'],
      joinDate: '2023-01-15', totalProfit: 245000, streak: 25, status: 'online', verified: true
    },
    { 
      rank: 2, name: 'TradeMaster', avatar: '🎯', profit: '+$12,860', winRate: 85.2, trades: 980, country: 'UK',
      followers: 9800, following: 32, level: 'Master', achievements: ['Consistent Performer', 'Risk Manager'],
      joinDate: '2023-02-20', totalProfit: 186000, streak: 18, status: 'online', verified: true
    },
    { 
      rank: 3, name: 'QuantumTrader', avatar: '⚡', profit: '+$11,750', winRate: 82.8, trades: 1120, country: 'Canada',
      followers: 7650, following: 28, level: 'Expert', achievements: ['Tech Analyst', 'Volume King'],
      joinDate: '2023-03-10', totalProfit: 156000, streak: 12, status: 'online', verified: true
    },
    { 
      rank: 4, name: 'MarketGuru', avatar: '🧠', profit: '+$10,490', winRate: 81.3, trades: 890, country: 'Germany',
      followers: 6200, following: 22, level: 'Expert', achievements: ['Strategy Master', 'Forex Pro'],
      joinDate: '2023-01-28', totalProfit: 142000, streak: 8, status: 'offline', verified: true
    },
    { 
      rank: 5, name: 'ProfitHunter', avatar: '🎪', profit: '+$9,850', winRate: 79.6, trades: 750, country: 'Australia',
      followers: 5100, following: 19, level: 'Advanced', achievements: ['Crypto Specialist', 'Day Trader'],
      joinDate: '2023-04-05', totalProfit: 128000, streak: 15, status: 'online', verified: false
    },
    { 
      rank: 6, name: 'BullishBear', avatar: '🐻', profit: '+$9,320', winRate: 78.4, trades: 680, country: 'Japan',
      followers: 4800, following: 35, level: 'Advanced', achievements: ['Contrarian', 'Patient Trader'],
      joinDate: '2023-02-14', totalProfit: 115000, streak: 6, status: 'online', verified: false
    },
    { 
      rank: 7, name: 'WaveRider', avatar: '🌊', profit: '+$8,970', winRate: 77.8, trades: 620, country: 'France',
      followers: 3900, following: 41, level: 'Advanced', achievements: ['Swing Trader', 'Technical Analyst'],
      joinDate: '2023-03-22', totalProfit: 108000, streak: 11, status: 'online', verified: false
    },
    { 
      rank: 8, name: 'TrendFollower', avatar: '📈', profit: '+$8,540', winRate: 76.5, trades: 590, country: 'Netherlands',
      followers: 3400, following: 26, level: 'Intermediate', achievements: ['Trend Spotter', 'Quick Learner'],
      joinDate: '2023-05-18', totalProfit: 95000, streak: 4, status: 'offline', verified: false
    }
  ];

  const achievements = [
    { 
      id: 'first_profit', name: 'First Profit', description: 'Make your first profitable trade', 
      icon: '💰', rarity: 'common', requirement: '1 profitable trade', reward: '50 XP'
    },
    { 
      id: 'hundred_trades', name: 'Century Trader', description: 'Complete 100 trades', 
      icon: '💯', rarity: 'uncommon', requirement: '100 trades', reward: '200 XP'
    },
    { 
      id: 'win_streak_10', name: 'Hot Streak', description: '10 winning trades in a row', 
      icon: '🔥', rarity: 'rare', requirement: '10 consecutive wins', reward: '500 XP'
    },
    { 
      id: 'master_trader', name: 'Master Trader', description: 'Achieve 80%+ win rate with 500+ trades', 
      icon: '🎯', rarity: 'epic', requirement: '80% win rate, 500+ trades', reward: '1000 XP'
    },
    { 
      id: 'million_profit', name: 'Millionaire', description: 'Earn $1,000,000 in total profits', 
      icon: '💎', rarity: 'legendary', requirement: '$1M total profit', reward: '5000 XP'
    },
    { 
      id: 'risk_manager', name: 'Risk Manager', description: 'Never lose more than 5% in a single trade for 30 days', 
      icon: '🛡️', rarity: 'epic', requirement: 'Max 5% loss for 30 days', reward: '800 XP'
    },
    { 
      id: 'social_butterfly', name: 'Social Butterfly', description: 'Get 1000+ followers', 
      icon: '🦋', rarity: 'rare', requirement: '1000+ followers', reward: '300 XP'
    },
    { 
      id: 'market_prophet', name: 'Market Prophet', description: 'Predict market direction correctly 20 times', 
      icon: '🔮', rarity: 'legendary', requirement: '20 correct predictions', reward: '2000 XP'
    }
  ];

  const communityStats = {
    totalTraders: 45680,
    activeToday: 12450,
    onlineNow: 3240,
    totalTrades: 2890000,
    totalVolume: '$845M',
    topCountries: [
      { country: 'USA', traders: 8950, flag: '🇺🇸' },
      { country: 'UK', traders: 6420, flag: '🇬🇧' },
      { country: 'Germany', traders: 5680, flag: '🇩🇪' },
      { country: 'Canada', traders: 4320, flag: '🇨🇦' },
      { country: 'Australia', traders: 3890, flag: '🇦🇺' }
    ]
  };

  const topAssets = [
    { rank: 1, symbol: 'BTCUSDT', name: 'Bitcoin', volume: '$2.4B', change: '+5.67%', price: '$65,450' },
    { rank: 2, symbol: 'ETHUSD', name: 'Ethereum', volume: '$1.8B', change: '+3.24%', price: '$3,245' },
    { rank: 3, symbol: 'XRPUSDT', name: 'Ripple', volume: '$890M', change: '+8.91%', price: '$0.543' },
    { rank: 4, symbol: 'ADAUSDT', name: 'Cardano', volume: '$650M', change: '+4.15%', price: '$0.452' },
    { rank: 5, symbol: 'DOGEUSDT', name: 'Dogecoin', volume: '$520M', change: '+12.34%', price: '$0.082' }
  ];

  const getRankBadge = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-blue-400';
  };

  const getRarityColor = (rarity) => {
    switch(rarity) {
      case 'common': return 'border-gray-500 text-gray-400';
      case 'uncommon': return 'border-green-500 text-green-400';
      case 'rare': return 'border-blue-500 text-blue-400';
      case 'epic': return 'border-purple-500 text-purple-400';
      case 'legendary': return 'border-yellow-500 text-yellow-400';
      default: return 'border-gray-500 text-gray-400';
    }
  };

  const getLevelBadge = (level) => {
    const levels = {
      'Beginner': { color: 'bg-gray-600', icon: '🌱' },
      'Intermediate': { color: 'bg-blue-600', icon: '📈' },
      'Advanced': { color: 'bg-purple-600', icon: '⚡' },
      'Expert': { color: 'bg-orange-600', icon: '🧠' },
      'Master': { color: 'bg-red-600', icon: '🎯' },
      'Legendary': { color: 'bg-yellow-600', icon: '👑' }
    };
    return levels[level] || levels['Beginner'];
  };

  const toggleFollow = (traderName) => {
    setFollowedTraders(prev => {
      const newFollowed = new Set(prev);
      if (newFollowed.has(traderName)) {
        newFollowed.delete(traderName);
      } else {
        newFollowed.add(traderName);
      }
      return newFollowed;
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-crown text-yellow-400 mr-3"></i>
              TOP Performers
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* Period Selector */}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <div className="text-sm text-gray-400 flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
              Live Updates
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              <i className="fas fa-refresh mr-2"></i>Refresh
            </button>
          </div>
        </div>

        {/* Community Stats Bar */}
        <div className="mt-4 grid grid-cols-5 gap-4">
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-blue-400">{communityStats.totalTraders.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Traders</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-green-400">{communityStats.onlineNow.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Online Now</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-purple-400">{communityStats.totalTrades.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Trades</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-yellow-400">{communityStats.totalVolume}</div>
            <div className="text-xs text-gray-400">Total Volume</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-3 text-center">
            <div className="text-lg font-bold text-red-400">{communityStats.activeToday.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Active Today</div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Category Tabs */}
        <div className="flex space-x-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className={`fas ${category.icon}`}></i>
              <span>{category.label}</span>
            </button>
          ))}
        </div>

        {/* Top Traders */}
        {selectedCategory === 'traders' && (
          <div className="space-y-6">
            {/* Podium - Top 3 */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 text-center">🏆 Hall of Fame 🏆</h2>
              <div className="flex justify-center items-end space-x-8">
                {/* 2nd Place */}
                <div className="text-center">
                  <div className="relative w-24 h-32 bg-gray-700 rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-gray-500">
                    <div className="text-4xl mb-2">{topTraders[1].avatar}</div>
                    <div className="text-2xl">🥈</div>
                    {topTraders[1].status === 'online' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                    )}
                    {topTraders[1].verified && (
                      <div className="absolute -bottom-1 -right-1 text-blue-400">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-300 flex items-center justify-center">
                    {topTraders[1].name}
                    <span className={`ml-1 px-1 text-xs rounded ${getLevelBadge(topTraders[1].level).color}`}>
                      {getLevelBadge(topTraders[1].level).icon}
                    </span>
                  </h3>
                  <p className="text-green-400 font-semibold">{topTraders[1].profit}</p>
                  <p className="text-sm text-gray-400">{topTraders[1].winRate}% win rate</p>
                  <div className="text-xs text-blue-400 mt-1">{topTraders[1].followers.toLocaleString()} followers</div>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="relative w-28 h-36 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-yellow-400">
                    <div className="text-5xl mb-2">{topTraders[0].avatar}</div>
                    <div className="text-3xl">🥇</div>
                    {topTraders[0].status === 'online' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                    )}
                    {topTraders[0].verified && (
                      <div className="absolute -bottom-1 -right-1 text-blue-400">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-yellow-400 text-lg flex items-center justify-center">
                    {topTraders[0].name}
                    <span className={`ml-1 px-1 text-xs rounded ${getLevelBadge(topTraders[0].level).color}`}>
                      {getLevelBadge(topTraders[0].level).icon}
                    </span>
                  </h3>
                  <p className="text-green-400 font-semibold text-lg">{topTraders[0].profit}</p>
                  <p className="text-sm text-gray-400">{topTraders[0].winRate}% win rate</p>
                  <div className="text-xs text-blue-400 mt-1">{topTraders[0].followers.toLocaleString()} followers</div>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="relative w-24 h-32 bg-gray-700 rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-orange-400">
                    <div className="text-4xl mb-2">{topTraders[2].avatar}</div>
                    <div className="text-2xl">🥉</div>
                    {topTraders[2].status === 'online' && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-800"></div>
                    )}
                    {topTraders[2].verified && (
                      <div className="absolute -bottom-1 -right-1 text-blue-400">
                        <i className="fas fa-check-circle"></i>
                      </div>
                    )}
                  </div>
                  <h3 className="font-bold text-orange-400 flex items-center justify-center">
                    {topTraders[2].name}
                    <span className={`ml-1 px-1 text-xs rounded ${getLevelBadge(topTraders[2].level).color}`}>
                      {getLevelBadge(topTraders[2].level).icon}
                    </span>
                  </h3>
                  <p className="text-green-400 font-semibold">{topTraders[2].profit}</p>
                  <p className="text-sm text-gray-400">{topTraders[2].winRate}% win rate</p>
                  <div className="text-xs text-blue-400 mt-1">{topTraders[2].followers.toLocaleString()} followers</div>
                </div>
              </div>
            </div>

            {/* Full Leaderboard */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Complete Leaderboard</h2>
                  <div className="flex space-x-2">
                    <button className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm">
                      <i className="fas fa-filter mr-1"></i>Filter
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-sm">
                      <i className="fas fa-sort mr-1"></i>Sort
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topTraders.map((trader, index) => (
                    <div key={index} className={`relative flex items-center justify-between p-4 rounded-lg transition-all hover:scale-[1.02] ${
                      trader.rank <= 3 ? 'bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500' : 'bg-gray-700 hover:bg-gray-600'
                    }`}>
                      {/* Status indicator */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-lg ${
                        trader.status === 'online' ? 'bg-green-400' : 'bg-gray-600'
                      }`}></div>
                      
                      <div className="flex items-center space-x-4">
                        <div className={`text-2xl font-bold ${getRankColor(trader.rank)} min-w-[50px]`}>
                          {getRankBadge(trader.rank)}
                        </div>
                        <div className="relative">
                          <div className="text-3xl">{trader.avatar}</div>
                          {trader.status === 'online' && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-gray-800"></div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{trader.name}</h3>
                            {trader.verified && (
                              <i className="fas fa-check-circle text-blue-400 text-sm"></i>
                            )}
                            <span className={`px-2 py-1 text-xs rounded-full ${getLevelBadge(trader.level).color} text-white`}>
                              {getLevelBadge(trader.level).icon} {trader.level}
                            </span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span><i className="fas fa-flag mr-1"></i>{trader.country}</span>
                            <span><i className="fas fa-exchange-alt mr-1"></i>{trader.trades} trades</span>
                            <span><i className="fas fa-fire mr-1"></i>{trader.streak} streak</span>
                            <span><i className="fas fa-users mr-1"></i>{trader.followers.toLocaleString()} followers</span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {trader.achievements.slice(0, 3).map((achievement, i) => (
                              <span key={i} className="text-xs bg-purple-600 text-purple-100 px-2 py-1 rounded">
                                {achievement}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-400">{trader.profit}</div>
                          <div className="text-sm text-gray-400">
                            <span className="text-blue-400">{trader.winRate}%</span> win rate
                          </div>
                          <div className="text-xs text-gray-500">
                            Total: ${trader.totalProfit.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => toggleFollow(trader.name)}
                            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                              followedTraders.has(trader.name)
                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            <i className={`fas ${followedTraders.has(trader.name) ? 'fa-check' : 'fa-plus'} mr-1`}></i>
                            {followedTraders.has(trader.name) ? 'Following' : 'Follow'}
                          </button>
                          <button className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs">
                            <i className="fas fa-user mr-1"></i>Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top Assets */}
        {selectedCategory === 'assets' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Most Traded Assets</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {topAssets.map((asset, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`text-xl font-bold ${getRankColor(asset.rank)} min-w-[50px]`}>
                        {getRankBadge(asset.rank)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{asset.symbol}</h3>
                        <p className="text-gray-400">{asset.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{asset.price}</div>
                      <div className="text-green-400 font-semibold">{asset.change}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-blue-400">{asset.volume}</div>
                      <div className="text-sm text-gray-400">24h Volume</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Achievements System */}
        {selectedCategory === 'achievements' && (
          <div className="space-y-6">
            {/* Achievement Overview */}
            <div className="bg-gradient-to-r from-purple-900 to-blue-900 rounded-lg p-6 border border-purple-700">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <i className="fas fa-trophy text-yellow-400 mr-3"></i>
                Achievement System
              </h2>
              <p className="text-gray-300 mb-4">
                Unlock achievements by completing trading milestones and participating in the community.
                Earn XP and exclusive badges to showcase your trading prowess!
              </p>
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{achievements.length}</div>
                  <div className="text-sm text-gray-400">Total Achievements</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">3</div>
                  <div className="text-sm text-gray-400">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">2,150</div>
                  <div className="text-sm text-gray-400">Total XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">Level 12</div>
                  <div className="text-sm text-gray-400">Current Level</div>
                </div>
              </div>
            </div>

            {/* Achievement Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement, index) => (
                <div key={achievement.id} className={`bg-gray-800 rounded-lg p-6 border-2 transition-all hover:scale-105 ${getRarityColor(achievement.rarity)}`}>
                  <div className="text-center mb-4">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <h3 className="font-bold text-lg">{achievement.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded uppercase font-semibold ${getRarityColor(achievement.rarity)}`}>
                      {achievement.rarity}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 text-center">{achievement.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Requirement:</span>
                      <span className="text-white">{achievement.requirement}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Reward:</span>
                      <span className="text-yellow-400">{achievement.reward}</span>
                    </div>
                  </div>
                  
                  {/* Progress bar for achievements */}
                  <div className="mt-4">
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          Math.random() > 0.5 ? 'bg-green-400' : 'bg-blue-400'
                        }`}
                        style={{ width: `${Math.random() > 0.5 ? 100 : Math.floor(Math.random() * 80) + 10}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {Math.random() > 0.5 ? 'Completed!' : `${Math.floor(Math.random() * 80) + 10}% Progress`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Community Section */}
        {selectedCategory === 'community' && (
          <div className="space-y-6">
            {/* Global Community Stats */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <i className="fas fa-users text-blue-400 mr-3"></i>
                Global Community
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Top Countries */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Top Trading Countries</h3>
                  <div className="space-y-3">
                    {communityStats.topCountries.map((country, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{country.flag}</span>
                          <span className="font-medium">{country.country}</span>
                        </div>
                        <div className="text-blue-400 font-semibold">
                          {country.traders.toLocaleString()} traders
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Activities */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm">CryptoKing achieved "Master Trader" badge</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-sm">New trader milestone: 50,000 members!</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-sm">Weekly tournament starting in 2 days</span>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                      <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                      <span className="text-sm">TradeMaster shared a new strategy</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Feed */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Community Feed</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topTraders.slice(0, 5).map((trader, index) => (
                    <div key={index} className="flex items-start space-x-4 p-4 bg-gray-700 rounded-lg">
                      <div className="text-2xl">{trader.avatar}</div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-semibold">{trader.name}</span>
                          {trader.verified && <i className="fas fa-check-circle text-blue-400 text-sm"></i>}
                          <span className="text-gray-400 text-sm">• 2h ago</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-2">
                          Just closed a profitable BTCUSDT trade! The technical analysis paid off 📈
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <button className="hover:text-blue-400">
                            <i className="fas fa-heart mr-1"></i>24
                          </button>
                          <button className="hover:text-blue-400">
                            <i className="fas fa-comment mr-1"></i>5
                          </button>
                          <button className="hover:text-blue-400">
                            <i className="fas fa-share mr-1"></i>Share
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
