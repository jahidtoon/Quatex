"use client";
import { useEffect, useMemo, useState } from 'react';

export default function TransferForm() {
  const [network, setNetwork] = useState('bsc');
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [assetSymbol, setAssetSymbol] = useState('BNB');
  const [fromIndex, setFromIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [recent, setRecent] = useState([]);
  const [polling, setPolling] = useState(false);

  const assetOptionsByNetwork = useMemo(() => ({
    eth: ['ETH'],
    bsc: ['BNB'],
    tron: ['TRX'],
  }), []);

  // Adjust default symbol when network changes
  useEffect(() => {
    const list = assetOptionsByNetwork[network] || [];
    if (!list.includes(assetSymbol)) setAssetSymbol(list[0] || '');
  }, [network]);

  async function loadRecent() {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch('/api/admin/wallet/recent', { headers, credentials: 'include' });
      const json = await res.json();
      if (res.ok) setRecent(json.items || []);
    } catch {}
  }

  useEffect(() => { loadRecent(); }, []);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const token = localStorage.getItem('auth_token');
      const res = await fetch('/api/admin/wallet/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': token ? `Bearer ${token}` : undefined },
        body: JSON.stringify({ network, to, amount, assetSymbol, fromIndex: Number(fromIndex) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const tx = data.tx_hash || data.result?.transactionHash || data.result?.txid;
      setMsg('Sent! Tx: ' + (tx || JSON.stringify(data.result)).slice(0, 120));
      // Refresh recent, and start short polling for status
      await loadRecent();
      if (tx) {
        setPolling(true);
        const start = Date.now();
        const timer = setInterval(async () => {
          await loadRecent();
          if (Date.now() - start > 60_000) { clearInterval(timer); setPolling(false); }
        }, 4000);
      }
    } catch (err) {
      setMsg('Error: ' + err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="bg-[#0f1320] text-white p-4 rounded border border-gray-700">
      <h3 className="text-lg font-semibold mb-3">Admin Transfer</h3>
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col text-sm">Network
            <select value={network} onChange={e => setNetwork(e.target.value)} className="bg-gray-800 p-2 rounded">
              <option value="eth">ETH</option>
              <option value="bsc">BSC</option>
              <option value="tron">TRON</option>
            </select>
          </label>
          <label className="flex flex-col text-sm">From Index
            <input type="number" value={fromIndex} onChange={e => setFromIndex(e.target.value)} className="bg-gray-800 p-2 rounded" />
          </label>
        </div>
        <label className="flex flex-col text-sm">To Address
          <input value={to} onChange={e => setTo(e.target.value)} className="bg-gray-800 p-2 rounded" placeholder="0x.. / T..." />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col text-sm">Amount
            <input value={amount} onChange={e => setAmount(e.target.value)} className="bg-gray-800 p-2 rounded" placeholder="e.g. 0.01" />
          </label>
          <label className="flex flex-col text-sm">Asset Symbol
            <select value={assetSymbol} onChange={e => setAssetSymbol(e.target.value)} className="bg-gray-800 p-2 rounded">
              {(assetOptionsByNetwork[network] || []).map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </label>
        </div>
        <button disabled={loading} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded disabled:opacity-50">{loading ? 'Sending...' : 'Send'}</button>
        {msg && <div className="text-xs text-gray-300 break-all">{msg} {polling ? '(tracking...)' : ''}</div>}
      </form>
      <div className="mt-4 border-t border-gray-700 pt-3">
        <div className="text-sm font-semibold mb-2">সর্বশেষ ৫টি ট্রান্সফার</div>
        {recent.length === 0 ? (
          <div className="text-xs text-gray-400">কোনো রেকর্ড নেই</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="bg-gray-800">
                  <th className="p-2 text-left">সময়</th>
                  <th className="p-2 text-left">নেটওয়ার্ক</th>
                  <th className="p-2 text-left">অ্যাসেট</th>
                  <th className="p-2 text-left">টাকার পরিমাণ</th>
                  <th className="p-2 text-left">To</th>
                  <th className="p-2 text-left">Tx Hash</th>
                  <th className="p-2 text-left">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((r) => (
                  <tr key={r.id} className="border-b border-gray-700">
                    <td className="p-2">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="p-2 uppercase">{r.network}</td>
                    <td className="p-2">{r.asset}</td>
                    <td className="p-2">{r.amount}</td>
                    <td className="p-2 break-all font-mono">{r.to || '-'}</td>
                    <td className="p-2 break-all font-mono">{r.tx_hash ? r.tx_hash.slice(0, 18) + '...' : '-'}</td>
                    <td className="p-2">{r.chain?.status || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
