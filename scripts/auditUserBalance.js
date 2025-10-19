const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

function toNum(v) {
  if (v == null) return 0;
  if (typeof v === 'number') return v;
  if (v instanceof Prisma.Decimal) return Number(v.toString());
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

async function audit(email, account = 'live', limit = 100) {
  const user = await prisma.users.findUnique({ where: { email }, select: { id: true, balance: true, demo_balance: true, tournament_balance: true } });
  if (!user) throw new Error(`User not found for email ${email}`);

  const currentBalance = account === 'demo' ? toNum(user.demo_balance) : account === 'tournament' ? toNum(user.tournament_balance) : toNum(user.balance);

  const [deposits, withdrawals, trades] = await Promise.all([
    prisma.deposits.findMany({ where: { user_id: user.id }, orderBy: { created_at: 'desc' }, take: limit }).catch(() => []),
    prisma.withdrawals.findMany({ where: { user_id: user.id }, orderBy: { created_at: 'desc' }, take: limit }).catch(() => []),
    prisma.trades.findMany({ where: { user_id: user.id }, orderBy: { open_time: 'desc' }, take: limit, select: { id: true, symbol: true, amount: true, direction: true, result: true, payout: true, open_time: true, close_time: true, status: true, account_type: true } }).catch(() => []),
  ]);

  const events = [];

  // Deposits/Withdrawals only for live
  if (account === 'live') {
    const isCompleted = (val) => {
      const s = (val || '').toString().toLowerCase();
      return s.includes('complete') || s.includes('confirm') || s === 'paid' || s === 'success';
    };
    for (const d of deposits) {
      if (!isCompleted(d.status)) continue;
      events.push({ type: 'deposit', id: d.id, ts: d.created_at, delta: toNum(d.amount), label: `Deposit (${d.status})` });
    }
    for (const w of withdrawals) {
      if (!isCompleted(w.status)) continue;
      events.push({ type: 'withdrawal', id: w.id, ts: w.created_at, delta: -toNum(w.amount), label: `Withdrawal (${w.status})` });
    }
  }

  for (const t of trades) {
    const acct = (t.account_type || 'live').toLowerCase();
    if (acct !== account) continue;
    const amt = toNum(t.amount);
    const pay = toNum(t.payout);
    const res = (t.result || '').toLowerCase();
    if (t.open_time) events.push({ type: 'trade_open', id: t.id, ts: t.open_time, delta: -amt, label: `OPEN ${t.symbol} ${t.direction}` });
    if (t.close_time && (res === 'win' || res === 'loss')) {
      const closeDelta = res === 'win' ? amt + pay : 0;
      events.push({ type: 'trade_close', id: t.id, ts: t.close_time, delta: closeDelta, label: `${res.toUpperCase()} ${t.symbol} ${t.direction} (payout ${pay.toFixed(2)})` });
    }
  }

  // Sort
  events.sort((a,b) => new Date(a.ts) - new Date(b.ts));

  const totalDelta = events.reduce((s,e) => s + e.delta, 0);
  const inferredStart = currentBalance - totalDelta;

  let running = inferredStart;
  const withRun = events.map(e => { running += e.delta; return { ...e, running: Number(running.toFixed(2)) }; });

  console.log(`\n=== Balance Audit for ${email} [${account}] ===`);
  console.log(`Current: $${currentBalance.toFixed(2)} | Inferred start: $${inferredStart.toFixed(2)} | Events: ${withRun.length}`);
  console.log('---');
  for (const e of withRun) {
    const t = new Date(e.ts).toISOString();
    const s = e.delta >= 0 ? '+' : '';
    console.log(`${t}  ${s}${e.delta.toFixed(2)}  -> $${e.running.toFixed(2)}  ${e.type}  ${e.label}  (id=${e.id})`);
  }
}

(async () => {
  const email = process.argv[2] || 'user@quatex.com';
  const account = process.argv[3] || 'live';
  try {
    await audit(email, account);
  } catch (e) {
    console.error('Audit failed:', e.message);
  } finally {
    await prisma.$disconnect();
  }
})();
