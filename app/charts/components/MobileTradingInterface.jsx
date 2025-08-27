'use client';

import { useState, useEffect } from 'react';

export default function MobileTradingInterface({ selectedPair, onTradeClick }) {
  const [tradeAmount, setTradeAmount] = useState(10);
  const [tradeTime, setTradeTime] = useState(60);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [showInterface, setShowInterface] = useState(false);

  // Get real-time price
  useEffect(() => {
    if (!selectedPair) return;

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedPair.symbol.toLowerCase()}@ticker`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentPrice(parseFloat(data.c));
    };

    return () => {
      ws.close();
    };
  }, [selectedPair]);

  const quickAmounts = [10, 25, 50, 100];
  const quickTimes = [
    { label: '1m', value: 60 },
    { label: '5m', value: 300 },
    { label: '15m', value: 900 },
    { label: '1h', value: 3600 }
  ];

  const handleTrade = (direction) => {
    if (onTradeClick) {
      onTradeClick({
        pair: selectedPair.symbol,
        direction,
        amount: tradeAmount,
        time: tradeTime,
        price: currentPrice
      });
    }
  };

  return (
    <>
      {/* Mobile Trade Button - Always visible */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
        <div className="flex space-x-2">
          <button
            onClick={() => handleTrade('call')}
            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
          >
            CALL ↗
          </button>
          <button
            onClick={() => setShowInterface(!showInterface)}
            className="px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            ⚙️
          </button>
          <button
            onClick={() => handleTrade('put')}
            className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            PUT ↙
          </button>
        </div>
      </div>

      {/* Mobile Settings Panel */}
      {showInterface && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowInterface(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-gray-800 rounded-t-xl p-6 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Trade Settings</h3>
              <button
                onClick={() => setShowInterface(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Current Price */}
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">{selectedPair.display}</span>
                  <span className="text-white font-mono text-lg">
                    {currentPrice ? `$${currentPrice.toFixed(4)}` : 'Loading...'}
                  </span>
                </div>
              </div>

              {/* Trade Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Amount ($)
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {quickAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setTradeAmount(amount)}
                      className={`py-2 rounded text-sm font-medium transition-colors ${
                        tradeAmount === amount
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={tradeAmount}
                  onChange={(e) => setTradeAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                  placeholder="Custom amount"
                />
              </div>

              {/* Trade Time */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {quickTimes.map((time) => (
                    <button
                      key={time.value}
                      onClick={() => setTradeTime(time.value)}
                      className={`py-2 rounded text-sm font-medium transition-colors ${
                        tradeTime === time.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    >
                      {time.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Potential Profit */}
              <div className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Potential Profit (85%):</span>
                  <span className="text-green-400 font-bold">
                    ${((tradeAmount * 85) / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
