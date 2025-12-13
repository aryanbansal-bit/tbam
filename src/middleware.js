import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth'];
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check for authentication cookie
  const authSession = request.cookies.get('authSession')?.value;
  const isAuthenticated = authSession === 'true';
  
  console.log('Middleware auth check:', { 
    pathname, 
    authSession, 
    isAuthenticated 
  });
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/auth).*)',
  ],
};