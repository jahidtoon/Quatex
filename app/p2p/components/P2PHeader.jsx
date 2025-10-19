"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

function getAuthHeader() {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) return { Authorization: `Bearer ${token}` };
  }
  return { Authorization: 'Bearer DEVUSER:demo@example.com' };
}

export default function P2PHeader({ 
  title, 
  subtitle = null, 
  showNavigation = true,
  currentPath = '',
  rightContent = null 
}) {
  const [notifications, setNotifications] = useState({ total: 0, actionRequired: 0, newMessages: 0 });

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch('/api/p2p/notifications', { headers: { ...getAuthHeader() } });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data);
        }
      } catch (e) {
        // ignore
      }
    }
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { href: '/p2p', label: 'Market', icon: 'fa-store', active: currentPath === '/p2p' },
    { href: '/p2p/post', label: 'Post Ad', icon: 'fa-plus', active: currentPath === '/p2p/post' },
    { href: '/p2p/posts', label: 'My Posts', icon: 'fa-edit', active: currentPath === '/p2p/posts' },
    { 
      href: '/p2p/orders', 
      label: 'My Orders', 
      icon: 'fa-history', 
      active: currentPath === '/p2p/orders',
      badge: notifications.total > 0 ? notifications.total : null
    },
  { href: '/account?tab=billing', label: 'Billing', icon: 'fa-credit-card', active: false },
  ];

  return (
    <div className="bg-gray-800 border-b border-gray-700">
      {/* Main Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold flex items-center">
              <i className="fas fa-exchange-alt text-indigo-400 mr-3"></i>
              {title}
            </h1>
            {subtitle && (
              <span className="text-gray-400 text-lg">• {subtitle}</span>
            )}
          </div>
          
          {rightContent && (
            <div className="flex items-center space-x-3">
              {rightContent}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      {showNavigation && (
        <div className="px-6 py-4 bg-gray-700/50">
          <div className="flex space-x-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center px-6 py-3 rounded-lg whitespace-nowrap transition-all duration-200 font-medium ${
                  item.active
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                }`}
              >
                <i className={`fas ${item.icon} mr-2`}></i>
                {item.label}
                {item.badge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-2 py-1 font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}