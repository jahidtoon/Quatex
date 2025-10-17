"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import MainAppLayout from '../components/MainAppLayout';
import P2PHeader from './components/P2PHeader';

export default function P2PPage() {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedFiat, setSelectedFiat] = useState('BDT');
  const [amountUSD, setAmountUSD] = useState(0);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmOffer, setConfirmOffer] = useState(null);
  const [confirmAmount, setConfirmAmount] = useState('');
  const [confirmNotes, setConfirmNotes] = useState('');

  const fiats = ['BDT', 'EUR', 'GBP', 'JPY'];
  const apiSide = useMemo(() => (activeTab === 'buy' ? 'SELL' : 'BUY'), [activeTab]);

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ asset: 'USD', fiat: selectedFiat, side: apiSide, page: '1', pageSize: '20' });
        const res = await fetch(`/api/p2p/offers?${params.toString()}`);
        if (!res.ok) throw new Error(`Failed to load offers (${res.status})`);
        const data = await res.json();
        if (!abort) setOffers(data.items || []);
      } catch (e) {
        if (!abort) setError(e.message || 'Failed to load');
      } finally {
        if (!abort) setLoading(false);
      }
    }
    load();
    return () => { abort = true; };
  }, [selectedFiat, apiSide]);

  function getAuthHeader() {
    // Try app token first
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) return { Authorization: `Bearer ${token}` };
    }
    // Dev fallback to demo user
    return { Authorization: 'Bearer DEVUSER:demo@example.com' };
  }

  const openConfirm = (offer) => {
    setConfirmOffer(offer);
    setConfirmAmount(amountUSD ? String(amountUSD) : '');
    setConfirmNotes('I will follow the payment terms and complete within the time limit.');
  };

  const submitConfirm = async () => {
    if (!confirmOffer) return;
    const amt = Number(confirmAmount);
    if (!amt || amt <= 0) { alert('Amount required'); return; }
    try {
      const res = await fetch('/api/p2p/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
        body: JSON.stringify({ offer_id: confirmOffer.id, amount_usd: amt, note: confirmNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create order');
      setConfirmOffer(null);
      setConfirmAmount('');
      setConfirmNotes('');
      // Redirect to order chat page
      if (typeof window !== 'undefined' && data.order?.id) {
        window.location.href = `/p2p/order/${data.order.id}`;
      }
    } catch (e) { alert(e.message); }
  };

  return (
    <MainAppLayout currentPage="p2p">
      <div className="min-h-screen bg-gray-900 text-white">
        <P2PHeader 
          title="P2P Trading" 
          currentPath="/p2p"
        />

      <div className="p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg font-semibold mb-2">24h Volume</h3>
            <p className="text-2xl font-bold text-green-400">$2.4M</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg font-semibold mb-2">Active Traders</h3>
            <p className="text-2xl font-bold text-blue-400">1,245</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg font-semibold mb-2">Avg Response</h3>
            <p className="text-2xl font-bold text-yellow-400">2 min</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 text-center">
            <h3 className="text-lg font-semibold mb-2">Success Rate</h3>
            <p className="text-2xl font-bold text-purple-400">98.5%</p>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg border border-gray-700">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'buy'
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-shopping-cart mr-2"></i>
              Buy USD
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'sell'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              <i className="fas fa-hand-holding-usd mr-2"></i>
              Sell USD
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Trading Asset</label>
                <div className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white flex items-center justify-center">
                  <i className="fas fa-dollar-sign text-green-400 mr-2"></i>
                  <span className="font-semibold">USD</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Fiat Currency</label>
                <select
                  value={selectedFiat}
                  onChange={(e) => setSelectedFiat(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {fiats.map(fiat => (
                    <option key={fiat} value={fiat}>{fiat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(parseFloat(e.target.value) || 0)}
                  placeholder="Enter USD amount"
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <option>All Methods</option>
                  <option>Bank Transfer</option>
                  <option>PayPal</option>
                  <option>Wise</option>
                </select>
              </div>
            </div>
          </div>

          {/* Offers List */}
          <div className="divide-y divide-gray-700">
            {loading && (
              <div className="p-6 text-gray-300">Loading offers...</div>
            )}
            {error && !loading && (
              <div className="p-6 text-red-400">{error}</div>
            )}
            {!loading && !error && offers.length === 0 && (
              <div className="p-6 text-gray-400">No offers found for USD/{selectedFiat} ({apiSide}).</div>
            )}
            {offers.map((offer) => (
              <div key={offer.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                        {offer.asset_symbol?.[0] || 'T'}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold">{offer.side} {offer.asset_symbol}</h3>
                      <div className="text-sm text-gray-400">Offer ID: {offer.id.slice(0,8)}...</div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold">{Number(offer.fixed_price || offer.price).toLocaleString()} {selectedFiat}</div>
                    <div className="text-sm text-gray-400">per USD</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {(offer.min_limit_fiat || 0).toLocaleString()} - {(offer.max_limit_fiat || 0).toLocaleString()} {selectedFiat}
                    </div>
                    <div className="text-sm text-gray-400">
                      Limits: {(offer.min_amount_asset || 0)} - {(offer.max_amount_asset || 0)} USD
                    </div>
                  </div>

                  <button
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === 'buy'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    onClick={() => openConfirm(offer)}
                  >
                    {activeTab === 'buy' ? 'Buy' : 'Sell'} USD
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* How it Works */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-2xl font-semibold mb-6">How P2P Trading Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-search text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">1. Browse Offers</h3>
              <p className="text-gray-400">Find the best rates from verified traders</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-handshake text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">2. Make a Deal</h3>
              <p className="text-gray-400">Chat with trader and agree on terms</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-2xl"></i>
              </div>
              <h3 className="text-lg font-semibold mb-2">3. Secure Trade</h3>
              <p className="text-gray-400">Funds are held in escrow until completion</p>
            </div>
          </div>
          </div>
        {/* Confirm Modal */}
        {confirmOffer && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-lg w-full max-w-lg">
              <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-xl font-semibold">Confirm {activeTab === 'buy' ? 'Purchase' : 'Sale'}</h3>
                <button onClick={()=>setConfirmOffer(null)} className="text-gray-400 hover:text-white"><i className="fas fa-times"/></button>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-sm text-gray-300">Offer: <span className="font-semibold">{confirmOffer.side} USD · {confirmOffer.fiat_currency}</span></div>
                <div>
                  <label className="block text-sm mb-1">Amount (USD)</label>
                  <input type="number" className="w-full p-3 bg-gray-700 border border-gray-600 rounded" value={confirmAmount} onChange={e=>setConfirmAmount(e.target.value)} placeholder="Enter USD amount" />
                </div>
                <div className="text-xs text-gray-400 space-y-1 bg-gray-700/40 border border-gray-600 rounded p-3">
                  <div>• Make sure to pay only through the seller's provided method.</div>
                  <div>• Payment proof may be required. Do not mark as paid unless completed.</div>
                  <div>• Orders may be canceled if inactive for a long time.</div>
                </div>
                <div>
                  <label className="block text-sm mb-1">Note (optional)</label>
                  <textarea className="w-full p-3 bg-gray-700 border border-gray-600 rounded" rows={3} value={confirmNotes} onChange={e=>setConfirmNotes(e.target.value)} />
                </div>
              </div>
              <div className="p-4 border-t border-gray-700 flex items-center justify-end gap-2">
                <button onClick={()=>setConfirmOffer(null)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">Cancel</button>
                <button onClick={submitConfirm} className={`px-4 py-2 rounded ${activeTab==='buy'?'bg-green-600 hover:bg-green-700':'bg-red-600 hover:bg-red-700'}`}>Confirm</button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </MainAppLayout>
  );
}
