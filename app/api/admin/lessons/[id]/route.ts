import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'
import { cacheClear } from '@/lib/cache'

type Ctx = { params: Promise<{ id: string }> }

// GET /api/admin/lessons/[id] — lesson detail with games + tasks for admin
export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.lesson')
    const { id } = await params

    const lesson = await prisma.lesson.findUnique({
      where: { id },
      include: {
        course: { select: { id: true, title: true, category: true } },
        lessonGames: {
          orderBy: { orderIndex: 'asc' },
          include: {
            game: {
              include: { _count: { select: { gameTasks: true, lessonGames: true } } },
            },
          },
        },
        _count: { select: { tasks: true, progress: true } },
      },
    })

    if (!lesson) return err('Хичээл олдсонгүй', 404)
    return ok({ lesson })
  } catch (e) { return handleError(e) }
}

// PATCH /api/admin/lessons/[id] — update lesson fields (admin)
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.lesson')
    const { id } = await params
    const body = await req.json() as Prisma.LessonUpdateInput

    const lesson = await prisma.lesson.update({ where: { id }, data: body })
    cacheClear(`lessons:${lesson.courseId}`)
    return ok({ lesson })
  } catch (e) { return handleError(e) }
}
