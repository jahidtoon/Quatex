"use client";
import React, { useState } from 'react';
import AdminPageHeader from '../components/AdminPageHeader';
import Card from '../components/Card';
import StatCard from '../components/StatCard';

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState('manage');
  const [newNotification, setNewNotification] = useState({
    type: 'info',
    title: '',
    message: '',
    target: 'all',
    scheduled: false,
    scheduledTime: ''
  });

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      type: 'maintenance',
      title: 'Scheduled Maintenance',
      message: 'Trading platform will be under maintenance from 2:00 AM to 4:00 AM UTC.',
      target: 'all',
      status: 'active',
      created: '2025-08-29 10:30:00',
      sent: 15420,
      priority: 'high'
    },
    {
      id: 2,
      type: 'promotion',
      title: 'New Tournament Available',
      message: 'Join our weekly Forex tournament with $10,000 prize pool!',
      target: 'verified',
      status: 'scheduled',
      created: '2025-08-29 09:15:00',
      scheduled: '2025-08-30 08:00:00',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'security',
      title: 'Security Alert',
      message: 'New login detected from unusual location. Please verify your account.',
      target: 'specific',
      status: 'sent',
      created: '2025-08-29 08:45:00',
      sent: 1,
      priority: 'high'
    },
    {
      id: 4,
      type: 'update',
      title: 'Platform Update',
      message: 'New features added: Advanced charting tools and market analysis.',
      target: 'all',
      status: 'draft',
      created: '2025-08-29 07:20:00',
      priority: 'low'
    }
  ];

  const stats = {
    totalSent: 45230,
    activeNotifications: 3,
    scheduledNotifications: 2,
    openRate: 68.5
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'maintenance': return '🔧';
      case 'promotion': return '🎉';
      case 'security': return '🔒';
      case 'update': return '🆕';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-600/20 text-green-400';
      case 'scheduled': return 'bg-blue-600/20 text-blue-400';
      case 'sent': return 'bg-gray-600/20 text-gray-400';
      case 'draft': return 'bg-yellow-600/20 text-yellow-400';
      default: return 'bg-gray-600/20 text-gray-400';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const handleSendNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Mock send functionality
    alert(`Notification "${newNotification.title}" sent to ${newNotification.target} users!`);
    setNewNotification({
      type: 'info',
      title: '',
      message: '',
      target: 'all',
      scheduled: false,
      scheduledTime: ''
    });
  };

  return (
    <div>
      <AdminPageHeader 
        title="Notifications & Alerts" 
        subtitle="Manage user notifications and system alerts" 
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard 
          title="Total Sent" 
          value={stats.totalSent.toLocaleString()} 
          icon="📤"
          trend={{ value: 15.3, isPositive: true }}
        />
        <StatCard 
          title="Active Notifications" 
          value={stats.activeNotifications.toString()} 
          icon="🔔"
          trend={{ value: 2, isPositive: true }}
        />
        <StatCard 
          title="Scheduled" 
          value={stats.scheduledNotifications.toString()} 
          icon="⏰"
          trend={{ value: 0, isPositive: true }}
        />
        <StatCard 
          title="Open Rate" 
          value={`${stats.openRate}%`} 
          icon="👁️"
          trend={{ value: 3.2, isPositive: true }}
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6">
        {[
          { id: 'manage', label: 'Manage Notifications', icon: '📋' },
          { id: 'create', label: 'Create New', icon: '✉️' },
          { id: 'analytics', label: 'Analytics', icon: '📊' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#1a1f33] text-gray-300 hover:bg-[#232945]'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Manage Notifications Tab */}
      {activeTab === 'manage' && (
        <Card title="Notification Management">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#101527] text-gray-300">
                <tr>
                  <th className="text-left p-4">Type</th>
                  <th className="text-left p-4">Title</th>
                  <th className="text-left p-4">Target</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Priority</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Sent/Scheduled</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.id} className="border-b border-[#262b40] hover:bg-[#1a1f33]">
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getTypeIcon(notification.type)}</span>
                        <span className="capitalize">{notification.type}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="font-medium text-white">{notification.title}</div>
                        <div className="text-xs text-gray-400 max-w-xs truncate">{notification.message}</div>
                      </div>
                    </td>
                    <td className="p-4 capitalize">{notification.target}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${getPriorityColor(notification.priority)}`}>
                        {notification.priority.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400 text-xs">{notification.created}</td>
                    <td className="p-4 text-xs">
                      {notification.sent && (
                        <div className="text-green-400">✅ {notification.sent.toLocaleString()} sent</div>
                      )}
                      {notification.scheduled && (
                        <div className="text-blue-400">⏰ {notification.scheduled}</div>
                      )}
                      {notification.status === 'draft' && (
                        <div className="text-gray-400">📝 Draft</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                          Edit
                        </button>
                        {notification.status === 'draft' && (
                          <button className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                            Send
                          </button>
                        )}
                        {notification.status === 'active' && (
                          <button className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                            Stop
                          </button>
                        )}
                        <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Create New Notification Tab */}
      {activeTab === 'create' && (
        <Card title="Create New Notification">
          <div className="p-6 space-y-6">
            {/* Notification Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notification Type</label>
              <select
                value={newNotification.type}
                onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="info">ℹ️ Information</option>
                <option value="promotion">🎉 Promotion</option>
                <option value="maintenance">🔧 Maintenance</option>
                <option value="security">🔒 Security</option>
                <option value="update">🆕 Update</option>
                <option value="warning">⚠️ Warning</option>
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
              <input
                type="text"
                value={newNotification.title}
                onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter notification title"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Message *</label>
              <textarea
                value={newNotification.message}
                onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter notification message"
              />
            </div>

            {/* Target Audience */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Target Audience</label>
              <select
                value={newNotification.target}
                onChange={(e) => setNewNotification({...newNotification, target: e.target.value})}
                className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">👥 All Users</option>
                <option value="verified">✅ Verified Users</option>
                <option value="premium">⭐ Premium Users</option>
                <option value="active">🔥 Active Traders</option>
                <option value="new">🆕 New Users</option>
              </select>
            </div>

            {/* Scheduling */}
            <div>
              <label className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={newNotification.scheduled}
                  onChange={(e) => setNewNotification({...newNotification, scheduled: e.target.checked})}
                  className="mr-2"
                />
                <span className="text-sm text-gray-300">Schedule for later</span>
              </label>
              
              {newNotification.scheduled && (
                <input
                  type="datetime-local"
                  value={newNotification.scheduledTime}
                  onChange={(e) => setNewNotification({...newNotification, scheduledTime: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1a1f33] border border-[#262b40] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4 border-t border-[#262b40]">
              <button
                onClick={handleSendNotification}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {newNotification.scheduled ? '⏰ Schedule Notification' : '📤 Send Now'}
              </button>
              <button
                onClick={() => alert('Notification saved as draft')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                💾 Save as Draft
              </button>
              <button
                onClick={() => alert('Sending test notification to admin')}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                🧪 Send Test
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <Card title="Notification Analytics">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-[#101527] p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">68.5%</div>
                  <div className="text-sm text-gray-400">Average Open Rate</div>
                  <div className="text-xs text-green-400 mt-1">+5.2% vs last month</div>
                </div>
                <div className="bg-[#101527] p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">42.3%</div>
                  <div className="text-sm text-gray-400">Click-through Rate</div>
                  <div className="text-xs text-green-400 mt-1">+3.8% vs last month</div>
                </div>
                <div className="bg-[#101527] p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">12.8%</div>
                  <div className="text-sm text-gray-400">Conversion Rate</div>
                  <div className="text-xs text-green-400 mt-1">+1.2% vs last month</div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Notification Performance by Type">
            <div className="p-6">
              <div className="space-y-4">
                {[
                  { type: 'Promotion', sent: 12500, opened: 8750, clicked: 5250, icon: '🎉', color: 'text-green-400' },
                  { type: 'Security', sent: 8900, opened: 7120, clicked: 3200, icon: '🔒', color: 'text-red-400' },
                  { type: 'Update', sent: 15420, opened: 9250, clicked: 4100, icon: '🆕', color: 'text-blue-400' },
                  { type: 'Maintenance', sent: 15420, opened: 13200, clicked: 2100, icon: '🔧', color: 'text-yellow-400' }
                ].map((stat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-[#101527] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{stat.icon}</span>
                      <div>
                        <div className={`font-medium ${stat.color}`}>{stat.type}</div>
                        <div className="text-xs text-gray-400">{stat.sent.toLocaleString()} sent</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white">{((stat.opened / stat.sent) * 100).toFixed(1)}% opened</div>
                      <div className="text-xs text-gray-400">{((stat.clicked / stat.sent) * 100).toFixed(1)}% clicked</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
