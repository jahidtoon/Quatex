"use client";
import React, { useState } from 'react';
import PageLayout from '../components/PageLayout';

export default function TradePage() {
  const [selectedAsset, setSelectedAsset] = useState('BTCUSDT');
  const [tradeAmount, setTradeAmount] = useState(10);
  const [tradeDirection, setTradeDirection] = useState('up');
  const [timeframe, setTimeframe] = useState('1m');

  const assets = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', price: 65450.23, change: '+2.45%', positive: true },
    { symbol: 'ETHUSD', name: 'Ethereum', price: 3245.67, change: '-1.23%', positive: false },
    { symbol: 'XRPUSDT', name: 'Ripple', price: 0.5432, change: '+5.67%', positive: true },
    { symbol: 'ADAUSDT', name: 'Cardano', price: 0.4521, change: '-0.89%', positive: false },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', price: 0.0821, change: '+12.34%', positive: true },
  ];

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];

  return (
    <PageLayout title="Trading Platform" subtitle="Trade cryptocurrencies and forex pairs">
      <div className="flex h-screen bg-gray-900">
        {/* Left Panel - Asset List */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-4">
          <h2 className="text-lg font-semibold mb-4">Trading Assets</h2>
          <div className="space-y-2">
            {assets.map((asset) => (
              <div
                key={asset.symbol}
                onClick={() => setSelectedAsset(asset.symbol)}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedAsset === asset.symbol
                    ? 'bg-blue-600 border border-blue-500'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{asset.symbol}</div>
                    <div className="text-sm text-gray-400">{asset.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">${asset.price.toLocaleString()}</div>
                    <div className={`text-sm ${asset.positive ? 'text-green-400' : 'text-red-400'}`}>
                      {asset.change}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <h3 className="font-semibold mb-3">Today's Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Trades:</span>
                <span>15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Successful:</span>
                <span className="text-green-400">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Failed:</span>
                <span className="text-red-400">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profit/Loss:</span>
                <span className="text-green-400">+$245.67</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Chart Area */}
        <div className="flex-1 bg-gray-900 p-4">
          <div className="bg-gray-800 rounded-lg h-full p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{selectedAsset} Chart</h2>
              <div className="flex space-x-2">
                {timeframes.map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-3 py-1 rounded text-sm ${
                      timeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-gray-900 rounded-lg h-96 flex items-center justify-center border border-gray-700">
              <div className="text-center">
                <i className="fas fa-chart-line text-6xl text-gray-600 mb-4"></i>
                <p className="text-gray-400">Trading Chart for {selectedAsset}</p>
                <p className="text-sm text-gray-500">Chart will be integrated here</p>
              </div>
            </div>

            {/* Market Info */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Current Price</div>
                <div className="text-lg font-semibold">$65,450.23</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">24h High</div>
                <div className="text-lg font-semibold text-green-400">$66,890.45</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">24h Low</div>
                <div className="text-lg font-semibold text-red-400">$64,120.18</div>
              </div>
              <div className="bg-gray-700 p-3 rounded-lg">
                <div className="text-sm text-gray-400">Volume</div>
                <div className="text-lg font-semibold">$2.4B</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Trading Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-4">
          <h2 className="text-lg font-semibold mb-4">Place Trade</h2>
          
          <div className="space-y-4">
            {/* Trade Direction */}
            <div>
              <label className="block text-sm font-medium mb-2">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setTradeDirection('up')}
                  className={`p-3 rounded-lg border ${
                    tradeDirection === 'up'
                      ? 'bg-green-600 border-green-500 text-white'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <i className="fas fa-arrow-up mr-2"></i>
                  UP
                </button>
                <button
                  onClick={() => setTradeDirection('down')}
                  className={`p-3 rounded-lg border ${
                    tradeDirection === 'down'
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                  }`}
                >
                  <i className="fas fa-arrow-down mr-2"></i>
                  DOWN
                </button>
              </div>
            </div>

            {/* Trade Amount */}
            <div>
              <label className="block text-sm font-medium mb-2">Amount ($)</label>
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => setTradeAmount(e.target.value)}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                min="1"
              />
              <div className="flex space-x-2 mt-2">
                {[10, 25, 50, 100].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTradeAmount(amount)}
                    className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Trade Button */}
            <button
              className={`w-full py-4 rounded-lg font-semibold text-lg ${
                tradeDirection === 'up'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              <i className={`fas fa-arrow-${tradeDirection === 'up' ? 'up' : 'down'} mr-2`}></i>
              Place {tradeDirection.toUpperCase()} Trade
            </button>

            {/* Potential Profit */}
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Potential Profit:</span>
                <span className="text-green-400">$8.50 (85%)</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-400">Payout:</span>
                <span>${(tradeAmount * 1.85).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Recent Trades */}
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Recent Trades</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center py-2 bg-gray-700 rounded px-3">
                <div>
                  <div className="font-medium">BTCUSDT</div>
                  <div className="text-gray-400">2m ago</div>
                </div>
                <div className="text-right">
                  <div className="text-green-400">+$17.50</div>
                  <div className="text-gray-400">UP</div>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 bg-gray-700 rounded px-3">
                <div>
                  <div className="font-medium">ETHUSD</div>
                  <div className="text-gray-400">5m ago</div>
                </div>
                <div className="text-right">
                  <div className="text-red-400">-$25.00</div>
                  <div className="text-gray-400">DOWN</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
