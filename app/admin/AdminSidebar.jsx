"use client";
import React from 'react';
import SidebarHamburger from '@/app/components/SidebarHamburger';

export default function AdminSidebar({ className = '', id = 'admin-sidebar', onNavigate, isOpen, onToggle }) {
  const handleLogout = async () => {
    try {
  await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    } catch (e) {
      // ignore
    }
    try {
      localStorage.removeItem('admin_user');
    } catch (e) {}
    window.location.href = '/admin/login';
  };

  const linkClass = "block py-2 px-3 rounded hover:bg-[#1d2440]";
  return (
  <aside id={id} className={`w-64 bg-[#151a2e] border-r border-[#262b40] p-4 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[15px] font-semibold tracking-wide text-gray-200">ADMIN MENU</div>
        {/* Desktop hamburger to collapse/expand sidebar (hidden on mobile) */}
        <SidebarHamburger
          isOpen={!!isOpen}
          onToggle={onToggle}
          className="hidden md:inline-flex"
          aria-controls={id}
        />
      </div>
      <div className="border-b border-[#262b40] mb-4" />
      <nav className="space-y-3">
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1 px-1">Overview</div>
      <a className={linkClass} href="/admin" onClick={onNavigate}>Dashboard</a>
      <a className={linkClass} href="/admin/analytics" onClick={onNavigate}>Analytics</a>
      <a className={linkClass} href="/admin/reports" onClick={onNavigate}>Reports</a>
      <a className={linkClass} href="/admin/live-monitoring" onClick={onNavigate}>Live Monitoring</a>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1 px-1">Management</div>
      <a className={linkClass} href="/admin/users" onClick={onNavigate}>Users</a>
      <a className={`${linkClass} text-green-400 pl-6`} href="/admin/users-new" onClick={onNavigate}>+ Add User</a>
      <a className={linkClass} href="/admin/trades" onClick={onNavigate}>Trades</a>
      <a className={linkClass} href="/admin/deposits" onClick={onNavigate}>Deposits</a>
      <a className={linkClass} href="/admin/withdrawals" onClick={onNavigate}>Withdrawals</a>
      <a className={linkClass} href="/admin/support" onClick={onNavigate}>Support</a>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1 px-1">Markets</div>
      <a className={linkClass} href="/admin/currency-pairs" onClick={onNavigate}>Currency Pairs</a>
      <a className={`${linkClass} text-green-400 pl-6`} href="/admin/currency-pairs-new" onClick={onNavigate}>+ Add Pair</a>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1 px-1">Community</div>
      <a className={linkClass} href="/admin/leaderboard" onClick={onNavigate}>Leaderboard</a>
      <a className={linkClass} href="/admin/tournaments" onClick={onNavigate}>Tournaments</a>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-gray-400 mb-1 px-1">System</div>
      <a className={linkClass} href="/admin/system" onClick={onNavigate}>System</a>
      <a className={linkClass} href="/admin/risk-management" onClick={onNavigate}>Risk Management</a>
      <a className={linkClass} href="/admin/notifications" onClick={onNavigate}>Notifications</a>
      <a className={linkClass} href="/admin/logs" onClick={onNavigate}>Logs & Audit</a>
      <a className={linkClass} href="/admin/settings" onClick={onNavigate}>Settings</a>
        </div>
      </nav>
      <div className="mt-6 pt-4 border-t border-[#262b40]">
        <button onClick={handleLogout} className="w-full py-2 px-3 rounded bg-red-600 hover:bg-red-700 font-semibold">Logout</button>
      </div>
    </aside>
  );
}
