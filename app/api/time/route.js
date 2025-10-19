import { NextResponse } from 'next/server';

export async function GET() {
  // Return server time in ms and ISO for clients to compute offset
  const now = Date.now();
  return NextResponse.json({ now, iso: new Date(now).toISOString() }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    }
  });
}
