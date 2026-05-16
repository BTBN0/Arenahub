import { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/db'
import { requireAuth, getUser } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'

async function resolveAdmin(req: NextRequest): Promise<boolean> {
  try {
    // 1. NextAuth session cookie
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET
    if (secret) {
      const naToken = await getToken({ req, secret })
      if (naToken?.id) {
        const u = await prisma.user.findUnique({ where: { id: naToken.id as string }, select: { role: true } })
        if (u?.role === 'ADMIN') return true
      }
      if (naToken?.email) {
        const u = await prisma.user.findUnique({ where: { email: naToken.email as string }, select: { role: true } })
        if (u?.role === 'ADMIN') return true
      }
    }
  } catch {}
  // 2. Bearer token fallback
  const u = getUser(req)
  if (u?.role === 'ADMIN') return true
  // 3. DB re-check from Bearer token user ID
  if (u?.id) {
    const dbUser = await prisma.user.findUnique({ where: { id: u.id }, select: { role: true } })
    return dbUser?.role === 'ADMIN'
  }
  return false
}

// GET /api/courses/:id
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const course = await prisma.course.findUnique({
      where: { id, isActive:true },
      include: {
        lessons:     { orderBy:{ orderIndex:'asc' }, include:{ _count:{select:{tasks:true}} } },
        _count:      { select:{ enrollments:true } },
      }
    })
    if (!course) return err('Хичээл олдсонгүй', 404)
    return ok({ course })
  } catch (e) { return handleError(e) }
}

// PUT /api/courses/:id (admin)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const u      = requireAuth(req)
    if (!['ADMIN','INSTRUCTOR'].includes(u.role)) return err('Эрх хүрэлцэхгүй', 403)
    const data   = await req.json()
    const course = await prisma.course.update({ where:{id}, data })
    return ok({ course })
  } catch (e) { return handleError(e) }
}

// DELETE /api/courses/:id (admin only)
// ?hard=true → бүрэн устгах, default → draft болгох
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const isAdmin = await resolveAdmin(req)
    if (!isAdmin) return err('Эрх хүрэлцэхгүй', 403)
    const hard = req.nextUrl.searchParams.get('hard') === 'true'
    if (hard) {
      await prisma.course.delete({ where:{ id } })
      return ok({ message: 'Бүрэн устгагдлаа' })
    }
    await prisma.course.update({ where:{ id }, data:{ isActive:false } })
    return ok({ message: 'Draft болгогдлоо' })
  } catch (e) { return handleError(e) }
}

// POST /api/courses/:id  → enroll
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const u      = requireAuth(req)
    const action = req.nextUrl.searchParams.get('action')

    if (action === 'enroll') {
      await prisma.enrollment.upsert({
        where:  { userId_courseId: { userId:u.id, courseId:id } },
        update: {},
        create: { userId:u.id, courseId:id }
      })
      return ok({ message: 'Бүртгэгдлээ' })
    }

    return err('action: enroll')
  } catch (e) { return handleError(e) }
}
