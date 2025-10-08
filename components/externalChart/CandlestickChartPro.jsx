"use client";

import React, { useEffect, useRef, useState } from 'react';

// We dynamically import to avoid SSR issues
let lwc = null;
async function ensureLib() {
  if (!lwc) {
    lwc = await import('lightweight-charts');
  }
  return lwc;
}

// Basic chart visual types; we start with candles/line/area
const CHART_TYPES = ['candles','line','area'];
const TIMEFRAMES = [
  { key: '1h', label: '1H', interval: '1m', limit: 120 },
  { key: '4h', label: '4H', interval: '5m', limit: 300 },
  { key: '1d', label: '1D', interval: '15m', limit: 96 },
];

export default function CandlestickChartPro({ defaultSymbol = 'BTCUSDT' }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [pair, setPair] = useState(defaultSymbol);
  const [tfKey, setTfKey] = useState('1h');
  const [ctype, setCtype] = useState('candles');
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const tfMeta = TIMEFRAMES.find(t => t.key === tfKey) || TIMEFRAMES[0];

  // Initialize chart once
  useEffect(() => {
    let cleanup = () => {};
    (async () => {
      if (!containerRef.current) return;
      const { createChart, ColorType } = await ensureLib();
      const chart = createChart(containerRef.current, {
        layout: { background: { type: ColorType.Solid, color: '#10131a' }, textColor: '#d1d5db' },
        grid: { vertLines: { color: '#222' }, horzLines: { color: '#222' } },
        rightPriceScale: { borderColor: '#333' },
        timeScale: { borderColor: '#333', timeVisible: true, secondsVisible: false },
        autoSize: true,
        crosshair: { mode: 1 },
      });
      chartRef.current = chart;

      const handleResize = () => chart.applyOptions({ autoSize: true });
      window.addEventListener('resize', handleResize);

      cleanup = () => {
        window.removeEventListener('resize', handleResize);
        try { chart.remove(); } catch {}
        chartRef.current = null;
        seriesRef.current = null;
      };
    })();
    return () => cleanup();
  }, []);

  // Build or switch main series based on type
  const setSeriesForType = async (type, candles) => {
    const chart = chartRef.current; if (!chart) return;
    if (!seriesRef.current) {
      await ensureLib();
    }
    try { if (seriesRef.current) chart.removeSeries(seriesRef.current); } catch {}

    if (type === 'line' || type === 'area') {
      const s = type === 'line' ? chart.addLineSeries({ color:'#4ade80', lineWidth:2 }) : chart.addAreaSeries({ lineColor:'#60a5fa', topColor:'rgba(96,165,250,0.25)', bottomColor:'rgba(96,165,250,0.02)', lineWidth:2 });
      seriesRef.current = s;
      s.setData(candles.map(c => ({ time: c.time, value: c.close })));
    } else {
      const s = chart.addCandlestickSeries({
        upColor: '#0ECB81', borderUpColor: '#0ECB81', wickUpColor: '#0ECB81',
        downColor: '#F6465D', borderDownColor: '#F6465D', wickDownColor: '#F6465D'
      });
      seriesRef.current = s;
      s.setData(candles.map(c => ({ time:c.time, open:c.open, high:c.high, low:c.low, close:c.close })));
    }
  };

  // Fetch candles for current pair + timeframe
  const fetchCandles = async () => {
    const interval = tfMeta.interval;
    const limit = tfMeta.limit;
    const url = new URL('/api/klines', window.location.origin);
    url.searchParams.set('symbol', pair);
    url.searchParams.set('interval', interval);
    url.searchParams.set('limit', String(limit));
    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json.candles || [];
  };

  // Load candles initially and on changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!chartRef.current) return;
      setLoading(true); setErr('');
      try {
        const candles = await fetchCandles();
        if (cancelled) return;
        await setSeriesForType(ctype, candles);
        chartRef.current.timeScale().fitContent();
      } catch (e) {
        console.error('[ProChart] load error', e);
        setErr(e?.message || String(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pair, tfKey, ctype]);

  // Live updates: poll periodically
  useEffect(() => {
    let cancelled = false;
    const id = setInterval(async () => {
      if (!seriesRef.current) return;
      try {
        const candles = await fetchCandles();
        if (cancelled) return;
        // Replace full set for now (simple and robust)
        if (ctype === 'line' || ctype === 'area') {
          seriesRef.current.setData(candles.map(c => ({ time:c.time, value:c.close })));
        } else {
          seriesRef.current.setData(candles.map(c => ({ time:c.time, open:c.open, high:c.high, low:c.low, close:c.close })));
        }
      } catch (e) {
        // ignore transient errors
      }
    }, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, [pair, tfKey, ctype]);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#10131a', color: '#fff' }}>
      {/* Top-left timeframe selector */}
      <div style={{ position:'fixed', top:12, left:12, zIndex:10, background:'#0f1220d9', border:'1px solid #243042', borderRadius:10, padding:'6px 8px', display:'flex', gap:6 }}>
        {TIMEFRAMES.map(t => (
          <button key={t.key} onClick={() => setTfKey(t.key)} style={{ background: tfKey===t.key?'#1f2937':'#111827', color:'#e5e7eb', border:'1px solid #374151', padding:'6px 10px', borderRadius:6, cursor:'pointer' }}>{t.label}</button>
        ))}
        <div style={{ marginLeft: 8 }}>
          <select value={ctype} onChange={e => setCtype(e.target.value)} style={{ background:'#111827', color:'#e5e7eb', border:'1px solid #374151', padding:'6px 10px', borderRadius:6 }}>
            {CHART_TYPES.map(t => (<option key={t} value={t}>{t}</option>))}
          </select>
        </div>
      </div>

      {/* Top toolbar for symbol selection */}
      <div style={{ position:'fixed', top:12, left:'50%', transform:'translateX(-50%)', zIndex:10, background:'#0f1220d9', border:'1px solid #243042', borderRadius:10, padding:'6px 10px', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ color: '#9ca3af', fontSize: 12 }}>Symbol</span>
        <select value={pair} onChange={(e) => setPair(e.target.value)} style={{ background:'#111827', color:'#e5e7eb', border:'1px solid #374151', padding:'6px 10px', borderRadius:6, cursor:'pointer', minWidth:140 }}>
          {[ 'BTCUSDT','ETHUSDT','SOLUSDT','BNBUSDT','XRPUSDT','ADAUSDT','DOGEUSDT','LTCUSDT' ].map(p => (
            <option key={p} value={p}>{p.replace('USDT','/USDT')}</option>
          ))}
          <option value="EUR_USD">EUR/USD (forex)</option>
        </select>
        <div style={{ display:'flex', alignItems:'center', gap:4, color: loading? '#f59e0b':'#10b981', fontSize:12 }}>
          <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor: loading? '#f59e0b':'#10b981' }} />
          {loading ? 'Loading...' : 'Live'}
        </div>
        {err && <span style={{ color:'#fecaca', fontSize:12 }}>· {err}</span>}
      </div>

      <div ref={containerRef} style={{ width:'100vw', height:'100vh' }} />
    </div>
  );
}
