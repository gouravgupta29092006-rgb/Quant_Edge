import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js edge middleware — route protection.
 *
 * Auth signal: `qe_session` cookie (set by authStore on login, cleared on logout).
 * The cookie contains no sensitive data — it's a presence flag only.
 * Real JWT validation happens at the API gateway (Spring Security).
 *
 * Per TECH_SPEC.md §12 — Authentication flow.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Read session cookie set by authStore.login()
  const sessionCookie = request.cookies.get('qe_session');
  const isAuthenticated = !!sessionCookie?.value;

  // Protected routes — require auth
  const protectedPrefixes = [
    '/dashboard',
    '/portfolio',
    '/market',
    '/strategies',
    '/backtests',
    '/analytics',
    '/watchlist',
    '/settings',
    '/news',
    '/ai',
  ];

  // Auth-only routes — redirect to dashboard if already authenticated
  const authOnlyPrefixes = ['/login', '/register', '/forgot-password'];

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  const isAuthOnly  = authOnlyPrefixes.some((p) => pathname.startsWith(p));

  // Unauthenticated user trying to access protected route → login
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already-authenticated user on login/register → dashboard
  if (isAuthOnly && isAuthenticated) {
    // Honour ?redirect param if present (e.g. came from a protected route)
    const redirect = request.nextUrl.searchParams.get('redirect');
    const dest = redirect && redirect.startsWith('/') ? redirect : '/dashboard';
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
