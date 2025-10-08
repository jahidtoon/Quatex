"use client";
import React, { useEffect, useState, useCallback } from 'react';

export default function AdminP2POffersPage() {
  const [data, setData] = useState({ items: [], page: 1, pageSize: 20, total: 0 });
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (status) params.set('status', status);
      if (q) params.set('q', q);
      const res = await fetch(`/api/admin/p2p/offers?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Failed to load (${res.status})`);
      const payload = await res.json();
      setData(payload);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, status, q]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="p-6 text-gray-200">
      <h1 className="text-xl font-semibold mb-4">P2P Offers</h1>
      <div className="flex items-center gap-3 mb-4">
        <select value={status} onChange={(e)=>{ setPage(1); setStatus(e.target.value); }} className="bg-[#0f1320] border border-[#262b40] rounded px-2 py-1">
          <option value="">All</option>
          <option value="ACTIVE">Active</option>
          <option value="PAUSED">Paused</option>
          <option value="CLOSED">Closed</option>
        </select>
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search asset/fiat/email" className="bg-[#0f1320] border border-[#262b40] rounded px-2 py-1 w-72" />
        <button onClick={()=>{ setPage(1); load(); }} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700">Search</button>
      </div>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-400">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left p-2">Created</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Side</th>
                <th className="text-left p-2">Asset</th>
                <th className="text-left p-2">Fiat</th>
                <th className="text-left p-2">Price</th>
                <th className="text-left p-2">Maker</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((o) => (
                <tr key={o.id} className="border-t border-[#262b40]">
                  <td className="p-2">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="p-2">{o.status}</td>
                  <td className="p-2">{o.side}</td>
                  <td className="p-2">{o.asset_symbol}</td>
                  <td className="p-2">{o.fiat_currency}</td>
                  <td className="p-2">{o.fixed_price || o.margin_percent}</td>
                  <td className="p-2">{o.users?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4">
            <div>Page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))} • {data.total} offers</div>
            <div className="flex gap-2">
              <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1, p-1))} className="px-3 py-1 rounded bg-[#1d2440] disabled:opacity-50">Prev</button>
              <button disabled={data.page * data.pageSize >= data.total} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded bg-[#1d2440] disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
