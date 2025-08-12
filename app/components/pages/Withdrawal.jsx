"use client";
import React, { useState } from 'react';

const Withdrawal = ({ setCurrentPage }) => {
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [accountDetails, setAccountDetails] = useState('');

  const withdrawalMethods = [
    { id: 'bank', icon: 'fas fa-university', name: 'Bank Transfer', color: 'text-green-400', fee: '2%' },
    { id: 'paypal', icon: 'fab fa-paypal', name: 'PayPal', color: 'text-blue-300', fee: '3%' },
    { id: 'crypto', icon: 'fab fa-bitcoin', name: 'Cryptocurrency', color: 'text-yellow-500', fee: '1%' },
    { id: 'card', icon: 'fab fa-cc-visa', name: 'Debit Card', color: 'text-blue-400', fee: '2.5%' }
  ];

  const calculateFee = (amount) => {
    const method = withdrawalMethods.find(m => m.id === selectedMethod);
    const feePercent = parseFloat(method?.fee) || 2;
    return (parseFloat(amount || 0) * feePercent / 100).toFixed(2);
  };

  const calculateTotal = (amount) => {
    const fee = parseFloat(calculateFee(amount));
    return (parseFloat(amount || 0) - fee).toFixed(2);
  };

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
            <h1 className="text-3xl font-bold text-white">Withdraw Funds</h1>
            <p className="text-gray-400 mt-2">Withdraw money from your trading account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Withdrawal Form */}
          <div className="lg:col-span-2">
            <div className="bg-[#23283a] rounded-xl p-6 shadow-lg border border-gray-700">
              {/* Account Balance */}
              <div className="bg-[#1a2036] rounded-lg p-4 mb-6 border border-gray-600">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Available Balance</p>
                    <p className="text-white text-2xl font-bold">$10,000.00</p>
                  </div>
                  <div className="text-green-400">
                    <i className="fas fa-wallet text-3xl" />
                  </div>
                </div>
              </div>

              {/* Withdrawal Methods */}
              <h2 className="text-xl font-semibold text-white mb-6">Select Withdrawal Method</h2>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {withdrawalMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-lg border-2 transition-all duration-200 bg-[#1a2036] hover:bg-[#2a3142] ${
                      selectedMethod === method.id 
                        ? 'border-blue-500 bg-blue-500/10' 
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <i className={`${method.icon} text-3xl ${method.color} mb-2 block`} />
                    <span className="text-white font-medium text-sm block">{method.name}</span>
                    <span className="text-gray-400 text-xs">Fee: {method.fee}</span>
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="mb-6">
                <label className="block text-white font-medium mb-3">Withdrawal Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-[#1a2036] border border-gray-600 text-white text-lg rounded-lg pl-8 pr-4 py-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="Enter amount"
                    max="10000"
                  />
                </div>
                <p className="text-gray-400 text-sm mt-2">Maximum withdrawal: $10,000.00</p>
              </div>

              {/* Account Details */}
              <div className="mb-8">
                <label className="block text-white font-medium mb-3">
                  {selectedMethod === 'bank' ? 'Bank Account Details' : 
                   selectedMethod === 'paypal' ? 'PayPal Email' :
                   selectedMethod === 'crypto' ? 'Wallet Address' : 'Card Details'}
                </label>
                <textarea
                  value={accountDetails}
                  onChange={(e) => setAccountDetails(e.target.value)}
                  className="w-full bg-[#1a2036] border border-gray-600 text-white rounded-lg p-4 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  rows="3"
                  placeholder={
                    selectedMethod === 'bank' ? 'Enter bank account number, routing number, etc.' :
                    selectedMethod === 'paypal' ? 'Enter your PayPal email address' :
                    selectedMethod === 'crypto' ? 'Enter your wallet address' :
                    'Enter your card details'
                  }
                />
              </div>

              {/* Withdrawal Button */}
              <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg">
                <i className="fas fa-paper-plane mr-2" />
                Request Withdrawal
              </button>

              {/* Warning Notice */}
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex items-start">
                  <i className="fas fa-exclamation-triangle text-yellow-500 mt-1 mr-3" />
                  <div>
                    <p className="text-yellow-400 font-medium text-sm">Important Notice</p>
                    <p className="text-gray-300 text-sm mt-1">
                      Withdrawals are processed within 1-3 business days. Please ensure your account details are correct.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div>
            <div className="bg-[#23283a] rounded-xl p-6 shadow-lg border border-gray-700 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Withdrawal Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Method:</span>
                  <span className="text-white capitalize">{selectedMethod}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Amount:</span>
                  <span className="text-white">${amount || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Processing Fee:</span>
                  <span className="text-red-400">${calculateFee(amount)}</span>
                </div>
                <hr className="border-gray-600" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">You'll Receive:</span>
                  <span className="text-green-400">${calculateTotal(amount)}</span>
                </div>
              </div>
            </div>

            {/* Processing Info */}
            <div className="bg-[#23283a] rounded-xl p-6 shadow-lg border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Processing Times</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Bank Transfer:</span>
                  <span className="text-white">1-3 days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">PayPal:</span>
                  <span className="text-white">24 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cryptocurrency:</span>
                  <span className="text-white">1-2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Debit Card:</span>
                  <span className="text-white">2-5 days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Withdrawal;
