import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/db'

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

const CONTEST_XP     = 150
const CONTEST_TOKENS = 15

export async function POST(req: NextRequest) {
  try {
    // Auth — try NextAuth cookie first, then Bearer token
    let userId: string | undefined

    const naToken = await getToken({ req, secret: SECRET })
    if (naToken?.id) {
      userId = naToken.id as string
    } else if (naToken?.email) {
      const u = await prisma.user.findUnique({ where: { email: naToken.email as string }, select: { id: true } })
      userId = u?.id
    }
    if (!userId) {
      const bearer = getUser(req)
      if (bearer?.id) userId = bearer.id
    }
    if (!userId) return NextResponse.json({ error: 'Нэвтрээгүй байна' }, { status: 401 })

    const { contestId } = await req.json().catch(() => ({}))

    // Find contest — use provided ID or fall back to latest active/upcoming
    const contest = contestId
      ? await prisma.contest.findUnique({ where: { id: contestId } })
      : await prisma.contest.findFirst({
          where: { status: { in: ['ACTIVE', 'UPCOMING'] } },
          orderBy: { createdAt: 'desc' },
        })

    if (!contest) return NextResponse.json({ error: 'Contest олдсонгүй' }, { status: 404 })
    if (contest.status === 'ENDED') return NextResponse.json({ error: 'Contest дууссан байна' }, { status: 400 })

    // Check if already registered
    const existing = await prisma.contestParticipant.findUnique({
      where: { contestId_userId: { contestId: contest.id, userId } },
    })
    if (existing) return NextResponse.json({ ok: true, alreadyJoined: true })

    // Get user plan to determine entry price
    const userSub = await prisma.subscription.findUnique({ where: { userId }, select: { plan: true } })
    const plan    = userSub?.plan ?? 'FREE'
    const amount  = plan === 'VIP' ? contest.entryVip : plan === 'PRO' ? contest.entryPro : contest.entryFree

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId,
        type:       'CONTEST',
        amount,
        status:     'PAID',
        method:     'QPAY',
        approvedAt: new Date(),
        metadata:   { contestId: contest.id, plan },
      },
    })

    // Register as participant
    await prisma.contestParticipant.create({
      data: { contestId: contest.id, userId, paymentId: payment.id },
    })

    // Award XP
    await prisma.user.update({
      where: { id: userId },
      data:  { xp: { increment: CONTEST_XP } },
    })

    // Award AI tokens
    await prisma.tokenBalance.upsert({
      where:  { userId },
      create: { userId, balance: CONTEST_TOKENS },
      update: { balance: { increment: CONTEST_TOKENS } },
    })

    // Notifications
    await prisma.notification.create({
      data: { userId, type: 'success',
        title:   '⚔ Contest-д бүртгэгдлээ!',
        message: `"${contest.title}" contest-д амжилттай бүртгэгдлээ. +${CONTEST_XP} XP, +${CONTEST_TOKENS} AI token урамшуулал авлаа!` },
    })
    await prisma.notification.create({
      data: { userId, type: 'success',
        title:   `${CONTEST_XP} XP нэмэгдлээ`,
        message: `Contest оролцсоны урамшуулал: +${CONTEST_XP} XP` },
    })
    await prisma.notification.create({
      data: { userId, type: 'success',
        title:   `${CONTEST_TOKENS} AI Token нэмэгдлээ`,
        message: `Contest оролцсоны урамшуулал: +${CONTEST_TOKENS} AI token` },
    })

    return NextResponse.json({ ok: true, xp: CONTEST_XP, tokens: CONTEST_TOKENS, amount })
  } catch (e) {
    console.error('contest join error:', e)
    return NextResponse.json({ error: 'Серверийн алдаа гарлаа' }, { status: 500 })
  }
}