import { NextRequest } from 'next/server'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { createReward, getRewards, getUserRewards } from '@/lib/services/reward.service'
import { ok, handleError } from '@/lib/api-helpers'
export async function GET(req: NextRequest) {
  try {
    const u = requireAuth(req)
    const mine = req.nextUrl.searchParams.get('mine') === 'true'
    return ok(mine ? { rewards: await getUserRewards(u.id) } : { rewards: await getRewards() })
  } catch(e) { return handleError(e) }
}
export async function POST(req: NextRequest) {
  try { requireAdmin(req); return ok({ reward: await createReward(await req.json()) }, 201) }
  catch(e) { return handleError(e) }
}
