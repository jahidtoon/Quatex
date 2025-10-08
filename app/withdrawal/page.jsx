"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import MainAppLayout from '../components/MainAppLayout';

export default function WithdrawalPage() {
  const [selectedMethod, setSelectedMethod] = useState('bank');
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  const withdrawalMethods = [
    { id: 'bank', name: 'Bank Transfer', icon: 'fa-university', fee: 'Free', time: '1-3 days', min: 50 },
    { id: 'card', name: 'Debit Card', icon: 'fa-credit-card', fee: '$5', time: '1-2 days', min: 20 },
    { id: 'crypto', name: 'Cryptocurrency', icon: 'fa-bitcoin', fee: '0.5%', time: '1 hour', min: 25 },
    { id: 'ewallet', name: 'E-Wallet', icon: 'fa-wallet', fee: '$2', time: '2-4 hours', min: 10 }
  ];

  const handleWithdrawal = async (e) => {
    e.preventDefault();
    setProcessing(true);
    
    setTimeout(() => {
      setProcessing(false);
      alert('Withdrawal request submitted!');
      setAmount('');
    }, 2000);
  };

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
              <i className="fas fa-arrow-up text-yellow-400 mr-3"></i>
              Withdraw Funds
            </h1>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Available Balance</div>
            <div className="text-xl font-bold text-green-400">$8,750.25</div>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold mb-6">Select Withdrawal Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {withdrawalMethods.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? 'border-yellow-500 bg-yellow-900/30'
                        : 'border-gray-600 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <i className={`fas ${method.icon} text-2xl text-yellow-400`}></i>
                      <div>
                        <h3 className="font-semibold">{method.name}</h3>
                        <p className="text-sm text-gray-400">Fee: {method.fee}</p>
                        <p className="text-xs text-gray-500">{method.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-6">
              <h2 className="text-xl font-semibold mb-6">Withdrawal Amount</h2>
              <form onSubmit={handleWithdrawal} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (USD)</label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full p-4 bg-gray-700 border border-gray-600 rounded-lg text-white text-xl text-center focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    placeholder="Enter amount"
                    max="8750"
                    min="1"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[100, 500, 1000].map((quickAmount) => (
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

                <button
                  type="submit"
                  disabled={processing || !amount}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold py-4 px-4 rounded-lg transition-colors"
                >
                  {processing ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-arrow-up mr-2"></i>
                      Withdraw ${amount || '0'}
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Withdrawal Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Processing Time:</span>
                  <span>{withdrawalMethods.find(m => m.id === selectedMethod)?.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fee:</span>
                  <span>{withdrawalMethods.find(m => m.id === selectedMethod)?.fee}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Withdrawals</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>$200.00</span>
                  <span className="text-yellow-400">Pending</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>$150.00</span>
                  <span className="text-green-400">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </MainAppLayout>
  );
}
