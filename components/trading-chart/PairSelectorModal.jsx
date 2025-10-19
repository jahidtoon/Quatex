"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { getPairIcon, displayName } from './iconUtils';

const TABS = [
  { key: 'FOREX', label: 'CURRENCIES' },
  { key: 'CRYPTO', label: 'CRYPTO' },
  { key: 'COMMODITY', label: 'COMMODITIES' },
  { key: 'STOCK', label: 'STOCKS' },
];

function percentBadge(value) {
  if (value == null) return null;
  const v = Number(value);
  const color = v >= 0 ? 'text-green-400' : 'text-red-400';
  const bg = v >= 0 ? 'bg-green-400/10 border-green-400/20' : 'bg-red-400/10 border-red-400/20';
  const sign = v > 0 ? '+' : '';
  return (
    <span className={`text-xs ${color} ${bg} border px-1.5 py-0.5 rounded`}>{sign}{v.toFixed(2)}%</span>
  );
}

export default function PairSelectorModal({
  open,
  onClose,
  pairs = [], // [{ symbol, display, payout, type, change24h? }]
  selected,
  onSelect,
}) {
  const [tab, setTab] = useState('FOREX');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) {
      setQuery('');
    }
  }, [open]);

  const grouped = useMemo(() => {
    const m = { FOREX: [], CRYPTO: [], COMMODITY: [], STOCK: [] };
    for (const p of pairs) {
      const t = (p.type || 'FOREX').toUpperCase();
      if (m[t]) m[t].push(p);
      else m.FOREX.push(p);
    }
    for (const k of Object.keys(m)) m[k].sort((a, b) => (a.display||a.symbol).localeCompare(b.display||b.symbol));
    return m;
  }, [pairs]);

  const filtered = useMemo(() => {
    const list = grouped[tab] || [];
    if (!query) return list;
    const q = query.toLowerCase();
    return list.filter(p => (p.display || p.symbol || '').toLowerCase().includes(q));
  }, [grouped, tab, query]);

  if (!open) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-start justify-center bg-black/50">
      <div className="mt-8 w-[900px] max-w-[95vw] bg-[#0b0f16] border border-[#253041] rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#253041] bg-[#0f172a]">
          <h2 className="text-white text-lg font-semibold">Select trade pair</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-xl" aria-label="Close">×</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 py-2 border-b border-[#253041]">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded ${tab===t.key ? 'bg-blue-600 text-white' : 'bg-[#0f172a] text-white/80 hover:text-white border border-[#253041]'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="flex items-center bg-[#0f172a] border border-[#253041] rounded px-3 py-2">
            <span className="text-white/50 mr-2">🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search"
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40"
            />
          </div>
        </div>

        {/* Table */}
        <div className="px-4 pb-4 max-h-[60vh] overflow-auto">
          <table className="w-full text-sm text-white/90">
            <thead className="text-white/60">
              <tr className="border-b border-[#253041]">
                <th className="text-left py-2 w-10"></th>
                <th className="text-left py-2">Name</th>
                <th className="text-right py-2 w-32">24h changing</th>
                <th className="text-right py-2 w-24">Profit 1+ min</th>
                <th className="text-right py-2 w-24">5+ min</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => {
                const name = (p.display || p.symbol || '').replace('_', '/');
                const change = p.change24h;
                const payout = typeof p.payout === 'number' ? `${Math.round(p.payout)}%` : '—';
                return (
                  <tr key={p.symbol} className="border-b border-[#1f2937] hover:bg-white/5">
                    <td className="py-2 text-center">☆</td>
                    <td className="py-2">
                      <button
                        onClick={() => onSelect && onSelect(p.symbol)}
                        className="flex items-center gap-2 text-left text-white hover:underline"
                      >
                        <span className="inline-flex w-5 justify-center">{getPairIcon(p.symbol, p.type, 16)}</span>
                        <span className="font-semibold">{displayName(name)}</span>
                        <span className="text-white/50 text-xs">({p.type || '—'})</span>
                      </button>
                    </td>
                    <td className="py-2 text-right">{percentBadge(change)}</td>
                    <td className="py-2 text-right">{payout}</td>
                    <td className="py-2 text-right">{payout}</td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-white/50">No pairs found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
