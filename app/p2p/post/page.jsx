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

export default function P2PPostAdPage() {
  const [side, setSide] = useState('SELL');
  const [fiat, setFiat] = useState('BDT');
  const [priceType, setPriceType] = useState('FIXED');
  const [fixedPrice, setFixedPrice] = useState(120);
  const [minAmount, setMinAmount] = useState(1000);
  const [maxAmount, setMaxAmount] = useState(50000);
  const [terms, setTerms] = useState('');
  const [autoReply, setAutoReply] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedPMs, setSelectedPMs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [mainBalance, setMainBalance] = useState(0);

  const cryptos = ['USDT', 'BTC', 'ETH', 'BNB'];
  const fiats = ['BDT', 'USD', 'EUR', 'GBP', 'JPY'];

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true);
      try {
        const [pmRes, userRes] = await Promise.all([
          fetch('/api/p2p/payment-methods', { headers: { ...getAuthHeader() } }),
          fetch('/api/users/profile', { headers: { ...getAuthHeader() } })
        ]);
        
        const pmData = await pmRes.json().catch(()=>({}));
        const userData = await userRes.json().catch(()=>({}));
        
        if (!pmRes.ok) throw new Error(pmData.error || 'Failed to load payment methods');
        if (!abort) {
          setPaymentMethods(pmData.methods || []);
          setMainBalance(Number(userData.user?.balance || 0));
        }
      } catch (e) {
        if (!abort) setError(e.message || 'Failed to load');
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => { abort = true; };
  }, []);

  // Calculate maximum trade amount from balance
  const getMaxTradeAmount = () => {
    if (side === 'SELL') {
      return Math.floor(mainBalance); // How much USD they can sell
    }
    return mainBalance; // For BUY, they can buy up to their balance
  };

  function togglePM(id) {
    setSelectedPMs((prev) => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      // Basic validation
      if (priceType === 'FIXED' && (!fixedPrice || fixedPrice <= 0)) {
        throw new Error('Valid fixed price required');
      }
      if (minAmount <= 0 || maxAmount <= 0 || minAmount > maxAmount) {
        throw new Error('Invalid trade amount limits');
      }
      if (selectedPMs.length === 0) {
        throw new Error('Please select at least one payment method');
      }

      // Professional validation for trade amounts
      if (side === 'SELL') {
        const maxTradeAmount = getMaxTradeAmount();
        if (maxTradeAmount < maxAmount) {
          throw new Error(`Insufficient balance. You can sell up to $${maxTradeAmount.toLocaleString()} USD with your current balance of $${mainBalance.toLocaleString()}`);
        }
        if (maxTradeAmount < minAmount) {
          throw new Error(`Insufficient balance. Minimum trade amount $${minAmount.toLocaleString()} exceeds your available balance $${mainBalance.toLocaleString()}`);
        }
      }

      const body = {
        side,
        fiat_currency: fiat,
        price_type: priceType,
        fixed_price: priceType === 'FIXED' ? Number(fixedPrice) : null,
        margin_percent: priceType === 'FLOATING' ? 0 : null,
        min_amount: Number(minAmount),
        max_amount: Number(maxAmount),
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
      
      setSuccess(`✅ Offer created successfully! ID: ${data.offer?.id?.slice(0,8)}…`);
      
      // Reset form
      setSide('SELL');
      setFiat('BDT');
      setPriceType('FIXED');
      setFixedPrice(120);
      setMinAmount(1000);
      setMaxAmount(50000);
      setTerms('');
      setAutoReply('');
      setSelectedPMs([]);
      
      // Refresh balance
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (e) {
      setError(e.message || 'Failed to create offer');
    } finally {
      setSaving(false);
    }
  }

  return (
    <MainAppLayout currentPage="p2p">
      <div className="min-h-screen bg-gray-900 text-white">
        <P2PHeader 
          title="Post P2P Ad" 
          currentPath="/p2p/post"
        />

        <div className="p-6 max-w-4xl mx-auto">
        {/* Balance Display */}
        <div className="mb-6 bg-gray-800 border border-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 flex items-center">
            <i className="fas fa-wallet text-green-400 mr-2"></i>
            Main Account Balance
          </h3>
          <div className="flex items-center justify-between">
            <div className="p-4 rounded-lg border border-green-500 bg-green-900/20">
              <div className="text-sm text-gray-400">USD Balance</div>
              <div className="text-2xl font-semibold text-green-400">${mainBalance.toLocaleString()}</div>
            </div>
            {priceType === 'FIXED' && fixedPrice > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-400">You can trade up to</div>
                <div className="text-lg font-semibold text-blue-400">
                  ${getMaxTradeAmount().toLocaleString()} USD
                </div>
                <div className="text-xs text-gray-500">at {fixedPrice} {fiat} per USD</div>
              </div>
            )}
          </div>
        </div>

        {error && <div className="mb-4 p-3 rounded bg-red-900/40 border border-red-700 text-red-300">{error}</div>}
        {!loading && paymentMethods.length === 0 && (
          <div className="mb-4 p-3 rounded bg-yellow-900/40 border border-yellow-700 text-yellow-200">
            You have no active payment methods. Please add one first from <Link href="/account?tab=billing" className="underline text-yellow-300">Account Billing</Link>.
          </div>
        )}
        {success && <div className="mb-4 p-4 rounded bg-green-900/40 border border-green-700 text-green-300">
          <div className="flex items-center">
            <i className="fas fa-check-circle text-green-400 mr-2"></i>
            {success}
          </div>
          <div className="text-sm text-green-200 mt-2">
            Your offer is now live! Users can place orders and your USD will be held in escrow when orders are created.
          </div>
        </div>}

        <form onSubmit={onSubmit} className="space-y-6 bg-gray-800 border border-gray-700 p-6 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Side</label>
              <select value={side} onChange={(e)=>setSide(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded">
                <option value="SELL">Sell USD</option>
                <option value="BUY">Buy USD</option>
              </select>
              {side === 'SELL' && (
                <div className="text-xs text-yellow-300 mt-1">
                  <i className="fas fa-info-circle mr-1"></i>
                  For sell orders, USD will be held from your main balance when orders are created
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Fiat Currency</label>
              <select value={fiat} onChange={(e)=>setFiat(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded">
                {['BDT','EUR','GBP','JPY'].map(f=> <option key={f} value={f}>{f}</option>)}
              </select>
              <div className="text-xs text-gray-400 mt-1">
                Trading USD for {fiat}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Price Type</label>
              <select value={priceType} onChange={(e)=>setPriceType(e.target.value)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded">
                <option value="FIXED">Fixed</option>
                <option value="FLOATING" disabled>Floating (soon)</option>
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
                <label className="block text-sm mb-1">Fixed Price ({fiat} per USD)</label>
                <input type="number" value={fixedPrice} onChange={(e)=>setFixedPrice(parseFloat(e.target.value)||0)} className="w-full p-3 bg-gray-700 border border-gray-600 rounded" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Min Amount (USD)</label>
              <input 
                type="number" 
                value={minAmount} 
                onChange={(e)=>setMinAmount(parseFloat(e.target.value)||0)} 
                className={`w-full p-3 bg-gray-700 border rounded ${
                  side === 'SELL' && minAmount > getMaxTradeAmount()
                    ? 'border-red-500' 
                    : 'border-gray-600'
                }`} 
              />
              {side === 'SELL' && minAmount > getMaxTradeAmount() && (
                <div className="text-xs text-red-400 mt-1">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Exceeds available balance (${mainBalance.toLocaleString()})
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">Max Amount (USD)</label>
              <input 
                type="number" 
                value={maxAmount} 
                onChange={(e)=>setMaxAmount(parseFloat(e.target.value)||0)} 
                className={`w-full p-3 bg-gray-700 border rounded ${
                  side === 'SELL' && maxAmount > getMaxTradeAmount()
                    ? 'border-red-500' 
                    : 'border-gray-600'
                }`} 
              />
              {side === 'SELL' && maxAmount > getMaxTradeAmount() && (
                <div className="text-xs text-red-400 mt-1">
                  <i className="fas fa-exclamation-triangle mr-1"></i>
                  Exceeds available balance (${mainBalance.toLocaleString()})
                </div>
              )}
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
            <button 
              type="submit" 
              disabled={saving || (side === 'SELL' && (maxAmount > getMaxTradeAmount() || selectedPMs.length === 0))} 
              className="px-6 py-3 rounded bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Offer...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  {side === 'SELL' ? 'Create USD Sell Offer' : 'Create USD Buy Offer'}
                </>
              )}
            </button>
            <Link href="/p2p" className="px-6 py-3 rounded bg-gray-700 hover:bg-gray-600 transition-colors flex items-center">
              <i className="fas fa-arrow-left mr-2"></i>
              Back to Market
            </Link>
          </div>

          {/* Professional Info Box */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h4 className="font-semibold text-blue-300 mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              How P2P Trading Works
            </h4>
            <div className="text-sm text-blue-200 space-y-1">
              {side === 'SELL' ? (
                <>
                  <div>• When users place orders, USD will be held from your main balance</div>
                  <div>• You cannot use held funds until the order is completed or cancelled</div>
                  <div>• Successful trades will transfer USD to buyer and you receive {fiat} payment</div>
                </>
              ) : (
                <>
                  <div>• Buyers will send you {fiat} payment for USD</div>
                  <div>• You confirm payment and release USD from your balance</div>
                  <div>• All transactions are secured with escrow protection</div>
                </>
              )}
            </div>
          </div>
        </form>
      </div>
      </div>
    </MainAppLayout>
  );
}
