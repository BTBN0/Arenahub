import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { markAsRead } from '@/lib/services/notification.service'
import { ok, handleError } from '@/lib/api-helpers'
export async function PATCH(req: NextRequest, { params }: { params: Promise<{id:string}> }) {
  try { requireAuth(req); const { id } = await params; return ok({ notification: await markAsRead(id) }) }
  catch(e) { return handleError(e) }
}
