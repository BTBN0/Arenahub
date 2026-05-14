import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Warm DB connection so next real request is instant
  await prisma.$queryRaw`SELECT 1`
  return NextResponse.json({ ok: true, ts: Date.now() })
}