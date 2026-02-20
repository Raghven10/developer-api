
import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

// Pass the connection string explicitly for Prisma 7 compatibility
const datasourceUrl = process.env.DATABASE_URL || "file:./dev.db"

export const prisma = globalForPrisma.prisma || new PrismaClient({
    log: []
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
