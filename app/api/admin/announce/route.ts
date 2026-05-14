import { NextRequest } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    requirePermission(req, 'notification.send')
    const { title, message, target = 'ALL', type = 'info' } = await req.json()
    if (!title || !message) return err('title, message шаардлагатай')

    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    let userWhere: Record<string, unknown> = {}
    if (target === 'PRO')    userWhere = { subscription: { plan: { in: ['PRO', 'VIP'] } } }
    if (target === 'NEW')    userWhere = { createdAt: { gte: sevenDaysAgo } }
    if (target === 'ACTIVE') userWhere = { activityLogs: { some: { createdAt: { gte: sevenDaysAgo } } } }

    const users = await prisma.user.findMany({ where: userWhere, select: { id: true } })
    if (users.length === 0) return ok({ sent: 0 })

    await prisma.notification.createMany({
      data: users.map(u => ({ userId: u.id, title, message, type })),
    })

    return ok({ sent: users.length })
  } catch (e) { return handleError(e) }
}