// Chart component removed as per request.

const Chart = ({ symbol: externalSymbol, onSymbolChange, hidePairBar = false }) => {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const containerRef = useRef(null);
  const [candles, setCandles] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [zoom, setZoom] = useState(1); // 1 = base, >1 zoomed in
  const [offset, setOffset] = useState(0); // horizontal pan offset in candles
  const [hover, setHover] = useState(null); // {x,y,candle}
  const [loading, setLoading] = useState(false);
  const [symbol, setSymbol] = useState(externalSymbol || 'BTC/USDT');
  const [pairs, setPairs] = useState([]);
  const [payout, setPayout] = useState(null);
  const [price, setPrice] = useState(null);

  // Sync with prop
  useEffect(()=>{ if(externalSymbol && externalSymbol!==symbol) setSymbol(externalSymbol); }, [externalSymbol]);

  // Fetch active pairs
  useEffect(() => {
    let cancelled = false;
    async function loadPairs() {
      try {
        const res = await fetch('/api/public/currency-pairs');
        const data = await res.json();
        if (!cancelled) {
          setPairs(data);
          if (!externalSymbol && data.length && !data.find(p => p.display === symbol)) setSymbol(data[0].display);
        }
      } catch(e) { /* ignore */ }
    }
    loadPairs();
  }, []);

  // Poll selected pair price/payout
  useEffect(() => {
    let id;
    const run = async () => {
      try {
        const res = await fetch('/api/public/currency-pairs');
        const data = await res.json();
        setPairs(data);
        const s = data.find(p => p.display === symbol || p.symbol.replace('_','/') === symbol);
        if (s) { setPayout(s.payout); setPrice(s.latest_price); }
      } catch(e) {}
      id = setTimeout(run, 5000);
    };
    run();
    return () => clearTimeout(id);
  }, [symbol]);
  const [timeframe, setTimeframe] = useState('1m'); // '1m','5m','15m','1h','4h','1d','1Y'
  const liveMode = timeframe === '1m';
  const [initialLoaded, setInitialLoaded] = useState(false);

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


  // Historical fetch from internal stored candles API (non-live timeframes)
  useEffect(() => {
    let aborted=false;
    async function load(){
      if(!symbol) return; if(liveMode) return;
      setLoading(true);
      try {
        // Convert display format (EUR/USD) to internal format (EUR_USD)
        const apiSymbol = symbol.includes('/') ? symbol.replace('/', '_') : symbol;
        let interval = timeframe; 
        let limit = 500; 
        if(timeframe==='1Y'){ interval='1d'; limit=365; }
        
        const res = await fetch(`/api/public/candles?symbol=${apiSymbol}&interval=${interval}&limit=${limit}`);
        if (!res.ok) {
          console.error('Candles API error:', res.status, await res.text());
          return;
        }
        
        const data = await res.json();
        if(!aborted && Array.isArray(data)) {
          setCandles(data.map(c=>({ ...c, time: new Date(c.time).getTime() })));
          setOffset(0);
          setInitialLoaded(true);
        }
      } catch(e){ 
        console.error('history load error', e); 
      }
      finally { 
        if(!aborted) setLoading(false); 
      }
    }
    load();
    return ()=>{aborted=true};
  }, [symbol, timeframe, liveMode]);

  // Live mode (1m) price accumulation into 1m candles
  useEffect(() => {
    if (!liveMode) return; // only for 1m
    let cancelled = false;
    let intervalId;
    let history = [];
    async function poll() {
      if (!symbol) return;
      try {
        const res = await fetch('/api/public/currency-pairs');
        if (!res.ok) {
          console.error('Currency pairs API error:', res.status);
          return;
        }
        
        const data = await res.json();
        if (!Array.isArray(data)) {
          console.error('Invalid currency pairs response:', data);
          return;
        }
        
        // Find pair by symbol or display format
        const apiSymbol = symbol.includes('/') ? symbol.replace('/', '_') : symbol;
        const s = data.find(p => 
          p.symbol === apiSymbol || 
          p.display === symbol || 
          p.symbol.replace('_','/') === symbol
        );
        
        if (s && (s.latest_price || s.price)) {
          const price = Number(s.latest_price || s.price);
          const now = Date.now();
          history = [...history, { price, time: now }];
          
          // Keep last 2 hours of price history
          const twoHoursAgo = now - 2 * 60 * 60 * 1000;
          history = history.filter(p => p.time > twoHoursAgo);
          
          if (!cancelled) {
            setPriceHistory([...history]);
            setCandles(priceHistoryToCandles(history, 60000));
          }
        } else {
          console.warn('No price data for symbol:', symbol, 'found pair:', s);
        }
      } catch(e) {
        console.error('Live poll error:', e);
      }
    }
    poll();
    intervalId = setInterval(poll, 3000); // Poll every 3 seconds
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [symbol, liveMode]);



  const visibleCount = Math.max(30, Math.round( (timeframe==='1Y'? candles.length : 240) / zoom ));
  const startIndex = Math.max(0, candles.length - visibleCount - offset);
  const visible = candles.slice(startIndex, startIndex + visibleCount);
  
  // Handle empty data case
  const prices = visible.length > 0 ? visible.flatMap(c => [c.high, c.low]) : [1.0, 1.1];
  const maxPrice = Math.max(...prices);
  const minPrice = Math.min(...prices);
  const pad = (maxPrice - minPrice) * 0.05 || 0.1; // Fallback padding
  const top = maxPrice + pad;
  const bottom = minPrice - pad;

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, w, h);

    // Grid lines
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    const gridSize = 20 * window.devicePixelRatio;
    for (let x = 0; x <= w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, h);
      ctx.stroke();
    }
    for (let y = 0; y <= h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }

    // Axis labels (price on right)
    ctx.font = `${11 * window.devicePixelRatio}px monospace`;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    const steps = 6;
    for (let j = 0; j <= steps; j++) {
      const y = (j / steps) * h;
      const price = top - (j / steps) * (top - bottom);
      ctx.fillText(priceFormat(price), w - 4 * window.devicePixelRatio, y);
    }

    // Empty chart message if no data
    if (!visible.length) {
      ctx.fillStyle = '#64748b';
      ctx.font = `${16 * window.devicePixelRatio}px monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Loading chart data...', w / 2, h / 2 - 20 * window.devicePixelRatio);
      ctx.font = `${12 * window.devicePixelRatio}px monospace`;
      ctx.fillText(`Symbol: ${symbol || 'None'}`, w / 2, h / 2 + 10 * window.devicePixelRatio);
      return;
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
      ctx.strokeStyle = bullish ? '#22c55e' : '#ef4444';
      ctx.fillStyle = bullish ? '#22c55e' : '#ef4444';
      ctx.lineWidth = 1 * window.devicePixelRatio;
      // Wick
      ctx.beginPath();
      ctx.moveTo(xCenter, highY);
      ctx.lineTo(xCenter, lowY);
      ctx.stroke();
      // Body
      const bodyTop = Math.min(openY, closeY);
      const bodyH = Math.max(2, Math.abs(openY - closeY));
      ctx.globalAlpha = 0.9;
      ctx.fillRect(xCenter - candleW / 2, bodyTop, candleW, bodyH);
      ctx.globalAlpha = 1;
    });

    // Current price line (last candle close)
    if (visible.length) {
      const last = visible[visible.length - 1];
      const y = ((top - last.close) / (top - bottom)) * h;
      ctx.strokeStyle = '#3b82f6';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
      ctx.setLineDash([]);
      // Price tag
      ctx.fillStyle = '#3b82f6';
      const tag = priceFormat(last.close);
      const padX = 4 * window.devicePixelRatio;
      const padY = 2 * window.devicePixelRatio;
      const tw = ctx.measureText(tag).width + padX * 2;
      const th = 14 * window.devicePixelRatio;
      ctx.fillRect(w - tw, y - th / 2, tw, th);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `${10 * window.devicePixelRatio}px monospace`;
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
  setZoom((z) => Math.min(50, Math.max(0.05, z + (e.deltaY > 0 ? -0.2 : 0.2))));
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
    if (liveMode) {
      // force rebuild candles from current priceHistory
      setCandles(priceHistoryToCandles(priceHistory, 60000));
    } else {
      // retrigger useEffect by toggling timeframe temporarily
      setTimeframe(tf=>tf==='1d' ? '1d' : tf); // no-op triggers state update if needed
    }
  };

  // Trading pairs for the top bar (fetched from API)
  const tradingPairs = pairs.map(p => ({
    pair: p.display,
    payout: (p.payout ?? 0) + '%'
  }));

  return (
    <main className="flex-1 bg-[#0f172a] flex flex-col relative">
      {!hidePairBar && <div className="flex items-center gap-3 overflow-x-auto pb-2 mb-2 scrollbar-hide bg-[#121922] px-2 rounded-md border border-[#1e2530]">
        {tradingPairs.map((tp, i) => (
          <div
            key={i}
            className="flex flex-col items-center bg-[#23283a] rounded-lg px-4 py-2 min-w-[120px] shadow border-2 border-[#31374a] relative transition-colors duration-200 hover:bg-[#31374a] hover:border-blue-500 cursor-pointer"
            onClick={() => { setSymbol(tp.pair); onSymbolChange && onSymbolChange(tp.pair); }}
          >
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">{tp.pair}</span>
            </div>
            <span className="text-yellow-400 font-bold text-xs mt-1">{tp.payout}</span>
            <button className="absolute top-1 right-1 text-secondary hover:text-red-500 text-xs"><i className="fas fa-times" /></button>
          </div>
        ))}
      </div>}
      {/* Chart controls and info */}
      <div className="flex items-center flex-wrap gap-2 mb-1 px-2">
        <button onClick={refreshData} className="bg-[#1e293b] hover:bg-[#334155] px-2 py-1 rounded text-xs font-medium flex items-center gap-1 text-white border border-[#475569]">
          {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-sync" />} Refresh
        </button>
        <div className="flex items-center bg-[#1e293b] px-3 py-1.5 rounded text-sm font-medium text-white border border-[#475569]">
          {symbol}{price? <span className="ml-2 text-[#10b981] text-xs font-mono">{Number(price).toFixed(5)}</span>: null}
          <i className="fas fa-chevron-down text-xs ml-2 opacity-60" />
        </div>
        <div className="flex items-center bg-[#1e293b] border border-[#475569] rounded text-xs">
          {['1m','5m','15m','1h','4h','1d','1Y'].map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} className={`px-2 py-1 ${timeframe===tf?'bg-[#0ea5e9] text-white':'text-[#94a3b8] hover:text-white hover:bg-[#334155]'} ${tf==='1m'?'rounded-l':tf==='1Y'?'rounded-r':''}`}>{tf}</button>
          ))}
        </div>
        <div className="text-[#10b981] font-semibold ml-auto text-sm">Payout {payout ?? '--'}%</div>
        <div className="flex items-center gap-1 text-xs bg-[#1e293b] border border-[#475569] px-2 py-1 rounded text-white">
          <span>Zoom</span>
          <button onClick={() => setZoom(z=>Math.max(0.5,z-0.2))} className="w-5 h-5 rounded bg-[#374151] hover:bg-[#4b5563] text-xs">-</button>
          <div className="px-1 text-[#94a3b8] text-xs">{zoom.toFixed(1)}x</div>
          <button onClick={() => setZoom(z=>Math.min(8,z+0.2))} className="w-5 h-5 rounded bg-[#374151] hover:bg-[#4b5563] text-xs">+</button>
        </div>
      </div>
  <div ref={containerRef} className="relative rounded overflow-hidden select-none cursor-crosshair bg-[#1e293b] border border-[#475569] h-[320px] mx-2">
        <canvas ref={canvasRef} className="absolute inset-0" />
        <canvas ref={overlayRef} className="absolute inset-0 pointer-events-none" />
        {/* Grid background */}
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{backgroundImage: 'linear-gradient(rgba(71,85,105,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(71,85,105,0.5) 1px, transparent 1px)', backgroundSize: '20px 20px'}} />
        {/* Axis time labels along bottom */}
        <div className="absolute bottom-0 left-0 w-full flex justify-between text-[9px] text-[#64748b] px-2 pb-1 font-mono">
          {visible.filter((_,i)=>i%Math.ceil(visible.length/6)===0).map(c => (
            <span key={c.i}>{timeFormat(c.time)}</span>
          ))}
        </div>
        {!candles.length && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-secondary text-xs">Loading history...</div>
        )}
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
