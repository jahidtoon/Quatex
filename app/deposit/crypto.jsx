"use client";
import React, { useEffect, useState, useCallback } from 'react';
import QRCode from 'qrcode';

async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const headers = { ...(options.headers || {}), Authorization: `Bearer ${token}` };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export default function CryptoDeposit() {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [session, setSession] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingAssets, setLoadingAssets] = useState(false);

  useEffect(() => {
    async function loadAssets() {
      setLoadingAssets(true);
      try {
        const res = await fetch('/api/crypto-assets');
        const data = res.ok ? await res.json() : [];
        setAssets(data || []);
      } catch (e) { /* ignore */ }
      setLoadingAssets(false);
    }
    loadAssets();
    loadHistory();
  }, []);

  const loadHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) { setLoadingHistory(false); return; }
      const res = await fetch('/api/deposits/history?limit=15', { headers: { Authorization: `Bearer ${token}` } });
      const data = res.ok ? await res.json() : [];
      setHistory(data);
    } catch (e) { /* ignore */ }
    setLoadingHistory(false);
  }, []);

  const startCountdown = useCallback((expiresAt) => {
    function tick() {
      const diff = new Date(expiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`);
      requestAnimationFrame(tick);
    }
    tick();
  }, []);

  async function createSession() {
    if (!selectedAsset) return;
    setError(null);
    try {
      const body = { assetId: selectedAsset.id };
  const data = await fetchWithAuth('/api/deposits/session', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } });
      setSession(data);
      startCountdown(data.expiresAt);
      try {
        const qr = await QRCode.toDataURL(data.address, { width: 180 });
        setQrDataUrl(qr);
      } catch (qrErr) {
        console.warn('QR generation failed', qrErr);
        setQrDataUrl(null);
      }
      setPolling(true);
      // reload history after slight delay
      setTimeout(loadHistory, 1000);
    } catch (e) {
      try {
        // attempt to read raw response if available (fetchWithAuth already threw)
        const resp = await fetch('/api/deposits/session'); // will 400, ignore
      } catch(_) {}
      setError('সেশন তৈরি ব্যর্থ - টোকেন আছে কিনা চেক করুন / পুনরায় লগইন করুন');
    }
  }

  useEffect(() => {
    if (!polling || !session) return;
    let stop = false;
    async function poll() {
      try {
        const data = await fetchWithAuth(`/api/deposits/session/${session.id}`);
        setSession(data);
        if (['CONFIRMED','EXPIRED','LATE_CONFIRMED'].includes(data.status)) {
          setPolling(false);
        } else if (!stop) {
          setTimeout(poll, 5000);
        }
      } catch (e) { if (!stop) setTimeout(poll, 8000); }
    }
    poll();
    return () => { stop = true; };
  }, [polling, session]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">ক্রিপ্টো ডিপোজিট (৩০ মিনিট সীমা)</h2>
      <div>
        {loadingAssets ? (
          <div className="text-sm text-gray-400">অ্যাসেট লোড হচ্ছে...</div>
        ) : assets.length === 0 ? (
          <div className="text-sm text-red-400">কোনো অ্যাকটিভ ক্রিপ্টো অ্যাসেট পাওয়া যায়নি।</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {assets.map(a => (
              <button key={a.id} onClick={() => setSelectedAsset(a)} className={`border rounded p-3 text-left hover:border-blue-400 transition ${selectedAsset?.id===a.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'}`}>
                <div className="font-semibold">{a.symbol}</div>
                <div className="text-xs text-gray-400">{a.network}</div>
              </button>
            ))}
          </div>
        )}
        <button disabled={!selectedAsset} onClick={createSession} className="mt-4 px-4 py-2 bg-blue-600 disabled:opacity-40 rounded">সেশন শুরু</button>
      </div>
      {error && <div className="text-red-400 text-sm">{error}</div>}
      {session && (
        <div className="border rounded p-4 space-y-3 bg-neutral-800/40">
          <div className="flex items-center justify-between">
            <div className="font-semibold">স্ট্যাটাস: <span className="text-blue-300">{session.status}</span></div>
            <div className="text-sm">টাইমার: {timeLeft}</div>
          </div>
          <div className="text-xs break-all">অ্যাড্রেস: {session.address}</div>
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="qr" className="w-36 h-36" />
          ) : (
            <div className="text-xs text-yellow-400">QR লোড হয়নি – অ্যাড্রেস কপি করে ব্যবহার করুন।</div>
          )}
          <div className="text-xs text-gray-400">একটু সময় নিয়ে নেটওয়ার্ক ফি যাচাই করুন।</div>
        </div>
      )}
      <div className="border rounded p-4 bg-neutral-800/40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">সাম্প্রতিক ডিপোজিট</h3>
          <button onClick={loadHistory} className="text-xs text-blue-400 hover:underline">রিফ্রেশ</button>
        </div>
        {loadingHistory ? (
          <div className="text-xs text-gray-400">লোড হচ্ছে...</div>
        ) : history.length === 0 ? (
          <div className="text-xs text-gray-500">কোনো ডিপোজিট সেশন নেই</div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {history.map(h => (
              <div key={h.id} className="text-xs flex justify-between gap-2 border-b border-neutral-700 pb-1">
                <div className="truncate w-1/2" title={h.id}>{h.symbol}/{h.network}</div>
                <div className="w-1/4 text-center">
                  {h.status === 'CONFIRMED' && <span className="text-green-400">CONFIRMED</span>}
                  {h.status === 'LATE_CONFIRMED' && <span className="text-amber-400">LATE</span>}
                  {h.status === 'FAILED' && <span className="text-red-400">FAILED</span>}
                  {h.status === 'PENDING' && <span className="text-blue-300">PENDING</span>}
                  {h.status === 'DETECTED' && <span className="text-purple-300">DETECTED</span>}
                  {h.status === 'EXPIRED' && <span className="text-gray-400">EXPIRED</span>}
                </div>
                <div className="w-1/4 text-right">{h.amount || '-'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
