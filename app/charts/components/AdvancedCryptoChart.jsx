'use client';

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

// Simple Moving Average calculation
const calculateSMA = (data, period) => {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
    sma.push({
      time: data[i].time,
      value: sum / period
    });
  }
  return sma;
};

// RSI calculation
const calculateRSI = (data, period = 14) => {
  const rsi = [];
  let gains = 0, losses = 0;

  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) gains += change;
    else losses += Math.abs(change);
  }

  gains /= period;
  losses /= period;

  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) {
      gains = (gains * (period - 1) + change) / period;
      losses = (losses * (period - 1)) / period;
    } else {
      gains = (gains * (period - 1)) / period;
      losses = (losses * (period - 1) + Math.abs(change)) / period;
    }

    const rs = gains / losses;
    const rsiValue = 100 - (100 / (1 + rs));
    
    rsi.push({
      time: data[i].time,
      value: rsiValue
    });
  }

  return rsi;
};

export default function AdvancedCryptoChart({ symbol, displayName, isFullscreen }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [candlestickData, setCandlestickData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState({ change: 0, changePercent: 0 });
  const [timeframe, setTimeframe] = useState('1m');
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState([]);
  const [showIndicators, setShowIndicators] = useState({
    sma20: true,
    sma50: false,
    rsi: true,
    volume: true
  });
  const [indicators, setIndicators] = useState({
    sma20: [],
    sma50: [],
    rsi: []
  });

  // WebSocket connection for real-time prices
  useEffect(() => {
    if (!symbol) return;

    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setCurrentPrice(parseFloat(data.c));
      setPriceChange({
        change: parseFloat(data.P),
        changePercent: parseFloat(data.p)
      });
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  // Fetch historical candlestick data
  useEffect(() => {
    if (!symbol) return;
    
    const fetchKlineData = async () => {
      setIsLoading(true);
      try {
        const limit = timeframe === '1m' ? 200 : timeframe === '5m' ? 200 : 100;
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=${limit}`
        );
        const data = await response.json();
        
        const formattedData = data.map(candle => ({
          time: new Date(candle[0]),
          open: parseFloat(candle[1]),
          high: parseFloat(candle[2]),
          low: parseFloat(candle[3]),
          close: parseFloat(candle[4]),
          volume: parseFloat(candle[5])
        }));
        
        setCandlestickData(formattedData);
        setVolume(formattedData.map(d => ({ time: d.time, volume: d.volume })));
        
        // Calculate indicators
        if (formattedData.length > 50) {
          setIndicators({
            sma20: calculateSMA(formattedData, 20),
            sma50: calculateSMA(formattedData, 50),
            rsi: calculateRSI(formattedData, 14)
          });
        }
      } catch (error) {
        console.error('Error fetching kline data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchKlineData();
    const interval = setInterval(fetchKlineData, timeframe === '1m' ? 10000 : 30000);
    
    return () => clearInterval(interval);
  }, [symbol, timeframe]);

  // D3 Chart rendering
  useEffect(() => {
    if (!candlestickData.length || !svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const container = containerRef.current;
    const margin = { top: 20, right: 80, bottom: showIndicators.rsi ? 180 : 100, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const mainHeight = container.clientHeight - margin.top - margin.bottom - (showIndicators.volume ? 80 : 0) - (showIndicators.rsi ? 100 : 0);
    const volumeHeight = showIndicators.volume ? 60 : 0;
    const rsiHeight = showIndicators.rsi ? 80 : 0;

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(candlestickData, d => d.time))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(candlestickData, d => d.high))
      .range([mainHeight, 0]);

    const volumeScale = d3.scaleLinear()
      .domain([0, d3.max(volume, d => d.volume)])
      .range([mainHeight + volumeHeight + 20, mainHeight + 20]);

    const rsiScale = d3.scaleLinear()
      .domain([0, 100])
      .range([mainHeight + volumeHeight + rsiHeight + 40, mainHeight + volumeHeight + 40]);

    // Create main group
    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", container.clientHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid lines for main chart
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${mainHeight})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-mainHeight)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2)
      .style("stroke", "#444");

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.2)
      .style("stroke", "#444");

    // Candlesticks
    const candleWidth = Math.max(1, width / candlestickData.length * 0.7);

    candlestickData.forEach(d => {
      const x = xScale(d.time);
      const isGreen = d.close > d.open;
      
      // High-low line
      g.append("line")
        .attr("x1", x)
        .attr("x2", x)
        .attr("y1", yScale(d.high))
        .attr("y2", yScale(d.low))
        .attr("stroke", isGreen ? "#26a69a" : "#ef5350")
        .attr("stroke-width", 1);

      // Body
      g.append("rect")
        .attr("x", x - candleWidth / 2)
        .attr("y", yScale(Math.max(d.open, d.close)))
        .attr("width", candleWidth)
        .attr("height", Math.max(1, Math.abs(yScale(d.open) - yScale(d.close))))
        .attr("fill", isGreen ? "#26a69a" : "#ef5350")
        .attr("stroke", isGreen ? "#26a69a" : "#ef5350");
    });

    // Moving averages
    if (showIndicators.sma20 && indicators.sma20.length > 0) {
      const line = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value))
        .curve(d3.curveLinear);

      g.append("path")
        .datum(indicators.sma20)
        .attr("fill", "none")
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 2)
        .attr("d", line);
    }

    if (showIndicators.sma50 && indicators.sma50.length > 0) {
      const line = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.value))
        .curve(d3.curveLinear);

      g.append("path")
        .datum(indicators.sma50)
        .attr("fill", "none")
        .attr("stroke", "#8b5cf6")
        .attr("stroke-width", 2)
        .attr("d", line);
    }

    // Volume bars
    if (showIndicators.volume) {
      volume.forEach(d => {
        const x = xScale(d.time);
        g.append("rect")
          .attr("x", x - candleWidth / 2)
          .attr("y", volumeScale(d.volume))
          .attr("width", candleWidth)
          .attr("height", volumeScale(0) - volumeScale(d.volume))
          .attr("fill", "#64748b")
          .attr("opacity", 0.6);
      });

      // Volume axis
      g.append("g")
        .attr("transform", `translate(0,${mainHeight + volumeHeight + 20})`)
        .call(d3.axisBottom(xScale)
          .tickFormat(d3.timeFormat("%H:%M"))
        )
        .style("color", "#9ca3af");

      g.append("text")
        .attr("x", 0)
        .attr("y", mainHeight + 40)
        .text("Volume")
        .attr("fill", "#9ca3af")
        .attr("font-size", "12px");
    }

    // RSI
    if (showIndicators.rsi && indicators.rsi.length > 0) {
      // RSI background
      g.append("rect")
        .attr("x", 0)
        .attr("y", mainHeight + volumeHeight + 40)
        .attr("width", width)
        .attr("height", rsiHeight)
        .attr("fill", "#1f2937")
        .attr("opacity", 0.5);

      // RSI grid lines
      [30, 50, 70].forEach(level => {
        g.append("line")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", rsiScale(level))
          .attr("y2", rsiScale(level))
          .attr("stroke", level === 50 ? "#6b7280" : "#374151")
          .attr("stroke-dasharray", "2,2")
          .attr("opacity", 0.7);
      });

      // RSI line
      const rsiLine = d3.line()
        .x(d => xScale(d.time))
        .y(d => rsiScale(d.value))
        .curve(d3.curveLinear);

      g.append("path")
        .datum(indicators.rsi)
        .attr("fill", "none")
        .attr("stroke", "#06b6d4")
        .attr("stroke-width", 2)
        .attr("d", rsiLine);

      // RSI axis
      g.append("g")
        .attr("transform", `translate(${width + 5},0)`)
        .call(d3.axisRight(rsiScale)
          .tickValues([30, 50, 70])
        )
        .style("color", "#9ca3af");

      g.append("text")
        .attr("x", 0)
        .attr("y", mainHeight + volumeHeight + 60)
        .text("RSI (14)")
        .attr("fill", "#9ca3af")
        .attr("font-size", "12px");
    }

    // Current price line
    if (currentPrice && yScale.domain()[0] <= currentPrice && currentPrice <= yScale.domain()[1]) {
      g.append("line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", yScale(currentPrice))
        .attr("y2", yScale(currentPrice))
        .attr("stroke", "#fbbf24")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5");

      g.append("text")
        .attr("x", width + 5)
        .attr("y", yScale(currentPrice) + 4)
        .text(currentPrice?.toFixed(4))
        .attr("fill", "#fbbf24")
        .attr("font-size", "12px")
        .attr("font-weight", "bold");
    }

    // Main chart axes
    g.append("g")
      .attr("transform", `translate(0,${mainHeight})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%H:%M"))
      )
      .style("color", "#9ca3af");

    g.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(d => d.toFixed(4))
      )
      .style("color", "#9ca3af");

  }, [candlestickData, volume, indicators, currentPrice, timeframe, showIndicators]);

  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1d', value: '1d' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white">{displayName}</h2>
          {currentPrice && (
            <div className="flex items-center space-x-2">
              <span className="text-lg font-mono text-white">
                ${currentPrice.toFixed(4)}
              </span>
              <span className={`text-sm font-medium ${
                priceChange.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {priceChange.change >= 0 ? '+' : ''}{priceChange.change.toFixed(2)}%
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          {/* Indicators toggle */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={showIndicators.sma20}
                onChange={(e) => setShowIndicators(prev => ({ ...prev, sma20: e.target.checked }))}
                className="rounded"
              />
              <span className="text-xs text-yellow-400">SMA20</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={showIndicators.sma50}
                onChange={(e) => setShowIndicators(prev => ({ ...prev, sma50: e.target.checked }))}
                className="rounded"
              />
              <span className="text-xs text-purple-400">SMA50</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={showIndicators.rsi}
                onChange={(e) => setShowIndicators(prev => ({ ...prev, rsi: e.target.checked }))}
                className="rounded"
              />
              <span className="text-xs text-cyan-400">RSI</span>
            </label>
            <label className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={showIndicators.volume}
                onChange={(e) => setShowIndicators(prev => ({ ...prev, volume: e.target.checked }))}
                className="rounded"
              />
              <span className="text-xs text-gray-400">Volume</span>
            </label>
          </div>

          {/* Timeframe selector */}
          <div className="flex space-x-1 bg-gray-700 rounded-lg p-1">
            {timeframes.map((tf) => (
              <button
                key={tf.value}
                onClick={() => setTimeframe(tf.value)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  timeframe === tf.value
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-600'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div 
        ref={containerRef} 
        className="flex-1 relative overflow-hidden"
        style={{ minHeight: isFullscreen ? '80vh' : '500px' }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <svg ref={svgRef} className="w-full h-full"></svg>
        )}
      </div>

      {/* Chart Info */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {candlestickData.length > 0 && (
          <>
            <div>
              <span className="text-gray-400">Open: </span>
              <span className="text-white font-mono">
                ${candlestickData[candlestickData.length - 1]?.open.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">High: </span>
              <span className="text-green-400 font-mono">
                ${candlestickData[candlestickData.length - 1]?.high.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Low: </span>
              <span className="text-red-400 font-mono">
                ${candlestickData[candlestickData.length - 1]?.low.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Volume: </span>
              <span className="text-white font-mono">
                {candlestickData[candlestickData.length - 1]?.volume.toLocaleString()}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
