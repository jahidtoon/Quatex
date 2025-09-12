"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SignalsPage() {
  const [activeTab, setActiveTab] = useState('live');
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock signals data
  useEffect(() => {
    setTimeout(() => {
      setSignals([
        {
          id: 1,
          pair: 'BTCUSDT',
          direction: 'UP',
          strength: 'Strong',
          confidence: 85,
          entry: 43250,
          target: 44100,
          stopLoss: 42800,
          time: '2 min ago',
          status: 'active',
          profit: null
        },
        {
          id: 2,
          pair: 'ETHUSD',
          direction: 'DOWN',
          strength: 'Medium',
          confidence: 72,
          entry: 2650,
          target: 2580,
          stopLoss: 2720,
          time: '5 min ago',
          status: 'active',
          profit: null
        },
        {
          id: 3,
          pair: 'XRPUSDT',
          direction: 'UP',
          strength: 'Weak',
          confidence: 58,
          entry: 0.52,
          target: 0.55,
          stopLoss: 0.49,
          time: '8 min ago',
          status: 'closed',
          profit: '+15.2%'
        },
        {
          id: 4,
          pair: 'ADAUSDT',
          direction: 'DOWN',
          strength: 'Strong',
          confidence: 92,
          entry: 0.38,
          target: 0.35,
          stopLoss: 0.41,
          time: '12 min ago',
          status: 'closed',
          profit: '+22.5%'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getStrengthColor = (strength) => {
    switch (strength.toLowerCase()) {
      case 'strong': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'weak': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getDirectionColor = (direction) => {
    return direction === 'UP' ? 'text-green-400' : 'text-red-400';
  };

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
              <i className="fas fa-broadcast-tower text-purple-400 mr-3"></i>
              Trading Signals
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Signal Accuracy</div>
              <div className="text-xl font-bold text-green-400">78.5%</div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'live'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fas fa-satellite-dish mr-2"></i>
            Live Signals
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fas fa-history mr-2"></i>
            Signal History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <i className="fas fa-cog mr-2"></i>
            Settings
          </button>
        </div>

        {/* Content */}
        {activeTab === 'live' && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                signals.filter(s => s.status === 'active').map((signal) => (
                  <div key={signal.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-bold">{signal.pair}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getDirectionColor(signal.direction)}`}>
                          {signal.direction}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-400">Confidence</div>
                        <div className="text-lg font-bold text-blue-400">{signal.confidence}%</div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Strength:</span>
                        <span className={`font-semibold ${getStrengthColor(signal.strength)}`}>
                          {signal.strength}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Entry:</span>
                        <span className="font-semibold">${signal.entry.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Target:</span>
                        <span className="font-semibold text-green-400">${signal.target.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Stop Loss:</span>
                        <span className="font-semibold text-red-400">${signal.stopLoss.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time:</span>
                        <span className="text-sm">{signal.time}</span>
                      </div>
                    </div>

                    <button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                      <i className="fas fa-chart-line mr-2"></i>
                      Trade This Signal
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Signal History</h2>
              <p className="text-gray-400">Past trading signals and their performance</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-6">Pair</th>
                    <th className="text-left py-3 px-6">Direction</th>
                    <th className="text-left py-3 px-6">Strength</th>
                    <th className="text-left py-3 px-6">Confidence</th>
                    <th className="text-left py-3 px-6">Result</th>
                    <th className="text-left py-3 px-6">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {signals.filter(s => s.status === 'closed').map((signal) => (
                    <tr key={signal.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-3 px-6 font-semibold">{signal.pair}</td>
                      <td className="py-3 px-6">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${getDirectionColor(signal.direction)}`}>
                          {signal.direction}
                        </span>
                      </td>
                      <td className="py-3 px-6">
                        <span className={getStrengthColor(signal.strength)}>{signal.strength}</span>
                      </td>
                      <td className="py-3 px-6">{signal.confidence}%</td>
                      <td className="py-3 px-6">
                        <span className="text-green-400 font-semibold">{signal.profit}</span>
                      </td>
                      <td className="py-3 px-6 text-gray-400">{signal.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Signal Settings</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Signal Notifications</label>
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked className="rounded" />
                    <span>Enable push notifications for new signals</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Minimum Confidence Level</label>
                  <select className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white">
                    <option value="50">50%</option>
                    <option value="60">60%</option>
                    <option value="70" selected>70%</option>
                    <option value="80">80%</option>
                    <option value="90">90%</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Signal Types</label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked />
                      <span>Forex Signals</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked />
                      <span>Crypto Signals</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" />
                      <span>Stock Signals</span>
                    </div>
                  </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
