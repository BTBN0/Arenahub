import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { getAllUsersAdmin } from '@/lib/services/admin.service'
import { ok, handleError } from '@/lib/api-helpers'

/* GET /api/users (admin) */
export async function GET(req: NextRequest) {
  try {
    requireAdmin(req)
    const sp     = req.nextUrl.searchParams
    const search = sp.get('search')  ?? undefined
    const page   = parseInt(sp.get('page')  || '1')
    const limit  = parseInt(sp.get('limit') || '20')
    return ok(await getAllUsersAdmin({ search, page, limit }))
  } catch (e) { return handleError(e) }
}
