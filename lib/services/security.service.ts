import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

/* ══ validateInput ══════════════════════ */
export const validateInput = <T>(schema: z.ZodSchema<T>, data: unknown): T =>
  schema.parse(data)

/* ══ sanitizeInput ══════════════════════ */
export const sanitizeInput = (input: string): string =>
  input
    .replace(/[<>]/g, '')           // basic XSS
    .replace(/['";\\]/g, '')        // SQL chars
    .trim()
    .slice(0, 10000)

/* ══ preventSQLInjection ════════════════ */
export const preventSQLInjection = (input: string): boolean => {
  const patterns = [/(\bSELECT\b|\bINSERT\b|\bUPDATE\b|\bDELETE\b|\bDROP\b|\bUNION\b)/i, /--/, /\/\*/, /xp_/i]
  return patterns.some(p => p.test(input))
}

/* ══ preventXSS ═════════════════════════ */
export const preventXSS = (input: string): string =>
  input.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
       .replace(/"/g,'&quot;').replace(/'/g,'&#x27;')

/* ══ preventCSRF ════════════════════════ */
export const preventCSRF = (req: NextRequest): boolean => {
  const origin  = req.headers.get('origin')
  const allowed = process.env.CLIENT_URL || 'http://localhost:3000'
  return !origin || origin === allowed
}

/* ══ rateLimiter ════════════════════════ */
const ipMap = new Map<string, { count:number; resetAt:number }>()

export const rateLimiter = (ip: string, limit=100, windowMs=15*60*1000): boolean => {
  const now   = Date.now()
  const entry = ipMap.get(ip)
  if (!entry || now > entry.resetAt) {
    ipMap.set(ip, { count:1, resetAt: now + windowMs })
    return true  // allowed
  }
  entry.count++
  return entry.count <= limit
}

/* ══ blockIP ════════════════════════════ */
const blockedIPs = new Set<string>()
export const blockIP    = (ip: string) => blockedIPs.add(ip)
export const unblockIP  = (ip: string) => blockedIPs.delete(ip)
export const isBlocked  = (ip: string) => blockedIPs.has(ip)

/* ══ getClientIP ════════════════════════ */
export const getClientIP = (req: NextRequest): string =>
  req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? 'unknown'
