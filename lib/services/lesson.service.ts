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

// Game metadata only — tasks come from the lesson directly (1 Lesson = 1 Game)
export type GameResponse = {
  id:         string
  name:       string
  slug:       string
  gameType:   string
  thumbnail:  string | null
  config:     Record<string, unknown>
  hpMax:      number
  xpReward:   number
  orderIndex: number   // LessonGame.orderIndex
}

export type LessonCourseRef = { id: string; title: string }

export type LessonDetailResponse = {
  lesson: {
    id:          string
    title:       string
    content:     string | null
    gameType:    string | null
    xpReward:    number
    orderIndex:  number
    courseId:    string
    course:      LessonCourseRef
    completed:   boolean
    completedAt: Date | null
  }
  game:  GameResponse | null  // 1 Lesson = 1 Game (null if no game assigned)
  tasks: TaskResponse[]       // lesson's own tasks — these drive game progression
  meta: {
    hasGame: boolean
  }
}

// ── Internal raw types ─────────────────────────────────────────────────────

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
    submitted: sub
      ? { status: sub.status, selected: sub.selected, xpEarned: sub.xpEarned, submittedAt: sub.submittedAt }
      : null,
  }
}

// ── Primary query ──────────────────────────────────────────────────────────

const TASK_SELECT = {
  id: true, title: true, titleEn: true,
  description: true, descriptionEn: true,
  taskType: true, options: true, optionsEn: true,
  starterCode: true, testCases: true,
  xpReward: true, orderIndex: true,
} as const

export async function fetchLessonDetail(
  lessonId: string,
  userId:   string,
): Promise<LessonDetailResponse | null> {
  // Single Prisma query — lesson + 1 game + lesson's own tasks
  const raw = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true, title: true, content: true, gameType: true,
      xpReward: true, orderIndex: true, courseId: true,
      course: { select: { id: true, title: true } },

      // Take only the first (and only) active game assigned to this lesson
      lessonGames: {
        where:   { game: { isActive: true } },
        orderBy: { orderIndex: 'asc' },
        take:    1,
        select: {
          id:         true,
          orderIndex: true,
          game: {
            select: {
              id: true, name: true, slug: true, gameType: true,
              thumbnail: true, config: true, hpMax: true, xpReward: true,
              // tasks NOT fetched here — they come from the lesson directly
            },
          },
        },
      },

      // Lesson's own tasks drive game progression (replaces GameTask pool)
      tasks: {
        orderBy: { orderIndex: 'asc' },
        select:  TASK_SELECT,
      },

      progress: {
        where:  { userId },
        select: { completed: true, completedAt: true },
      },
    },
  })

  if (!raw) return null

  // Batch-load submissions for all lesson tasks (no N+1)
  const taskIds = raw.tasks.map(t => t.id)
  const submissions: RawSub[] = taskIds.length > 0
    ? await prisma.taskSubmission.findMany({
        where:  { userId, taskId: { in: taskIds } },
        select: { taskId: true, status: true, selected: true, xpEarned: true, submittedAt: true },
      })
    : []

  const subMap = new Map<string, RawSub>(submissions.map(s => [s.taskId, s]))
  const progress = raw.progress[0]
  const lg = raw.lessonGames[0]  // first (and only) game

  const game: GameResponse | null = lg
    ? {
        id:         lg.game.id,
        name:       lg.game.name,
        slug:       lg.game.slug,
        gameType:   lg.game.gameType,
        thumbnail:  lg.game.thumbnail,
        config:     (lg.game.config as Record<string, unknown>) ?? {},
        hpMax:      lg.game.hpMax,
        xpReward:   lg.game.xpReward,
        orderIndex: lg.orderIndex,
      }
    : null

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
    game,
    tasks: raw.tasks.map(t => serializeTask(t, subMap)),
    meta: {
      hasGame: game !== null,
    },
  }
}

// ── Cache helpers ──────────────────────────────────────────────────────────

const DETAIL_TTL = 30_000

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

export function invalidateLessonDetailForAll(lessonId: string) {
  cacheClear(`lesson:detail:${lessonId}:`)
}
