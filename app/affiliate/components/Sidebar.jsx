'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faTimes, faTachometerAlt, faPercentage, faUsers, 
  faLink, faMoneyBillWave, faCog, faSignOutAlt, faHome,
  faHandshake, faGift, faWallet, faBell,
  faUserShield, faFileAlt, faQuestionCircle
} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: faTachometerAlt, href: '/affiliate/dashboard' },
    { id: 'commissions', label: 'Commissions', icon: faPercentage, href: '/affiliate/commissions' },
    { id: 'referrals', label: 'Referrals', icon: faUsers, href: '/affiliate/referrals' },
    { id: 'links', label: 'Affiliate Links', icon: faLink, href: '/affiliate/links' },
    { id: 'withdrawal', label: 'Withdrawal', icon: faMoneyBillWave, href: '/affiliate/withdrawal' },
    { id: 'settings', label: 'Settings', icon: faCog, href: '/affiliate/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('affiliateToken');
    window.location.href = '/affiliate/auth';
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      {/* Mobile Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="w-5 h-5" />
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-[14.4rem] bg-slate-800 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-[1.35rem] border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-[2.25rem] h-[2.25rem] bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <FontAwesomeIcon icon={faHandshake} className="text-white text-[0.9rem]" />
              </div>
              <div>
                <h1 className="text-[1.125rem] font-bold text-white">Affiliate Portal</h1>
                <p className="text-slate-400 text-[0.7875rem]">Quatex Partner</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-[1.35rem]">
            <ul className="space-y-2 px-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={closeSidebar}
                      className={`
                        flex items-center space-x-3 px-[0.9rem] py-[0.675rem] rounded-lg transition-all duration-200 group
                        ${isActive 
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                          : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                        }
                      `}
                    >
                      <FontAwesomeIcon 
                        icon={item.icon} 
                        className={`w-[1.125rem] h-[1.125rem] ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} 
                      />
                      <span className="font-medium text-[0.9rem]">{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User Info & Logout */}
          <div className="p-[0.9rem] border-t border-slate-700">
            <div className="mb-4 p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <img
                  src="https://ui-avatars.com/api/?name=Demo+Affiliate&background=4F46E5&color=fff"
                  alt="Profile"
                  className="w-[2.25rem] h-[2.25rem] rounded-full"
                />
                <div>
                  <p className="text-white font-medium text-[0.9rem]">Demo Affiliate</p>
                  <p className="text-slate-400 text-[0.675rem]">affiliate@example.com</p>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-[0.9rem] py-[0.675rem] text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
            >
              <FontAwesomeIcon icon={faSignOutAlt} className="w-[1.125rem] h-[1.125rem]" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0 transition-all duration-300">
        {children}
      </div>
    </div>
  );
}
