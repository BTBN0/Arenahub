import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

const PRICES: Record<string, { amount: number; type: string }> = {
  pro_monthly:  { amount: 17000,  type: 'SUBSCRIPTION' },
  pro_yearly:   { amount: 170000, type: 'SUBSCRIPTION' },
  vip_monthly:  { amount: 34000,  type: 'SUBSCRIPTION' },
  vip_yearly:   { amount: 320000, type: 'SUBSCRIPTION' },
  token_10:     { amount: 3500,   type: 'TOKEN' },
  token_50:     { amount: 15000,  type: 'TOKEN' },
  token_200:    { amount: 45000,  type: 'TOKEN' },
  contest:      { amount: 10000,  type: 'CONTEST' },
  contest_pro:  { amount: 3000,   type: 'CONTEST' },
  contest_vip:  { amount: 0,      type: 'CONTEST' },
  boost:        { amount: 10000,  type: 'BOOST' },
  frame:        { amount: 15000,  type: 'BOOST' },
}

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const { item } = await req.json()
    if (!item || !PRICES[item]) return err('Буруу item')

    const { amount, type } = PRICES[item]
    const meta: Record<string, any> = { item }
    if (item.startsWith('pro_')) { meta.plan = 'PRO'; meta.period = item.includes('yearly') ? 'yearly' : 'monthly' }
    if (item.startsWith('vip_')) { meta.plan = 'VIP'; meta.period = item.includes('yearly') ? 'yearly' : 'monthly' }
    if (item.startsWith('token_')) meta.tokens = parseInt(item.split('_')[1])

    const payment = await prisma.payment.create({
      data: { userId: payload.id, type: type as any, amount, metadata: meta }
    })

    const ref = `АН-${payment.id.slice(0,8).toUpperCase()}`
    return ok({
      payment,
      bankInfo: { bank: 'Хаан Банк', account: '5000 1234 56', name: 'АРЕНА ХАБ ХХК', ref, amount }
    })
  } catch(e) { return handleError(e) }
}

export async function GET(req: NextRequest) {
  try {
    let userId: string | undefined

    const naToken = await getToken({ req, secret: SECRET })
    if (naToken?.id) {
      userId = naToken.id as string
    } else if (naToken?.email) {
      const u = await prisma.user.findUnique({ where: { email: naToken.email as string }, select: { id: true } })
      userId = u?.id
    }

    if (!userId) {
      try { userId = requireAuth(req).id } catch {}
    }

    if (!userId) return err('Нэвтрэх шаардлагатай', 401)

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json({ ok: true, payments })
  } catch(e) { return handleError(e) }
}
