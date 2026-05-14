'use client'
import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { authApi, User } from '@/lib/api-client'

interface AuthCtx {
  user:            User | null
  loading:         boolean
  login:           (email: string, password: string) => Promise<void>
  register:        (username: string, email: string, password: string) => Promise<void>
  logout:          () => void
  isAdmin:         boolean
  isAuthenticated: boolean
  refreshUser:     () => Promise<void>
}

const Ctx = createContext<AuthCtx | null>(null)
const PUBLIC_PATHS = ['/', '/login', '/register', '/forgot-password', '/reset-password']
const USER_CACHE_KEY  = 'ah_user'
const USER_CACHE_TTL  = 120_000 // 2min client-side cache

function readUserCache(): User | null {
  try {
    const raw = sessionStorage.getItem(USER_CACHE_KEY)
    if (!raw) return null
    const { user, ts } = JSON.parse(raw)
    if (Date.now() - ts > USER_CACHE_TTL) { sessionStorage.removeItem(USER_CACHE_KEY); return null }
    return user
  } catch { return null }
}

function writeUserCache(user: User) {
  try { sessionStorage.setItem(USER_CACHE_KEY, JSON.stringify({ user, ts: Date.now() })) } catch {}
}

function clearUserCache() {
  try { sessionStorage.removeItem(USER_CACHE_KEY) } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const router   = useRouter()
  const pathname = usePathname()
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const synced = useRef(false)

  // Restore cached user after hydration — also clears loading so pages render immediately
  useEffect(() => {
    const cached = readUserCache()
    if (cached) { setUser(cached); setLoading(false) }
  }, [])

  const setAndCacheUser = (u: User) => { setUser(u); writeUserCache(u) }

  useEffect(() => {
    if (status === 'loading') return

    // If we already have a valid cached user, skip the API call
    const cached = readUserCache()
    if (cached) {
      setUser(cached)
      setLoading(false)
      if (PUBLIC_PATHS.includes(pathname) && !synced.current) {
        synced.current = true
        router.replace('/dashboard')
      }
      // Refresh in background (stale-while-revalidate)
      const token = localStorage.getItem('arenahub_token')
      if (token) {
        authApi.me()
          .then(d => setAndCacheUser(d.user))
          .catch(async (e: any) => {
            // Bearer token expired — re-sync via google-token to get fresh token + subscription
            if (e?.status === 401 && session?.user?.email) {
              try {
                const r = await fetch('/api/auth/google-token', {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: session.user.email }),
                })
                if (r.ok) {
                  const d = await r.json()
                  if (d.token) { localStorage.setItem('arenahub_token', d.token); setAndCacheUser(d.user) }
                }
              } catch {}
            }
          })
      }
      return
    }

    const sync = async () => {
      // ── Google session → JWT token ──
      if (session?.user?.email) {
        try {
          const res = await fetch('/api/auth/google-token', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({ email: session.user.email }),
          })
          if (res.ok) {
            const d = await res.json()
            if (d.token) {
              localStorage.setItem('arenahub_token', d.token)
              setAndCacheUser(d.user)
              setLoading(false)
              if (PUBLIC_PATHS.includes(pathname)) router.replace('/dashboard')
              return
            }
          }
        } catch {}
      }

      // ── Custom JWT ──
      const token = localStorage.getItem('arenahub_token')
      if (token) {
        try {
          const d = await authApi.me()
          setAndCacheUser(d.user)
          if (PUBLIC_PATHS.includes(pathname) && !synced.current) {
            synced.current = true
            router.replace('/dashboard')
          }
        } catch {
          localStorage.removeItem('arenahub_token')
          clearUserCache()
        }
      }
      setLoading(false)
    }

    sync()
  }, [session, status])

  const refreshUser = async () => {
    const token = localStorage.getItem('arenahub_token')
    if (!token) return
    clearUserCache()
    try { setAndCacheUser((await authApi.me()).user) } catch {}
  }

  const login = async (email: string, password: string) => {
    const { user, token } = await authApi.login(email, password)
    localStorage.setItem('arenahub_token', token)
    setAndCacheUser(user)
    router.replace('/dashboard')
  }

  const register = async (username: string, email: string, password: string) => {
    const { user, token } = await authApi.register(username, email, password)
    localStorage.setItem('arenahub_token', token)
    setAndCacheUser(user)
    router.replace('/dashboard')
  }

  const logout = async () => {
    localStorage.removeItem('arenahub_token')
    clearUserCache()
    setUser(null)
    synced.current = false
    await signOut({ callbackUrl: '/' })
  }

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout, refreshUser,
      isAdmin: user?.role === 'ADMIN', isAuthenticated: !!user }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}