import { NextRequest } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'

const updateSchema = z.object({
  name:        z.string().min(2).optional(),
  slug:        z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  gameType:    z.string().min(1).optional(),
  description: z.string().optional(),
  thumbnail:   z.string().optional(),
  config:      z.record(z.unknown()).optional(),
  hpMax:       z.number().int().min(1).max(10).optional(),
  xpReward:    z.number().int().min(0).optional(),
  isActive:    z.boolean().optional(),
})

type Ctx = { params: Promise<{ id: string }> }

// GET /api/admin/games/[id]
export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.game')
    const { id } = await params

    const game = await prisma.game.findUnique({
      where:   { id },
      include: {
        gameTasks: {
          orderBy: { orderIndex: 'asc' },
          include: {
            task: {
              select: {
                id: true, title: true, taskType: true, xpReward: true,
                lesson: { select: { id: true, title: true, course: { select: { id: true, title: true } } } },
              },
            },
          },
        },
        lessonGames: {
          include: { lesson: { select: { id: true, title: true, courseId: true } } },
        },
        _count: { select: { gameTasks: true, lessonGames: true } },
      },
    })

    if (!game) return err('Тоглоом олдсонгүй', 404)
    return ok({ game })
  } catch (e) { return handleError(e) }
}

// PUT /api/admin/games/[id]
export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.game')
    const { id } = await params
    const body = updateSchema.parse(await req.json())

    if (body.slug) {
      const conflict = await prisma.game.findFirst({ where: { slug: body.slug, NOT: { id } } })
      if (conflict) return err('Slug аль хэдийн ашиглагдаж байна', 409)
    }

    const { config, ...rest } = body
    const game = await prisma.game.update({
      where: { id },
      data:  { ...rest, ...(config !== undefined ? { config: config as Prisma.InputJsonValue } : {}) },
    })
    return ok({ game })
  } catch (e) { return handleError(e) }
}

// DELETE /api/admin/games/[id]  — soft delete (archive)
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.game')
    const { id } = await params
    const { searchParams } = req.nextUrl
    const hard = searchParams.get('hard') === 'true'

    if (hard) {
      await prisma.game.delete({ where: { id } })
      return ok({ deleted: true })
    }

    const game = await prisma.game.update({ where: { id }, data: { isActive: false } })
    return ok({ game, archived: true })
  } catch (e) { return handleError(e) }
}
