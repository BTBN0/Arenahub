import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'
import prisma from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const payload = requireAuth(req)
    const { paymentId, screenshot } = await req.json()
    if (!paymentId || !screenshot) return err('paymentId болон screenshot шаардлагатай')
    // Strict content-type whitelist
    const allowed = ['data:image/jpeg;','data:image/jpg;','data:image/png;','data:image/webp;']
    if (!allowed.some(t => screenshot.startsWith(t))) return err('Зөвхөн JPEG, PNG, WebP зураг зөвшөөрнө')
    // 5MB (consistent limit and message)
    if (screenshot.length > 5 * 1024 * 1024) return err('Зураг хэт том (5MB хүртэл)')

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
