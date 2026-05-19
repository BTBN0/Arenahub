import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import { requirePermission } from '@/lib/permissions'
import { ok, handleError } from '@/lib/api-helpers'

// GET /api/admin/lessons?search=&courseId=&limit=
export async function GET(req: NextRequest) {
  try {
    requirePermission(req, 'content.game')
    const { searchParams } = req.nextUrl
    const search   = searchParams.get('search')   ?? ''
    const courseId = searchParams.get('courseId') ?? ''
    const limit    = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

    const where: Prisma.LessonWhereInput = {}
    if (search)   where.title    = { contains: search, mode: 'insensitive' }
    if (courseId) where.courseId = courseId

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: [{ course: { title: 'asc' } }, { orderIndex: 'asc' }],
      take: limit,
      select: {
        id: true, title: true, orderIndex: true,
        course: { select: { id: true, title: true } },
        lessonGames: { select: { game: { select: { id: true, name: true } } } },
      },
    })

    return ok({ lessons })
  } catch (e) { return handleError(e) }
}
