import { NextRequest } from 'next/server'
import { refreshToken as doRefresh } from '@/lib/services/auth.service'
import { ok, err, handleError } from '@/lib/api-helpers'
export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = await req.json()
    if (!refreshToken) return err('refreshToken байхгүй', 400)
    return ok(await doRefresh(refreshToken))
  } catch(e) { return handleError(e) }
}
