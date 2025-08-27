"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function AdminCurrencyPairsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPairs, setSelectedPairs] = useState([]);

  // Mock data for currency pairs
  const currencyPairs = [
    {
      id: 1,
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar',
      category: 'Major',
      spread: 0.8,
      volume: 125430,
      price: 1.0875,
      change: 0.0025,
      changePercent: 0.23,
      status: 'active',
      leverage: '1:500',
      minLot: 0.01,
      maxLot: 100
    },
    {
      id: 2,
      symbol: 'GBP/USD',
      name: 'British Pound / US Dollar',
      category: 'Major',
      spread: 1.2,
      volume: 98750,
      price: 1.2645,
      change: -0.0045,
      changePercent: -0.35,
      status: 'active',
      leverage: '1:500',
      minLot: 0.01,
      maxLot: 100
    },
    {
      id: 3,
      symbol: 'USD/JPY',
      name: 'US Dollar / Japanese Yen',
      category: 'Major',
      spread: 0.9,
      volume: 87320,
      price: 148.75,
      change: 0.35,
      changePercent: 0.24,
      status: 'active',
      leverage: '1:500',
      minLot: 0.01,
      maxLot: 100
    },
    {
      id: 4,
      symbol: 'AUD/USD',
      name: 'Australian Dollar / US Dollar',
      category: 'Major',
      spread: 1.5,
      volume: 45680,
      price: 0.6575,
      change: 0.0015,
      changePercent: 0.23,
      status: 'active',
      leverage: '1:200',
      minLot: 0.01,
      maxLot: 50
    },
    {
      id: 5,
      symbol: 'USD/CAD',
      name: 'US Dollar / Canadian Dollar',
      category: 'Major',
      spread: 1.8,
      volume: 32450,
      price: 1.3745,
      change: -0.0025,
      changePercent: -0.18,
      status: 'inactive',
      leverage: '1:200',
      minLot: 0.01,
      maxLot: 50
    },
    {
      id: 6,
      symbol: 'EUR/GBP',
      name: 'Euro / British Pound',
      category: 'Cross',
      spread: 2.1,
      volume: 28750,
      price: 0.8595,
      change: 0.0035,
      changePercent: 0.41,
      status: 'active',
      leverage: '1:200',
      minLot: 0.01,
      maxLot: 50
    },
    {
      id: 7,
      symbol: 'BTC/USD',
      name: 'Bitcoin / US Dollar',
      category: 'Crypto',
      spread: 25.0,
      volume: 15680,
      price: 43250.50,
      change: 1250.50,
      changePercent: 2.98,
      status: 'active',
      leverage: '1:10',
      minLot: 0.001,
      maxLot: 5
    },
    {
      id: 8,
      symbol: 'ETH/USD',
      name: 'Ethereum / US Dollar',
      category: 'Crypto',
      spread: 8.5,
      volume: 12450,
      price: 2545.75,
      change: -85.25,
      changePercent: -3.24,
      status: 'active',
      leverage: '1:10',
      minLot: 0.01,
      maxLot: 10
    }
  ];

  const filteredPairs = currencyPairs.filter(pair => {
    const matchesSearch = pair.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pair.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pair.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPairs = currencyPairs.length;
  const activePairs = currencyPairs.filter(p => p.status === 'active').length;
  const totalVolume = currencyPairs.reduce((sum, p) => sum + p.volume, 0);
  const avgSpread = currencyPairs.reduce((sum, p) => sum + p.spread, 0) / totalPairs;

  const handleStatusChange = (pairId, newStatus) => {
    // Here you would update the pair status via API
    console.log(`Changing pair ${pairId} status to ${newStatus}`);
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on pairs:`, selectedPairs);
    setSelectedPairs([]);
  };

  return (
    <div>
      <AdminPageHeader 
        title="Currency Pairs" 
        subtitle="Manage trading pairs, spreads, and market settings." 
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
              Add Pair
            </button>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              Import Rates
            </button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Pairs" 
          value={totalPairs.toString()} 
          icon="📊"
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard 
          title="Active Pairs" 
          value={activePairs.toString()} 
          icon="✅"
          trend={{ value: 1, isPositive: true }}
        />
        <StatCard 
          title="Total Volume" 
          value={`${(totalVolume / 1000).toFixed(0)}K`} 
          icon="📈"
          trend={{ value: 15.2, isPositive: true }}
        />
        <StatCard 
          title="Avg Spread" 
          value={`${avgSpread.toFixed(1)} pips`} 
          icon="💹"
          trend={{ value: 0.5, isPositive: false }}
        />
      </div>

      <Card title="Currency Pairs Management">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 p-4 border-b border-[#2a3142]">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search pairs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          {selectedPairs.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkAction('deactivate')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                Deactivate Selected
              </button>
            </div>
          )}
        </div>

        {/* Currency Pairs Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3142]">
                <th className="text-left p-4 text-gray-300 font-medium">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedPairs(filteredPairs.map(p => p.id));
                      } else {
                        setSelectedPairs([]);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">Pair</th>
                <th className="text-left p-4 text-gray-300 font-medium">Category</th>
                <th className="text-left p-4 text-gray-300 font-medium">Price</th>
                <th className="text-left p-4 text-gray-300 font-medium">Change</th>
                <th className="text-left p-4 text-gray-300 font-medium">Spread</th>
                <th className="text-left p-4 text-gray-300 font-medium">Volume</th>
                <th className="text-left p-4 text-gray-300 font-medium">Leverage</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPairs.map((pair) => (
                <tr key={pair.id} className="border-b border-[#1a1f2e] hover:bg-[#151a2e]">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedPairs.includes(pair.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPairs([...selectedPairs, pair.id]);
                        } else {
                          setSelectedPairs(selectedPairs.filter(id => id !== pair.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white">{pair.symbol}</div>
                      <div className="text-sm text-gray-400">{pair.name}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pair.category === 'Major' ? 'bg-blue-600/20 text-blue-400' :
                      pair.category === 'Cross' ? 'bg-purple-600/20 text-purple-400' :
                      'bg-orange-600/20 text-orange-400'
                    }`}>
                      {pair.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-white">{pair.price.toFixed(pair.category === 'Crypto' ? 2 : 4)}</div>
                  </td>
                  <td className="p-4">
                    <div className={`font-medium ${pair.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {pair.change >= 0 ? '+' : ''}{pair.change.toFixed(4)} ({pair.changePercent >= 0 ? '+' : ''}{pair.changePercent.toFixed(2)}%)
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{pair.spread} pips</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{pair.volume.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{pair.leverage}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pair.status === 'active' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-red-600/20 text-red-400'
                    }`}>
                      {pair.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        Edit
                      </button>
                      <button 
                        onClick={() => handleStatusChange(pair.id, pair.status === 'active' ? 'inactive' : 'active')}
                        className={`text-sm ${
                          pair.status === 'active' 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {pair.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPairs.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No currency pairs found matching your criteria.
          </div>
        )}
      </Card>
    </div>
  );
}
