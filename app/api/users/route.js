import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const users = await prisma.users.findMany({
      take: 50,
      orderBy: { created_at: 'desc' }
    });
    return new Response(JSON.stringify(users), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
  }
}
