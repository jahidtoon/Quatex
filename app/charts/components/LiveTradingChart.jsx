'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const LiveTradingChart = ({ symbol, onPriceUpdate }) => {
  const canvasRef = useRef(null);
  const [priceData, setPriceData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [volume, setVolume] = useState(0);
  const [high24h, setHigh24h] = useState(0);
  const [low24h, setLow24h] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [timeframe, setTimeframe] = useState('1m');

  const timeframes = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' }
  ];

  // WebSocket connection for real-time data
  useEffect(() => {
    let ws;
    let retryCount = 0;
    const maxRetries = 5;

    const connectWebSocket = () => {
      try {
        const symbolLower = symbol.toLowerCase();
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbolLower}usdt@ticker`);
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          retryCount = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.c);
            const change = parseFloat(data.P);
            const vol = parseFloat(data.v);
            const high = parseFloat(data.h);
            const low = parseFloat(data.l);

            setCurrentPrice(price);
            setPriceChange(change);
            setVolume(vol);
            setHigh24h(high);
            setLow24h(low);

            // Add to price data for chart
            const timestamp = Date.now();
            setPriceData(prev => {
              const newData = [...prev, { timestamp, price, volume: vol }];
              // Keep only last 100 data points
              return newData.slice(-100);
            });

            // Notify parent component
            if (onPriceUpdate) {
              onPriceUpdate(price, change);
            }
          } catch (error) {
            console.error('Error parsing WebSocket data:', error);
          }
        };

        ws.onclose = () => {
          setIsConnected(false);
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(connectWebSocket, 2000 * retryCount);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setIsConnected(false);
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
      }
    };

    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [symbol, onPriceUpdate]);

  // Canvas chart drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || priceData.length < 2) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const chartWidth = rect.width;
    const chartHeight = rect.height;
    const padding = 20;

    // Calculate price range
    const prices = priceData.map(d => d.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    // Draw grid
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (i * (chartHeight - 2 * padding)) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(chartWidth - padding, y);
      ctx.stroke();
    }

    // Vertical grid lines
    for (let i = 0; i <= 8; i++) {
      const x = padding + (i * (chartWidth - 2 * padding)) / 8;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, chartHeight - padding);
      ctx.stroke();
    }

    // Draw price line
    if (priceData.length > 1) {
      ctx.strokeStyle = priceChange >= 0 ? '#00ff88' : '#ff4757';
      ctx.lineWidth = 2;
      ctx.beginPath();

      priceData.forEach((point, index) => {
        const x = padding + ((index / (priceData.length - 1)) * (chartWidth - 2 * padding));
        const y = chartHeight - padding - ((point.price - minPrice) / priceRange) * (chartHeight - 2 * padding);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw fill area
      ctx.fillStyle = priceChange >= 0 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 71, 87, 0.1)';
      ctx.lineTo(chartWidth - padding, chartHeight - padding);
      ctx.lineTo(padding, chartHeight - padding);
      ctx.closePath();
      ctx.fill();
    }

    // Draw current price line
    if (currentPrice && priceData.length > 0) {
      const y = chartHeight - padding - ((currentPrice - minPrice) / priceRange) * (chartHeight - 2 * padding);
      
      ctx.strokeStyle = priceChange >= 0 ? '#00ff88' : '#ff4757';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(chartWidth - padding, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price label
      ctx.fillStyle = priceChange >= 0 ? '#00ff88' : '#ff4757';
      ctx.fillRect(chartWidth - 80, y - 10, 75, 20);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.fillText(`$${currentPrice.toFixed(2)}`, chartWidth - 75, y + 3);
    }

  }, [priceData, currentPrice, priceChange]);

  return (
    <div className="bg-gray-900 text-white h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              ₿
            </div>
            <h2 className="text-xl font-bold">{symbol}</h2>
            <span className="text-gray-400">USDT</span>
          </div>
          
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-400">
              {isConnected ? 'connected' : 'disconnected'}
            </span>
            <span className="text-sm bg-green-600 px-2 py-1 rounded">Live</span>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex space-x-1">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                timeframe === tf.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Info */}
      <div className="flex items-center justify-between p-4 bg-gray-850">
        <div className="flex items-center space-x-6">
          <div>
            <p className="text-gray-400 text-sm">Current Price</p>
            <p className="text-2xl font-bold">${currentPrice.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-gray-400 text-sm">24h Change</p>
            <p className={`text-lg font-semibold ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
            </p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">24h High</p>
            <p className="text-lg">${high24h.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">24h Low</p>
            <p className="text-lg">${low24h.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-gray-400 text-sm">Volume</p>
            <p className="text-lg">{(volume / 1000000).toFixed(2)}M</p>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 relative bg-gray-900">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
        
        {/* Loading Overlay */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
            />
            <span className="ml-3 text-gray-400">Connecting to live data...</span>
          </div>
        )}
      </div>

      {/* Chart Controls */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
              📊
            </button>
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
              📈
            </button>
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
              📉
            </button>
            <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
              ⚙️
            </button>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>Last updated:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTradingChart;
