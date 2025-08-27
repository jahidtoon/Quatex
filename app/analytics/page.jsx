"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedAsset, setSelectedAsset] = useState('all');

  const periods = [
    { value: '1d', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  const stats = {
    totalTrades: 245,
    successRate: 68.5,
    totalProfit: 1250.75,
    totalLoss: -485.20,
    netProfit: 765.55,
    avgTradeTime: '2m 15s',
    bestDay: '+$125.50',
    worstDay: '-$85.30'
  };

  const assetPerformance = [
    { asset: 'BTCUSDT', trades: 85, winRate: 72.5, profit: '+$425.30' },
    { asset: 'ETHUSD', trades: 62, winRate: 66.1, profit: '+$285.75' },
    { asset: 'XRPUSDT', trades: 48, winRate: 64.6, profit: '+$125.20' },
    { asset: 'ADAUSDT', trades: 35, winRate: 71.4, profit: '+$95.50' },
    { asset: 'DOGEUSDT', trades: 15, winRate: 53.3, profit: '-$166.00' }
  ];

  const recentTrades = [
    { id: 1, asset: 'BTCUSDT', direction: 'UP', amount: 50, result: 'WIN', profit: '+$42.50', time: '2 min ago' },
    { id: 2, asset: 'ETHUSD', direction: 'DOWN', amount: 25, result: 'WIN', profit: '+$21.25', time: '5 min ago' },
    { id: 3, asset: 'BTCUSDT', direction: 'UP', amount: 100, result: 'LOSS', profit: '-$100.00', time: '8 min ago' },
    { id: 4, asset: 'XRPUSDT', direction: 'DOWN', amount: 30, result: 'WIN', profit: '+$25.50', time: '12 min ago' },
    { id: 5, asset: 'ETHUSD', direction: 'UP', amount: 75, result: 'WIN', profit: '+$63.75', time: '15 min ago' }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            >
              {periods.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              <i className="fas fa-download mr-2"></i>Export Report
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Trades</p>
                <p className="text-2xl font-bold">{stats.totalTrades}</p>
              </div>
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <i className="fas fa-chart-line text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Success Rate</p>
                <p className="text-2xl font-bold text-green-400">{stats.successRate}%</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <i className="fas fa-percentage text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Net Profit</p>
                <p className="text-2xl font-bold text-green-400">${stats.netProfit}</p>
              </div>
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                <i className="fas fa-dollar-sign text-xl"></i>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Avg Trade Time</p>
                <p className="text-2xl font-bold">{stats.avgTradeTime}</p>
              </div>
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <i className="fas fa-clock text-xl"></i>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Profit/Loss Chart */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Profit/Loss Trend</h2>
            <div className="bg-gray-900 rounded-lg h-64 flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <i className="fas fa-chart-area text-5xl text-gray-600 mb-4"></i>
                <p className="text-gray-400">Profit/Loss Chart</p>
                <p className="text-sm text-gray-500">Chart visualization here</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <p className="text-sm text-gray-400">Total Profit</p>
                <p className="text-lg font-semibold text-green-400">${stats.totalProfit}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-400">Total Loss</p>
                <p className="text-lg font-semibold text-red-400">${stats.totalLoss}</p>
              </div>
            </div>
          </div>

          {/* Performance Breakdown */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Performance Breakdown</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Best Trading Day</span>
                <span className="text-green-400 font-semibold">{stats.bestDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Worst Trading Day</span>
                <span className="text-red-400 font-semibold">{stats.worstDay}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average Daily Profit</span>
                <span className="text-green-400 font-semibold">$45.32</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Win Streak</span>
                <span className="text-blue-400 font-semibold">8 trades</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Loss Streak</span>
                <span className="text-red-400 font-semibold">3 trades</span>
              </div>
            </div>

            {/* Success Rate Visual */}
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>Success Rate</span>
                <span>{stats.successRate}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${stats.successRate}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Asset Performance */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Asset Performance</h2>
            <div className="space-y-3">
              {assetPerformance.map((asset, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">{asset.asset}</span>
                    <span className={`font-semibold ${asset.profit.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.profit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{asset.trades} trades</span>
                    <span>{asset.winRate}% win rate</span>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${asset.winRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Trades */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl font-semibold mb-4">Recent Trades</h2>
            <div className="space-y-3">
              {recentTrades.map((trade) => (
                <div key={trade.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${trade.result === 'WIN' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <div>
                        <div className="font-semibold">{trade.asset}</div>
                        <div className="text-sm text-gray-400">{trade.direction} • ${trade.amount}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${trade.result === 'WIN' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.profit}
                      </div>
                      <div className="text-sm text-gray-400">{trade.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
