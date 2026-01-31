import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // 1️⃣ Cookie auth
    const cookieStore = await cookies();
    const isLoggedIn =
      cookieStore.get('authSession')?.value === 'true';

    // 2️⃣ Header API key
    const apiKey = request.headers.get('x-api-key');
    const VALID_API_KEY = process.env.HELLO_API_KEY;

    if (!isLoggedIn && apiKey !== VALID_API_KEY) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    return Response.json({
      success: true,
      message: 'Hello!',
      auth: isLoggedIn ? 'cookie' : 'api-key',
    });

  } catch (err) {
    console.error('Hello API error:', err);
    return Response.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
