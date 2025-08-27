"use client";
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import AdminSidebar from './AdminSidebar';
import SidebarHamburger from '@/app/components/SidebarHamburger';

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(false); // mobile drawer state
  const [desktopOpen, setDesktopOpen] = useState(true); // desktop collapse state
  const firstFocusRef = useRef(null);
  const pathname = usePathname();
  
  // Don't show sidebar for login page
  const isLoginPage = pathname === '/admin/login';
  
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  // If it's login page, just return children without sidebar
  if (isLoginPage) {
    return children;
  }

  return (
    <div className="min-h-screen bg-[#0f1320] text-white flex">
      {/* Sidebar */}
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} aria-hidden="true"></div>
      )}
      <div className={`${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static fixed z-50 inset-y-0 left-0 transition-transform duration-300 ${desktopOpen ? 'md:block' : 'md:hidden'}` }>
        <AdminSidebar
          className="h-full"
          onNavigate={() => setOpen(false)}
          isOpen={desktopOpen}
          onToggle={() => setDesktopOpen((v) => !v)}
        />
      </div>
      {/* Main */}
      <main className={`flex-1 p-6 ${desktopOpen ? 'md:ml-0' : ''}`}>
        <div className="mb-4 md:hidden">
          <SidebarHamburger isOpen={open} onToggle={() => setOpen((v) => !v)} />
        </div>
        {/* Floating reopen button on desktop when sidebar is hidden */}
        {!desktopOpen && (
          <div className="hidden md:block fixed top-1/2 -translate-y-1/2 left-0 z-40">
            <div className="pl-1">
              <SidebarHamburger
                variant="chevron"
                direction="right"
                isOpen={false}
                size="md"
                onToggle={() => setDesktopOpen(true)}
                aria-controls="admin-sidebar"
                aria-label="Open sidebar"
                className="rounded-r-md border border-[#2b314c] bg-[#1a1f33] hover:bg-[#232945]"
              />
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
