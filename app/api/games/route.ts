import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { ok, handleError } from '@/lib/api-helpers'

// GET /api/games?gameType=&search=&limit=
// Public read-only list of all active games — used by course/lesson pages for selection
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const gameType = searchParams.get('gameType') ?? ''
    const search   = searchParams.get('search')   ?? ''
    const limit    = Math.min(parseInt(searchParams.get('limit') ?? '100'), 200)

    const games = await prisma.game.findMany({
      where: {
        isActive: true,
        ...(gameType ? { gameType } : {}),
        ...(search   ? { name: { contains: search, mode: 'insensitive' } } : {}),
      },
      orderBy: { name: 'asc' },
      take:    limit,
      include: {
        _count: { select: { gameTasks: true, lessonGames: true } },
      },
    })

    return ok({ games })
  } catch (e) { return handleError(e) }
}
