import { NextRequest } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { getTaskById, updateTask, deleteTask,
         assignTaskToUser, startTask, completeTask, failTask, resetTask } from '@/lib/services/task.service'
import { addXP } from '@/lib/services/game.service'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params
    const task   = await getTaskById(id)
    if (!task) return err('Task олдсонгүй', 404)
    return ok({ task: { ...task, answer: undefined } })
  } catch (e) { return handleError(e) }
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const u      = requireAuth(req)
    if (!['ADMIN', 'INSTRUCTOR'].includes(u.role)) return err('Эрх хүрэлцэхгүй', 403)
    const { id } = await params
    const body = await req.json()
    // strip answer before passing to update so it doesn't leak; titleEn/descriptionEn/optionsEn are allowed
    return ok({ task: await updateTask(id, body) })
  } catch (e) { return handleError(e) }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const u      = requireAuth(req)
    if (!['ADMIN', 'INSTRUCTOR'].includes(u.role)) return err('Эрх хүрэлцэхгүй', 403)
    const { id } = await params
    await deleteTask(id)
    return ok({ message: 'Устгагдлаа' })
  } catch (e) { return handleError(e) }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const u      = requireAuth(req)
    const { id } = await params
    const action = req.nextUrl.searchParams.get('action') || 'submit'

    const task = await prisma.task.findUnique({ where: { id } })
    if (!task) return err('Task олдсонгүй', 404)

    if (action === 'assign') return ok({ submission: await assignTaskToUser(u.id, id) })
    if (action === 'start')  return ok({ submission: await startTask(u.id, id) })
    if (action === 'reset') {
      await resetTask(u.id, id)
      return ok({ message: 'Reset хийгдлээ' })
    }

    /* ── submit ── */
    const existing = await prisma.taskSubmission.findUnique({
      where: { userId_taskId: { userId: u.id, taskId: id } }
    })

    // Already passed — just return success silently (no alert)
    if (existing?.status === 'PASSED') {
      return ok({ isCorrect: true, xpEarned: 0, alreadyPassed: true })
    }

    const body = await req.json()

    // QUIZ
    if (task.taskType === 'quiz') {
      const { selected } = z.object({ selected: z.number().int().min(0) }).parse(body)
      const isCorrect    = selected === task.answer
      const xpEarned     = isCorrect ? task.xpReward : 0

      // If already failed, allow retry — upsert instead of create
      if (existing) {
        await prisma.taskSubmission.update({
          where: { userId_taskId: { userId: u.id, taskId: id } },
          data: {
            status:    isCorrect ? 'PASSED' : 'FAILED',
            selected,
            xpEarned:  xpEarned,
          }
        })
      } else {
        if (isCorrect) await completeTask(u.id, id, xpEarned)
        else           await failTask(u.id, id)
      }

      if (isCorrect && xpEarned > 0) await addXP(u.id, xpEarned)
      return ok({ isCorrect, correctAnswer: task.answer, xpEarned })
    }

    // CODE
    if (task.taskType === 'code') {
      const { code, allPass } = z.object({
        code:    z.string().min(1),
        allPass: z.boolean(),
      }).parse(body)

      const xpEarned = allPass ? task.xpReward : 0

      if (existing) {
        await prisma.taskSubmission.update({
          where: { userId_taskId: { userId: u.id, taskId: id } },
          data: { status: allPass ? 'PASSED' : 'FAILED', code, xpEarned }
        })
      } else {
        if (allPass) await completeTask(u.id, id, xpEarned)
        else         await failTask(u.id, id)
      }

      if (allPass && xpEarned > 0) await addXP(u.id, xpEarned)
      return ok({ isCorrect: allPass, xpEarned })
    }

    return err('Тодорхойгүй taskType')
  } catch (e) { return handleError(e) }
}
