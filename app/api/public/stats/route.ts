import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { cacheGet, cacheSet } from '@/lib/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const key    = 'public:stats'
    const cached = cacheGet<object>(key)
    if (cached) return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
    })

    const [courses, lessons, tasks, users] = await Promise.all([
      prisma.course.count({ where: { isActive: true } }),
      prisma.lesson.count(),
      prisma.task.count(),
      prisma.user.count(),
    ])

    const payload = { ok: true, courses, lessons, tasks, users, updatedAt: Date.now() }
    cacheSet(key, payload, 60_000)

    return NextResponse.json(payload, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
    })
  } catch {
    return NextResponse.json({ ok: false, courses: 8, lessons: 56, tasks: 280, users: 0 })
  }
}