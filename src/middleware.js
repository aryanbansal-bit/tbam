import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public paths (always accessible)
  const publicPaths = [
    '/login',
    '/api/auth',
    '/api/services',
  ];

  const authSession = request.cookies.get('authSession')?.value;
  const isAuthenticated = authSession === 'true';

  // 👇 ROOT PAGE LOGIC ("/")
  if (pathname === '/') {
    // If logged in → redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(
        new URL('/dashboard/user/home', request.url)
      );
    }

    // If not logged in → allow public view
    return NextResponse.next();
  }

  // Allow always-public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
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
