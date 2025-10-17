"use client";
import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';

export default function AffiliateLayout({ children }) {
  const pathname = usePathname();

  // Only show sidebar on dashboard-related routes
  const sidebarPrefixes = [
    '/affiliate/dashboard',
    '/affiliate/commissions',
    '/affiliate/referrals',
    '/affiliate/links',
    '/affiliate/withdrawal',
    '/affiliate/settings',
  ];

  const showSidebar = sidebarPrefixes.some((p) => pathname?.startsWith(p));

  return showSidebar ? <Sidebar>{children}</Sidebar> : children;
}
