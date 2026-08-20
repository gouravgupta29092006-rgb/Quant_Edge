'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    group: 'Main',
    label: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    label: 'Portfolio',
    href: '/portfolio',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    label: 'Market',
    href: '/market',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    label: 'Watchlist',
    href: '/watchlist',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    ),
  },
  {
    group: 'Analysis',
    label: 'Analytics',
    href: '/analytics',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    label: 'Strategies',
    href: '/strategies',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    label: 'News',
    href: '/news',
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    group: 'Account',
    label: 'Settings',
    href: '/settings',
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
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
        boxShadow: '0 0 12px rgba(99,102,241,0.4)',
        color: '#fff',
      }}>
      {initials}
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    router.push('/login');
  };

  // Group nav items
  const groups: { label: string; items: NavItem[] }[] = [];
  let currentGroup: { label: string; items: NavItem[] } | null = null;
  for (const item of NAV_ITEMS) {
    if (item.group) {
      currentGroup = { label: item.group, items: [item] };
      groups.push(currentGroup);
    } else if (currentGroup) {
      currentGroup.items.push(item);
    } else {
      if (!groups.length) groups.push({ label: '', items: [] });
      groups[0].items.push(item);
    }
  }

  return (
    <aside
      style={{
        width: collapsed ? '60px' : '220px',
        background: 'linear-gradient(180deg, #080A11 0%, #05060A 100%)',
        borderRight: '1px solid #161C2E',
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className="flex flex-col h-screen sticky top-0 z-30 flex-shrink-0"
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-[60px] px-3.5 border-b flex-shrink-0"
        style={{ borderColor: '#161C2E' }}>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)',
            boxShadow: '0 0 16px rgba(99,102,241,0.5)',
          }}>
          <span className="text-white font-bold text-sm" style={{ fontFamily: 'Outfit, sans-serif' }}>Q</span>
        </div>

        {!collapsed && (
          <span className="ml-2.5 text-[15px] font-bold whitespace-nowrap"
            style={{
              fontFamily: 'Outfit, sans-serif',
              background: 'linear-gradient(135deg, #818CF8 0%, #22D3EE 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            QuantEdge
          </span>
        )}

        <button
          id="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto p-1 rounded-lg transition-all duration-200"
          style={{ color: '#4E5A7A' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#8896B3')}
          onMouseLeave={e => (e.currentTarget.style.color = '#4E5A7A')}
        >
          <svg className={`w-4 h-4 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none">
        {groups.map((group, gi) => (
          <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
            {/* Group label */}
            {group.label && !collapsed && (
              <div className="px-3 mb-1.5 mt-1">
                <span style={{
                  fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: '#2D3A5E',
                }}>
                  {group.label}
                </span>
              </div>
            )}
            {collapsed && gi > 0 && (
              <div className="mx-2 my-2" style={{ height: '1px', background: '#161C2E' }} />
            )}

            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  id={`nav-${item.label.toLowerCase()}`}
                  title={collapsed ? item.label : undefined}
                  className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group"
                  style={{
                    color: isActive ? '#818CF8' : '#8896B3',
                    background: isActive ? 'rgba(99,102,241,0.08)' : 'transparent',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(24,28,46,0.7)';
                      e.currentTarget.style.color = '#F0F4FF';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#8896B3';
                    }
                  }}
                >
                  {/* Active glow bar */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                      style={{ background: 'linear-gradient(180deg, #818CF8, #06B6D4)' }} />
                  )}

                  <span className="flex-shrink-0" style={{ color: isActive ? '#818CF8' : 'inherit' }}>
                    {item.icon}
                  </span>

                  {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}

                  {/* Tooltip when collapsed */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap
                      opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50"
                      style={{
                        background: '#181C2E',
                        border: '1px solid #1F2744',
                        color: '#F0F4FF',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                      }}>
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User section ── */}
      <div className="p-2.5 border-t flex-shrink-0" style={{ borderColor: '#161C2E' }}>
        {/* User info pill */}
        {user && !collapsed && (
          <div className="flex items-center gap-2.5 px-2 py-2 mb-1 rounded-xl"
            style={{ background: 'rgba(24,28,46,0.5)' }}>
            <UserAvatar name={user.displayName || user.email} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate" style={{ color: '#F0F4FF' }}>
                {user.displayName || 'User'}
              </p>
              <p className="text-xs truncate" style={{ color: '#4E5A7A' }}>{user.email}</p>
            </div>
          </div>
        )}
        {user && collapsed && (
          <div className="flex justify-center mb-1">
            <UserAvatar name={user.displayName || user.email} />
          </div>
        )}

        {/* Logout */}
        <button
          id="sidebar-logout-btn"
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? 'Sign out' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm transition-all duration-150"
          style={{ color: '#4E5A7A' }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,68,102,0.08)';
            e.currentTarget.style.color = '#FF4466';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = '#4E5A7A';
          }}
        >
          <svg className="w-[18px] h-[18px] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {!collapsed && <span className="font-medium">{loggingOut ? 'Signing out…' : 'Sign out'}</span>}
        </button>
      </div>
    </aside>
  );
}
