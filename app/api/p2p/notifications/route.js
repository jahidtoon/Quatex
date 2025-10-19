import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

function getAuthToken(req) {
  const auth = req.headers.get('authorization') || '';
  const m = auth.match(/Bearer\s+(.*)/i);
  return m ? m[1] : null;
}

// GET: Get unread notifications count for user
export async function GET(req) {
  try {
    const token = getAuthToken(req);
    const user = await verifyToken(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Count orders requiring action (as maker/seller)
    const actionRequiredCount = await prisma.p2p_orders.count({
      where: {
        maker_id: user.id,
        status: 'PAID' // Only PAID status requires immediate action
      }
    });

    // Count active orders as maker that need attention (ESCROW_HELD with messages)
    const activeOrdersAsmaker = await prisma.p2p_orders.findMany({
      where: {
        maker_id: user.id,
        status: {
          in: ['ESCROW_HELD', 'PAID']
        }
      },
      include: {
        messages: {
          where: {
            sender_id: { not: user.id }, // Messages from taker/buyer
            created_at: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }
      }
    });

    // Count orders with new messages
    const ordersWithNewMessages = activeOrdersAsmaker.filter(order => order.messages.length > 0);
    
    return NextResponse.json({
      actionRequired: actionRequiredCount,
      newMessages: ordersWithNewMessages.length,
      total: actionRequiredCount + ordersWithNewMessages.length,
      debug: {
        userId: user.id,
        activeOrders: activeOrdersAsmaker.length,
        ordersWithMessages: ordersWithNewMessages.length
      }
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}