import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string; gameId: string }> }

// DELETE /api/admin/lessons/[id]/games/[gameId] — remove game from lesson
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.lesson')
    const { id, gameId } = await params

    const lessonGame = await prisma.lessonGame.findUnique({
      where: { lessonId_gameId: { lessonId: id, gameId } },
    })
    if (!lessonGame) return err('LessonGame олдсонгүй', 404)

    await prisma.lessonGame.delete({
      where: { lessonId_gameId: { lessonId: id, gameId } },
    })

    // Re-compact orderIndex so there are no gaps
    const remaining = await prisma.lessonGame.findMany({
      where:   { lessonId: id },
      orderBy: { orderIndex: 'asc' },
    })
    await Promise.all(
      remaining.map((lg, i) =>
        prisma.lessonGame.update({ where: { id: lg.id }, data: { orderIndex: i } })
      )
    )

    return ok({ removed: true })
  } catch (e) { return handleError(e) }
}
