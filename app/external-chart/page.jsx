"use client";
import dynamic from 'next/dynamic';

const CandlestickChartPro = dynamic(() => import('../../components/externalChart/CandlestickChartPro'), { ssr: false });

export default function ExternalChartPage() {
  return (
    <main style={{ minHeight: '100vh', height: '100vh', background: '#10131a', padding: 0, margin: 0 }}>
      <CandlestickChartPro />
    </main>
  );
}
