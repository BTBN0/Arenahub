import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'
import prisma from '@/lib/db'
import { sendVerificationEmail } from '@/lib/email'
import { ok, err, handleError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const u    = requireAuth(req)
    const user = await prisma.user.findUnique({ where: { id: u.id } })
    if (!user)                  return err('Хэрэглэгч олдсонгүй', 404)
    if (user.isEmailVerified)   return err('И-мэйл аль хэдийн баталгаажсан', 400)
    await sendVerificationEmail(user.id, user.email)
    return ok({ message: 'Баталгаажуулах и-мэйл илгээгдлээ' })
  } catch (e) { return handleError(e) }
}
