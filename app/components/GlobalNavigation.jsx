'use client';
import React from 'react';
import Link from 'next/link';

const GlobalNavigation = ({ title, subtitle }) => {
  return (
    <div className="mb-8">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          {subtitle && <p className="text-gray-400">{subtitle}</p>}
        </div>
        <Link 
          href="/"
          className="inline-flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
        >
          <i className="fas fa-home mr-2"></i>
          Back to Trading
        </Link>
      </div>
      
      {/* Quick Navigation Menu */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <Link href="/trade" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors">
          <i className="fas fa-exchange-alt mr-1"></i> Trade
        </Link>
        <Link href="/analytics" className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors">
          <i className="fas fa-chart-area mr-1"></i> Analytics
        </Link>
        <Link href="/account" className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors">
          <i className="fas fa-user mr-1"></i> Account
        </Link>
        <Link href="/deposit" className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors">
          <i className="fas fa-plus-circle mr-1"></i> Deposit
        </Link>
        <Link href="/withdrawal" className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm transition-colors">
          <i className="fas fa-minus-circle mr-1"></i> Withdrawal
        </Link>
        <Link href="/settings" className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm transition-colors">
          <i className="fas fa-cog mr-1"></i> Settings
        </Link>
      </div>
    </div>
  );
};

export default GlobalNavigation;
