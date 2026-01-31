import { NextResponse } from 'next/server';

export async function POST(req) {
  const body = await req.json();

  // simulate delay
  await new Promise(res => setTimeout(res, 3000));

  console.log("📩 PERSONAL API PAYLOAD:");
  console.log(JSON.stringify(body, null, 2));

  return NextResponse.json({
    success: true,
    received: body.length,
  });
}
