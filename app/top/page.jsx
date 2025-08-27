"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function TopPage() {
  const [selectedCategory, setSelectedCategory] = useState('traders');

  const categories = [
    { id: 'traders', label: 'Top Traders', icon: 'fa-user-star' },
    { id: 'assets', label: 'Top Assets', icon: 'fa-chart-line' },
    { id: 'signals', label: 'Top Signals', icon: 'fa-broadcast-tower' },
    { id: 'strategies', label: 'Top Strategies', icon: 'fa-brain' }
  ];

  const topTraders = [
    { rank: 1, name: 'CryptoKing', avatar: '👑', profit: '+$15,240', winRate: 89.5, trades: 1250, country: 'USA' },
    { rank: 2, name: 'TradeMaster', avatar: '🎯', profit: '+$12,860', winRate: 85.2, trades: 980, country: 'UK' },
    { rank: 3, name: 'QuantumTrader', avatar: '⚡', profit: '+$11,750', winRate: 82.8, trades: 1120, country: 'Canada' },
    { rank: 4, name: 'MarketGuru', avatar: '🧠', profit: '+$10,490', winRate: 81.3, trades: 890, country: 'Germany' },
    { rank: 5, name: 'ProfitHunter', avatar: '🎪', profit: '+$9,850', winRate: 79.6, trades: 750, country: 'Australia' },
    { rank: 6, name: 'BullishBear', avatar: '🐻', profit: '+$9,320', winRate: 78.4, trades: 680, country: 'Japan' },
    { rank: 7, name: 'WaveRider', avatar: '🌊', profit: '+$8,970', winRate: 77.8, trades: 620, country: 'France' },
    { rank: 8, name: 'TrendFollower', avatar: '📈', profit: '+$8,540', winRate: 76.5, trades: 590, country: 'Netherlands' }
  ];

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
            <div className="text-sm text-gray-400">
              Updated: 2 minutes ago
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              <i className="fas fa-refresh mr-2"></i>Refresh
            </button>
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
                  <div className="w-24 h-32 bg-gray-700 rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-gray-500">
                    <div className="text-4xl mb-2">{topTraders[1].avatar}</div>
                    <div className="text-2xl">🥈</div>
                  </div>
                  <h3 className="font-bold text-gray-300">{topTraders[1].name}</h3>
                  <p className="text-green-400 font-semibold">{topTraders[1].profit}</p>
                  <p className="text-sm text-gray-400">{topTraders[1].winRate}% win rate</p>
                </div>

                {/* 1st Place */}
                <div className="text-center">
                  <div className="w-28 h-36 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-yellow-400">
                    <div className="text-5xl mb-2">{topTraders[0].avatar}</div>
                    <div className="text-3xl">🥇</div>
                  </div>
                  <h3 className="font-bold text-yellow-400 text-lg">{topTraders[0].name}</h3>
                  <p className="text-green-400 font-semibold text-lg">{topTraders[0].profit}</p>
                  <p className="text-sm text-gray-400">{topTraders[0].winRate}% win rate</p>
                </div>

                {/* 3rd Place */}
                <div className="text-center">
                  <div className="w-24 h-32 bg-gray-700 rounded-lg flex flex-col items-center justify-center mb-4 border-2 border-orange-400">
                    <div className="text-4xl mb-2">{topTraders[2].avatar}</div>
                    <div className="text-2xl">🥉</div>
                  </div>
                  <h3 className="font-bold text-orange-400">{topTraders[2].name}</h3>
                  <p className="text-green-400 font-semibold">{topTraders[2].profit}</p>
                  <p className="text-sm text-gray-400">{topTraders[2].winRate}% win rate</p>
                </div>
              </div>
            </div>

            {/* Full Leaderboard */}
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Complete Leaderboard</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {topTraders.map((trader, index) => (
                    <div key={index} className={`flex items-center justify-between p-4 rounded-lg ${
                      trader.rank <= 3 ? 'bg-gradient-to-r from-gray-700 to-gray-600 border border-gray-500' : 'bg-gray-700'
                    }`}>
                      <div className="flex items-center space-x-4">
                        <div className={`text-2xl font-bold ${getRankColor(trader.rank)} min-w-[50px]`}>
                          {getRankBadge(trader.rank)}
                        </div>
                        <div className="text-3xl">{trader.avatar}</div>
                        <div>
                          <h3 className="font-semibold text-lg">{trader.name}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-400">
                            <span><i className="fas fa-flag mr-1"></i>{trader.country}</span>
                            <span><i className="fas fa-chart-line mr-1"></i>{trader.trades} trades</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">{trader.profit}</div>
                        <div className="text-sm text-gray-400">
                          <span className="text-blue-400">{trader.winRate}%</span> win rate
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

        {/* Other categories placeholder */}
        {(selectedCategory === 'signals' || selectedCategory === 'strategies') && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12">
            <div className="text-center">
              <i className={`fas ${categories.find(c => c.id === selectedCategory)?.icon} text-6xl text-gray-600 mb-4`}></i>
              <h2 className="text-2xl font-semibold mb-2">
                {categories.find(c => c.id === selectedCategory)?.label}
              </h2>
              <p className="text-gray-400 mb-6">Coming soon! This section is under development.</p>
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg">
                <i className="fas fa-bell mr-2"></i>Notify me when ready
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
