import { NextRequest } from 'next/server'
import { requireStaff } from '@/lib/permissions'
import { getDashboardStats, systemLogs, getUsageStats } from '@/lib/services/analytics.service'
import { ok, handleError } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  try {
    requireStaff(req)
    const type = req.nextUrl.searchParams.get('type') || 'dashboard'
    if (type === 'logs')  return ok({ logs:  await systemLogs(50) })
    if (type === 'usage') return ok({ stats: await getUsageStats() })
    return ok({ stats: await getDashboardStats() })
  } catch(e) { return handleError(e) }
}