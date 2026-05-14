import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { claimReward, removeReward } from '@/lib/services/reward.service'
import { ok, handleError } from '@/lib/api-helpers'
export async function POST(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try { const u = requireAuth(req); const { id } = await params; return ok({ userReward: await claimReward(u.id, id) }) }
  catch(e) { return handleError(e) }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try { requireAuth(req); const { id } = await params; return ok(await removeReward(id)) }
  catch(e) { return handleError(e) }
}
