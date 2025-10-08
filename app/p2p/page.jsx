"use client";
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export default function P2PPage() {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [selectedFiat, setSelectedFiat] = useState('BDT');
  const [amountFiat, setAmountFiat] = useState(0);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const cryptos = ['USDT', 'BTC', 'ETH', 'BNB'];
  const fiats = ['BDT', 'USD', 'EUR', 'GBP', 'JPY'];
  const apiSide = useMemo(() => (activeTab === 'buy' ? 'SELL' : 'BUY'), [activeTab]);

  useEffect(() => {
    let abort = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams({ asset: selectedCrypto, fiat: selectedFiat, side: apiSide, page: '1', pageSize: '20' });
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
  }, [selectedCrypto, selectedFiat, apiSide]);

  function getAuthHeader() {
    // Try app token first
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) return { Authorization: `Bearer ${token}` };
    }
    // Dev fallback to demo user
    return { Authorization: 'Bearer DEVUSER:demo@example.com' };
  }

  async function createOrder(offer, usingFiatAmount) {
    try {
      if (!usingFiatAmount || usingFiatAmount <= 0) {
        alert('Please enter a valid fiat amount');
        return;
      }
      const res = await fetch('/api/p2p/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ offer_id: offer.id, amount_fiat: Number(usingFiatAmount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed to create order');
      alert(`Order created: ${data.order?.reference_code || data.order?.id}`);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-exchange-alt text-indigo-400 mr-3"></i>
              P2P Trading
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/p2p/post" className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg">
              <i className="fas fa-plus mr-2"></i>Post Ad
            </Link>
            <Link href="/p2p/orders" className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
              <i className="fas fa-history mr-2"></i>My Orders
            </Link>
          </div>
        </div>
      </div>

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
              Buy Crypto
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
              Sell Crypto
            </button>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cryptocurrency</label>
                <select
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {cryptos.map(crypto => (
                    <option key={crypto} value={crypto}>{crypto}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  value={amountFiat}
                  onChange={(e) => setAmountFiat(parseFloat(e.target.value) || 0)}
                  placeholder="Enter amount (fiat)"
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
              <div className="p-6 text-gray-400">No offers found for {selectedCrypto}/{selectedFiat} ({apiSide}).</div>
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
                    <div className="text-sm text-gray-400">per {selectedCrypto}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {(offer.min_limit_fiat || 0).toLocaleString()} - {(offer.max_limit_fiat || 0).toLocaleString()} {selectedFiat}
                    </div>
                    <div className="text-sm text-gray-400">
                      Limits (asset): {(offer.min_amount_asset || 0)} - {(offer.max_amount_asset || 0)} {selectedCrypto}
                    </div>
                  </div>

                  <button
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === 'buy'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                    onClick={() => createOrder(offer, amountFiat)}
                  >
                    {activeTab === 'buy' ? 'Buy' : 'Sell'} {selectedCrypto}
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
      </div>
    </div>
  );
}
