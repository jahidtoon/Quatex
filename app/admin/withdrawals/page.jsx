"use client";
import React, { useState } from 'react';
import AdminActionModal from '../components/AdminActionModal';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function WithdrawalsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [modalWithdrawal, setModalWithdrawal] = useState(null);

  // Mock withdrawals data
  const withdrawals = [
    { 
      id: 'WDR-001', 
      user: 'john.doe@example.com', 
      name: 'John Doe',
      amount: 750, 
      method: 'Bank Transfer', 
      status: 'Completed', 
      date: '2025-08-29 14:15:30',
      bankAccount: 'Bank of America ****1234',
      transactionId: 'TXN-WD-789123456'
    },
    { 
      id: 'WDR-002', 
      user: 'maria.garcia@example.com', 
      name: 'Maria Garcia',
      amount: 1250, 
      method: 'Crypto', 
      status: 'Pending', 
      date: '2025-08-29 13:30:15',
      walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      transactionId: 'TXN-WD-456789123'
    },
    { 
      id: 'WDR-003', 
      user: 'alex.johnson@example.com', 
      name: 'Alex Johnson',
      amount: 500, 
      method: 'PayPal', 
      status: 'Processing', 
      date: '2025-08-29 12:45:22',
      paypalEmail: 'alex.johnson@paypal.com',
      transactionId: 'TXN-WD-123456789'
    },
    { 
      id: 'WDR-004', 
      user: 'mike.wilson@example.com', 
      name: 'Mike Wilson',
      amount: 2000, 
      method: 'Wire Transfer', 
      status: 'Under Review', 
      date: '2025-08-29 11:20:10',
      bankAccount: 'Chase Bank ****5678',
      transactionId: 'TXN-WD-987654321'
    },
    { 
      id: 'WDR-005', 
      user: 'emma.davis@example.com', 
      name: 'Emma Davis',
      amount: 300, 
      method: 'Credit Card', 
      status: 'Failed', 
      date: '2025-08-29 10:15:45',
      reason: 'Insufficient funds verification',
      transactionId: 'TXN-WD-555666777'
    }
  ];

  const stats = {
    totalWithdrawals: 125000,
    pendingWithdrawals: 5,
    todayWithdrawals: 3800,
    avgWithdrawalAmount: 890
  };

  const filteredWithdrawals = selectedStatus === 'all' 
    ? withdrawals 
    : withdrawals.filter(w => w.status.toLowerCase().replace(' ', '-') === selectedStatus);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-600/20 text-green-400';
      case 'pending': return 'bg-yellow-600/20 text-yellow-400';
      case 'processing': return 'bg-blue-600/20 text-blue-400';
      case 'under review': return 'bg-purple-600/20 text-purple-400';
      case 'failed': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'bank transfer': return '🏦';
      case 'wire transfer': return '🏛️';
      case 'crypto': return '₿';
      case 'paypal': return '💙';
      case 'credit card': return '💳';
      default: return '💰';
    }
  };

  // Modal action handlers
  const handleAction = (type, withdrawal) => {
    setModalType(type);
    setModalWithdrawal(withdrawal);
    setModalOpen(true);
  };

  const handleApprove = () => {
    alert(`Withdrawal ${modalWithdrawal.id} approved!`);
    setModalOpen(false);
  };

  const handleReject = () => {
    alert(`Withdrawal ${modalWithdrawal.id} rejected!`);
    setModalOpen(false);
  };

  const handleReview = () => {
    alert(`Reviewing withdrawal ${modalWithdrawal.id}...`);
    setModalOpen(false);
  };

  const handleRetry = () => {
    alert(`Retrying withdrawal ${modalWithdrawal.id}...`);
    setModalOpen(false);
  };

  return (
    <div>
      <AdminPageHeader 
        title="Withdrawals Management" 
        subtitle="Process and monitor user withdrawal requests" 
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Withdrawals" 
          value={`$${stats.totalWithdrawals.toLocaleString()}`} 
          icon="💸"
          trend={{ value: -5.2, isPositive: false }}
        />
        <StatCard 
          title="Pending Review" 
          value={stats.pendingWithdrawals.toString()} 
          icon="⏳"
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard 
          title="Today's Withdrawals" 
          value={`$${stats.todayWithdrawals.toLocaleString()}`} 
          icon="📤"
          trend={{ value: 3.8, isPositive: true }}
        />
        <StatCard 
          title="Avg Amount" 
          value={`$${stats.avgWithdrawalAmount}`} 
          icon="📊"
          trend={{ value: 12.1, isPositive: true }}
        />
      </div>

      {/* Withdrawals Table */}
      <Card title="Withdrawal Requests">
        {/* Status Filter */}
        <div className="p-4 border-b border-[#262b40]">
          <div className="flex flex-wrap gap-2">
            {['all', 'completed', 'pending', 'processing', 'under-review', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
                }`}
              >
                {status.replace('-', ' ')} ({status === 'all' ? withdrawals.length : withdrawals.filter(w => w.status.toLowerCase().replace(' ', '-') === status).length})
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#101527] text-gray-300">
              <tr>
                <th className="text-left p-4">ID</th>
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Amount</th>
                <th className="text-left p-4">Method</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Date</th>
                <th className="text-left p-4">Details</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.map((withdrawal) => (
                <tr key={withdrawal.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                  <td className="p-4 font-medium text-blue-400">{withdrawal.id}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{withdrawal.name}</div>
                      <div className="text-xs text-gray-400">{withdrawal.user}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-red-400 text-lg">
                      -${withdrawal.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getMethodIcon(withdrawal.method)}</span>
                      <span>{withdrawal.method}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                      {withdrawal.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{withdrawal.date}</td>
                  <td className="p-4">
                    <div className="text-xs text-gray-400">
                      {withdrawal.bankAccount && <div>🏦 {withdrawal.bankAccount}</div>}
                      {withdrawal.walletAddress && <div>₿ {withdrawal.walletAddress.substring(0, 20)}...</div>}
                      {withdrawal.paypalEmail && <div>💙 {withdrawal.paypalEmail}</div>}
                      {withdrawal.reason && <div className="text-red-400">❌ {withdrawal.reason}</div>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700" onClick={() => handleAction('view', withdrawal)}>
                        View
                      </button>
                      {withdrawal.status === 'Pending' && (
                        <>
                          <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700" onClick={() => handleAction('approve', withdrawal)}>
                            Approve
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700" onClick={() => handleAction('reject', withdrawal)}>
                            Reject
                          </button>
                        </>
                      )}
                      {withdrawal.status === 'Under Review' && (
                        <button className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700" onClick={() => handleAction('review', withdrawal)}>
                          Review
                        </button>
                      )}
                      {withdrawal.status === 'Failed' && (
                        <button className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700" onClick={() => handleAction('retry', withdrawal)}>
                          Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredWithdrawals.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">💸</div>
            <div className="text-lg mb-2">No {selectedStatus === 'all' ? '' : selectedStatus.replace('-', ' ')} withdrawals found</div>
            <div className="text-sm">Withdrawal requests will appear here as users submit them</div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="p-4 border-t border-[#262b40] bg-[#101527] rounded-b-lg">
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
              📤 Bulk Approve
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              📊 Export Report
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
              🔍 Advanced Search
            </button>
            <button className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm">
              ⚙️ Withdrawal Settings
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
