import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

// GET: Get user's available balances by asset
export async function GET(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get all wallet ledger entries for this user
    const ledgerEntries = await prisma.wallet_ledger.findMany({
      where: { user_id: user.id },
      select: { asset: true, amount: true, type: true }
    });

    // Calculate available balance per asset
    const balances = {};
    
    for (const entry of ledgerEntries) {
      const asset = entry.asset;
      const amount = Number(entry.amount);
      
      if (!balances[asset]) {
        balances[asset] = 0;
      }
      
      // Add positive amounts (deposits, releases) and subtract negative amounts (withdrawals, holds)
      balances[asset] += amount;
    }

    // Ensure balances are not negative (safety check)
    for (const asset in balances) {
      if (balances[asset] < 0) {
        balances[asset] = 0;
      }
    }

    // Add default assets if not present
    const defaultAssets = ['USDT', 'BTC', 'ETH', 'BNB'];
    for (const asset of defaultAssets) {
      if (!(asset in balances)) {
        balances[asset] = 0;
      }
    }

    return NextResponse.json({ 
      balances,
      user_id: user.id 
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}