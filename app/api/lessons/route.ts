import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/db'
import { requireAuth, getUser } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import { cacheGet, cacheSet } from '@/lib/cache'

const CONTENT_ROLES = ['ADMIN','INSTRUCTOR','CONTENT_MANAGER']

async function resolveContentUser(req: NextRequest) {
  // 1. NextAuth cookie
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (secret) {
      const na = await getToken({ req, secret })
      if (na?.id) {
        const u = await prisma.user.findUnique({ where: { id: na.id as string }, select: { id:true, role:true } })
        if (u && CONTENT_ROLES.includes(u.role)) return u
      }
      if (na?.email) {
        const u = await prisma.user.findUnique({ where: { email: na.email as string }, select: { id:true, role:true } })
        if (u && CONTENT_ROLES.includes(u.role)) return u
      }
    }
  } catch {}
  // 2. Bearer token fallback
  const u = getUser(req)
  if (u && CONTENT_ROLES.includes(u.role)) return u
  return null
}

// GET /api/lessons?courseId=
export async function GET(req: NextRequest) {
  try {
    const u        = requireAuth(req)
    const courseId = req.nextUrl.searchParams.get('courseId')
    if (!courseId) return err('courseId шаардлагатай')

    const key    = `lessons:${courseId}:${u.id}`
    const cached = cacheGet<object>(key)
    if (cached) return ok(cached)

    const lessons = await prisma.lesson.findMany({
      where:   { courseId },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count:   { select:{ tasks:true } },
        progress: { where:{ userId:u.id } },
      }
    })

    const data = { lessons: lessons.map(l => ({
      ...l,
      completed:   l.progress[0]?.completed ?? false,
      completedAt: l.progress[0]?.completedAt ?? null,
      taskCount:   l._count.tasks,
    })) }
    cacheSet(key, data, 30_000)
    return ok(data)
  } catch (e) { return handleError(e) }
}

// POST /api/lessons  (admin / instructor / content_manager)
export async function POST(req: NextRequest) {
  try {
    const cu = await resolveContentUser(req)
    if (!cu) return err('Эрх хүрэлцэхгүй', 403)
    const schema = z.object({
      courseId:   z.string(),
      title:      z.string().min(2),
      content:    z.string().optional(),
      videoUrl:   z.string().optional(),
      xpReward:   z.number().optional(),
      orderIndex: z.number().optional(),
    })
    const d      = schema.parse(await req.json())
    const lesson = await prisma.lesson.create({ data: { ...d, xpReward:d.xpReward??50, orderIndex:d.orderIndex??0 } })
    return ok({ lesson }, 201)
  } catch (e) { return handleError(e) }
}