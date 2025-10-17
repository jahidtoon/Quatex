"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return Number(value).toLocaleString();
};

const formatCurrency = (value) => `$${formatNumber(value || 0)}`;

const statusLabel = (value) => {
  const normalized = (value || 'Unknown').toLowerCase();
  if (normalized.includes('active')) return 'Active';
  if (normalized.includes('upcoming')) return 'Upcoming';
  if (normalized.includes('complete')) return 'Completed';
  return value || 'Unknown';
};

const statusBadge = (status) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('active')) return 'bg-green-600/20 text-green-400';
  if (normalized.includes('upcoming')) return 'bg-blue-600/20 text-blue-400';
  if (normalized.includes('complete')) return 'bg-gray-600/20 text-gray-400';
  return 'bg-gray-600/20 text-gray-300';
};

const formatTimestamp = (value) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString();
  } catch (err) {
    return value;
  }
};

export default function TournamentsPage() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  const fetchTournaments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/tournaments', { 
        cache: 'no-store',
        credentials: 'include'
      });
      if (!response.ok) throw new Error(`Failed to load tournaments (${response.status})`);
      const payload = await response.json();
      setTournaments(Array.isArray(payload.tournaments) ? payload.tournaments : payload.items || []);
    } catch (err) {
      setError(err.message || 'Unable to load tournaments');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  const stats = useMemo(() => {
    if (!Array.isArray(tournaments) || tournaments.length === 0) {
      return {
        total: 0,
        active: 0,
        participants: 0,
        prizePool: 0
      };
    }
    const active = tournaments.filter((t) => (t.status || '').toLowerCase().includes('active')).length;
    const participants = tournaments.reduce((sum, t) => sum + (t._count?.participants || t.current_participants || 0), 0);
    const prizePool = tournaments.reduce((sum, t) => sum + Number(t.total_prize_pool || 0), 0);
    return {
      total: tournaments.length,
      active,
      participants,
      prizePool
    };
  }, [tournaments]);

  const statusOptions = useMemo(() => {
    if (!Array.isArray(tournaments)) return ['all'];
    const uniqueStatuses = new Set(tournaments.map((t) => statusLabel(t.status).toLowerCase()));
    return ['all', ...Array.from(uniqueStatuses).filter(Boolean)];
  }, [tournaments]);

  const filteredTournaments = Array.isArray(tournaments) ? tournaments.filter((t) => {
    if (selectedStatus === 'all') return true;
    return statusLabel(t.status).toLowerCase() === selectedStatus;
  }) : [];

  return (
    <div>
      <AdminPageHeader
        title="Trading Tournaments"
        subtitle="Manage trading competitions and challenges"
        actions={
          <button 
            onClick={() => router.push('/admin/tournaments/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Create Tournament
          </button>
        }
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="text-sm text-red-200 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={fetchTournaments}
              className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Tournaments" value={formatNumber(stats.total)} hint="All records" />
        <StatCard label="Active" value={formatNumber(stats.active)} hint="Currently running" />
        <StatCard label="Participants" value={formatNumber(stats.participants)} hint="Registered traders" />
        <StatCard label="Prize Pool" value={formatCurrency(stats.prizePool)} hint="Aggregate rewards" />
      </div>

      <Card title="Tournament Management">
        <div className="p-4 border-b border-[#262b40] flex flex-wrap gap-2">
          {statusOptions.map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
            Loading tournaments...
          </div>
        ) : filteredTournaments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">🏆</div>
            <div className="text-lg mb-2">No tournaments found</div>
            <div className="text-sm">Adjust the filters or create a new tournament.</div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {filteredTournaments.map((tournament) => (
              <div key={tournament.id} className="bg-[#1a1f33] rounded-lg p-4 border border-[#262b40]">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{tournament.title || 'Untitled Tournament'}</h3>
                    <p className="text-xs text-gray-400">Created {formatTimestamp(tournament.created_at)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge(tournament.status)}`}>
                    {statusLabel(tournament.status)}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Duration</div>
                    <div className="font-medium">
                      {tournament.start_date && tournament.end_date 
                        ? `${new Date(tournament.start_date).toLocaleDateString()} - ${new Date(tournament.end_date).toLocaleDateString()}`
                        : '—'
                      }
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Participants</div>
                    <div className="font-medium text-blue-400">
                      {formatNumber(tournament._count?.participants || tournament.current_participants || 0)}
                      {tournament.max_participants ? `/${tournament.max_participants}` : ''}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Prize Pool</div>
                    <div className="font-medium text-green-400">{formatCurrency(tournament.total_prize_pool)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase tracking-wider">Entry Fee</div>
                    <div className="font-medium text-gray-200">{formatCurrency(tournament.entry_fee)}</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 justify-between items-center">
                  <div className="text-xs text-gray-400">
                    ID: <span className="font-mono text-gray-300">{tournament.id}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      View Details
                    </button>
                    <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                      Manage Participants
                    </button>
                    <button className="px-3 py-1 bg-[#262b40] text-gray-300 rounded text-sm hover:bg-[#2a3142]">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
