import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

const DAILY_GRANT  = 50
const GRANT_ACTION = 'daily_grant'
const HOURS_24     = 24 * 60 * 60 * 1000

export async function GET(req: NextRequest) {
  try {
    const u = requireAuth(req)

    // Check if already granted in the last 24 hours
    const since    = new Date(Date.now() - HOURS_24)
    const lastGrant = await prisma.tokenUsage.findFirst({
      where: { userId: u.id, action: GRANT_ACTION, createdAt: { gte: since } },
      orderBy: { createdAt: 'desc' },
    })

    let dailyGranted = false
    let nextGrantAt: Date | null = null

    if (!lastGrant) {
      // Grant 50 tokens
      await prisma.tokenBalance.upsert({
        where:  { userId: u.id },
        update: { balance: { increment: DAILY_GRANT } },
        create: { userId: u.id, balance: DAILY_GRANT, totalUsed: 0 },
      })
      await prisma.tokenUsage.create({
        data: { userId: u.id, action: GRANT_ACTION, cost: DAILY_GRANT },
      })
      dailyGranted = true

      await prisma.notification.create({
        data: {
          userId:  u.id,
          title:   '🪙 Өдрийн Token Ирлээ!',
          message: `+${DAILY_GRANT} token авлаа. Маргааш дахин нэмэгдэнэ.`,
          type:    'success',
        },
      }).catch(() => null)
    } else {
      nextGrantAt = new Date(lastGrant.createdAt.getTime() + HOURS_24)
    }

    const bal  = await prisma.tokenBalance.findUnique({ where: { userId: u.id } })
    const used = await prisma.tokenUsage.count({ where: { userId: u.id, action: { not: GRANT_ACTION } } })

    return ok({
      balance:      bal?.balance    ?? 0,
      totalUsed:    bal?.totalUsed  ?? 0,
      requests:     used,
      dailyGranted,
      nextGrantAt,
    })
  } catch (e) { return handleError(e) }
}