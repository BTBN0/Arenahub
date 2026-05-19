import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { logoutUser } from '@/lib/services/auth.service'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'
import { cacheGet, cacheSet, cacheDel } from '@/lib/cache'

/* GET /api/auth → me  (server-side cache 10s per user) */
export async function GET(req: NextRequest) {
  try {
    const u   = requireAuth(req)
    const key = `user:${u.id}`

    const cached = cacheGet<object>(key)
    if (cached) return NextResponse.json({ ok: true, user: cached })

    const user = await prisma.user.findUnique({
      where:  { id: u.id },
      select: {
        id: true, username: true, email: true, role: true,
        xp: true, level: true, coins: true, avatarUrl: true, bio: true, country: true,
        isEmailVerified: true, googleId: true, createdAt: true,
        subscription: { select: { plan: true, endDate: true } },
        _count: { select: { enrollments:true, taskSubmissions:true, lessonProgress:true } },
      },
    })
    if (!user) return err('Хэрэглэгч олдсонгүй', 404)

    cacheSet(key, user, 10_000)
    return NextResponse.json({ ok: true, user })
  } catch (e) { return handleError(e) }
}

/* POST /api/auth?action=logout */
export async function POST(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get('action')

    if (action === 'logout') {
      const u = requireAuth(req)
      await logoutUser(u.id)
      cacheDel(`user:${u.id}`)
      return ok({ message: 'Гарлаа' })
    }

    return err('action: logout')
  } catch (e) { return handleError(e) }
}
