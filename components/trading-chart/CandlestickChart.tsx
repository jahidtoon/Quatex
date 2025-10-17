// @ts-nocheck
// app/components/CandlestickChart.tsx
// QouteX-style candlestick + volume using lightweight-charts

'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createChart, ColorType, IChartApi, ISeriesApi, Time } from 'lightweight-charts';
import { ChartVisualType, Candle as CandleType } from './chartTypes/types';
import { createCandlesSeries } from './chartTypes/candles';
import { createBarsSeries } from './chartTypes/bars';
import { createLineSeries } from './chartTypes/line';
import { createAreaSeries } from './chartTypes/area';
import { createBaselineSeries } from './chartTypes/baseline';
import { createHollowSeries } from './chartTypes/hollow';
import { createHeikinSeries } from './chartTypes/heikin';
import IndicatorsPanel from './IndicatorsPanel';
import { IndicatorKey } from './indicators/types';
import { useIndicators } from './indicators/useIndicators';
import { useTradeLines } from './useTradeLines';

interface Candle extends CandleType {}

interface Props {
  symbol?: string; // e.g., ETHUSDT or EUR_USD
  onPriceUpdate?: (price: number) => void;
  onSymbolChange?: (symbol: string) => void; // notify parent when user selects a new symbol
  openTrades?: Array<{
    id: string;
    symbol: string;
    direction: 'BUY' | 'SELL';
    entryPrice: number;
    amount: number;
    status?: string;
    result?: string;
    openTime?: string | number | Date | null;
    closeTime?: string | number | Date | null;
  }>;
  authToken?: string | null;
}

export default function CandlestickChart({ symbol = 'ETHUSDT', onPriceUpdate, onSymbolChange, openTrades = [], authToken }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<any> | null>(null);
  // Cache created series per type to avoid removing/adding flicker
  const seriesCacheRef = useRef<Record<string, ISeriesApi<any>>>({});
  const [loading, setLoading] = useState(true);
  const [isChangingType, setIsChangingType] = useState(false); // New state for type changing
  const [pair, setPair] = useState(symbol);
  const [tf, setTf] = useState<'5s' | '10s' | '15s' | '30s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('5s');
  const [chartType, setChartType] = useState<ChartVisualType>('candles');
  // Ref to always-current chart type so background intervals don't use stale closure
  const chartTypeRef = useRef<ChartVisualType>('candles');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true); // Phase 1: Auto-scroll control
  const autoScrollRef = useRef(true); // Immediate reference for live updates
  const [showTfTray, setShowTfTray] = useState(false); // Compact right-side timeframe tray
  // Countdown to next candle (visual timer like reference screenshot)
  const [nextCountdown, setNextCountdown] = useState<string>('');
  const nextCountdownRef = useRef<string>('');
  // Dynamic position for countdown near active candle
  const countdownPosRef = useRef<{x:number;y:number}|null>(null);
  const [countdownPos, setCountdownPos] = useState<{x:number;y:number}|null>(null);
  
  const tfRef = useRef<'5s' | '10s' | '15s' | '30s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d'>('5s');
  const lastCandlesRef = useRef<Candle[]>([]);
  // Keep last candle time to drive zoom window
  const lastTimeRef = useRef<number | null>(null);
  // Track whether we should maintain auto zoom or honor user's manual zoom
  const rangeModeRef = useRef<'auto' | 'manual'>('auto');
  const isProgrammaticRangeChange = useRef(false);
  
  // Indicator states
  const [showIndicators, setShowIndicators] = useState(false);
  const { active, add, remove, clear, update, updateColors } = useIndicators(chartRef, seriesRef);

  // Trade Line Mode
  const [tradeLineMode, setTradeLineMode] = useState(false);

  // Drawing tools
  const [drawingTool, setDrawingTool] = useState(null);
  const [showDrawingMenu, setShowDrawingMenu] = useState(false);
  const [drawings, setDrawings] = useState([]);
  const drawingStateRef = useRef({ points: [] });

  // Simple Trade Lines System
  const {
    tradeLines,
    selectedLine,
    setSelectedLine,
    createTradeLine,
    updateTradeLine,
    removeTradeLine,
  } = useTradeLines(chartRef, seriesRef, tradeLineMode);

  // Temporary variables to prevent undefined errors
  const activeTool = null;
  
  const toggleTradeLineMode = () => {
    setTradeLineMode(!tradeLineMode);
    console.log('🎨 Trade line mode:', !tradeLineMode);
  };

  const priceLinesRef = useRef<Map<string, { line: any; direction: 'BUY' | 'SELL'; series: ISeriesApi<any> }>>(new Map());
  const tradeMarkersSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const openTradesRef = useRef(openTrades);
  const pairRef = useRef(pair);

  const clearPriceLines = useCallback((seriesOverride?: ISeriesApi<any> | null) => {
    priceLinesRef.current.forEach(({ line, series }) => {
      const target = (seriesOverride ?? series ?? seriesRef.current) as any;
      if (!target) return;
      try {
        target.removePriceLine(line);
      } catch (error) {
        // Silently ignore; series might be disposed already
      }
    });
    priceLinesRef.current.clear();
    if (tradeMarkersSeriesRef.current) {
      try {
        tradeMarkersSeriesRef.current.setMarkers([]);
      } catch {}
    }
  }, []);

  const ensureTradeMarkerSeries = useCallback(() => {
    if (!chartRef.current) return null;
    if (!tradeMarkersSeriesRef.current) {
      const overlay = chartRef.current.addLineSeries({
        color: 'rgba(0,0,0,0)',
        lineWidth: 1,
        crosshairMarkerVisible: false,
        priceLineVisible: false,
        lastValueVisible: false,
        priceScaleId: 'overlay',
      });
      overlay.setData([]);
      tradeMarkersSeriesRef.current = overlay;
    }
    return tradeMarkersSeriesRef.current;
  }, []);

  const parseTradeTime = useCallback((value: any) => {
    if (!value) return null;
    if (typeof value === 'number') {
      return value > 1e12 ? Math.floor(value / 1000) : Math.floor(value);
    }
    const date = new Date(value);
    const ms = date.getTime();
    if (Number.isNaN(ms)) return null;
    return Math.floor(ms / 1000);
  }, []);

  const rebuildPriceLines = useCallback((seriesOverride?: ISeriesApi<any> | null) => {
    const targetSeries = (seriesOverride ?? seriesRef.current) as any;
    if (!targetSeries) return;

    clearPriceLines(targetSeries);

    const normalizeSym = (s?: string) => (s || '').replace(/[_:\-]/g, '').toUpperCase();
    const currentPair = normalizeSym(pairRef.current);
    const activeTrades = (openTradesRef.current || []).filter((trade) => {
      if (!trade) return false;
      const rawSymbol = trade.symbol || '';
      const norm = normalizeSym(rawSymbol);
      if (currentPair && norm && currentPair !== norm) {
        // debug skip symbol mismatch
        return false;
      }
      const price = Number(trade.entryPrice ?? trade.entry_price ?? trade.price ?? 0);
      if (!(Number.isFinite(price) && price > 0)) {
        return false;
      }
      // Skip closed (we'll still show them as markers only below)
      const status = (trade.status || trade.result || '').toLowerCase();
      if (status === 'closed' || status === 'win' || status === 'loss') return false;
      return true;
    });

    activeTrades.forEach((trade) => {
      const price = Number(trade.entryPrice ?? trade.entry_price ?? trade.price ?? 0);
      const direction = (trade.direction || '').toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
      try {
        const line = targetSeries.createPriceLine({
          price,
          color: direction === 'BUY' ? '#10b981' : '#ef4444',
          lineWidth: 2,
          lineStyle: 0,
          axisLabelVisible: true,
          title: `${direction} $${Number(trade.amount ?? 0).toFixed(2)}`,
        });
        if (line) {
          const id = trade.id != null ? String(trade.id) : `${direction}-${price}-${Math.random()}`;
          priceLinesRef.current.set(id, { line, direction, series: targetSeries });
        }
      } catch (error) {
        console.error('[chart] createPriceLine failed', error);
      }
    });

    const markerSeries = ensureTradeMarkerSeries();
    if (markerSeries) {
      // Include both open & recently closed in marker layer
      const all = (openTradesRef.current || []).slice();
      const nowSec = Math.floor(Date.now()/1000);
      const markers = all.map((trade) => {
        const direction = (trade.direction || '').toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
        const time = parseTradeTime(trade.openTime ?? trade.open_time ?? trade.createdAt ?? trade.created_at ?? lastTimeRef.current);
        const amount = Number(trade.amount ?? 0);
        const statusRaw = (trade.status || trade.result || '').toLowerCase();
        const isClosed = ['closed','win','loss'].includes(statusRaw);
        const isWin = statusRaw === 'win';
        const isLoss = statusRaw === 'loss';
        const overdue = !isClosed && trade.closeTime && (nowSec - (typeof trade.closeTime === 'number' ? trade.closeTime : parseTradeTime(trade.closeTime)) ) > 10;
        const textParts = [direction === 'BUY' ? 'BUY' : 'SELL'];
        if (amount) textParts.push(`$${amount.toFixed(0)}`);
        if (isWin) textParts.push('WIN');
        else if (isLoss) textParts.push('LOSS');
        else if (overdue) textParts.push('SETTLING');
        else if (statusRaw === 'open' || statusRaw === 'pending') textParts.push('OPEN');
        const baseColor = direction === 'BUY' ? '#10b981' : '#ef4444';
        const color = isWin ? '#16a34a' : isLoss ? '#dc2626' : overdue ? '#f59e0b' : baseColor;
        const shape = isWin ? 'circle' : isLoss ? 'square' : overdue ? 'arrowLeft' : (direction === 'BUY' ? 'arrowUp' : 'arrowDown');
        return {
          time: (time ?? lastTimeRef.current ?? 0) as Time,
          position: direction === 'BUY' ? 'belowBar' : 'aboveBar',
          color,
          shape,
          text: textParts.join(' '),
        } as const;
      });
      try {
        markerSeries.setMarkers(markers);
      } catch (error) {
        console.error('[chart] setMarkers failed', error);
      }
    }
  }, [clearPriceLines, ensureTradeMarkerSeries, parseTradeTime]);

  // DEBUG: লগ করার জন্য যাতে বুঝি openTrades আসছে কিনা এবং কয়টা লাইন বানানো হচ্ছে
  useEffect(() => {
    // Lightweight noise কমানোর জন্য শুধু প্রথম 5 আইটেম দেখাই
    if (Array.isArray(openTrades)) {
      console.log('[trade-lines][debug] openTrades length =', openTrades.length, 'sample =', openTrades.slice(0,5));
    } else {
      console.log('[trade-lines][debug] openTrades not array', openTrades);
    }
  }, [openTrades]);

  useEffect(() => {
    openTradesRef.current = Array.isArray(openTrades) ? openTrades : [];
    pairRef.current = pair;
    // শুধু দাম/ডিরেকশন আছে এমনগুলোই নেব
    const norm = (s?: string) => (s || '').replace(/[_:\-]/g, '').toUpperCase();
    const currentPair = norm(pair);
    const valid = (openTradesRef.current || []).filter(t => {
      const price = Number(t?.entryPrice ?? t?.entry_price ?? t?.price);
      const dir = (t?.direction || '').toUpperCase();
      const symOk = !currentPair || norm(t?.symbol) === currentPair;
      const priceOk = Number.isFinite(price) && price > 0;
      const dirOk = dir === 'BUY' || dir === 'SELL';
      if (!(symOk && priceOk && dirOk)) {
        console.log('[trade-lines][skip]', { symOk, priceOk, dirOk, symbol: t?.symbol, price, dir });
      }
      return symOk && priceOk && dirOk;
    });
    if (valid.length === 0) {
      console.log('[trade-lines][debug] কোনো valid trade নেই, price lines clear');
      clearPriceLines(seriesRef.current);
    } else {
      console.log(`[trade-lines][debug] rebuilding price lines (${valid.length})`);
      rebuildPriceLines();
    }
  }, [openTrades, pair, rebuildPriceLines]);

  // Fallback polling: যদি parent থেকে openTrades না আসে (length=0), নিজে API থেকে টানার চেষ্টা করবে
  useEffect(() => {
    let active = true;
    async function fetchFallback() {
      try {
        if (!active) return;
        if (openTradesRef.current && openTradesRef.current.length > 0) return; // already have
  const token = authToken || (typeof window !== 'undefined' ? (localStorage.getItem('auth_token') || localStorage.getItem('token')) : null);
        if (!token) return; // not logged in
        const res = await fetch('/api/trades?limit=20', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        const rows = Array.isArray(data.trades) ? data.trades : [];
        const normalized = rows.map(trade => {
          const entryPrice = Number(trade.entryPrice ?? trade.entry_price ?? trade.price ?? 0);
          if (!entryPrice) return null;
          const openTimeRaw = trade.openTime ?? trade.open_time ?? trade.createdAt ?? trade.created_at;
          const openTime = openTimeRaw ? new Date(openTimeRaw).getTime() / 1000 : null;
          return {
            id: trade.id?.toString?.() ?? `${trade.id}`,
            symbol: trade.symbol,
            direction: (trade.direction || '').toUpperCase() === 'SELL' ? 'SELL' : 'BUY',
            entryPrice,
            amount: Number(trade.amount ?? 0),
            status: trade.status ?? trade.result ?? 'pending',
            result: trade.result ?? 'pending',
            openTime,
          };
        }).filter(Boolean).filter(t => (t.status === 'open' || t.result === 'pending'));
        if (active && normalized.length && openTradesRef.current.length === 0) {
          console.log('[trade-lines][fallback] fetched trades =', normalized.length);
          openTradesRef.current = normalized as any;
          rebuildPriceLines();
        }
      } catch (e) {
        console.log('[trade-lines][fallback] error', e);
      }
    }
    const id = setInterval(fetchFallback, 4000);
    fetchFallback();
    return () => { active = false; clearInterval(id); };
  }, [rebuildPriceLines]);
  
  const createDrawing = useCallback((tool, point1, point2 = null) => {
    if (!chartRef.current || !seriesRef.current) return;
    const chart = chartRef.current;
    const series = seriesRef.current;
    let drawing = null;
    if (tool === 'horizontal') {
      const price = series.coordinateToPrice(point1.y);
      if (price !== null) {
        const line = series.createPriceLine({
          price,
          color: '#FF6B35',
          lineWidth: 2,
          lineStyle: 0,
          axisLabelVisible: true,
          title: `H-Line ${drawings.length + 1}`,
        });
        drawing = {
          id: Date.now().toString(),
          type: 'horizontal',
          price,
          line,
        };
      }
    } else if (tool === 'vertical') {
      const time = chart.timeScale().coordinateToTime(point1.x);
      if (time !== null) {
        const lineSeries = chart.addLineSeries({
          color: '#FF6B35',
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        });

        // Use fixed values that span a wide price range.
        // Ensure ascending time order by using small offsets around the chosen time.
  const minPrice = 0;
  const maxPrice = 1000000; // Very high default
  const baseRaw = Number((time as any));
  if (!Number.isFinite(baseRaw)) return; // safety
  const base = Math.floor(baseRaw);
  const t1 = base - 1;
  const t2 = base + 1;
        const p1 = { time: t1 as any, value: minPrice };
        const p2 = { time: t2 as any, value: maxPrice };
        lineSeries.setData([p1, p2]);

        drawing = {
          id: Date.now().toString(),
          type: 'vertical',
          time,
          series: lineSeries,
        };
      }
    } else if (tool === 'trend' && point2) {
      const price1 = series.coordinateToPrice(point1.y);
      const price2 = series.coordinateToPrice(point2.y);
      const time1 = chart.timeScale().coordinateToTime(point1.x);
      const time2 = chart.timeScale().coordinateToTime(point2.x);
      if (price1 !== null && price2 !== null && time1 !== null && time2 !== null) {
        const lineSeries = chart.addLineSeries({
          color: '#FF6B35',
          lineWidth: 2,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        // Ensure ascending time order to satisfy lightweight-charts
        const n1Raw = Number((time1 as any));
        const n2Raw = Number((time2 as any));
        if (!Number.isFinite(n1Raw) || !Number.isFinite(n2Raw)) return; // safety
        const n1 = Math.floor(n1Raw);
        const n2 = Math.floor(n2Raw);
        let tA: any = time1 as any;
        let vA = price1;
        let tB: any = time2 as any;
        let vB = price2;
        if (Number.isFinite(n1) && Number.isFinite(n2)) {
          if (n1 === n2) {
            tA = (n1 - 1) as any;
            tB = (n2 + 1) as any;
          } else if (n1 > n2) {
            tA = time2 as any; vA = price2; tB = time1 as any; vB = price1;
          }
        }
        const a = { time: tA, value: vA } as const;
        const b = { time: tB, value: vB } as const;
        lineSeries.setData([a, b]);
        drawing = {
          id: Date.now().toString(),
          type: 'trend',
          start: { time: a.time, price: a.value },
          end: { time: b.time, price: b.value },
          series: lineSeries,
        };
      }
    }
    if (drawing) {
      setDrawings(prev => [...prev, drawing]);
    }
  }, [drawings.length]);

  // Clear all drawings helper
  const clearAllDrawings = useCallback(() => {
    const chart = chartRef.current;
    const s = seriesRef.current;
    drawings.forEach(d => {
      if (d.line && s) {
        try { (s as any).removePriceLine(d.line); } catch {}
      }
      if (d.series && chart) {
        try { chart.removeSeries(d.series); } catch {}
      }
    });
    setDrawings([]);
    drawingStateRef.current.points = [];
    setDrawingTool(null);
  }, [drawings]);
  
  // Drawing tools
  useEffect(() => {
    if (!drawingTool || !chartRef.current) return;
    const handleClick = (param) => {
      if (!param.point) return;
      if (drawingTool === 'horizontal' || drawingTool === 'vertical') {
        createDrawing(drawingTool, param.point);
      } else {
        drawingStateRef.current.points.push(param.point);
        if (drawingStateRef.current.points.length >= 2) {
          createDrawing(drawingTool, drawingStateRef.current.points[0], drawingStateRef.current.points[1]);
          drawingStateRef.current.points = [];
        }
      }
    };
    chartRef.current.subscribeClick(handleClick);
    return () => {
      if (chartRef.current) {
        chartRef.current.unsubscribeClick(handleClick);
      }
    };
  }, [drawingTool, createDrawing]);
  
  // Assets loaded from backend (includes Forex + Crypto). Fallback to popular crypto list if API unavailable.
  const [assetList, setAssetList] = useState<Array<{symbol:string; display?:string; type?:string; payout?:number}>>([]);
  const [assetsLoading, setAssetsLoading] = useState<boolean>(false);
  const cryptoFallbackRef = useRef<string[]>([
    'ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','ADAUSDT','DOGEUSDT','TRXUSDT',
    'MATICUSDT','DOTUSDT','LTCUSDT','LINKUSDT','SHIBUSDT','AVAXUSDT','OPUSDT','ARBUSDT'
  ]);

  // Load tradable assets once (used for dropdown). We reuse /api/trades/assets which already merges forex + crypto.
  useEffect(() => {
    let cancelled = false;
    async function loadAssets() {
      setAssetsLoading(true);
      try {
        const res = await fetch('/api/trades/assets');
        if (!res.ok) throw new Error('Failed to fetch assets');
        const data = await res.json();
        if (cancelled) return;
        const items = Array.isArray(data.assets) ? data.assets : [];
        setAssetList(items);
        // If current pair not in list (e.g., initial default), attempt to switch to first asset
        if (items.length && !items.some(a => a.symbol === pair)) {
          handleSetPair(items[0].symbol);
        }
      } catch (e) {
        if (!cancelled) {
          // Keep silent; will fallback to crypto list
          console.warn('[chart] asset load failed, using fallback list', (e as any)?.message);
        }
      } finally {
        if (!cancelled) setAssetsLoading(false);
      }
    }
    loadAssets();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch candles with resolution based on current timeframe for professional density
  const fetchCandles = async () => {
    // Choose a base interval to allow smooth in-progress bucket updates where it makes sense
    let interval: '1s' | '30s' | '1m' | '5m' | '15m' | '1h' | '1d' = '15m';
    let limit = 1000; // default safety
    switch (tfRef.current) {
      case '5s':
        interval = '1s'; // 1s base for 5s aggregation
        limit = 86400; // 1 day of 1s data (24 hours * 3600 seconds)
        break;
      case '10s':
        interval = '1s';
        limit = 43200; // ~12 hours of 1s data
        break;
      case '15s':
        interval = '1s';
        limit = 43200; // ~12 hours of 1s data
        break;
      case '30s':
        interval = '1s';
        limit = 43200; // ~12 hours of 1s data
        break;
      case '1m':
        interval = '1s'; // sub-minute and 1m use 1s base for smooth updates
        limit = 21600; // ~6 hours of 1s data
        break;
      case '5m':
        interval = '1m'; // aggregate 1m -> 5m
        limit = 2880; // ~2 days of 1m data
        break;
      case '15m':
        interval = '1m'; // aggregate 1m -> 15m for smoother updates
        limit = 4320; // ~3 days of 1m data
        break;
      case '1h':
        interval = '5m'; // aggregate 5m -> 1h
        limit = 2016; // ~1 week of 5m data
        break;
      case '4h':
        interval = '15m'; // aggregate 15m -> 4h
        limit = 2688; // ~4 weeks of 15m data
        break;
      case '1d':
        interval = '1h'; // aggregate 1h -> 1d
        limit = 2160; // ~3 months of 1h data
        break;
      default:
        interval = '15m';
        limit = 1000;
    }
    const res = await fetch(`/api/klines?symbol=${pair}&interval=${interval}&limit=${limit}`);
    const json = await res.json();
    return json.candles as Candle[];
  };

  // Helper: aggregate arbitrary base candles into bucket seconds ensuring one candle per bucket
  const aggregateToBucket = (candles: Candle[], bucketSec: number): Candle[] => {
    if (!candles.length || !bucketSec) return candles;
    const buckets = new Map<number, Candle>();
    for (const c of candles) {
      const tSec = typeof c.time === 'number' ? c.time : (c.time as unknown as number);
      const key = tSec - (tSec % bucketSec);
      const ex = buckets.get(key);
      if (!ex) {
        buckets.set(key, { time: key as any, open: c.open, high: c.high, low: c.low, close: c.close, volume: c.volume });
      } else {
        ex.high = Math.max(ex.high, c.high);
        ex.low = Math.min(ex.low, c.low);
        ex.close = c.close;
        ex.volume = (ex.volume || 0) + (c.volume || 0);
      }
    }
    return Array.from(buckets.entries()).sort((a, b) => a[0] - b[0]).map(([, v]) => v);
  };

  const getBucketSeconds = (tf: typeof tfRef.current): number => {
    switch (tf) {
      case '5s': return 5;
      case '10s': return 10;
      case '15s': return 15;
      case '30s': return 30;
      case '1m': return 60;
      case '5m': return 300;
      case '15m': return 900;
      case '1h': return 3600;
      case '4h': return 14400;
      case '1d': return 86400;
      default: return 900;
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const parent = container.parentElement;
    if (!parent) return;

    const resizeToParent = () => {
      const rect = parent.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      container.style.width = `${rect.width}px`;
      container.style.height = `${rect.height}px`;
      if (chartRef.current) {
        chartRef.current.resize(Math.floor(rect.width), Math.floor(rect.height));
      }
    };

    resizeToParent();

    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => resizeToParent());
      observer.observe(parent);
    } else {
      window.addEventListener('resize', resizeToParent);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      } else {
        window.removeEventListener('resize', resizeToParent);
      }
    };
  }, []);

  const loadCandles = async () => {
    setLoading(true);
    let candles = await fetchCandles();
    // Aggregate for ALL supported timeframes to ensure exactly one candle per bucket
    candles = aggregateToBucket(candles, getBucketSeconds(tfRef.current));
    lastCandlesRef.current = candles;
    if (tradeMarkersSeriesRef.current) {
      try {
        tradeMarkersSeriesRef.current.setData(candles.map((c) => ({ time: c.time as any, value: c.close })));
      } catch {}
    }
    if (!seriesRef.current) {
      activateSeries(chartTypeRef.current);
    } else {
      applySeriesDataForType(chartTypeRef.current);
    }
    lastTimeRef.current = candles.length ? candles[candles.length - 1].time : null;
    if (autoScroll && autoScrollRef.current) {
      try { 
        (chartRef.current as any)?.timeScale()?.scrollToRealTime(); 
        // Maintain smaller candle spacing after scrolling
        const el = containerRef.current;
        if (el && chartRef.current) {
          const width = el.getBoundingClientRect().width || 0;
          if (width > 0) {
            // Increased density: target ~40 bars instead of ~30 at default width
            const spacing = Math.max(6, Math.min(24, Math.floor(width / 40) - 2));
            try { chartRef.current.timeScale().applyOptions({ barSpacing: spacing }); } catch {}
          }
        }
        // Only apply initial zoom if this is the first load or user hasn't interacted
        if (rangeModeRef.current === 'auto') {
          applyZoomToTf(tfRef.current);
        }
      } catch {}
    }
    setLoading(false);
  };

  // =========================
  // Next Candle Countdown
  // =========================
  useEffect(() => {
    let id: any;
    const tick = () => {
      const bucket = getBucketSeconds(tfRef.current);
      // Latest finished (or in-progress) candle start time
      let last = lastTimeRef.current;
      const now = Math.floor(Date.now() / 1000);
      if (!bucket) return;

      // If we don't yet have lastTimeRef (initial load), approximate bucket start
      if (!last) {
        last = now - (now % bucket); // assume we're inside the first bucket
      }
      // If data fetch lagged and "last" is too far in past, jump forward keeping alignment
      if (now - last > bucket * 3) {
        last = now - (now % bucket);
        lastTimeRef.current = last; // sync for subsequent ticks
      }

      const elapsed = now - last;
      const safeElapsed = elapsed < 0 ? 0 : elapsed;
      let remainder = bucket - (safeElapsed % bucket);
      if (remainder === bucket) remainder = 0; // exactly at boundary
      const nextStr = remainder >= 60
        ? `${Math.floor(remainder / 60)}:${(remainder % 60).toString().padStart(2,'0')}`
        : `00:${remainder.toString().padStart(2,'0')}`;
      if (nextStr !== nextCountdownRef.current) {
        nextCountdownRef.current = nextStr;
        setNextCountdown(nextStr);
      }
    };
    tick();
    id = setInterval(tick, 500); // update twice per second for smoothness
    return () => clearInterval(id);
  }, []);

  // Track position of current (last) candle to place countdown next to forming candle
  useEffect(() => {
    if (!chartRef.current || !seriesRef.current) return;
    let raf: number;
    const updatePos = () => {
      try {
        const chart = chartRef.current;
        const series = seriesRef.current as any;
        const last = lastCandlesRef.current[lastCandlesRef.current.length - 1];
        if (!last) return;
        const timeScale = chart.timeScale();
        let x = timeScale.timeToCoordinate(last.time as any);
        // Prefer close price for stable anchor
        const price = last.close ?? last.open;
        let y = series.priceToCoordinate ? series.priceToCoordinate(price) : null;
        // Fallback approximate center if API not available
        if (y == null) {
          const el = containerRef.current;
          if (el) y = el.getBoundingClientRect().height / 2;
        }
        const el = containerRef.current;
        if (!el) return;
        const rectH = el.getBoundingClientRect().height;
        const rectW = el.getBoundingClientRect().width;

        // If x is null (e.g., candle just scrolled out), put timer near right edge center
        if (x == null) {
          x = rectW - 80; // fallback
        } else {
          // If bar spacing available, shift a little right so it doesn't overlap candle
          try {
            const opts: any = (timeScale as any).options?.() || {};
            const spacing = opts.barSpacing || 12;
            x = x + spacing * 0.6;
          } catch {}
        }

        if (y == null) y = rectH / 2;

        // Clamp inside chart area
        const desired = {
          x: Math.min(rectW - 50, Math.max(50, x)),
          y: Math.min(rectH - 30, Math.max(30, y - 14)),
        };
        const prev = countdownPosRef.current;
        if (!prev || Math.abs(prev.x - desired.x) > 0.5 || Math.abs(prev.y - desired.y) > 0.5) {
          countdownPosRef.current = desired;
          setCountdownPos(desired);
        }
      } catch {}
      raf = requestAnimationFrame(updatePos);
    };
    raf = requestAnimationFrame(updatePos);
    return () => cancelAnimationFrame(raf);
  }, []);

  const applyZoomToTf = (next: '5s' | '10s' | '15s' | '30s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d') => {
    const chart = chartRef.current;
    const last = lastTimeRef.current;
    if (!chart || !last) return;
  const PAD_RATIO = 0.45; // keep last bar ~55% from left (near center with slight right bias)
    const enforceBarSpacing = (desiredBars: number) => {
      const el = containerRef.current;
      if (!el) return;
      const width = el.getBoundingClientRect().width || 0;
      if (width <= 0) return;
      // Compute pixels per bar; smaller candles for better visibility
  const spacing = Math.max(8, Math.min(24, Math.floor(width / desiredBars) - 2));
      try { chart.timeScale().applyOptions({ barSpacing: spacing }); } catch {}
    };
    // Visible window presets per timeframe; optimized to show meaningful trading context
    // Target ~20 candles visible by default for a closer look
    const durSec = next === '5s' ? 100      // 20 x 5s = ~1.7 min
      : next === '10s' ? 200    // 20 x 10s = ~3.3 min
      : next === '15s' ? 300    // 20 x 15s = 5 min
      : next === '30s' ? 600    // 20 x 30s = 10 min
      : next === '1m' ? 1200    // 20 x 1m = 20 min
      : next === '5m' ? 6000    // 20 x 5m = 1h 40m
      : next === '15m' ? 18000  // 20 x 15m = 5h
      : next === '1h' ? 72000   // 20 x 1h = 20h (~0.8d)
      : next === '4h' ? 288000  // 20 x 4h = 3.3d
      : 1728000;                // 20 x 1d = 20d
    const to = (last + durSec * PAD_RATIO) as unknown as Time;
    const from = (last - durSec * (1 - PAD_RATIO)) as unknown as Time;
    isProgrammaticRangeChange.current = true;
    chart.timeScale().setVisibleRange({ from, to });
  // Ensure bars are visually sized (≈30 bars on screen for smaller candles)
  // Increased density target from ~30 to ~40 bars
  enforceBarSpacing(40);
    setTimeout(() => { isProgrammaticRangeChange.current = false; }, 0);
  };

  // Timeframe control
  const handleSetTf = (next: '5s' | '10s' | '15s' | '30s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d') => {
    if (tfRef.current === next) return;
    setTf(next);
    tfRef.current = next;
    // Don't reset range mode on timeframe change - preserve user's scroll preference
    // rangeModeRef.current = 'auto';  // Commented out to preserve user preference
    loadCandles();
  };

    // Pair control
  const handleSetPair = (next: string) => {
    if (!next || next === pair) return;
    setPair(next);
    try { onSymbolChange && onSymbolChange(next); } catch {}
    // Don't reset user interaction flags on pair change - preserve user's scroll preference
    // rangeModeRef.current = 'auto';  // Commented out to preserve user preference
    // userInteractedRef.current = false;  // Commented out to preserve user preference
    loadCandles();
  };

  // Convert standard candles to Heikin Ashi candles
  const toHeikinAshi = (candles: Candle[]): Candle[] => {
    if (!candles.length) return [];
    const result: Candle[] = [];
    let prevHAOpen = (candles[0].open + candles[0].close) / 2;
    let prevHAClose = (candles[0].open + candles[0].high + candles[0].low + candles[0].close) / 4;
    for (let i = 0; i < candles.length; i++) {
      const c = candles[i];
      const haClose = (c.open + c.high + c.low + c.close) / 4;
      const haOpen = i === 0 ? prevHAOpen : (prevHAOpen + prevHAClose) / 2;
      const haHigh = Math.max(c.high, haOpen, haClose);
      const haLow = Math.min(c.low, haOpen, haClose);
      result.push({ time: c.time, open: haOpen, high: haHigh, low: haLow, close: haClose, volume: c.volume });
      prevHAOpen = haOpen;
      prevHAClose = haClose;
    }
    return result;
  };

  // Smooth chart type change handler
  const handleChartTypeChange = (newType: typeof chartType) => {
    if (newType === chartType || isChangingType) return;
    
    // Set changing state to prevent multiple clicks
    setIsChangingType(true);
    
    // Update state and rebuild series immediately
    setChartType(newType);
  chartTypeRef.current = newType; // keep ref in sync for interval updates
    setShowTypeMenu(false);
    activateSeries(newType); // use cached series switching
    
    // Reset changing state
    setTimeout(() => setIsChangingType(false), 50);
  };

  const activateSeries = (type: ChartVisualType) => {
    if (!chartRef.current || !lastCandlesRef.current.length) return;
    const chart = chartRef.current;
    const raw = lastCandlesRef.current;
    const previousSeries = seriesRef.current;

    // Hide existing
    Object.values(seriesCacheRef.current).forEach(s => { try { (s as any).applyOptions({ visible:false }); } catch {} });

    // Create via factories
    if (!seriesCacheRef.current[type]) {
      const ctx = { chart, candles: raw, cache: seriesCacheRef.current };
      switch (type) {
        case 'bars':
          seriesCacheRef.current[type] = createBarsSeries(ctx).series; break;
        case 'line':
          seriesCacheRef.current[type] = createLineSeries(ctx).series; break;
        case 'area':
          seriesCacheRef.current[type] = createAreaSeries(ctx).series; break;
        case 'baseline':
          seriesCacheRef.current[type] = createBaselineSeries(ctx).series; break;
        case 'hollow':
          seriesCacheRef.current[type] = createHollowSeries(ctx).series; break;
        case 'heikin':
          seriesCacheRef.current[type] = createHeikinSeries(ctx).series; break;
        case 'candles':
        default:
          seriesCacheRef.current[type] = createCandlesSeries(ctx).series; break;
      }
    }
    const nextSeries = seriesCacheRef.current[type];

    if (previousSeries && previousSeries !== nextSeries) {
      clearPriceLines(previousSeries);
    }

    seriesRef.current = nextSeries;
    try { (seriesRef.current as any).applyOptions({ visible:true }); } catch {}
    rebuildPriceLines(seriesRef.current);

    // Only apply zoom if we're in auto mode and chart is not manually positioned
    if (rangeModeRef.current === 'auto' && autoScrollRef.current) {
      applyZoomToTf(tfRef.current);
    }
  };

  const applySeriesDataForType = (type: ChartVisualType) => {
    if (!seriesRef.current || !lastCandlesRef.current.length) {
      console.log('⚠️ Cannot apply series data: missing series or data');
      return;
    }
    
    const raw = lastCandlesRef.current;
    let source: Candle[] = raw;
    if (type === 'heikin') source = toHeikinAshi(raw);
    
    console.log(`📊 Applying ${type} data with ${source.length} candles`);
    
    // Apply main series data based on chart type
    try {
      if (type === 'candles' || type === 'hollow' || type === 'bars' || type === 'heikin') {
        const ohlc = source.map(c => ({ time: c.time as any, open: c.open, high: c.high, low: c.low, close: c.close }));
        seriesRef.current.setData(ohlc as any);
        console.log(`✅ Applied OHLC data for ${type}`);
      } else if (type === 'line' || type === 'area' || type === 'baseline') {
        const line = source.map(c => ({ time: c.time as any, value: c.close }));
        seriesRef.current.setData(line as any);
        console.log(`✅ Applied line data for ${type}`);
      }
    } catch (error) {
      console.error('❌ Error applying series data:', error);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

  const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#10131a' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: '#222' },
        horzLines: { color: '#222' },
      },
  rightPriceScale: { borderColor: '#333', scaleMargins: { top: 0.06, bottom: 0.12 } },
  timeScale: { borderColor: '#333', timeVisible: true, secondsVisible: false, rightOffset: 6 },
      autoSize: true,
      crosshair: { mode: 1 },
    });
    chartRef.current = chart;
    // Initial spacing so first paint already looks zoomed-in
    try {
      const el = containerRef.current;
      if (el) {
        const width = el.getBoundingClientRect().width || 0;
        const spacing = Math.max(8, Math.min(20, Math.floor(width / 20) - 2));
        chart.timeScale().applyOptions({ barSpacing: spacing });
      }
    } catch {}

        // Resize handler for window changes



    const handleResize = () => {
      chart.applyOptions({ autoSize: true });
      // Keep bars comfortably sized when window changes
      try { chart.timeScale().applyOptions({}); } catch {}
      if (rangeModeRef.current === 'auto') {
        // Re-apply spacing only; don't change time range (user may dislike jumping)
        const el = containerRef.current;
        if (el) {
          const width = el.getBoundingClientRect().width || 0;
          const spacing = Math.max(20, Math.min(80, Math.floor(width / 10) - 6));
          try { chart.timeScale().applyOptions({ barSpacing: spacing }); } catch {}
        }
      }
    };
    window.addEventListener('resize', handleResize);    // Detect user-driven zoom/pan and switch to manual mode
    const unsub = chart.timeScale().subscribeVisibleTimeRangeChange(() => {
      if (isProgrammaticRangeChange.current) return;
      console.log('🔄 User manual scroll detected - switching to manual mode');
      rangeModeRef.current = 'manual';
      autoScrollRef.current = false; // Immediate update for live updates
      setAutoScroll(false); // Phase 1: Auto-disable auto-scroll on manual interaction
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      // Clean up drawing event listeners
      if ((chart as any)._drawingCleanup) {
        (chart as any)._drawingCleanup();
      }
      // Clean up drawings
      drawings.forEach(d => {
        if (d.line && seriesRef.current) {
          try { seriesRef.current.removePriceLine(d.line); } catch {}
        }
        if (d.series) {
          try { chart.removeSeries(d.series); } catch {}
        }
      });
      setDrawings([]);
      clearPriceLines(seriesRef.current);
      if (tradeMarkersSeriesRef.current) {
        try {
          chart.removeSeries(tradeMarkersSeriesRef.current);
        } catch {}
        tradeMarkersSeriesRef.current = null;
      }
      // library uses unsubscribe with same function; here we just remove chart which clears subs
      chart.remove();
      chartRef.current = null;
  seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchCandles().then((candles) => {
      if (!chartRef.current) return;
      
      // Store candles data
      // Aggregate for ALL timeframes so the first draw aligns with selection
      candles = aggregateToBucket(candles, getBucketSeconds(tfRef.current));
      lastCandlesRef.current = candles;
      lastTimeRef.current = candles.length ? candles[candles.length - 1].time : null;
      
      // Create series with data if it doesn't exist
      if (!seriesRef.current) {
  activateSeries(chartTypeRef.current);
      } else {
  applySeriesDataForType(chartTypeRef.current);
      }
      
      // Subscribe to price scale changes for vertical line updates
      // Note: Price scale subscription methods are not available in this version
      // Vertical lines use fixed price ranges and are not dynamically updated
      
      // Update parent component with initial price
      if (candles.length > 0 && onPriceUpdate) {
        const latestCandle = candles[candles.length - 1];
        onPriceUpdate(latestCandle.close);
      }
      
      // Update indicators with new data
      if (candles.length > 0) {
        const intervalSec = getBucketSeconds(tfRef.current);
        update(candles, intervalSec);
      }
      
      if (autoScroll) {
        // Only auto-scroll if the auto-scroll button is ON
        console.log('📊 Pair changed - auto-scroll is ON, scrolling to realtime');
        autoScrollRef.current = true; // Sync the ref
        try { 
          (chartRef.current as any)?.timeScale()?.scrollToRealTime();
          // Maintain smaller candle spacing after scrolling
          const el = containerRef.current;
          if (el && chartRef.current) {
            const width = el.getBoundingClientRect().width || 0;
            if (width > 0) {
              // Increased density on pair change auto-scroll
              const spacing = Math.max(6, Math.min(24, Math.floor(width / 40) - 2));
              try { chartRef.current.timeScale().applyOptions({ barSpacing: spacing }); } catch {}
            }
          }
          // Only apply zoom if we're still in auto mode (first time or reset)
          if (rangeModeRef.current === 'auto') {
            applyZoomToTf(tfRef.current);
          }
        } catch {}
      } else {
        console.log('📊 Pair changed - auto-scroll is OFF, preserving position');
        autoScrollRef.current = false; // Sync the ref
      }
      // If autoScroll is false, preserve current chart position
      setLoading(false);
      
      // Cleanup function for this effect
      return () => {
        // No subscriptions to clean up
      };
    });
    // Phase 1 Fix: More frequent updates with better performance (1 second for live data)
    const fetchingRef = { current: false } as { current: boolean };
    const id = setInterval(() => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      fetchCandles()
        .then((candles) => {
          if (!seriesRef.current) return;
          
          // Aggregate for ALL timeframes to ensure one candle per bucket, updating the last bucket as new base candles arrive
          candles = aggregateToBucket(candles, getBucketSeconds(tfRef.current));
          lastCandlesRef.current = candles;
          // Use ref so latest selected type determines data shape (fixes line series blank issue)
          applySeriesDataForType(chartTypeRef.current);
          lastTimeRef.current = candles.length ? candles[candles.length - 1].time : null;
          
          // Update parent component with latest price
          if (candles.length > 0 && onPriceUpdate) {
            const latestCandle = candles[candles.length - 1];
            onPriceUpdate(latestCandle.close);
          }
          
          // Update indicators with new live data
          if (candles.length > 0) {
            const intervalSec = getBucketSeconds(tfRef.current);
            update(candles, intervalSec);
          }
          
          // Phase 1 Fix: Apply auto-scroll or restore manual position
          if (!autoScrollRef.current) {
            // Auto-scroll is disabled (user has manually scrolled) - preserve current view
            console.log('🚫 Auto-scroll disabled - preserving current view');
            // Do nothing - preserve current view
          } else {
            // Auto-scroll is enabled - follow the latest data
            console.log('📈 Auto-scrolling to latest data with padding');
            try {
              const last = lastTimeRef.current;
              const chart = chartRef.current;
              if (chart && last) {
                const nextTf = tfRef.current;
                // Reuse duration logic
                const durSec = nextTf === '5s' ? 100
                  : nextTf === '10s' ? 200
                  : nextTf === '15s' ? 300
                  : nextTf === '30s' ? 600
                  : nextTf === '1m' ? 1200
                  : nextTf === '5m' ? 6000
                  : nextTf === '15m' ? 18000
                  : nextTf === '1h' ? 72000
                  : nextTf === '4h' ? 288000
                  : 1728000;
                const PAD_RATIO = 0.45;
                const to = (last + durSec * PAD_RATIO) as unknown as Time;
                const from = (last - durSec * (1 - PAD_RATIO)) as unknown as Time;
                isProgrammaticRangeChange.current = true;
                chart.timeScale().setVisibleRange({ from, to });
                // Maintain smaller candle spacing after range change
                const el = containerRef.current;
                if (el) {
                  const width = el.getBoundingClientRect().width || 0;
                  if (width > 0) {
                    // Increased density after range change
                    const spacing = Math.max(6, Math.min(24, Math.floor(width / 40) - 2));
                    try { chart.timeScale().applyOptions({ barSpacing: spacing }); } catch {}
                  }
                }
                setTimeout(() => { isProgrammaticRangeChange.current = false; }, 0);
              }
            } catch {}
          }
        })
        .finally(() => { fetchingRef.current = false; });
    }, 200); // 5 times per second for smooth updates

    return () => clearInterval(id);
  }, [pair]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        margin: 0,
        padding: 0,
        background: '#0b0f16',
        color: '#e5e7eb',
        display: 'grid',
        gridTemplateRows: 'auto 1fr',
        gridTemplateColumns: '1fr',
        gridTemplateAreas: '"header" "main"',
        columnGap: 0,
        rowGap: 0
      }}
    >
      {/* Header Bar (kept minimal: symbol + live status) */}
      <div
        style={{
          gridArea: 'header',
          display: 'grid',
          gridTemplateColumns: '1fr',
          alignItems: 'center',
          gap: 12,
          padding: '12px 16px',
          borderBottom: '1px solid #1f2937',
          background: '#0f1320',
          boxShadow: '0 2px 10px rgba(0,0,0,0.35)',
          position: 'relative',
          zIndex: 5
        }}
      >
        {/* Symbol selector + Live status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', minWidth: 0 }}>
          <div style={{ color: '#9ca3af', fontSize: 12 }}>Symbol</div>
          <select
            value={pair}
            onChange={(e) => handleSetPair(e.target.value)}
            style={{
              background: '#111827', color: '#e5e7eb', border: '1px solid #374151',
              padding: '6px 10px', borderRadius: 6, cursor: 'pointer', minWidth: 200
            }}
          >
            {assetsLoading && <option>Loading...</option>}
            {!assetsLoading && assetList.length === 0 && (
              <>
                <optgroup label="Crypto (Fallback)">
                  {cryptoFallbackRef.current.map(p => (
                    <option key={p} value={p}>{p.replace('USDT','/USDT')}</option>
                  ))}
                </optgroup>
              </>
            )}
            {!assetsLoading && assetList.length > 0 && (
              (() => {
                const forex = assetList.filter(a => a.symbol.includes('_'));
                const crypto = assetList.filter(a => !a.symbol.includes('_'));
                return (
                  <>
                    {forex.length > 0 && (
                      <optgroup label="Forex Pairs">
                        {forex.map(a => (
                          <option key={a.symbol} value={a.symbol}>
                            {(a.display || a.symbol.replace('_','/'))}{a.payout ? ` (${a.payout}%)` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    {crypto.length > 0 && (
                      <optgroup label="Crypto">
                        {crypto.map(a => (
                          <option key={a.symbol} value={a.symbol}>
                            {(a.display || a.symbol.replace('USDT','/USDT'))}{a.payout ? ` (${a.payout}%)` : ''}
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </>
                );
              })()
            )}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%',
              backgroundColor: loading ? '#f59e0b' : '#10b981',
              boxShadow: `0 0 8px ${loading ? '#f59e0b' : '#10b981'}`
            }} />
            {loading ? 'Loading…' : 'Live'}
          </div>
        </div>
      </div>

      {/* Popup Panels */}
      {showIndicators && (
        <IndicatorsPanel
          active={active}
          onAdd={(key) => {
            if (lastCandlesRef.current.length > 0) {
              const intervalSec = getBucketSeconds(tfRef.current);
              add(key, lastCandlesRef.current, intervalSec);
            }
          }}
          onRemove={remove}
          onClear={clear}
          onColorChange={(key, colors) => {
            if (updateColors) {
              updateColors(key, colors);
            }
          }}
          onClose={() => setShowIndicators(false)}
          docked={false}
        />
      )}
      
      {/* Chart Area */}
      <div style={{ gridArea: 'main', display: 'flex', justifyContent: 'center', alignItems: 'stretch', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
        {/* Center wrapper to mimic QuoteX style and leave side space for future widgets */}
        <div style={{ position: 'relative', width: '100%', maxWidth: 1400, flex: 1, margin: '0 auto', height: '100%', minWidth: 0, minHeight: 0 }}>
          <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
          {/* Floating Tools Dock - bottom-left */}
          <div
            style={{
              position: 'absolute',
              left: 14,
              bottom: 14,
              display: 'flex',
              alignItems: 'stretch',
              gap: 10,
              background: 'rgba(13,18,32,0.75)',
              border: '1px solid rgba(36,48,66,0.9)',
              borderRadius: 10,
              padding: '10px 10px',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
              zIndex: 20
            }}
          >
            {/* Vertical tool icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {/* Timeframe toggle button */}
              <button
                title="Timeframes"
                onClick={() => setShowTfTray(v => !v)}
                style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background:'#111827', color:'#e5e7eb', border:'1px solid #374151', borderRadius: 8, cursor: 'pointer' }}
              >TF</button>

              {/* Drawing menu (single entry) */}
              <div style={{ position: 'relative' }}>
                <button
                  title="Drawing Tools"
                  onClick={() => setShowDrawingMenu(s => !s)}
                  style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: drawingTool ? '#1f2937' : '#111827', color:'#e5e7eb', border:'1px solid #374151', borderRadius: 8, cursor: 'pointer' }}
                >🎨</button>
                {showDrawingMenu && (
                  <div style={{ position:'absolute', bottom: '110%', left: 0, background:'#0f1220', border:'1px solid #243042', borderRadius:8, padding:6, display:'grid', gap:4, zIndex:20, minWidth: 180 }}>
                    {[
                      {key:'trend', label:'Trend Line'},
                      {key:'horizontal', label:'Horizontal Line'},
                      {key:'vertical', label:'Vertical Line'},
                      {key:null, label:'None'},
                      {key:'__clear__', label:'Clear All'},
                    ].map(opt => (
                      <button key={String(opt.key)}
                        onClick={() => {
                          if (opt.key === '__clear__') { clearAllDrawings(); setShowDrawingMenu(false); return; }
                          setDrawingTool(opt.key);
                          setShowDrawingMenu(false);
                          if (opt.key) setTradeLineMode(false);
                          drawingStateRef.current.points = [];
                        }}
                        style={{ textAlign:'left', background: (opt.key && drawingTool===opt.key)?'#1f2937':'#111827', color:'#e5e7eb', border:'1px solid #374151', padding:'6px 10px', borderRadius:6, cursor:'pointer' }}
                      >{opt.label}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Trade Lines button removed as requested */}

              {/* Indicators */}
              <button
                title="Indicators"
                onClick={() => setShowIndicators(s => !s)}
                style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: showIndicators ? '#1f2937' : '#111827', color:'#e5e7eb', border:'1px solid #374151', borderRadius: 8, cursor: 'pointer' }}
              >𝌆</button>

              {/* Chart type with popover */}
              <div style={{ position: 'relative' }}>
                <button
                  title="Chart Type"
                  onClick={() => setShowTypeMenu(s => !s)}
                  style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background:'#111827', color:'#e5e7eb', border:'1px solid #374151', borderRadius: 8, cursor: 'pointer' }}
                >T</button>
                {showTypeMenu && (
                  <div style={{ position:'absolute', bottom: '110%', left: 0, background:'#0f1220', border:'1px solid #243042', borderRadius:8, padding:6, display:'grid', gap:4, zIndex:20 }}>
                    {[
                      {key:'candles', label:'Candles'},
                      {key:'hollow', label:'Hollow Candles'},
                      {key:'bars', label:'Bars'},
                      {key:'line', label:'Line'},
                      {key:'area', label:'Area'},
                      {key:'baseline', label:'Baseline'},
                      {key:'heikin', label:'Heikin Ashi'},
                    ].map(opt => (
                      <button key={opt.key}
                        onClick={() => handleChartTypeChange(opt.key as any)}
                        disabled={isChangingType}
                        style={{ textAlign:'left', background: chartType===opt.key?'#1f2937':'#111827', color: isChangingType ? '#666' : '#e5e7eb', border:'1px solid #374151', padding:'6px 10px', borderRadius:6, cursor: isChangingType ? 'wait' : 'pointer', opacity: isChangingType ? 0.6 : 1 }}
                      >{opt.label}</button>
                    ))}
                  </div>
                )}
              </div>

              {/* Auto/Manual */}
              <button
                title="Auto scroll"
                onClick={() => { const newAutoScroll = !autoScroll; setAutoScroll(newAutoScroll); autoScrollRef.current = newAutoScroll; if (newAutoScroll) { rangeModeRef.current = 'auto'; applyZoomToTf(tfRef.current); } }}
                style={{ width: 34, height: 34, display: 'grid', placeItems: 'center', background: autoScroll ? '#059669' : '#111827', color:'#e5e7eb', border:'1px solid #374151', borderRadius: 8, cursor: 'pointer' }}
              >{autoScroll ? 'A' : 'M'}</button>
            </div>

            {/* Divider */}
            <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(55,65,81,0.6)' }} />

            {/* Timeframes tray (toggle) */}
            {showTfTray && (
              <div
                className="no-scrollbar"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 6,
                  padding: '4px 6px',
                  borderRadius: 8,
                  background: 'rgba(7,10,18,0.6)',
                  border: '1px solid #1f2a3a',
                  maxWidth: 560,
                  overflowX: 'auto'
                }}
              >
                {(['5s','10s','15s','30s','1m','5m','15m','1h','4h','1d'] as const).map(iv => {
                  const labelMap: Record<string,string> = { '5s':'5S','10s':'10S','15s':'15S','30s':'30S','1m':'1M','5m':'5M','15m':'15M','1h':'1H','4h':'4H','1d':'1D' };
                  const active = tf === iv;
                  return (
                    <button key={iv}
                      onClick={() => { handleSetTf(iv); setShowTfTray(false); }}
                      style={{
                        background: active? '#1f2937':'#111827', color:'#e5e7eb', border:'1px solid #374151',
                        padding:'6px 10px', borderRadius:6, cursor:'pointer', whiteSpace: 'nowrap',
                        boxShadow: active ? '0 2px 8px rgba(59,130,246,0.25)' : 'none'
                      }}
                    >{labelMap[iv]}</button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timeframe badge like screenshot */}
          <div
            onClick={() => setShowTfTray(v => !v)}
            title="Change timeframe"
            style={{ position: 'absolute', left: 12, bottom: showTfTray ? 70 : 60, background: 'rgba(17,24,39,0.9)', color:'#e5e7eb', border:'1px solid #374151', padding:'4px 8px', borderRadius: 6, fontSize: 12, cursor: 'pointer', userSelect: 'none', zIndex: 15 }}
          >{tf.toUpperCase()}</div>
          
          {/* Trade Lines status overlay removed */}
          
          {/* Drawings Status */}
          {(drawings.length > 0 || drawingTool) && (
            <div
              style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(16, 19, 26, 0.9)',
                color: '#d1d5db',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
                border: '1px solid #333',
                zIndex: 10
              }}
            >
              {drawingTool && (
                <div style={{ color: '#FF6B35', fontWeight: 'bold' }}>
                  🎨 Drawing: {drawingTool}
                </div>
              )}
              {drawings.length > 0 && (
                <div>Drawings: {drawings.length}</div>
              )}
              {drawingTool === 'trend' && drawingStateRef.current.points.length === 1 && (
                <div style={{ fontSize: 10, color: '#888' }}>
                  Click second point for trend line
                </div>
              )}
            </div>
          )}
          
          {/* Countdown overlay (next candle time) - Bottom center like reference */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              bottom: 20,
              transform: 'translateX(-50%)',
              background: 'rgba(31,41,55,0.9)',
              padding: '6px 14px',
              border: '1px solid #475569',
              borderRadius: 6,
              fontSize: 12,
              fontFamily: 'monospace',
              fontWeight: 'bold',
              letterSpacing: 1,
              color: '#f9fafb',
              boxShadow: '0 3px 12px rgba(0,0,0,0.7)',
              pointerEvents: 'none',
              zIndex: 100,
              opacity: nextCountdown === '' ? 0.6 : 1,
              transition: 'all 0.3s ease'
            }}
          >NEXT: {nextCountdown || '00:00'}
          </div>
        </div>
      </div>
    </div>
  );
}
