"use client";
import React, { useState } from 'react';
import AdminActionModal from '../components/AdminActionModal';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function DepositsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [modalDeposit, setModalDeposit] = useState(null);

  // Mock deposits data
  const deposits = [
    { 
      id: 'DEP-001', 
      user: 'john.doe@example.com', 
      name: 'John Doe',
      amount: 500, 
      method: 'Credit Card', 
      status: 'Completed', 
      date: '2025-08-29 14:30:15',
      transactionId: 'TXN-CC-789456123'
    },
    { 
      id: 'DEP-002', 
      user: 'maria.garcia@example.com', 
      name: 'Maria Garcia',
      amount: 1000, 
      method: 'Bank Transfer', 
      status: 'Pending', 
      date: '2025-08-29 13:45:22',
      transactionId: 'TXN-BT-456789123'
    },
    { 
      id: 'DEP-003', 
      user: 'alex.johnson@example.com', 
      name: 'Alex Johnson',
      amount: 250, 
      method: 'PayPal', 
      status: 'Completed', 
      date: '2025-08-29 12:20:30',
      transactionId: 'TXN-PP-123456789'
    },
    { 
      id: 'DEP-004', 
      user: 'mike.wilson@example.com', 
      name: 'Mike Wilson',
      amount: 750, 
      method: 'Crypto', 
      status: 'Failed', 
      date: '2025-08-29 11:15:45',
      transactionId: 'TXN-CR-987654321'
    },
    { 
      id: 'DEP-005', 
      user: 'emma.davis@example.com', 
      name: 'Emma Davis',
      amount: 2000, 
      method: 'Bank Transfer', 
      status: 'Processing', 
      date: '2025-08-29 10:30:12',
      transactionId: 'TXN-BT-555666777'
    }
  ];

  const stats = {
    totalDeposits: 87500,
    todayDeposits: 4500,
    pendingDeposits: 3,
    avgDepositAmount: 652
  };

  const filteredDeposits = selectedStatus === 'all' 
    ? deposits 
    : deposits.filter(d => d.status.toLowerCase() === selectedStatus);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-600/20 text-green-400';
      case 'pending': return 'bg-yellow-600/20 text-yellow-400';
      case 'processing': return 'bg-blue-600/20 text-blue-400';
      case 'failed': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getMethodIcon = (method) => {
    switch (method.toLowerCase()) {
      case 'credit card': return '💳';
      case 'bank transfer': return '🏦';
      case 'paypal': return '💙';
      case 'crypto': return '₿';
      default: return '💰';
    }
  };

  // Modal action handlers
  const handleAction = (type, deposit) => {
    setModalType(type);
    setModalDeposit(deposit);
    setModalOpen(true);
  };

  const handleApprove = () => {
    // Here you would call API to approve
    alert(`Deposit ${modalDeposit.id} approved!`);
    setModalOpen(false);
  };
  const handleReject = () => {
    alert(`Deposit ${modalDeposit.id} rejected!`);
    setModalOpen(false);
  };
  const handleRetry = () => {
    alert(`Retrying deposit ${modalDeposit.id}...`);
    setModalOpen(false);
  };

  return (
    <div>
      <AdminPageHeader 
        title="Deposits Management" 
        subtitle="Monitor and manage user deposits and transactions" 
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Deposits" 
          value={`$${stats.totalDeposits.toLocaleString()}`} 
          icon="💰"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard 
          title="Today's Deposits" 
          value={`$${stats.todayDeposits.toLocaleString()}`} 
          icon="📈"
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatCard 
          title="Pending Review" 
          value={stats.pendingDeposits.toString()} 
          icon="⏳"
          trend={{ value: -2, isPositive: false }}
        />
        <StatCard 
          title="Avg Amount" 
          value={`$${stats.avgDepositAmount}`} 
          icon="📊"
          trend={{ value: 5.7, isPositive: true }}
        />
      </div>

      {/* Deposits Table */}
      <Card title="Deposit Transactions">
        {/* Status Filter */}
        <div className="p-4 border-b border-[#262b40]">
          <div className="flex space-x-1">
            {['all', 'completed', 'pending', 'processing', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
                }`}
              >
                {status} ({status === 'all' ? deposits.length : deposits.filter(d => d.status.toLowerCase() === status).length})
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
                <th className="text-left p-4">Transaction ID</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeposits.map((deposit) => (
                <tr key={deposit.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                  <td className="p-4 font-medium text-blue-400">{deposit.id}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{deposit.name}</div>
                      <div className="text-xs text-gray-400">{deposit.user}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-green-400 text-lg">
                      ${deposit.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getMethodIcon(deposit.method)}</span>
                      <span>{deposit.method}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                      {deposit.status}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{deposit.date}</td>
                  <td className="p-4 font-mono text-xs text-gray-400">{deposit.transactionId}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700" onClick={() => handleAction('view', deposit)}>
                        View
                      </button>
                      {deposit.status === 'Pending' && (
                        <>
                          <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700" onClick={() => handleAction('approve', deposit)}>
                            Approve
                          </button>
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700" onClick={() => handleAction('reject', deposit)}>
                            Reject
                          </button>
                        </>
                      )}
                      {deposit.status === 'Failed' && (
                        <button className="px-3 py-1 bg-yellow-600 text-white rounded text-xs hover:bg-yellow-700" onClick={() => handleAction('retry', deposit)}>
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

        {filteredDeposits.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">💳</div>
            <div className="text-lg mb-2">No {selectedStatus === 'all' ? '' : selectedStatus} deposits found</div>
            <div className="text-sm">Deposits will appear here as users make transactions</div>
          </div>
        )}

        {/* Pagination */}
        <div className="p-4 border-t border-[#262b40] flex justify-between items-center">
          <div className="text-sm text-gray-400">
            Showing {filteredDeposits.length} of {deposits.length} deposits
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-[#1a1f33] text-gray-400 rounded text-sm">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 bg-[#1a1f33] text-gray-400 rounded text-sm">
              2
            </button>
            <button className="px-3 py-1 bg-[#1a1f33] text-gray-400 rounded text-sm">
              Next
            </button>
          </div>
        </div>
      </Card>
      {/* Action Modal */}
      <AdminActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalType === 'view' ? 'Deposit Details' : modalType === 'approve' ? 'Approve Deposit' : modalType === 'reject' ? 'Reject Deposit' : 'Retry Deposit'}
        actions={(() => {
          if (!modalDeposit) return null;
          if (modalType === 'view') {
            return <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => setModalOpen(false)}>Close</button>;
          }
          if (modalType === 'approve') {
            return <>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg" onClick={handleApprove}>Approve</button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg" onClick={() => setModalOpen(false)}>Cancel</button>
            </>;
          }
          if (modalType === 'reject') {
            return <>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg" onClick={handleReject}>Reject</button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg" onClick={() => setModalOpen(false)}>Cancel</button>
            </>;
          }
          if (modalType === 'retry') {
            return <>
              <button className="px-4 py-2 bg-yellow-600 text-white rounded-lg" onClick={handleRetry}>Retry</button>
              <button className="px-4 py-2 bg-gray-600 text-white rounded-lg" onClick={() => setModalOpen(false)}>Cancel</button>
            </>;
          }
        })()}
      >
        {modalDeposit && (
          <div className="space-y-2 text-left">
            <div><span className="font-bold text-blue-400">ID:</span> {modalDeposit.id}</div>
            <div><span className="font-bold text-blue-400">User:</span> {modalDeposit.name} ({modalDeposit.user})</div>
            <div><span className="font-bold text-blue-400">Amount:</span> ${modalDeposit.amount.toLocaleString()}</div>
            <div><span className="font-bold text-blue-400">Method:</span> {modalDeposit.method}</div>
            <div><span className="font-bold text-blue-400">Status:</span> {modalDeposit.status}</div>
            <div><span className="font-bold text-blue-400">Date:</span> {modalDeposit.date}</div>
            <div><span className="font-bold text-blue-400">Transaction ID:</span> {modalDeposit.transactionId}</div>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
