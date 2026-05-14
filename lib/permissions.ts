import { NextRequest } from 'next/server'
import { requireAuth, JWTPayload } from './auth'
import { ROLE_PERMISSIONS, STAFF_ROLES, type Permission } from './permissions-client'
export * from './permissions-client'

export function requirePermission(req: NextRequest, perm: Permission): JWTPayload {
  const u = requireAuth(req)
  if (!(ROLE_PERMISSIONS[u.role] ?? []).includes(perm)) {
    throw Object.assign(new Error('Эрх хүрэлцэхгүй'), { status: 403 })
  }
  return u
}

export function requireStaff(req: NextRequest): JWTPayload {
  const u = requireAuth(req)
  if (!STAFF_ROLES.includes(u.role)) {
    throw Object.assign(new Error('Эрх хүрэлцэхгүй'), { status: 403 })
  }
  return u
}