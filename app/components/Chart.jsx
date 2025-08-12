"use client";
import React, { useEffect, useRef, useState, useCallback } from 'react';

// Utility: generate mock candle data (open, high, low, close) for premium look
function generateCandles(count = 150, start = 0.5230) {
  const candles = [];
  let prevClose = start;
  for (let i = 0; i < count; i++) {
    const vol = (Math.random() * 0.00025) + 0.00005; // volatility range
    const dir = Math.random() > 0.48 ? 1 : -1;
    const open = prevClose;
    const close = +(open + dir * vol * (0.3 + Math.random())).toFixed(5);
    const high = +(Math.max(open, close) + Math.random() * vol * 0.4).toFixed(5);
    const low = +(Math.min(open, close) - Math.random() * vol * 0.4).toFixed(5);
    candles.push({ i, open, high, low, close, time: Date.now() - (count - i) * 60000 });
    prevClose = close;
  }
  return candles;
}

const priceFormat = (p) => p.toFixed(5);
const timeFormat = (t) => {
  const d = new Date(t);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Chart = () => {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const [candles, setCandles] = useState(() => generateCandles());
  const [zoom, setZoom] = useState(1); // 1 = base, >1 zoomed in
  const [offset, setOffset] = useState(0); // horizontal pan offset in candles
  const [hover, setHover] = useState(null); // {x,y,candle}
  const [loading, setLoading] = useState(false);
  const [symbol] = useState('AUD/CHF');
  const [timeframe, setTimeframe] = useState('1m');

  // Responsive resize
  const resizeCanvas = useCallback(() => {
    const c = canvasRef.current;
    const o = overlayRef.current;
    if (!c || !o) return;
    const rect = c.parentElement.getBoundingClientRect();
    c.width = rect.width * window.devicePixelRatio;
    c.height = rect.height * window.devicePixelRatio;
    c.style.width = rect.width + 'px';
    c.style.height = rect.height + 'px';
    o.width = c.width; o.height = c.height; o.style.width = c.style.width; o.style.height = c.style.height;
    draw();
  }, [candles, zoom, offset, hover]);

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [resizeCanvas]);

  // Simulate live data
  useEffect(() => {
    const id = setInterval(() => {
      setCandles((prev) => {
        const next = [...prev];
        // Update last candle or add new every 60s bucket
        if (Date.now() - prev[prev.length - 1].time > 60000) {
          return [...prev.slice(-300), ...generateCandles(1, prev[prev.length - 1].close)];
        } else {
          const last = { ...next[next.length - 1] };
          const drift = (Math.random() - 0.5) * 0.0001;
          last.close = +(last.close + drift).toFixed(5);
          last.high = Math.max(last.high, last.close);
          last.low = Math.min(last.low, last.close);
          next[next.length - 1] = last;
          return next;
        }
      });
    }, 2000);
    return () => clearInterval(id);
  }, []);

  const visibleCount = Math.max(30, Math.round(120 / zoom));
  const startIndex = Math.max(0, candles.length - visibleCount - offset);
  const visible = candles.slice(startIndex, startIndex + visibleCount);
  const prices = visible.flatMap(c => [c.high, c.low]);
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const pad = (maxPrice - minPrice) * 0.05;
  const top = maxPrice + pad;
  const bottom = minPrice - pad;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background gradient
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#262a35');
    g.addColorStop(1, '#1e222d');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Grid
    const gridX = 8;
    const gridY = 6;
    ctx.strokeStyle = '#2a2e39';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridX; i++) {
      const x = (i / gridX) * w;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    for (let j = 0; j <= gridY; j++) {
      const y = (j / gridY) * h;
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }

    // Axis labels (price on right)
    ctx.font = `${12 * window.devicePixelRatio}px Inter, sans-serif`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#8f96a3';
    for (let j = 0; j <= gridY; j++) {
      const y = (j / gridY) * h;
      const price = top - (j / gridY) * (top - bottom);
      ctx.fillText(priceFormat(price), w - 4 * window.devicePixelRatio, y);
    }

    // Candles
    const candleW = (w / visible.length) * 0.7;
    visible.forEach((c, idx) => {
      const xCenter = (idx + 0.5) * (w / visible.length);
      const scaleY = (p) => ((top - p) / (top - bottom)) * h;
      const highY = scaleY(c.high);
      const lowY = scaleY(c.low);
      const openY = scaleY(c.open);
      const closeY = scaleY(c.close);
      const bullish = c.close >= c.open;
      ctx.strokeStyle = bullish ? '#26a69a' : '#ef5350';
      ctx.lineWidth = 1 * window.devicePixelRatio;
      // Wick
      ctx.beginPath();
      ctx.moveTo(xCenter, highY);
      ctx.lineTo(xCenter, lowY);
      ctx.stroke();
      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(openY - closeY));
      ctx.fillStyle = bullish ? '#26a69a' : '#ef5350';
      ctx.globalAlpha = 0.9;
      ctx.fillRect(xCenter - candleW / 2, bodyTop, candleW, bodyH);
      ctx.globalAlpha = 1;
    });

    // Current price line (last candle close)
    if (visible.length) {
      const last = visible[visible.length - 1];
      const y = ((top - last.close) / (top - bottom)) * h;
      ctx.strokeStyle = '#3b82f6';
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      // Price tag
      ctx.fillStyle = '#3b82f6';
      const tag = priceFormat(last.close);
      const padX = 6 * window.devicePixelRatio;
      const padY = 3 * window.devicePixelRatio;
      const tw = ctx.measureText(tag).width + padX * 2;
      const th = 16 * window.devicePixelRatio;
      ctx.fillRect(w - tw, y - th / 2, tw, th);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(tag, w - tw / 2, y);
    }

    // Hover crosshair drawn on overlay to avoid re-render candles
  }, [visible, top, bottom]);

  useEffect(() => { draw(); }, [draw]);

  // Overlay drawing (crosshair + tooltip)
  const drawOverlay = useCallback((pos) => {
    const overlay = overlayRef.current;
    const canvas = canvasRef.current;
    if (!overlay || !canvas) return;
    const ctx = overlay.getContext('2d');
    overlay.width = canvas.width; overlay.height = canvas.height; // ensure same size for crispness
    ctx.clearRect(0, 0, overlay.width, overlay.height);
    if (!pos) return;
    const { x, y, candle } = pos;
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 1 * window.devicePixelRatio;
    ctx.setLineDash([4 * window.devicePixelRatio, 4 * window.devicePixelRatio]);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, overlay.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(overlay.width, y); ctx.stroke();
    ctx.setLineDash([]);
    if (candle) {
      const boxW = 140 * window.devicePixelRatio;
      const boxH = 80 * window.devicePixelRatio;
      const bx = x + 12 * window.devicePixelRatio + boxW > overlay.width ? x - 12 * window.devicePixelRatio - boxW : x + 12 * window.devicePixelRatio;
      const by = y - boxH / 2 < 0 ? 8 * window.devicePixelRatio : y - boxH / 2;
      ctx.fillStyle = 'rgba(17,20,28,0.9)';
      ctx.strokeStyle = '#3a3f4b';
      ctx.lineWidth = 1 * window.devicePixelRatio;
      ctx.beginPath();
      ctx.roundRect(bx, by, boxW, boxH, 8 * window.devicePixelRatio);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.font = `${12 * window.devicePixelRatio}px Inter, sans-serif`;
      const lines = [
        timeFormat(candle.time),
        `O ${priceFormat(candle.open)}`,
        `H ${priceFormat(candle.high)}`,
        `L ${priceFormat(candle.low)}`,
        `C ${priceFormat(candle.close)}`,
      ];
      lines.forEach((t, i) => ctx.fillText(t, bx + 10 * window.devicePixelRatio, by + 8 * window.devicePixelRatio + i * 14 * window.devicePixelRatio));
    }
  }, []);

  // Mouse handlers
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) * window.devicePixelRatio;
      const y = (e.clientY - rect.top) * window.devicePixelRatio;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const idx = Math.floor((x / w) * visible.length);
      const candle = visible[idx];
      // price from y
      const price = top - (y / h) * (top - bottom);
      const pos = { x, y, candle, price };
      setHover(pos);
      drawOverlay(pos);
    };
    const handleLeave = () => { setHover(null); drawOverlay(null); };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, [visible, top, bottom, drawOverlay]);

  // Zoom with wheel
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const wheel = (e) => {
      e.preventDefault();
      setZoom((z) => Math.min(8, Math.max(0.5, z + (e.deltaY > 0 ? -0.2 : 0.2))));
    };
    el.addEventListener('wheel', wheel, { passive: false });
    return () => el.removeEventListener('wheel', wheel);
  }, []);

  // Drag to pan
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let dragging = false; let startX = 0; let startOffset = 0;
    const down = (e) => { dragging = true; startX = e.clientX; startOffset = offset; };
    const up = () => { dragging = false; };
    const move = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const perCandle = el.clientWidth / visible.length;
      const candleShift = Math.round(-dx / perCandle);
      setOffset(Math.max(0, startOffset + candleShift));
    };
    el.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    window.addEventListener('mousemove', move);
    return () => {
      el.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('mousemove', move);
    };
  }, [visible.length, offset]);

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => { setCandles(generateCandles()); setOffset(0); setZoom(1); setLoading(false); }, 600);
  };

  // Trading pairs for the top bar (mock data)
  const tradingPairs = [
    { flag: '🇦🇺', pair: 'AUD/CHF', payout: '60%' },
    { flag: '🇬🇧', pair: 'GBP/USD', payout: '60%' },
    { flag: '🇨🇭', pair: 'CHF/JPY', payout: '60%' },
    { flag: '🇨🇭', pair: 'CHF/JPY', payout: '82%' },
    { flag: '🇨🇦', pair: 'CAD/JPY', payout: '64%' },
    { flag: '🇪🇺', pair: 'EUR/JPY', payout: '60%' },
    { flag: '🇬🇧', pair: 'GBP/JPY', payout: '90%' },
    { flag: '🇦🇺', pair: 'AUD/CHF', payout: '90%' },
  ];

  return (
    <main className="flex-1 bg-[#181c2b] flex flex-col p-2 relative">
      {/* Top trading pairs bar */}
  <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-2 scrollbar-hide bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 px-2 rounded-lg">
        {tradingPairs.map((tp, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-[#23283a] rounded-lg px-4 py-2 min-w-[120px] shadow border-2 border-[#31374a] relative transition-colors duration-200 hover:bg-[#31374a] hover:border-blue-500 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{tp.flag}</span>
              <span className="text-white font-bold text-sm">{tp.pair}</span>
            </div>
            <span className="text-yellow-400 font-bold text-xs mt-1">{tp.payout}</span>
            <button className="absolute top-1 right-1 text-secondary hover:text-red-500 text-xs"><i className="fas fa-times" /></button>
          </div>
        ))}
      </div>
      {/* Chart controls and info */}
      <div className="flex items-center flex-wrap gap-2 mb-2">
        <button onClick={refreshData} className="bg-tertiary px-3 py-2 rounded-md hover:bg-gray-600 text-xs font-semibold flex items-center gap-1">
          {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-sync" />} Refresh
        </button>
        <div className="flex items-center bg-tertiary px-3 py-2 rounded-md text-sm font-semibold text-white select-none shadow-inner">
          {symbol}
          <i className="fas fa-chevron-down text-xs ml-2 opacity-60" />
        </div>
        <div className="flex items-center bg-tertiary px-2 py-1 rounded-md text-xs gap-1">
          {['1m','5m','15m','1h'].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} className={`px-2 py-1 rounded ${timeframe===tf?'bg-blue-600 text-white':'text-secondary hover:text-white'}`}>{tf}</button>
          ))}
        </div>
        <div className="text-green-500 font-semibold ml-auto text-sm">Payout 80%</div>
        <div className="flex items-center gap-1 text-xs bg-tertiary px-2 py-1 rounded">
          <span>Zoom</span>
          <button onClick={() => setZoom(z=>Math.max(0.5,z-0.2))} className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600">-</button>
          <div className="px-2 text-main">{zoom.toFixed(1)}x</div>
          <button onClick={() => setZoom(z=>Math.min(8,z+0.2))} className="w-6 h-6 rounded bg-gray-700 hover:bg-gray-600">+</button>
        </div>
      </div>
      <div ref={containerRef} className="flex-1 relative rounded-md overflow-hidden ring-1 ring-gray-700 shadow-inner select-none cursor-crosshair bg-[#262a35]">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <canvas ref={overlayRef} className="absolute inset-0 pointer-events-none" />
        {/* Gradient overlay for premium depth */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.06),transparent_60%)]" />
        {/* Axis time labels along bottom */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-secondary px-2 pb-1 font-mono">
          {visible.filter((_,i)=>i%Math.ceil(visible.length/6)===0).map(c => (
            <span key={c.i}>{timeFormat(c.time)}</span>
          ))}
        </div>
        {/* Left/Right fades for pan hint */}
        {offset>0 && <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-[#1e222d] to-transparent pointer-events-none" />}
        {candles.length - (startIndex + visible.length) > 0 && <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-[#1e222d] to-transparent pointer-events-none" />}
      </div>
      <div className="mt-1 flex items-center gap-4 text-xs text-secondary font-mono">
        {hover?.candle ? (
          <>
            <span className="text-white">{timeFormat(hover.candle.time)}</span>
            <span>O {priceFormat(hover.candle.open)}</span>
            <span>H {priceFormat(hover.candle.high)}</span>
            <span>L {priceFormat(hover.candle.low)}</span>
            <span>C {priceFormat(hover.candle.close)}</span>
          </>
        ) : <span className="italic">Hover over chart</span>}
      </div>
    </main>
  );
};
export default Chart;
