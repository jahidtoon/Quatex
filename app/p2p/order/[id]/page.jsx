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

export default function OrderDetailPage({ params }) {
  const { id } = params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [chat, setChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  async function load() {
    setLoading(true); setError('');
    try {
      const res = await fetch(`/api/p2p/orders/${id}`, { headers: { ...getAuthHeader() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load order');
      setOrder(data.order);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [id]);

  async function loadChat() {
    setChatLoading(true);
    try {
      const res = await fetch(`/api/p2p/orders/${id}/messages`, { headers: { ...getAuthHeader() } });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to load messages');
      setChat(data.items || []);
    } catch (e) {
      // ignore
    } finally {
      setChatLoading(false);
    }
  }

  useEffect(() => {
    let timer;
    loadChat();
    timer = setInterval(loadChat, 4000);
    return () => clearInterval(timer);
  }, [id]);

  async function sendMessage() {
    const text = chatInput.trim();
    if (!text) return;
    setChatInput('');
    try {
      const res = await fetch(`/api/p2p/orders/${id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ message: text })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d?.error || 'Failed to send');
      }
      await loadChat();
    } catch (e) {
      alert(e.message);
    }
  }

  async function postAction(actionPath) {
    setBusy(true);
    try {
      const res = await fetch(`/api/p2p/orders/${id}/${actionPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Action failed');
      await load();
      alert('Success');
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <Link href="/p2p/orders" className="text-blue-400 hover:text-blue-300">
          <i className="fas fa-arrow-left"></i> Back to Orders
        </Link>
        <h1 className="text-2xl font-bold">Order Detail</h1>
      </div>

      {loading && <div className="text-gray-300">Loading...</div>}
      {error && <div className="text-red-400">{error}</div>}

      {order && (
        <div className="bg-gray-800 border border-gray-700 rounded p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-lg">{order.side} {order.asset_symbol} • {order.fiat_currency}</div>
              <div className="text-sm text-gray-400">{order.amount_asset} @ {order.price} → {order.amount_fiat} {order.fiat_currency}</div>
              <div className="text-xs text-gray-500">Status: {order.status} • Ref: {order.reference_code}</div>
            </div>
          </div>

          <div className="flex gap-3">
            {(order.status === 'ESCROW_HELD' || order.status === 'PENDING') && (
              <button disabled={busy} onClick={()=>postAction('mark-paid')} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded">Mark as Paid</button>
            )}
            {order.status === 'PAID' && (
              <button disabled={busy} onClick={()=>postAction('release')} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Release</button>
            )}
            {['ESCROW_HELD','PENDING','PAID'].includes(order.status) && (
              <button disabled={busy} onClick={()=>postAction('cancel')} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">Cancel</button>
            )}
          </div>

          {/* Chat Panel */}
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Chat</h3>
            <div className="h-64 overflow-y-auto bg-gray-900 border border-gray-700 rounded p-3 space-y-3">
              {chatLoading && <div className="text-gray-400">Loading messages...</div>}
              {chat.length === 0 && !chatLoading && <div className="text-gray-500">No messages yet.</div>}
              {chat.map(m => (
                <div key={m.id} className="text-sm">
                  <span className="text-gray-400 mr-2">[{new Date(m.created_at).toLocaleTimeString()}]</span>
                  <span className="text-indigo-300">{m.sender_id === order.maker_id ? 'Seller' : (m.sender_id === order.taker_id ? 'Buyer' : 'User')}</span>:
                  <span className="ml-2">{m.message}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <input value={chatInput} onChange={(e)=>setChatInput(e.target.value)} placeholder="Type a message" className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded"/>
              <button onClick={sendMessage} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
