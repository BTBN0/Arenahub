import { NextRequest } from 'next/server'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/db'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'

const gameSchema = z.object({
  name:        z.string().min(2),
  slug:        z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug: зөвхөн жижиг үсэг, тоо, зураас'),
  gameType:    z.string().min(1),
  description: z.string().optional(),
  thumbnail:   z.string().optional(),
  config:      z.record(z.unknown()).optional(),
  hpMax:       z.number().int().min(1).max(10).optional(),
  xpReward:    z.number().int().min(0).optional(),
  coinReward:  z.number().int().min(0).optional(),
  isActive:    z.boolean().optional(),
  tags:        z.array(z.string()).optional(),
})

// GET /api/admin/games?search=&gameType=&active=
export async function GET(req: NextRequest) {
  try {
    requirePermission(req, 'content.game')
    const { searchParams } = req.nextUrl
    const search   = searchParams.get('search')   ?? ''
    const gameType = searchParams.get('gameType') ?? ''
    const active   = searchParams.get('active')

    const where: Prisma.GameWhereInput = {}
    if (search)   where.name     = { contains: search, mode: 'insensitive' }
    if (gameType) where.gameType = gameType
    if (active === 'true')  where.isActive = true
    if (active === 'false') where.isActive = false

    const games = await prisma.game.findMany({
      where,
      orderBy:  { createdAt: 'desc' },
      include: {
        _count: {
          select: { gameTasks: true, lessonGames: true },
        },
      },
    })

    return ok({ games })
  } catch (e) { return handleError(e) }
}

// POST /api/admin/games
export async function POST(req: NextRequest) {
  try {
    requirePermission(req, 'content.game')
    const body = gameSchema.parse(await req.json())

    const exists = await prisma.game.findUnique({ where: { slug: body.slug } })
    if (exists) return err('Slug аль хэдийн ашиглагдаж байна', 409)

    const game = await prisma.game.create({
      data: {
        name:        body.name,
        slug:        body.slug,
        gameType:    body.gameType,
        description: body.description,
        thumbnail:   body.thumbnail,
        config:      (body.config ?? {}) as Prisma.InputJsonValue,
        hpMax:       body.hpMax       ?? 3,
        xpReward:    body.xpReward    ?? 50,
        isActive:    body.isActive    ?? true,
      },
    })

    return ok({ game }, 201)
  } catch (e) { return handleError(e) }
}
