import { PrismaClient } from '@prisma/client'
import config from '../utils/config.js'

// Prisma client must be a singleton. Creating multiple clients (or repeatedly connecting)
// can lead to errors like: prepared statement "s1" already exists.
// This pattern is safe for Node watch mode and serverless-style reloads.
const globalForPrisma = globalThis

const prisma = globalForPrisma.__wetalk_prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__wetalk_prisma = prisma
}

export async function connectPrisma() {
  const url = String(config.DATABASE_URL || '')
  const looksLikePooler = url.includes('.pooler.supabase.com') || url.includes('pgbouncer')
  const hasPgbouncerFlag = /[?&]pgbouncer=true\b/.test(url)
  const hasStatementCacheOff = /[?&]statement_cache_size=0\b/.test(url)

  if (looksLikePooler && (!hasPgbouncerFlag || !hasStatementCacheOff)) {
    console.warn(
      '[Prisma] DATABASE_URL looks like a Supabase pooler/PgBouncer URL but is missing recommended flags. ' +
        'Use ?pgbouncer=true&statement_cache_size=0 (and optionally connection_limit=1) to avoid prepared statement errors.'
    )
  }

  await prisma.$connect()
  const pgHost = String(config.DATABASE_URL || '').split('@')[1]?.split('/')[0] || 'unknown'
  console.log(`Postgres connected: ${pgHost}`)
}

export default prisma