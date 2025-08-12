import React, { useState } from 'react';

const Signals = () => {
  const [selectedAsset, setSelectedAsset] = useState('ALL');

  const tradingSignals = [
    {
      id: 1,
      asset: 'EUR/USD',
      direction: 'CALL',
      strength: 'Strong',
      expiry: '5m',
      accuracy: '85%',
      time: '2 min ago',
      price: '1.0845',
      icon: '💶'
    },
    {
      id: 2,
      asset: 'GBP/USD',
      direction: 'PUT',
      strength: 'Medium',
      expiry: '15m',
      accuracy: '78%',
      time: '5 min ago',
      price: '1.2634',
      icon: '💷'
    },
    {
      id: 3,
      asset: 'BTC/USD',
      direction: 'CALL',
      strength: 'Strong',
      expiry: '1h',
      accuracy: '92%',
      time: '8 min ago',
      price: '45,250',
      icon: '₿'
    },
    {
      id: 4,
      asset: 'USD/JPY',
      direction: 'PUT',
      strength: 'Weak',
      expiry: '30m',
      accuracy: '65%',
      time: '12 min ago',
      price: '149.75',
      icon: '💴'
    },
    {
      id: 5,
      asset: 'ETH/USD',
      direction: 'CALL',
      strength: 'Medium',
      expiry: '45m',
      accuracy: '81%',
      time: '15 min ago',
      price: '2,450',
      icon: '⟠'
    }
  ];

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'Strong': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'Weak': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const getDirectionColor = (direction) => {
    return direction === 'CALL' ? 'text-green-400 bg-green-500/20' : 'text-red-400 bg-red-500/20';
  };

  return (
  <div className="p-6 bg-[#23283a] min-h-screen w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">Trading Signals</h1>
        <p className="text-gray-400">Real-time trading signals and market analysis</p>
      </div>

      {/* Signal Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#31374a] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-green-400 text-xl">📡</div>
            <div>
              <p className="text-gray-400 text-sm">Active Signals</p>
              <p className="text-xl font-bold text-white">12</p>
            </div>
          </div>
        </div>

        <div className="bg-[#31374a] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-blue-400 text-xl">🎯</div>
            <div>
              <p className="text-gray-400 text-sm">Accuracy Rate</p>
              <p className="text-xl font-bold text-blue-400">82.5%</p>
            </div>
          </div>
        </div>

        <div className="bg-[#31374a] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-purple-400 text-xl">⚡</div>
            <div>
              <p className="text-gray-400 text-sm">Strong Signals</p>
              <p className="text-xl font-bold text-purple-400">8</p>
            </div>
          </div>
        </div>

        <div className="bg-[#31374a] rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="text-yellow-400 text-xl">🔔</div>
            <div>
              <p className="text-gray-400 text-sm">New Today</p>
              <p className="text-xl font-bold text-yellow-400">24</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['ALL', 'EUR/USD', 'GBP/USD', 'BTC/USD', 'ETH/USD'].map((asset) => (
            <button
              key={asset}
              onClick={() => setSelectedAsset(asset)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedAsset === asset
                  ? 'bg-blue-500 text-white'
                  : 'bg-[#31374a] text-gray-300 hover:bg-[#3a4155]'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>
      </div>

      {/* Signals List */}
      <div className="bg-[#31374a] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-6">Recent Trading Signals</h3>
        
        <div className="space-y-4">
          {tradingSignals.map((signal) => (
            <div key={signal.id} className="bg-[#23283a] rounded-lg p-4 hover:bg-[#2a3142] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{signal.icon}</div>
                  <div>
                    <h4 className="text-white font-medium">{signal.asset}</h4>
                    <p className="text-gray-400 text-sm">Current: {signal.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDirectionColor(signal.direction)}`}>
                      {signal.direction}
                    </span>
                    <p className="text-gray-400 text-xs mt-1">Direction</p>
                  </div>

                  <div className="text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStrengthColor(signal.strength)}`}>
                      {signal.strength}
                    </span>
                    <p className="text-gray-400 text-xs mt-1">Strength</p>
                  </div>

                  <div className="text-center">
                    <p className="text-white font-medium">{signal.expiry}</p>
                    <p className="text-gray-400 text-xs">Expiry</p>
                  </div>

                  <div className="text-center">
                    <p className="text-green-400 font-medium">{signal.accuracy}</p>
                    <p className="text-gray-400 text-xs">Accuracy</p>
                  </div>

                  <div className="text-center">
                    <p className="text-gray-300 text-sm">{signal.time}</p>
                    <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm mt-1 transition-colors">
                      Trade Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signal Settings */}
      <div className="mt-8 bg-[#31374a] rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Signal Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Email Notifications</span>
            <button className="bg-green-500 w-12 h-6 rounded-full relative">
              <div className="bg-white w-5 h-5 rounded-full absolute right-0.5 top-0.5"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Sound Alerts</span>
            <button className="bg-gray-600 w-12 h-6 rounded-full relative">
              <div className="bg-white w-5 h-5 rounded-full absolute left-0.5 top-0.5"></div>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-300">Strong Signals Only</span>
            <button className="bg-green-500 w-12 h-6 rounded-full relative">
              <div className="bg-white w-5 h-5 rounded-full absolute right-0.5 top-0.5"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signals;
