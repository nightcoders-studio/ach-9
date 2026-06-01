'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface NotionShellProps {
  children: React.ReactNode;
  breadcrumbs: string[];
}

export default function NotionShell({ children, breadcrumbs }: NotionShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  const getRoleLabel = (role: string) => {
    if (role === 'buter') return 'Superhero';
    if (role === 'customer') return 'Customer';
    return role.toUpperCase();
  };

  // Sidebar items
  const menuItems = [
    {
      label: 'Temukan Tugas',
      href: '/tasks',
      icon: (
        <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      label: 'Dasbor Saya',
      href: '/dashboard',
      icon: (
        <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
    },
  ];

  // Show "Buat Tugas" only if customer or admin
  const showCreateTask = currentUser?.role === 'customer' || currentUser?.role === 'admin';

  return (
    <div className="min-h-screen flex bg-white text-slate-900 font-sans antialiased">
      {/* Sidebar - Desktop & Tablet */}
      <aside
        className={`bg-[#f9fafb] border-r border-slate-200 flex-col justify-between w-60 fixed h-full z-40 transition-transform duration-200 ease-in-out md:flex ${
          isSidebarOpen ? 'translate-x-0 flex' : '-translate-x-full md:translate-x-0 hidden'
        }`}
      >
        <div className="flex flex-col flex-1 py-4.5 px-3.5 space-y-6">
          {/* User Profile Workspace Switcher */}
          <div className="flex items-center gap-3 px-2 py-1.5 hover:bg-slate-200/50 rounded-lg cursor-pointer transition duration-150">
            <div className="w-8 h-8 rounded-md bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-sm">
              {currentUser?.full_name ? currentUser.full_name.charAt(0) : 'M'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-800 truncate">
                {currentUser?.full_name || 'Mitabut Workspace'}
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                {currentUser?.role ? getRoleLabel(currentUser.role) : 'Guest'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Workspace</span>
            
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition duration-150 ${
                    isActive
                      ? 'bg-slate-200/60 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}

            {showCreateTask && (
              <Link
                href="/tasks/create"
                className={`flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition duration-150 ${
                  pathname === '/tasks/create'
                    ? 'bg-slate-200/60 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900'
                }`}
              >
                <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Buat Tugas Baru
              </Link>
            )}

            <Link
              href="/settings"
              className={`flex items-center px-2.5 py-1.5 rounded-md text-xs font-medium transition duration-150 ${
                pathname === '/settings'
                  ? 'bg-slate-200/60 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:bg-slate-200/40 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4 mr-2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Pengaturan Profil
            </Link>
          </nav>
        </div>

        {/* Sidebar Footer / Logout */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-500 hover:bg-slate-200/50 hover:text-slate-800 transition duration-150"
          >
            <span>Keluar Sesi</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col md:pl-60 min-h-screen">
        {/* Top Minimal Bar */}
        <header className="h-11 border-b border-slate-200 flex items-center justify-between px-6 bg-white/70 backdrop-blur-md sticky top-0 z-30">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-1 mr-1 hover:bg-slate-100 rounded transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" className="hover:text-slate-800 transition-colors">mitabut</Link>
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={idx}>
                <span className="text-slate-300">/</span>
                <span className={idx === breadcrumbs.length - 1 ? 'text-slate-800 font-semibold' : 'hover:text-slate-800 transition-colors'}>
                  {bc}
                </span>
              </React.Fragment>
            ))}
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <Link href="/" className="hover:text-slate-900 transition-colors">Halaman Depan</Link>
          </div>
        </header>

        {/* Content Container (Center aligned with max-width 750px and whitespace-heavy) */}
        <main className="flex-1 py-14 px-6 md:px-8">
          <div className="max-w-[750px] mx-auto space-y-12">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 md:hidden"
        ></div>
      )}
    </div>
  );
}
