import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { requireAuth, getUser } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import { updateProgress, addXP } from '@/lib/services/game.service'
import { logActivity } from '@/lib/services/analytics.service'
import { cacheDel, cacheClear } from '@/lib/cache'
import {
  fetchLessonDetail,
  getCachedLessonDetail,
  setCachedLessonDetail,
  invalidateLessonDetailCache,
  invalidateLessonDetailForAll,
} from '@/lib/services/lesson.service'
import prisma from '@/lib/db'

const clearLessonListCache = (courseId: string) => cacheClear(`lessons:${courseId}`)

const CONTENT_ROLES = ['ADMIN', 'INSTRUCTOR', 'CONTENT_MANAGER']

async function resolveContentUser(req: NextRequest) {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (secret) {
      const na = await getToken({ req, secret })
      if (na?.id) {
        const u = await prisma.user.findUnique({ where: { id: na.id as string }, select: { id: true, role: true } })
        if (u && CONTENT_ROLES.includes(u.role)) return u
      }
      if (na?.email) {
        const u = await prisma.user.findUnique({ where: { email: na.email as string }, select: { id: true, role: true } })
        if (u && CONTENT_ROLES.includes(u.role)) return u
      }
    }
  } catch { /* NextAuth not configured */ }
  const u = getUser(req)
  if (u && CONTENT_ROLES.includes(u.role)) return u
  return null
}

type Params = { params: Promise<{ id: string }> }

/* ──────────────────────────────────────────────────────────────────────────
   GET /api/lessons/:id
   Returns the full lesson detail: lesson + assigned games (with tasks) +
   legacy direct tasks (backward-compat).

   Query cost: 2 DB round-trips regardless of game/task count (no N+1).
   ────────────────────────────────────────────────────────────────────────── */
export async function GET(req: NextRequest, { params }: Params) {
  try {
    const u      = requireAuth(req)
    const { id } = await params

    // ── Cache hit ──────────────────────────────────────────────────────────
    const cached = getCachedLessonDetail(id, u.id)
    if (cached) return ok(cached)

    // ── Fetch via service (2 queries, no N+1) ──────────────────────────────
    const detail = await fetchLessonDetail(id, u.id)
    if (!detail) return err('Хичээл олдсонгүй', 404)

    // ── Cache + respond ────────────────────────────────────────────────────
    setCachedLessonDetail(id, u.id, detail)
    return ok(detail)
  } catch (e) { return handleError(e) }
}

/* ──────────────────────────────────────────────────────────────────────────
   POST /api/lessons/:id — mark lesson as complete, award XP
   ────────────────────────────────────────────────────────────────────────── */
export async function POST(req: NextRequest, { params }: Params) {
  try {
    const u      = requireAuth(req)
    const { id } = await params

    const lesson = await prisma.lesson.findUnique({
      where:  { id },
      select: { courseId: true, xpReward: true },
    })
    if (!lesson) return err('Хичээл олдсонгүй', 404)

    await updateProgress(u.id, id, true)

    // Invalidate both the lesson detail cache and the course lesson-list cache
    invalidateLessonDetailCache(id, u.id)
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

/* ──────────────────────────────────────────────────────────────────────────
   PUT /api/lessons/:id — admin/instructor update lesson fields
   ────────────────────────────────────────────────────────────────────────── */
export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const cu = await resolveContentUser(req)
    if (!cu) return err('Эрх хүрэлцэхгүй', 403)
    const { id }  = await params
    const data    = await req.json()
    const lesson  = await prisma.lesson.update({ where: { id }, data })

    // Content changed — bust all per-user detail caches for this lesson
    invalidateLessonDetailForAll(id)
    clearLessonListCache(lesson.courseId)

    return ok({ lesson })
  } catch (e) { return handleError(e) }
}

/* ──────────────────────────────────────────────────────────────────────────
   DELETE /api/lessons/:id — admin only
   ────────────────────────────────────────────────────────────────────────── */
export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const cu = await resolveContentUser(req)
    if (!cu || cu.role !== 'ADMIN') return err('Эрх хүрэлцэхгүй', 403)
    const { id }   = await params
    const lesson   = await prisma.lesson.findUnique({ where: { id }, select: { courseId: true } })

    await prisma.lesson.delete({ where: { id } })

    if (lesson) {
      invalidateLessonDetailForAll(id)
      clearLessonListCache(lesson.courseId)
    }

    return ok({ message: 'Устгагдлаа' })
  } catch (e) { return handleError(e) }
}
