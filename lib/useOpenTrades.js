import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';

// Normalizes a raw trade object into consistent shape required by chart overlays
export function normalizeTrade(trade) {
  if (!trade) return null;
  const entryPrice = Number(trade.entryPrice ?? trade.entry_price ?? trade.price ?? 0);
  if (!Number.isFinite(entryPrice) || entryPrice <= 0) return null;
  const openTimeRaw = trade.openTime ?? trade.open_time ?? trade.createdAt ?? trade.created_at;
  const closeTimeRaw = trade.closeTime ?? trade.close_time;
  const openTime = openTimeRaw ? new Date(openTimeRaw).getTime() / 1000 : null; // seconds for markers
  const closeTime = closeTimeRaw ? new Date(closeTimeRaw).getTime() / 1000 : null;
  const direction = (trade.direction || '').toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
  const status = trade.status ?? trade.result ?? 'pending';
  const result = trade.result ?? 'pending';
  return {
    id: trade.id?.toString?.() ?? `${trade.id}`,
    symbol: trade.symbol,
    direction,
    entryPrice,
    amount: Number(trade.amount ?? 0),
    status,
    result,
    openTime,
    closeTime,
  };
}

export function useOpenTrades({ pollMs = 5000, limit = 25, includeRecentClosedSeconds = 300 } = {}) {
  const { token, isAuthenticated } = useAuth();
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastSettleTs, setLastSettleTs] = useState(0);

  const fetchTrades = useCallback(async () => {
    if (!token || !isAuthenticated) {
      setTrades([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trades?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Status ${res.status}: ${txt.slice(0,200)}`);
      }
      const data = await res.json();
      const normalized = Array.isArray(data.trades)
        ? data.trades.map(normalizeTrade).filter(Boolean)
        : [];
      const nowSec = Math.floor(Date.now() / 1000);
      const bucket = normalized.filter(t => {
        if (t.status === 'open' || t.result === 'pending') return true;
        // recently closed
        if ((t.status === 'closed' || ['win','loss'].includes(t.result)) && t.closeTime && includeRecentClosedSeconds) {
          return (nowSec - t.closeTime) <= includeRecentClosedSeconds;
        }
        return false;
      });
      setTrades(bucket);

      // Auto-settle trigger: if we have any open trade whose closeTime passed 10s ago, attempt settle (debounced)
      const overdue = bucket.filter(t => (t.status === 'open' || t.result === 'pending') && t.closeTime && (nowSec - t.closeTime) > 10);
      if (overdue.length && token && (nowSec - lastSettleTs) > 15) {
        setLastSettleTs(nowSec);
        // Fire and forget manual settle to nudge closure
        fetch('/api/trades/settle', { method: 'POST' }).catch(()=>{});
      }
    } catch (e) {
      console.warn('[useOpenTrades] fetch error', e.message);
      setError(e);
      setTrades([]);
    } finally {
      setLoading(false);
    }
  }, [token, isAuthenticated, limit]);

  useEffect(() => {
    fetchTrades();
    if (!pollMs) return;
    const id = setInterval(fetchTrades, pollMs);
    return () => clearInterval(id);
  }, [fetchTrades, pollMs]);

  return { trades, refresh: fetchTrades, loading, error };
}
