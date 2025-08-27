'use client';

import { useState, useEffect } from 'react';

const TradingInterface = ({ selectedSymbol, currentPrice, priceChange }) => {
  const [tradeType, setTradeType] = useState('up');
  const [amount, setAmount] = useState(10);
  const [duration, setDuration] = useState(60);
  const [isTrading, setIsTrading] = useState(false);
  const [trades, setTrades] = useState([]);
  const [balance, setBalance] = useState(10000);
  const [profit, setProfit] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [prediction, setPrediction] = useState(null);

  const durations = [
    { value: 30, label: '30s', multiplier: 0.8 },
    { value: 60, label: '1m', multiplier: 0.85 },
    { value: 300, label: '5m', multiplier: 0.9 },
    { value: 900, label: '15m', multiplier: 0.95 }
  ];

  const amounts = [10, 25, 50, 100, 250, 500];

  const placeTrade = () => {
    if (amount > balance || isTrading) return;

    setIsTrading(true);
    const startPrice = currentPrice;
    const startTime = Date.now();
    const endTime = startTime + (duration * 1000);
    const selectedDuration = durations.find(d => d.value === duration);
    const potentialWin = amount * (selectedDuration?.multiplier || 0.85);

    const newTrade = {
      id: Date.now(),
      symbol: selectedSymbol,
      type: tradeType,
      amount: amount,
      startPrice: startPrice,
      startTime: startTime,
      endTime: endTime,
      duration: duration,
      status: 'active',
      potentialWin: potentialWin
    };

    setTrades(prev => [newTrade, ...prev]);
    setBalance(prev => prev - amount);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);

    setTimeout(() => {
      const finalPrice = currentPrice;
      const isWin = (tradeType === 'up' && finalPrice > startPrice) || 
                   (tradeType === 'down' && finalPrice < startPrice);
      
      setTrades(prev => prev.map(trade => 
        trade.id === newTrade.id 
          ? { ...trade, status: isWin ? 'win' : 'loss', endPrice: finalPrice }
          : trade
      ));

      if (isWin) {
        setBalance(prev => prev + amount + potentialWin);
        setProfit(prev => prev + potentialWin);
      }

      setIsTrading(false);
    }, duration * 1000);
  };

  useEffect(() => {
    const generatePrediction = () => {
      const trend = Math.random() > 0.5 ? 'up' : 'down';
      const confidence = Math.floor(Math.random() * 30) + 60;
      const timeLeft = Math.floor(Math.random() * 300) + 30;
      
      setPrediction({ trend, confidence, timeLeft });
    };

    generatePrediction();
    const interval = setInterval(generatePrediction, 30000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Trade Panel</h3>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Balance</p>
              <p className="text-lg font-bold text-green-400">${balance.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Profit</p>
              <p className={`text-lg font-bold ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${profit.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto p-4 space-y-6">
          {/* AI Prediction */}
          {prediction && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-200">AI Prediction</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className={`text-2xl ${prediction.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {prediction.trend === 'up' ? '📈' : '📉'}
                    </span>
                    <span className="text-lg font-bold">
                      {prediction.trend.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-purple-200">Confidence</p>
                  <p className="text-2xl font-bold">{prediction.confidence}%</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="bg-purple-700 rounded-full h-2">
                  <div 
                    className="bg-white rounded-full h-2 transition-all duration-1000"
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-purple-200 mt-2">
                Next signal in {Math.floor(prediction.timeLeft / 60)}m {prediction.timeLeft % 60}s
              </p>
            </div>
          )}

          {/* Trade Direction */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Direction</h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTradeType('up')}
                className={`p-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
                  tradeType === 'up'
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">📈</span>
                  <span>UP</span>
                </div>
                <p className="text-sm mt-1 opacity-75">Higher</p>
              </button>

              <button
                onClick={() => setTradeType('down')}
                className={`p-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
                  tradeType === 'down'
                    ? 'bg-red-600 text-white shadow-lg shadow-red-600/50'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-2xl">📉</span>
                  <span>DOWN</span>
                </div>
                <p className="text-sm mt-1 opacity-75">Lower</p>
              </button>
            </div>
          </div>

          {/* Amount Selection */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Amount</h4>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {amounts.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setAmount(amt)}
                  className={`p-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    amount === amt
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="Enter amount"
                min="1"
                max={balance}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                USD
              </div>
            </div>
          </div>

          {/* Duration Selection */}
          <div>
            <h4 className="text-lg font-semibold mb-3">Duration</h4>
            <div className="grid grid-cols-2 gap-2">
              {durations.map((dur) => (
                <button
                  key={dur.value}
                  onClick={() => setDuration(dur.value)}
                  className={`p-3 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                    duration === dur.value
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div>{dur.label}</div>
                  <div className="text-xs opacity-75">
                    {(dur.multiplier * 100).toFixed(0)}% payout
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Trade Summary */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h4 className="text-lg font-semibold mb-3">Trade Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Asset:</span>
                <span>{selectedSymbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Direction:</span>
                <span className={tradeType === 'up' ? 'text-green-400' : 'text-red-400'}>
                  {tradeType.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Investment:</span>
                <span>${amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Potential Profit:</span>
                <span className="text-green-400">
                  ${(amount * (durations.find(d => d.value === duration)?.multiplier || 0.85)).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span>{durations.find(d => d.value === duration)?.label}</span>
              </div>
            </div>
          </div>

          {/* Trade Button */}
          <button
            onClick={placeTrade}
            disabled={amount > balance || isTrading}
            className={`w-full p-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 ${
              amount > balance
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : isTrading
                ? 'bg-yellow-600 text-white cursor-not-allowed animate-pulse'
                : tradeType === 'up'
                ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg'
            }`}
          >
            {amount > balance ? 'Insufficient Balance' : 
             isTrading ? 'Trade in Progress...' :
             `Trade ${tradeType.toUpperCase()} - $${amount}`}
          </button>

          {/* Active Trades */}
          {trades.filter(trade => trade.status === 'active').length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3">Active Trades</h4>
              <div className="space-y-2">
                {trades.filter(trade => trade.status === 'active').map((trade) => (
                  <ActiveTradeCard key={trade.id} trade={trade} currentPrice={currentPrice} />
                ))}
              </div>
            </div>
          )}

          {/* Trade History */}
          {trades.filter(trade => trade.status !== 'active').length > 0 && (
            <div>
              <h4 className="text-lg font-semibold mb-3">Recent Trades</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {trades.filter(trade => trade.status !== 'active').slice(0, 10).map((trade) => (
                  <TradeHistoryCard key={trade.id} trade={trade} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-green-600 text-white p-6 rounded-lg shadow-xl animate-bounce">
            <div className="text-center">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-xl font-bold">Trade Placed!</div>
              <div className="text-sm mt-1">Good luck!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Active Trade Card Component
const ActiveTradeCard = ({ trade, currentPrice }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, trade.endTime - Date.now());
      setTimeLeft(Math.floor(remaining / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [trade.endTime]);

  const progress = ((Date.now() - trade.startTime) / (trade.endTime - trade.startTime)) * 100;
  const priceDirection = currentPrice > trade.startPrice ? 'up' : 'down';
  const isWinning = (trade.type === 'up' && priceDirection === 'up') || 
                   (trade.type === 'down' && priceDirection === 'down');

  return (
    <div className={`bg-gray-800 rounded-lg p-3 border-l-4 ${
      isWinning ? 'border-green-500' : 'border-red-500'
    } transition-all`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="text-sm font-semibold">{trade.symbol}</p>
          <p className={`text-xs ${trade.type === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trade.type.toUpperCase()} - ${trade.amount}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</p>
          <p className={`text-xs ${isWinning ? 'text-green-400' : 'text-red-400'}`}>
            {isWinning ? 'Winning' : 'Losing'}
          </p>
        </div>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Entry: ${trade.startPrice.toFixed(2)}</span>
          <span>Current: ${currentPrice.toFixed(2)}</span>
        </div>
        <div className="bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              isWinning ? 'bg-green-500' : 'bg-red-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// Trade History Card Component
const TradeHistoryCard = ({ trade }) => {
  const isWin = trade.status === 'win';
  const priceDiff = trade.endPrice - trade.startPrice;
  const priceDiffPercent = ((priceDiff / trade.startPrice) * 100);

  return (
    <div className={`bg-gray-800 rounded-lg p-3 border-l-4 ${
      isWin ? 'border-green-500' : 'border-red-500'
    } transition-all`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-semibold">{trade.symbol}</p>
          <p className={`text-xs ${trade.type === 'up' ? 'text-green-400' : 'text-red-400'}`}>
            {trade.type.toUpperCase()} - ${trade.amount}
          </p>
        </div>
        <div className="text-right">
          <p className={`text-sm font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
            {isWin ? '+' : '-'}${isWin ? trade.potentialWin.toFixed(2) : trade.amount.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(trade.endTime).toLocaleTimeString()}
          </p>
        </div>
      </div>
      
      <div className="text-xs text-gray-400 mt-1">
        ${trade.startPrice.toFixed(2)} → ${trade.endPrice.toFixed(2)} 
        <span className={priceDiff >= 0 ? 'text-green-400' : 'text-red-400'}>
          {' '}({priceDiff >= 0 ? '+' : ''}{priceDiffPercent.toFixed(2)}%)
        </span>
      </div>
    </div>
  );
};

export default TradingInterface;
