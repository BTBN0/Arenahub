import { NextRequest } from 'next/server'
import { ok, err, handleError } from '@/lib/api-helpers'
import { generateAccessToken } from '@/lib/auth'
import prisma from '@/lib/db'

// Called after Google OAuth — returns our custom JWT for the user
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email) return err('email байхгүй', 400)

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id:true, username:true, email:true, role:true,
                xp:true, level:true, coins:true, avatarUrl:true,
                country:true, isEmailVerified:true,
                subscription: { select: { plan:true, endDate:true } } },
    })
    if (!user) return err('Хэрэглэгч олдсонгүй', 404)

    const token = generateAccessToken({
      id:       user.id,
      username: user.username,
      email:    user.email,
      role:     user.role,
    })

    return ok({ token, user })
  } catch (e) { return handleError(e) }
}
