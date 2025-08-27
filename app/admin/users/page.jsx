"use client";
import React, { useEffect, useState } from 'react';

export default function AdminUsersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ q, page: String(page), pageSize: String(pageSize) });
  const res = await fetch(`/api/admin/users?${params.toString()}`, { credentials: 'include' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load');
      setData(json);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search name or email" className="px-3 py-2 rounded bg-[#0f1320] border border-[#2a3142]" />
          <button onClick={()=>{setPage(1); load();}} className="px-3 py-2 rounded bg-blue-600 hover:bg-blue-700">Search</button>
        </div>
      </div>
      {error && <div className="text-red-400 mb-3">{error}</div>}
      {loading ? (
        <div className="text-gray-400">Loading...</div>
      ) : (
        <div className="bg-[#151a2e] border border-[#262b40] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#101527] text-gray-300">
              <tr>
                <th className="text-left p-3">Email</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Admin</th>
                <th className="text-left p-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.items?.map(u => (
                <tr key={u.id} className="border-t border-[#262b40]">
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{[u.first_name, u.last_name].filter(Boolean).join(' ') || '-'}</td>
                  <td className="p-3">{u.is_admin ? 'Yes' : 'No'}</td>
                  <td className="p-3">{new Date(u.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {data?.items?.length === 0 && (
                <tr>
                  <td className="p-3 text-gray-400" colSpan={4}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between p-3">
            <div className="text-sm text-gray-400">Total: {data?.total}</div>
            <div className="flex items-center gap-2">
              <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="px-3 py-1 rounded bg-[#101527] disabled:opacity-40">Prev</button>
              <div className="text-sm">Page {page}</div>
              <button disabled={(data?.page||1)* (data?.pageSize||pageSize) >= (data?.total||0)} onClick={()=>setPage(p=>p+1)} className="px-3 py-1 rounded bg-[#101527] disabled:opacity-40">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
