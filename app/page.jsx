"use client";
import React, { useState } from 'react';

import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import HamburgerMenu from './components/HamburgerMenu';
import LiveChat from './components/LiveChat';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('trade');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex flex-col h-screen bg-main text-main">
      <div className="flex items-center">
        <div className="md:hidden block p-2">
          <HamburgerMenu isOpen={sidebarOpen} onToggle={handleMenuToggle} />
        </div>
        <Header setCurrentPage={setCurrentPage} />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: always visible on md+, toggled on mobile */}
        <div className={`z-40 ${sidebarOpen ? 'block fixed top-0 left-0 h-full' : 'hidden'} md:block`}> 
          <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
        {/* Overlay for mobile menu */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={handleMenuToggle}></div>
        )}
        <div className="flex-1 flex bg-main overflow-y-auto">
          <MainContent currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
      </div>
      {/* Live Chat Component */}
      <LiveChat />
    </div>
  );
}
