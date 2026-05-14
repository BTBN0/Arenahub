import prisma from '../db'

/* ══ createReward ═══════════════════════ */
export const createReward = (data:{ title:string; description:string; icon?:string; type?:string; value?:number }) =>
  prisma.reward.create({ data })

/* ══ getRewards ═════════════════════════ */
export const getRewards = () =>
  prisma.reward.findMany({ orderBy:{ createdAt:'desc' } })

/* ══ getRewardById ══════════════════════ */
export const getRewardById = (id: string) =>
  prisma.reward.findUnique({ where:{ id } })

/* ══ assignRewardToUser ═════════════════ */
export const assignRewardToUser = (userId: string, rewardId: string) =>
  prisma.userReward.upsert({
    where:  { userId_rewardId:{ userId, rewardId } },
    update: {},
    create: { userId, rewardId },
  })

/* ══ claimReward ════════════════════════ */
export const claimReward = async (userId: string, rewardId: string) => {
  const ur = await prisma.userReward.findUnique({
    where:   { userId_rewardId:{ userId, rewardId } },
    include: { reward:true },
  })
  if (!ur) throw Object.assign(new Error('Reward олдсонгүй'), { status: 404 })
  if (ur.claimedAt) throw Object.assign(new Error('Аль хэдийн авсан байна'), { status: 409 })

  // Apply reward value (XP type)
  if (ur.reward.type === 'xp' && ur.reward.value > 0) {
    const { addXP } = await import('./game.service')
    await addXP(userId, ur.reward.value)
  }

  return prisma.userReward.update({
    where:  { userId_rewardId:{ userId, rewardId } },
    data:   { claimedAt: new Date() },
  })
}

/* ══ getUserRewards ═════════════════════ */
export const getUserRewards = (userId: string) =>
  prisma.userReward.findMany({
    where:   { userId },
    include: { reward:true },
    orderBy: { assignedAt:'desc' },
  })

/* ══ removeReward ═══════════════════════ */
export const removeReward = (id: string) =>
  prisma.reward.delete({ where:{ id } })
