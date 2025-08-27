"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    theme: 'dark',
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    notifications: {
      email: true,
      push: false,
      sms: true,
      trading: true,
      security: true,
      marketing: false
    },
    trading: {
      autoClose: false,
      soundEffects: true,
      chartType: 'candlestick',
      defaultTimeframe: '1m',
      riskLevel: 'medium'
    },
    security: {
      twoFactor: true,
      loginAlerts: true,
      sessionTimeout: 30,
      ipWhitelist: false
    }
  });

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
    console.log('Settings saved:', settings);
    alert('Settings saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-gray-800 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-blue-400 hover:text-blue-300">
              <i className="fas fa-arrow-left"></i> Back to Home
            </Link>
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-cog text-gray-400 mr-3"></i>
              Settings
            </h1>
          </div>
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg"
          >
            <i className="fas fa-save mr-2"></i>Save Changes
          </button>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-8">
          {/* General Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">General Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => setSettings({...settings, theme: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({...settings, language: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="bn">বাংলা</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="BDT">BDT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => setSettings({...settings, timezone: e.target.value})}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="UTC">UTC</option>
                    <option value="EST">EST</option>
                    <option value="PST">PST</option>
                    <option value="BST">BST</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Notification Preferences</h2>
            </div>
            <div className="p-6 space-y-6">
              {Object.entries(settings.notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                    <p className="text-sm text-gray-400">
                      {key === 'email' && 'Receive notifications via email'}
                      {key === 'push' && 'Browser push notifications'}
                      {key === 'sms' && 'SMS notifications for important updates'}
                      {key === 'trading' && 'Trading alerts and signals'}
                      {key === 'security' && 'Security and login alerts'}
                      {key === 'marketing' && 'Promotional offers and updates'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Trading Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Trading Preferences</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Auto-close Trades</h3>
                  <p className="text-sm text-gray-400">Automatically close trades at expiration</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.trading.autoClose}
                    onChange={(e) => handleSettingChange('trading', 'autoClose', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Sound Effects</h3>
                  <p className="text-sm text-gray-400">Play sounds for trading events</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.trading.soundEffects}
                    onChange={(e) => handleSettingChange('trading', 'soundEffects', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Default Chart Type</label>
                  <select
                    value={settings.trading.chartType}
                    onChange={(e) => handleSettingChange('trading', 'chartType', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="candlestick">Candlestick</option>
                    <option value="line">Line Chart</option>
                    <option value="area">Area Chart</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Default Timeframe</label>
                  <select
                    value={settings.trading.defaultTimeframe}
                    onChange={(e) => handleSettingChange('trading', 'defaultTimeframe', e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1m">1 Minute</option>
                    <option value="5m">5 Minutes</option>
                    <option value="15m">15 Minutes</option>
                    <option value="1h">1 Hour</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Risk Level</label>
                <select
                  value={settings.trading.riskLevel}
                  onChange={(e) => handleSettingChange('trading', 'riskLevel', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Conservative</option>
                  <option value="medium">Moderate</option>
                  <option value="high">Aggressive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold">Security Settings</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Two-Factor Authentication</h3>
                  <p className="text-sm text-gray-400">Add extra security to your account</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.security.twoFactor}
                    onChange={(e) => handleSettingChange('security', 'twoFactor', e.target.checked)}
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
                    checked={settings.security.loginAlerts}
                    onChange={(e) => handleSettingChange('security', 'loginAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Session Timeout (minutes)</label>
                <select
                  value={settings.security.sessionTimeout}
                  onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>
            </div>
          </div>

          {/* Reset Settings */}
          <div className="bg-gray-800 rounded-lg border border-red-500">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-red-400 mb-4">Danger Zone</h2>
              <div className="space-y-4">
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
                  <i className="fas fa-undo mr-2"></i>
                  Reset All Settings
                </button>
                <p className="text-sm text-gray-400">
                  This will reset all your preferences to default values. This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
