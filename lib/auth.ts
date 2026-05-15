import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { NextRequest } from 'next/server'
import prisma from './db'

export interface JWTPayload {
  id: string; username: string; email: string; role: string
}

const ACCESS_SECRET  = process.env.JWT_SECRET!
// Separate refresh secret — predictable fallback is a security risk
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET
  ?? (process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('JWT_REFRESH_SECRET is required in production') })()
      : process.env.JWT_SECRET! + '_refresh_dev_only')
const ACCESS_EXPIRES  = process.env.JWT_EXPIRES_IN || '15m'
const REFRESH_EXPIRES = '7d'

/* ══ PASSWORD ══════════════════════════ */
export const hashPassword    = (pw: string) => bcrypt.hash(pw, 12)
export const comparePassword = (pw: string, hash: string) => bcrypt.compare(pw, hash)

/* ══ JWT ════════════════════════════════ */
export const generateAccessToken = (p: JWTPayload) =>
  jwt.sign(p, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions)

export const generateRefreshToken = (p: JWTPayload) =>
  jwt.sign(p, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as jwt.SignOptions)

// backward compat alias
export const signToken = generateAccessToken

export const verifyAccessToken = (t: string) =>
  jwt.verify(t, ACCESS_SECRET) as JWTPayload

export const verifyRefreshToken = (t: string) =>
  jwt.verify(t, REFRESH_SECRET) as JWTPayload

export const decodeToken = (t: string) =>
  jwt.decode(t) as JWTPayload | null

export const verifyToken = verifyAccessToken

/* ══ SESSION (refresh tokens in DB) ═══ */
export const storeRefreshToken = (userId: string, token: string) =>
  prisma.refreshToken.upsert({
    where:  { userId },
    update: { token, createdAt: new Date() },
    create: { userId, token },
  })

export const removeRefreshToken = (userId: string) =>
  prisma.refreshToken.deleteMany({ where: { userId } })

export const revokeAllSessions = (userId: string) =>
  prisma.refreshToken.deleteMany({ where: { userId } })

/* ══ REQUEST HELPERS ════════════════════ */
export function getUser(req: NextRequest): JWTPayload | null {
  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  try { return verifyAccessToken(auth.slice(7)) } catch { return null }
}

export function requireAuth(req: NextRequest): JWTPayload {
  const u = getUser(req)
  if (!u) throw Object.assign(new Error('Нэвтрэх шаардлагатай'), { status: 401 })
  return u
}

export function requireAdmin(req: NextRequest): JWTPayload {
  const u = requireAuth(req)
  if (u.role !== 'ADMIN') throw Object.assign(new Error('Эрх хүрэлцэхгүй'), { status: 403 })
  return u
}

export function requireRole(req: NextRequest, ...roles: string[]): JWTPayload {
  const u = requireAuth(req)
  if (!roles.includes(u.role)) throw Object.assign(new Error('Эрх хүрэлцэхгүй'), { status: 403 })
  return u
}
