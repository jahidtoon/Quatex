"use client";

import { useState } from 'react';
import MainAppLayout from '../components/MainAppLayout';
import CandlestickChart from '../../components/chart/CandlestickChart.jsx';

const INTERVALS = ['1m', '5m', '15m', '1h', '4h', '1d'];

export default function TradePage() {
  const [symbol, setSymbol] = useState('EUR_USD');
  const [interval, setInterval] = useState('1m');

  return (
    <MainAppLayout>
      <div className="p-4 space-y-4">
        <h1 className="text-xl font-semibold">Trading Interface</h1>
        <div className="flex items-center gap-3">
          <label className="text-sm">Symbol</label>
          <input
            className="border rounded px-2 py-1 bg-transparent"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="EUR_USD or bitcoin"
          />
          <label className="text-sm">Interval</label>
          <select
            className="border rounded px-2 py-1 bg-transparent"
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
          >
            {INTERVALS.map(i => (<option key={i} value={i}>{i}</option>))}
          </select>
        </div>
        <CandlestickChart symbol={symbol} interval={interval} height={480} className="border rounded" />
        <p className="text-sm text-gray-400">Tip: Use EUR_USD for forex (local store) or bitcoin for crypto (CoinGecko).</p>
      </div>
    </MainAppLayout>
  );
}
 
