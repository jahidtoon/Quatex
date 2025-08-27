"use client";
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { getRealTimePrice, getHistoricalData } from '../../lib/twelveDataService';
import { getCryptoPrice, getCryptoHistorical } from '../../lib/coinGeckoService';

const LiveTradingChart = ({ onPriceUpdate, onAssetChange }) => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(115000);
  const priceRef = useRef(115000);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState('1m');
  const [selectedAsset, setSelectedAsset] = useState('AAPL');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('stocks');

  // Asset categories
  const assetCategories = {
    stocks: [
      { symbol: 'AAPL', name: 'Apple Inc', payout: '85%', type: 'stock' },
      { symbol: 'GOOGL', name: 'Google', payout: '82%', type: 'stock' },
      { symbol: 'MSFT', name: 'Microsoft', payout: '84%', type: 'stock' },
      { symbol: 'TSLA', name: 'Tesla', payout: '86%', type: 'stock' },
      { symbol: 'AMZN', name: 'Amazon', payout: '83%', type: 'stock' },
      { symbol: 'META', name: 'Meta', payout: '81%', type: 'stock' }
    ],
    forex: [
      { symbol: 'EUR/USD', name: 'Euro/USD', payout: '78%', type: 'forex' },
      { symbol: 'GBP/USD', name: 'Pound/USD', payout: '79%', type: 'forex' },
      { symbol: 'USD/JPY', name: 'USD/Yen', payout: '77%', type: 'forex' },
      { symbol: 'AUD/USD', name: 'Aussie/USD', payout: '76%', type: 'forex' },
      { symbol: 'USD/CAD', name: 'USD/CAD', payout: '75%', type: 'forex' },
      { symbol: 'NZD/USD', name: 'Kiwi/USD', payout: '74%', type: 'forex' }
    ],
    crypto: [
      { symbol: 'BTC/USD', name: 'Bitcoin', payout: '88%', type: 'crypto' },
      { symbol: 'ETH/USD', name: 'Ethereum', payout: '87%', type: 'crypto' },
      { symbol: 'BNB/USD', name: 'Binance Coin', payout: '85%', type: 'crypto' },
      { symbol: 'ADA/USD', name: 'Cardano', payout: '84%', type: 'crypto' },
      { symbol: 'SOL/USD', name: 'Solana', payout: '86%', type: 'crypto' },
      { symbol: 'DOT/USD', name: 'Polkadot', payout: '83%', type: 'crypto' }
    ]
  };

  const currentAssets = assetCategories[selectedCategory];

  // Update parent components when price or asset changes
  useEffect(() => {
    if (onPriceUpdate) onPriceUpdate(currentPrice);
  }, [currentPrice, onPriceUpdate]);

  useEffect(() => {
    if (onAssetChange) onAssetChange(selectedAsset);
  }, [selectedAsset, onAssetChange]);

  // Auto-select first asset when category changes
  useEffect(() => {
    if (currentAssets.length > 0 && !currentAssets.find(a => a.symbol === selectedAsset)) {
      setSelectedAsset(currentAssets[0].symbol);
    }
  }, [selectedCategory, currentAssets, selectedAsset]);

  // Helper: is current selection a crypto asset?
  const isCrypto = () => assetCategories.crypto.some(a => a.symbol === selectedAsset);

  // Simple local fallback generator to avoid blank chart when API fails
  const genFallback = () => {
    const out = [];
    const base = Math.random() * 100 + 50;
    const now = Date.now();
    for (let i = 49; i >= 0; i--) {
      const t = now - i * 60000;
      const open = base + (Math.random() - 0.5) * 2;
      const close = open + (Math.random() - 0.5) * 2;
      const high = Math.max(open, close) + Math.random() * 1.5;
      const low = Math.min(open, close) - Math.random() * 1.5;
      out.push({ time: t, open, high, low, close, volume: Math.random() * 500 });
    }
    return out;
  };

  // Load initial data and start real-time updates
  useEffect(() => {
    let priceInterval;
    
    const loadInitialData = async () => {
      setLoading(true);
      try {
        if (isCrypto()) {
          let historical = await getCryptoHistorical(selectedAsset, 1, 'usd');
          if (!historical || historical.length === 0) historical = genFallback();
          setData(historical);
          const priceData = await getCryptoPrice(selectedAsset, 'usd');
          const p = Number(priceData.price);
          priceRef.current = isFinite(p) ? p : historical[historical.length - 1]?.close ?? priceRef.current;
          setCurrentPrice(priceRef.current);
        } else {
          // stocks/forex via Twelve Data
          const historical = await getHistoricalData(selectedAsset, '1min', 50);
          setData(historical);
          const priceData = await getRealTimePrice(selectedAsset);
          const p = Number(priceData.price);
          priceRef.current = isFinite(p) ? p : historical[historical.length - 1]?.close ?? priceRef.current;
          setCurrentPrice(priceRef.current);
        }
        setIsConnected(true);
      } catch (error) {
        console.error('Error loading data:', error);
        // Keep chart usable with fallback
        const fb = genFallback();
        setData(fb);
        priceRef.current = fb[fb.length - 1]?.close ?? priceRef.current;
        setCurrentPrice(priceRef.current);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    const updateRealTimePrice = async () => {
      try {
        const priceData = isCrypto()
          ? await getCryptoPrice(selectedAsset, 'usd')
          : await getRealTimePrice(selectedAsset);
        const p = Number(priceData.price);
        priceRef.current = isFinite(p) ? p : priceRef.current;
        setCurrentPrice(priceRef.current);
        
        // Add new candle every minute
        const now = new Date();
        if (now.getSeconds() === 0) { // Update at the start of each minute
          const newCandle = {
            time: now.getTime(),
            open: priceRef.current,
            high: Math.max(priceRef.current, priceRef.current),
            low: Math.min(priceRef.current, priceRef.current),
            close: priceRef.current,
            volume: Math.random() * 1000 + 500
          };
          
          setData(prevData => {
            const newData = [...prevData, newCandle];
            return newData.slice(-50); // Keep only last 50 candles
          });
        }
        
        setIsConnected(true);
      } catch (error) {
        console.error('Error updating price:', error);
        setIsConnected(false);
      }
    };

  loadInitialData();
    
    // Update price every 30 seconds
  priceInterval = setInterval(updateRealTimePrice, 30000);

    return () => {
      if (priceInterval) clearInterval(priceInterval);
    };
  }, [selectedAsset]);

  // D3.js Chart Rendering
  useEffect(() => {
    if (!data.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 60, bottom: 40, left: 60 };
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => new Date(d.time)))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.high))
      .nice()
      .range([height, 0]);

    // Grid lines
    g.selectAll(".grid-line-x")
      .data(xScale.ticks(10))
      .enter()
      .append("line")
      .attr("class", "grid-line-x")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 0.5);

    g.selectAll(".grid-line-y")
      .data(yScale.ticks(10))
      .enter()
      .append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#1e293b")
      .attr("stroke-width", 0.5);

    // Candlesticks
    data.forEach((d, i) => {
      const x = xScale(new Date(d.time));
      const candleWidth = 8;
      
      const isGreen = d.close > d.open;
      const color = isGreen ? "#10b981" : "#ef4444";
      
      // Wick
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", yScale(d.high))
        .attr("y2", yScale(d.low))
        .attr("stroke", color)
        .attr("stroke-width", 1);
      
      // Body
      g.append("rect")
        .attr("x", x - candleWidth / 2)
        .attr("y", yScale(Math.max(d.open, d.close)))
        .attr("width", candleWidth)
        .attr("height", Math.abs(yScale(d.open) - yScale(d.close)))
        .attr("fill", color);
    });

    // Price line (current price)
    g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(currentPrice))
      .attr("y2", yScale(currentPrice))
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5");

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%H:%M")))
      .attr("color", "#94a3b8");

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d.toLocaleString()}`))
      .attr("color", "#94a3b8");

  }, [data, currentPrice]);

  const timeframes = ['1m', '5m', '15m', '30m', '1h', '4h'];

  if (loading) {
    return (
      <div className="w-full bg-[#0f172a] text-white flex flex-col h-full items-center justify-center">
        <div className="text-xl text-slate-400">Loading market data...</div>
        <div className="mt-2 text-sm text-slate-500">Connecting to Twelve Data API</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[#0f172a] text-white flex flex-col h-full">
      {/* Category Dropdowns above chart */}
      <div className="flex flex-wrap items-center gap-4 p-4 border-b border-slate-700">
        {/* Stocks dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Stocks</label>
          <select
            className="bg-slate-800 text-white border border-slate-600 rounded px-3 py-2 text-sm"
            value={selectedCategory === 'stocks' ? selectedAsset : ''}
            onChange={(e) => { setSelectedCategory('stocks'); setSelectedAsset(e.target.value); }}
          >
            <option value="" disabled>Select stock</option>
            {assetCategories.stocks.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.name} ({a.symbol})</option>
            ))}
          </select>
        </div>
        {/* Forex dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Forex</label>
          <select
            className="bg-slate-800 text-white border border-slate-600 rounded px-3 py-2 text-sm"
            value={selectedCategory === 'forex' ? selectedAsset : ''}
            onChange={(e) => { setSelectedCategory('forex'); setSelectedAsset(e.target.value); }}
          >
            <option value="" disabled>Select forex</option>
            {assetCategories.forex.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
            ))}
          </select>
        </div>
        {/* Crypto dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-300">Crypto</label>
          <select
            className="bg-slate-800 text-white border border-slate-600 rounded px-3 py-2 text-sm"
            value={selectedCategory === 'crypto' ? selectedAsset : ''}
            onChange={(e) => { setSelectedCategory('crypto'); setSelectedAsset(e.target.value); }}
          >
            <option value="" disabled>Select crypto</option>
            {assetCategories.crypto.map(a => (
              <option key={a.symbol} value={a.symbol}>{a.symbol}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Current category assets as small pills */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 overflow-x-auto">
        {currentAssets.map(asset => (
          <button
            key={asset.symbol}
            onClick={() => setSelectedAsset(asset.symbol)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
              selectedAsset === asset.symbol 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {asset.symbol}
          </button>
        ))}
      </div>

      {/* Top Controls */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold text-white">
            {currentAssets.find(a => a.symbol === selectedAsset)?.name} 
            <span className="text-slate-400 text-sm ml-2">({selectedAsset})</span>
          </div>
          
          <div className="flex gap-1">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => setSelectedTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium ${
                  selectedTimeframe === tf 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            {isConnected ? 'Live Market Data' : 'Disconnected'}
          </div>
          <div className="text-2xl font-bold text-green-400">
            ${isFinite(Number(currentPrice)) ? Number(currentPrice).toLocaleString() : (data[data.length-1]?.close?.toFixed(2) || '--')}
          </div>
        </div>
      </div>

      {/* Main Chart - Full size */}
      <div className="flex-1 p-4">
        <svg ref={svgRef} className="w-full h-full min-h-[500px]"></svg>
      </div>
    </div>
  );
};

export default LiveTradingChart;
