"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminPageHeader from '../../components/AdminPageHeader';
import Card from '../../components/Card';

export default function CreateTournamentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'PROFIT_BASED',
    entry_fee: '0',
    max_participants: '',
    start_date: '',
    end_date: '',
    rules: ''
  });

  const [prizes, setPrizes] = useState([
    { rank: 1, prize_amount: '', description: '1st Place Prize' },
    { rank: 2, prize_amount: '', description: '2nd Place Prize' },
    { rank: 3, prize_amount: '', description: '3rd Place Prize' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePrizeChange = (index, field, value) => {
    setPrizes(prev => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  };

  const addPrize = () => {
    setPrizes(prev => [
      ...prev,
      { rank: prev.length + 1, prize_amount: '', description: `${prev.length + 1}th Place Prize` }
    ]);
  };

  const removePrize = (index) => {
    if (prizes.length > 1) {
      setPrizes(prev => prev.filter((_, i) => i !== index).map((p, i) => ({ ...p, rank: i + 1 })));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate
      if (!formData.title || !formData.start_date || !formData.end_date) {
        throw new Error('Title, start date, and end date are required');
      }

      // Filter out prizes without amounts
      const validPrizes = prizes.filter(p => p.prize_amount && Number(p.prize_amount) > 0);

      const payload = {
        ...formData,
        entry_fee: Number(formData.entry_fee) || 0,
        max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
        prizes: validPrizes
      };

      const response = await fetch('/api/admin/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Send cookies
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create tournament');
      }

      alert('Tournament created successfully!');
      router.push('/admin/tournaments');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Create Tournament"
        subtitle="Set up a new trading competition"
        actions={
          <button 
            onClick={() => router.push('/admin/tournaments')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            ← Back
          </button>
        }
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="text-sm text-red-200 flex items-center justify-between p-4">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2">
            <Card title="Tournament Information">
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tournament Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="e.g., Weekend Crypto Challenge"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Brief description of the tournament..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tournament Type
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="PROFIT_BASED">Profit Based</option>
                      <option value="WIN_RATE">Win Rate</option>
                      <option value="VOLUME_BASED">Volume Based</option>
                      <option value="MIXED">Mixed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Entry Fee ($)
                    </label>
                    <input
                      type="number"
                      name="entry_fee"
                      value={formData.entry_fee}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Participants (optional)
                  </label>
                  <input
                    type="number"
                    name="max_participants"
                    value={formData.max_participants}
                    onChange={handleInputChange}
                    min="1"
                    className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Leave empty for unlimited"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Rules
                  </label>
                  <textarea
                    name="rules"
                    value={formData.rules}
                    onChange={handleInputChange}
                    rows="5"
                    className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:border-blue-500"
                    placeholder="Enter tournament rules and guidelines..."
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Prize Structure */}
          <div>
            <Card title="Prize Structure">
              <div className="p-6">
                <div className="space-y-4 mb-4">
                  {prizes.map((prize, index) => (
                    <div key={index} className="bg-[#1a1f33] p-4 rounded-lg border border-[#262b40]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-300">
                          {prize.rank === 1 ? '🥇' : prize.rank === 2 ? '🥈' : prize.rank === 3 ? '🥉' : `#${prize.rank}`} Place
                        </span>
                        {prizes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removePrize(index)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="number"
                        value={prize.prize_amount}
                        onChange={(e) => handlePrizeChange(index, 'prize_amount', e.target.value)}
                        placeholder="Prize amount ($)"
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 bg-[#0f1320] border border-[#262b40] rounded text-white text-sm focus:outline-none focus:border-blue-500 mb-2"
                      />
                      <input
                        type="text"
                        value={prize.description}
                        onChange={(e) => handlePrizeChange(index, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full px-3 py-2 bg-[#0f1320] border border-[#262b40] rounded text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addPrize}
                  className="w-full px-4 py-2 bg-[#1a1f33] border border-[#262b40] text-gray-300 rounded-lg hover:bg-[#232945] transition-colors text-sm"
                >
                  + Add Prize Tier
                </button>

                <div className="mt-6 pt-4 border-t border-[#262b40]">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Total Prize Pool:</span>
                    <span className="text-green-400 font-bold text-lg">
                      ${prizes.reduce((sum, p) => sum + (Number(p.prize_amount) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors font-semibold"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Create Tournament
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
