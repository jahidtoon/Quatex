"use client";
import React, { useEffect, useState } from 'react';
import TransferForm from './wallet/TransferForm';

export default function AdminWalletPanel() {
  const [assets, setAssets] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addrData, setAddrData] = useState(null);
  const [priceMap, setPriceMap] = useState({});
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('usd');
  const [sortDir, setSortDir] = useState('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [sessPage, setSessPage] = useState(1);
  const sessPageSize = 10;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const assetsRes = await fetch('/api/crypto-assets', { credentials: 'include' });
        const assetsData = assetsRes.ok ? await assetsRes.json() : [];
        const token = localStorage.getItem('auth_token');
        let sessionsData = [];
        // Always try to fetch using cookies; add bearer if token exists
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const sessRes = await fetch('/api/admin/deposit-sessions', { headers, credentials: 'include' });
        sessionsData = sessRes.ok ? await sessRes.json() : [];
        // Determine dynamic offset/count to include highest derivation index in the address table
        const extractIdx = (p) => {
          if (!p) return null;
          const m = String(p).match(/\/(\d+)$/);
          return m ? Number(m[1]) : null;
        };
        const highIdx = sessionsData.reduce((mx, s) => {
          const idx = extractIdx(s.derivation_path);
          return idx !== null && idx > mx ? idx : mx;
        }, 0);
        const span = 6; // show up to 6 addresses per network
        const offset = Math.max(0, highIdx - (span - 1));
  const addrRes = await fetch(`/api/admin/wallet/addresses?networks=eth,bsc,tron&count=${span}&offset=${offset}`, { headers, credentials: 'include' });
        const addrJson = addrRes.ok ? await addrRes.json() : null;
  // spot prices
  const priceRes = await fetch(`/api/admin/wallet/spot-prices?symbols=ETH_USD,BNB_USD,TRX_USD`, { credentials: 'include' });
  const priceJson = priceRes.ok ? await priceRes.json() : { prices: {} };
        setAddrData(addrJson);
  setPriceMap(priceJson.prices || {});
        setAssets(assetsData);
        setSessions(sessionsData);
      } catch (e) { /* ignore */ }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Admin Wallet Overview</h1>
      <div className="mb-6">
        <TransferForm />
      </div>
      {loading ? <div>লোড হচ্ছে...</div> : (
        <>
          {addrData && addrData.networks && addrData.networks.length > 0 ? (
            <div className="bg-neutral-900/40 border rounded p-4">
              <h2 className="text-lg font-semibold mb-3">Derived Admin Addresses</h2>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                <div className="text-xs text-gray-400">সকল নেটওয়ার্কের ডেরাইভড অ্যাড্রেস সমূহ</div>
                <div className="flex items-center gap-2">
                  <input value={search} onChange={e=>{ setSearch(e.target.value); setPage(1); }} placeholder="ঠিকানা/নেটওয়ার্ক/সিম্বল দিয়ে খুঁজুন..." className="px-2 py-1 text-xs bg-neutral-800 border rounded w-64" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="bg-neutral-800">
                      {['index','symbol','network','address','balance','usd'].map(col => (
                        <th key={col} className="p-2 text-left cursor-pointer select-none" onClick={()=>{
                          if (sortBy===col) { setSortDir(sortDir==='asc'?'desc':'asc'); }
                          else { setSortBy(col); setSortDir(col==='usd'?'desc':'asc'); }
                          setPage(1);
                        }}>
                          {col.toUpperCase()} {sortBy===col ? (sortDir==='asc'?'▲':'▼') : ''}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Flatten rows
                      const rows = [];
                      const symForNet = (net) => net==='eth'?'ETH': net==='bsc'?'BNB': net==='tron'?'TRX': net.toUpperCase();
                      const usdKey = (net) => `${symForNet(net)}_USD`;
                      for (const net of addrData.networks) {
                        for (const r of net.addresses) {
                          const sym = symForNet(net.network);
                          const balNum = r.balance ? Number(r.balance) : 0;
                          const px = priceMap[usdKey(net.network)] || 0;
                          const usd = balNum * px;
                          rows.push({
                            index: r.index,
                            symbol: sym,
                            network: net.network,
                            address: r.address || '-',
                            balance: balNum,
                            usd,
                          });
                        }
                      }
                      // search filter
                      const q = search.trim().toLowerCase();
                      const filtered = q ? rows.filter(row =>
                        String(row.index).includes(q) ||
                        row.symbol.toLowerCase().includes(q) ||
                        row.network.toLowerCase().includes(q) ||
                        row.address.toLowerCase().includes(q)
                      ) : rows;
                      // sort
                      const sorted = [...filtered].sort((a,b)=>{
                        const dir = sortDir==='asc'?1:-1;
                        const ka = a[sortBy];
                        const kb = b[sortBy];
                        if (typeof ka === 'number' && typeof kb === 'number') return (ka-kb)*dir;
                        return String(ka).localeCompare(String(kb)) * dir;
                      });
                      // pagination
                      const total = sorted.length;
                      const start = (page-1)*pageSize;
                      const end = Math.min(start + pageSize, total);
                      const pageRows = sorted.slice(start, end);
                      return pageRows.map((row, i) => (
                        <tr key={i} className="border-b border-neutral-700 hover:bg-neutral-800/40">
                          <td className="p-2">{row.index}</td>
                          <td className="p-2">{row.symbol}</td>
                          <td className="p-2 uppercase">{row.network}</td>
                          <td className="p-2 break-all font-mono text-[11px]">{row.address}</td>
                          <td className="p-2">{Number.isFinite(row.balance) ? row.balance.toFixed(6) : '0'}</td>
                          <td className="p-2">{Number.isFinite(row.usd) ? row.usd.toFixed(6) : '0'}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
              {(() => {
                // pagination footer
                const rows = [];
                const symForNet = (net) => net==='eth'?'ETH': net==='bsc'?'BNB': net==='tron'?'TRX': net.toUpperCase();
                for (const net of addrData.networks) rows.push(...net.addresses);
                const total = rows.length; // rough count; fine for footer
                const start = (page-1)*pageSize + 1;
                const end = Math.min(page*pageSize, total);
                return (
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-300">
                    <div>প্রদর্শিত: {total===0? '0' : `${start}-${end}`} মোট {total}</div>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 bg-neutral-800 border rounded disabled:opacity-50" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>পূর্ববর্তী</button>
                      <button className="px-2 py-1 bg-neutral-800 border rounded disabled:opacity-50" disabled={end>=total} onClick={()=>setPage(p=>p+1)}>পরবর্তী</button>
                  </div>
                  </div>
                );
              })()}
              {addrData.warnings?.length ? (
                <div className="mt-2 text-xs text-yellow-400">Warnings: {addrData.warnings.join(' | ')}</div>
              ) : null}
            </div>
          ) : (
            <div className="bg-neutral-900/40 border rounded p-4">
              <h2 className="text-lg font-semibold mb-2">Derived Admin Addresses</h2>
              <div className="text-sm text-red-300">No addresses to display.</div>
              <div className="text-xs text-gray-400 mt-1">
                Make sure you have set HD_MNEMONIC in .env.local and configured RPC_ETH/RPC_BSC/RPC_TRON. Then refresh this page.
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            {assets.map(a => (
              <div key={a.id} className="border rounded p-4 bg-neutral-900/40">
                <div className="font-semibold">{a.symbol}</div>
                <div className="text-xs text-gray-400">{a.network}</div>
                <div className="text-xs">Min deposit: {a.min_deposit}</div>
                <div className="text-xs">Active: {a.is_active ? 'Yes' : 'No'}</div>
              </div>
            ))}
          </div>
          <h2 className="text-lg font-semibold mb-2">Recent Deposit Sessions</h2>
          {sessions.length === 0 ? (
            <div className="text-sm text-gray-400 bg-neutral-900/40 border rounded p-4">কোনো ডিপোজিট সেশন পাওয়া যায়নি।</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-neutral-800">
                    <th className="p-2">User</th>
                    <th className="p-2">Asset</th>
                    <th className="p-2">Address</th>
                    <th className="p-2">Sender</th>
                    <th className="p-2">Index</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Amount</th>
                    <th className="p-2">Expires</th>
                    <th className="p-2">Late?</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // newest first (already from API), paginate 10 per page
                    const start = (sessPage - 1) * sessPageSize;
                    const end = start + sessPageSize;
                    const pageSessions = sessions.slice(start, end);
                    return pageSessions.map(s => (
                      <tr key={s.id} className="border-b border-neutral-700">
                        <td className="p-2">{s.user_email || s.user_id}</td>
                        <td className="p-2">{s.asset_symbol}/{s.asset_network}</td>
                        <td className="p-2 text-xs break-all">{s.address}</td>
                        <td className="p-2 text-xs break-all">{s.sender_address || '-'}</td>
                        <td className="p-2 text-xs">{(() => { const m = (s.derivation_path||'').match(/\/(\d+)$/); return m ? m[1] : '-'; })()}</td>
                        <td className="p-2">{s.status}</td>
                        <td className="p-2">{s.amount ?? '-'}</td>
                        <td className="p-2">{s.expiresAt}</td>
                        <td className="p-2">{s.isLate ? 'Yes' : 'No'}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
              {(() => {
                const total = sessions.length;
                const totalPages = Math.max(1, Math.ceil(total / sessPageSize));
                const start = total === 0 ? 0 : (sessPage - 1) * sessPageSize + 1;
                const end = Math.min(sessPage * sessPageSize, total);
                return (
                  <div className="flex items-center justify-between mt-3 text-xs text-gray-300">
                    <div>প্রদর্শিত: {total===0? '0' : `${start}-${end}`} মোট {total}</div>
                    <div className="flex items-center gap-2">
                      <button className="px-2 py-1 bg-neutral-800 border rounded disabled:opacity-50" disabled={sessPage<=1} onClick={()=>setSessPage(p=>Math.max(1,p-1))}>পূর্ববর্তী</button>
                      <span>পৃষ্ঠা {sessPage}/{totalPages}</span>
                      <button className="px-2 py-1 bg-neutral-800 border rounded disabled:opacity-50" disabled={sessPage>=totalPages} onClick={()=>setSessPage(p=>Math.min(totalPages,p+1))}>পরবর্তী</button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
