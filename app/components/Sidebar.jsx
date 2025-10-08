"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import SidebarHamburger from './SidebarHamburger';
import { menuIcons } from './SidebarIcons';

const SidebarLink = ({ page, currentPage, setCurrentPage, showLabel, extraClasses = '', badge, collapsed }) => {
  const { icon, color, label } = menuIcons[page] || {};
  const router = useRouter();
  
  const handleClick = (e) => {
    e.preventDefault();
    
    // For certain pages, navigate to their dedicated routes instead of using MainContent
    const dedicatedRoutes = [
      'analytics', 'top', 'support', 'account', 
      'tournaments', 'p2p', 'deposit', 'withdrawal', 
      'transactions', 'settings', 'join-us', 'signals',
      'leaderboard', 'affiliate'
    ];
    
    if (dedicatedRoutes.includes(page)) {
      // Navigate to dedicated page route using Next.js router for client-side navigation
      router.push(`/${page}`);
    } else {
      // Use existing MainContent system for trade and other pages
      if (page === 'trade') {
        router.push('/');
      } else {
        setCurrentPage(page);
      }
    }
  };

  return (
    <a
      onClick={handleClick}
      href="#"
      title={!showLabel && label ? label : undefined}
      className={`sidebar-link flex flex-col items-center justify-center ${collapsed ? 'py-2' : 'py-3'} font-semibold transition-colors ${currentPage === page ? 'active' : ''} ${extraClasses}`}
    >
      <div className="relative flex flex-col items-center">
        <i className={`fas ${icon} icon text-2xl ${currentPage === page ? 'text-white' : color || 'text-main'}`} />
        {badge && (
          <span className="absolute -top-1 -right-2 bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">{badge}</span>
        )}
        {showLabel && label && <span className={`mt-1 text-xs font-semibold tracking-tight ${currentPage === page ? 'text-white' : 'text-main'}`}>{label}</span>}
      </div>
    </a>
  );
};

const Sidebar = ({ currentPage, setCurrentPage }) => {
  const [muted, setMuted] = useState(false);
  const [expanded, setExpanded] = useState(true);

  // Fullscreen handler
  const handleFullscreen = () => {
    if (typeof document !== 'undefined') {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        document.documentElement.requestFullscreen();
      }
    }
  };

  // Back handler
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  // Sound handler
  const handleSound = () => {
    setMuted((prev) => !prev);
  };

  const navItems = [
    { page: 'trade' },
    { page: 'analytics' },
    { page: 'top' },
    { page: 'tournaments', badge: 4 },
    { page: 'p2p' },
    { page: 'affiliate' },
  ];

  const bottomMenu = [
    { page: 'deposit' },
    { page: 'withdrawal' },
    { page: 'transactions' },
  ];

  return (
  <aside className={`transition-all duration-300 bg-[#1a2036] h-full min-h-0 flex flex-col justify-between items-center py-4 ${expanded ? 'overflow-hidden' : 'overflow-y-hidden'} ${expanded ? 'w-32 md:w-40' : 'w-14'}`}>
      {/* Hamburger always visible at top */}
      <div className="w-full flex justify-center items-center mb-4 flex-shrink-0">
        <SidebarHamburger isOpen={expanded} onToggle={() => setExpanded((prev) => !prev)} />
      </div>
      <div className={`flex flex-col items-center gap-3 flex-1 w-full min-h-0 ${expanded ? 'overflow-y-auto' : 'overflow-visible'} transition-all duration-300 ${expanded ? 'px-2' : 'px-0'}`}>
        {navItems.map(item => (
          <SidebarLink
            key={item.page}
            page={item.page}
            badge={item.badge}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            showLabel={expanded}
            collapsed={!expanded}
            extraClasses={item.page === 'market' ? 'bg-blue-600 text-white shadow-lg' : ''}
          />
        ))}
      </div>
      <div className={`w-full flex flex-col items-center border-t border-gray-700 pt-4 gap-2 transition-all duration-300 flex-shrink-0 ${expanded ? 'px-2' : 'px-0'}`}>
        {/* Footer round icon buttons */}
        <div className={`flex ${expanded ? 'flex-row' : 'flex-col'} items-center justify-center gap-2 mb-2`}>
          <button
            className="w-8 h-8 bg-[#23283a] rounded-full flex items-center justify-center text-gray-300 hover:bg-[#31374a] transition"
            title="Fullscreen"
            onClick={handleFullscreen}
          >
            <i className="fas fa-expand-arrows-alt"></i>
          </button>
          <button
            className="w-8 h-8 bg-[#23283a] rounded-full flex items-center justify-center text-gray-300 hover:bg-[#31374a] transition"
            title="Back"
            onClick={handleBack}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
          <button
            className="w-8 h-8 bg-[#23283a] rounded-full flex items-center justify-center text-gray-300 hover:bg-[#31374a] transition"
            title="Settings"
            onClick={() => setCurrentPage('settings')}
          >
            <i className="fas fa-cog"></i>
          </button>
          <button
            className="w-8 h-8 bg-[#23283a] rounded-full flex items-center justify-center text-gray-300 hover:bg-[#31374a] transition"
            title="Sound"
            onClick={handleSound}
          >
            <i className={`fas ${muted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
          </button>
        </div>
        {/* Join Us button */}
        {expanded ? (
          <button
            onClick={() => setCurrentPage('join-us')}
            className="w-20 h-8 bg-[#23283a] rounded flex items-center justify-center text-xs text-white font-bold mb-1 border border-[#31374a] hover:bg-[#31374a] transition"
          >
            <i className="fas fa-user-plus text-pink-400 mr-2"></i> JOIN US
          </button>
        ) : (
          <button
            onClick={() => setCurrentPage('join-us')}
            className="w-8 h-8 bg-[#23283a] rounded-full flex items-center justify-center text-pink-400 hover:bg-[#31374a] transition"
            title="Join Us"
          >
            <i className="fas fa-user-plus"></i>
          </button>
        )}
        {/* Help button */}
        {expanded ? (
          <button
            onClick={() => setCurrentPage('support')}
            className="w-20 h-8 bg-green-500 rounded flex items-center justify-center text-xs text-white font-bold mb-1 hover:bg-green-600 transition"
          >
            <i className="fas fa-question-circle mr-2"></i> Help
          </button>
        ) : (
          <button
            onClick={() => setCurrentPage('support')}
            className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition"
            title="Help"
          >
            <i className="fas fa-question-circle"></i>
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
