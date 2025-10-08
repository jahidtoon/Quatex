"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import MainAppLayout from './components/MainAppLayout';
import MainContent from './components/MainContent';
import TradingPanel from './components/TradingPanel';
import { useOpenTrades } from '@/lib/useOpenTrades';

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
  const { trades: openTrades, refresh: refreshOpenTrades } = useOpenTrades({ pollMs: 15000, limit: 40 });

  // Price update handler for real-time sync between chart and trading panel
  const handlePriceUpdate = (price) => {
    setCurrentPrice(price);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <MainAppLayout currentPage={currentPage} onPageChange={handlePageChange}>
      {currentPage === 'trade' ? (
        <div className="flex-1 flex flex-col md:flex-row bg-main overflow-hidden h-full min-h-0 min-w-0">
          <div className="flex-1 flex flex-col min-h-0 min-w-0">
            {/* Chart Container */}
            <div className="flex-1 bg-[#0b0f16] relative overflow-hidden min-h-0 min-w-0">
              <CandlestickChart 
                symbol={selectedAsset}
                onPriceUpdate={handlePriceUpdate}
                onSymbolChange={setSelectedAsset}
                height="100%"
                openTrades={openTrades}
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
