import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

// GET /api/admin/games/[id]/tasks — task pool for this game
export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.game')
    const { id } = await params

    const gameTasks = await prisma.gameTask.findMany({
      where:   { gameId: id },
      orderBy: { orderIndex: 'asc' },
      include: {
        task: {
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
        },
      },
    })

    return ok({ tasks: gameTasks.map(gt => ({ ...gt.task, orderIndex: gt.orderIndex, gameTaskId: gt.id })) })
  } catch (e) { return handleError(e) }
}

// POST /api/admin/games/[id]/tasks — add task to game pool
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.game')
    const { id } = await params
    const { taskId, orderIndex } = z.object({
      taskId:     z.string(),
      orderIndex: z.number().int().optional(),
    }).parse(await req.json())

    const game = await prisma.game.findUnique({ where: { id } })
    if (!game) return err('Тоглоом олдсонгүй', 404)

    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) return err('Даалгавар олдсонгүй', 404)

    const exists = await prisma.gameTask.findUnique({
      where: { gameId_taskId: { gameId: id, taskId } },
    })
    if (exists) return err('Даалгавар аль хэдийн нэмэгдсэн байна', 409)

    const maxOrder = await prisma.gameTask.aggregate({
      where: { gameId: id },
      _max:  { orderIndex: true },
    })
    const nextOrder = orderIndex ?? (maxOrder._max.orderIndex ?? -1) + 1

    const gameTask = await prisma.gameTask.create({
      data: { gameId: id, taskId, orderIndex: nextOrder },
    })

    return ok({ gameTask }, 201)
  } catch (e) { return handleError(e) }
}

// PATCH /api/admin/games/[id]/tasks — bulk reorder
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.game')
    const { id } = await params
    const { order } = z.object({
      order: z.array(z.object({ taskId: z.string(), orderIndex: z.number().int() })),
    }).parse(await req.json())

    await Promise.all(
      order.map(({ taskId, orderIndex }) =>
        prisma.gameTask.update({
          where: { gameId_taskId: { gameId: id, taskId } },
          data:  { orderIndex },
        })
      )
    )

    return ok({ reordered: true })
  } catch (e) { return handleError(e) }
}
