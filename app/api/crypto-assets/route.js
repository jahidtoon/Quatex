import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const assets = await prisma.crypto_assets.findMany({
      where: { is_active: true },
      orderBy: { symbol: 'asc' },
      select: { id: true, symbol: true, network: true, display_name: true, decimals: true, min_deposit: true, is_active: true }
    });
    return NextResponse.json(assets);
  } catch (e) {
    console.error('Assets fetch error', e);
    return NextResponse.json({ error: 'Failed to load assets' }, { status: 500 });
  }
}
