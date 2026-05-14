import { NextRequest } from 'next/server'
import prisma from '@/lib/db'
import { requireAuth, requireAdmin } from '@/lib/auth'
import { ok, err, handleError } from '@/lib/api-helpers'

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
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    requireAdmin(req)
    await prisma.course.update({ where:{id}, data:{ isActive:false } })
    return ok({ message: 'Устгагдлаа' })
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
