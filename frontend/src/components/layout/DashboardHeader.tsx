'use client';

import { useAuthStore } from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';

interface HeaderProps {
  title?: string;
}

export default function DashboardHeader({ title }: HeaderProps) {
  const { user } = useAuthStore();
  const { isConnected } = useMarketStore();

  return (
    <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--border)] bg-[var(--bg-primary)] sticky top-0 z-30">
      {/* Page title */}
      <h1 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Live feed status */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success animate-pulse-dot' : 'bg-[var(--text-muted)]'}`} />
          <span className={isConnected ? 'text-success' : 'text-[var(--text-muted)]'}>
            {isConnected ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Global search trigger */}
        <button
          id="header-search-btn"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] text-sm text-[var(--text-muted)] hover:border-brand-500/50 hover:text-[var(--text-secondary)] transition-all duration-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="hidden sm:inline">Search stocks…</span>
          <kbd className="hidden sm:inline-block ml-1 px-1.5 py-0.5 text-xs bg-[var(--bg-hover)] rounded border border-[var(--border)] font-mono">⌘K</kbd>
        </button>

        {/* Notifications */}
        <button
          id="header-notifications-btn"
          className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Notification badge */}
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
        </button>

        {/* Avatar */}
        <div
          id="header-avatar"
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity shadow-glow"
        >
          {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
