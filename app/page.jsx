"use client";
import React, { useState } from 'react';
import { AuthProvider } from '../lib/AuthContext';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

import HamburgerMenu from './components/HamburgerMenu';
import LiveChat from './components/LiveChat';
import LiveTradingChart from './components/LiveTradingChart';
import TradingPanel from './components/TradingPanel';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('trade');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(115000);
  const [selectedAsset, setSelectedAsset] = useState('BTCUSDT');

  const handleMenuToggle = () => setSidebarOpen((prev) => !prev);
  
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen bg-main text-main">
        <div className="flex items-center">
          <div className="md:hidden block p-2">
            <HamburgerMenu isOpen={sidebarOpen} onToggle={handleMenuToggle} />
          </div>
          <Header setCurrentPage={setCurrentPage} />
        </div>
  <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: always visible on md+, toggled on mobile */}
  <div className={`z-40 ${sidebarOpen ? 'block fixed top-0 left-0 h-full' : 'hidden'} md:block transition-transform duration-300`}>
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
        {/* Overlay for mobile menu */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={handleMenuToggle}></div>
        )}
        
        {/* Main Content Area */}
        {currentPage === 'trade' ? (
          <div className="flex-1 flex flex-col md:flex-row bg-main overflow-hidden h-full">
            <div className="flex-1 flex flex-col">
              <LiveTradingChart 
                onPriceUpdate={setCurrentPrice}
                onAssetChange={setSelectedAsset}
              />
            </div>
            <TradingPanel 
              currentPrice={currentPrice}
              selectedAsset={selectedAsset}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-auto">
            <MainContent currentPage={currentPage} />
          </div>
        )}
      </div>
      {/* Live Chat Component */}
      <LiveChat />
    </div>
    </AuthProvider>
  );
}
