import { PrismaClient } from '@prisma/client';

let globalForPrisma = globalThis;

const prisma = globalForPrisma.__prisma || new PrismaClient({
	log: process.env.NODE_ENV === 'development' ? ['warn','error'] : ['error'],
	// SQLite-specific optimizations
	datasources: {
		db: {
			url: process.env.DATABASE_URL || "file:./dev.db"
		}
	}
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;

export default prisma;
