import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export function ok<T>(data: T, status = 200, cache = 0) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (cache > 0) headers['Cache-Control'] = `public, s-maxage=${cache}, stale-while-revalidate=${cache * 2}`
  return NextResponse.json(data, { status, headers })
}

export function err(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status })
}

export function handleError(e: unknown) {
  if (e instanceof ZodError) return err('Буруу өгөгдөл: ' + e.errors.map(x => x.message).join(', '), 400)
  const error = e as { message?: string; status?: number }
  const status = error.status || 500
  if (status >= 500) {
    if (process.env.NODE_ENV !== 'test') console.error('[API Error]', error.message, e)
    return err('Серверийн алдаа гарлаа. Дахин оролдоно уу.', 500)
  }
  return err(error.message || 'Алдаа гарлаа', status)
}