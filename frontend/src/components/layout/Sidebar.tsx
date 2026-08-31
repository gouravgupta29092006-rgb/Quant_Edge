'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href:  string;
  icon:  React.ReactNode;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    group: 'Main',
    label: 'Dashboard',
    href:  '/dashboard',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Portfolio',
    href:  '/portfolio',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Market',
    href:  '/market',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: 'Watchlist',
    href:  '/watchlist',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    group: 'Analysis',
    label: 'Analytics',
    href:  '/analytics',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Strategies',
    href:  '/strategies',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    label: 'News',
    href:  '/news',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    group: 'Account',
    label: 'Settings',
    href:  '/settings',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

function UserAvatar({ name }: { name?: string }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
      style={{
        background:  'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
        boxShadow:   '0 0 12px rgba(99,102,241,0.4)',
      }}
    >
      {initials}
    </div>
  );
}

function groupNavItems(items: NavItem[]) {
  const groups: { label: string; items: NavItem[] }[] = [];
  let current: { label: string; items: NavItem[] } | null = null;
  for (const item of items) {
    if (item.group) { current = { label: item.group, items: [item] }; groups.push(current); }
    else if (current) { current.items.push(item); }
    else { if (!groups.length) groups.push({ label: '', items: [] }); groups[0].items.push(item); }
  }
  return groups;
}

export default function Sidebar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed]   = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const shouldReduce = useReducedMotion();

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push('/login');
  };

  const groups = groupNavItems(NAV_ITEMS);
  const W      = collapsed ? 64 : 220;

  return (
    <motion.aside
      animate={{ width: W }}
      transition={shouldReduce ? { duration: 0 } : { type: 'spring', stiffness: 260, damping: 28 }}
      className="flex flex-col h-screen sticky top-0 z-30 flex-shrink-0 overflow-hidden"
      style={{
        background:  'linear-gradient(180deg, #080A11 0%, #05060A 100%)',
        borderRight: '1px solid #131928',
      }}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="flex items-center h-[60px] px-3.5 border-b flex-shrink-0" style={{ borderColor: '#131928' }}>
        <motion.div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)', boxShadow: '0 0 16px rgba(99,102,241,0.45)' }}
          whileHover={shouldReduce ? {} : { scale: 1.08, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <span className="text-white font-bold text-sm font-display">Q</span>
        </motion.div>

        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="wordmark"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="ml-2.5 text-[15px] font-bold whitespace-nowrap font-display"
              style={{
                background: 'linear-gradient(135deg, #818CF8 0%, #22D3EE 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              QuantEdge
            </motion.span>
          )}
        </AnimatePresence>

        <motion.button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-bg-hover transition-colors"
          whileHover={shouldReduce ? {} : { scale: 1.1 }}
          whileTap={shouldReduce ? {} : { scale: 0.9 }}
        >
          <motion.svg
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.25 }}
            className="w-4 h-4"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </motion.svg>
        </motion.button>
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 no-scrollbar">
        {groups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-5' : ''}>
            {/* Group label */}
            <AnimatePresence>
              {group.label && !collapsed && (
                <motion.div
                  key={group.label}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-3 mb-2"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-disabled">
                    {group.label}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            {collapsed && gi > 0 && (
              <div className="mx-2 my-2 h-px bg-border" />
            )}

            {group.items.map((item, idx) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <motion.div
                  key={item.href}
                  custom={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.035 + gi * 0.05, duration: 0.25 }}
                >
                  <Link
                    href={item.href}
                    id={`nav-${item.label.toLowerCase()}`}
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 group',
                      isActive
                        ? 'text-brand-400 bg-brand-400/8'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover',
                    )}
                  >
                    {/* Active layoutId indicator pill */}
                    {isActive && (
                      <motion.span
                        layoutId="active-nav-indicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                        style={{ background: 'linear-gradient(180deg, #818CF8, #06B6D4)' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <span className={cn('flex-shrink-0', isActive && 'text-brand-400')}>
                      {item.icon}
                    </span>

                    <AnimatePresence>
                      {!collapsed && (
                        <motion.span
                          key="label"
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 'auto' }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.18 }}
                          className="whitespace-nowrap overflow-hidden"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Tooltip when collapsed */}
                    {collapsed && (
                      <span className={cn(
                        'absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap',
                        'opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50',
                        'bg-bg-elevated border border-border-light text-text-primary shadow-card',
                      )}>
                        {item.label}
                      </span>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User section ─────────────────────────────────────── */}
      <div className="p-2.5 border-t flex-shrink-0" style={{ borderColor: '#131928' }}>
        <AnimatePresence>
          {user && !collapsed && (
            <motion.div
              key="user-pill"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 px-2.5 py-2 mb-1.5 rounded-xl bg-bg-hover"
            >
              <UserAvatar name={user.displayName || user.email} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate text-text-primary">
                  {user.displayName || 'User'}
                </p>
                <p className="text-[11px] truncate text-text-muted">{user.email}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {user && collapsed && (
          <div className="flex justify-center mb-2">
            <UserAvatar name={user.displayName || user.email} />
          </div>
        )}

        <motion.button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? 'Sign out' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm text-text-muted hover:bg-danger/8 hover:text-danger transition-colors duration-150"
          whileHover={shouldReduce ? {} : { x: 2 }}
          whileTap={shouldReduce ? {} : { scale: 0.97 }}
        >
          {loggingOut ? (
            <motion.span
              className="w-[18px] h-[18px] rounded-full border-2 border-current border-t-transparent flex-shrink-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
          ) : (
            <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )}
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                key="logout-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.18 }}
                className="whitespace-nowrap overflow-hidden font-medium"
              >
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.aside>
  );
}
