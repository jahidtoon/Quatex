'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCog, faUser, faLock, faBell, faEye, faEyeSlash,
  faSave, faEdit, faTrash, faShield, faKey, faEnvelope,
  faPhone, faGlobe, faCamera, faToggleOn, faToggleOff
} from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';
import '../dashboard/styles.css';

export default function AffiliateSettings() {
  const [settingsData, setSettingsData] = useState(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('affiliateToken');
    if (!token) {
      router.push('/affiliate/auth');
      return;
    }
    loadSettingsData();
  }, [router]);

  const loadSettingsData = async () => {
    try {
      setIsLoading(true);
      // Mock data for settings
      const mockData = {
        success: true,
        profile: {
          id: 'AFF001',
          name: 'Demo Affiliate',
          email: 'demo@affiliate.com',
          phone: '+1234567890',
          country: 'United States',
          profileImage: 'https://ui-avatars.com/api/?name=Demo+Affiliate&background=4F46E5&color=fff',
          joinDate: '2024-01-15',
          status: 'Active',
          tier: 'Gold',
          referralCode: 'AFF001'
        },
        notifications: {
          emailNotifications: true,
          smsNotifications: false,
          newReferralAlerts: true,
          commissionAlerts: true,
          withdrawalAlerts: true,
          marketingUpdates: false,
          weeklyReports: true,
          monthlyReports: true
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: '2024-07-15',
          loginSessions: [
            { id: 1, device: 'Chrome on Windows', location: 'New York, US', lastActive: '2024-09-08 14:30', current: true },
            { id: 2, device: 'Mobile Safari', location: 'New York, US', lastActive: '2024-09-07 09:15', current: false }
          ]
        },
        paymentSettings: {
          preferredMethod: 'bank_transfer',
          minimumPayout: 100,
          autoWithdrawal: false,
          autoWithdrawalThreshold: 500,
          bankDetails: {
            bankName: 'Chase Bank',
            accountNumber: '****1234',
            accountHolder: 'Demo Affiliate'
          },
          paypalEmail: 'demo@affiliate.com',
          bitcoinAddress: ''
        }
      };
      setSettingsData(mockData);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }
    alert('Password updated successfully!');
    setShowPasswordForm(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const toggleNotification = (key) => {
    setSettingsData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key]
      }
    }));
  };

  const toggleShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  if (isLoading) {
    return (
      <div className="affiliate-dashboard-bg min-h-screen">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
            <p className="mt-4 text-white/80">Loading Settings...</p>
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-4">
            Account Settings ⚙️
          </h1>
          <p className="text-white/80 text-lg backdrop-blur-sm bg-white/10 rounded-lg p-4 inline-block border border-white/20">
            Manage your affiliate account preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="affiliate-card p-4">
              <nav className="space-y-2">
                {[
                  { id: 'profile', label: 'Profile Information', icon: faUser },
                  { id: 'security', label: 'Security', icon: faShield },
                  { id: 'notifications', label: 'Notifications', icon: faBell },
                  { id: 'payment', label: 'Payment Settings', icon: faCog }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FontAwesomeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {/* Profile Information */}
            {activeSection === 'profile' && (
              <div className="affiliate-card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h3>
                
                {/* Profile Picture */}
                <div className="flex items-center space-x-6 mb-8">
                  <img
                    src={settingsData?.profile?.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full"
                  />
                  <div>
                    <button className="btn-gradient-primary px-4 py-2 rounded-lg text-sm">
                      <FontAwesomeIcon icon={faCamera} className="mr-2" />
                      Change Photo
                    </button>
                    <p className="text-sm text-gray-500 mt-2">JPG, PNG or GIF. Max size 2MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      defaultValue={settingsData?.profile?.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      defaultValue={settingsData?.profile?.email}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      defaultValue={settingsData?.profile?.phone}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>

                {/* Account Info */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Affiliate ID</label>
                    <p className="text-lg font-semibold text-blue-600">{settingsData?.profile?.id}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Current Tier</label>
                    <p className="text-lg font-semibold text-green-600">{settingsData?.profile?.tier}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm font-medium text-gray-700">Member Since</label>
                    <p className="text-lg font-semibold text-gray-900">{settingsData?.profile?.joinDate}</p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="btn-gradient-success px-6 py-2 rounded-lg">
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                {/* Password Section */}
                <div className="affiliate-card p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Password & Security</h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900">Password</h4>
                      <p className="text-sm text-gray-500">Last changed: {settingsData?.security?.lastPasswordChange}</p>
                    </div>
                    <button
                      onClick={() => setShowPasswordForm(!showPasswordForm)}
                      className="btn-gradient-primary px-4 py-2 rounded-lg text-sm"
                    >
                      <FontAwesomeIcon icon={faKey} className="mr-2" />
                      Change Password
                    </button>
                  </div>

                  {showPasswordForm && (
                    <div className="border-t pt-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                        <div className="relative">
                          <input
                            type={showPassword.current ? 'text' : 'password'}
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowPassword('current')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <FontAwesomeIcon icon={showPassword.current ? faEyeSlash : faEye} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword.new ? 'text' : 'password'}
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowPassword('new')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <FontAwesomeIcon icon={showPassword.new ? faEyeSlash : faEye} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <div className="relative">
                          <input
                            type={showPassword.confirm ? 'text' : 'password'}
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => toggleShowPassword('confirm')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          >
                            <FontAwesomeIcon icon={showPassword.confirm ? faEyeSlash : faEye} className="text-gray-400" />
                          </button>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={handlePasswordChange}
                          className="btn-gradient-success px-4 py-2 rounded-lg text-sm"
                        >
                          Update Password
                        </button>
                        <button
                          onClick={() => setShowPasswordForm(false)}
                          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Login Sessions */}
                <div className="affiliate-card p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Active Sessions</h3>
                  <div className="space-y-4">
                    {settingsData?.security?.loginSessions?.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <h4 className="font-medium text-gray-900">{session.device}</h4>
                          <p className="text-sm text-gray-500">{session.location}</p>
                          <p className="text-sm text-gray-500">Last active: {session.lastActive}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {session.current && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Current</span>
                          )}
                          {!session.current && (
                            <button className="text-red-600 hover:text-red-800 text-sm">
                              <FontAwesomeIcon icon={faTrash} className="mr-1" />
                              End Session
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Notifications */}
            {activeSection === 'notifications' && (
              <div className="affiliate-card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">Email Notifications</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'emailNotifications', label: 'Enable Email Notifications', description: 'Receive notifications via email' },
                        { key: 'newReferralAlerts', label: 'New Referral Alerts', description: 'Get notified when someone signs up using your link' },
                        { key: 'commissionAlerts', label: 'Commission Alerts', description: 'Get notified when you earn commissions' },
                        { key: 'withdrawalAlerts', label: 'Withdrawal Alerts', description: 'Get notified about withdrawal status updates' },
                        { key: 'marketingUpdates', label: 'Marketing Updates', description: 'Receive updates about new marketing materials' },
                        { key: 'weeklyReports', label: 'Weekly Reports', description: 'Receive weekly performance summaries' },
                        { key: 'monthlyReports', label: 'Monthly Reports', description: 'Receive monthly performance reports' }
                      ].map((notification) => (
                        <div key={notification.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                          <div>
                            <h5 className="font-medium text-gray-900">{notification.label}</h5>
                            <p className="text-sm text-gray-500">{notification.description}</p>
                          </div>
                          <button
                            onClick={() => toggleNotification(notification.key)}
                            className={`text-2xl ${settingsData?.notifications?.[notification.key] ? 'text-green-500' : 'text-gray-300'}`}
                          >
                            <FontAwesomeIcon icon={settingsData?.notifications?.[notification.key] ? faToggleOn : faToggleOff} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-4">SMS Notifications</h4>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-gray-900">SMS Alerts</h5>
                        <p className="text-sm text-gray-500">Receive important alerts via SMS</p>
                      </div>
                      <button
                        onClick={() => toggleNotification('smsNotifications')}
                        className={`text-2xl ${settingsData?.notifications?.smsNotifications ? 'text-green-500' : 'text-gray-300'}`}
                      >
                        <FontAwesomeIcon icon={settingsData?.notifications?.smsNotifications ? faToggleOn : faToggleOff} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="btn-gradient-success px-6 py-2 rounded-lg">
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* Payment Settings */}
            {activeSection === 'payment' && (
              <div className="affiliate-card p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Payment Settings</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Payment Method</label>
                      <select 
                        defaultValue={settingsData?.paymentSettings?.preferredMethod}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="paypal">PayPal</option>
                        <option value="bitcoin">Bitcoin</option>
                        <option value="skrill">Skrill</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Payout Amount</label>
                      <select 
                        defaultValue={settingsData?.paymentSettings?.minimumPayout}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="50">$50</option>
                        <option value="100">$100</option>
                        <option value="250">$250</option>
                        <option value="500">$500</option>
                      </select>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Auto Withdrawal</h4>
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg mb-4">
                      <div>
                        <h5 className="font-medium text-gray-900">Enable Auto Withdrawal</h5>
                        <p className="text-sm text-gray-500">Automatically withdraw when balance reaches threshold</p>
                      </div>
                      <button className={`text-2xl ${settingsData?.paymentSettings?.autoWithdrawal ? 'text-green-500' : 'text-gray-300'}`}>
                        <FontAwesomeIcon icon={settingsData?.paymentSettings?.autoWithdrawal ? faToggleOn : faToggleOff} />
                      </button>
                    </div>
                    
                    {settingsData?.paymentSettings?.autoWithdrawal && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Auto Withdrawal Threshold</label>
                        <input
                          type="number"
                          defaultValue={settingsData?.paymentSettings?.autoWithdrawalThreshold}
                          className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-6">
                    <h4 className="font-medium text-gray-900 mb-4">Payment Details</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Bank:</span>
                          <p className="text-gray-900">{settingsData?.paymentSettings?.bankDetails?.bankName}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Account:</span>
                          <p className="text-gray-900">{settingsData?.paymentSettings?.bankDetails?.accountNumber}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Holder:</span>
                          <p className="text-gray-900">{settingsData?.paymentSettings?.bankDetails?.accountHolder}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">PayPal:</span>
                          <p className="text-gray-900">{settingsData?.paymentSettings?.paypalEmail}</p>
                        </div>
                      </div>
                      <button className="mt-4 btn-gradient-primary px-4 py-2 rounded-lg text-sm">
                        <FontAwesomeIcon icon={faEdit} className="mr-2" />
                        Update Payment Details
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button className="btn-gradient-success px-6 py-2 rounded-lg">
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
