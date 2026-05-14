import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getUser } from '@/lib/auth'
import { handleError, err } from '@/lib/api-helpers'
import prisma from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/cache'

export const dynamic = 'force-dynamic'

const SECRET  = process.env.NEXTAUTH_SECRET!
const SELECT  = { id:true, username:true, xp:true, level:true, avatarUrl:true, country:true, bio:true, streakCount:true, _count:{ select:{ taskSubmissions:true, enrollments:true } } }
const ALLOWED = ['PRO','VIP']

export async function GET(req: NextRequest) {
  try {
    /* ── Auth + subscription check ── */
    let userId: string | undefined
    let role: string | undefined

    const naToken = await getToken({ req, secret: SECRET })
    if (naToken?.id) { userId = naToken.id as string; role = naToken.role as string }
    else if (naToken?.email) {
      const u = await prisma.user.findUnique({ where:{ email: naToken.email as string }, select:{ id:true, role:true } })
      userId = u?.id; role = u?.role
    }
    if (!userId) { const u = getUser(req); userId = u?.id; role = u?.role }
    if (!userId) return err('Нэвтрэх шаардлагатай', 401)

    if (role !== 'ADMIN') {
      const sub = await prisma.subscription.findUnique({ where:{ userId }, select:{ plan:true } })
      if (!sub || !ALLOWED.includes(sub.plan)) return err('PRO эсвэл VIP эрх шаардлагатай', 403)
    }

    const sp     = req.nextUrl.searchParams
    const search = sp.get('search')?.trim()
    const limit  = Math.min(parseInt(sp.get('limit') || '20'), 50)

    // search mode — skip cache, return matched users with their rank
    if (search) {
      const all = await prisma.user.findMany({ orderBy:{ xp:'desc' }, select: SELECT })
      const matched = all
        .map((u, i) => ({ ...u, rank: i + 1 }))
        .filter(u => u.username.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 10)
      return NextResponse.json({ ok: true, users: matched, total: matched.length, isSearch: true })
    }

    const key    = `leaderboard:${limit}`
    const cached = cacheGet<object>(key)
    if (cached) {
      return NextResponse.json(cached, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } })
    }

    const users = await prisma.user.findMany({ orderBy:{ xp:'desc' }, take: limit, select: SELECT })
    const payload = { ok: true, users, total: users.length }
    cacheSet(key, payload, 30_000)

    return NextResponse.json(payload, { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120' } })
  } catch (e) { return handleError(e) }
}