import { NextRequest } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { ok, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

type RewardDef = { id: string; title: string; description: string; icon: string; type: string; value: number }

const REWARDS: RewardDef[] = [
  { id: 'reward-1', icon: '🚀', title: 'First Blood',      type: 'xp',    value: 50,  description: 'Эхний task шийдсэний шагнал' },
  { id: 'reward-2', icon: '💎', title: 'Task Hunter',      type: 'xp',    value: 200, description: '10 task шийдсэний шагнал' },
  { id: 'reward-3', icon: '⚡', title: 'XP Warrior',       type: 'token', value: 30,  description: '500 XP цуглуулсны шагнал' },
  { id: 'reward-4', icon: '🔥', title: 'Streak Starter',   type: 'badge', value: 0,   description: '5 task дараалан шийдсэн badge' },
  { id: 'reward-5', icon: '🏆', title: 'Elite Performer',  type: 'token', value: 100, description: '10+ task амжилттай дуусгасан' },
  { id: 'reward-6', icon: '👑', title: 'Arena Legend',     type: 'xp',    value: 500, description: 'Level 10 хүрсний шагнал' },
  { id: 'reward-7', icon: '🎯', title: 'Sharp Shooter',    type: 'xp',    value: 75,  description: 'Task-ийг хурдан шийдлээ' },
  { id: 'reward-8', icon: '🌟', title: 'Rising Star',      type: 'badge', value: 0,   description: 'Шинэ гишүүнд зориулсан badge' },
  { id: 'reward-9', icon: '💡', title: 'Self Solver',      type: 'token', value: 20,  description: 'Hint ашиглахгүй шийдсэн' },
  { id: 'reward-10',icon: '🤖', title: 'AI Explorer',      type: 'xp',    value: 30,  description: 'AI-г ашиглаж task шийдлээ' },
]

export async function POST(req: NextRequest) {
  try {
    requirePermission(req, 'content.achievement')

    let created = 0
    let skipped = 0

    for (const r of REWARDS) {
      const exists = await prisma.reward.findFirst({ where: { title: r.title } })
      if (exists) { skipped++; continue }

      await prisma.$executeRaw`
        INSERT INTO rewards (id, title, description, icon, type, value, "createdAt")
        VALUES (${r.id}, ${r.title}, ${r.description}, ${r.icon}, ${r.type}, ${r.value}, NOW())
        ON CONFLICT (id) DO NOTHING
      `
      created++
    }

    return ok({ message: `✓ ${created} reward үүсгэгдлээ, ${skipped} аль байсан.`, created, skipped })
  } catch (e) { return handleError(e) }
}