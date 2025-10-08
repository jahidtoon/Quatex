"use client";
import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import HamburgerMenu from './HamburgerMenu';
import LiveChat from './LiveChat';

export default function MainAppLayout({ children, currentPage: propCurrentPage, onPageChange: propOnPageChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Determine current page from props or pathname
  const getCurrentPageFromPath = (path) => {
    if (path === '/') return 'trade';
    return path.split('/')[1] || 'trade';
  };

  const currentPage = propCurrentPage || getCurrentPageFromPath(pathname);

  const handleMenuToggle = () => setSidebarOpen((prev) => !prev);

  const handlePageChange = (page) => {
    if (propOnPageChange) {
      propOnPageChange(page);
    } else {
      // Navigate to the appropriate route using Next.js router for client-side navigation
      if (page === 'trade') {
        router.push('/');
      } else {
        router.push(`/${page}`);
      }
    }
    setSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
      <div className="flex flex-col h-screen bg-main text-main">
        <div className="flex items-center">
          <div className="md:hidden block p-2">
            <HamburgerMenu isOpen={sidebarOpen} onToggle={handleMenuToggle} />
          </div>
          <Header setCurrentPage={handlePageChange} />
        </div>
  <div className="flex flex-1 overflow-hidden min-h-0 min-w-0">
          {/* Sidebar: always visible on md+, toggled on mobile */}
          <div
            className={`z-40 ${sidebarOpen ? 'block fixed top-0 left-0 h-full' : 'hidden'} md:block md:relative md:top-auto md:left-auto md:h-full transition-transform duration-300 flex-shrink-0`}
          >
            <Sidebar currentPage={currentPage} setCurrentPage={handlePageChange} />
          </div>
          {/* Overlay for mobile menu */}
          {sidebarOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden" onClick={handleMenuToggle}></div>
          )}

          {/* Main Content Area */}
          <div className="flex-1 overflow-auto md:ml-0 min-h-0 min-w-0">
            {children}
          </div>
        </div>
        {/* Live Chat Component - Removed as requested */}
        {/* <LiveChat /> */}
      </div>
  );
}