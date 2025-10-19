"use client";
import React, { useState, useEffect } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';

export default function CurrencyManagementPage() {
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingRate, setEditingRate] = useState(null);
  const [newRate, setNewRate] = useState({
    from_currency: 'USD',
    to_currency: '',
    rate: '',
    min_amount: 1,
    max_amount: 1000000
  });

  // Available currencies for the platform
  const availableCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' }
  ];

  useEffect(() => {
    loadCurrencyRates();
  }, []);

  const loadCurrencyRates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/currency/rates', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setCurrencies(data.rates || []);
      } else {
        const err = await response.json().catch(()=>({}));
        console.warn('Currency rates fetch failed', err);
      }
    } catch (error) {
      console.error('Failed to load currency rates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRate = async (rate) => {
    try {
      setSaving(true);
      const response = await fetch('/api/admin/currency/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(rate)
      });

      if (response.ok) {
        await loadCurrencyRates();
        setEditingRate(null);
        alert('Currency rate updated successfully!');
      } else {
        const err = await response.json().catch(()=>({}));
        alert(err.error || 'Failed to update currency rate');
      }
    } catch (error) {
      console.error('Failed to save currency rate:', error);
      alert('Failed to save currency rate');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRate = async (id) => {
    if (!confirm('Are you sure you want to delete this currency rate?')) return;

    try {
      const response = await fetch(`/api/admin/currency/rates/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        await loadCurrencyRates();
        alert('Currency rate deleted successfully!');
      } else {
        alert('Failed to delete currency rate');
      }
    } catch (error) {
      console.error('Failed to delete currency rate:', error);
      alert('Failed to delete currency rate');
    }
  };

  const handleAddNewRate = async () => {
    if (!newRate.to_currency || !newRate.rate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      const response = await fetch('/api/admin/currency/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(newRate)
      });

      if (response.ok) {
        await loadCurrencyRates();
        setNewRate({
          from_currency: 'USD',
          to_currency: '',
          rate: '',
          min_amount: 1,
          max_amount: 1000000
        });
        alert('New currency rate added successfully!');
      } else {
        const err = await response.json().catch(()=>({}));
        alert(err.error || 'Failed to add currency rate');
      }
    } catch (error) {
      console.error('Failed to add currency rate:', error);
      alert('Failed to add currency rate');
    } finally {
      setSaving(false);
    }
  };

  const getCurrencyName = (code) => {
    const currency = availableCurrencies.find(c => c.code === code);
    return currency ? currency.name : code;
  };

  const getCurrencySymbol = (code) => {
    const currency = availableCurrencies.find(c => c.code === code);
    return currency ? currency.symbol : code;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Currency Management"
        subtitle="Manage currency exchange rates and limits for the platform"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add New Currency Rate */}
        <Card title="Add New Currency Rate">
          <div className="space-y-4 p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">From Currency</label>
                <select
                  value={newRate.from_currency}
                  onChange={(e) => setNewRate({...newRate, from_currency: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {availableCurrencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">To Currency *</label>
                <select
                  value={newRate.to_currency}
                  onChange={(e) => setNewRate({...newRate, to_currency: e.target.value})}
                  className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select currency</option>
                  {availableCurrencies.filter(c => c.code !== newRate.from_currency).map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Exchange Rate *</label>
              <input
                type="number"
                step="0.000001"
                value={newRate.rate}
                onChange={(e) => setNewRate({...newRate, rate: e.target.value})}
                placeholder="e.g., 0.85 for EUR to USD"
                className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Rate means: 1 unit of "From" gives this many units of "To" (e.g., 1 USD → 0.92 EUR)
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Min Amount</label>
                <input
                  type="number"
                  value={newRate.min_amount}
                  onChange={(e) => setNewRate({...newRate, min_amount: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Amount</label>
                <input
                  type="number"
                  value={newRate.max_amount}
                  onChange={(e) => setNewRate({...newRate, max_amount: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              onClick={handleAddNewRate}
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  Add Currency Rate
                </>
              )}
            </button>
          </div>
        </Card>

        {/* Current Currency Rates */}
        <Card title="Current Currency Rates">
          <div className="p-4">
            <div className="space-y-3">
              {currencies.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <i className="fas fa-coins text-4xl mb-4"></i>
                  <p>No currency rates configured yet</p>
                </div>
              ) : (
                currencies.map((rate) => (
                  <div key={rate.id} className="bg-[#0f1320] rounded-lg p-4 border border-[#2a3142]">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-white">
                          {getCurrencySymbol(rate.from_currency)}1 {rate.from_currency}
                        </span>
                        <i className="fas fa-arrow-right text-gray-400"></i>
                        <span className="font-semibold text-white">
                          {getCurrencySymbol(rate.to_currency)}{rate.rate} {rate.to_currency}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingRate(rate)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteRate(rate.id)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      Min: {getCurrencySymbol(rate.from_currency)}{rate.min_amount} |
                      Max: {getCurrencySymbol(rate.from_currency)}{rate.max_amount}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Edit Rate Modal */}
      {editingRate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#0f1320] rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Currency Rate</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Exchange Rate</label>
                <input
                  type="number"
                  step="0.000001"
                  defaultValue={editingRate.rate}
                  onChange={(e) => setEditingRate({...editingRate, rate: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Min Amount</label>
                  <input
                    type="number"
                    defaultValue={editingRate.min_amount}
                    onChange={(e) => setEditingRate({...editingRate, min_amount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Amount</label>
                  <input
                    type="number"
                    defaultValue={editingRate.max_amount}
                    onChange={(e) => setEditingRate({...editingRate, max_amount: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 bg-[#1a1f2e] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleSaveRate(editingRate)}
                  disabled={saving}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => setEditingRate(null)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}