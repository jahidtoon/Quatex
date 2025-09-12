'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faWallet, faCreditCard, faBitcoin, faPaypal, faUniversity,
  faHistory, faExclamationTriangle, faCheckCircle, faSpinner,
  faDownload, faCalendar, faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import '../dashboard/styles.css';

export default function AffiliateWithdrawal() {
  const [withdrawalData, setWithdrawalData] = useState(null);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawalRequest, setWithdrawalRequest] = useState({
    amount: '',
    method: 'bank_transfer',
    details: {
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      swift: '',
      paypalEmail: '',
      bitcoinAddress: ''
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('affiliateToken');
    if (!token) {
      router.push('/affiliate/auth');
      return;
    }
    loadWithdrawalData();
  }, [router]);

  const loadWithdrawalData = async () => {
    try {
      setIsLoading(true);
      // Mock data for withdrawal
      const mockData = {
        success: true,
        balance: {
          availableBalance: 14420.50,
          pendingWithdrawals: 1000.00,
          totalWithdrawn: 25680.00,
          minimumWithdrawal: 50.00
        },
        withdrawalMethods: [
          { id: 'bank_transfer', name: 'Bank Transfer', fee: '2%', processingTime: '3-5 business days', minAmount: 100 },
          { id: 'paypal', name: 'PayPal', fee: '3%', processingTime: '1-2 business days', minAmount: 50 },
          { id: 'bitcoin', name: 'Bitcoin', fee: '1%', processingTime: '24 hours', minAmount: 50 },
          { id: 'skrill', name: 'Skrill', fee: '2.5%', processingTime: '1-3 business days', minAmount: 50 }
        ],
        withdrawalHistory: [
          {
            id: 'WD001',
            amount: 1500.00,
            method: 'Bank Transfer',
            requestDate: '2024-09-01',
            processedDate: '2024-09-05',
            status: 'completed',
            transactionId: 'TXN_WD_001',
            fee: 30.00,
            netAmount: 1470.00
          },
          {
            id: 'WD002',
            amount: 800.00,
            method: 'PayPal',
            requestDate: '2024-08-15',
            processedDate: '2024-08-17',
            status: 'completed',
            transactionId: 'TXN_WD_002',
            fee: 24.00,
            netAmount: 776.00
          },
          {
            id: 'WD003',
            amount: 1000.00,
            method: 'Bitcoin',
            requestDate: '2024-09-08',
            processedDate: null,
            status: 'pending',
            transactionId: 'TXN_WD_003',
            fee: 10.00,
            netAmount: 990.00
          },
          {
            id: 'WD004',
            amount: 600.00,
            method: 'Bank Transfer',
            requestDate: '2024-07-20',
            processedDate: '2024-07-25',
            status: 'completed',
            transactionId: 'TXN_WD_004',
            fee: 12.00,
            netAmount: 588.00
          }
        ]
      };
      setWithdrawalData(mockData);
    } catch (error) {
      console.error('Error loading withdrawal data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawalSubmit = () => {
    if (!withdrawalRequest.amount || parseFloat(withdrawalRequest.amount) < withdrawalData.balance.minimumWithdrawal) {
      alert(`Minimum withdrawal amount is $${withdrawalData.balance.minimumWithdrawal}`);
      return;
    }

    if (parseFloat(withdrawalRequest.amount) > withdrawalData.balance.availableBalance) {
      alert('Insufficient balance');
      return;
    }

    alert('Withdrawal request submitted successfully! You will receive confirmation within 24 hours.');
    setShowWithdrawForm(false);
    setWithdrawalRequest({
      amount: '',
      method: 'bank_transfer',
      details: {
        bankName: '',
        accountNumber: '',
        accountHolder: '',
        swift: '',
        paypalEmail: '',
        bitcoinAddress: ''
      }
    });
  };

  const getMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'bank transfer': return faUniversity;
      case 'paypal': return faPaypal;
      case 'bitcoin': return faBitcoin;
      case 'skrill': return faCreditCard;
      default: return faWallet;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return faCheckCircle;
      case 'pending': return faSpinner;
      case 'failed': return faExclamationTriangle;
      default: return faSpinner;
    }
  };

  const StatCard = ({ icon, title, value, subtitle, cardType }) => {
    const cardClasses = {
      available: 'earnings-card',
      pending: 'pending-card', 
      withdrawn: 'commission-card',
      minimum: 'referrals-card'
    };
    
    return (
      <div className={`stat-card-gradient ${cardClasses[cardType]} affiliate-card`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/90 text-sm font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-white/80 mt-2">{subtitle}</p>
            )}
          </div>
          <div className="text-4xl text-white/90">
            <FontAwesomeIcon icon={icon} />
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="affiliate-dashboard-bg min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/80">Loading Withdrawal...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="affiliate-dashboard-bg min-h-screen">
      {/* Animated Blobs */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      <div className="blob blob-3"></div>
      <div className="blob blob-4"></div>
      
      {/* Main Content */}
      <div className="p-4 lg:p-8">
        {/* Page Title */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">
            Withdrawal Center 💳
          </h1>
          <p className="text-white/80 text-lg backdrop-blur-sm bg-white/10 rounded-lg p-4 inline-block border border-white/20">
            Manage your earnings withdrawals
          </p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={faWallet}
            title="Available Balance"
            value={`$${withdrawalData?.balance?.availableBalance?.toLocaleString() || '0'}`}
            subtitle="Ready to withdraw"
            cardType="available"
          />
          <StatCard
            icon={faSpinner}
            title="Pending Withdrawals"
            value={`$${withdrawalData?.balance?.pendingWithdrawals?.toLocaleString() || '0'}`}
            subtitle="In process"
            cardType="pending"
          />
          <StatCard
            icon={faCheckCircle}
            title="Total Withdrawn"
            value={`$${withdrawalData?.balance?.totalWithdrawn?.toLocaleString() || '0'}`}
            subtitle="All time"
            cardType="withdrawn"
          />
          <StatCard
            icon={faDollarSign}
            title="Minimum Amount"
            value={`$${withdrawalData?.balance?.minimumWithdrawal || '0'}`}
            subtitle="Per withdrawal"
            cardType="minimum"
          />
        </div>

        {/* Withdrawal Methods */}
        <div className="affiliate-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Withdrawal Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {withdrawalData?.withdrawalMethods?.map((method) => (
              <div key={method.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <div className="text-center">
                  <FontAwesomeIcon icon={getMethodIcon(method.name)} className="text-3xl text-blue-600 mb-3" />
                  <h4 className="font-semibold text-gray-900 mb-2">{method.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Fee: <span className="font-medium text-red-600">{method.fee}</span></p>
                    <p>Min: <span className="font-medium">${method.minAmount}</span></p>
                    <p>Time: <span className="font-medium">{method.processingTime}</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Withdrawal Form */}
        {showWithdrawForm && (
          <div className="affiliate-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Request Withdrawal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  value={withdrawalRequest.amount}
                  onChange={(e) => setWithdrawalRequest({...withdrawalRequest, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter amount"
                  min={withdrawalData?.balance?.minimumWithdrawal}
                  max={withdrawalData?.balance?.availableBalance}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: ${withdrawalData?.balance?.availableBalance?.toLocaleString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select
                  value={withdrawalRequest.method}
                  onChange={(e) => setWithdrawalRequest({...withdrawalRequest, method: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {withdrawalData?.withdrawalMethods?.map((method) => (
                    <option key={method.id} value={method.id}>{method.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Payment Details */}
            <div className="mt-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Payment Details</h4>
              {withdrawalRequest.method === 'bank_transfer' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Bank Name"
                    value={withdrawalRequest.details.bankName}
                    onChange={(e) => setWithdrawalRequest({
                      ...withdrawalRequest,
                      details: {...withdrawalRequest.details, bankName: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={withdrawalRequest.details.accountNumber}
                    onChange={(e) => setWithdrawalRequest({
                      ...withdrawalRequest,
                      details: {...withdrawalRequest.details, accountNumber: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={withdrawalRequest.details.accountHolder}
                    onChange={(e) => setWithdrawalRequest({
                      ...withdrawalRequest,
                      details: {...withdrawalRequest.details, accountHolder: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="SWIFT/BIC Code"
                    value={withdrawalRequest.details.swift}
                    onChange={(e) => setWithdrawalRequest({
                      ...withdrawalRequest,
                      details: {...withdrawalRequest.details, swift: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}
              {withdrawalRequest.method === 'paypal' && (
                <input
                  type="email"
                  placeholder="PayPal Email Address"
                  value={withdrawalRequest.details.paypalEmail}
                  onChange={(e) => setWithdrawalRequest({
                    ...withdrawalRequest,
                    details: {...withdrawalRequest.details, paypalEmail: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
              {withdrawalRequest.method === 'bitcoin' && (
                <input
                  type="text"
                  placeholder="Bitcoin Wallet Address"
                  value={withdrawalRequest.details.bitcoinAddress}
                  onChange={(e) => setWithdrawalRequest({
                    ...withdrawalRequest,
                    details: {...withdrawalRequest.details, bitcoinAddress: e.target.value}
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowWithdrawForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleWithdrawalSubmit}
                className="btn-gradient-success px-4 py-2 rounded-lg"
              >
                Submit Request
              </button>
            </div>
          </div>
        )}

        {/* Withdrawal History */}
        <div className="affiliate-card">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Withdrawal History</h3>
            <button className="btn-gradient-success px-4 py-2 rounded-lg">
              <FontAwesomeIcon icon={faDownload} className="mr-2" />
              Export History
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawalData?.withdrawalHistory?.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{withdrawal.id}</div>
                        <div className="text-sm text-gray-500">{withdrawal.transactionId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FontAwesomeIcon icon={getMethodIcon(withdrawal.method)} className="text-blue-600 mr-2" />
                        <span className="text-sm text-gray-900">{withdrawal.method}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${withdrawal.amount}</div>
                      <div className="text-sm text-gray-500">Fee: ${withdrawal.fee}</div>
                      <div className="text-sm font-medium text-green-600">Net: ${withdrawal.netAmount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">Requested: {withdrawal.requestDate}</div>
                      {withdrawal.processedDate && (
                        <div className="text-sm text-gray-500">Processed: {withdrawal.processedDate}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                        <FontAwesomeIcon icon={getStatusIcon(withdrawal.status)} className="mr-1" />
                        {withdrawal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
