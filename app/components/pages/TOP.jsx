import React, { useState } from 'react';
import LeaderBoard from './LeaderBoard';
import P2P from './P2P';

const TOP = () => {
  const [selectedTab, setSelectedTab] = useState('traders');

  const topTraders = [
    { rank: 1, name: 'Alex Johnson', profit: '$5,234.56', winRate: '82%', avatar: '👨‍💼' },
    { rank: 2, name: 'Sarah Chen', profit: '$4,891.23', winRate: '79%', avatar: '👩‍💼' },
    { rank: 3, name: 'Mike Wilson', profit: '$4,567.89', winRate: '76%', avatar: '👨‍💻' },
    { rank: 4, name: 'Emma Davis', profit: '$4,234.12', winRate: '74%', avatar: '👩‍💻' },
    { rank: 5, name: 'John Smith', profit: '$3,987.65', winRate: '72%', avatar: '👨‍🎓' }
  ];

  const topAssets = [
    { rank: 1, asset: 'EUR/USD', volume: '$125M', change: '+2.34%', icon: '💶' },
    { rank: 2, asset: 'GBP/USD', volume: '$98M', change: '+1.87%', icon: '💷' },
    { rank: 3, asset: 'USD/JPY', volume: '$87M', change: '-0.45%', icon: '💴' },
    { rank: 4, asset: 'BTC/USD', volume: '$76M', change: '+5.67%', icon: '₿' },
    { rank: 5, asset: 'ETH/USD', volume: '$65M', change: '+3.21%', icon: '⟠' }
  ];

  return (
  <div className="p-6 bg-[#23283a] min-h-screen w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">TOP Rankings</h1>
        <p className="text-gray-400">Top performing traders and assets</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab('traders')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTab === 'traders'
                ? 'bg-blue-500 text-white'
                : 'bg-[#31374a] text-gray-300 hover:bg-[#3a4155]'
            }`}
          >
            🏆 Top Traders
          </button>
          <button
            onClick={() => setSelectedTab('assets')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTab === 'assets'
                ? 'bg-blue-500 text-white'
                : 'bg-[#31374a] text-gray-300 hover:bg-[#3a4155]'
            }`}
          >
            📊 Top Assets
          </button>
          <button
            onClick={() => setSelectedTab('leaderboard')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTab === 'leaderboard'
                ? 'bg-blue-500 text-white'
                : 'bg-[#31374a] text-gray-300 hover:bg-[#3a4155]'
            }`}
          >
            🥇 Leader Board
          </button>
          <button
            onClick={() => setSelectedTab('p2p')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedTab === 'p2p'
                ? 'bg-blue-500 text-white'
                : 'bg-[#31374a] text-gray-300 hover:bg-[#3a4155]'
            }`}
          >
            🤝 P2P Trading
          </button>
        </div>
      </div>

      {/* Content */}
      {selectedTab === 'traders' && (
        <div className="bg-[#31374a] rounded-lg p-6">
          <h3 className="text-white font-semibold mb-6">Top Performing Traders</h3>
          <div className="space-y-4">
            {topTraders.map((trader) => (
              <div key={trader.rank} className="flex items-center justify-between p-4 bg-[#23283a] rounded-lg hover:bg-[#2a3142] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-full text-white font-bold">
                    #{trader.rank}
                  </div>
                  <div className="text-2xl">{trader.avatar}</div>
                  <div>
                    <h4 className="text-white font-medium">{trader.name}</h4>
                    <p className="text-gray-400 text-sm">Professional Trader</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-green-400 font-semibold">{trader.profit}</p>
                    <p className="text-gray-400 text-sm">Total Profit</p>
                  </div>
                  <div className="text-right">
                    <p className="text-blue-400 font-semibold">{trader.winRate}</p>
                    <p className="text-gray-400 text-sm">Win Rate</p>
                  </div>
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Follow
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'assets' && (
        <div className="bg-[#31374a] rounded-lg p-6">
          <h3 className="text-white font-semibold mb-6">Top Trading Assets</h3>
          <div className="space-y-4">
            {topAssets.map((asset) => (
              <div key={asset.rank} className="flex items-center justify-between p-4 bg-[#23283a] rounded-lg hover:bg-[#2a3142] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10 bg-purple-500 rounded-full text-white font-bold">
                    #{asset.rank}
                  </div>
                  <div className="text-2xl">{asset.icon}</div>
                  <div>
                    <h4 className="text-white font-medium">{asset.asset}</h4>
                    <p className="text-gray-400 text-sm">Currency Pair</p>
                  </div>
                </div>
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <p className="text-white font-semibold">{asset.volume}</p>
                    <p className="text-gray-400 text-sm">24h Volume</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${asset.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.change}
                    </p>
                    <p className="text-gray-400 text-sm">24h Change</p>
                  </div>
                  <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                    Trade
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedTab === 'leaderboard' && (
        <div className="bg-[#31374a] rounded-lg p-6">
          <LeaderBoard />
        </div>
      )}

      {selectedTab === 'p2p' && (
        <div className="bg-[#31374a] rounded-lg p-6">
          <P2P />
        </div>
      )}
    </div>
  );
};

export default TOP;
