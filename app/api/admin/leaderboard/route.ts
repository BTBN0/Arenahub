import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getUser } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

async function resolveAdmin(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (secret) {
      const na = await getToken({ req, secret })
      if (na?.id) { const u = await prisma.user.findUnique({ where:{ id:na.id as string }, select:{ id:true, role:true } }); if (u?.role==='ADMIN') return u }
      if (na?.email) { const u = await prisma.user.findUnique({ where:{ email:na.email as string }, select:{ id:true, role:true } }); if (u?.role==='ADMIN') return u }
    }
  } catch {}
  const u = getUser(req)
  return u?.role === 'ADMIN' ? u : null
}

// POST /api/admin/leaderboard  body: { action: 'reset' }
export async function POST(req: NextRequest) {
  try {
    const admin = await resolveAdmin(req)
    if (!admin) return err('Эрх хүрэлцэхгүй', 403)

    const { action } = await req.json()

    if (action === 'reset') {
      // Reset XP only — level хэвээр үлдэнэ
      const { count } = await prisma.user.updateMany({
        data: { xp: 0 },
      })

      await prisma.adminLog.create({
        data: { adminId: admin.id, action: 'LEADERBOARD_RESET', details: { affectedUsers: count } }
      })

      await prisma.notification.create({
        data: {
          userId:  admin.id,
          title:   '⚠ Leaderboard XP reset хийгдлээ',
          message: `${count} хэрэглэгчийн XP 0 болгогдлоо. Level хэвээр үлдлээ.`,
          type:    'warning',
        }
      })

      return ok({ message: `Leaderboard XP reset хийгдлээ. ${count} хэрэглэгч нөлөөлөгдлөө. Level хэвээр үлдлээ.`, count })
    }

    return err('action шаардлагатай')
  } catch (e) { return handleError(e) }
}
