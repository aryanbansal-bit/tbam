import { NextResponse } from 'next/server';

export async function GET(request) {
  const authSession = request.cookies.get('authSession')?.value;
  const username = request.cookies.get('username')?.value;
  
  console.log('Auth check cookies:', { 
    authSession: authSession || 'NOT_FOUND',
    username: username || 'NOT_FOUND'
  });
  
  const isAuthenticated = authSession === 'true';
  
  return NextResponse.json({
    authenticated: isAuthenticated,
    username: isAuthenticated ? username : null
  });
}