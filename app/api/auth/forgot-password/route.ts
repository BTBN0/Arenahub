import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { sendPasswordResetEmail } from '@/lib/email'
import { ok, err, handleError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const { email } = z.object({ email: z.string().email() }).parse(await req.json())
    const user = await prisma.user.findUnique({ where: { email } })
    // Always return ok (don't reveal if email exists)
    if (user) await sendPasswordResetEmail(user.id, email).catch(console.error)
    return ok({ message: 'Хэрэв и-мэйл бүртгэлтэй бол сэргээх холбоос илгээгдлээ' })
  } catch (e) { return handleError(e) }
}
