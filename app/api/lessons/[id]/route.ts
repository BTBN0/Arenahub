import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { requireAuth, getUser } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import { updateProgress, addXP } from '@/lib/services/game.service'
import { logActivity } from '@/lib/services/analytics.service'
import { cacheDel } from '@/lib/cache'
import prisma from '@/lib/db'

const CONTENT_ROLES = ['ADMIN','INSTRUCTOR','CONTENT_MANAGER']
async function resolveContentUser(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (secret) {
      const na = await getToken({ req, secret })
      if (na?.id) { const u = await prisma.user.findUnique({ where:{ id:na.id as string }, select:{ id:true, role:true } }); if (u && CONTENT_ROLES.includes(u.role)) return u }
      if (na?.email) { const u = await prisma.user.findUnique({ where:{ email:na.email as string }, select:{ id:true, role:true } }); if (u && CONTENT_ROLES.includes(u.role)) return u }
    }
  } catch {}
  const u = getUser(req)
  if (u && CONTENT_ROLES.includes(u.role)) return u
  return null
}

type Params = { params: Promise<{ id: string }> }

/* GET /api/lessons/:id */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const u      = requireAuth(req)
    const { id } = await params
    const lesson = await prisma.lesson.findUnique({
      where:   { id },
      include: {
        course:   { select: { title: true, id: true } },
        tasks:    {
          orderBy:  { orderIndex: 'asc' },
          include:  { submissions: { where: { userId: u.id } } },
        },
        progress: { where: { userId: u.id } },
      },
    })
    if (!lesson) return err('Хичээл олдсонгүй', 404)

    return ok({
      lesson: {
        ...lesson,
        completed: lesson.progress[0]?.completed ?? false,
        tasks: lesson.tasks.map(t => ({
          ...t,
          answer:    undefined,
          submitted: t.submissions[0] ?? null,
        })),
      }
    })
  } catch (e) { return handleError(e) }
}

/* POST /api/lessons/:id — complete lesson */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const u      = requireAuth(req)
    const { id } = await params
    const lesson = await prisma.lesson.findUnique({ where: { id } })
    if (!lesson) return err('Хичээл олдсонгүй', 404)

    await updateProgress(u.id, id, true)
    cacheDel(`lessons:${lesson.courseId}:${u.id}`)
    const result = await addXP(u.id, lesson.xpReward)
    logActivity(u.id, 'COMPLETE_LESSON', { lessonId: id, xp: lesson.xpReward }).catch(() => null)

    return ok({
      message:  'Хичээл дуусгалаа',
      xpEarned: lesson.xpReward,
      newXp:    result.user.xp,
      leveled:  result.leveled,
      newLevel: result.newLevel,
    })
  } catch (e) { return handleError(e) }
}

/* PUT /api/lessons/:id (admin/instructor) */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const cu = await resolveContentUser(req)
    if (!cu) return err('Эрх хүрэлцэхгүй', 403)
    const { id } = await params
    const data   = await req.json()
    return ok({ lesson: await prisma.lesson.update({ where: { id }, data }) })
  } catch (e) { return handleError(e) }
}

/* DELETE /api/lessons/:id (admin) */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const cu = await resolveContentUser(req)
    if (!cu || cu.role !== 'ADMIN') return err('Эрх хүрэлцэхгүй', 403)
    const { id } = await params
    await prisma.lesson.delete({ where: { id } })
    return ok({ message: 'Устгагдлаа' })
  } catch (e) { return handleError(e) }
}
