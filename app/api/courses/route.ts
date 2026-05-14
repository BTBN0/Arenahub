import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { ok, handleError } from '@/lib/api-helpers'
import { cacheGet, cacheSet, cacheClear } from '@/lib/cache'

export const dynamic = 'force-dynamic'

const courseSchema = z.object({
  title:       z.string().min(2),
  description: z.string().optional(),
  category:    z.string().min(2),
  difficulty:  z.enum(['BEGINNER','INTERMEDIATE','ADVANCED']),
  xpReward:    z.number().int().min(0).optional(),
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

    const payload = { ok: true, courses, pagination: { page, limit, total, pages: Math.ceil(total/limit) } }

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