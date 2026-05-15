import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth'
import { registerUser, loginUser, logoutUser } from '@/lib/services/auth.service'
import { ok, err, handleError } from '@/lib/api-helpers'
import { rateLimiter, getClientIP } from '@/lib/services/security.service'
import { sendVerificationEmail, sendWelcomeEmail } from '@/lib/email'
import prisma from '@/lib/db'
import { cacheGet, cacheSet, cacheDel } from '@/lib/cache'

const registerSchema = z.object({
  username: z.string().min(3, 'Нэр 3+ тэмдэгт').max(20, 'Нэр 20- тэмдэгт')
    .regex(/^[a-zA-Z0-9_]+$/, 'Зөвхөн үсэг, тоо, _ зөвшөөрнө'),
  email:    z.string().email('И-мэйл буруу').max(100),
  password: z.string().min(8, 'Нууц үг 8+ тэмдэгт').max(72, 'Нууц үг 72- тэмдэгт'),
})

const loginSchema = z.object({
  email:    z.string().email().max(100),
  password: z.string().min(1).max(72),
})

/* GET /api/auth → me  (server-side cache 10s per user) */
export async function GET(req: NextRequest) {
  try {
    const u   = requireAuth(req)
    const key = `user:${u.id}`

    const cached = cacheGet<object>(key)
    if (cached) return NextResponse.json({ ok: true, user: cached })

    const user = await prisma.user.findUnique({
      where:  { id: u.id },
      select: {
        id: true, username: true, email: true, role: true,
        xp: true, level: true, coins: true, avatarUrl: true, bio: true, country: true,
        isEmailVerified: true, googleId: true, createdAt: true,
        subscription: { select: { plan: true, endDate: true } },
        _count: { select: { enrollments:true, taskSubmissions:true, lessonProgress:true } },
      },
    })
    if (!user) return err('Хэрэглэгч олдсонгүй', 404)

    cacheSet(key, user, 10_000) // 10s — fresh enough for live XP
    return NextResponse.json({ ok: true, user })
  } catch (e) { return handleError(e) }
}

/* POST /api/auth?action=register|login|logout */
export async function POST(req: NextRequest) {
  try {
    const action = req.nextUrl.searchParams.get('action')
    const ip     = getClientIP(req)

    if (!rateLimiter(ip, 20, 15 * 60 * 1000))
      return err('Хэт олон оролдлого. 15 минут хүлээнэ үү.', 429)

    if (action === 'register') {
      const { username, email, password } = registerSchema.parse(await req.json())

      const result = await registerUser({ username, email, password })

      // Send emails (non-blocking)
      sendVerificationEmail(result.user.id, email).catch(console.error)
      sendWelcomeEmail(email, username).catch(console.error)

      return ok({
        user:              result.user,
        token:             result.accessToken,
        refreshToken:      result.refreshToken,
        message:           'Бүртгэл амжилттай. И-мэйлийн баталгаажуулах холбоосыг шалгана уу.',
        emailVerification: 'pending',
      }, 201)
    }

    if (action === 'login') {
      const { email, password } = loginSchema.parse(await req.json())
      const result = await loginUser(email, password, ip)
      return ok({
        user:         result.user,
        token:        result.accessToken,
        refreshToken: result.refreshToken,
        message:      'Нэвтрэлт амжилттай',
      })
    }

    if (action === 'logout') {
      const u = requireAuth(req)
      await logoutUser(u.id)
      cacheDel(`user:${u.id}`)
      return ok({ message: 'Гарлаа' })
    }

    return err('action: register | login | logout')
  } catch (e) { return handleError(e) }
}
