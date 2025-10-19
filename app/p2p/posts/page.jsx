"use client";
import React, { useEffect, useState } from 'react';
import MainAppLayout from '../../components/MainAppLayout';
import P2PHeader from '../components/P2PHeader';

function getAuthHeader() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return { Authorization: 'Bearer DEVUSER:demo@example.com' };
}

export default function MyPostsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // offer being edited
  const [form, setForm] = useState({ fixed_price: '', min_amount_asset: '', max_amount_asset: '', terms: '' });

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/p2p/my/offers', { headers: { ...getAuthHeader() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to load');
      setItems(json.items || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (offer) => {
    setEditing(offer.id);
    setForm({
      fixed_price: offer.fixed_price ?? '',
      min_amount_asset: offer.min_amount_asset ?? '',
      max_amount_asset: offer.max_amount_asset ?? '',
      terms: offer.terms ?? ''
    });
  };

  const cancelEdit = () => { setEditing(null); };

  const saveEdit = async (id) => {
    try {
      const res = await fetch(`/api/p2p/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({
          fixed_price: Number(form.fixed_price) || null,
          min_amount_asset: Number(form.min_amount_asset) || 0,
          max_amount_asset: Number(form.max_amount_asset) || 0,
          terms: form.terms || null,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to save');
      setEditing(null);
      await load();
    } catch (e) { alert(e.message); }
  };

  const stopOffer = async (id) => {
    if (!confirm('Stop this offer? It will be set to INACTIVE.')) return;
    try {
      const res = await fetch(`/api/p2p/offers/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', ...getAuthHeader() }, body: JSON.stringify({ status: 'INACTIVE' }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to stop');
      await load();
    } catch (e) { alert(e.message); }
  };

  const deleteOffer = async (id) => {
    if (!confirm('Delete this offer?')) return;
    try {
      const res = await fetch(`/api/p2p/offers/${id}`, { method: 'DELETE', headers: { ...getAuthHeader() } });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed to delete');
      await load();
    } catch (e) { alert(e.message); }
  };

  return (
    <MainAppLayout currentPage="p2p">
      <div className="min-h-screen bg-gray-900 text-white">
        <P2PHeader title="P2P Trading" currentPath="/p2p/posts" />

        <div className="p-6">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">My Posts</h2>
              <a href="/p2p/post" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded">+ New Post</a>
            </div>
            {loading && <div className="p-6 text-gray-400">Loading...</div>}
            {error && !loading && <div className="p-6 text-red-400">{error}</div>}
            {!loading && !items.length && !error && (
              <div className="p-6 text-gray-400">No posts yet.</div>
            )}
            {!loading && !!items.length && (
              <div className="divide-y divide-gray-700">
                {items.map((o) => (
                  <div key={o.id} className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold">{o.side} USD · {o.fiat_currency}</div>
                        <div className="text-gray-400 text-sm">Price: {o.fixed_price ? `${o.fixed_price} ${o.fiat_currency}` : '—'} · Limits: {o.min_amount_asset}-{o.max_amount_asset} USD</div>
                        <div className="text-gray-400 text-xs">Status: <span className={o.status === 'ACTIVE' ? 'text-green-400' : 'text-yellow-400'}>{o.status}</span></div>
                        {editing === o.id ? (
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                            <input value={form.fixed_price} onChange={e=>setForm({...form, fixed_price:e.target.value})} placeholder="Fixed Price" className="p-2 bg-gray-700 border border-gray-600 rounded" />
                            <input value={form.min_amount_asset} onChange={e=>setForm({...form, min_amount_asset:e.target.value})} placeholder="Min USD" className="p-2 bg-gray-700 border border-gray-600 rounded" />
                            <input value={form.max_amount_asset} onChange={e=>setForm({...form, max_amount_asset:e.target.value})} placeholder="Max USD" className="p-2 bg-gray-700 border border-gray-600 rounded" />
                            <input value={form.terms} onChange={e=>setForm({...form, terms:e.target.value})} placeholder="Terms" className="p-2 bg-gray-700 border border-gray-600 rounded col-span-1 md:col-span-4" />
                            <div className="col-span-1 md:col-span-4 flex gap-2">
                              <button onClick={()=>saveEdit(o.id)} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Save</button>
                              <button onClick={cancelEdit} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">Cancel</button>
                            </div>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center gap-2">
                        {editing === o.id ? null : (
                          <>
                            <button onClick={()=>startEdit(o)} className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded">Edit</button>
                            {o.status === 'ACTIVE' && (
                              <button onClick={()=>stopOffer(o.id)} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded">Stop</button>
                            )}
                            <button onClick={()=>deleteOffer(o.id)} className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded">Delete</button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainAppLayout>
  );
}
