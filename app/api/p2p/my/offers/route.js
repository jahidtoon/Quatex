import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

export async function GET(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const items = await prisma.p2p_offers.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
