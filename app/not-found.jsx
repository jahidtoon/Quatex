"use client";
import React from 'react';
import Link from 'next/link';

export default function Error404() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-8xl font-bold text-blue-400 mb-4">404</div>
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-gray-400 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <i className="fas fa-home mr-2"></i>
            Back to Trading
          </Link>
          
          <Link 
            href="/support"
            className="block w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            <i className="fas fa-headset mr-2"></i>
            Contact Support
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <Link 
            href="/analytics"
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-chart-pie text-2xl text-blue-400 mb-2"></i>
            <div className="text-sm">Analytics</div>
          </Link>
          
          <Link 
            href="/account"
            className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <i className="fas fa-user-circle text-2xl text-green-400 mb-2"></i>
            <div className="text-sm">Account</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
