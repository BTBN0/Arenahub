import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const { paymentId, screenshot } = await req.json()
    if (!paymentId || !screenshot) return err('paymentId болон screenshot шаардлагатай')
    if (!screenshot.startsWith('data:image/')) return err('Зөвхөн зургийн файл')
    if (screenshot.length > 7 * 1024 * 1024) return err('Зураг хэт том (5MB хүртэл)')

    const payment = await prisma.payment.findFirst({ where: { id: paymentId, userId: payload.id } })
    if (!payment) return err('Төлбөр олдсонгүй', 404)
    if (payment.status !== 'PENDING') return err('Аль хэдийн боловсруулагдсан')

    const updated = await prisma.payment.update({
      where: { id: paymentId },
      data: { screenshotUrl: screenshot }
    })
    return ok({ payment: updated })
  } catch(e) { return handleError(e) }
}
