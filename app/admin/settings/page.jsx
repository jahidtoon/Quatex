"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    platform: {
      siteName: 'Quatex Trading Platform',
      maintenanceMode: false,
      registrationEnabled: true,
      emailVerificationRequired: true,
      minDepositAmount: 50,
      maxDepositAmount: 10000,
      minWithdrawalAmount: 10,
      maxWithdrawalAmount: 5000
    },
    trading: {
      maxPositionSize: 1000,
      maxOpenPositions: 10,
      stopLossRequired: false,
      takeProfitRequired: false,
      marginCallLevel: 50,
      stopOutLevel: 20
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      marketingEmails: true
    },
    security: {
      twoFactorRequired: false,
      sessionTimeout: 30,
      passwordMinLength: 8,
      maxLoginAttempts: 5,
      ipWhitelist: ''
    }
  });

  const [saved, setSaved] = useState(false);

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Here you would save to API
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div>
      <AdminPageHeader 
        title="System Settings" 
        subtitle="Configure platform settings and preferences." 
        actions={
          <button 
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              saved 
                ? 'bg-green-600 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {saved ? '✓ Saved' : 'Save Changes'}
          </button>
        }
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Settings */}
        <Card title="Platform Settings">
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
              <input
                type="text"
                value={settings.platform.siteName}
                onChange={(e) => handleSettingChange('platform', 'siteName', e.target.value)}
                className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Maintenance Mode</span>
              <input
                type="checkbox"
                checked={settings.platform.maintenanceMode}
                onChange={(e) => handleSettingChange('platform', 'maintenanceMode', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Registration Enabled</span>
              <input
                type="checkbox"
                checked={settings.platform.registrationEnabled}
                onChange={(e) => handleSettingChange('platform', 'registrationEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Email Verification Required</span>
              <input
                type="checkbox"
                checked={settings.platform.emailVerificationRequired}
                onChange={(e) => handleSettingChange('platform', 'emailVerificationRequired', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Min Deposit ($)</label>
                <input
                  type="number"
                  value={settings.platform.minDepositAmount}
                  onChange={(e) => handleSettingChange('platform', 'minDepositAmount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Max Deposit ($)</label>
                <input
                  type="number"
                  value={settings.platform.maxDepositAmount}
                  onChange={(e) => handleSettingChange('platform', 'maxDepositAmount', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Trading Settings */}
        <Card title="Trading Settings">
          <div className="space-y-4 p-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Position Size ($)</label>
              <input
                type="number"
                value={settings.trading.maxPositionSize}
                onChange={(e) => handleSettingChange('trading', 'maxPositionSize', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Open Positions</label>
              <input
                type="number"
                value={settings.trading.maxOpenPositions}
                onChange={(e) => handleSettingChange('trading', 'maxOpenPositions', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Stop Loss Required</span>
              <input
                type="checkbox"
                checked={settings.trading.stopLossRequired}
                onChange={(e) => handleSettingChange('trading', 'stopLossRequired', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Take Profit Required</span>
              <input
                type="checkbox"
                checked={settings.trading.takeProfitRequired}
                onChange={(e) => handleSettingChange('trading', 'takeProfitRequired', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Margin Call Level (%)</label>
                <input
                  type="number"
                  value={settings.trading.marginCallLevel}
                  onChange={(e) => handleSettingChange('trading', 'marginCallLevel', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stop Out Level (%)</label>
                <input
                  type="number"
                  value={settings.trading.stopOutLevel}
                  onChange={(e) => handleSettingChange('trading', 'stopOutLevel', parseInt(e.target.value))}
                  className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card title="Notification Settings">
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Email Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.emailNotifications}
                onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">SMS Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.smsNotifications}
                onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Push Notifications</span>
              <input
                type="checkbox"
                checked={settings.notifications.pushNotifications}
                onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Marketing Emails</span>
              <input
                type="checkbox"
                checked={settings.notifications.marketingEmails}
                onChange={(e) => handleSettingChange('notifications', 'marketingEmails', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card title="Security Settings">
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-300">Two-Factor Authentication Required</span>
              <input
                type="checkbox"
                checked={settings.security.twoFactorRequired}
                onChange={(e) => handleSettingChange('security', 'twoFactorRequired', e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Password Length</label>
              <input
                type="number"
                value={settings.security.passwordMinLength}
                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Login Attempts</label>
              <input
                type="number"
                value={settings.security.maxLoginAttempts}
                onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-[#0f1320] border border-[#2a3142] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
