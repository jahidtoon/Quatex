const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserTrades() {
  const user = await prisma.users.findUnique({
    where: { email: 'jahidultoon@gmail.com' },
    select: { id: true }
  });
  if (!user) {
    console.log('User not found');
    return;
  }
  const trades = await prisma.trades.findMany({
    where: { user_id: user.id },
    orderBy: { open_time: 'desc' },
    take: 10
  });
  console.log('Trade history for jahidultoon@gmail.com:');
  trades.forEach(t => {
    console.log(`ID: ${t.id}, Symbol: ${t.symbol}, Direction: ${t.direction}, Status: ${t.status}, Result: ${t.result}, Entry: ${t.entry_price}, Payout: ${t.payout}, Open: ${t.open_time}, Close: ${t.close_time}`);
  });
  await prisma.$disconnect();
}
checkUserTrades();
