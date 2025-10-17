"use client";
import React, { useState, useEffect, useCallback } from 'react';
import MainAppLayout from '../components/MainAppLayout';
import { authUtils } from '../../lib/auth';

export default function AnalyticsPage() {
  // Filters (kept minimal; period currently cosmetic)
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Summary (from /api/analytics/summary)
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState(null);
  const [summary, setSummary] = useState(null);

  // Balance audit (debug visual)
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditError, setAuditError] = useState(null);
  const [audit, setAudit] = useState(null);

  // Trades progressive loading
  const PAGE_SIZE = 20;
  const [trades, setTrades] = useState([]);
  const [tradesLoading, setTradesLoading] = useState(false);
  const [tradesError, setTradesError] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true); setSummaryError(null);
    try {
      const token = authUtils.isAuthenticated() ? localStorage.getItem('auth_token') : null;
      if (!token) throw new Error('Authentication required');
      const res = await fetch('/api/analytics/summary', {
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);
      const json = await res.json();
      setSummary(json);
    } catch (e) {
      setSummaryError(e.message);
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchMoreTrades = useCallback(async () => {
    if (tradesLoading || !hasMore) return;
    setTradesLoading(true); setTradesError(null);
    try {
      const token = authUtils.isAuthenticated() ? localStorage.getItem('auth_token') : null;
      if (!token) throw new Error('Authentication required');
      const offset = trades.length;
      const res = await fetch(`/api/trades?limit=${PAGE_SIZE}&offset=${offset}`, {
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`Failed to load trades: ${res.status}`);
      const json = await res.json();
      const newItems = Array.isArray(json.trades) ? json.trades : [];
      setTrades((prev) => [...prev, ...newItems]);
      setHasMore(newItems.length === PAGE_SIZE);
    } catch (e) {
      setTradesError(e.message);
    } finally {
      setTradesLoading(false);
    }
  }, [PAGE_SIZE, trades.length, tradesLoading, hasMore]);

  const resetAndReload = useCallback(() => {
    setTrades([]);
    setHasMore(true);
    fetchSummary();
    // defer trades fetch slightly to allow state reset
    setTimeout(() => { fetchMoreTrades(); }, 0);
  }, [fetchSummary, fetchMoreTrades]);

  const fetchAudit = useCallback(async () => {
    setAuditLoading(true); setAuditError(null);
    try {
      const token = authUtils.isAuthenticated() ? localStorage.getItem('auth_token') : null;
      if (!token) throw new Error('Authentication required');
      const accountType = localStorage.getItem('account_type') || 'live';
      const res = await fetch(`/api/users/balance/audit?limit=50&type=${accountType}`, {
        cache: 'no-store',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!res.ok) throw new Error(`Audit failed: ${res.status}`);
      const json = await res.json();
      setAudit(json);
    } catch (e) {
      setAuditError(e.message);
    } finally {
      setAuditLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
    fetchMoreTrades();
  }, [fetchSummary, fetchMoreTrades]);

  const analytics = summary?.analytics;
  const derived = summary?.derived;

  const stats = {
    totalTrades: analytics?.trading?.totalTrades || 0,
    successRate: derived?.successRate ?? 0,
    totalProfit: derived?.totalProfitApprox ?? 0,
    totalLoss: 0,
    netProfit: derived?.totalProfitApprox ?? 0,
    portfolioValue: analytics?.financial?.netDeposits || 0,
    averageDailyProfit: analytics?.trading?.averageDailyProfit || 0,
  };

  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl md:text-3xl font-bold">Analytics</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button onClick={resetAndReload} className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2">
              <i className="fas fa-rotate-right"></i>
              Refresh
            </button>
            <button
              onClick={() => { setAuditOpen((v) => !v); if (!audit && !auditLoading) fetchAudit(); }}
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <i className="fas fa-clipboard-list"></i>
              {auditOpen ? 'Hide Audit' : 'Audit'}
            </button>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            >
              <option value="1d">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="90d">90 Days</option>
              <option value="1y">1 Year</option>
            </select>
            <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              <i className="fas fa-download mr-2"></i>Export Report
            </button>
          </div>
        </div>
        {/* Removed tabs for a single clean page */}
      </div>

      <div className="p-6">
        {/* Summary Loading / Error states */}
        {summaryLoading && (
          <div className="p-10 text-center text-gray-400">Loading analytics…</div>
        )}
        {summaryError && !summaryLoading && (
          <div className="p-6 mb-6 bg-red-900/40 border border-red-700 rounded text-red-300">
            <p className="font-semibold mb-2">Failed to load analytics</p>
            <p className="text-sm mb-4">{summaryError}</p>
            <button onClick={fetchSummary} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm">Retry</button>
          </div>
        )}

        {/* Summary Header */}
        {!summaryLoading && !summaryError && (
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 p-6 rounded-lg mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-gray-300 mb-1">Total Trades</div>
                <div className="text-3xl font-bold">{stats.totalTrades}</div>
              </div>
              <div>
                <div className="text-sm text-gray-300 mb-1">Win Rate</div>
                <div className="text-3xl font-bold text-green-400">{stats.successRate}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-300 mb-1">Net Deposits</div>
                <div className="text-3xl font-bold">${Number(analytics?.financial?.netDeposits||0).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-300 mb-1">Avg Daily Profit</div>
                <div className={`text-3xl font-bold ${Number(stats.averageDailyProfit||0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  ${Number(stats.averageDailyProfit||0).toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Real Trades - Progressive loading */}
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          {/* Balance Audit (toggle) */}
          {auditOpen && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Balance Audit (last 50 events)</h3>
              {auditLoading && <div className="text-gray-400 text-sm">Loading audit…</div>}
              {auditError && (
                <div className="p-3 mb-3 bg-red-900/40 border border-red-700 rounded text-red-300 text-sm">{auditError}</div>
              )}
              {audit && (
                <div className="text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-gray-300">Inferred Start</div>
                      <div className="font-semibold">${Number(audit.inferredStartingBalance||0).toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-gray-300">Total Delta</div>
                      <div className="font-semibold">${Number(audit.totalDelta||0).toFixed(2)}</div>
                    </div>
                    <div className="bg-gray-700 rounded p-3">
                      <div className="text-gray-300">Current Balance</div>
                      <div className="font-semibold">${Number(audit.currentBalance||0).toFixed(2)}</div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-xs">
                      <thead className="text-gray-300">
                        <tr>
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">Event</th>
                          <th className="py-2 pr-4">Delta</th>
                          <th className="py-2 pr-4">Running</th>
                        </tr>
                      </thead>
                      <tbody className="text-gray-200">
                        {audit.events?.map((e) => (
                          <tr key={`${e.type}-${e.id}-${e.ts}`} className="border-t border-gray-700">
                            <td className="py-2 pr-4">{new Date(e.ts).toLocaleString()}</td>
                            <td className="py-2 pr-4">{e.label}</td>
                            <td className={`py-2 pr-4 ${e.delta >= 0 ? 'text-green-400' : 'text-red-400'}`}>{e.delta >= 0 ? `+$${Number(e.delta).toFixed(2)}` : `-$${Math.abs(Number(e.delta)).toFixed(2)}`}</td>
                            <td className="py-2 pr-4">${Number(e.runningBalance).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Trades</h2>
            <div className="text-sm text-gray-400">Showing {trades.length}+</div>
          </div>

          {/* Trades error */}
          {tradesError && (
            <div className="p-4 mb-4 bg-red-900/40 border border-red-700 rounded text-red-300">
              <div className="flex items-center justify-between">
                <span>{tradesError}</span>
                <button onClick={fetchMoreTrades} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-xs">Retry</button>
              </div>
            </div>
          )}

          {/* Trades list */}
          <div className="space-y-3">
            {trades.map((t) => {
              const res = (t.result || '').toString().toLowerCase();
              const isWin = res === 'win';
              const isLoss = res === 'loss';
              const amount = Number(t.amount || 0);
              const payout = Number(t.payout || 0);
              const profit = isWin ? `+$${payout.toFixed(2)}` : isLoss ? `-$${amount.toFixed(2)}` : '—';
              const ts = t.closeTime || t.openTime;
              const time = ts ? new Date(ts).toLocaleString() : '';
              return (
                <div key={t.id} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${isWin ? 'bg-green-400' : isLoss ? 'bg-red-400' : 'bg-yellow-400'}`}></div>
                      <div>
                        <div className="font-semibold">{t.symbol}</div>
                        <div className="text-sm text-gray-400">{t.direction} • ${amount.toFixed(2)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${isWin ? 'text-green-400' : isLoss ? 'text-red-400' : 'text-gray-300'}`}>{profit}</div>
                      <div className="text-sm text-gray-400">{time}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load more */}
          <div className="mt-6 flex items-center justify-center">
            {hasMore ? (
              <button
                disabled={tradesLoading}
                onClick={fetchMoreTrades}
                className={`px-4 py-2 rounded-lg ${tradesLoading ? 'bg-gray-700 text-gray-400' : 'bg-gray-600 hover:bg-gray-500'}`}
              >
                {tradesLoading ? 'Loading…' : 'Load more'}
              </button>
            ) : (
              <div className="text-gray-400 text-sm">No more trades</div>
            )}
          </div>
        </div>
      </div>
    </div>
    </MainAppLayout>
  );
}
