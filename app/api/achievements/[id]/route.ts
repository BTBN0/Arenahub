import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

type P = { params: Promise<{ id: string }> }

export async function DELETE(req: NextRequest, { params }: P) {
  try {
    requireAdmin(req)
    const { id } = await params
    const exists = await prisma.achievement.findUnique({ where: { id }, select: { id: true } })
    if (!exists) return err('Achievement олдсонгүй', 404)
    await prisma.userAchievement.deleteMany({ where: { achievementId: id } })
    await prisma.achievement.delete({ where: { id } })
    return ok({ message: 'Устгагдлаа' })
  } catch (e) { return handleError(e) }
}

export async function PUT(req: NextRequest, { params }: P) {
  try {
    requireAdmin(req)
    const { id } = await params
    const data = await req.json()
    const ach = await prisma.achievement.update({ where: { id }, data })
    return ok({ achievement: ach })
  } catch (e) { return handleError(e) }
}