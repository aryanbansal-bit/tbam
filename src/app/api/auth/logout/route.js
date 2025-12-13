import { NextResponse } from 'next/server';

export async function POST(request) {
  const authSession = request.cookies.get('authSession')?.value;
  const username = request.cookies.get('username')?.value;
  
  console.log('Logout requested for user:', username);
  
  const response = NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  );
  
  // Clear auth cookies
  response.cookies.set('authSession', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
  
  response.cookies.set('username', '', {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(0),
    path: '/',
  });
  
  return response;
}