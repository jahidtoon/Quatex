"use client";
import React, { useEffect, useState, useCallback } from 'react';

function StatusBadge({ status }) {
  const color = status === 'OPEN' ? 'bg-yellow-600' : status === 'RESOLVED' ? 'bg-green-600' : 'bg-gray-600';
  return <span className={`inline-block text-xs px-2 py-1 rounded ${color}`}>{status}</span>;
}

export default function AdminP2PDisputesPage() {
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [status, setStatus] = useState('OPEN');
  const [q, setQ] = useState('');
  const [resolvingId, setResolvingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('pageSize', String(pageSize));
      if (status && status !== 'ALL') params.set('status', status);
      if (q) params.set('q', q);
      const res = await fetch(`/api/admin/p2p/disputes?${params.toString()}`, { cache: 'no-store' });
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

  async function resolveDispute(id, decision) {
    const note = prompt(`Add a note for ${decision} (optional):`) || '';
    setResolvingId(id);
    try {
      const res = await fetch(`/api/admin/p2p/disputes/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision, note })
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload.error || 'Failed to resolve');
      await load();
      alert('Dispute resolved');
    } catch (e) {
      alert(e.message || 'Failed to resolve');
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <div className="p-6 text-gray-200">
      <h1 className="text-xl font-semibold mb-4">P2P Disputes</h1>

      <div className="flex items-center gap-3 mb-4">
        <select value={status} onChange={(e) => { setPage(1); setStatus(e.target.value); }} className="bg-[#0f1320] border border-[#262b40] rounded px-2 py-1">
          <option value="ALL">All</option>
          <option value="OPEN">Open</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CANCELED">Canceled</option>
        </select>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by reference or email" className="bg-[#0f1320] border border-[#262b40] rounded px-2 py-1 w-72" />
        <button onClick={() => { setPage(1); load(); }} className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-700">Search</button>
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
                <th className="text-left p-2">Order</th>
                <th className="text-left p-2">Side</th>
                <th className="text-left p-2">Asset</th>
                <th className="text-left p-2">Fiat</th>
                <th className="text-left p-2">Raised By</th>
                <th className="text-left p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((d) => (
                <tr key={d.id} className="border-t border-[#262b40]">
                  <td className="p-2">{new Date(d.created_at).toLocaleString()}</td>
                  <td className="p-2"><StatusBadge status={d.status} /></td>
                  <td className="p-2">{d.order?.reference_code || d.order?.id}</td>
                  <td className="p-2">{d.order?.side}</td>
                  <td className="p-2">{d.order?.amount_asset} {d.order?.asset_symbol}</td>
                  <td className="p-2">{d.order?.amount_fiat} {d.order?.fiat_currency}</td>
                  <td className="p-2">{d.raised_by?.email}</td>
                  <td className="p-2">
                    {d.status === 'OPEN' ? (
                      <div className="flex gap-2">
                        <button disabled={resolvingId===d.id} onClick={() => resolveDispute(d.id, 'RELEASE')} className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 disabled:opacity-50">Force Release</button>
                        <button disabled={resolvingId===d.id} onClick={() => resolveDispute(d.id, 'REFUND')} className="px-2 py-1 rounded bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50">Refund Seller</button>
                      </div>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between mt-4">
            <div>Page {data.page} of {Math.max(1, Math.ceil(data.total / data.pageSize))} • {data.total} disputes</div>
            <div className="flex gap-2">
              <button disabled={page<=1} onClick={() => setPage(p => Math.max(1, p-1))} className="px-3 py-1 rounded bg-[#1d2440] disabled:opacity-50">Prev</button>
              <button disabled={data.page * data.pageSize >= data.total} onClick={() => setPage(p => p+1)} className="px-3 py-1 rounded bg-[#1d2440] disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
