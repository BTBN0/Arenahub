import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { ok, err } from '@/lib/api-helpers'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return err('Token байхгүй', 400)

  const ev = await prisma.emailVerification.findUnique({ where: { token } })
  if (!ev)                          return NextResponse.redirect(new URL('/login?error=invalid-token', req.url))
  if (ev.expiresAt < new Date())    return NextResponse.redirect(new URL('/login?error=token-expired', req.url))

  await prisma.user.update({ where: { id: ev.userId }, data: { isEmailVerified: true } })
  await prisma.emailVerification.delete({ where: { token } })

  return NextResponse.redirect(new URL('/login?verified=1', req.url))
}
