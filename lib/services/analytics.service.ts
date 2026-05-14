import prisma from '../db'

/* ══ trackUserActivity ══════════════════ */
export const logActivity = (userId: string, action: string, meta?: Record<string, unknown>, ip?: string) =>
  prisma.activityLog.create({ data:{ userId, action, meta: meta as object, ip } }).catch(() => null)

export const trackUserActivity = logActivity

/* ══ getUsageStats ══════════════════════ */
export const getUsageStats = async () => {
  const [totalUsers, totalTasks, totalSubmissions, passedCount] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.taskSubmission.count(),
    prisma.taskSubmission.count({ where:{ status:'PASSED' } }),
  ])
  const avgPassRate = totalSubmissions > 0 ? Math.round(passedCount / totalSubmissions * 100) : 0
  return { totalUsers, totalTasks, totalSubmissions, passedCount, avgPassRate }
}

/* ══ getDashboardStats ══════════════════ */
export const getDashboardStats = async () => {
  const [users, tasks, courses, topPlayers, recentActivity] = await Promise.all([
    prisma.user.count(),
    prisma.task.count(),
    prisma.course.count({ where:{ isActive:true } }),
    prisma.user.findMany({
      orderBy: { xp:'desc' }, take:8,
      select:  { id:true, username:true, xp:true, level:true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt:'desc' }, take:8,
      select: { id:true, action:true, createdAt:true, user:{ select:{ username:true } } },
    }),
  ])
  return { users, tasks, courses, topPlayers, recentActivity }
}

/* ══ analyzeGameData ════════════════════ */
export const analyzeGameData = async () => {
  const [taskStats, levelDistribution] = await Promise.all([
    prisma.task.findMany({
      include: { _count:{ select:{ submissions:true } } },
      orderBy: { orderIndex:'asc' },
    }),
    prisma.user.groupBy({ by:['level'], _count:{ id:true }, orderBy:{ level:'asc' } }),
  ])
  return { taskStats, levelDistribution }
}

/* ══ systemLogs ═════════════════════════ */
export const systemLogs = (limit = 50) =>
  prisma.activityLog.findMany({
    orderBy: { createdAt:'desc' }, take:limit,
    include: { user:{ select:{ username:true, role:true } } },
  })
