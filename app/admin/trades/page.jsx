"use client";
import React, { useState, useEffect } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';

export default function AdminTradesPage() {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with actual API call
  useEffect(() => {
    setTimeout(() => {
      setTrades([
        { id: 1, user: 'john@example.com', pair: 'EUR/USD', type: 'BUY', amount: 100, entry: 1.0850, current: 1.0855, pnl: 5, status: 'active', time: '2025-08-27 10:30' },
        { id: 2, user: 'jane@example.com', pair: 'GBP/USD', type: 'SELL', amount: 250, entry: 1.2650, current: 1.2645, pnl: 12.5, status: 'completed', time: '2025-08-27 09:15' },
        { id: 3, user: 'mike@example.com', pair: 'USD/JPY', type: 'BUY', amount: 150, entry: 149.50, current: 149.45, pnl: -7.5, status: 'active', time: '2025-08-27 11:00' },
        { id: 4, user: 'sarah@example.com', pair: 'AUD/USD', type: 'SELL', amount: 75, entry: 0.6750, current: 0.6755, pnl: -3.75, status: 'cancelled', time: '2025-08-27 08:45' },
        { id: 5, user: 'alex@example.com', pair: 'EUR/GBP', type: 'BUY', amount: 200, entry: 0.8550, current: 0.8565, pnl: 35, status: 'completed', time: '2025-08-27 07:30' },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTrades = trades.filter(trade => {
    const matchesFilter = filter === 'all' || trade.status === filter;
    const matchesSearch = trade.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         trade.pair.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const totalPnL = filteredTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const activeTrades = trades.filter(t => t.status === 'active').length;
  const completedTrades = trades.filter(t => t.status === 'completed').length;

  return (
    <div>
      <AdminPageHeader 
        title="Trades Management" 
        subtitle="Monitor and manage all user trading activities in real-time." 
      />
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-white">{trades.length}</div>
          <div className="text-sm text-gray-400">Total Trades</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-green-400">{activeTrades}</div>
          <div className="text-sm text-gray-400">Active Trades</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-blue-400">{completedTrades}</div>
          <div className="text-sm text-gray-400">Completed</div>
        </Card>
        <Card className="p-4">
          <div className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            ${totalPnL.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Total P&L</div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <input
            type="text"
            placeholder="Search by user or pair..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Trades</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </Card>

      {/* Trades Table */}
      <Card title="Live Trades">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading trades...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-3">ID</th>
                  <th className="text-left p-3">User</th>
                  <th className="text-left p-3">Pair</th>
                  <th className="text-left p-3">Type</th>
                  <th className="text-left p-3">Amount</th>
                  <th className="text-left p-3">Entry</th>
                  <th className="text-left p-3">Current</th>
                  <th className="text-left p-3">P&L</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Time</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-3 font-mono">#{trade.id}</td>
                    <td className="p-3">{trade.user}</td>
                    <td className="p-3 font-semibold">{trade.pair}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="p-3">${trade.amount}</td>
                    <td className="p-3 font-mono">{trade.entry}</td>
                    <td className="p-3 font-mono">{trade.current}</td>
                    <td className="p-3">
                      <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                        ${trade.pnl.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        trade.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                        trade.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {trade.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3 text-gray-400 text-xs">{trade.time}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <button className="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">
                          View
                        </button>
                        {trade.status === 'active' && (
                          <button className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs">
                            Close
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTrades.length === 0 && (
              <div className="p-8 text-center text-gray-400">
                No trades found matching your criteria.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
