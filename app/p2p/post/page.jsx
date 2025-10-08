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

export default function P2PPostAdPage() {
  const [side, setSide] = useState('SELL');
  const [asset, setAsset] = useState('USDT');
  const [fiat, setFiat] = useState('BDT');
  const [priceType, setPriceType] = useState('FIXED');
  const [fixedPrice, setFixedPrice] = useState(120);
  const [minAsset, setMinAsset] = useState(10);
  const [maxAsset, setMaxAsset] = useState(200);
  const [minFiat, setMinFiat] = useState(1200);
  const [maxFiat, setMaxFiat] = useState(24000);
  const [terms, setTerms] = useState('');
  const [autoReply, setAutoReply] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPMs, setSelectedPMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const cryptos = ['USDT', 'BTC', 'ETH', 'BNB'];
  const fiats = ['BDT', 'USD', 'EUR', 'GBP', 'JPY'];

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/p2p/payment-methods', { headers: { ...getAuthHeader() } });
        const data = await res.json().catch(()=>({}));
        if (!res.ok) throw new Error(data.error || 'Failed to load payment methods');
        if (!abort) setPaymentMethods(data.methods || []);
      } catch (e) {
        if (!abort) setError(e.message || 'Failed to load');
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => { abort = true; };
  }, []);

  function togglePM(id) {
    setSelectedPMs((prev) => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      if (priceType === 'FIXED' && (!fixedPrice || fixedPrice <= 0)) throw new Error('Valid fixed price required');
      if (minAsset <= 0 || maxAsset <= 0 || minAsset > maxAsset) throw new Error('Invalid asset limits');
      if (minFiat <= 0 || maxFiat <= 0 || minFiat > maxFiat) throw new Error('Invalid fiat limits');

      const body = {
        side,
        asset_symbol: asset,
        fiat_currency: fiat,
        price_type: priceType,
        fixed_price: priceType === 'FIXED' ? Number(fixedPrice) : null,
        margin_percent: priceType === 'FLOATING' ? 0 : null,
        min_amount_asset: Number(minAsset),
        max_amount_asset: Number(maxAsset),
        min_limit_fiat: Number(minFiat),
        max_limit_fiat: Number(maxFiat),
        terms,
        auto_reply: autoReply,
        payment_method_ids: selectedPMs,
      };

      const res = await fetch('/api/p2p/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(()=>({}));
      if (!res.ok) throw new Error(data.error || 'Failed to create offer');
      setSuccess(`Offer created: ${data.offer?.id?.slice(0,8)}…`);
    } catch (e) {
      setError(e.message || 'Failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/p2p" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left" /> Back to P2P
            </Link>
            <h1 className="text-2xl font-bold">Post P2P Ad</h1>
          </div>
          <Link href="/p2p/orders" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
            <i className="fas fa-history mr-2" />My Orders
          </Link>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        {error && <div className="mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-300">{error}</div>}
        {!loading && paymentMethods.length === 0 && (
          <div className="mb-4 p-3 rounded bg-yellow-900/40 border border-yellow-700 text-yellow-200">
            You have no active payment methods. Please add one first from <Link href="/p2p/payment-methods" className="underline text-yellow-300">Payment Methods</Link>.
          </div>
        )}
        {success && <div className="mb-4 p-3 rounded bg-green-900/40 border border-green-700 text-green-300">{success}</div>}

        <form onSubmit={onSubmit} className="space-y-6 bg-gray-800 border border-gray-700 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Side</label>
              <select value={side} onChange={(e)=>setSide(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded">
                <option value="SELL">Sell</option>
                <option value="BUY">Buy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Asset</label>
              <select value={asset} onChange={(e)=>setAsset(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded">
                {['USDT','BTC','ETH','BNB'].map(a=> <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Fiat</label>
              <select value={fiat} onChange={(e)=>setFiat(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded">
                {['BDT','USD','EUR','GBP','JPY'].map(f=> <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Price Type</label>
              <select value={priceType} onChange={(e)=>setPriceType(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded">
                <option value="FIXED">Fixed</option>
                <option value="FLOATING" disabled>Floating (soon)</option>
              </select>
            </div>
            {priceType === 'FIXED' && (
              <div>
                <label className="block text-sm mb-1">Fixed Price ({fiat} per {asset})</label>
                <input type="number" value={fixedPrice} onChange={(e)=>setFixedPrice(parseFloat(e.target.value)||0)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Min Asset</label>
              <input type="number" value={minAsset} onChange={(e)=>setMinAsset(parseFloat(e.target.value)||0)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Max Asset</label>
              <input type="number" value={maxAsset} onChange={(e)=>setMaxAsset(parseFloat(e.target.value)||0)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Min Fiat</label>
              <input type="number" value={minFiat} onChange={(e)=>setMinFiat(parseFloat(e.target.value)||0)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded" />
            </div>
            <div>
              <label className="block text-sm mb-1">Max Fiat</label>
              <input type="number" value={maxFiat} onChange={(e)=>setMaxFiat(parseFloat(e.target.value)||0)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Payment Methods</label>
            <div className="flex flex-wrap gap-2">
              {loading && <div className="text-gray-400">Loading…</div>}
              {!loading && paymentMethods.length === 0 && <div className="text-gray-400">No payment methods yet. Create one from your profile.</div>}
              {!loading && paymentMethods.map(pm => (
                <label key={pm.id} className={`px-3 py-2 rounded border cursor-pointer select-none ${selectedPMs.includes(pm.id)?'bg-indigo-700 border-indigo-500':'bg-gray-700 border-gray-600'}`}>
                  <input type="checkbox" className="mr-2" checked={selectedPMs.includes(pm.id)} onChange={()=>togglePM(pm.id)} />
                  {pm.type} {pm.label ? `- ${pm.label}`: ''}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Terms</label>
            <textarea value={terms} onChange={(e)=>setTerms(e.target.value)} rows={3} className="w-full p-3 bg-gray-700 border border-gray-600 rounded" />
          </div>
          <div>
            <label className="block text-sm mb-1">Auto Reply</label>
            <textarea value={autoReply} onChange={(e)=>setAutoReply(e.target.value)} rows={2} className="w-full p-3 bg-gray-700 border border-gray-600 rounded" />
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="px-5 py-3 rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
              {saving ? 'Posting…' : 'Post Ad'}
            </button>
            <Link href="/p2p" className="px-5 py-3 rounded bg-gray-700 hover:bg-gray-600">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
