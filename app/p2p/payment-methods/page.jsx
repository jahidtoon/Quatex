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

const TYPE_OPTIONS = ['BKASH','NAGAD','BANK','CARDBANK','OTHERS'];

export default function PaymentMethodsPage() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [type, setType] = useState('BKASH');
  const [label, setLabel] = useState('');
  const [details, setDetails] = useState('{}');

  async function load() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/p2p/payment-methods', { headers: { ...getAuthHeader() } });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setMethods(data.methods || []);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function createMethod(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      let parsed = {};
      if (details.trim()) {
        try { parsed = JSON.parse(details); } catch { throw new Error('Details must be valid JSON'); }
      }
      const res = await fetch('/api/p2p/payment-methods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ type, label, details: parsed })
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      setLabel(''); setDetails('{}');
      await load();
    } catch (e) { setError(e.message || 'Failed'); } finally { setCreating(false); }
  }

  async function deactivate(id) {
    if (!confirm('Deactivate this payment method?')) return;
    try {
      const res = await fetch(`/api/p2p/payment-methods/${id}`, { method: 'DELETE', headers: { ...getAuthHeader() } });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Failed to deactivate');
      await load();
    } catch (e) { alert(e.message || 'Failed'); }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/p2p" className="text-blue-400 hover:text-blue-300"><i className="fas fa-arrow-left" /> Back to P2P</Link>
            <h1 className="text-2xl font-bold">Payment Methods</h1>
          </div>
          <Link href="/p2p/post" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded">Post Ad</Link>
        </div>
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {error && <div className="mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-300">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form onSubmit={createMethod} className="bg-gray-800 border border-gray-700 p-5 rounded space-y-4">
            <h2 className="text-lg font-semibold">Add New Method</h2>
            <div>
              <label className="block text-sm mb-1">Type</label>
              <select className="w-full p-3 bg-gray-700 border border-gray-600 rounded" value={type} onChange={(e)=>setType(e.target.value)}>
                {TYPE_OPTIONS.map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Label (optional)</label>
              <input className="w-full p-3 bg-gray-700 border border-gray-600 rounded" value={label} onChange={(e)=>setLabel(e.target.value)} placeholder="e.g., Personal bKash" />
            </div>
            <div>
              <label className="block text-sm mb-1">Details (JSON)</label>
              <textarea className="w-full p-3 bg-gray-700 border border-gray-600 rounded" rows={6} value={details} onChange={(e)=>setDetails(e.target.value)} placeholder='{"number":"01xxxxxxxxx","name":"Your Name"}' />
              <div className="text-xs text-gray-400 mt-1">Provide fields as JSON e.g. number, name, bank, accountNo, etc.</div>
            </div>
            <div>
              <button disabled={creating} className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">{creating? 'Saving…' : 'Add Method'}</button>
            </div>
          </form>

          <div className="bg-gray-800 border border-gray-700 p-5 rounded">
            <h2 className="text-lg font-semibold mb-3">My Methods</h2>
            {loading ? (
              <div>Loading…</div>
            ) : methods.length === 0 ? (
              <div className="text-gray-400">No active methods.</div>
            ) : (
              <div className="space-y-3">
                {methods.map(m => (
                  <div key={m.id} className="border border-gray-700 rounded p-3 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{m.type}{m.label ? ` • ${m.label}` : ''}</div>
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap bg-gray-900/50 p-2 rounded mt-1">{JSON.stringify(m.details || {}, null, 2)}</pre>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>deactivate(m.id)} className="px-3 py-1 rounded bg-red-600 hover:bg-red-700">Deactivate</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
