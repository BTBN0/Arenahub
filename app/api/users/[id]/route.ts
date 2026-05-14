import { NextRequest } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { getUserById, updateProfile, updateUserRole, banUser, unbanUser, deleteUser } from '@/lib/services/user.service'
import { ok, err, handleError } from '@/lib/api-helpers'

type Params = { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  try {
    requireAdmin(req)
    const { id } = await params
    const user   = await getUserById(id)
    if (!user) return err('Хэрэглэгч олдсонгүй', 404)
    return ok({ user })
  } catch (e) { return handleError(e) }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const u      = requireAuth(req)
    const { id } = await params
    const action = req.nextUrl.searchParams.get('action') || 'profile'
    const body   = await req.json().catch(() => ({}))

    if (action === 'role') {
      requireAdmin(req)
      return ok({ user: await updateUserRole(id, body.role) })
    }
    if (action === 'ban')   { requireAdmin(req); return ok({ user: await banUser(id) }) }
    if (action === 'unban') { requireAdmin(req); return ok({ user: await unbanUser(id) }) }

    if (id !== u.id && u.role !== 'ADMIN') return err('Эрх хүрэлцэхгүй', 403)
    return ok({ user: await updateProfile(id, body) })
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    requireAdmin(req)
    const { id } = await params
    await deleteUser(id)
    return ok({ message: 'Устгагдлаа' })
  } catch (e) { return handleError(e) }
}
