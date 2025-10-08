"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return Number(value).toLocaleString();
};

const formatCurrency = (value) => `$${formatNumber(value || 0)}`;

const formatTimestamp = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/leaderboard', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load leaderboard (${response.status})`);
      const payload = await response.json();
      setLeaders(payload);
    } catch (err) {
      setError(err.message || 'Unable to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const stats = useMemo(() => {
    if (leaders.length === 0) {
      return {
        totalTraders: 0,
        topScore: 0,
        averageScore: 0,
        lastUpdated: null
      };
    }
    const totalTraders = leaders.length;
    const totalAmount = leaders.reduce((sum, trader) => sum + (trader.amount || 0), 0);
    const topScore = leaders[0]?.amount || 0;
    const lastUpdated = leaders[0]?.updatedAt || null;
    return {
      totalTraders,
      topScore,
      averageScore: totalTraders ? totalAmount / totalTraders : 0,
      lastUpdated
    };
  }, [leaders]);

  return (
    <div>
      <AdminPageHeader
        title="Trading Leaderboard"
        subtitle="Top performing traders and ranking statistics"
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="text-sm text-red-200 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchLeaderboard}
              className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Traders" value={formatNumber(stats.totalTraders)} hint="Participants with ranking" />
        <StatCard label="Top Score" value={formatCurrency(stats.topScore)} hint="Highest balance" />
        <StatCard label="Average Score" value={formatCurrency(stats.averageScore)} hint="Across all ranked traders" />
        <StatCard label="Last Updated" value={formatTimestamp(stats.lastUpdated)} hint="Most recent leaderboard update" />
      </div>

      <Card title="Top Traders">
        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
            Loading leaderboard...
          </div>
        ) : leaders.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No leaderboard entries available.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-4">Rank</th>
                  <th className="text-left p-4">Trader</th>
                  <th className="text-left p-4">Email</th>
                  <th className="text-left p-4">Score</th>
                  <th className="text-left p-4">Last Update</th>
                </tr>
              </thead>
              <tbody>
                {leaders.map((trader) => (
                  <tr key={trader.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-4 font-bold text-lg text-blue-400">#{trader.rank ?? '—'}</td>
                    <td className="p-4">
                      <div className="font-medium text-white">{trader.name}</div>
                    </td>
                    <td className="p-4 text-gray-400">{trader.email}</td>
                    <td className="p-4 font-semibold text-green-400">{formatCurrency(trader.amount)}</td>
                    <td className="p-4 text-xs text-gray-400">{formatTimestamp(trader.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
