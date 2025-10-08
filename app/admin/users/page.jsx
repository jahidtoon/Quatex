"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
};

const formatCurrency = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return '$0.00';
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const getStatusColor = (status) => {
  const normalized = (status || '').toLowerCase();
  switch (normalized) {
    case 'active':
      return 'bg-green-600/20 text-green-400';
    case 'inactive':
      return 'bg-gray-600/20 text-gray-400';
    case 'suspended':
      return 'bg-red-600/20 text-red-400';
    case 'admin':
      return 'bg-purple-600/20 text-purple-400';
    default:
      return 'bg-gray-600/20 text-gray-400';
  }
};

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('pageSize', pageSize.toString());
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (debouncedSearch) params.set('q', debouncedSearch);
  const response = await fetch(`/api/admin/users?${params.toString()}`, { cache: 'no-store', credentials: 'include' });
      if (!response.ok) throw new Error(`Failed to load users (${response.status})`);
      const payload = await response.json();
      setUsers(payload.items || []);
      setSummary(payload.summary || {});
      setTotal(payload.total || 0);
    } catch (err) {
      setError(err.message || 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setSelectedUsers((prev) => prev.filter((id) => users.some((user) => user.id === id)));
  }, [users]);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [savingEdit, setSavingEdit] = useState(false);

  const handleViewImpersonate = async (user) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/impersonate`, { method: 'POST', credentials: 'include' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      // Store as if logged in as user and redirect to dashboard
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (e) {
      alert(e.message);
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      first_name: user.name?.split(' ')[0] || '',
      last_name: user.name?.split(' ').slice(1).join(' ') || '',
      balance: user.balance,
      demo_balance: user.demoBalance ?? user.demo_balance,
      is_verified: user.verified,
      is_suspended: user.status === 'suspended'
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setEditingUser(null);
      await fetchUsers();
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Status change failed');
      await fetchUsers();
    } catch (e) {
      alert(e.message);
    }
  };

  const handleBulkAction = (action) => {
    const selectedUserCount = selectedUsers.length;
    if (!selectedUserCount) return;
    const actionMessages = {
      verify: `✅ ${selectedUserCount} user(s) verified successfully!`,
      suspend: `🚫 ${selectedUserCount} user(s) suspended successfully!`,
      activate: `🔓 ${selectedUserCount} user(s) activated successfully!`,
      export: `📊 Exporting data for ${selectedUserCount} user(s)...`
    };

    alert(actionMessages[action]);
    console.log(`Performing ${action} on users:`, selectedUsers);
    setSelectedUsers([]);
  };

  const handleRetryFetch = () => {
    fetchUsers();
  };

  const filteredUsers = users;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const stats = useMemo(() => {
    const totalUsers = summary?.totalUsers ?? total ?? users.length;
    const verifiedUsers = summary?.verified ?? 0;
    const activeUsers = summary?.verified ?? verifiedUsers;
    const unverified = summary?.unverified ?? Math.max(0, totalUsers - verifiedUsers);
    const aggregateBalance = summary?.totalBalance ?? users.reduce((sum, user) => sum + (Number(user.balance) || 0), 0);

    return {
      totalUsers,
      verifiedUsers,
      activeUsers,
      unverified,
      totalBalance: aggregateBalance
    };
  }, [summary, total, users]);

  const allSelected = filteredUsers.length > 0 && selectedUsers.length === filteredUsers.length;
  const startIndex = filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = filteredUsers.length === 0 ? 0 : (page - 1) * pageSize + filteredUsers.length;

  return (
    <div>
      <AdminPageHeader
        title="User Management"
        subtitle="Manage user accounts, verification, and account status."
        actions={
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
              Export Users
            </button>
            <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium">
              Send Notification
            </button>
          </div>
        }
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Users" value={stats.totalUsers.toLocaleString()} hint="All registered accounts" />
        <StatCard label="Active Users" value={stats.activeUsers.toLocaleString()} hint={`${stats.unverified.toLocaleString()} pending verification`} />
        <StatCard label="Verified Users" value={stats.verifiedUsers.toLocaleString()} hint="KYC-approved accounts" />
        <StatCard label="Total Balance" value={formatCurrency(stats.totalBalance)} hint="Aggregate account balance" />
      </div>

      {selectedUsers.length > 0 && (
        <div className="mb-4 p-4 bg-[#1a1f33] border border-[#262b40] rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-white font-medium">
                {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedUsers([])}
                className="text-gray-400 hover:text-white"
              >
                Clear selection
              </button>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('verify')}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                ✅ Verify
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                🚫 Suspend
              </button>
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                🔓 Activate
              </button>
              <button
                onClick={() => handleBulkAction('export')}
                className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
              >
                📊 Export
              </button>
            </div>
          </div>
        </div>
      )}

      <Card title="Users Management">
        <div className="p-4 border-b border-[#2a3142] flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <input
            type="text"
            placeholder="Search users by name, email, or country..."
            value={searchTerm}
            onChange={(event) => {
              setSearchTerm(event.target.value);
              setPage(1);
            }}
            className="w-full md:w-72 px-4 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
                setSelectedUsers([]);
              }}
              className="px-4 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="admin">Admin</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto" />
            <p className="text-gray-400 mt-2">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <div className="text-4xl mb-2">👥</div>
            <div className="text-lg mb-2">No users found</div>
            <div className="text-sm">Try adjusting the filters or search query.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-4">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={() => {
                        if (allSelected) {
                          setSelectedUsers([]);
                        } else {
                          setSelectedUsers(filteredUsers.map((user) => user.id));
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Country</th>
                  <th className="text-left p-4">Join Date</th>
                  <th className="text-left p-4">Balance</th>
                  <th className="text-left p-4">Trades</th>
                  <th className="text-left p-4">Verified</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[#1a1f2e] hover:bg-[#151a2e]">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(event) => {
                          if (event.target.checked) {
                            setSelectedUsers((prev) => [...prev, user.id]);
                          } else {
                            setSelectedUsers((prev) => prev.filter((id) => id !== user.id));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-sm text-gray-400">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{user.country || '—'}</td>
                    <td className="p-4 text-gray-300">{formatDate(user.joinDate)}</td>
                    <td className="p-4 font-semibold text-white">{formatCurrency(user.balance)}</td>
                    <td className="p-4 text-gray-300">{user.tradesCount ?? 0}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.verified ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
                        }`}
                      >
                        {user.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3 items-center">
                        <button onClick={() => handleViewImpersonate(user)} className="text-blue-400 hover:text-blue-300 text-sm">View</button>
                        <button onClick={() => openEdit(user)} className="text-green-400 hover:text-green-300 text-sm">Edit</button>
                        <div className="relative group">
                          <button className="text-sm text-gray-300 group-hover:text-white">Status ▾</button>
                          <div className="absolute hidden group-hover:block bg-[#101527] border border-[#2a3142] rounded-md mt-2 min-w-[140px] z-10">
                            <button onClick={() => handleStatusChange(user.id, 'active')} className="block w-full text-left px-3 py-2 hover:bg-[#1a1f33] text-green-400">Active</button>
                            <button onClick={() => handleStatusChange(user.id, 'pending')} className="block w-full text-left px-3 py-2 hover:bg-[#1a1f33] text-yellow-400">Pending</button>
                            <button onClick={() => handleStatusChange(user.id, 'suspend')} className="block w-full text-left px-3 py-2 hover:bg-[#1a1f33] text-red-400">Suspend</button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-[#2a3142] flex flex-col gap-4 md:flex-row md:items-center md:justify-between text-sm text-gray-400">
          <div>
            {total === 0
              ? 'No users to display'
              : `Showing ${startIndex}-${endIndex} of ${total.toLocaleString()} user${total === 1 ? '' : 's'}`}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1 || loading}
              className={`px-3 py-1 rounded ${
                page <= 1 || loading
                  ? 'bg-[#1a1f33] text-gray-600 cursor-not-allowed'
                  : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
              }`}
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages || loading}
              className={`px-3 py-1 rounded ${
                page >= totalPages || loading
                  ? 'bg-[#1a1f33] text-gray-600 cursor-not-allowed'
                  : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </Card>

      {/* Edit Modal */}
      <EditUserModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        form={editForm}
        setForm={setEditForm}
        onSave={handleSaveEdit}
        saving={savingEdit}
      />
    </div>
  );
}

// Edit Modal
// Keeping simple inline to avoid extra files
export function EditUserModal({ open, onClose, form, setForm, onSave, saving }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0f1320] border border-[#2a3142] rounded-lg w-full max-w-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-semibold">Edit User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">First Name</label>
            <input value={form.first_name || ''} onChange={(e)=>setForm({...form, first_name:e.target.value})} className="w-full px-3 py-2 bg-[#101527] border border-[#2a3142] rounded"/>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Last Name</label>
            <input value={form.last_name || ''} onChange={(e)=>setForm({...form, last_name:e.target.value})} className="w-full px-3 py-2 bg-[#101527] border border-[#2a3142] rounded"/>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input value={form.email || ''} onChange={(e)=>setForm({...form, email:e.target.value})} className="w-full px-3 py-2 bg-[#101527] border border-[#2a3142] rounded"/>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Password (set new)</label>
            <input type="password" value={form.password || ''} onChange={(e)=>setForm({...form, password:e.target.value})} className="w-full px-3 py-2 bg-[#101527] border border-[#2a3142] rounded"/>
          </div>
          <div></div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Balance</label>
            <input type="number" step="0.01" value={form.balance ?? ''} onChange={(e)=>setForm({...form, balance: Number(e.target.value)})} className="w-full px-3 py-2 bg-[#101527] border border-[#2a3142] rounded"/>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Demo Balance</label>
            <input type="number" step="0.01" value={form.demo_balance ?? ''} onChange={(e)=>setForm({...form, demo_balance: Number(e.target.value)})} className="w-full px-3 py-2 bg-[#101527] border border-[#2a3142] rounded"/>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input id="verified" type="checkbox" checked={!!form.is_verified} onChange={(e)=>setForm({...form, is_verified:e.target.checked})} />
            <label htmlFor="verified" className="text-sm text-gray-300">Verified (Active)</label>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <input id="suspended" type="checkbox" checked={!!form.is_suspended} onChange={(e)=>setForm({...form, is_suspended:e.target.checked})} />
            <label htmlFor="suspended" className="text-sm text-gray-300">Suspended</label>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-[#1a1f33] text-gray-300 rounded">Cancel</button>
          <button onClick={onSave} disabled={saving} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded disabled:opacity-60">{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </div>
    </div>
  );
}
