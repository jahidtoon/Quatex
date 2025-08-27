"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function DepositPage() {
  const [selectedMethod, setSelectedMethod] = useState('card');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: 'fa-credit-card', fee: '2.5%', min: 10, max: 10000 },
    { id: 'bank', name: 'Bank Transfer', icon: 'fa-university', fee: 'Free', min: 50, max: 50000 },
    { id: 'crypto', name: 'Cryptocurrency', icon: 'fa-bitcoin', fee: '1%', min: 20, max: 100000 },
    { id: 'ewallet', name: 'E-Wallet', icon: 'fa-wallet', fee: '1.5%', min: 5, max: 5000 }
  ];

  const quickAmounts = [50, 100, 250, 500, 1000, 2500];

  const handleDeposit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    // Simulate processing
    setTimeout(() => {
      setProcessing(false);
      alert('Deposit successful!');
      setAmount('');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-arrow-down text-green-400 mr-3"></i>
              Deposit Funds
            </h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Current Balance</div>
            <div className="text-xl font-bold text-green-400">$8,750.25</div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Select Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <i className={`fas ${method.icon} text-2xl text-blue-400`}></i>
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-gray-400">Fee: {method.fee}</p>
                        <p className="text-xs text-gray-500">${method.min} - ${method.max.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deposit Form */}
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-6">
              <h2 className="text-xl font-semibold mb-6">Deposit Amount</h2>
              <form onSubmit={handleDeposit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                    min="1"
                    required
                  />
                </div>

                {/* Quick Amount Buttons */}
                <div>
                  <label className="block text-sm font-medium mb-2">Quick Select</label>
                  <div className="grid grid-cols-3 gap-2">
                    {quickAmounts.map((quickAmount) => (
                      <button
                        key={quickAmount}
                        type="button"
                        onClick={() => setAmount(quickAmount.toString())}
                        className="py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
                      >
                        ${quickAmount}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing || !amount}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-4 px-4 rounded-lg transition-colors"
                >
                  {processing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus mr-2"></i>
                      Deposit ${amount || '0'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Deposit Info */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Deposit Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Minimum:</span>
                  <span>${paymentMethods.find(m => m.id === selectedMethod)?.min}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Maximum:</span>
                  <span>${paymentMethods.find(m => m.id === selectedMethod)?.max.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing Fee:</span>
                  <span>{paymentMethods.find(m => m.id === selectedMethod)?.fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing Time:</span>
                  <span>Instant</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Deposits</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>$500.00</span>
                  <span className="text-green-400">Completed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$250.00</span>
                  <span className="text-green-400">Completed</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$100.00</span>
                  <span className="text-yellow-400">Processing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
