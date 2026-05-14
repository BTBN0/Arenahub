import prisma from '../db'

/* ════ PROGRESS ══════════════════════════ */
export const getUserProgress = (userId: string) =>
  prisma.lessonProgress.findMany({
    where:   { userId },
    include: { lesson:{ include:{ course:true } } },
    orderBy: { completedAt:'desc' },
  })

export const createProgress = (userId: string, lessonId: string) =>
  prisma.lessonProgress.upsert({
    where:  { userId_lessonId:{ userId, lessonId } },
    update: {},
    create: { userId, lessonId },
  })

export const updateProgress = (userId: string, lessonId: string, completed: boolean) =>
  prisma.lessonProgress.upsert({
    where:  { userId_lessonId:{ userId, lessonId } },
    update: { completed, completedAt: completed ? new Date() : null },
    create: { userId, lessonId, completed, completedAt: completed ? new Date() : null },
  })

export const resetProgress = (userId: string) =>
  prisma.lessonProgress.deleteMany({ where:{ userId } })

/* ════ STREAK ════════════════════════════ */
export const updateStreak = async (userId: string) => {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { streakCount: true, lastStreakDate: true } })
  if (!u) return

  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (!u.lastStreakDate) {
    await prisma.user.update({ where: { id: userId }, data: { streakCount: 1, lastStreakDate: today } })
    return
  }

  const last     = new Date(u.lastStreakDate)
  const lastDay  = new Date(last.getFullYear(), last.getMonth(), last.getDate())
  const diffDays = Math.round((today.getTime() - lastDay.getTime()) / 86400000)

  if (diffDays === 0) return
  if (diffDays === 1) {
    const newStreak = (u.streakCount ?? 0) + 1
    await prisma.user.update({ where: { id: userId }, data: { streakCount: newStreak, lastStreakDate: today } })
    if ([3, 7, 14, 30].includes(newStreak)) {
      await prisma.notification.create({
        data: { userId, title:`🔥 ${newStreak} өдрийн streak!`, message:`${newStreak} өдөр дараалан хичээллэсэн. Гайхалтай!`, type:'achievement' }
      })
    }
  } else {
    await prisma.user.update({ where: { id: userId }, data: { streakCount: 1, lastStreakDate: today } })
  }
}

export const getStreak = async (userId: string): Promise<number> => {
  const u = await prisma.user.findUnique({ where: { id: userId }, select: { streakCount: true } })
  return u?.streakCount ?? 0
}

/* ════ CATEGORY TASK COUNT ═══════════════ */
const countPassedByCategory = (userId: string, categories: string[]) =>
  prisma.taskSubmission.count({
    where: {
      userId,
      status: 'PASSED',
      task: {
        lesson: {
          course: {
            OR: categories.map(c => ({ category: { contains: c, mode: 'insensitive' as const } }))
          }
        }
      }
    }
  })

const countCompletedLessonsByCategory = (userId: string, categories: string[]) =>
  prisma.lessonProgress.count({
    where: {
      userId,
      completed: true,
      lesson: {
        course: {
          OR: categories.map(c => ({ category: { contains: c, mode: 'insensitive' as const } }))
        }
      }
    }
  })

/* ════ XP / LEVEL ═══════════════════════ */
export const calculateLevel = (xp: number) => Math.max(1, Math.floor(xp / 200) + 1)

export const getLevel = async (userId: string) => {
  const u = await prisma.user.findUnique({ where:{ id:userId }, select:{ xp:true, level:true } })
  return u?.level ?? 1
}

export const addXP = async (userId: string, amount: number) => {
  const user = await prisma.user.findUnique({
    where:  { id:userId },
    select: { id:true, xp:true, level:true },
  })
  if (!user) throw new Error('User not found')
  const newXp    = user.xp + amount
  const newLevel = calculateLevel(newXp)
  const leveled  = newLevel > user.level

  const updated = await prisma.user.update({
    where: { id:userId },
    data:  { xp:newXp, level:newLevel },
  })

  // Side effects are non-blocking — response returns immediately after XP update
  if (leveled) levelUp(userId, newLevel).catch(() => null)
  updateStreak(userId).catch(() => null)
  checkAchievementUnlock(userId).catch(() => null)
  autoAssignRewards(userId).catch(() => null)

  return { user:updated, xpAdded:amount, leveled, newLevel }
}

export const removeXP = async (userId: string, amount: number) => {
  const user = await prisma.user.findUnique({ where:{ id:userId } })
  if (!user) throw new Error('User not found')
  const newXp    = Math.max(0, user.xp - amount)
  const newLevel = calculateLevel(newXp)
  return prisma.user.update({ where:{ id:userId }, data:{ xp:newXp, level:newLevel } })
}

export const levelUp = async (userId: string, newLevel: number) => {
  await prisma.notification.create({
    data:{
      userId,
      title:   `⬆ LEVEL ${newLevel} БОЛЛОО!`,
      message: `Баяр хүргэе! Та ${newLevel}-р level-т хүрлээ.`,
      type:    'success',
    }
  })
  return newLevel
}

/* ════ ACHIEVEMENTS ══════════════════════ */
export const createAchievement = (data: {
  title: string; description: string; icon?: string; xpReward?: number
  condition: string; type?: string; rarity?: string; rewardType?: string; rewardAmount?: number
}) => prisma.achievement.create({ data })

export const unlockAchievement = async (userId: string, achievementId: string) => {
  const already = await prisma.userAchievement.findUnique({
    where:{ userId_achievementId:{ userId, achievementId } }
  })
  if (already) return already

  const ua = await prisma.userAchievement.create({ data:{ userId, achievementId } })

  type AchRow = { id: string; title: string; description: string; xpReward: number; rewardType: string; rewardAmount: number }
  const rows = await prisma.$queryRaw<AchRow[]>`
    SELECT id, title, description, "xpReward", "rewardType", "rewardAmount" FROM achievements WHERE id = ${achievementId}
  `
  const ach = rows[0]
  if (!ach) return ua

  if (ach.xpReward > 0) {
    const u = await prisma.user.findUnique({ where: { id: userId }, select: { xp: true } })
    if (u) {
      const newXp = u.xp + ach.xpReward
      await prisma.user.update({ where: { id: userId }, data: { xp: newXp, level: calculateLevel(newXp) } })
    }
  }

  if (ach.rewardAmount > 0) {
    if (ach.rewardType === 'TOKEN') {
      await prisma.tokenBalance.upsert({
        where:  { userId },
        update: { balance: { increment: ach.rewardAmount } },
        create: { userId, balance: ach.rewardAmount, totalUsed: 0 },
      })
    } else if (ach.rewardType === 'COIN') {
      await prisma.user.update({ where: { id: userId }, data: { coins: { increment: ach.rewardAmount } } })
    }
  }

  await prisma.notification.create({
    data:{
      userId,
      title:   `🏅 Achievement: ${ach.title}`,
      message: `${ach.description}${ach.xpReward > 0 ? ` (+${ach.xpReward} XP)` : ''}`,
      type:    'achievement',
    }
  })
  return ua
}

export const getUserAchievements = (userId: string) =>
  prisma.userAchievement.findMany({
    where:   { userId },
    include: { achievement:true },
    orderBy: { unlockedAt:'desc' },
  })

export const checkAchievementUnlock = async (userId: string, extraCtx?: {
  noErrorRun?: boolean; aiUsed?: boolean; hintUsed?: boolean
}) => {
  const [
    passed, lessons, user, aiUsageCount,
    htmlTasks, cssTasks, jsTasks, reactTasks, backendTasks, dbTasks,
    htmlLessons, cssLessons, jsLessons, reactLessons, backendLessons, dbLessons,
  ] = await Promise.all([
    prisma.taskSubmission.count({ where:{ userId, status:'PASSED' } }),
    prisma.lessonProgress.count({ where:{ userId, completed:true } }),
    prisma.user.findUnique({ where:{ id:userId }, select:{ level:true, xp:true } }),
    prisma.tokenUsage.count({ where:{ userId } }).catch(() => 0),
    countPassedByCategory(userId, ['HTML']),
    countPassedByCategory(userId, ['CSS']),
    countPassedByCategory(userId, ['JavaScript', 'JS']),
    countPassedByCategory(userId, ['React']),
    countPassedByCategory(userId, ['Backend', 'Node', 'Express', 'API']),
    countPassedByCategory(userId, ['Database', 'SQL', 'PostgreSQL', 'DB']),
    countCompletedLessonsByCategory(userId, ['HTML']),
    countCompletedLessonsByCategory(userId, ['CSS']),
    countCompletedLessonsByCategory(userId, ['JavaScript', 'JS']),
    countCompletedLessonsByCategory(userId, ['React']),
    countCompletedLessonsByCategory(userId, ['Backend', 'Node', 'Express', 'API']),
    countCompletedLessonsByCategory(userId, ['Database', 'SQL', 'PostgreSQL', 'DB']),
  ])

  const streakDays = await getStreak(userId)

  type AchRow = { id: string; condition: string }
  const allAchs  = await prisma.$queryRaw<AchRow[]>`SELECT id, condition FROM achievements ORDER BY "createdAt" ASC`
  const owned    = await prisma.userAchievement.findMany({ where:{ userId }, select:{ achievementId:true } })
  const ownedIds = new Set(owned.map(o => o.achievementId))

  const ctx = {
    // General
    passedTasks: passed, completedLessons: lessons,
    level: user?.level ?? 1, totalXp: user?.xp ?? 0, streakDays,
    aiUsage: aiUsageCount,
    noErrorRun: extraCtx?.noErrorRun ?? false,
    hintUsed:   extraCtx?.hintUsed   ?? false,
    aiUsed:     extraCtx?.aiUsed     ?? false,
    // Category task counts
    htmlTasks, cssTasks, jsTasks, reactTasks, backendTasks, dbTasks,
    // Category lesson counts
    htmlLessons, cssLessons, jsLessons, reactLessons, backendLessons, dbLessons,
  }

  const unlocked: string[] = []
  for (const ach of allAchs) {
    if (ownedIds.has(ach.id)) continue
    try {
      const fn = new Function(...Object.keys(ctx), `return !!(${ach.condition})`)
      if (fn(...Object.values(ctx))) {
        await unlockAchievement(userId, ach.id)
        unlocked.push(ach.id)
      }
    } catch { /* invalid condition */ }
  }
  return unlocked
}

/* ════ AUTO-ASSIGN REWARDS ═══════════════ */
export const autoAssignRewards = async (userId: string) => {
  const [passed, user] = await Promise.all([
    prisma.taskSubmission.count({ where: { userId, status: 'PASSED' } }),
    prisma.user.findUnique({ where: { id: userId }, select: { level: true, xp: true } }),
  ])
  const myRewards = await prisma.userReward.findMany({ where: { userId }, select: { rewardId: true } })
  const owned = new Set(myRewards.map(r => r.rewardId))

  const rules = [
    { rewardId: 'reward-1', condition: passed >= 1 },
    { rewardId: 'reward-2', condition: passed >= 10 },
    { rewardId: 'reward-3', condition: (user?.xp ?? 0) >= 500 },
    { rewardId: 'reward-4', condition: passed >= 5 },
    { rewardId: 'reward-5', condition: passed >= 10 },
    { rewardId: 'reward-6', condition: (user?.level ?? 0) >= 10 },
  ]

  for (const rule of rules) {
    if (rule.condition && !owned.has(rule.rewardId)) {
      const reward = await prisma.reward.findUnique({ where: { id: rule.rewardId } })
      if (!reward) continue
      await prisma.userReward.create({ data: { userId, rewardId: rule.rewardId } })
      await prisma.notification.create({
        data: { userId, title:`🎁 ${reward.title}`, message: reward.description, type:'success' }
      })
    }
  }
}