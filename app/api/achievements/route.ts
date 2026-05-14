import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { getUserAchievements, createAchievement } from '@/lib/services/game.service'
import { ok, handleError } from '@/lib/api-helpers'
import { cacheGet, cacheSet } from '@/lib/cache'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const u   = requireAuth(req)
    const all = req.nextUrl.searchParams.get('list') === 'all'

    if (all) {
      const key    = `ach:all:${u.id}`
      const cached = cacheGet<object>(key)
      if (cached) return ok(cached)

      type AchRow = { id:string;title:string;description:string;icon:string;xpReward:number;condition:string;type:string;rarity:string;rewardType:string;rewardAmount:number;createdAt:Date }
      const globalKey = 'ach:global'
      let achs = cacheGet<AchRow[]>(globalKey)
      const [freshAchs, owned] = await Promise.all([
        achs ? Promise.resolve(achs) : prisma.$queryRaw<AchRow[]>`SELECT id, title, description, icon, "xpReward", condition, type, rarity, "rewardType", "rewardAmount", "createdAt" FROM achievements ORDER BY rarity DESC, "createdAt" ASC`,
        prisma.userAchievement.findMany({ where: { userId: u.id }, select: { achievementId:true, unlockedAt:true } }),
      ])
      if (!achs) { achs = freshAchs as AchRow[]; cacheSet(globalKey, achs, 120_000) }
      const ownedMap = Object.fromEntries(owned.map(o => [o.achievementId, o.unlockedAt]))
      const data = {
        achievements: achs.map(a => ({
          id: a.id, title: a.title, description: a.description, icon: a.icon,
          xpReward: a.xpReward, condition: a.condition, type: a.type,
          rarity: a.rarity, rewardType: a.rewardType, rewardAmount: a.rewardAmount,
          createdAt: a.createdAt,
          unlocked: !!ownedMap[a.id], unlockedAt: ownedMap[a.id] ?? null,
        }))
      }
      cacheSet(key, data, 60_000)
      return ok(data)
    }

    return ok({ achievements: await getUserAchievements(u.id) })
  } catch(e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    requireAuth(req)
    return ok({ achievement: await createAchievement(await req.json()) }, 201)
  } catch(e) { return handleError(e) }
}