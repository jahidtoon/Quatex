import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getToken(req){
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return null;
}

export async function GET(request){
  try{
    const token = getToken(request);
    if(!token) return NextResponse.json({error:'Unauthorized'},{status:401});
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const list = await prisma.affiliate_payouts.findMany({
      where: { affiliate_id: decoded.affiliateId },
      orderBy: { requested_at: 'desc' }
    });
    return NextResponse.json({ success: true, payouts: list });
  }catch(e){
    console.error('payouts GET error', e);
    return NextResponse.json({error:'Internal server error'},{status:500});
  }
}

export async function POST(request){
  try{
    const token = getToken(request);
    if(!token) return NextResponse.json({error:'Unauthorized'},{status:401});
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const body = await request.json();
    const { amount, method } = body || {};
    if(!amount || !method) return NextResponse.json({error:'amount and method required'},{status:400});
    const row = await prisma.affiliate_payouts.create({ data: { affiliate_id: decoded.affiliateId, amount, method, status: 'Pending' } });
    return NextResponse.json({ success: true, payout: row });
  }catch(e){
    console.error('payouts POST error', e);
    return NextResponse.json({error:'Internal server error'},{status:500});
  }
}
