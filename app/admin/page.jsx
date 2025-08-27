"use client";
import React, { useEffect, useState } from 'react';
import AdminPageHeader from './components/AdminPageHeader';
import StatCard from './components/StatCard';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
  const res = await fetch('/api/admin/stats', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load stats');
        if (mounted) setStats(data);
      } catch (e) {
        if (mounted) setError(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="Key system metrics and health." />
      {loading && <div className="text-gray-400">Loading...</div>}
      {error && <div className="text-red-400 mb-4">{error}</div>}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Users" value={stats.usersCount} />
          <StatCard label="Active Pairs" value={stats.activePairs} />
          <StatCard label="Candles" value={stats.candlesCount} />
          <StatCard label="Admins" value={stats.adminsCount} />
        </div>
      )}
    </div>
  );
}
