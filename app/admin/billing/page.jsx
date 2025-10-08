"use client";
import React, { useEffect, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';

export default function AdminBillingSettingsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'BKASH',
    currency: 'BDT',
    country: 'Bangladesh',
    fieldsText: JSON.stringify([
      { key: 'number', label: 'Bkash Number', required: true }
    ], null, 2),
    is_active: true,
  });

  const fetchList = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/payment-method-templates?active=', { credentials: 'include' });
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchList(); }, []);

  const createTemplate = async () => {
    try {
      setSaving(true);
      const fields = JSON.parse(form.fieldsText || '[]');
      const res = await fetch('/api/admin/payment-method-templates', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          type: form.type,
          currency: form.currency,
          country: form.country,
          fields,
          is_active: form.is_active,
        })
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e.error || 'Failed to create');
        return;
      }
      setForm((f) => ({ ...f, title: '' }));
      await fetchList();
    } catch (e) {
      alert('Invalid fields JSON or server error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (id, is_active) => {
    try {
      const res = await fetch(`/api/admin/payment-method-templates/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active })
      });
      if (!res.ok) return alert('Failed');
      await fetchList();
    } catch (e) { alert('Failed'); }
  };

  return (
    <div>
      <AdminPageHeader 
        title="Billing Settings" 
        subtitle="Define payment method templates users can save as billing info."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#11162a] border border-[#2b314c] rounded-lg">
          <div className="p-4 border-b border-[#2b314c] text-gray-200 font-semibold">Create Template</div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-2">Title</label>
              <input value={form.title} onChange={e=>setForm({...form, title:e.target.value})} className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded text-white" placeholder="Bkash" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-2">Type</label>
                <select value={form.type} onChange={e=>setForm({...form, type:e.target.value})} className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded text-white">
                  <option>BKASH</option>
                  <option>NAGAD</option>
                  <option>BANK</option>
                  <option>CARDBANK</option>
                  <option>OTHERS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Currency</label>
                <input value={form.currency} onChange={e=>setForm({...form, currency:e.target.value})} className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded text-white" placeholder="BDT" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-2">Country</label>
                <input value={form.country} onChange={e=>setForm({...form, country:e.target.value})} className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded text-white" placeholder="Bangladesh" />
              </div>
              <div className="flex items-center gap-2">
                <input id="active" type="checkbox" checked={form.is_active} onChange={e=>setForm({...form, is_active:e.target.checked})} />
                <label htmlFor="active" className="text-sm text-gray-300">Active</label>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-2">Fields (JSON)</label>
              <textarea rows={8} value={form.fieldsText} onChange={e=>setForm({...form, fieldsText:e.target.value})} className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded text-white font-mono text-sm" />
              <div className="text-xs text-gray-400 mt-2">Example: [{'{'} key: 'number', label: 'Bkash Number', required: true {'}'}]</div>
            </div>
            <button disabled={saving} onClick={createTemplate} className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600">{saving? 'Saving...' : 'Create Template'}</button>
          </div>
        </div>

        <div className="bg-[#11162a] border border-[#2b314c] rounded-lg">
          <div className="p-4 border-b border-[#2b314c] text-gray-200 font-semibold">Templates</div>
          <div className="p-4">
            {loading ? (
              <div className="text-gray-400">Loading...</div>
            ) : (
              <div className="space-y-3">
                {items.map((t) => (
                  <div key={t.id} className="p-3 bg-[#0f1320] border border-[#2a3142] rounded">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-white">{t.title} <span className="text-xs text-gray-400">[{t.type}]</span></div>
                        <div className="text-xs text-gray-400">{t.country} • {t.currency}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-0.5 rounded ${t.is_active ? 'bg-green-600/30 text-green-300' : 'bg-gray-600/30 text-gray-300'}`}>{t.is_active ? 'Active' : 'Inactive'}</span>
                        <button onClick={()=>toggleActive(t.id, !t.is_active)} className="px-3 py-1 rounded bg-[#1a1f33] border border-[#2b314c] hover:bg-[#232945] text-sm">{t.is_active ? 'Disable' : 'Enable'}</button>
                      </div>
                    </div>
                    <pre className="mt-2 text-xs text-gray-300 whitespace-pre-wrap break-words">{JSON.stringify(t.fields, null, 2)}</pre>
                  </div>
                ))}
                {!items.length && <div className="text-gray-400">No templates found.</div>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
