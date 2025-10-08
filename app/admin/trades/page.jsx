"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import AdminActionModal from '../components/AdminActionModal';

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return Number(value).toLocaleString();
};

const getStatusBadgeClass = (status) => {
  const normalized = (status || '').toLowerCase();
  if (['win', 'completed', 'success'].includes(normalized)) return 'bg-green-500/20 text-green-400';
  if (['loss', 'failed', 'cancelled'].includes(normalized)) return 'bg-red-500/20 text-red-400';
  if (['pending', 'processing'].includes(normalized)) return 'bg-yellow-500/20 text-yellow-400';
  return 'bg-blue-500/20 text-blue-400';
};

const formatTimestamp = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

export default function AdminTradesPage() {
  const [tradesData, setTradesData] = useState({ items: [], summary: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadTrades = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (params.status && params.status !== 'all') searchParams.set('status', params.status);
      if (params.search) searchParams.set('q', params.search);
      const url = `/api/admin/trades${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load trades (${response.status})`);
      const payload = await response.json();
      setTradesData(payload);
    } catch (err) {
      setError(err.message || 'Unable to load trades');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTrades({ status, search: debouncedSearch });
  }, [status, debouncedSearch, loadTrades]);

  const summary = tradesData.summary || {};
  const trades = tradesData.items || [];

  const tradeCounts = useMemo(() => {
    const open = trades.filter((trade) => !trade.result).length;
    const completed = trades.filter((trade) => Boolean(trade.result)).length;
    return {
      total: summary.totalTrades ?? tradesData.total ?? trades.length,
      open,
      completed
    };
  }, [trades, summary.totalTrades, tradesData.total]);

  const handleViewTrade = (trade) => {
    setSelectedTrade(trade);
    setModalOpen(true);
  };

  return (
    <div>
      <AdminPageHeader
        title="Trades Management"
        subtitle="Monitor and manage all user trading activities in real-time."
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="text-sm text-red-200">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => loadTrades({ status, search: debouncedSearch })}
                className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
              >
                Retry
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-white">{formatNumber(summary.totalTrades ?? tradesData.total)}</div>
          <div className="text-sm text-gray-400">Total Trades</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-400">{formatNumber(summary.openTrades ?? tradeCounts.open)}</div>
          <div className="text-sm text-gray-400">Open Trades</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-400">{formatNumber(tradeCounts.completed)}</div>
          <div className="text-sm text-gray-400">Closed Trades</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-purple-400">${formatNumber(summary.totalVolume)}</div>
          <div className="text-sm text-gray-400">Total Volume</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by user or symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Trades</option>
            <option value="open">Open</option>
            <option value="win">Won</option>
            <option value="loss">Lost</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Trades Table */}
      <Card title="Live Trades">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="text-gray-400 mt-2">Loading trades...</p>
          </div>
        ) : trades.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No trades found for the selected filters.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Symbol</th>
                  <th className="text-left p-3">Direction</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Opened At</th>
                  <th className="text-left p-3">Closed At</th>
                  <th className="text-left p-3">Result</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => {
                  const tradeStatus = trade.result || 'open';
                  return (
                    <tr key={trade.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                      <td className="p-3 font-mono">#{trade.id}</td>
                      <td className="p-3">{trade.user}</td>
                      <td className="p-3 font-semibold">{trade.symbol}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            trade.direction === 'BUY'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {trade.direction}
                        </span>
                      </td>
                      <td className="p-3">${formatNumber(trade.amount)}</td>
                      <td className="p-3 text-gray-400 text-xs">{formatTimestamp(trade.openTime)}</td>
                      <td className="p-3 text-gray-400 text-xs">{formatTimestamp(trade.closeTime)}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(tradeStatus)}`}>
                          {tradeStatus.toString().toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <button
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs"
                          onClick={() => handleViewTrade(trade)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Action Modal */}
      <AdminActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Trade Details"
        actions={
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => setModalOpen(false)}>
            Close
          </button>
        }
      >
        {selectedTrade && (
          <div className="space-y-2 text-left text-sm">
            <div><span className="font-bold text-blue-400">Trade ID:</span> {selectedTrade.id}</div>
            <div><span className="font-bold text-blue-400">User:</span> {selectedTrade.user}</div>
            <div><span className="font-bold text-blue-400">Symbol:</span> {selectedTrade.symbol}</div>
            <div><span className="font-bold text-blue-400">Direction:</span> {selectedTrade.direction}</div>
            <div><span className="font-bold text-blue-400">Amount:</span> ${formatNumber(selectedTrade.amount)}</div>
            <div><span className="font-bold text-blue-400">Opened At:</span> {formatTimestamp(selectedTrade.openTime)}</div>
            <div><span className="font-bold text-blue-400">Closed At:</span> {formatTimestamp(selectedTrade.closeTime)}</div>
            <div>
              <span className="font-bold text-blue-400">Result:</span>{' '}
              <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadgeClass(selectedTrade.result || 'open')}`}>
                {(selectedTrade.result || 'open').toString().toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
