import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import { requirePermission } from '@/lib/permissions'
import { ok, handleError } from '@/lib/api-helpers'

// GET /api/admin/tasks?search=&taskType=&lessonId=&courseId=
// Returns all tasks with lesson + course info — for admin task pool assignment
export async function GET(req: NextRequest) {
  try {
    requirePermission(req, 'content.task')
    const sp       = req.nextUrl.searchParams
    const search   = sp.get('search')   ?? ''
    const taskType = sp.get('taskType') ?? ''
    const lessonId = sp.get('lessonId') ?? ''
    const courseId = sp.get('courseId') ?? ''

    const where: Prisma.TaskWhereInput = {}
    if (search)   where.title    = { contains: search, mode: 'insensitive' }
    if (taskType) where.taskType = taskType
    if (lessonId) where.lessonId = lessonId
    if (courseId) where.lesson   = { courseId }

    const tasks = await prisma.task.findMany({
      where,
      orderBy: [{ lesson: { course: { title: 'asc' } } }, { lesson: { title: 'asc' } }, { orderIndex: 'asc' }],
      select: {
        id: true, title: true, titleEn: true, taskType: true,
        xpReward: true, orderIndex: true,
        lesson: {
          select: {
            id: true, title: true,
            course: { select: { id: true, title: true } },
          },
        },
        _count: { select: { submissions: true } },
      },
    })

    return ok({ tasks })
  } catch (e) { return handleError(e) }
}
