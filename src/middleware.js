import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const publicPaths = [
    '/login',
    '/api/auth',
    '/api/services',
  ];

  const authSession = request.cookies.get('authSession')?.value;
  const userRole = request.cookies.get('userRole')?.value;

  const isAuthenticated = authSession === 'true';

  // "/" root page
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL('/dashboard/user/home', request.url)
      );
    }
    return NextResponse.next();
  }

  // Public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 🔒 ADMIN ONLY: /dashboard/services
  if (pathname.startsWith('/dashboard/services')) {
    if (!isAuthenticated || userRole !== 'admin') {
      return NextResponse.redirect(
        new URL('/dashboard/user/home', request.url)
      );
    }
  }

  // Protected routes
  if (!isAuthenticated) {
    return NextResponse.redirect(
      new URL('/', request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
