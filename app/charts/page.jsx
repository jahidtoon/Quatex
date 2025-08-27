'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import TradingInterface from './components/TradingInterface';

export default function ChartsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(0);
  const [high24h, setHigh24h] = useState(0);
  const [low24h, setLow24h] = useState(0);
  const [volume, setVolume] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [timeframe, setTimeframe] = useState('1m');
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMode, setConnectionMode] = useState('connecting'); // 'websocket', 'fallback', 'connecting'
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const chartRef = useRef(null);
  const wsRef = useRef(null);

  const cryptoPairs = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿' },
    { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ' },
    { symbol: 'BNBUSDT', name: 'BNB', icon: 'BNB' },
    { symbol: 'ADAUSDT', name: 'Cardano', icon: 'ADA' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð' },
    { symbol: 'XRPUSDT', name: 'Ripple', icon: 'XRP' },
    { symbol: 'SOLUSDT', name: 'Solana', icon: 'SOL' },
    { symbol: 'DOTUSDT', name: 'Polkadot', icon: 'DOT' }
  ];

  const timeframes = [
    { value: '1m', label: '1M' },
    { value: '5m', label: '5M' },
    { value: '15m', label: '15M' },
    { value: '1h', label: '1H' },
    { value: '4h', label: '4H' },
    { value: '1d', label: '1D' }
  ];

  // WebSocket connection for real-time data with fallback
  useEffect(() => {
    let reconnectTimer;
    let retryCount = 0;
    let fallbackTimer;
    const maxRetries = 3;

    // Fallback API polling function
    const fallbackDataFetch = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedSymbol}`);
        if (response.ok) {
          const data = await response.json();
          const price = parseFloat(data.lastPrice);
          const change = parseFloat(data.priceChangePercent);
          const high = parseFloat(data.highPrice);
          const low = parseFloat(data.lowPrice);
          const vol = parseFloat(data.volume);
          
          setCurrentPrice(price);
          setPriceChange(change);
          setHigh24h(high);
          setLow24h(low);
          setVolume(vol);
          setLastUpdateTime(new Date());
          
          console.log('📊 Using fallback API data for', selectedSymbol);
        }
      } catch (error) {
        console.error('Fallback API error:', error);
      }
    };

    const connectWebSocket = () => {
      try {
        console.log(`🔄 Connecting to live data for ${selectedSymbol}...`);
        setConnectionMode('connecting');
        
        // Clear any existing fallback timer
        if (fallbackTimer) {
          clearInterval(fallbackTimer);
          fallbackTimer = null;
        }
        
        const wsUrl = `wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@ticker`;
        const ws = new WebSocket(wsUrl);
        
        // Set connection timeout
        const connectionTimeout = setTimeout(() => {
          if (ws.readyState === WebSocket.CONNECTING) {
            console.log('⏰ WebSocket connection timeout, using fallback...');
            ws.close();
            startFallbackMode();
          }
        }, 5000); // Reduced timeout to 5 seconds

        ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log('✅ Live WebSocket connected for', selectedSymbol);
          setIsConnected(true);
          setConnectionMode('websocket');
          retryCount = 0;
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const price = parseFloat(data.c);
            const change = parseFloat(data.P);
            const high = parseFloat(data.h);
            const low = parseFloat(data.l);
            const vol = parseFloat(data.v);
            
            setCurrentPrice(price);
            setPriceChange(change);
            setHigh24h(high);
            setLow24h(low);
            setVolume(vol);
            setLastUpdateTime(new Date());
            
          } catch (error) {
            console.error('Error parsing WebSocket data:', error);
          }
        };

        ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log('🔌 WebSocket disconnected, code:', event.code);
          setIsConnected(false);
          
          if (retryCount < maxRetries) {
            retryCount++;
            const delay = 2000 * retryCount; // 2s, 4s, 6s
            console.log(`⏳ Reconnecting in ${delay}ms... (attempt ${retryCount}/${maxRetries})`);
            reconnectTimer = setTimeout(connectWebSocket, delay);
          } else {
            console.log('🔄 Max WebSocket retries reached, switching to fallback API...');
            startFallbackMode();
          }
        };

        ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error('❌ WebSocket error:', error);
          setIsConnected(false);
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        startFallbackMode();
      }
    };

    const startFallbackMode = () => {
      console.log('🔄 Starting fallback API mode...');
      setIsConnected(true); // Still consider it "connected" via fallback
      setConnectionMode('fallback');
      
      // Initial fetch
      fallbackDataFetch();
      
      // Poll every 3 seconds
      fallbackTimer = setInterval(fallbackDataFetch, 3000);
    };

    // Start connection immediately
    connectWebSocket();

    return () => {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
      }
      if (fallbackTimer) {
        clearInterval(fallbackTimer);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedSymbol]); // Remove chartData dependency

  // Fetch historical data for chart with retry mechanism
  useEffect(() => {
    const fetchChartData = async (retryCount = 0) => {
      try {
        console.log(`📈 Fetching chart data for ${selectedSymbol} (${timeframe})...`);
        
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${selectedSymbol}&interval=${timeframe}&limit=100`,
          {
            headers: {
              'Accept': 'application/json',
            },
            cache: 'no-cache'
          }
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error('Invalid or empty data received');
        }
        
        const formattedData = data.map(item => ({
          time: item[0],
          open: parseFloat(item[1]),
          high: parseFloat(item[2]),
          low: parseFloat(item[3]),
          close: parseFloat(item[4]),
          volume: parseFloat(item[5])
        }));
        
        setChartData(formattedData);
        drawChart(formattedData);
        console.log('✅ Chart data loaded successfully');
        
      } catch (error) {
        console.error('Error fetching chart data:', error);
        
        // Retry up to 3 times
        if (retryCount < 3) {
          console.log(`🔄 Retrying chart data fetch... (${retryCount + 1}/3)`);
          setTimeout(() => fetchChartData(retryCount + 1), 2000 * (retryCount + 1));
        } else {
          console.log('❌ Failed to fetch chart data after 3 attempts');
          // Generate dummy data as fallback
          const dummyData = [];
          const basePrice = 50000;
          for (let i = 0; i < 100; i++) {
            const price = basePrice + (Math.random() - 0.5) * 1000;
            dummyData.push({
              time: Date.now() - (100 - i) * 60000,
              open: price,
              high: price + Math.random() * 100,
              low: price - Math.random() * 100,
              close: price,
              volume: Math.random() * 1000000
            });
          }
          setChartData(dummyData);
          drawChart(dummyData);
        }
      }
    };

    fetchChartData();
  }, [selectedSymbol, timeframe]);

  // Draw chart using Canvas
  const drawChart = (data) => {
    const canvas = chartRef.current;
    if (!canvas || !data.length) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Set background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Calculate scales - Always center around current price
    const prices = data.map(d => d.close);
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);
    
    // If we have current price, center the chart around it
    if (currentPrice) {
      const dataRange = maxPrice - minPrice;
      const buffer = Math.max(dataRange * 0.1, currentPrice * 0.002); // Add 10% buffer or 0.2% of current price
      
      // Center the range around current price
      const centerY = height / 2;
      const halfRange = Math.max(dataRange / 2, buffer);
      
      minPrice = currentPrice - halfRange;
      maxPrice = currentPrice + halfRange;
    }
    
    const priceRange = maxPrice - minPrice || 1;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Draw grid
    ctx.strokeStyle = '#2a2a40';
    ctx.lineWidth = 1;
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding);
      ctx.lineTo(x, height - padding);
      ctx.stroke();
    }
    
    // Draw price line
    ctx.strokeStyle = priceChange >= 0 ? '#00ff88' : '#ff4757';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    data.forEach((point, index) => {
      const x = padding + (chartWidth / (data.length - 1)) * index;
      const y = height - padding - ((point.close - minPrice) / priceRange) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Fill area under the line
    ctx.fillStyle = priceChange >= 0 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 71, 87, 0.1)';
    ctx.lineTo(width - padding, height - padding);
    ctx.lineTo(padding, height - padding);
    ctx.closePath();
    ctx.fill();
    
    // Draw current price line - Always in center
    if (currentPrice) {
      const currentY = height / 2; // Always center the current price line
      
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(padding, currentY);
      ctx.lineTo(width - padding, currentY);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Price label with background
      const labelText = `$${currentPrice.toFixed(2)}`;
      ctx.font = 'bold 12px Arial';
      const textWidth = ctx.measureText(labelText).width;
      
      // Background for price label
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(width - padding - textWidth - 10, currentY - 12, textWidth + 8, 20);
      
      // Price text
      ctx.fillStyle = 'white';
      ctx.textAlign = 'right';
      ctx.fillText(labelText, width - padding - 6, currentY + 3);
    }
    
    // Draw price labels on the right
    ctx.fillStyle = '#888';
    ctx.font = '11px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
      const price = minPrice + (priceRange / 5) * (5 - i);
      const y = padding + (chartHeight / 5) * i;
      ctx.fillText(`$${price.toFixed(2)}`, width - 10, y + 4);
    }
  };

  // Resize canvas
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      if (chartData.length > 0) {
        drawChart(chartData);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [chartData]);

  const selectedPair = cryptoPairs.find(pair => pair.symbol === selectedSymbol);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Price Info */}
            <div className="flex items-center space-x-6">
              <div>
                <h2 className="text-xl font-bold">Current Price</h2>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-mono">
                    ${currentPrice ? currentPrice.toFixed(2) : '0.00'}
                  </span>
                  <span className={`text-sm font-medium ${
                    priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                  </span>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">24h High</p>
                <p className="text-lg font-mono text-green-400">
                  ${high24h ? high24h.toFixed(2) : '0.00'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">24h Low</p>
                <p className="text-lg font-mono text-red-400">
                  ${low24h ? low24h.toFixed(2) : '0.00'}
                </p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400">Volume</p>
                <p className="text-lg font-mono">
                  {volume ? (volume / 1000000).toFixed(2) + 'M' : '0.00M'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className={`flex items-center space-x-2 ${
              isConnected ? 'text-green-400' : 'text-red-400'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'
              }`}></div>
              <span className="text-sm">
                {connectionMode === 'websocket' && 'WebSocket Connected'}
                {connectionMode === 'fallback' && 'API Fallback Mode'}
                {connectionMode === 'connecting' && 'Connecting...'}
              </span>
            </div>
            <span className={`font-bold ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
              {isConnected ? 'Live' : 'Connecting'}
            </span>
            {lastUpdateTime && (
              <span className="text-xs text-gray-400">
                Updated: {lastUpdateTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col">
          {/* Crypto Pairs */}
          <div className="bg-gray-800 border-b border-gray-700 p-3">
            <div className="flex items-center space-x-2 overflow-x-auto">
              {cryptoPairs.map((pair) => (
                <motion.button
                  key={pair.symbol}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedSymbol(pair.symbol)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    selectedSymbol === pair.symbol
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <span>{pair.icon}</span>
                  <span>{pair.name}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Timeframe Selector */}
          <div className="bg-gray-800 border-b border-gray-700 p-3">
            <div className="flex items-center space-x-2">
              {timeframes.map((tf) => (
                <motion.button
                  key={tf.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                    timeframe === tf.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {tf.label}
                </motion.button>
              ))}
              
              {/* Chart Tools */}
              <div className="flex items-center space-x-2 ml-auto">
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                  📊
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                  📈
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                  ⚙️
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                  #
                </button>
                <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors">
                  📋
                </button>
              </div>
            </div>
          </div>

          {/* Chart Canvas */}
          <div className="flex-1 relative bg-gray-900">
            <canvas
              ref={chartRef}
              className="w-full h-full"
              style={{ display: 'block' }}
            />
            
            {/* Loading overlay */}
            {!chartData.length && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-400">Loading chart data...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Trading Panel */}
        <div className="w-80 bg-gray-800 border-l border-gray-700">
          <TradingInterface 
            selectedSymbol={selectedSymbol}
            currentPrice={currentPrice}
            priceChange={priceChange}
          />
        </div>
      </div>
    </div>
  );
}
