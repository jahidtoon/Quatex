"use client";
import React, { useEffect, useState, useCallback } from 'react';
import MainAppLayout from '../components/MainAppLayout';

export default function TopPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch('/api/leaderboard?limit=50', { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load leaderboard: ${res.status}`);
      const json = await res.json();
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeaderboard(); }, [fetchLeaderboard]);

  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white min-h-full">
        <div className="bg-gray-800 border-b border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center"><i className="fas fa-crown text-yellow-400 mr-3"></i>TOP Performers</h1>
            <button onClick={fetchLeaderboard} className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
              <i className="fas fa-rotate-right mr-2"></i>Refresh
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading && (
            <div className="p-10 text-center text-gray-400">Loading leaderboard…</div>
          )}
          {error && !loading && (
            <div className="p-6 mb-6 bg-red-900/40 border border-red-700 rounded text-red-300">
              <p className="font-semibold mb-2">Failed to load leaderboard</p>
              <p className="text-sm mb-4">{error}</p>
              <button onClick={fetchLeaderboard} className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded text-sm">Retry</button>
            </div>
          )}

          {!loading && !error && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-xl font-semibold">Leaderboard</h2>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {items.map((row, idx) => (
                    <div key={row.id || idx} className={`flex items-center justify-between p-4 rounded-lg ${row.rank && row.rank <= 3 ? 'bg-gray-700 border border-gray-600' : 'bg-gray-700/70'}`}>
                      <div className="flex items-center gap-4">
                        <div className="text-xl font-bold min-w-[40px] text-yellow-400">{row.rank ?? idx + 1}</div>
                        <div>
                          <div className="font-semibold">{row.name}</div>
                          <div className="text-sm text-gray-400">{row.email}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-semibold">${Number(row.amount || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">Updated {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : ''}</div>
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div className="text-center text-gray-400">No leaderboard entries</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainAppLayout>
  );
}
