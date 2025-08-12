
import { useState } from 'react';
import Signals from './Signals';
import Market from './Market';

const Analytics = () => {
  const [tab, setTab] = useState('analytics');
  return (
    <div className="p-8 bg-[#181c2b] min-h-screen w-full font-sans">
      {/* Tabs */}
      <div className="mb-8 flex gap-2 border-b border-gray-700">
        <button
          className={`px-6 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${tab === 'analytics' ? 'bg-[#23283a] text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setTab('analytics')}
        >
          <i className="fas fa-chart-bar mr-2" /> Analytics
        </button>
        <button
          className={`px-6 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${tab === 'signals' ? 'bg-[#23283a] text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setTab('signals')}
        >
          <i className="fas fa-bolt mr-2" /> Signals
        </button>
        <button
          className={`px-6 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${tab === 'market' ? 'bg-[#23283a] text-white border-b-2 border-blue-500' : 'text-gray-400 hover:text-white'}`}
          onClick={() => setTab('market')}
        >
          <i className="fas fa-shopping-cart mr-2" /> Market
        </button>
      </div>
      {tab === 'analytics' && (
        <>
          {/* Header */}
          <div className="mb-10 w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-1 tracking-tight">Analytics</h1>
              <p className="text-gray-400 text-base">Trading performance and analytics dashboard</p>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/30">Updated: Today</span>
              <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold border border-blue-500/30">Demo Data</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 w-full">
            {/* Card 1 */}
            <div className="bg-gradient-to-br from-green-500/10 to-[#31374a] rounded-2xl p-7 shadow-xl border border-green-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Profit</p>
                  <p className="text-3xl font-extrabold text-green-400 mt-1">$1,234.56</p>
                </div>
                <div className="bg-green-500/20 rounded-full p-3 text-green-400 text-2xl shadow"><i className="fas fa-chart-line" /></div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-[#31374a] rounded-2xl p-7 shadow-xl border border-blue-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Win Rate</p>
                  <p className="text-3xl font-extrabold text-blue-400 mt-1">68.5%</p>
                </div>
                <div className="bg-blue-500/20 rounded-full p-3 text-blue-400 text-2xl shadow"><i className="fas fa-bullseye" /></div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-gradient-to-br from-purple-500/10 to-[#31374a] rounded-2xl p-7 shadow-xl border border-purple-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Trades</p>
                  <p className="text-3xl font-extrabold text-purple-400 mt-1">156</p>
                </div>
                <div className="bg-purple-500/20 rounded-full p-3 text-purple-400 text-2xl shadow"><i className="fas fa-chart-bar" /></div>
              </div>
            </div>
            {/* Card 4 */}
            <div className="bg-gradient-to-br from-yellow-500/10 to-[#31374a] rounded-2xl p-7 shadow-xl border border-yellow-500/20 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">ROI</p>
                  <p className="text-3xl font-extrabold text-yellow-400 mt-1">24.3%</p>
                </div>
                <div className="bg-yellow-500/20 rounded-full p-3 text-yellow-400 text-2xl shadow"><i className="fas fa-lightbulb" /></div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
            <div className="bg-[#23283a] rounded-2xl p-8 shadow-lg border border-gray-700">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2"><i className="fas fa-chart-area text-blue-400" /> Profit/Loss Chart</h3>
              <div className="h-64 bg-gradient-to-br from-[#23283a] to-[#181c2b] rounded-xl flex items-center justify-center border border-gray-700">
                <p className="text-gray-400">📈 Chart will be displayed here</p>
              </div>
            </div>
            <div className="bg-[#23283a] rounded-2xl p-8 shadow-lg border border-gray-700">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2"><i className="fas fa-history text-purple-400" /> Trading Activity</h3>
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Today</span>
                  <span className="text-white font-bold">12 trades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">This Week</span>
                  <span className="text-white font-bold">45 trades</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">This Month</span>
                  <span className="text-white font-bold">156 trades</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {tab === 'signals' && <Signals />}
      {tab === 'market' && <Market />}
    </div>
  );
};

export default Analytics;
