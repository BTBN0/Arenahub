import prisma from './db'

/* ═══════════════════════════════════════
   SYSTEM / DEVOPS functions
═══════════════════════════════════════ */

/* ── connectDB ── */
export const connectDB = async () => {
  await prisma.$connect()
  console.log('✅ PostgreSQL connected')
}

/* ── disconnectDB ── */
export const disconnectDB = async () => {
  await prisma.$disconnect()
  console.log('✅ PostgreSQL disconnected')
}

/* ── loadEnv ── */
export const loadEnv = () => {
  const required = ['DATABASE_URL', 'JWT_SECRET']
  const missing  = required.filter(k => !process.env[k])
  if (missing.length) {
    console.error('❌ Missing env vars:', missing.join(', '))
    process.exit(1)
  }
  console.log('✅ Environment loaded')
}

/* ── logger ── */
type LogLevel = 'info' | 'warn' | 'error' | 'debug'
export const logger = (level: LogLevel, message: string, meta?: unknown) => {
  const ts  = new Date().toISOString()
  const out = `[${ts}] [${level.toUpperCase()}] ${message}`
  if (meta) console[level === 'error' ? 'error' : 'log'](out, meta)
  else      console[level === 'error' ? 'error' : 'log'](out)
}

/* ── errorHandler ── */
export const errorHandler = (err: unknown) => {
  const e = err as { message?: string; status?: number; stack?: string }
  logger('error', e.message ?? 'Unknown error', { status: e.status, stack: e.stack })
}

/* ── gracefulShutdown ── */
export const gracefulShutdown = async (signal: string) => {
  logger('info', `Signal ${signal} received — shutting down...`)
  await disconnectDB()
  process.exit(0)
}

/* ── startServer (Next.js manages HTTP — this handles DB + signals) ── */
export const startServer = async () => {
  loadEnv()
  await connectDB()
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
  process.on('SIGINT',  () => gracefulShutdown('SIGINT'))
  logger('info', '🚀 ArenaHub server ready')
}
