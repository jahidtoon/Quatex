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

    const { searchParams } = new URL(req.url);
    const currency = (searchParams.get('currency') || '').trim();
    const type = (searchParams.get('type') || '').trim();

    // Load user's country
    const me = await prisma.users.findUnique({ where: { id: user.id }, select: { country: true } });
    const myCountry = (me?.country || '').trim();
    if (!myCountry) {
      return NextResponse.json({ templates: [], message: 'Please set your country in Profile to view billing methods.' }, { status: 200 });
    }

    // Basic ISO<->Name normalization for common cases (extend as needed)
    const codeToName = { BD: 'Bangladesh', US: 'United States', UK: 'United Kingdom', GB: 'United Kingdom', CA: 'Canada', AU: 'Australia', DE: 'Germany' };
    const nameToCode = Object.fromEntries(Object.entries(codeToName).map(([k,v]) => [v, k]));
    const variants = new Set([myCountry]);
    if (codeToName[myCountry]) variants.add(codeToName[myCountry]);
    if (nameToCode[myCountry]) variants.add(nameToCode[myCountry]);

    // SQLite doesn't support case-insensitive mode in Prisma filters reliably.
    // Fetch active templates (optionally filter by type) then filter by country/currency in JS.
    const where = { is_active: true };
    if (type) where.type = type;

    const allTemplates = await prisma.payment_method_templates.findMany({ where, orderBy: { title: 'asc' } });
    const vset = new Set(Array.from(variants).map((v) => String(v).toLowerCase()));
    const filtered = allTemplates.filter((t) => vset.has(String(t.country || '').toLowerCase()))
      .filter((t) => {
        if (!currency) return true;
        return String(t.currency || '').toLowerCase() === String(currency).toLowerCase();
      });
    return NextResponse.json({ templates: filtered });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
