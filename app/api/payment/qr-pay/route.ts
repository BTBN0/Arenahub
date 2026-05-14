import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/db'

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

const ITEM_MAP: Record<string, { type: string; plan?: string; tokens?: number; amount: number }> = {
  pro_monthly:  { type: 'subscription', plan: 'PRO',  tokens: 100,  amount: 17000  },
  pro_yearly:   { type: 'subscription', plan: 'PRO',  tokens: 1200, amount: 170000 },
  vip_monthly:  { type: 'subscription', plan: 'VIP',  tokens: 400,  amount: 34000  },
  vip_yearly:   { type: 'subscription', plan: 'VIP',  tokens: 4800, amount: 320000 },
  token_10:     { type: 'token', tokens: 10,  amount: 3500  },
  token_50:     { type: 'token', tokens: 50,  amount: 15000 },
  token_200:    { type: 'token', tokens: 220, amount: 45000 },
  contest:      { type: 'contest', amount: 10000 },
  contest_pro:  { type: 'contest', amount: 3000  },
  contest_vip:  { type: 'contest', amount: 0     },
  boost:        { type: 'boost',   amount: 10000 },
  frame:        { type: 'boost',   amount: 15000 },
}

export async function POST(req: NextRequest) {
  let userId: string | undefined

  // 1) NextAuth session cookie (OAuth users)
  const naToken = await getToken({ req, secret: SECRET })
  if (naToken?.id) {
    userId = naToken.id as string
  } else if (naToken?.email) {
    const u = await prisma.user.findUnique({ where: { email: naToken.email as string }, select: { id: true } })
    userId = u?.id
  }

  // 2) Custom Bearer JWT (email/password users)
  if (!userId) {
    const bearer = getUser(req)
    if (bearer?.id) userId = bearer.id
  }

  if (!userId) return NextResponse.json({ error: 'Нэвтрээгүй байна' }, { status: 401 })

  try {
    const { item } = await req.json()
    const cfg = ITEM_MAP[item]
    if (!cfg) return NextResponse.json({ error: 'Мэдэгдэхгүй item' }, { status: 400 })

    const payment = await prisma.payment.create({
      data: {
        userId,
        type:      cfg.type === 'subscription' ? 'SUBSCRIPTION' : cfg.type === 'token' ? 'TOKEN' : cfg.type === 'boost' ? 'BOOST' : 'CONTEST',
        amount:    cfg.amount,
        status:    'PAID',
        method:    'QPAY',
        approvedAt: new Date(),
        metadata:  { item, plan: cfg.plan, tokens: cfg.tokens },
      }
    })

    if (cfg.type === 'subscription' && cfg.plan) {
      const endDate = item.includes('yearly')
        ? new Date(Date.now() + 365 * 24 * 3600 * 1000)
        : new Date(Date.now() + 30  * 24 * 3600 * 1000)

      await prisma.subscription.upsert({
        where:  { userId },
        create: { userId, plan: cfg.plan as 'PRO'|'VIP', endDate, paymentId: payment.id },
        update: { plan: cfg.plan as 'PRO'|'VIP', endDate, startDate: new Date(), paymentId: payment.id },
      })

      // Grant tokens included with the subscription period
      if (cfg.tokens) {
        await prisma.tokenBalance.upsert({
          where:  { userId },
          create: { userId, balance: cfg.tokens },
          update: { balance: { increment: cfg.tokens } },
        })
        await prisma.notification.create({
          data: {
            userId,
            title:   `${cfg.tokens} AI Token нэмэгдлээ`,
            message: `${cfg.plan} эрхтэй хамт ${cfg.tokens} AI token таны дансанд нэмэгдлээ.`,
            type:    'success',
          }
        })
      }

      await prisma.notification.create({
        data: {
          userId,
          title:   `${cfg.plan} эрх идэвхжлээ`,
          message: `Таны ${cfg.plan} эрх амжилттай идэвхжлээ. Сайхан сурцгаая!`,
          type:    'success',
        }
      })
    }

    if (cfg.type === 'token' && cfg.tokens) {
      await prisma.tokenBalance.upsert({
        where:  { userId },
        create: { userId, balance: cfg.tokens },
        update: { balance: { increment: cfg.tokens } },
      })
      await prisma.notification.create({
        data: {
          userId,
          title:   `${cfg.tokens} AI Token нэмэгдлээ`,
          message: `Таны AI token үлдэгдэлд ${cfg.tokens} token нэмэгдлээ.`,
          type:    'success',
        }
      })
    }

    if (cfg.type === 'contest') {
      const CONTEST_XP     = 150
      const CONTEST_TOKENS = 15

      // Register participant in the latest active/upcoming contest
      const contest = await prisma.contest.findFirst({
        where: { status: { in: ['ACTIVE', 'UPCOMING'] } },
        orderBy: { createdAt: 'desc' },
      })
      if (contest) {
        await prisma.contestParticipant.upsert({
          where:  { contestId_userId: { contestId: contest.id, userId } },
          create: { contestId: contest.id, userId, paymentId: payment.id },
          update: { paymentId: payment.id },
        })
      }

      // Award participation XP
      await prisma.user.update({
        where:  { id: userId },
        data:   { xp: { increment: CONTEST_XP } },
      })

      // Award participation AI tokens
      await prisma.tokenBalance.upsert({
        where:  { userId },
        create: { userId, balance: CONTEST_TOKENS },
        update: { balance: { increment: CONTEST_TOKENS } },
      })

      // Notifications
      await prisma.notification.create({
        data: { userId, type: 'success',
          title:   `${CONTEST_XP} XP нэмэгдлээ`,
          message: `Contest оролцсоны урамшуулал: +${CONTEST_XP} XP таны дансанд нэмэгдлээ.` }
      })
      await prisma.notification.create({
        data: { userId, type: 'success',
          title:   `${CONTEST_TOKENS} AI Token нэмэгдлээ`,
          message: `Contest оролцсоны урамшуулал: +${CONTEST_TOKENS} AI token нэмэгдлээ.` }
      })
      await prisma.notification.create({
        data: { userId, type: 'success',
          title:   '⚔ Contest-д бүртгэгдлээ!',
          message: `Амжилттай бүртгэгдлээ. +${CONTEST_XP} XP, +${CONTEST_TOKENS} AI token урамшуулал авлаа. Сайхан тэмцэнэ үү!` }
      })
    }

    return NextResponse.json({ ok: true, paymentId: payment.id })
  } catch (e) {
    console.error('qr-pay error:', e)
    return NextResponse.json({ error: 'Серверийн алдаа гарлаа' }, { status: 500 })
  }
}