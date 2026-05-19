import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import prisma from '@/lib/db'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-15',
})

const ITEM_CONFIG: Record<string, { type: string; plan?: string; tokens?: number }> = {
  pro_monthly:  { type: 'subscription', plan: 'PRO', tokens: 100 },
  pro_yearly:   { type: 'subscription', plan: 'PRO', tokens: 1200 },
  vip_monthly:  { type: 'subscription', plan: 'VIP', tokens: 400 },
  vip_yearly:   { type: 'subscription', plan: 'VIP', tokens: 4800 },
  token_10:     { type: 'token', tokens: 10 },
  token_50:     { type: 'token', tokens: 50 },
  token_200:    { type: 'token', tokens: 220 },
  contest_pro:  { type: 'contest' },
  contest_free: { type: 'contest' },
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or secret' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (e: any) {
    console.error('Webhook signature verification failed:', e.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const { userId, item } = session.metadata as { userId: string; item: string }

      if (!userId || !item) {
        console.warn('Missing userId or item in webhook metadata')
        return NextResponse.json({ ok: true })
      }

      const cfg = ITEM_CONFIG[item]
      if (!cfg) {
        console.warn('Unknown item:', item)
        return NextResponse.json({ ok: true })
      }

      const payment = await prisma.payment.create({
        data: {
          userId,
          type: cfg.type === 'subscription' ? 'SUBSCRIPTION' : cfg.type === 'token' ? 'TOKEN' : 'CONTEST',
          amount: session.amount_total ? Math.round(session.amount_total / 100) : 0,
          status: 'PAID',
          method: 'STRIPE',
          approvedAt: new Date(),
          metadata: { item, stripeSessionId: session.id },
        },
      })

      // Subscription
      if (cfg.type === 'subscription' && cfg.plan) {
        const endDate = item.includes('yearly')
          ? new Date(Date.now() + 365 * 24 * 3600 * 1000)
          : new Date(Date.now() + 30 * 24 * 3600 * 1000)

        await prisma.subscription.upsert({
          where: { userId },
          create: { userId, plan: cfg.plan as 'PRO' | 'VIP', endDate, paymentId: payment.id },
          update: { plan: cfg.plan as 'PRO' | 'VIP', endDate, startDate: new Date(), paymentId: payment.id },
        })

        if (cfg.tokens) {
          await prisma.tokenBalance.upsert({
            where: { userId },
            create: { userId, balance: cfg.tokens },
            update: { balance: { increment: cfg.tokens } },
          })
        }

        await prisma.notification.create({
          data: {
            userId,
            title: `${cfg.plan} эрх идэвхжлээ`,
            message: `Таны ${cfg.plan} эрх амжилттай идэвхжлээ. Сайхан сурцгаая!`,
            type: 'success',
          },
        })
      }

      // Token purchase
      if (cfg.type === 'token' && cfg.tokens) {
        await prisma.tokenBalance.upsert({
          where: { userId },
          create: { userId, balance: cfg.tokens },
          update: { balance: { increment: cfg.tokens } },
        })

        await prisma.notification.create({
          data: {
            userId,
            title: `${cfg.tokens} AI Token нэмэгдлээ`,
            message: `Таны AI token үлдэгдэлд ${cfg.tokens} token нэмэгдлээ.`,
            type: 'success',
          },
        })
      }

      // Contest
      if (cfg.type === 'contest') {
        const contest = await prisma.contest.findFirst({
          where: { status: { in: ['ACTIVE', 'UPCOMING'] } },
          orderBy: { createdAt: 'desc' },
        })

        if (contest) {
          await prisma.contestParticipant.upsert({
            where: { contestId_userId: { contestId: contest.id, userId } },
            create: { contestId: contest.id, userId, paymentId: payment.id },
            update: { paymentId: payment.id },
          })
        }

        await prisma.notification.create({
          data: {
            userId,
            title: '⚔ Contest-д бүртгэгдлээ!',
            message: 'Амжилттай бүртгэгдлээ. Сайхан тэмцэнэ үү!',
            type: 'success',
          },
        })
      }
    }

    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const { userId } = charge.metadata as { userId?: string }

      if (userId) {
        await prisma.payment.updateMany({
          where: { metadata: { path: ['stripeSessionId'], equals: charge.payment_intent } },
          data: { status: 'REFUNDED' },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Webhook processing error:', e)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }
}
