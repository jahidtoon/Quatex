"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  try { localStorage.setItem('admin_user', JSON.stringify(data.user)); } catch {}
      router.push('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f1a] text-white">
      <div className="w-full max-w-md bg-[#151a2e] border border-[#262b40] rounded-xl p-8">
        <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
        {error && <div className="mb-4 text-red-400 bg-red-900/30 border border-red-700 p-3 rounded">{error}</div>}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Email</label>
            <input className="w-full px-4 py-3 rounded bg-[#0f1320] border border-[#2a3142] focus:outline-none focus:ring-2 focus:ring-blue-600" type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Password</label>
            <input className="w-full px-4 py-3 rounded bg-[#0f1320] border border-[#2a3142] focus:outline-none focus:ring-2 focus:ring-blue-600" type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 rounded bg-blue-600 hover:bg-blue-700 disabled:opacity-60 font-semibold">{loading? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </div>
  );
}
