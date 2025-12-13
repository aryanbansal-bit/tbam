import { NextResponse } from 'next/server'
import { supabase } from "@/app/utils/dbconnect";

export async function POST(request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check if user exists with matching credentials
    const { data, error } = await supabase
      .from('users')
      .select('id, username, role') // ✅ only safe fields
      .eq('username', username)
      .eq('password', password) // ⚠️ plain text check as per your request
      .maybeSingle()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { success: false, error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Success: return only safe login info
    const response = NextResponse.json(
      { success: true, user: data },
      { status: 200 }
    )

    // Set cookies for session
    response.cookies.set('authSession', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    response.cookies.set('username', data.username, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
