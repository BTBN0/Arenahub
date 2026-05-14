import { NextRequest } from 'next/server'
import { ok, err, handleError } from '@/lib/api-helpers'
import { getUser, requireAdmin } from '@/lib/auth'
import prisma from '@/lib/db'

// GET /api/contest — active + upcoming contests
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') // ACTIVE | UPCOMING | ENDED | ALL
    
    const where = status && status !== 'ALL' ? { status } : {}
    const contests = await prisma.contest.findMany({
      where,
      include: { participants: { select: { id:true, userId:true, score:true, rank:true } } },
      orderBy: { startDate: 'desc' },
    })

    const result = contests.map(c => ({
      ...c,
      participantCount: c.participants.length,
      topScore: c.participants.length ? Math.max(...c.participants.map(p=>p.score)) : 0,
      prizePool: c.prizeFirst + c.prizeSecond + c.prizeThird,
    }))

    return ok({ contests: result })
  } catch(e) { return handleError(e) }
}

// POST /api/contest — admin create contest
export async function POST(req: NextRequest) {
  try {
    const payload = requireAdmin(req)
    const body = await req.json()
    const { title, description, startDate, endDate, entryFree, entryPro, taskCount, prizeFirst, prizeSecond, prizeThird } = body

    if (!title || !startDate || !endDate) return err('title, startDate, endDate шаардлагатай')

    const contest = await prisma.contest.create({
      data: {
        title, description: description||'',
        startDate: new Date(startDate),
        endDate:   new Date(endDate),
        entryFree: entryFree ?? 10000,
        entryPro:  entryPro  ?? 3000,
        entryVip:  0,
        taskCount: taskCount || 5,
        prizeFirst:  prizeFirst  || 50000,
        prizeSecond: prizeSecond || 30000,
        prizeThird:  prizeThird  || 20000,
        status: new Date(startDate) > new Date() ? 'UPCOMING' : 'ACTIVE',
      }
    })
    return ok({ contest })
  } catch(e) { return handleError(e) }
}
