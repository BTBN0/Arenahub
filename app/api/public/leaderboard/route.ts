import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const key    = 'public:lb:top10'
    const cached = cacheGet<object>(key)
    if (cached) return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' }
    })

    const users = await prisma.user.findMany({
      orderBy: { xp: 'desc' },
      take:    10,
      select:  { id:true, username:true, xp:true, level:true, avatarUrl:true, country:true },
    })

    const payload = { ok: true, users, updatedAt: Date.now() }
    cacheSet(key, payload, 15_000)

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' }
    })
  } catch {
    return NextResponse.json({ ok: false, users: [] })
  }
}