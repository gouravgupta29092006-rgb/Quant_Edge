'use client';

import { useAuthStore } from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';
import { usePathname } from 'next/navigation';

interface HeaderProps { title?: string; }

const TITLES: Record<string, string> = {
  '/dashboard':  'Dashboard',
  '/portfolio':  'Portfolio',
  '/market':     'Market',
  '/watchlist':  'Watchlist',
  '/analytics':  'Analytics',
  '/strategies': 'Strategies',
  '/news':       'News',
  '/settings':   'Settings',
};

export default function DashboardHeader({ title }: HeaderProps) {
  const { user } = useAuthStore();
  const { isConnected } = useMarketStore();
  const pathname = usePathname();

  const pageTitle = title || TITLES[pathname] || 'QuantEdge';
  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between px-6 z-20 sticky top-0"
      style={{
        height: '60px',
        background: 'rgba(5,6,10,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #161C2E',
      }}>
      {/* Page title */}
      <h1 className="text-base font-bold" style={{ fontFamily: 'Outfit, sans-serif', color: '#F0F4FF' }}>
        {pageTitle}
      </h1>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Live status pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
          style={{
            background: isConnected ? 'rgba(0,211,149,0.08)' : 'rgba(78,90,122,0.1)',
            border: `1px solid ${isConnected ? 'rgba(0,211,149,0.2)' : 'rgba(78,90,122,0.2)'}`,
          }}>
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isConnected ? 'live-dot' : ''}`}
            style={{ background: isConnected ? '#00D395' : '#4E5A7A' }} />
          <span className="text-xs font-semibold" style={{ color: isConnected ? '#00D395' : '#4E5A7A' }}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Search */}
        <button
          id="header-search-btn"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all duration-150"
          style={{ background: '#0C0E15', border: '1px solid #161C2E', color: '#4E5A7A' }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
            e.currentTarget.style.color = '#8896B3';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = '#161C2E';
            e.currentTarget.style.color = '#4E5A7A';
          }}>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline text-xs">Search stocks…</span>
          <kbd className="hidden sm:inline-block text-xs px-1.5 py-0.5 rounded-md font-mono"
            style={{ background: '#161C2E', border: '1px solid #1F2744', color: '#4E5A7A' }}>
            ⌘K
          </kbd>
        </button>

        {/* Notifications */}
        <button
          id="header-notifications-btn"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-150"
          style={{ color: '#4E5A7A' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#161C2E'; e.currentTarget.style.color = '#8896B3'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4E5A7A'; }}>
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Unread dot */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: '#818CF8', boxShadow: '0 0 6px rgba(99,102,241,0.7)' }} />
        </button>

        {/* User avatar */}
        <div
          id="header-avatar"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-all duration-150"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            boxShadow: '0 0 12px rgba(99,102,241,0.4)',
            fontFamily: 'Outfit, sans-serif',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 0 20px rgba(99,102,241,0.6)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 12px rgba(99,102,241,0.4)')}>
          {initials}
        </div>
      </div>
    </header>
  );
}
