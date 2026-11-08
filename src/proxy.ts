import { NextRequest, NextResponse } from 'next/server';
import { sessionCookies } from '@/config';

/** Pages reachable without a session. */
const PUBLIC_PATHS = [`/login`, `/offline`, `/error`];

const isPublicPath = (pathname: string): boolean =>
  PUBLIC_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

/**
 * Route guard (Next.js 16 `proxy`, formerly middleware) — an *optimistic*
 * check: it only looks for the session cookies, so signed-out visitors go
 * straight to `/login` instead of a page full of 401s. Real authorisation
 * stays with the staff API, and an expired token is still refreshed by the
 * interceptor's `AuthMiddleware`.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession =
    request.cookies.has(sessionCookies.token) ||
    request.cookies.has(sessionCookies.refreshToken);

  if (!hasSession && !isPublicPath(pathname)) {
    const loginUrl = new URL(`/login`, request.url);
    loginUrl.searchParams.set(`next`, `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (hasSession && pathname === `/login`) {
    return NextResponse.redirect(new URL(`/`, request.url));
  }

  return NextResponse.next();
}

// Statically analysed by Next: plain string literals only.
export const config = {
  // Everything except API routes, Next internals and static PWA files.
  matcher: [
    '/((?!api/|_next/static|_next/image|sw\\.js|manifest\\.webmanifest|icons/|icon\\.svg|apple-icon|favicon\\.ico|robots\\.txt).*)',
  ],
};
