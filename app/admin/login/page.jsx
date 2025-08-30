
"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@quatex.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Login failed');
      try { localStorage.setItem('admin_user', JSON.stringify(data.user)); } catch {}
      router.push('/admin');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0f1a] via-[#0f1320] to-[#151a2e] text-white">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Quatex</h1>
          <p className="text-gray-400 mt-2">Admin Panel</p>
        </div>

        <div className="bg-[#151a2e] border border-[#262b40] rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>

          <div className="mb-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
            <div className="text-sm text-blue-400 text-center">
              <strong>Demo Credentials:</strong><br/>
              Email: admin@quatex.com<br/>
              Password: admin123
            </div>
          </div>

          {error && (
            <div className="mb-4 text-red-400 bg-red-900/30 border border-red-700 p-3 rounded-lg">{error}</div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
              <input
                className="w-full px-4 py-3 rounded-lg bg-[#0f1320] border border-[#2a3142] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  className="w-full px-4 py-3 rounded-lg bg-[#0f1320] border border-[#2a3142] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-60 disabled:cursor-not-allowed font-semibold transition-all"
            >
              {loading ? 'Signing in…' : 'Sign In to Admin Panel'}
            </button>
          </form>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>&copy; 2025 Quatex Trading Platform. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
