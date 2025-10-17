"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import MainAppLayout from '../../components/MainAppLayout';
import P2PHeader from '../components/P2PHeader';

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
    <MainAppLayout currentPage="p2p">
      <div className="min-h-screen bg-gray-900 text-white">
        <P2PHeader title="My P2P Orders" currentPath="/p2p/orders" />
        <div className="p-6">

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
            <div key={o.id} className={`p-6 flex items-center justify-between ${
              o.status === 'PAID' ? 'bg-red-900/20 border-l-4 border-l-red-500' : 
              o.status === 'ESCROW_HELD' ? 'bg-blue-900/20 border-l-4 border-l-blue-500' : ''
            }`}>
              <div>
                <div className="font-semibold flex items-center">
                  {o.side} USD • {o.fiat_currency}
                  {o.status === 'PAID' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-red-600 text-white rounded animate-pulse">
                      <i className="fas fa-exclamation-triangle mr-1"></i>Release Required
                    </span>
                  )}
                  {o.status === 'ESCROW_HELD' && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded">
                      <i className="fas fa-clock mr-1"></i>Awaiting Payment
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-400">{o.amount_asset} USD @ {o.price} {o.fiat_currency} → {o.amount_fiat} {o.fiat_currency}</div>
                <div className="text-xs text-gray-500 flex items-center">
                  Status: <span className={`ml-1 px-2 py-1 rounded text-xs ${
                    o.status === 'ESCROW_HELD' ? 'bg-blue-600' :
                    o.status === 'PAID' ? 'bg-yellow-600' :
                    o.status === 'RELEASED' ? 'bg-green-600' :
                    o.status === 'CANCELED' ? 'bg-red-600' : 'bg-gray-600'
                  }`}>{o.status}</span>
                  <span className="ml-3">Ref: {o.reference_code}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <Link href={`/p2p/order/${o.id}`} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded flex items-center">
                  <i className="fas fa-eye mr-2"></i>View Details
                </Link>
                {o.status === 'PAID' && (
                  <Link href={`/p2p/order/${o.id}`} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded flex items-center animate-pulse">
                    <i className="fas fa-exclamation-triangle mr-2"></i>Release Now
                  </Link>
                )}
                {o.status === 'ESCROW_HELD' && (
                  <Link href={`/p2p/order/${o.id}`} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center">
                    <i className="fas fa-comments mr-2"></i>Chat
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </div>
      </div>
    </MainAppLayout>
  );
}
