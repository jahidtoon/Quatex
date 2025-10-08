"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminActionModal from '../components/AdminActionModal';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

const formatNumber = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) return '0';
  return Number(value).toLocaleString();
};

const formatCurrency = (value) => `$${formatNumber(value || 0)}`;

const getStatusColor = (status) => {
  const normalized = (status || '').toLowerCase();
  if (normalized.includes('complete')) return 'bg-green-600/20 text-green-400';
  if (normalized.includes('pending')) return 'bg-yellow-600/20 text-yellow-400';
  if (normalized.includes('process')) return 'bg-blue-600/20 text-blue-400';
  if (normalized.includes('fail') || normalized.includes('reject')) return 'bg-red-600/20 text-red-400';
  return 'bg-gray-600/20 text-gray-400';
};

const getMethodIcon = (method = '') => {
  switch (method.toLowerCase()) {
    case 'credit card':
      return '💳';
    case 'bank transfer':
      return '🏦';
    case 'paypal':
      return '💙';
    case 'crypto':
      return '₿';
    default:
      return '💰';
  }
};

const formatTimestamp = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString();
};

export default function DepositsPage() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeposit, setModalDeposit] = useState(null);
  const [data, setData] = useState({ items: [], summary: {}, total: 0, page: 1, pageSize: 20 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchDeposits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());
      if (selectedStatus !== 'all') params.set('status', selectedStatus);
      if (debouncedSearch) params.set('q', debouncedSearch);
      const response = await fetch(`/api/admin/deposits?${params.toString()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load deposits (${response.status})`);
      const payload = await response.json();
      setData(payload);
    } catch (err) {
      setError(err.message || 'Unable to load deposits');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, selectedStatus, debouncedSearch]);

  useEffect(() => {
    fetchDeposits();
  }, [fetchDeposits]);

  const summary = data.summary || {};
  const deposits = data.items || [];
  const totalPages = Math.max(1, Math.ceil((data.total || 0) / pageSize));

  const handleView = (deposit) => {
    setModalDeposit(deposit);
    setModalOpen(true);
  };

  const handleRetryFetch = () => {
    fetchDeposits();
  };

  return (
    <div>
      <AdminPageHeader
        title="Deposits Management"
        subtitle="Monitor and manage user deposits and transactions"
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="text-sm text-red-200 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={handleRetryFetch}
              className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Deposits" value={formatCurrency(summary.totalAmount)} hint={`${formatNumber(data.total)} total records`} />
        <StatCard label="Pending Review" value={formatNumber(summary.pending)} hint="Awaiting approval" />
        <StatCard label="Completed" value={formatNumber(summary.completed)} hint="Successful deposits" />
        <StatCard label="Page Size" value={formatNumber(pageSize)} hint="Items per page" />
      </div>

      <Card title="Deposit Transactions">
        <div className="p-4 border-b border-[#262b40] space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {['all', 'completed', 'pending', 'processing', 'failed'].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <input
            type="text"
            placeholder="Search by user or ID..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            className="w-full md:w-64 px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="text-gray-400 mt-2">Loading deposits...</p>
          </div>
        ) : deposits.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">💳</div>
            <div className="text-lg mb-2">No deposits found</div>
            <div className="text-sm">Try adjusting the filters or search query.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-4">ID</th>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Amount</th>
                  <th className="text-left p-4">Method</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((deposit) => (
                  <tr key={deposit.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-4 font-medium text-blue-400">{deposit.id}</td>
                    <td className="p-4">
                      <div className="font-medium">{deposit.user}</div>
                    </td>
                    <td className="p-4 font-semibold text-green-400">{formatCurrency(deposit.amount)}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMethodIcon(deposit.method)}</span>
                        <span>{deposit.method || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(deposit.status)}`}>
                        {(deposit.status || 'unknown').toString()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">{formatTimestamp(deposit.createdAt)}</td>
                    <td className="p-4">
                      <button
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                        onClick={() => handleView(deposit)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-[#262b40] flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-gray-400">
          <div>
            Showing page {page} of {totalPages} ({formatNumber(data.total)} deposits total)
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className={`px-3 py-1 rounded ${page <= 1 ? 'bg-[#1a1f33] text-gray-600 cursor-not-allowed' : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'}`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className={`px-3 py-1 rounded ${page >= totalPages ? 'bg-[#1a1f33] text-gray-600 cursor-not-allowed' : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'}`}
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      <AdminActionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Deposit Details"
        actions={
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => setModalOpen(false)}>
            Close
          </button>
        }
      >
        {modalDeposit && (
          <div className="space-y-2 text-left text-sm">
            <div><span className="font-bold text-blue-400">ID:</span> {modalDeposit.id}</div>
            <div><span className="font-bold text-blue-400">User:</span> {modalDeposit.user}</div>
            <div><span className="font-bold text-blue-400">Amount:</span> {formatCurrency(modalDeposit.amount)}</div>
            <div><span className="font-bold text-blue-400">Method:</span> {modalDeposit.method || 'N/A'}</div>
            <div><span className="font-bold text-blue-400">Status:</span> {modalDeposit.status || 'Unknown'}</div>
            <div><span className="font-bold text-blue-400">Created:</span> {formatTimestamp(modalDeposit.createdAt)}</div>
          </div>
        )}
      </AdminActionModal>
    </div>
  );
}
