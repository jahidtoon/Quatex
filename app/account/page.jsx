"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe', 
    email: 'john.doe@email.com',
    phone: '+1 (555) 123-4567',
    country: 'United States',
    dateOfBirth: '1990-05-15',
    address: '123 Main Street',
    city: 'New York',
    postalCode: '10001'
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true
  });

  const accountStats = {
    totalDeposits: 5420.50,
    totalWithdrawals: 2150.75,
    currentBalance: 8750.25,
    totalTrades: 1247,
    successRate: 68.5,
    profitLoss: +2450.80
  };

  const recentActivity = [
    { id: 1, type: 'trade', description: 'BTCUSDT UP Trade', amount: '+$42.50', date: '2 hours ago', status: 'completed' },
    { id: 2, type: 'deposit', description: 'Credit Card Deposit', amount: '+$500.00', date: '1 day ago', status: 'completed' },
    { id: 3, type: 'trade', description: 'ETHUSD DOWN Trade', amount: '-$25.00', date: '1 day ago', status: 'completed' },
    { id: 4, type: 'withdrawal', description: 'Bank Transfer Withdrawal', amount: '-$200.00', date: '3 days ago', status: 'pending' },
    { id: 5, type: 'trade', description: 'XRPUSDT UP Trade', amount: '+$33.75', date: '3 days ago', status: 'completed' }
  ];

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'fa-user' },
    { id: 'security', label: 'Security', icon: 'fa-shield-alt' },
    { id: 'activity', label: 'Activity', icon: 'fa-history' },
    { id: 'verification', label: 'Verification', icon: 'fa-check-circle' },
    { id: 'preferences', label: 'Preferences', icon: 'fa-cog' }
  ];

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    console.log('Profile updated:', profileData);
    alert('Profile updated successfully!');
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'trade': return 'fa-chart-line';
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
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
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
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    <i className="fas fa-save mr-2"></i>
                    Update Profile
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
                          <p className="text-sm text-gray-400">{activity.date}</p>
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
  );
}
