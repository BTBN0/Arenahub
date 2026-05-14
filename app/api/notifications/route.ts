import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getUserNotifications, markAllAsRead } from '@/lib/services/notification.service'
import { ok, err, handleError } from '@/lib/api-helpers'
import { cacheGet, cacheSet, cacheDel } from '@/lib/cache'
import prisma from '@/lib/db'
export async function GET(req: NextRequest) {
  try {
    const u      = requireAuth(req)
    const unread = req.nextUrl.searchParams.get('unread') === 'true'
    const key    = `notif:${u.id}:${unread}`
    const cached = cacheGet<object>(key)
    if (cached) return ok(cached)
    const notifications = await getUserNotifications(u.id, unread)
    const data = { notifications }
    cacheSet(key, data, unread ? 20_000 : 15_000)
    return ok(data)
  } catch(e) { return handleError(e) }
}
export async function PATCH(req: NextRequest) {
  try {
    const u = requireAuth(req)
    await markAllAsRead(u.id)
    cacheDel(`notif:${u.id}:true`)
    cacheDel(`notif:${u.id}:false`)
    return ok({ message:'Уншсан' })
  } catch(e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const u    = requireAuth(req)
    const body = await req.json()
    const { title, message, type = 'info' } = body
    if (!title || !message) return err('title, message шаардлагатай')
    const notif = await prisma.notification.create({
      data: { userId: u.id, title, message, type }
    })
    cacheDel(`notif:${u.id}:true`)
    cacheDel(`notif:${u.id}:false`)
    return ok({ notification: notif })
  } catch (e) { return handleError(e) }
}
