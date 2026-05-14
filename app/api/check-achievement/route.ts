import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { checkAchievementUnlock } from '@/lib/services/game.service'
import { ok, handleError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const u    = requireAuth(req)
    const body = await req.json().catch(() => ({}))
    const unlocked = await checkAchievementUnlock(u.id, {
      noErrorRun: body.noErrorRun ?? false,
      aiUsed:     body.aiUsed    ?? false,
      hintUsed:   body.hintUsed  ?? false,
    })
    return ok({ unlocked, count: unlocked.length })
  } catch(e) { return handleError(e) }
}