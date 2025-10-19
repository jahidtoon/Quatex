const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOrder() {
  const orderId = '90ed700f-370f-428f-9f10-be771c5dd587';
  
  try {
    // Get order details
    const order = await prisma.p2p_orders.findUnique({
      where: { id: orderId },
      include: {
        maker: { select: { id: true, email: true, name: true } },
        taker: { select: { id: true, email: true, name: true } },
        messages: { 
          orderBy: { created_at: 'desc' },
          include: {
            sender: { select: { email: true, name: true } }
          }
        }
      }
    });

    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log('📋 Order Details:');
    console.log(`- ID: ${order.id}`);
    console.log(`- Status: ${order.status}`);
    console.log(`- Side: ${order.side}`);
    console.log(`- Amount: ${order.amount_asset} ${order.asset_symbol} @ ${order.price} = ${order.amount_fiat} ${order.fiat_currency}`);
    console.log(`- Reference: ${order.reference_code}`);
    console.log(`- Created: ${order.created_at}`);
    console.log(`- Escrow Held: ${order.escrow_held}`);
    
    console.log('\n👥 Users:');
    console.log(`- Maker (Seller): ${order.maker.email} (${order.maker.name || 'No name'}) - ID: ${order.maker.id}`);
    console.log(`- Taker (Buyer): ${order.taker.email} (${order.taker.name || 'No name'}) - ID: ${order.taker.id}`);

    console.log('\n💬 Messages:');
    if (order.messages.length === 0) {
      console.log('- No messages yet');
    } else {
      order.messages.forEach((msg, index) => {
        const senderType = msg.sender_id === order.maker_id ? 'Seller' : 
                          msg.sender_id === order.taker_id ? 'Buyer' : 'Unknown';
        console.log(`${index + 1}. [${new Date(msg.created_at).toLocaleString()}] ${senderType} (${msg.sender.email}): ${msg.message}`);
      });
    }

    // Check all orders for both users
    console.log('\n📊 All Orders for Maker:');
    const makerOrders = await prisma.p2p_orders.findMany({
      where: { maker_id: order.maker.id },
      select: { id: true, status: true, reference_code: true, created_at: true }
    });
    makerOrders.forEach(o => {
      console.log(`- ${o.reference_code}: ${o.status} (${o.id})`);
    });

    console.log('\n📊 All Orders for Taker:');
    const takerOrders = await prisma.p2p_orders.findMany({
      where: { taker_id: order.taker.id },
      select: { id: true, status: true, reference_code: true, created_at: true }
    });
    takerOrders.forEach(o => {
      console.log(`- ${o.reference_code}: ${o.status} (${o.id})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOrder();