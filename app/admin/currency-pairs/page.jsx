"use client";
import { useState } from 'react';

export default function CurrencyPairsPage() {
  const [pairs, setPairs] = useState([
    { id: 1, base: 'EUR', quote: 'USD', enabled: true },
    { id: 2, base: 'GBP', quote: 'USD', enabled: true },
    { id: 3, base: 'AUD', quote: 'CHF', enabled: true },
  ]);
  const [base, setBase] = useState('');
  const [quote, setQuote] = useState('');

  const addPair = () => {
    if (!base || !quote) return;
    setPairs(prev => [...prev, { id: Date.now(), base: base.toUpperCase(), quote: quote.toUpperCase(), enabled: true }]);
    setBase('');
    setQuote('');
  };

  const toggleEnabled = (id) => {
    setPairs(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  const removePair = (id) => setPairs(prev => prev.filter(p => p.id !== id));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Currency Pairs</h1>

      <div className="bg-[#151a2e] p-4 rounded border border-[#262b40] mb-6">
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-sm text-gray-400">Base</label>
            <input value={base} onChange={e=>setBase(e.target.value)} className="bg-[#0f1320] border border-[#262b40] rounded px-3 py-2" placeholder="e.g. EUR" />
          </div>
          <div>
            <label className="block text-sm text-gray-400">Quote</label>
            <input value={quote} onChange={e=>setQuote(e.target.value)} className="bg-[#0f1320] border border-[#262b40] rounded px-3 py-2" placeholder="e.g. USD" />
          </div>
          <button onClick={addPair} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded">Add</button>
        </div>
      </div>

      <div className="bg-[#151a2e] rounded border border-[#262b40] overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-[#101429] text-gray-300">
            <tr>
              <th className="px-4 py-3">Pair</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map(p => (
              <tr key={p.id} className="border-t border-[#262b40]">
                <td className="px-4 py-3 font-semibold">{p.base}/{p.quote}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs ${p.enabled ? 'bg-green-600' : 'bg-gray-600'}`}>
                    {p.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={()=>toggleEnabled(p.id)} className="mr-2 px-3 py-1 bg-[#0f1320] border border-[#262b40] rounded hover:bg-[#182043]">Toggle</button>
                  <button onClick={()=>removePair(p.id)} className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
