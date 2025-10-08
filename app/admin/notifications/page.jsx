"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (!response.ok) throw new Error(`Failed to load notifications (${response.status})`);
      const payload = await response.json();
      setNotifications(payload.items || payload || []);
    } catch (err) {
      setError(err.message || 'Unable to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const stats = useMemo(() => {
    if (!notifications.length) {
      return {
        total: 0,
        active: 0,
        scheduled: 0,
        sent: 0
      };
    }
    const normalizedStatus = (value) => (value || '').toLowerCase();
    return {
      total: notifications.length,
      active: notifications.filter((item) => normalizedStatus(item.status).includes('active')).length,
      scheduled: notifications.filter((item) => item.scheduledFor).length,
      sent: notifications.reduce((sum, item) => sum + (item.sentCount || 0), 0)
    };
  }, [notifications]);

  const analyticsByType = useMemo(() => {
    const map = new Map();
    notifications.forEach((notification) => {
      const key = notification.type || 'unknown';
      const entry = map.get(key) || { count: 0, sent: 0 };
      entry.count += 1;
      entry.sent += notification.sentCount || 0;
      map.set(key, entry);
    });
    return Array.from(map.entries()).map(([type, data]) => ({ type, ...data }));
  }, [notifications]);

  const analyticsByTarget = useMemo(() => {
    const map = new Map();
    notifications.forEach((notification) => {
      const key = notification.target || 'all';
      const entry = map.get(key) || { count: 0, sent: 0 };
      entry.count += 1;
      entry.sent += notification.sentCount || 0;
      map.set(key, entry);
    });
    return Array.from(map.entries()).map(([target, data]) => ({ target, ...data }));
  }, [notifications]);

  const formatDateTime = (value) => {
    if (!value) return '—';
    try {
      return new Date(value).toLocaleString();
    } catch (err) {
      return value;
    }
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
      case 'active':
      case 'Active':
        return 'bg-green-600/20 text-green-400';
      case 'scheduled':
      case 'Scheduled':
        return 'bg-blue-600/20 text-blue-400';
      case 'sent':
      case 'Sent':
        return 'bg-gray-600/20 text-gray-400';
      case 'draft':
      case 'Draft':
        return 'bg-yellow-600/20 text-yellow-400';
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
        actions={
          <button
            onClick={fetchNotifications}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        }
      />

      {error && (
        <Card className="mb-6 border border-red-500/40 bg-red-500/10">
          <div className="flex items-center justify-between text-sm text-red-200">
            <span>{error}</span>
            <button
              onClick={fetchNotifications}
              className="px-3 py-1 bg-red-500/20 border border-red-500/40 rounded-lg hover:bg-red-500/30"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Notifications" value={stats.total.toString()} hint="All records" />
        <StatCard label="Active" value={stats.active.toString()} hint="Status marked active" />
        <StatCard label="Scheduled" value={stats.scheduled.toString()} hint="Has a scheduled date" />
        <StatCard label="Total Sent" value={stats.sent.toString()} hint="Aggregate sent count" />
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
          {loading ? (
            <div className="p-10 text-center text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3" />
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-lg">No notifications yet</p>
              <p className="text-sm">Create a notification to start engaging users.</p>
            </div>
          ) : (
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
                          <span className="capitalize">{notification.type || 'unknown'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-white">{notification.title || 'Untitled Notification'}</div>
                          <div className="text-xs text-gray-400 max-w-xs truncate">{notification.message || '—'}</div>
                        </div>
                      </td>
                      <td className="p-4 capitalize">{notification.target || 'all'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                          {notification.status || 'unknown'}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`font-medium ${getPriorityColor(notification.priority)}`}>
                          {(notification.priority || 'normal').toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-xs">{formatDateTime(notification.createdAt)}</td>
                      <td className="p-4 text-xs space-y-1">
                        {notification.sentCount ? (
                          <div className="text-green-400">✅ {notification.sentCount.toLocaleString()} sent</div>
                        ) : (
                          <div className="text-gray-500">No deliveries</div>
                        )}
                        {notification.scheduledFor && (
                          <div className="text-blue-400">⏰ {formatDateTime(notification.scheduledFor)}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700">
                            Archive
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            {analyticsByType.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                Analytics will appear once notifications have been sent.
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {analyticsByType.map((item) => (
                    <div key={item.type} className="bg-[#101527] p-4 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{getTypeIcon(item.type)}</span>
                        <span className="text-xs text-gray-400 uppercase">{item.type}</span>
                      </div>
                      <div className="text-2xl font-semibold text-white">{item.count}</div>
                      <div className="text-xs text-gray-400">Notifications of this type</div>
                      <div className="text-sm text-green-300">{item.sent.toLocaleString()} total deliveries</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>

          <Card title="Notification Performance by Type">
            {analyticsByTarget.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                No delivery data yet for audience segments.
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {analyticsByTarget.map((item) => (
                  <div key={item.target} className="flex items-center justify-between p-4 bg-[#101527] rounded-lg">
                    <div>
                      <div className="text-sm text-white capitalize">{item.target}</div>
                      <div className="text-xs text-gray-400">{item.count} notifications</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-300">{item.sent.toLocaleString()} total deliveries</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
