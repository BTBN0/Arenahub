import { PrismaClient } from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'production' ? ['error'] : ['warn', 'error'],
    datasources: {
      db: {
        // On Render free tier: use connection pooling URL if set
        url: process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL,
      },
    },
  })
}

// Singleton — reuse across hot reloads in dev, single instance in prod
export const prisma = globalThis.__prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export default prisma