import React from 'react';
import { FaArrowCircleDown, FaArrowCircleUp, FaShieldAlt, FaUserFriends } from 'react-icons/fa';

const mockHistory = [
  { id: 1, type: 'Buy', asset: 'USDT', amount: '100', status: 'Completed', date: '2025-08-10' },
  { id: 2, type: 'Sell', asset: 'BTC', amount: '0.01', status: 'Pending', date: '2025-08-09' },
  { id: 3, type: 'Buy', asset: 'ETH', amount: '0.5', status: 'Completed', date: '2025-08-08' },
];

const P2P = ({ setCurrentPage }) => (
  <div className="w-full min-h-screen max-w-3xl mx-auto p-8 bg-[#18213a] rounded-xl shadow-2xl">
    <h1 className="text-4xl font-bold text-white mb-4">P2P Trading</h1>
    <p className="text-lg text-gray-300 mb-8">Trade crypto directly with other users in a secure, fast, and flexible environment.</p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      {/* Buy Card */}
      <div className="bg-[#23283a] rounded-2xl p-6 shadow-lg flex flex-col items-center border border-blue-700">
        <FaArrowCircleDown className="text-blue-400 text-5xl mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Buy Crypto</h2>
        <p className="text-gray-400 mb-4 text-center">Purchase crypto assets instantly from trusted sellers with escrow protection.</p>
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg text-lg w-full"
          onClick={() => setCurrentPage && setCurrentPage('buy-crypto')}
        >
          Buy Now
        </button>
      </div>
      {/* Sell Card */}
      <div className="bg-[#23283a] rounded-2xl p-6 shadow-lg flex flex-col items-center border border-green-700">
        <FaArrowCircleUp className="text-green-400 text-5xl mb-4" />
        <h2 className="text-2xl font-semibold text-white mb-2">Sell Crypto</h2>
        <p className="text-gray-400 mb-4 text-center">Sell your crypto securely to verified buyers and receive instant payments.</p>
        <button
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg text-lg w-full"
          onClick={() => setCurrentPage && setCurrentPage('sell-crypto')}
        >
          Sell Now
        </button>
      </div>
    </div>
    {/* Features Row */}
    <div className="flex flex-col md:flex-row gap-6 mb-10">
      <div className="flex items-center gap-3 bg-[#1a2036] rounded-lg px-4 py-3 flex-1">
        <FaShieldAlt className="text-blue-400 text-2xl" />
        <span className="text-white font-medium">Escrow Protected</span>
      </div>
      <div className="flex items-center gap-3 bg-[#1a2036] rounded-lg px-4 py-3 flex-1">
        <FaUserFriends className="text-green-400 text-2xl" />
        <span className="text-white font-medium">Verified Users</span>
      </div>
      <div className="flex items-center gap-3 bg-[#1a2036] rounded-lg px-4 py-3 flex-1">
        <i className="fas fa-bolt text-yellow-400 text-2xl"></i>
        <span className="text-white font-medium">Instant Settlement</span>
      </div>
    </div>
    {/* Transaction History Preview */}
    <div className="bg-[#23283a] rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-semibold text-white mb-4">Recent P2P Transactions</h3>
      <table className="w-full text-left text-gray-300">
        <thead>
          <tr>
            <th className="pb-2">Type</th>
            <th className="pb-2">Asset</th>
            <th className="pb-2">Amount</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {mockHistory.map(tx => (
            <tr key={tx.id} className="border-t border-[#31374a] hover:bg-[#1a2036] transition">
              <td className={tx.type === 'Buy' ? 'text-blue-400 font-bold py-2' : 'text-green-400 font-bold py-2'}>{tx.type}</td>
              <td className="py-2">{tx.asset}</td>
              <td className="py-2">{tx.amount}</td>
              <td className={tx.status === 'Completed' ? 'text-green-400 py-2' : 'text-yellow-400 py-2'}>{tx.status}</td>
              <td className="py-2">{tx.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default P2P;
