import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string }> }

// GET /api/admin/lessons/[id]/games — all games assigned to lesson
export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.lesson')
    const { id } = await params

    const lessonGames = await prisma.lessonGame.findMany({
      where:   { lessonId: id },
      orderBy: { orderIndex: 'asc' },
      include: {
        game: {
          include: { _count: { select: { gameTasks: true, lessonGames: true } } },
        },
      },
    })

    return ok({
      games: lessonGames.map(lg => ({
        lessonGameId: lg.id,
        orderIndex:   lg.orderIndex,
        game:         lg.game,
      })),
    })
  } catch (e) { return handleError(e) }
}

// POST /api/admin/lessons/[id]/games — assign game to lesson
export async function POST(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.lesson')
    const { id } = await params
    const { gameId } = z.object({ gameId: z.string() }).parse(await req.json())

    const lesson = await prisma.lesson.findUnique({ where: { id } })
    if (!lesson) return err('Хичээл олдсонгүй', 404)

    const game = await prisma.game.findUnique({ where: { id: gameId } })
    if (!game) return err('Тоглоом олдсонгүй', 404)

    const exists = await prisma.lessonGame.findUnique({
      where: { lessonId_gameId: { lessonId: id, gameId } },
    })
    if (exists) return err('Тоглоом аль хэдийн оноогдсон байна', 409)

    const maxOrder = await prisma.lessonGame.aggregate({
      where: { lessonId: id },
      _max:  { orderIndex: true },
    })
    const nextOrder = (maxOrder._max.orderIndex ?? -1) + 1

    const lessonGame = await prisma.lessonGame.create({
      data:    { lessonId: id, gameId, orderIndex: nextOrder },
      include: { game: { include: { _count: { select: { gameTasks: true, lessonGames: true } } } } },
    })

    return ok({ lessonGame }, 201)
  } catch (e) { return handleError(e) }
}

// PATCH /api/admin/lessons/[id]/games/reorder — bulk reorder
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.lesson')
    const { id } = await params
    const { order } = z.object({
      order: z.array(z.object({ gameId: z.string(), orderIndex: z.number().int() })),
    }).parse(await req.json())

    await Promise.all(
      order.map(({ gameId, orderIndex }) =>
        prisma.lessonGame.update({
          where: { lessonId_gameId: { lessonId: id, gameId } },
          data:  { orderIndex },
        })
      )
    )

    return ok({ reordered: true })
  } catch (e) { return handleError(e) }
}
