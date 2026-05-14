import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/db'

const SECRET = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET

export async function GET(req: NextRequest) {
  try {
    const username = req.nextUrl.searchParams.get('username')?.trim()
    if (!username) return NextResponse.json({ available: false })
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
      return NextResponse.json({ available: false, reason: 'invalid' })
    const exists = await prisma.user.findUnique({ where: { username } })
    return NextResponse.json({ available: !exists })
  } catch (e) {
    console.error('onboarding GET error:', e)
    return NextResponse.json({ available: false }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: SECRET })
    if (!token?.email)
      return NextResponse.json({ error: 'Нэвтрээгүй байна' }, { status: 401 })

    const body = await req.json()
    const { username, age, country, avatarUrl } = body

    if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_]{3,20}$/.test(username.trim()))
      return NextResponse.json({ error: 'Хэрэглэгчийн нэр буруу (3-20 тэмдэгт, a-z 0-9 _)' }, { status: 400 })
    if (!age || typeof age !== 'number' || age < 13 || age > 100)
      return NextResponse.json({ error: 'Нас 13-100 хооронд байх ёстой' }, { status: 400 })
    if (!country || typeof country !== 'string' || country.trim().length < 2)
      return NextResponse.json({ error: 'Улс заавал бичих ёстой' }, { status: 400 })

    const existing = await prisma.user.findFirst({
      where: { username: username.trim(), NOT: { email: token.email } }
    })
    if (existing)
      return NextResponse.json({ error: 'Хэрэглэгчийн нэр аль хэдийн бүртгэлтэй' }, { status: 409 })

    // Raw SQL so new columns work regardless of Prisma client cache state
    const newAvatar = typeof avatarUrl === 'string' && avatarUrl.length > 0 ? avatarUrl : null
    if (newAvatar) {
      await prisma.$executeRaw`
        UPDATE users
        SET    username             = ${username.trim()},
               age                  = ${age},
               country              = ${country.trim()},
               "onboardingComplete" = true,
               "avatarUrl"          = ${newAvatar},
               "updatedAt"          = NOW()
        WHERE  email = ${token.email}
      `
    } else {
      await prisma.$executeRaw`
        UPDATE users
        SET    username             = ${username.trim()},
               age                  = ${age},
               country              = ${country.trim()},
               "onboardingComplete" = true,
               "updatedAt"          = NOW()
        WHERE  email = ${token.email}
      `
    }

    const resp = NextResponse.json({ ok: true })
    // Store email so the cookie is account-specific — old cookies from other sessions won't match
    resp.cookies.set('ah_onboarded', token.email!, {
      path: '/', httpOnly: false, maxAge: 60 * 60 * 24 * 30, sameSite: 'lax',
    })
    return resp
  } catch (e) {
    console.error('onboarding POST error:', e)
    return NextResponse.json({ error: 'Серверийн алдаа гарлаа. Дахин оролдоно уу.' }, { status: 500 })
  }
}