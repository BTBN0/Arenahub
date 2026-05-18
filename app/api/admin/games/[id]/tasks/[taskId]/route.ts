import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'

type Ctx = { params: Promise<{ id: string; taskId: string }> }

// DELETE /api/admin/games/[id]/tasks/[taskId] — remove task from pool
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.game')
    const { id, taskId } = await params

    const gameTask = await prisma.gameTask.findUnique({
      where: { gameId_taskId: { gameId: id, taskId } },
    })
    if (!gameTask) return err('GameTask олдсонгүй', 404)

    await prisma.gameTask.delete({ where: { gameId_taskId: { gameId: id, taskId } } })
    return ok({ removed: true })
  } catch (e) { return handleError(e) }
}

// PATCH /api/admin/games/[id]/tasks/[taskId] — update orderIndex
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    requirePermission(req, 'content.game')
    const { id, taskId } = await params
    const body = await req.json() as { orderIndex?: number }

    if (typeof body.orderIndex !== 'number') return err('orderIndex шаардлагатай', 400)

    const gameTask = await prisma.gameTask.update({
      where: { gameId_taskId: { gameId: id, taskId } },
      data:  { orderIndex: body.orderIndex },
    })
    return ok({ gameTask })
  } catch (e) { return handleError(e) }
}
