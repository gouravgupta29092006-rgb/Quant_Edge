import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js edge middleware — route protection.
 * Redirects unauthenticated users away from protected dashboard routes.
 * Redirects authenticated users away from auth pages (login/register).
 *
 * Token presence check only (real JWT validation in API gateway).
 * Per TECH_SPEC.md §12 — Authentication flow.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token (stored in localStorage — can't read in edge, use cookie as signal)
  const sessionCookie = request.cookies.get('qe_session');
  const isAuthenticated = !!sessionCookie?.value;

  // Protected routes — require auth
  const protectedRoutes = [
    '/dashboard',
    '/portfolio',
    '/market',
    '/strategies',
    '/backtests',
    '/analytics',
    '/watchlist',
    '/settings',
    '/news',
  ];

  // Auth routes — redirect if already authenticated
  const authRoutes = ['/login', '/register', '/forgot-password'];

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
