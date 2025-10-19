"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MainAppLayout from './components/MainAppLayout';
import MainContent from './components/MainContent';
import TradingPanel from './components/TradingPanel';
import { useOpenTrades } from '@/lib/useOpenTrades';
import TopPairsTabs from '@/components/trading-chart/TopPairsTabs';
import PairSelectorModal from '@/components/trading-chart/PairSelectorModal';

// Dynamic import for CandlestickChart to prevent SSR issues
const CandlestickChart = dynamic(
  () => import(/* webpackChunkName: "candlestick-chart" */ '@/components/trading-chart/CandlestickChart').then(m => m.default),
  { 
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-gray-900 flex items-center justify-center">
      <div className="text-center text-gray-400">
        <div className="text-6xl mb-4">📊</div>
        <h2 className="text-xl font-semibold mb-2">Loading Chart...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    </div>
  )
}
);

export default function Home() {
  const [currentPage, setCurrentPage] = useState('trade');
  const [currentPrice, setCurrentPrice] = useState(115000);
  const [selectedAsset, setSelectedAsset] = useState('ETHUSDT');
  const [openSelector, setOpenSelector] = useState(false);
  const [topPairs, setTopPairs] = useState([]); // active tabs list
  const [allAssets, setAllAssets] = useState([]); // full list for modal
  const { trades: openTrades, refresh: refreshOpenTrades } = useOpenTrades({ pollMs: 15000, limit: 40 });

  // Price update handler for real-time sync between chart and trading panel
  const handlePriceUpdate = (price) => {
    setCurrentPrice(price);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Load assets list once for selector/tabs
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/trades/assets');
        const data = await res.json();
        const assets = Array.isArray(data.assets) ? data.assets : [];
        if (!cancelled) {
          setAllAssets(assets);
          // Ensure selected asset present as first tab
          const unique = [];
          const seen = new Set();
          const seed = assets.filter(a => a && a.symbol);
          // prioritize selectedAsset at front
          const selectedInfo = seed.find(a => a.symbol === selectedAsset);
          if (selectedInfo) { unique.push(selectedInfo); seen.add(selectedInfo.symbol); }
          for (const a of seed) {
            if (!seen.has(a.symbol)) { unique.push(a); seen.add(a.symbol); }
            if (unique.length >= 12) break; // keep it compact
          }
          setTopPairs(unique);
        }
      } catch {}
    }
    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <MainAppLayout currentPage={currentPage} onPageChange={handlePageChange}>
      {currentPage === 'trade' ? (
        <div className="flex-1 flex flex-col md:flex-row bg-main overflow-hidden h-full min-h-0 min-w-0">
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            {/* Chart Container */}
            <TopPairsTabs
              pairs={topPairs}
              selected={selectedAsset}
              onSelect={(sym) => setSelectedAsset(sym)}
              onOpenSelector={() => setOpenSelector(true)}
              onClose={(sym) => setTopPairs((prev) => prev.filter(p => p.symbol !== sym))}
            />
            <div className="flex-1 bg-[#0b0f16] relative overflow-hidden min-h-0 min-w-0">
              <CandlestickChart 
                symbol={selectedAsset}
                onPriceUpdate={handlePriceUpdate}
                onSymbolChange={setSelectedAsset}
                showSymbolPicker={false}
                height="100%"
                openTrades={openTrades}
              />
              {/* Pair selector modal inside chart container so it aligns within chart area */}
              <PairSelectorModal
                open={openSelector}
                onClose={() => setOpenSelector(false)}
                pairs={allAssets.length ? allAssets : topPairs}
                selected={selectedAsset}
                onSelect={(sym) => {
                  setSelectedAsset(sym);
                  setOpenSelector(false);
                  setTopPairs((prev) => {
                    if (prev.find(p => p.symbol === sym)) return prev;
                    const found = allAssets.find(a => a.symbol === sym);
                    const nextItem = found || { symbol: sym, display: sym.replace('_','/'), type: sym.includes('_') ? 'FOREX' : 'CRYPTO', payout: 80 };
                    return [nextItem, ...prev].slice(0, 12);
                  });
                }}
              />
            </div>
          </div>
          <TradingPanel 
            currentPrice={currentPrice}
            selectedAsset={selectedAsset}
            onAssetChange={setSelectedAsset}
            onTradeExecuted={refreshOpenTrades}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <MainContent currentPage={currentPage} />
        </div>
      )}
    </MainAppLayout>
  );
}
