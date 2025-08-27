"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function AdminUsersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Mock data for users
  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@example.com',
      country: 'United States',
      joinDate: '2024-01-15',
      status: 'active',
      verified: true,
      balance: 2450.75,
      totalDeposits: 5000,
      totalWithdrawals: 2549.25,
      tradesCount: 145,
      lastActivity: '2024-01-20T14:30:00Z'
    },
    {
      id: 2,
      name: 'Maria Garcia',
      email: 'maria.garcia@example.com',
      country: 'Spain',
      joinDate: '2024-01-12',
      status: 'active',
      verified: true,
      balance: 1875.30,
      totalDeposits: 3500,
      totalWithdrawals: 1624.70,
      tradesCount: 89,
      lastActivity: '2024-01-20T12:15:00Z'
    },
    {
      id: 3,
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      country: 'Egypt',
      joinDate: '2024-01-10',
      status: 'suspended',
      verified: false,
      balance: 125.50,
      totalDeposits: 500,
      totalWithdrawals: 374.50,
      tradesCount: 23,
      lastActivity: '2024-01-18T09:45:00Z'
    },
    {
      id: 4,
      name: 'Lisa Chen',
      email: 'lisa.chen@example.com',
      country: 'Singapore',
      joinDate: '2024-01-08',
      status: 'active',
      verified: true,
      balance: 5420.85,
      totalDeposits: 12000,
      totalWithdrawals: 6579.15,
      tradesCount: 267,
      lastActivity: '2024-01-20T16:22:00Z'
    },
    {
      id: 5,
      name: 'Robert Johnson',
      email: 'robert.j@example.com',
      country: 'Canada',
      joinDate: '2024-01-05',
      status: 'inactive',
      verified: true,
      balance: 0,
      totalDeposits: 2500,
      totalWithdrawals: 2500,
      tradesCount: 156,
      lastActivity: '2024-01-15T11:30:00Z'
    },
    {
      id: 6,
      name: 'Sophie Dubois',
      email: 'sophie.dubois@example.com',
      country: 'France',
      joinDate: '2024-01-03',
      status: 'active',
      verified: true,
      balance: 3245.60,
      totalDeposits: 8000,
      totalWithdrawals: 4754.40,
      tradesCount: 198,
      lastActivity: '2024-01-20T13:45:00Z'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.country.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const verifiedUsers = users.filter(u => u.verified).length;
  const totalBalance = users.reduce((sum, u) => sum + u.balance, 0);

  const handleStatusChange = (userId, newStatus) => {
    // Here you would update the user status via API
    console.log(`Changing user ${userId} status to ${newStatus}`);
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on users:`, selectedUsers);
    setSelectedUsers([]);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600/20 text-green-400';
      case 'inactive': return 'bg-gray-600/20 text-gray-400';
      case 'suspended': return 'bg-red-600/20 text-red-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <StatCard 
          title="Total Users" 
          value={totalUsers.toString()} 
          icon="👥"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Active Users" 
          value={activeUsers.toString()} 
          icon="✅"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard 
          title="Verified Users" 
          value={verifiedUsers.toString()} 
          icon="🛡️"
          trend={{ value: 3, isPositive: true }}
        />
        <StatCard 
          title="Total Balance" 
          value={formatCurrency(totalBalance)} 
          icon="💰"
          trend={{ value: 15.5, isPositive: true }}
        />
      </div>

      <Card title="Users Management">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 p-4 border-b border-[#2a3142]">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search users by name, email, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>

          {selectedUsers.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('activate')}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
              >
                Activate Selected
              </button>
              <button
                onClick={() => handleBulkAction('suspend')}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
              >
                Suspend Selected
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a3142]">
                <th className="text-left p-4 text-gray-300 font-medium">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(filteredUsers.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
                <th className="text-left p-4 text-gray-300 font-medium">User</th>
                <th className="text-left p-4 text-gray-300 font-medium">Country</th>
                <th className="text-left p-4 text-gray-300 font-medium">Join Date</th>
                <th className="text-left p-4 text-gray-300 font-medium">Balance</th>
                <th className="text-left p-4 text-gray-300 font-medium">Trades</th>
                <th className="text-left p-4 text-gray-300 font-medium">Verified</th>
                <th className="text-left p-4 text-gray-300 font-medium">Status</th>
                <th className="text-left p-4 text-gray-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-[#1a1f2e] hover:bg-[#151a2e]">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
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
                  <td className="p-4">
                    <span className="text-gray-300">{user.country}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{formatDate(user.joinDate)}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-medium text-white">{formatCurrency(user.balance)}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-gray-300">{user.tradesCount}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.verified 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {user.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="text-blue-400 hover:text-blue-300 text-sm">
                        View
                      </button>
                      <button className="text-green-400 hover:text-green-300 text-sm">
                        Edit
                      </button>
                      <button 
                        onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                        className={`text-sm ${
                          user.status === 'active' 
                            ? 'text-red-400 hover:text-red-300' 
                            : 'text-green-400 hover:text-green-300'
                        }`}
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            No users found matching your criteria.
          </div>
        )}
      </Card>
    </div>
  );
}
