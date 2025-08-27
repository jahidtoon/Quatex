"use client";
import React, { useState } from 'react';
import { useClickOutside } from '../../lib/useClickOutside';

const Header = ({ setCurrentPage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useClickOutside(() => {
    setIsDropdownOpen(false);
  });
  
  const handleLoginClick = () => {
    window.location.href = '/auth/login';
  };

  const handleAccountClick = () => {
    window.location.href = '/account';
  };

  const handleSettingsClick = () => {
    window.location.href = '/settings';
  };

  const handleDepositClick = () => {
    window.location.href = '/deposit';
  };

  const handleWithdrawalClick = () => {
    window.location.href = '/withdrawal';
  };

  return (
    <header className="w-full max-w-none bg-[#2a3142] flex items-center justify-between px-4 py-3 border-b border-gray-700 shadow-lg flex-shrink-0">
      <div className="flex items-center space-x-4">
        <div className="text-white font-bold text-xl">Trading</div>
        <div className="hidden md:block text-gray-400 text-sm font-medium">WEB TRADING PLATFORM</div>
      </div>
      <div className="flex items-center space-x-3">
        <div className="hidden lg:flex items-center bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-2 text-sm">
          <i className="fas fa-gift mr-2 text-green-400" />
          <span className="text-white font-medium">Get a 30% bonus on your first deposit</span>
          <div className="ml-3 bg-green-500 text-white text-xs font-bold rounded px-2 py-1">30%</div>
        </div>
        <div className="flex items-center space-x-2 bg-[#1a2036] px-3 py-2 rounded-lg border border-gray-600">
          <i className="fas fa-graduation-cap text-blue-400" />
          <div>
            <div className="text-xs text-gray-400 font-medium">DEMO ACCOUNT</div>
            <div className="text-white font-bold">$10,000.00</div>
          </div>
        </div>
        <button 
          onClick={handleDepositClick} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 shadow-md"
        >
          <i className="fas fa-plus-circle mr-2" />Deposit
        </button>
        <button 
          onClick={handleWithdrawalClick} 
          className="bg-[#1a2036] hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition duration-300 border border-gray-600"
        >
          Withdrawal
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-user text-gray-300"></i>
            <span className="text-sm">Account</span>
            <i className="fas fa-chevron-down text-xs"></i>
          </button>
          
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50">
              <button 
                onClick={handleAccountClick}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-user mr-2"></i>
                My Account
              </button>
              <button 
                onClick={handleSettingsClick}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors"
              >
                <i className="fas fa-cog mr-2"></i>
                Settings
              </button>
              <hr className="border-gray-700 my-1" />
              <button 
                onClick={handleLoginClick}
                className="block w-full text-left px-4 py-2 hover:bg-gray-700 text-red-400 transition-colors"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Login / Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
