"use client";
import React, { useEffect, useMemo, useState } from 'react';

export default function AdminPairsPage() {
  const emptyForm = useMemo(() => ({ id: null, base: '', quote: '', symbol: '', display: '', payout: '', status: 'ACTIVE', provider: '', provider_symbol: '', price_decimals: '' }), []);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize) });
  const res = await fetch(`/api/admin/currency-pairs?${params.toString()}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setData(json);
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const startCreate = () => setForm(emptyForm);
  const startEdit = (item) => setForm({
    id: item.id,
    base: item.base || '',
    quote: item.quote || '',
    symbol: item.symbol || '',
    display: item.display || '',
    payout: item.payout ?? '',
    status: item.status || 'ACTIVE',
    provider: item.provider || '',
    provider_symbol: item.provider_symbol || '',
    price_decimals: item.price_decimals ?? '',
  });

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        base: form.base.trim(),
        quote: form.quote.trim(),
        symbol: form.symbol.trim(),
        display: form.display.trim(),
        payout: form.payout === '' ? null : Number(form.payout),
        status: form.status,
        provider: form.provider.trim() || null,
        provider_symbol: form.provider_symbol.trim() || null,
        price_decimals: form.price_decimals === '' ? null : Number(form.price_decimals),
      };
      let res, json;
      if (form.id) {
  res = await fetch(`/api/admin/currency-pairs/${form.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
      } else {
  res = await fetch('/api/admin/currency-pairs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
      }
      json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Save failed');
      await load();
      setForm(emptyForm);
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Delete this pair?')) return;
    try {
  const res = await fetch(`/api/admin/currency-pairs/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        throw new Error(j.error || 'Delete failed');
      }
      await load();
    } catch (e) { setError(e.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Currency Pairs</h1>
        <div className="flex gap-2">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search symbol/base/quote" className="px-3 py-2 rounded bg-[#0f1320] border border-[#2a3142]" />
          <button onClick={()=>{setPage(1); load();}} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700">Search</button>
          <button onClick={startCreate} className="px-3 py-2 rounded bg-green-600 hover:bg-green-700">New</button>
        </div>
      </div>
      {error && <div className="text-red-400 mb-3">{error}</div>}
      {/* Form */}
      <div className="bg-[#151a2e] border border-[#262b40] rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {['base','quote','symbol','display','provider','provider_symbol','payout','price_decimals'].map((field)=> (
            <div key={field}>
              <label className="block text-xs text-gray-400 mb-1">{field}</label>
              <input value={form[field] ?? ''} onChange={(e)=>setForm(f=>({...f, [field]: e.target.value}))} className="w-full px-3 py-2 rounded bg-[#0f1320] border border-[#2a3142]" />
            </div>
          ))}
          <div>
            <label className="block text-xs text-gray-400 mb-1">status</label>
            <select value={form.status} onChange={(e)=>setForm(f=>({...f, status: e.target.value}))} className="w-full px-3 py-2 rounded bg-[#0f1320] border border-[#2a3142]">
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAUSED">PAUSED</option>
              <option value="DISABLED">DISABLED</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-50">{form.id? 'Update' : 'Create'}</button>
          {form.id && <button onClick={()=>setForm(emptyForm)} className="px-4 py-2 rounded bg-[#101527]">Cancel</button>}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="bg-[#151a2e] border border-[#262b40] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#101527] text-gray-300">
              <tr>
                <th className="text-left p-3">Symbol</th>
                <th className="text-left p-3">Display</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Payout</th>
                <th className="text-left p-3">Provider</th>
                <th className="text-left p-3">Updated</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map(item => (
                <tr key={item.id} className="border-t border-[#262b40]">
                  <td className="p-3">{item.symbol}</td>
                  <td className="p-3">{item.display || `${item.base}/${item.quote}`}</td>
                  <td className="p-3">{item.status}</td>
                  <td className="p-3">{item.payout ?? '-'}</td>
                  <td className="p-3">{item.provider || '-'}</td>
                  <td className="p-3">{new Date(item.updated_at).toLocaleString()}</td>
                  <td className="p-3 flex gap-2">
                    <button onClick={()=>startEdit(item)} className="px-3 py-1 rounded bg-[#101527]">Edit</button>
                    <button onClick={()=>remove(item.id)} className="px-3 py-1 rounded bg-red-700 hover:bg-red-800">Delete</button>
                  </td>
                </tr>
              ))}
              {data?.items?.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-400" colSpan={7}>No pairs found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between p-3">
            <div className="text-sm text-gray-400">Total: {data?.total}</div>
            <div className="flex items-center gap-2">
              <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 rounded bg-[#101527] disabled:opacity-40">Prev</button>
              <div className="text-sm">Page {page}</div>
              <button disabled={(data?.page||1)* (data?.pageSize||pageSize) >= (data?.total||0)} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded bg-[#101527] disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
