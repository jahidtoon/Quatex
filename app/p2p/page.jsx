"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function P2PPage() {
  const [activeTab, setActiveTab] = useState('buy');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [selectedFiat, setSelectedFiat] = useState('USD');

  const cryptos = ['USDT', 'BTC', 'ETH', 'BNB'];
  const fiats = ['USD', 'EUR', 'GBP', 'JPY'];

  const p2pOffers = [
    {
      id: 1,
      trader: 'CryptoMaster',
      rating: 4.9,
      trades: 1250,
      price: 1.002,
      min: 50,
      max: 5000,
      available: 45000,
      payment: ['Bank Transfer', 'PayPal'],
      online: true
    },
    {
      id: 2,
      trader: 'BitcoinGuru',
      rating: 4.8,
      trades: 890,
      price: 1.001,
      min: 100,
      max: 2000,
      available: 25000,
      payment: ['Wise', 'Revolut'],
      online: true
    },
    {
      id: 3,
      trader: 'TradingPro',
      rating: 4.7,
      trades: 650,
      price: 1.003,
      min: 25,
      max: 1500,
      available: 18000,
      payment: ['Bank Transfer'],
      online: false
    }
  ];

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
            <button className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg">
              <i className="fas fa-plus mr-2"></i>Post Ad
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg">
              <i className="fas fa-history mr-2"></i>My Orders
            </button>
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
                  placeholder="Enter amount"
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
            {p2pOffers.map((offer) => (
              <div key={offer.id} className="p-6 hover:bg-gray-700/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center font-bold">
                        {offer.trader[0]}
                      </div>
                      {offer.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{offer.trader}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span className="flex items-center">
                          <i className="fas fa-star text-yellow-400 mr-1"></i>
                          {offer.rating}
                        </span>
                        <span>•</span>
                        <span>{offer.trades} trades</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {offer.payment.map((method, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-600 rounded text-xs">
                            {method}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-xl font-bold">{offer.price} {selectedFiat}</div>
                    <div className="text-sm text-gray-400">per {selectedCrypto}</div>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold">
                      {offer.min} - {offer.max.toLocaleString()} {selectedFiat}
                    </div>
                    <div className="text-sm text-gray-400">
                      Available: {offer.available.toLocaleString()} {selectedCrypto}
                    </div>
                  </div>

                  <button
                    className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                      activeTab === 'buy'
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
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
