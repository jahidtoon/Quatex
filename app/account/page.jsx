"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth, useApi } from '@/lib/hooks';
import MainAppLayout from '../components/MainAppLayout';

export default function AccountPage() {
  const { user, token, isAuthenticated, updateUser } = useAuth();
  const { apiCall } = useApi();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    dateOfBirth: '',
    address: '',
    city: '',
    postalCode: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true
  });

  const [accountStats, setAccountStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    currentBalance: 0,
    totalTrades: 0,
    successRate: 0,
    profitLoss: 0
  });

  const [recentActivity, setRecentActivity] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      window.location.href = '/auth/login';
      return;
    }
  }, [isAuthenticated, loading]);

  // Load user profile data
  useEffect(() => {
    if (isAuthenticated && token) {
      loadProfileData();
      loadStatsData();
    }
  }, [isAuthenticated, token]);

  const loadProfileData = async () => {
    try {
      const response = await apiCall('/api/users/profile');
      if (response.success) {
        const userData = response.user;
        setProfileData({
          firstName: userData.first_name || '',
          lastName: userData.last_name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          country: userData.country || '',
          dateOfBirth: userData.date_of_birth || '',
          address: userData.address || '',
          city: userData.city || '',
          postalCode: userData.postal_code || ''
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatsData = async () => {
    try {
      const response = await apiCall('/api/users/stats');
      if (response.success) {
        setAccountStats(response.stats);
        setRecentActivity(response.recentActivity);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
        country: profileData.country,
        date_of_birth: profileData.dateOfBirth,
        address: profileData.address,
        city: profileData.city,
        postal_code: profileData.postalCode
      };

      const response = await apiCall('/api/users/profile', {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });

      if (response.success) {
        // Update the user context
        updateUser({
          ...user,
          firstName: response.user.first_name,
          lastName: response.user.last_name
        });
        alert('Profile updated successfully!');
      }
    } catch (error) {
      alert('Failed to update profile: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return `${diffDays} days ago`;
    } catch {
      return 'N/A';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading your account...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'fa-user' },
    { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
    { id: 'activity', label: 'Activity', icon: 'fa-history' },
    { id: 'billing', label: 'Billing', icon: 'fa-credit-card' },
    { id: 'verification', label: 'Verification', icon: 'fa-check-circle' },
    { id: 'preferences', label: 'Preferences', icon: 'fa-cog' }
  ];

  const getActivityIcon = (type) => {
    switch(type) {
      case 'trade': return 'fa-exchange-alt';
      case 'deposit': return 'fa-arrow-down';
      case 'withdrawal': return 'fa-arrow-up';
      default: return 'fa-circle';
    }
  };

  const getActivityColor = (type) => {
    switch(type) {
      case 'trade': return 'text-blue-400';
      case 'deposit': return 'text-green-400';
      case 'withdrawal': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <MainAppLayout>
      <div className="bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl md:text-3xl font-bold flex items-center">
              <i className="fas fa-user-circle text-green-400 mr-3"></i>
              My Account
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Account Balance</div>
              <div className="text-xl font-bold text-green-400">${accountStats.currentBalance.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-6">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <i className={`fas ${tab.icon}`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Account Stats */}
          <div className="mt-8 bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Quick Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Trades:</span>
                <span>{accountStats.totalTrades}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate:</span>
                <span className="text-green-400">{accountStats.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">P&L:</span>
                <span className="text-green-400">+${accountStats.profitLoss}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <BillingTab />
          )}
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-2xl font-semibold">Profile Information</h2>
                <p className="text-gray-400">Update your personal information and preferences</p>
              </div>
              <div className="p-6">
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Country</label>
                      <select
                        value={profileData.country}
                        onChange={(e) => setProfileData({...profileData, country: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Bangladesh">Bangladesh</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Date of Birth</label>
                      <input
                        type="date"
                        value={profileData.dateOfBirth}
                        onChange={(e) => setProfileData({...profileData, dateOfBirth: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Address</label>
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">City</label>
                      <input
                        type="text"
                        value={profileData.city}
                        onChange={(e) => setProfileData({...profileData, city: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={profileData.postalCode}
                        onChange={(e) => setProfileData({...profileData, postalCode: e.target.value})}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center"
                  >
                    {updating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save mr-2"></i>
                        Update Profile
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-2xl font-semibold">Security Settings</h2>
                  <p className="text-gray-400">Manage your account security and privacy</p>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.twoFactorEnabled}
                        onChange={(e) => setSecuritySettings({...securitySettings, twoFactorEnabled: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Email Notifications</h3>
                      <p className="text-sm text-gray-400">Receive account alerts via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.emailNotifications}
                        onChange={(e) => setSecuritySettings({...securitySettings, emailNotifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">SMS Notifications</h3>
                      <p className="text-sm text-gray-400">Receive alerts via SMS</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.smsNotifications}
                        onChange={(e) => setSecuritySettings({...securitySettings, smsNotifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Login Alerts</h3>
                      <p className="text-sm text-gray-400">Get notified of new login attempts</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.loginAlerts}
                        onChange={(e) => setSecuritySettings({...securitySettings, loginAlerts: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                  <form className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Current Password</label>
                      <input
                        type="password"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">New Password</label>
                      <input
                        type="password"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                      <input
                        type="password"
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="p-6 border-b border-gray-700">
                <h2 className="text-2xl font-semibold">Recent Activity</h2>
                <p className="text-gray-400">Your latest account activities and transactions</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityColor(activity.type)} bg-gray-600`}>
                          <i className={`fas ${getActivityIcon(activity.type)}`}></i>
                        </div>
                        <div>
                          <h3 className="font-semibold">{activity.description}</h3>
                          <p className="text-sm text-gray-400">{formatTimeAgo(activity.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${activity.amount.startsWith('+') ? 'text-green-400' : activity.amount.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
                          {activity.amount}
                        </div>
                        <div className={`text-sm capitalize ${activity.status === 'completed' ? 'text-green-400' : activity.status === 'pending' ? 'text-yellow-400' : 'text-gray-400'}`}>
                          {activity.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Other tabs placeholders */}
          {(activeTab === 'verification' || activeTab === 'preferences') && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-12">
              <div className="text-center">
                <i className={`fas ${tabs.find(t => t.id === activeTab)?.icon} text-6xl text-gray-600 mb-4`}></i>
                <h2 className="text-2xl font-semibold mb-2">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <p className="text-gray-400 mb-6">This section is under development.</p>
                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg">
                  <i className="fas fa-bell mr-2"></i>Notify me when ready
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </MainAppLayout>
  );
}

function BillingTab() {
  const { token, isAuthenticated } = useAuth();
  const { apiCall } = useApi();
  const [loading, setLoading] = useState(true);
  const [methods, setMethods] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [fieldValues, setFieldValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  const loadAll = async () => {
    try {
      setLoading(true);
      if (!token) return; // wait for auth token
      const [pmRes, tplRes] = await Promise.all([
        fetch('/api/p2p/payment-methods', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/payment-method-templates', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const pm = await pmRes.json();
      const tp = await tplRes.json();
      setMethods(pm.methods || []);
      setTemplates(tp.templates || []);
      setInfoMessage(tp.message || '');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAuthenticated && token) { loadAll(); } }, [isAuthenticated, token]);

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!currentTemplate) return;
    setSaving(true);
    try {
      const payload = {
        type: currentTemplate.type,
        label: currentTemplate.title,
        details: fieldValues,
      };
      const res = await fetch('/api/p2p/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e.error || 'Failed to save');
        return;
      }
      setSelectedTemplate('');
      setFieldValues({});
      await loadAll();
    } catch (e) {
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this billing method?')) return;
    try {
      const res = await fetch(`/api/p2p/payment-methods/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return alert('Failed');
      await loadAll();
    } catch (e) { alert('Failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Billing Methods</h2>
          <p className="text-gray-400">Save payment information for P2P and Withdrawals.</p>
        </div>
        <div className="p-6 space-y-6">
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-3">Saved Methods</h3>
                <div className="space-y-3">
                  {methods.map((m) => (
                    <div key={m.id} className="p-4 bg-gray-700 rounded-lg flex items-start justify-between gap-4">
                      <div>
                        <div className="font-semibold">{m.label || m.type}</div>
                        <div className="text-xs text-gray-300 whitespace-pre-wrap break-words">{JSON.stringify(m.details || {}, null, 2)}</div>
                      </div>
                      <button onClick={() => handleDelete(m.id)} className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded">Remove</button>
                    </div>
                  ))}
                  {!methods.length && <div className="text-gray-400">No methods yet.</div>}
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-3">Add New</h3>
                {infoMessage && (
                  <div className="mb-3 text-sm text-yellow-300 bg-yellow-800/30 border border-yellow-700 rounded p-3">
                    {infoMessage} Go to the <button type="button" className="underline" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Profile</button> tab and set your Country.
                  </div>
                )}
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Template</label>
                    <select value={selectedTemplate} onChange={e=>{ setSelectedTemplate(e.target.value); setFieldValues({}); }} className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg">
                      <option value="">Select a template</option>
                      {templates.map(t => (
                        <option key={t.id} value={t.id}>{t.title} [{t.type}] • {t.country} / {t.currency}</option>
                      ))}
                    </select>
                  </div>
                  {currentTemplate && (
                    <div className="space-y-3">
                      {(currentTemplate.fields || []).map((f) => (
                        <div key={f.key}>
                          <label className="block text-sm font-medium mb-2">{f.label || f.key}{f.required ? ' *' : ''}</label>
                          <input
                            type="text"
                            required={!!f.required}
                            value={fieldValues[f.key] || ''}
                            onChange={(e)=>setFieldValues(prev=>({ ...prev, [f.key]: e.target.value }))}
                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg"
                            placeholder={f.placeholder || ''}
                          />
                        </div>
                      ))}
                      <button disabled={saving} type="submit" className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg">
                        {saving ? 'Saving...' : 'Save Billing Method'}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

