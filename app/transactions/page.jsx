"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import MainAppLayout from '../components/MainAppLayout';

export default function TransactionsPage() {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const transactions = [
    { id: 1, type: 'deposit', amount: 500, status: 'completed', method: 'Credit Card', date: '2024-08-26 14:30', fee: 12.50 },
    { id: 2, type: 'trade', amount: -25, status: 'completed', method: 'BTCUSDT DOWN', date: '2024-08-26 13:45', fee: 0 },
    { id: 3, type: 'trade', amount: 42.50, status: 'completed', method: 'ETHUSD UP', date: '2024-08-26 12:20', fee: 0 },
    { id: 4, type: 'withdrawal', amount: -200, status: 'pending', method: 'Bank Transfer', date: '2024-08-25 16:10', fee: 0 },
    { id: 5, type: 'deposit', amount: 250, status: 'completed', method: 'Crypto', date: '2024-08-25 10:15', fee: 2.50 },
    { id: 6, type: 'trade', amount: 33.75, status: 'completed', method: 'XRPUSDT UP', date: '2024-08-24 18:30', fee: 0 },
    { id: 7, type: 'withdrawal', amount: -150, status: 'completed', method: 'E-Wallet', date: '2024-08-24 09:20', fee: 2.00 }
  ];

  const getTypeIcon = (type) => {
    switch(type) {
      case 'deposit': return 'fa-arrow-down';
      case 'withdrawal': return 'fa-arrow-up';
      case 'trade': return 'fa-chart-line';
      default: return 'fa-circle';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'deposit': return 'text-green-400 bg-green-900';
      case 'withdrawal': return 'text-yellow-400 bg-yellow-900';
      case 'trade': return 'text-blue-400 bg-blue-900';
      default: return 'text-gray-400 bg-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filter !== 'all' && tx.type !== filter) return false;
    if (searchTerm && !tx.method.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-receipt text-orange-400 mr-3"></i>
              Transaction History
            </h1>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg">
            <i className="fas fa-download mr-2"></i>Export CSV
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Total Deposits</h3>
            <p className="text-2xl font-bold text-green-400">$750.00</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Total Withdrawals</h3>
            <p className="text-2xl font-bold text-yellow-400">$350.00</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Trading P&L</h3>
            <p className="text-2xl font-bold text-blue-400">+$51.25</p>
          </div>
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-lg font-semibold mb-2">Total Fees</h3>
            <p className="text-2xl font-bold text-red-400">$17.00</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              {['all', 'deposit', 'withdrawal', 'trade'].map((filterType) => (
                <button
                  key={filterType}
                  onClick={() => setFilter(filterType)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === filterType
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </button>
              ))}
            </div>
            <div className="relative">
              <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold">Recent Transactions</h2>
          </div>
          <div className="divide-y divide-gray-700">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(transaction.type)}`}>
                      <i className={`fas ${getTypeIcon(transaction.type)}`}></i>
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">{transaction.type}</h3>
                      <p className="text-gray-400">{transaction.method}</p>
                      <p className="text-sm text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xl font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <div className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </div>
                    {transaction.fee > 0 && (
                      <div className="text-xs text-gray-500">Fee: ${transaction.fee.toFixed(2)}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </MainAppLayout>
  );
}
