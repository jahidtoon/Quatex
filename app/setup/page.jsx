"use client";
import React, { useState } from 'react';
import Link from 'next/link';

export default function SetupPage() {
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const setupDemo = async () => {
    setLoading(true);
    setStatus('Setting up demo data...');

    try {
      const response = await fetch('/api/setup/demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setStatus(`✅ Demo setup complete! You can login with:
        Email: ${data.user.email}
        Password: ${data.user.password}`);
      } else {
        setStatus(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setStatus(`❌ Setup failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-6">Quatex Setup</h1>
          
          <div className="space-y-4">
            <p className="text-gray-300">
              Click the button below to set up demo user and data for testing the profile page.
            </p>
            
            <button
              onClick={setupDemo}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Setting up...
                </>
              ) : (
                'Setup Demo Data'
              )}
            </button>

            {status && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{status}</pre>
              </div>
            )}

            <div className="mt-6 space-y-2">
              <Link 
                href="/auth/login" 
                className="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
              >
                Go to Login
              </Link>
              
              <Link 
                href="/account" 
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg text-center transition-colors"
              >
                Go to Account Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
