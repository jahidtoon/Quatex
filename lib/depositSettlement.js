// Deposit settlement logic (extract from watcher for reuse)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function creditConfirmedDeposit(sessionId, creditUsdAmount = 0, meta = {}) {
  return prisma.$transaction(async (tx) => {
    const session = await tx.deposit_sessions.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('Session not found');
    if (!['DETECTED','CONFIRMED'].includes(session.status)) throw new Error('Invalid status for credit');

    if (session.status !== 'CONFIRMED') {
      await tx.deposit_sessions.update({ where: { id: session.id }, data: { status: 'CONFIRMED' } });
    }

    const user = await tx.users.findUnique({ where: { id: session.user_id } });
    const newBalance = (user.balance || 0) + creditUsdAmount;
    await tx.users.update({ where: { id: session.user_id }, data: { balance: newBalance } });
    await tx.wallet_ledger.create({ data: { user_id: session.user_id, type: 'DEPOSIT', asset: 'USD', amount: creditUsdAmount, meta: { sessionId: session.id, ...meta } } });
    return { sessionId: session.id, credited: creditUsdAmount, balance: newBalance };
  });
}

module.exports = { creditConfirmedDeposit };
