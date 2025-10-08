"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

function getAuthHeader() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return { Authorization: 'Bearer DEVUSER:demo@example.com' };
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('taker');

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true); setError('');
      try {
        const res = await fetch(`/api/p2p/orders?role=${role}`, { headers: { ...getAuthHeader() } });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Failed to load orders');
        if (!abort) setOrders(data.items || []);
      } catch (e) {
        if (!abort) setError(e.message);
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => { abort = true; };
  }, [role]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/p2p" className="text-blue-400 hover:text-blue-300">
          <i className="fas fa-arrow-left"></i> Back to P2P
        </Link>
        <h1 className="text-2xl font-bold">My P2P Orders</h1>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4 flex items-center gap-4">
        <label className="text-sm text-gray-300">View as:</label>
        <select value={role} onChange={(e)=>setRole(e.target.value)} className="bg-gray-700 border border-gray-600 rounded p-2">
          <option value="taker">Taker</option>
          <option value="maker">Maker</option>
          <option value="all">All</option>
        </select>
      </div>

      {loading && <div className="text-gray-300">Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {!loading && !error && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 divide-y divide-gray-700">
          {orders.length === 0 && <div className="p-6 text-gray-400">No orders found.</div>}
          {orders.map(o => (
            <div key={o.id} className="p-6 flex items-center justify-between">
              <div>
                <div className="font-semibold">{o.side} {o.asset_symbol} • {o.fiat_currency}</div>
                <div className="text-sm text-gray-400">{o.amount_asset} @ {o.price} → {o.amount_fiat} {o.fiat_currency}</div>
                <div className="text-xs text-gray-500">Status: {o.status} • Ref: {o.reference_code}</div>
              </div>
              <div className="flex gap-3">
                <Link href={`/p2p/order/${o.id}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded">Open</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
