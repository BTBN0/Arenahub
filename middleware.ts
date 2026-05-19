import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)).*)',
  ],
}

// Routes accessible without login
const PUBLIC = ['/', '/login', '/pricing', '/api/auth']
// Routes that require login (prefix match)
const PROTECTED = ['/dashboard', '/lessons', '/profile', '/admin', '/payment', '/onboarding', '/contest']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Security headers ────────────────────────────────
  const res = NextResponse.next()
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('X-DNS-Prefetch-Control', 'off')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
  // HSTS — enforce HTTPS for 1 year
  res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  // Prevent MIME sniffing XSS
  res.headers.set('X-XSS-Protection', '1; mode=block')
  // CSP — Content Security Policy
  res.headers.set('Content-Security-Policy', [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "worker-src 'self' blob: https://cdn.jsdelivr.net",
    "img-src 'self' data: blob: https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://res.cloudinary.com https://api.qrserver.com",
    "connect-src 'self' https://api.groq.com https://cdn.jsdelivr.net",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '))

  // ── API cache hints ─────────────────────────────────
  if (pathname.startsWith('/api/')) {
    if (
      pathname.startsWith('/api/auth') ||
      pathname.startsWith('/api/profile') ||
      pathname.startsWith('/api/tokens') ||
      pathname.startsWith('/api/notifications') ||
      pathname.startsWith('/api/rewards') ||
      pathname.startsWith('/api/tasks') ||
      pathname.startsWith('/api/ai') ||
      pathname.startsWith('/api/onboarding') ||
      pathname.startsWith('/api/payment')
    ) {
      res.headers.set('Cache-Control', 'private, no-store')
    }
    return res
  }

  // ── Public routes — no auth needed ──────────────────
  if (PUBLIC.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    return res
  }

  // ── Protected route check ────────────────────────────
  const isProtected = PROTECTED.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return res

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
  })

  // Not logged in → login page
  if (!token) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Cookie stores the user's email so it's account-specific (not reused across accounts)
  const cookieDone = req.cookies.get('ah_onboarded')?.value === (token.email as string)

  // Logged in but onboarding not done → onboarding (except when already there)
  if (!token.onboardingComplete && !cookieDone && !pathname.startsWith('/onboarding')) {
    const url = req.nextUrl.clone()
    url.pathname = '/onboarding'
    return NextResponse.redirect(url)
  }

  return res
}