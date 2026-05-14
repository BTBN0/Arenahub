import { NextRequest } from 'next/server'
import { requirePermission } from '@/lib/permissions'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    requirePermission(req, 'payment.manage')
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'PENDING'

    const payments = await prisma.payment.findMany({
      where: status === 'ALL' ? {} : { status: status as 'PENDING' | 'PAID' | 'REJECTED' | 'REFUNDED' },
      include: { user: { select: { id:true, username:true, email:true } } },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return ok({ payments })
  } catch(e) { return handleError(e) }
}

export async function POST(req: NextRequest) {
  try {
    const payload = requirePermission(req, 'payment.manage')
    const { paymentId, action, adminNote } = await req.json()
    if (!['approve','reject'].includes(action)) return err('action: approve | reject')

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }, include: { user: true }
    })
    if (!payment) return err('Олдсонгүй', 404)
    if (payment.status !== 'PENDING') return err('Аль боловсруулагдсан')

    if (action === 'reject') {
      await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'REJECTED', adminNote, approvedBy: payload.id, approvedAt: new Date() }
      })
      await prisma.adminLog.create({
        data: { adminId: payload.id, action: 'PAYMENT_REJECT', targetId: paymentId }
      })
      return ok({ message: 'Цуцлагдлаа' })
    }

    const meta = payment.metadata as Record<string, unknown>
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: { status: 'PAID', adminNote, approvedBy: payload.id, approvedAt: new Date() }
      })
      if (payment.type === 'SUBSCRIPTION' && meta?.plan) {
        const months = meta.period === 'yearly' ? 12 : 1
        const endDate = new Date(); endDate.setMonth(endDate.getMonth() + months)
        await tx.subscription.upsert({
          where: { userId: payment.userId },
          update: { plan: meta.plan as 'FREE'|'PRO'|'VIP', startDate: new Date(), endDate, paymentId },
          create: { userId: payment.userId, plan: meta.plan as 'FREE'|'PRO'|'VIP', startDate: new Date(), endDate, paymentId }
        })
      }
      if (payment.type === 'TOKEN' && meta?.tokens) {
        await tx.tokenBalance.upsert({
          where: { userId: payment.userId },
          update: { balance: { increment: meta.tokens as number } },
          create: { userId: payment.userId, balance: meta.tokens as number, totalUsed: 0 }
        })
      }
      await tx.adminLog.create({
        data: { adminId: payload.id, action: 'PAYMENT_APPROVE', targetId: paymentId }
      })
      await tx.notification.create({
        data: {
          userId: payment.userId,
          title: '✓ Төлбөр баталгаажлаа',
          message: `${payment.amount.toLocaleString()}₮ төлбөр батлагдсан. Эрх нэмэгдлээ!`,
          type: 'success',
        }
      })
    })
    return ok({ message: 'Батлагдлаа. Хэрэглэгчийн эрх нэмэгдлээ.' })
  } catch(e) { return handleError(e) }
}