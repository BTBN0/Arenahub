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
  if (u?.role === 'ADMIN') return { id: u.id, role: u.role }
  return null
}

// POST /api/admin/adjust
// body: { userId, type: 'xp'|'coins'|'tokens', delta: number }
export async function POST(req: NextRequest) {
  try {
    const admin = await resolveAdmin(req)
    if (!admin) return err('Эрх хүрэлцэхгүй', 403)
    const { userId, type, delta, note } = await req.json()

    if (!userId || !type || typeof delta !== 'number') {
      return err('userId, type, delta шаардлагатай')
    }
    if (!['xp', 'coins', 'tokens'].includes(type)) {
      return err('type: xp | coins | tokens')
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return err('Хэрэглэгч олдсонгүй', 404)

    let result: Record<string, unknown> = {}

    if (type === 'xp') {
      const newXp    = Math.max(0, user.xp + delta)
      const newLevel = Math.max(1, Math.floor(newXp / 200) + 1)
      const updated  = await prisma.user.update({
        where: { id: userId },
        data: { xp: newXp, level: newLevel },
        select: { id: true, username: true, xp: true, level: true },
      })
      result = updated
    }

    if (type === 'coins') {
      const newCoins = Math.max(0, user.coins + delta)
      const updated  = await prisma.user.update({
        where: { id: userId },
        data: { coins: newCoins },
        select: { id: true, username: true, coins: true },
      })
      result = updated
    }

    if (type === 'tokens') {
      const balance = await prisma.tokenBalance.findUnique({ where: { userId } })
      const current = balance?.balance ?? 0
      const newBal  = Math.max(0, current + delta)
      const updated = await prisma.tokenBalance.upsert({
        where:  { userId },
        update: { balance: newBal },
        create: { userId, balance: Math.max(0, delta), totalUsed: 0 },
      })
      result = updated
    }

    await prisma.adminLog.create({
      data: {
        adminId:  admin.id,
        action:   `ADJUST_${type.toUpperCase()}`,
        targetId: userId,
        details:  { delta, note, before: type === 'xp' ? user.xp : type === 'coins' ? user.coins : null },
      },
    })

    return ok({ result, message: `${user.username}-д ${delta > 0 ? '+' : ''}${delta} ${type} нэмэгдлээ` })
  } catch (e) { return handleError(e) }
}
