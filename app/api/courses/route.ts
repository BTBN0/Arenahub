import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/db'
import { requireAdmin, getUser } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { ok, handleError } from '@/lib/api-helpers'
import { cacheGet, cacheSet, cacheClear } from '@/lib/cache'

const FREE_COURSE_LIMIT = 2 // FREE plan-д зөвшөөрөгдөх course-ийн тоо

export const dynamic = 'force-dynamic'

const courseSchema = z.object({
  title:       z.string().min(2),
  description: z.string().optional(),
  category:    z.string().min(2),
  difficulty:  z.enum(['BEGINNER','INTERMEDIATE','ADVANCED']),
  xpReward:    z.number().int().min(0).optional(),
  orderIndex:  z.number().int().min(0).optional(),
})

export async function GET(req: NextRequest) {
  try {
    const sp         = req.nextUrl.searchParams
    const category   = sp.get('category')
    const difficulty = sp.get('difficulty') as 'BEGINNER'|'INTERMEDIATE'|'ADVANCED'|null
    const search     = sp.get('search')
    const page       = Math.max(1, parseInt(sp.get('page')||'1'))
    const limit      = Math.min(100, parseInt(sp.get('limit')||'12'))
    const skip       = (page - 1) * limit
    const isAdmin    = sp.get('admin') === 'true'

    if (isAdmin) requireAdmin(req)

    // Only cache public non-search requests
    const cacheKey = !isAdmin && !search
      ? `courses:${category||'all'}:${difficulty||'all'}:${page}:${limit}`
      : null

    if (cacheKey) {
      const cached = cacheGet<object>(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
        })
      }
    }

    const where: Record<string,unknown> = isAdmin ? {} : { isActive: true }
    if (category)   where.category   = category
    if (difficulty) where.difficulty  = difficulty
    if (search)     where.title       = { contains: search, mode: 'insensitive' }

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where, skip, take: limit,
        orderBy: { orderIndex: 'asc' },
        include: { _count: { select: { lessons:true, enrollments:true } } },
      }),
      prisma.course.count({ where }),
    ])

    // Determine user's plan to mark locked courses
    let isPaidUser = isAdmin
    if (!isPaidUser) {
      try {
        const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
        const na = secret ? await getToken({ req, secret }) : null
        let userId: string | undefined
        if (na?.id) userId = na.id as string
        else if (na?.email) {
          const u = await prisma.user.findUnique({ where: { email: na.email as string }, select: { id: true } })
          userId = u?.id
        }
        if (!userId) { const u = getUser(req); userId = u?.id }
        if (userId) {
          const sub = await prisma.subscription.findUnique({ where: { userId }, select: { plan: true } })
          const dbUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } })
          isPaidUser = (sub?.plan === 'PRO' || sub?.plan === 'VIP') || dbUser?.role === 'ADMIN'
        }
      } catch {}
    }

    // Mark courses beyond FREE limit as locked
    const coursesWithLock = courses.map((c, idx) => ({
      ...c,
      locked: !isPaidUser && idx >= FREE_COURSE_LIMIT,
    }))

    const payload = { ok: true, courses: coursesWithLock, pagination: { page, limit, total, pages: Math.ceil(total/limit) } }

    if (cacheKey) {
      cacheSet(cacheKey, payload, 60_000) // 60s
    }

    return NextResponse.json(payload, {
      headers: cacheKey
        ? { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' }
        : { 'Cache-Control': 'no-store' },
    })
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    requirePermission(req, 'content.course')
    const d      = courseSchema.parse(await req.json())
    const course = await prisma.course.create({ data: { ...d, xpReward: d.xpReward??100 } })
    cacheClear('courses:') // invalidate course list cache
    return ok({ course }, 201)
  } catch (e) { return handleError(e) }
}