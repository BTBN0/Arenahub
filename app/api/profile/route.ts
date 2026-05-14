import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { requireAuth, getUser } from '@/lib/auth'
import { updateProfile } from '@/lib/services/user.service'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

const SECRET = process.env.NEXTAUTH_SECRET!

export async function PATCH(req: NextRequest) {
  try {
    let userId: string | undefined

    // NextAuth cookie auth
    const naToken = await getToken({ req, secret: SECRET })
    if (naToken?.id) {
      userId = naToken.id as string
    } else if (naToken?.email) {
      const u = await prisma.user.findUnique({ where: { email: naToken.email as string }, select: { id: true } })
      userId = u?.id
    }

    // Bearer token fallback
    if (!userId) {
      const u = getUser(req)
      userId = u?.id
    }

    if (!userId) return err('Нэвтрэх шаардлагатай', 401)

    const body = await req.json().catch(() => ({}))
    const { username, bio, avatarUrl, country } = body
    const user = await updateProfile(userId, { username, bio, avatarUrl, country })
    return ok({ ok: true, user })
  } catch (e) { return handleError(e) }
}
