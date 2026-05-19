import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  try {
    const { token, password } = z.object({
      token:    z.string().min(1),
      password: z.string().min(6),
    }).parse(await req.json())

    const pr = await prisma.passwordReset.findUnique({ where: { token } })
    if (!pr || pr.used || pr.expiresAt < new Date())
      return err('Token хүчингүй эсвэл хугацаа дууссан', 400)

    const hash = await hashPassword(password)
    await prisma.user.update({ where: { id: pr.userId }, data: { passwordHash: hash } })
    await prisma.passwordReset.update({ where: { token }, data: { used: true } })
    // Revoke all sessions
    await prisma.refreshToken.deleteMany({ where: { userId: pr.userId } })

    return ok({ message: 'Нууц үг амжилттай солигдлоо' })
  } catch (e) { return handleError(e) }
}
