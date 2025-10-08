"use client";
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useOpenTrades } from '@/lib/useOpenTrades';
import dynamic from 'next/dynamic';

const CandlestickChart = dynamic(() => import('../../components/trading-chart/CandlestickChart'), { ssr: false });

export default function ChartPage() {
  const { token, isAuthenticated } = useAuth();
  const [placing, setPlacing] = useState(false);
  const { trades: openTrades, refresh: refreshOpenTrades } = useOpenTrades({ pollMs: 5000, limit: 40 });

  return (
    <main style={{minHeight:'100vh',height:'100vh',background:'#10131a',padding:0,margin:0}}>
      <CandlestickChart openTrades={openTrades} authToken={token} />
      {/* Debug small overlay */}
      <div style={{position:'absolute',top:4,left:4,fontSize:11,color:'#6ee7b7',background:'rgba(0,0,0,0.4)',padding:'2px 6px',borderRadius:4}}>
        auth:{isAuthenticated? 'yes':'no'} | trades:{openTrades.length}
      </div>
      <div style={{position:'absolute',top:4,right:4,fontSize:10,color:'#9ca3af'}}>
        <button onClick={refreshOpenTrades} style={{background:'#1f2937',padding:'4px 8px',borderRadius:4}}>↻ refresh</button>
        {isAuthenticated && token && (
          <button
            onClick={async () => {
              if (placing) return; setPlacing(true);
              try {
                const priceRes = await fetch('/api/klines?symbol=ETHUSDT&interval=1s&limit=1');
                let price = 0;
                if (priceRes.ok) {
                  const rows = await priceRes.json();
                  if (Array.isArray(rows) && rows.length) {
                    const last = rows[rows.length - 1];
                    price = Number(last.close || last[4] || 0);
                  }
                }
                if (!price) price = 1000 + Math.random()*100;
                const res = await fetch('/api/trades', {
                  method: 'POST',
                  headers: { 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
                  body: JSON.stringify({ symbol: 'ETHUSDT', amount: 10, duration: 120, direction: 'BUY', price })
                });
                const data = await res.json();
                if (!res.ok) {
                  console.warn('[dev-trade] fail', data);
                } else {
                  console.log('[dev-trade] created', data.trade);
                  refreshOpenTrades();
                }
              } catch (e) {
                console.error('[dev-trade] error', e);
              } finally { setPlacing(false); }
            }}
            style={{background:'#2563eb',padding:'4px 8px',borderRadius:4,marginLeft:6,color:'#fff'}}
          >{placing? '…':'+ test trade'}</button>
        )}
      </div>
    </main>
  );
}