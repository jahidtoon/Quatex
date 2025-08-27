'use client';

import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function LiveCryptoChart({ symbol, displayName, isFullscreen }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [candlestickData, setCandlestickData] = useState([]);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState({ change: 0, changePercent: 0 });
  const [timeframe, setTimeframe] = useState('1m');
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState([]);

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
        const limit = timeframe === '1m' ? 100 : timeframe === '5m' ? 100 : 50;
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
    const margin = { top: 20, right: 60, bottom: 80, left: 60 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom - 100; // Space for volume

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(candlestickData, d => d.time))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain(d3.extent(candlestickData, d => d.high))
      .range([height, 0]);

    const volumeScale = d3.scaleLinear()
      .domain([0, d3.max(volume, d => d.volume)])
      .range([height + 60, height + 20]);

    // Create main group
    const g = svg
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 100)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Grid lines
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickSize(-height)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#444");

    g.append("g")
      .attr("class", "grid")
      .call(d3.axisLeft(yScale)
        .tickSize(-width)
        .tickFormat("")
      )
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3)
      .style("stroke", "#444");

    // Candlesticks
    const candleWidth = Math.max(2, width / candlestickData.length * 0.8);

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
        .attr("height", Math.abs(yScale(d.open) - yScale(d.close)))
        .attr("fill", isGreen ? "#26a69a" : "#ef5350")
        .attr("stroke", isGreen ? "#26a69a" : "#ef5350");
    });

    // Volume bars
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

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale)
        .tickFormat(d3.timeFormat("%H:%M"))
      )
      .style("color", "#9ca3af");

    g.append("g")
      .call(d3.axisLeft(yScale)
        .tickFormat(d => d.toFixed(4))
      )
      .style("color", "#9ca3af");

    // Volume label
    g.append("text")
      .attr("x", 0)
      .attr("y", height + 40)
      .text("Volume")
      .attr("fill", "#9ca3af")
      .attr("font-size", "12px");

  }, [candlestickData, volume, currentPrice, timeframe]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Trigger re-render on resize
      setCandlestickData(prev => [...prev]);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

      {/* Chart */}
      <div 
        ref={containerRef} 
        className="flex-1 relative overflow-hidden"
        style={{ minHeight: isFullscreen ? '80vh' : '400px' }}
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
