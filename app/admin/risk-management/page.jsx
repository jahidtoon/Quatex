"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

const formatNumber = (value = 0, options = {}) => {
  const number = Number(value) || 0;
  return number.toLocaleString(undefined, options);
};

const formatCurrency = (value = 0) => {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(2)}M`;
  }
  if (amount >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toFixed(2)}`;
};

const formatDateTime = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch (err) {
    return value;
  }
};

const classifyExposureLevel = (amount = 0) => {
  if (amount >= 25_000) return 'critical';
  if (amount >= 10_000) return 'high';
  if (amount >= 5_000) return 'medium';
  return 'low';
};

const exposureStyles = {
  critical: 'bg-red-600/20 border-red-600/40 text-red-200',
  high: 'bg-orange-600/20 border-orange-600/40 text-orange-200',
  medium: 'bg-yellow-600/20 border-yellow-600/40 text-yellow-200',
  low: 'bg-blue-600/20 border-blue-600/40 text-blue-200'
};

export default function RiskManagementPage() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRiskData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/risk-management', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load risk metrics (${response.status})`);
      const payload = await response.json();
      setRiskData(payload);
    } catch (err) {
      setError(err.message || 'Unable to load risk metrics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRiskData();
  }, [fetchRiskData]);

  const stats = useMemo(() => {
    if (!riskData) {
      return {
        totalExposure: 0,
        totalTrades: 0,
        averageTrade: 0,
        totalBalance: 0,
        pendingWithdrawals: 0
      };
    }

    return {
      totalExposure: riskData.exposure?.totalVolume || 0,
      totalTrades: riskData.exposure?.totalTrades || 0,
      averageTrade: riskData.exposure?.averageTradeSize || 0,
      totalBalance: riskData.balances?.total || 0,
      pendingWithdrawals: riskData.pendingWithdrawals || 0
    };
  }, [riskData]);

  const userExposure = useMemo(() => {
    if (!riskData?.highExposureTrades?.length) return [];

    const aggregated = new Map();

    riskData.highExposureTrades.forEach((trade) => {
      const key = trade.user || 'Unknown';
      const entry = aggregated.get(key) || {
        user: key,
        total: 0,
        trades: 0,
        maxTrade: 0,
        symbols: new Set()
      };

      const amount = Number(trade.amount) || 0;
      entry.total += amount;
      entry.trades += 1;
      entry.maxTrade = Math.max(entry.maxTrade, amount);
      if (trade.symbol) entry.symbols.add(trade.symbol);
      aggregated.set(key, entry);
    });

    return Array.from(aggregated.values())
      .map((entry) => ({
        ...entry,
        symbols: Array.from(entry.symbols)
      }))
      .sort((a, b) => b.total - a.total);
  }, [riskData]);

  const topSymbols = riskData?.topSymbols || [];
  const highExposure = riskData?.highExposureTrades || [];

  return (
    <div>
      <AdminPageHeader
        title="Risk Management"
        subtitle="Monitor real-time exposure, balances, and high-risk trades"
        actions={
          <div className="flex gap-2">
            <button
              onClick={fetchRiskData}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">
              🚨 Emergency Stop
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium">
              📊 Export Report
            </button>
          </div>
        }
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="flex items-center justify-between text-sm text-red-200">
            <span>{error}</span>
            <button
              onClick={fetchRiskData}
              className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="Total Exposure" value={formatCurrency(stats.totalExposure)} hint="Aggregate trade volume" />
        <StatCard label="Total Trades" value={formatNumber(stats.totalTrades)} hint="Tracked positions" />
        <StatCard label="Average Trade" value={formatCurrency(stats.averageTrade)} hint="Mean trade size" />
        <StatCard label="Total Balance" value={formatCurrency(stats.totalBalance)} hint="Sum of user balances" />
        <StatCard label="Pending Withdrawals" value={formatNumber(stats.pendingWithdrawals)} hint="Awaiting review" />
      </div>

      <div className="mb-6">
        <div className="flex space-x-1">
          {['overview', 'alerts', 'limits', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                selectedTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Card title="Exposure Overview">
            {loading ? (
              <div className="p-6 text-center text-gray-400">Loading exposure metrics…</div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Volume</span>
                  <span className="text-blue-300 font-medium">{formatCurrency(riskData?.exposure?.totalVolume)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Trades</span>
                  <span className="text-blue-300 font-medium">{formatNumber(riskData?.exposure?.totalTrades)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Average Trade Size</span>
                  <span className="text-blue-300 font-medium">{formatCurrency(riskData?.exposure?.averageTradeSize)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Pending Withdrawals</span>
                  <span className="text-yellow-300 font-medium">{formatNumber(riskData?.pendingWithdrawals)}</span>
                </div>
              </div>
            )}
          </Card>

          <Card title="Balance Insights">
            {loading ? (
              <div className="p-6 text-center text-gray-400">Loading balance metrics…</div>
            ) : (
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Total Balance</span>
                  <span className="text-green-300 font-medium">{formatCurrency(riskData?.balances?.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Average Balance</span>
                  <span className="text-green-300 font-medium">{formatCurrency(riskData?.balances?.average)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Accounts Monitored</span>
                  <span className="text-green-300 font-medium">{formatNumber(riskData?.exposure?.totalTrades)}</span>
                </div>
                <p className="text-xs text-gray-500">
                  Balance insights aggregate all users currently contributing to exposure metrics.
                </p>
              </div>
            )}
          </Card>

          <Card title="Top Symbols by Volume">
            {loading ? (
              <div className="p-6 text-center text-gray-400">Loading symbol data…</div>
            ) : topSymbols.length === 0 ? (
              <div className="p-6 text-center text-gray-400">No symbol exposure data available.</div>
            ) : (
              <div className="p-6 space-y-4">
                {topSymbols.map((entry, index) => (
                  <div key={entry.symbol || index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-gray-400">#{index + 1}</span>
                      <span className="font-medium text-white">{entry.symbol || 'Unknown'}</span>
                    </div>
                    <span className="text-blue-300 text-sm">{formatCurrency(entry.volume)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {selectedTab === 'alerts' && (
        <Card title="High Exposure Trades">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading high exposure trades…</div>
          ) : highExposure.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No elevated exposure detected.</div>
          ) : (
            <div className="p-4 space-y-3">
              {highExposure.map((trade) => {
                const level = classifyExposureLevel(trade.amount);
                return (
                  <div key={trade.id} className={`p-4 border rounded-lg ${exposureStyles[level]}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-white">{trade.symbol || 'Unknown Instrument'}</h4>
                        <p className="text-sm text-gray-200">{trade.user || 'Unknown trader'}</p>
                      </div>
                      <span className="px-3 py-1 text-xs font-medium bg-[#0f1320]/60 rounded-full uppercase">
                        {level}
                      </span>
                    </div>
                    <div className="flex flex-wrap justify-between gap-3 text-sm text-gray-300">
                      <span>Exposure: <span className="text-white font-medium">{formatCurrency(trade.amount)}</span></span>
                      <span>Opened: <span className="text-white font-medium">{formatDateTime(trade.openTime)}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {selectedTab === 'limits' && (
        <Card title="Symbol Exposure Utilization">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading symbol exposure…</div>
          ) : topSymbols.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No symbol utilization metrics available.</div>
          ) : (
            <div className="p-6 space-y-4">
              {topSymbols.map((entry) => {
                const volume = Number(entry.volume) || 0;
                const maxVolume = Number(topSymbols[0].volume) || 1;
                const utilization = Math.min(100, Math.round((volume / maxVolume) * 100));
                return (
                  <div key={entry.symbol} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-white font-medium">{entry.symbol}</span>
                      <span className="text-gray-400">{formatCurrency(volume)}</span>
                    </div>
                    <div className="w-full bg-[#1f2338] h-2 rounded-full">
                      <div
                        className={`h-2 rounded-full ${
                          utilization > 85 ? 'bg-red-500' : utilization > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${utilization}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}

      {selectedTab === 'users' && (
        <Card title="Users with Elevated Exposure">
          {loading ? (
            <div className="p-6 text-center text-gray-400">Loading user exposure…</div>
          ) : userExposure.length === 0 ? (
            <div className="p-6 text-center text-gray-400">No users flagged for exposure risk.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#101527] text-gray-300">
                  <tr>
                    <th className="text-left p-4">User</th>
                    <th className="text-left p-4">Total Exposure</th>
                    <th className="text-left p-4">Trades</th>
                    <th className="text-left p-4">Largest Trade</th>
                    <th className="text-left p-4">Symbols</th>
                  </tr>
                </thead>
                <tbody>
                  {userExposure.map((entry) => (
                    <tr key={entry.user} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                      <td className="p-4 text-white">{entry.user}</td>
                      <td className="p-4 text-blue-300 font-medium">{formatCurrency(entry.total)}</td>
                      <td className="p-4 text-gray-300">{formatNumber(entry.trades)}</td>
                      <td className="p-4 text-gray-300">{formatCurrency(entry.maxTrade)}</td>
                      <td className="p-4 text-gray-300">{entry.symbols.join(', ') || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
