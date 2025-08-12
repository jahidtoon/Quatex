import React, { useState } from 'react';

const Settings = () => {
  const [notifications, setNotifications] = useState(true);
  const [privateAccount, setPrivateAccount] = useState(false);

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // Add delete logic here
      alert('Account deleted (demo only)');
    }
  };

  const handleSave = () => {
    // Add save logic here
    alert('Settings saved! (demo only)');
  };

  return (
    <div className="w-full min-h-screen max-w-4xl mx-auto p-8 bg-gradient-to-br from-[#23283a] via-[#1a2036] to-[#181c2a]">
      <h1 className="text-4xl font-bold text-white mb-8">Settings</h1>
      <div className="bg-[#23283a] p-6 rounded-lg mb-8 shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-6 border-b border-custom pb-3">General</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label htmlFor="language" className="text-main">Language</label>
            <select id="language" className="bg-tertiary border border-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5">
              <option>English</option>
              <option>Spanish</option>
              <option>German</option>
              <option>Russian</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="timezone" className="text-main">Timezone</label>
            <select id="timezone" className="bg-tertiary border border-custom text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-1/2 p-2.5">
              <option>(UTC+06:00) Dhaka</option>
              <option>(UTC-05:00) Eastern Time (US & Canada)</option>
              <option>(UTC+01:00) Central European Time</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-main">Theme</span>
            <div className="flex items-center space-x-4">
              <button className="bg-gray-700 text-white px-4 py-2 rounded-lg">Dark</button>
              <button className="bg-gray-300 text-black px-4 py-2 rounded-lg">Light</button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-main">Notifications</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={notifications} onChange={() => setNotifications(v => !v)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-500 transition"></div>
              <span className="ml-3 text-sm text-white">{notifications ? 'On' : 'Off'}</span>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-main">Private Account</span>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={privateAccount} onChange={() => setPrivateAccount(v => !v)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:bg-blue-500 transition"></div>
              <span className="ml-3 text-sm text-white">{privateAccount ? 'Private' : 'Public'}</span>
            </label>
          </div>
        </div>
      </div>
      <div className="bg-[#23283a] p-6 rounded-lg shadow-lg mb-8">
        <h2 className="text-2xl font-semibold text-white mb-6 border-b border-custom pb-3">Security</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-main">Two-Factor Authentication (2FA)</span>
            <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md">Enable 2FA</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-main">Change Password</span>
            <button className="bg-tertiary hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-md">Change</button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-red-400 font-bold">Delete Account</span>
            <button onClick={handleDeleteAccount} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md">Delete</button>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg text-lg">Save Changes</button>
      </div>
    </div>
  );
};

export default Settings;
