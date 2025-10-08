const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

async function manualCloseTrade() {
  const tradeId = '4f67752b-5b29-4048-8a7c-11f49c325694';
  const closingPrice = 1.17;
  
  const trade = await prisma.trades.findUnique({
    where: { id: tradeId },
    include: { users: true }
  });
  
  if (!trade) {
    console.log('Trade not found');
    return;
  }
  
  console.log('Trade:', {
    id: trade.id,
    direction: trade.direction,
    entryPrice: Number(trade.entry_price),
    amount: Number(trade.amount),
    closingPrice
  });
  
  const entryPrice = Number(trade.entry_price);
  const direction = trade.direction;
  const amount = Number(trade.amount);
  
  let isWin = false;
  if (direction === 'BUY') {
    isWin = closingPrice > entryPrice;
  } else if (direction === 'SELL') {
    isWin = closingPrice < entryPrice;
  }
  
  console.log('SELL trade, closing < entry?', closingPrice < entryPrice, 'Should win:', isWin);
  
  if (isWin) {
    const pair = await prisma.currency_pairs.findUnique({
      where: { symbol: trade.symbol },
      select: { payout: true }
    });
    
    const payoutPercent = pair?.payout ? Number(pair.payout) : 80;
    const payout = (amount * payoutPercent) / 100;
    
    console.log('Payout percent:', payoutPercent, 'Payout amount:', payout);
    
    // Update user balance if they won
    const accountType = trade.account_type || 'live';
    const balanceField = accountType === 'demo' ? 'demo_balance' : 'balance';
    const incrementAmount = new Prisma.Decimal(payout.toFixed(2));
    
    await prisma.$transaction([
      prisma.trades.update({
        where: { id: trade.id },
        data: {
          status: 'closed',
          result: 'win',
          payout: payout,
          updated_at: new Date()
        }
      }),
      prisma.users.update({
        where: { id: trade.user_id },
        data: {
          [balanceField]: {
            increment: incrementAmount
          }
        }
      })
    ]);
    
    console.log('Trade closed as WIN with payout:', payout, 'Balance updated');
  } else {
    await prisma.trades.update({
      where: { id: trade.id },
      data: {
        status: 'closed',
        result: 'loss',
        updated_at: new Date()
      }
    });
    
    console.log('Trade closed as LOSS');
  }
  
  await prisma.$disconnect();
}

manualCloseTrade();
