"use client";
import React, { useState } from 'react';

const Deposit = ({ setCurrentPage }) => {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [amount, setAmount] = useState('');

  const paymentMethods = [
    { id: 'card', icon: 'fab fa-cc-visa', name: 'Credit/Debit Card', color: 'text-blue-400' },
    { id: 'paypal', icon: 'fab fa-paypal', name: 'PayPal', color: 'text-blue-300' },
    { id: 'crypto', icon: 'fab fa-bitcoin', name: 'Cryptocurrency', color: 'text-yellow-500' },
    { id: 'bank', icon: 'fas fa-university', name: 'Bank Transfer', color: 'text-green-400' }
  ];

  const quickAmounts = [50, 100, 250, 500, 1000, 2500];

  return (
    <div className="w-full min-h-screen bg-[#181c2b] p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button 
            onClick={() => setCurrentPage('trade')} 
            className="text-gray-400 hover:text-white transition-colors mr-4"
          >
            <i className="fas fa-arrow-left text-lg" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white">Deposit Funds</h1>
            <p className="text-gray-400 mt-2">Add money to your trading account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-[#23283a] rounded-xl p-6 shadow-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Select Payment Method</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-6 rounded-lg border-2 transition-all duration-200 bg-[#1a2036] hover:bg-[#2a3142] ${
                      selectedMethod === method.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <i className={`${method.icon} text-4xl ${method.color} mb-3 block`} />
                    <span className="text-white font-medium text-sm">{method.name}</span>
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Deposit Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#1a2036] border border-gray-600 text-white text-lg rounded-lg pl-8 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter amount"
                  />
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="mb-8">
                <label className="block text-white font-medium mb-3">Quick Select</label>
                <div className="grid grid-cols-3 gap-3">
                  {quickAmounts.map((quickAmount) => (
                    <button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="bg-[#1a2036] hover:bg-blue-600 text-gray-300 hover:text-white border border-gray-600 hover:border-blue-500 py-3 rounded-lg transition-colors font-medium"
                    >
                      ${quickAmount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deposit Button */}
              <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg">
                <i className="fas fa-credit-card mr-2" />
                Proceed to Deposit
              </button>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="bg-[#23283a] rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Deposit Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Payment Method:</span>
                  <span className="text-white capitalize">{selectedMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">${amount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing Fee:</span>
                  <span className="text-green-400">Free</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-green-400">${amount || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Bonus Info */}
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-xl p-6">
              <div className="flex items-center mb-3">
                <i className="fas fa-gift text-green-400 text-xl mr-3" />
                <h3 className="text-lg font-semibold text-white">Bonus Offer</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Get a 30% bonus on your first deposit of $100 or more!
              </p>
              <div className="bg-green-500 text-white text-xs font-bold rounded px-2 py-1 inline-block">
                30% BONUS
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Deposit;
