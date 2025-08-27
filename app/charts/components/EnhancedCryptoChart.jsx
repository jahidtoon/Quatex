'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as d3 from 'd3';

const EnhancedCryptoChart = () => {
  const svgRef = useRef();
  const containerRef = useRef();
  const tooltipRef = useRef();
  const [data, setData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1m');
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0);
  const [high24h, setHigh24h] = useState(0);
  const [low24h, setLow24h] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [chartType, setChartType] = useState('candlestick');
  const [showVolume, setShowVolume] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [crosshair, setCrosshair] = useState({ x: 0, y: 0, visible: false });
  const [hoveredCandle, setHoveredCandle] = useState(null);

  const symbols = [
    { symbol: 'BTCUSDT', name: 'Bitcoin', icon: '₿', color: '#f7931a' },
    { symbol: 'ETHUSDT', name: 'Ethereum', icon: 'Ξ', color: '#627eea' },
    { symbol: 'BNBUSDT', name: 'BNB', icon: 'BNB', color: '#f3ba2f' },
    { symbol: 'ADAUSDT', name: 'Cardano', icon: 'ADA', color: '#0033ad' },
    { symbol: 'DOGEUSDT', name: 'Dogecoin', icon: 'Ð', color: '#c2a633' },
    { symbol: 'XRPUSDT', name: 'Ripple', icon: 'XRP', color: '#23292f' },
    { symbol: 'SOLUSDT', name: 'Solana', icon: 'SOL', color: '#9945ff' },
    { symbol: 'DOTUSDT', name: 'Polkadot', icon: 'DOT', color: '#e6007a' }
  ];

  const timeframes = [
    { value: '1m', label: '1M', ms: 60000 },
    { value: '5m', label: '5M', ms: 300000 },
    { value: '15m', label: '15M', ms: 900000 },
    { value: '1h', label: '1H', ms: 3600000 },
    { value: '4h', label: '4H', ms: 14400000 },
    { value: '1d', label: '1D', ms: 86400000 }
  ];

  const chartTypes = [
    { value: 'candlestick', label: 'Candlestick', icon: '📊' },
    { value: 'line', label: 'Line', icon: '📈' },
    { value: 'area', label: 'Area', icon: '🏔️' }
  ];

  // WebSocket connection for real-time data
  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connectWebSocket = () => {
      setConnectionStatus('connecting');
      ws = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedSymbol.toLowerCase()}@kline_${timeframe}`);
      
      ws.onopen = () => {
        setConnectionStatus('connected');
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        const kline = message.k;
        
        if (kline) {
          const newCandle = {
            time: new Date(kline.t),
            open: parseFloat(kline.o),
            high: parseFloat(kline.h),
            low: parseFloat(kline.l),
            close: parseFloat(kline.c),
            volume: parseFloat(kline.v)
          };

          setCurrentPrice(newCandle.close);
          
          setData(prevData => {
            const updatedData = [...prevData];
            if (updatedData.length > 0 && 
                updatedData[updatedData.length - 1].time.getTime() === newCandle.time.getTime()) {
              updatedData[updatedData.length - 1] = newCandle;
            } else {
              updatedData.push(newCandle);
              if (updatedData.length > 200) {
                updatedData.shift();
              }
            }
            return updatedData;
          });
        }
      };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        if (autoRefresh) {
          reconnectTimeout = setTimeout(connectWebSocket, 2000);
        }
      };

      ws.onerror = () => {
        setConnectionStatus('error');
      };
    };

    if (autoRefresh) {
      connectWebSocket();
    }

    return () => {
      if (ws) ws.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [selectedSymbol, timeframe, autoRefresh]);

  // Fetch 24h stats
  useEffect(() => {
    const fetch24hStats = async () => {
      try {
        const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${selectedSymbol}`);
        const stats = await response.json();
        
        setHigh24h(parseFloat(stats.highPrice));
        setLow24h(parseFloat(stats.lowPrice));
        setVolume(parseFloat(stats.volume));
        setPriceChange(parseFloat(stats.priceChangePercent));
      } catch (error) {
        console.error('Error fetching 24h stats:', error);
      }
    };

    fetch24hStats();
    const interval = setInterval(fetch24hStats, 30000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Fetch initial historical data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${selectedSymbol}&interval=${timeframe}&limit=200`
        );
        const klines = await response.json();
        
        const formattedData = klines.map(kline => ({
          time: new Date(kline[0]),
          open: parseFloat(kline[1]),
          high: parseFloat(kline[2]),
          low: parseFloat(kline[3]),
          close: parseFloat(kline[4]),
          volume: parseFloat(kline[5])
        }));

        setData(formattedData);
        if (formattedData.length > 0) {
          setCurrentPrice(formattedData[formattedData.length - 1].close);
        }
      } catch (error) {
        console.error('Error fetching historical data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoricalData();
  }, [selectedSymbol, timeframe]);

  // Chart rendering
  const renderChart = useCallback(() => {
    if (!data.length || isLoading) return;

    const container = containerRef.current;
    const svg = d3.select(svgRef.current);
    
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const margin = { top: 20, right: 60, bottom: showVolume ? 120 : 60, left: 60 };
    const width = containerRect.width - margin.left - margin.right;
    const height = containerRect.height - margin.top - margin.bottom;
    const volumeHeight = showVolume ? 80 : 0;
    const chartHeight = height - volumeHeight;

    svg.selectAll("*").remove();
    svg.attr("width", containerRect.width).attr("height", containerRect.height);

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.time))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.high))
      .nice()
      .range([chartHeight, 0]);

    const volumeScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.volume)])
      .range([height, chartHeight + 20]);

    // Grid
    if (showGrid) {
      g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(xScale)
          .tickSize(-chartHeight)
          .tickFormat("")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);

      g.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(yScale)
          .tickSize(-width)
          .tickFormat("")
        )
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.3);
    }

    // Render based on chart type
    if (chartType === 'candlestick') {
      renderCandlestickChart(g, data, xScale, yScale, width, chartHeight);
    } else if (chartType === 'line') {
      renderLineChart(g, data, xScale, yScale);
    } else if (chartType === 'area') {
      renderAreaChart(g, data, xScale, yScale, chartHeight);
    }

    // Volume bars
    if (showVolume) {
      g.selectAll(".volume-bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "volume-bar")
        .attr("x", d => xScale(d.time) - (width / data.length) * 0.3)
        .attr("y", d => volumeScale(d.volume))
        .attr("width", (width / data.length) * 0.6)
        .attr("height", d => height - volumeScale(d.volume))
        .attr("fill", (d, i) => {
          if (i === 0) return "#666";
          return d.close >= d.open ? "#00ff88" : "#ff4444";
        })
        .attr("opacity", 0.6);
    }

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d3.timeFormat("%H:%M")))
      .style("color", "#888");

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => `$${d.toFixed(2)}`))
      .style("color", "#888");

    // Current price line
    const currentPriceLine = g.append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", yScale(currentPrice))
      .attr("y2", yScale(currentPrice))
      .attr("stroke", priceChange >= 0 ? "#00ff88" : "#ff4444")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "5,5")
      .style("opacity", 0.8);

    // Current price label
    g.append("rect")
      .attr("x", width - 80)
      .attr("y", yScale(currentPrice) - 12)
      .attr("width", 80)
      .attr("height", 24)
      .attr("fill", priceChange >= 0 ? "#00ff88" : "#ff4444")
      .attr("rx", 4);

    g.append("text")
      .attr("x", width - 40)
      .attr("y", yScale(currentPrice) + 4)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(`$${currentPrice.toFixed(2)}`);

    // Interactive overlay
    const overlay = g.append("rect")
      .attr("width", width)
      .attr("height", chartHeight)
      .attr("fill", "none")
      .attr("pointer-events", "all");

    overlay.on("mousemove", function(event) {
      const [mouseX, mouseY] = d3.pointer(event);
      const bisectDate = d3.bisector(d => d.time).left;
      const x0 = xScale.invert(mouseX);
      const i = bisectDate(data, x0, 1);
      const d0 = data[i - 1];
      const d1 = data[i];
      const d = x0 - d0?.time > d1?.time - x0 ? d1 : d0;

      if (d) {
        setCrosshair({ x: mouseX, y: mouseY, visible: true });
        setHoveredCandle(d);
      }
    })
    .on("mouseleave", () => {
      setCrosshair({ x: 0, y: 0, visible: false });
      setHoveredCandle(null);
    });

  }, [data, isLoading, chartType, showGrid, showVolume, currentPrice, priceChange]);

  const renderCandlestickChart = (g, data, xScale, yScale, width, chartHeight) => {
    const candleWidth = Math.max(1, (width / data.length) * 0.8);

    g.selectAll(".candle")
      .data(data)
      .enter()
      .append("g")
      .attr("class", "candle")
      .each(function(d) {
        const candle = d3.select(this);
        const x = xScale(d.time);
        const isGreen = d.close >= d.open;

        // Wick
        candle.append("line")
          .attr("x1", x)
          .attr("x2", x)
          .attr("y1", yScale(d.high))
          .attr("y2", yScale(d.low))
          .attr("stroke", isGreen ? "#00ff88" : "#ff4444")
          .attr("stroke-width", 1);

        // Body
        candle.append("rect")
          .attr("x", x - candleWidth / 2)
          .attr("y", yScale(Math.max(d.open, d.close)))
          .attr("width", candleWidth)
          .attr("height", Math.abs(yScale(d.open) - yScale(d.close)))
          .attr("fill", isGreen ? "#00ff88" : "#ff4444")
          .attr("stroke", isGreen ? "#00ff88" : "#ff4444");
      });
  };

  const renderLineChart = (g, data, xScale, yScale) => {
    const line = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.close))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#00ff88")
      .attr("stroke-width", 2)
      .attr("d", line);
  };

  const renderAreaChart = (g, data, xScale, yScale, chartHeight) => {
    const area = d3.area()
      .x(d => xScale(d.time))
      .y0(chartHeight)
      .y1(d => yScale(d.close))
      .curve(d3.curveMonotoneX);

    const gradient = g.append("defs")
      .append("linearGradient")
      .attr("id", "area-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", chartHeight);

    gradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#00ff88")
      .attr("stop-opacity", 0.8);

    gradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#00ff88")
      .attr("stop-opacity", 0);

    g.append("path")
      .datum(data)
      .attr("fill", "url(#area-gradient)")
      .attr("d", area);

    // Line on top
    const line = d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.close))
      .curve(d3.curveMonotoneX);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#00ff88")
      .attr("stroke-width", 2)
      .attr("d", line);
  };

  useEffect(() => {
    renderChart();
    const handleResize = () => setTimeout(renderChart, 100);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderChart]);

  const selectedSymbolData = symbols.find(s => s.symbol === selectedSymbol);

  return (
    <div className={`h-full bg-gray-900 text-white ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        {/* Symbol Info */}
        <div className="flex items-center space-x-4 mb-2 md:mb-0">
          <div className="flex items-center space-x-2">
            <span className="text-2xl" style={{ color: selectedSymbolData?.color }}>
              {selectedSymbolData?.icon}
            </span>
            <div>
              <h2 className="text-xl font-bold">{selectedSymbolData?.name}</h2>
              <p className="text-sm text-gray-400">{selectedSymbol}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold" style={{ color: priceChange >= 0 ? '#00ff88' : '#ff4444' }}>
                ${currentPrice.toFixed(2)}
              </p>
              <p className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
              </p>
            </div>

            <div className="hidden md:flex space-x-4 text-sm">
              <div>
                <p className="text-gray-400">24h High</p>
                <p className="text-green-400">${high24h.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">24h Low</p>
                <p className="text-red-400">${low24h.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-gray-400">Volume</p>
                <p className="text-blue-400">{(volume / 1000000).toFixed(2)}M</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-2">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
              connectionStatus === 'connecting' ? 'bg-yellow-400 animate-spin' :
              'bg-red-400'
            }`}></div>
            <span className="text-xs text-gray-400 hidden md:inline">
              {connectionStatus}
            </span>
          </div>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1 rounded text-xs ${
              autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
            } transition-colors`}
          >
            Live
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {isFullscreen ? '⤊' : '⤢'}
          </button>
        </div>
      </div>

      {/* Symbol Selector */}
      <div className="flex overflow-x-auto p-2 bg-gray-800 border-b border-gray-700 scrollbar-hide">
        {symbols.map((symbol) => (
          <button
            key={symbol.symbol}
            onClick={() => setSelectedSymbol(symbol.symbol)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg mr-2 whitespace-nowrap transition-all ${
              selectedSymbol === symbol.symbol
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span style={{ color: symbol.color }}>{symbol.icon}</span>
            <span className="text-sm">{symbol.name}</span>
          </button>
        ))}
      </div>

      {/* Chart Controls */}
      <div className="flex flex-wrap items-center justify-between p-3 bg-gray-800 border-b border-gray-700">
        {/* Timeframes */}
        <div className="flex space-x-1 mb-2 md:mb-0">
          {timeframes.map((tf) => (
            <button
              key={tf.value}
              onClick={() => setTimeframe(tf.value)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeframe === tf.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart Type & Options */}
        <div className="flex items-center space-x-2">
          {/* Chart Type */}
          <div className="flex space-x-1">
            {chartTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value)}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  chartType === type.value
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                title={type.label}
              >
                {type.icon}
              </button>
            ))}
          </div>

          {/* Options */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`px-2 py-1 rounded text-xs ${
              showGrid ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            } transition-colors`}
            title="Toggle Grid"
          >
            #
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2 py-1 rounded text-xs ${
              showVolume ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300'
            } transition-colors`}
            title="Toggle Volume"
          >
            📊
          </button>
        </div>
      </div>

      {/* Chart Area */}
      <div className="relative flex-1" ref={containerRef}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75 z-10">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-400">Loading chart data...</p>
            </div>
          </div>
        )}

        <svg ref={svgRef} className="w-full h-full"></svg>

        {/* Crosshair */}
        {crosshair.visible && (
          <div className="absolute pointer-events-none">
            <div
              className="absolute border-gray-500 border-dashed"
              style={{
                left: crosshair.x,
                top: 0,
                bottom: 0,
                borderLeftWidth: '1px'
              }}
            />
            <div
              className="absolute border-gray-500 border-dashed"
              style={{
                top: crosshair.y,
                left: 0,
                right: 0,
                borderTopWidth: '1px'
              }}
            />
          </div>
        )}

        {/* Tooltip */}
        {hoveredCandle && (
          <div
            className="absolute bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm z-20 pointer-events-none"
            style={{
              left: crosshair.x + 10,
              top: crosshair.y - 100,
              minWidth: '200px'
            }}
          >
            <div className="space-y-1">
              <p className="text-gray-400">
                {hoveredCandle.time.toLocaleString()}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-gray-400">Open: </span>
                  <span className="text-white">${hoveredCandle.open.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">High: </span>
                  <span className="text-green-400">${hoveredCandle.high.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Low: </span>
                  <span className="text-red-400">${hoveredCandle.low.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-400">Close: </span>
                  <span className="text-white">${hoveredCandle.close.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <span className="text-gray-400">Volume: </span>
                <span className="text-blue-400">{hoveredCandle.volume.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Stats Bar (Mobile) */}
      <div className="md:hidden bg-gray-800 p-3 border-t border-gray-700">
        <div className="flex justify-between text-xs">
          <div>
            <p className="text-gray-400">24h High</p>
            <p className="text-green-400">${high24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400">24h Low</p>
            <p className="text-red-400">${low24h.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-400">Volume</p>
            <p className="text-blue-400">{(volume / 1000000).toFixed(2)}M</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCryptoChart;
