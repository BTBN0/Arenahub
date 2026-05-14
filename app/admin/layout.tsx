'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useEffect } from 'react'
import { ALL_NAV, STAFF_ROLES, ROLE_PERMISSIONS, ROLE_COLORS, ROLE_LABELS, type Permission } from '@/lib/permissions-client'

const fp = { fontFamily: 'var(--fp)' } as const

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, isAuthenticated } = useAuth()
  const router   = useRouter()
  const pathname = usePathname()

  const role = (user as { role?: string } | null)?.role ?? ''

  useEffect(() => {
    if (!loading && (!isAuthenticated || !STAFF_ROLES.includes(role))) {
      router.push('/')
    }
  }, [loading, isAuthenticated, role, router])

  if (loading || !user || !STAFF_ROLES.includes(role)) return null

  const u = user as { username: string; role: string; email?: string; level?: number; xp?: number }

  const visibleNav = ALL_NAV.filter(item => {
    if (!item.perm) return true
    return (ROLE_PERMISSIONS[role] ?? []).includes(item.perm as Permission)
  })

  const roleCol   = ROLE_COLORS[role] ?? 'var(--cyan)'
  const roleLabel = ROLE_LABELS[role]  ?? role

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Sidebar */}
      <nav style={{
        width: 220, minWidth: 220,
        background: 'var(--bg)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        overflowY: 'auto', scrollbarWidth: 'none',
      }}>

        {/* Brand */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 4 }}>ARENAHUB</div>
          <div style={{ ...fp, fontSize: 10, color: 'var(--cyan)', letterSpacing: 3, marginBottom: 14 }}>ADMIN PANEL</div>

          {/* Role badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 10px',
            background: `${roleCol}0d`,
            border: `1px solid ${roleCol}2a`,
          }}>
            <div style={{
              width: 28, height: 28, flexShrink: 0,
              background: `${roleCol}18`,
              border: `1px solid ${roleCol}44`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              ...fp, fontSize: 7, color: roleCol,
            }}>
              {u.username.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ minWidth: 0, overflow: 'hidden' }}>
              <div style={{ ...fp, fontSize: 6, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.username}</div>
              <div style={{ ...fp, fontSize: 5, color: roleCol, marginTop: 2 }}>{roleLabel}</div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: '6px 0' }}>
          {visibleNav.map(item => {
            const active = item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 18px',
                  background: active ? `${item.col}12` : 'transparent',
                  borderLeft: `2px solid ${active ? item.col : 'transparent'}`,
                  transition: 'all .12s', cursor: 'pointer',
                }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = `${item.col}08` }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}>
                  <span style={{ ...fp, fontSize: 11, color: active ? item.col : 'var(--dim)', width: 16, textAlign: 'center', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ ...fp, fontSize: 6, color: active ? item.col : 'var(--dim2)', letterSpacing: 0.5, flex: 1 }}>{item.label}</span>
                  {active && <div style={{ width: 4, height: 4, background: item.col, boxShadow: `0 0 6px ${item.col}`, flexShrink: 0 }} />}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 0 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* XP bar */}
          {u.xp !== undefined && (
            <div style={{ padding: '8px 18px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>LV{u.level ?? 1}</span>
                <span style={{ ...fp, fontSize: 5, color: 'var(--yellow)' }}>{(u.xp ?? 0).toLocaleString()} XP</span>
              </div>
              <div style={{ height: 3, background: 'var(--dim)', borderRadius: 0 }}>
                <div style={{
                  height: '100%', background: 'var(--yellow)',
                  width: `${Math.min(100, ((u.xp ?? 0) % 200) / 200 * 100)}%`,
                  boxShadow: '0 0 6px var(--yellow)88',
                  transition: 'width .3s',
                }} />
              </div>
            </div>
          )}
          <Link href='/dashboard' style={{ textDecoration: 'none', display: 'block' }}>
            <div style={{
              ...fp, fontSize: 5, color: 'var(--dim2)',
              padding: '6px 18px', cursor: 'pointer', letterSpacing: 1,
              transition: 'color .15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.color = 'var(--cyan)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.color = 'var(--dim2)'}>
              ← USER PANEL
            </div>
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  )
}