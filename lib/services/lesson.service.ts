import prisma from '../db'
import { cacheGet, cacheSet, cacheDel, cacheClear } from '../cache'

// ── Response types ─────────────────────────────────────────────────────────

export type SubmissionResponse = {
  status:      string
  selected:    number | null
  xpEarned:    number
  submittedAt: Date
}

export type TaskResponse = {
  id:            string
  title:         string
  titleEn:       string | null
  description:   string
  descriptionEn: string | null
  taskType:      string
  options:       unknown
  optionsEn:     unknown
  starterCode:   string | null
  testCases:     unknown
  xpReward:      number
  orderIndex:    number
  // answer is NEVER included — omitted at serializer level
  submitted:     SubmissionResponse | null
}

export type GameResponse = {
  id:         string
  name:       string
  slug:       string
  gameType:   string
  thumbnail:  string | null
  config:     Record<string, unknown>
  hpMax:      number
  xpReward:   number
  orderIndex: number   // LessonGame.orderIndex (position in lesson)
  tasks:      TaskResponse[]
}

export type LessonCourseRef = { id: string; title: string }

export type LessonDetailResponse = {
  lesson: {
    id:          string
    title:       string
    content:     string | null
    gameType:    string | null   // legacy field — kept until Phase 5 cleanup
    xpReward:    number
    orderIndex:  number
    courseId:    string
    course:      LessonCourseRef
    completed:   boolean
    completedAt: Date | null
  }
  games: GameResponse[]          // primary: ordered, active games with their task pools
  tasks: TaskResponse[]          // backward-compat: direct Lesson→Task relation
  meta: {
    hasGames:      boolean       // true when at least one game is assigned
    totalGameTasks: number       // sum of tasks across all games
    totalDirectTasks: number     // legacy task count
  }
}

// ── Internal raw types (Prisma result shapes) ──────────────────────────────

type RawTask = {
  id: string; title: string; titleEn: string | null
  description: string; descriptionEn: string | null
  taskType: string; options: unknown; optionsEn: unknown
  starterCode: string | null; testCases: unknown
  xpReward: number; orderIndex: number
}

type RawSub = {
  taskId:      string
  status:      string
  selected:    number | null
  xpEarned:    number
  submittedAt: Date
}

// ── Serializer ─────────────────────────────────────────────────────────────

function serializeTask(task: RawTask, subMap: Map<string, RawSub>): TaskResponse {
  const sub = subMap.get(task.id)
  return {
    id:            task.id,
    title:         task.title,
    titleEn:       task.titleEn,
    description:   task.description,
    descriptionEn: task.descriptionEn,
    taskType:      task.taskType,
    options:       task.options,
    optionsEn:     task.optionsEn,
    starterCode:   task.starterCode,
    testCases:     task.testCases,
    xpReward:      task.xpReward,
    orderIndex:    task.orderIndex,
    // answer is intentionally excluded — never sent to client
    submitted: sub
      ? { status: sub.status, selected: sub.selected, xpEarned: sub.xpEarned, submittedAt: sub.submittedAt }
      : null,
  }
}

// ── Primary query — single Prisma call + one submission batch ──────────────

const TASK_SELECT = {
  id: true, title: true, titleEn: true,
  description: true, descriptionEn: true,
  taskType: true, options: true, optionsEn: true,
  starterCode: true, testCases: true,
  xpReward: true, orderIndex: true,
  // answer: deliberately excluded
} as const

export async function fetchLessonDetail(
  lessonId: string,
  userId:   string,
): Promise<LessonDetailResponse | null> {
  // ── Step 1: Lesson + games + game-tasks (single query, no N+1) ────────────
  const raw = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true, title: true, content: true, gameType: true,
      xpReward: true, orderIndex: true, courseId: true,
      course: { select: { id: true, title: true } },

      // Active games assigned to this lesson, sorted by assignment order
      lessonGames: {
        where:   { game: { isActive: true } },
        orderBy: { orderIndex: 'asc' },
        select: {
          id:         true,
          orderIndex: true,
          game: {
            select: {
              id: true, name: true, slug: true, gameType: true,
              thumbnail: true, config: true, hpMax: true, xpReward: true,
              gameTasks: {
                orderBy: { orderIndex: 'asc' },
                select: {
                  orderIndex: true,
                  task: { select: TASK_SELECT },
                },
              },
            },
          },
        },
      },

      // Legacy direct tasks — kept until Phase 5 removes gameType dependency
      tasks: {
        orderBy: { orderIndex: 'asc' },
        select:  TASK_SELECT,
      },

      // Lesson completion for this user
      progress: {
        where:  { userId },
        select: { completed: true, completedAt: true },
      },
    },
  })

  if (!raw) return null

  // ── Step 2: Collect all task IDs from both game tasks and direct tasks ────
  const gameTaskIds   = raw.lessonGames.flatMap(lg => lg.game.gameTasks.map(gt => gt.task.id))
  const directTaskIds = raw.tasks.map(t => t.id)
  const allTaskIds    = [...new Set([...gameTaskIds, ...directTaskIds])]

  // ── Step 3: Single submission batch query (no N+1 regardless of task count)
  const submissions: RawSub[] = allTaskIds.length > 0
    ? await prisma.taskSubmission.findMany({
        where:  { userId, taskId: { in: allTaskIds } },
        select: { taskId: true, status: true, selected: true, xpEarned: true, submittedAt: true },
      })
    : []

  const subMap = new Map<string, RawSub>(submissions.map(s => [s.taskId, s]))

  // ── Step 4: Serialize ──────────────────────────────────────────────────────
  const progress = raw.progress[0]

  const games: GameResponse[] = raw.lessonGames.map(lg => ({
    id:         lg.game.id,
    name:       lg.game.name,
    slug:       lg.game.slug,
    gameType:   lg.game.gameType,
    thumbnail:  lg.game.thumbnail,
    config:     (lg.game.config as Record<string, unknown>) ?? {},
    hpMax:      lg.game.hpMax,
    xpReward:   lg.game.xpReward,
    orderIndex: lg.orderIndex,
    tasks:      lg.game.gameTasks.map(gt => serializeTask(gt.task, subMap)),
  }))

  const tasks: TaskResponse[] = raw.tasks.map(t => serializeTask(t, subMap))

  return {
    lesson: {
      id:          raw.id,
      title:       raw.title,
      content:     raw.content,
      gameType:    raw.gameType,
      xpReward:    raw.xpReward,
      orderIndex:  raw.orderIndex,
      courseId:    raw.courseId,
      course:      raw.course,
      completed:   progress?.completed   ?? false,
      completedAt: progress?.completedAt ?? null,
    },
    games,
    tasks,
    meta: {
      hasGames:         games.length > 0,
      totalGameTasks:   games.reduce((s, g) => s + g.tasks.length, 0),
      totalDirectTasks: tasks.length,
    },
  }
}

// ── Cache helpers ──────────────────────────────────────────────────────────

const DETAIL_TTL = 30_000 // 30 s — same as lesson list

export function lessonDetailCacheKey(lessonId: string, userId: string) {
  return `lesson:detail:${lessonId}:${userId}`
}

export function getCachedLessonDetail(lessonId: string, userId: string) {
  return cacheGet<LessonDetailResponse>(lessonDetailCacheKey(lessonId, userId))
}

export function setCachedLessonDetail(
  lessonId: string,
  userId:   string,
  data:     LessonDetailResponse,
) {
  cacheSet(lessonDetailCacheKey(lessonId, userId), data, DETAIL_TTL)
}

export function invalidateLessonDetailCache(lessonId: string, userId: string) {
  cacheDel(lessonDetailCacheKey(lessonId, userId))
}

// Invalidates every cached detail for a lesson across all users
// Used when lesson content changes (admin edit)
export function invalidateLessonDetailForAll(lessonId: string) {
  cacheClear(`lesson:detail:${lessonId}:`)
}
