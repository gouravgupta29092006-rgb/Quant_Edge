'use client';

import { useAuthStore }   from '@/stores/authStore';
import { useMarketStore } from '@/stores/marketStore';
import { usePathname }    from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard':  { title: 'Dashboard',  subtitle: 'Portfolio overview & live market' },
  '/portfolio':  { title: 'Portfolio',  subtitle: 'Holdings, P&L, and performance' },
  '/market':     { title: 'Market',     subtitle: 'Live quotes and market data' },
  '/watchlist':  { title: 'Watchlist',  subtitle: 'Track your favourite stocks' },
  '/analytics':  { title: 'Analytics',  subtitle: 'Deep performance analysis' },
  '/strategies': { title: 'Strategies', subtitle: 'AI-powered trading strategies' },
  '/news':       { title: 'News',       subtitle: 'Market news and sentiment' },
  '/settings':   { title: 'Settings',   subtitle: 'Account and preferences' },
};

export default function DashboardHeader({ title }: { title?: string }) {
  const { user }        = useAuthStore();
  const { isConnected } = useMarketStore();
  const pathname        = usePathname();
  const shouldReduce    = useReducedMotion();

  const meta     = TITLES[pathname] ?? { title: title ?? 'QuantEdge', subtitle: 'AI Financial Intelligence' };
  const initials = (user?.displayName || user?.email || 'U')
    .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <motion.header
      className="flex items-center justify-between px-6 z-20 sticky top-0"
      style={{
        height: '60px',
        background: 'rgba(5,6,10,0.88)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid #131928',
      }}
      initial={shouldReduce ? undefined : { opacity: 0, y: -8 }}
      animate={shouldReduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Page title block */}
      <div>
        <motion.h1
          key={pathname}
          className="font-display text-[15px] font-semibold text-text-primary leading-none"
          initial={shouldReduce ? undefined : { opacity: 0, x: -6 }}
          animate={shouldReduce ? undefined : { opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
        >
          {meta.title}
        </motion.h1>
        <motion.p
          key={pathname + '-sub'}
          className="text-[11px] text-text-muted mt-0.5 leading-none hidden sm:block"
          initial={shouldReduce ? undefined : { opacity: 0 }}
          animate={shouldReduce ? undefined : { opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.08 }}
        >
          {meta.subtitle}
        </motion.p>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2">
        {/* Live status pill */}
        <motion.div
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold',
            isConnected
              ? 'bg-success/8 border-success/20 text-success'
              : 'bg-text-muted/5 border-border-light text-text-muted',
          )}
          animate={shouldReduce ? {} : { opacity: [1, 0.7, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', isConnected ? 'live-dot' : 'bg-text-muted')} />
          {isConnected ? 'Live' : 'Offline'}
        </motion.div>

        {/* Search button */}
        <motion.button
          id="header-search-btn"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm text-text-muted border border-border hover:border-brand/40 hover:text-text-secondary transition-colors duration-150"
          style={{ background: 'rgba(14,18,35,0.8)' }}
          whileHover={shouldReduce ? {} : { scale: 1.02 }}
          whileTap={shouldReduce ? {} : { scale: 0.97 }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-xs">Search stocks…</span>
          <kbd className="text-xs px-1.5 py-0.5 rounded-md font-mono bg-bg-elevated border border-border-light text-text-disabled">
            ⌘K
          </kbd>
        </motion.button>

        {/* Notifications */}
        <motion.button
          id="header-notifications-btn"
          className="relative w-9 h-9 flex items-center justify-center rounded-xl text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors duration-150"
          whileHover={shouldReduce ? {} : { scale: 1.08 }}
          whileTap={shouldReduce ? {} : { scale: 0.93 }}
        >
          <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {/* Unread dot with ping */}
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5">
            <span className="absolute inset-0 rounded-full bg-brand-400 animate-ping-sm opacity-75" />
            <span className="relative block w-1.5 h-1.5 rounded-full bg-brand-400 shadow-glow-brand" />
          </span>
        </motion.button>

        {/* User avatar */}
        <motion.div
          id="header-avatar"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold cursor-pointer select-none"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            boxShadow: '0 0 12px rgba(99,102,241,0.35)',
          }}
          whileHover={shouldReduce ? {} : { scale: 1.08, boxShadow: '0 0 24px rgba(99,102,241,0.6)' }}
          whileTap={shouldReduce ? {} : { scale: 0.93 }}
        >
          {initials}
        </motion.div>
      </div>
    </motion.header>
  );
}
