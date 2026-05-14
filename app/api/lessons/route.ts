import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'
import { cacheGet, cacheSet, cacheDel } from '@/lib/cache'

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

// POST /api/lessons  (content.lesson permission)
export async function POST(req: NextRequest) {
  try {
    requirePermission(req, 'content.lesson')
    const schema = z.object({ courseId:z.string(), title:z.string().min(2), content:z.string().optional(), videoUrl:z.string().optional(), xpReward:z.number().optional(), orderIndex:z.number().optional() })
    const d      = schema.parse(await req.json())
    const lesson = await prisma.lesson.create({ data: { ...d, xpReward:d.xpReward??50, orderIndex:d.orderIndex??0 } })
    return ok({ lesson }, 201)
  } catch (e) { return handleError(e) }
}