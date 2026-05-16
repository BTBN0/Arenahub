import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getUser } from '@/lib/auth'
import { getUserById, updateProfile, updateUserRole, banUser, unbanUser, deleteUser } from '@/lib/services/user.service'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

async function resolveAdmin(req: NextRequest): Promise<{ id: string; role: string } | null> {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (secret) {
      const na = await getToken({ req, secret })
      if (na?.id) {
        const u = await prisma.user.findUnique({ where: { id: na.id as string }, select: { id: true, role: true } })
        if (u?.role === 'ADMIN') return u
      }
      if (na?.email) {
        const u = await prisma.user.findUnique({ where: { email: na.email as string }, select: { id: true, role: true } })
        if (u?.role === 'ADMIN') return u
      }
    }
  } catch {}
  const u = getUser(req)
  if (u?.role === 'ADMIN') return { id: u.id, role: u.role }
  return null
}

async function resolveSelf(req: NextRequest): Promise<{ id: string; role: string } | null> {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (secret) {
      const na = await getToken({ req, secret })
      if (na?.id) {
        const u = await prisma.user.findUnique({ where: { id: na.id as string }, select: { id: true, role: true } })
        if (u) return u
      }
      if (na?.email) {
        const u = await prisma.user.findUnique({ where: { email: na.email as string }, select: { id: true, role: true } })
        if (u) return u
      }
    }
  } catch {}
  const u = getUser(req)
  return u ? { id: u.id, role: u.role } : null
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const admin = await resolveAdmin(req)
    if (!admin) return err('Эрх хүрэлцэхгүй', 403)
    const { id } = await params
    const user = await getUserById(id)
    if (!user) return err('Хэрэглэгч олдсонгүй', 404)
    return ok({ user })
  } catch (e) { return handleError(e) }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id }  = await params
    const action  = req.nextUrl.searchParams.get('action') || 'profile'
    const body    = await req.json().catch(() => ({}))

    // Admin-only actions
    if (['role', 'ban', 'unban'].includes(action)) {
      const admin = await resolveAdmin(req)
      if (!admin) return err('Эрх хүрэлцэхгүй', 403)
      if (action === 'role')  return ok({ user: await updateUserRole(id, body.role) })
      if (action === 'ban')   return ok({ user: await banUser(id) })
      if (action === 'unban') return ok({ user: await unbanUser(id) })
    }

    // Profile update — own or admin
    const self = await resolveSelf(req)
    if (!self) return err('Нэвтрэх шаардлагатай', 401)
    if (id !== self.id && self.role !== 'ADMIN') return err('Эрх хүрэлцэхгүй', 403)
    return ok({ user: await updateProfile(id, body) })
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const admin = await resolveAdmin(req)
    if (!admin) return err('Эрх хүрэлцэхгүй', 403)
    const { id } = await params
    await deleteUser(id)
    return ok({ message: 'Устгагдлаа' })
  } catch (e) { return handleError(e) }
}