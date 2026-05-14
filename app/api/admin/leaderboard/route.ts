import { NextRequest } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { ok, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

// POST /api/admin/leaderboard  body: { action: 'reset' }
export async function POST(req: NextRequest) {
  try {
    const admin  = requirePermission(req, 'leaderboard.reset')
    const { action } = await req.json()

    if (action === 'reset') {
      const { count } = await prisma.user.updateMany({
        data: { xp: 0, level: 1 },
      })

      await prisma.adminLog.create({
        data: { adminId: admin.id, action: 'LEADERBOARD_RESET', details: { affectedUsers: count } }
      })

      await prisma.notification.create({
        data: {
          userId: admin.id,
          title:  '⚠ Leaderboard reset хийгдлээ',
          message: `${count} хэрэглэгчийн XP болон level 0/1 болгогдлоо.`,
          type:   'warning',
        }
      })

      return ok({ message: `Leaderboard reset хийгдлээ. ${count} хэрэглэгч нөлөөлөгдлөө.`, count })
    }

    return ok({ message: 'action шаардлагатай' })
  } catch (e) { return handleError(e) }
}
