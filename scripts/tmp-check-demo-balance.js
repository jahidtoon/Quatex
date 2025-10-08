const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
	try {
		const users = await prisma.users.findMany({
			select: {
				id: true,
				email: true,
				balance: true,
				demo_balance: true,
			},
			orderBy: { created_at: 'asc' },
			take: 10,
		});

		if (!users.length) {
			console.warn('No users found to inspect balances.');
			return;
		}

		console.log('Top 10 users with balances:');
		for (const user of users) {
			console.log({
				id: user.id,
				email: user.email,
				balance: user.balance?.toString?.() ?? '0',
				demo_balance: user.demo_balance?.toString?.() ?? '0',
			});
		}
	} catch (error) {
		console.error('Failed to inspect balances', error);
	} finally {
		await prisma.$disconnect();
	}
}

main();

