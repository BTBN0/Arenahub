'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` })

type Stats = {
  users: number; tasks: number; courses: number
  topPlayers: { username: string; xp: number; level: number }[]
  recentActivity: { id: string; action: string; createdAt: string; user: { username: string } }[]
  totalSubmissions?: number
}
type PendingStats = { pendingPayments: number; totalRevenue: number }

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'var(--cyan)', REGISTER: 'var(--green)', BAN: 'var(--red)',
  PAYMENT_APPROVE: 'var(--green)', PAYMENT_REJECT: 'var(--red)',
  SYSTEM_CONFIG_UPDATE: 'var(--yellow)', PAYMENT_MANAGE: 'var(--purple)',
}
const getActionCol = (action: string) => {
  for (const k of Object.keys(ACTION_COLORS)) if (action.includes(k)) return ACTION_COLORS[k]
  return 'var(--dim2)'
}

function StatCard({ label, value, icon, col, sub, href, loading }: {
  label: string; value: string | number; icon: string; col: string
  sub?: string; href?: string; loading?: boolean
}) {
  const inner = (
    <div style={{
      background: 'var(--bg2)', border: `1px solid ${col}22`, padding: '22px 24px',
      cursor: href ? 'pointer' : 'default', transition: 'all .2s', position: 'relative', overflow: 'hidden',
    }}
      onMouseEnter={e => { if (href) { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${col}55`; el.style.background = `color-mix(in srgb, var(--bg2) 92%, ${col})` } }}
      onMouseLeave={e => { if (href) { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${col}22`; el.style.background = 'var(--bg2)' } }}>
      {/* glow corner */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, background: `radial-gradient(circle at top right, ${col}18, transparent 70%)`, pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2 }}>{label}</div>
        <span style={{ fontSize: 16, opacity: 0.7 }}>{icon}</span>
      </div>
      <div style={{ ...fp, fontSize: 22, color: col, marginBottom: 4, lineHeight: 1 }}>
        {loading ? <span style={{ color: 'var(--dim)', fontSize: 14 }}>···</span> : value}
      </div>
      {sub && <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
  return href
    ? <Link href={href} style={{ flex: 1, textDecoration: 'none' }}>{inner}</Link>
    : <div style={{ flex: 1 }}>{inner}</div>
}

function QuickAction({ href, icon, label, col, desc }: { href: string; icon: string; label: string; col: string; desc: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none', flex: 1, minWidth: 140 }}>
      <div style={{
        background: 'var(--bg2)', border: `1px solid ${col}22`, padding: '16px 18px',
        transition: 'all .18s', cursor: 'pointer',
      }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${col}66`; el.style.background = `color-mix(in srgb, var(--bg2) 88%, ${col})` }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = `${col}22`; el.style.background = 'var(--bg2)' }}>
        <div style={{ fontSize: 18, marginBottom: 8 }}>{icon}</div>
        <div style={{ ...fp, fontSize: 7, color: col, letterSpacing: 1, marginBottom: 4 }}>{label}</div>
        <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)' }}>{desc}</div>
      </div>
    </Link>
  )
}

export default function AdminDashboard() {
  const [stats, setStats]     = useState<Stats | null>(null)
  const [extra, setExtra]     = useState<PendingStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/stats', { headers: authH() }).then(r => r.json()),
      fetch('/api/admin/payment?status=PENDING', { headers: authH() }).then(r => r.json()),
    ]).then(([s, p]) => {
      setStats(s.stats ?? null)
      const payments: { amount: number }[] = p.payments ?? []
      setExtra({ pendingPayments: payments.length, totalRevenue: payments.reduce((a, x) => a + (x.amount || 0), 0) })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const now     = new Date()
  const dateStr = now.toLocaleDateString('mn-MN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const timeStr = now.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{ padding: '28px 36px', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 8 }}>ARENAHUB · ADMIN PANEL</div>
          <h1 style={{ ...fp, fontSize: 15, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
            DASHBOARD
            <span style={{ fontSize: 7, color: 'var(--green)', marginLeft: 12, padding: '3px 8px', border: '1px solid var(--green)33', background: 'var(--green)0d' }}>● LIVE</span>
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ ...fp, fontSize: 11, color: 'var(--dim2)', marginBottom: 2 }}>{dateStr}</div>
          <div style={{ ...fp, fontSize: 7, color: 'var(--dim2)' }}>{timeStr}</div>
        </div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label='НИЙТ ХЭРЭГЛЭГЧ'  value={stats?.users ?? 0}            icon='◉' col='var(--cyan)'   sub='Бүртгэлтэй нийт'       href='/admin/users'    loading={loading} />
        <StatCard label='ИДЭВХТЭЙ COURSE'  value={stats?.courses ?? 0}          icon='◫' col='var(--green)'  sub='Нийтлэгдсэн'           href='/admin/courses'  loading={loading} />
        <StatCard label='НИЙТ TASK'        value={stats?.tasks ?? 0}            icon='◈' col='var(--yellow)' sub='Бүх даалгавар'           href='/admin/tasks'    loading={loading} />
        <StatCard label='PENDING ТӨЛБӨР'   value={extra?.pendingPayments ?? 0}  icon='◐' col={extra?.pendingPayments ? 'var(--red)' : 'var(--purple)'}
          sub={extra?.totalRevenue ? `${extra.totalRevenue.toLocaleString()}₮ нийт` : 'Батлах шаардлагатай'} href='/admin/payments' loading={loading} />
      </div>

      {/* Middle row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 24 }}>

        {/* Recent Activity */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '20px 22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ ...fp, fontSize: 7, color: 'var(--cyan)', letterSpacing: 2 }}>СҮҮЛИЙН ҮЙЛДЛҮҮД</div>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', padding: '3px 8px', border: '1px solid var(--dim)' }}>
              {(stats?.recentActivity?.length ?? 0)} LOG
            </div>
          </div>
          {loading ? (
            <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)', padding: '16px 0' }}>Уншиж байна...</div>
          ) : (stats?.recentActivity?.length ?? 0) === 0 ? (
            <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)', padding: '16px 0' }}>Үйлдэл алга</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {(stats?.recentActivity ?? []).slice(0, 8).map((a, i) => (
                <div key={a.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 2fr auto',
                  alignItems: 'center', gap: 12, padding: '8px 10px',
                  background: i % 2 === 0 ? 'transparent' : 'var(--bg)11',
                  borderBottom: '1px solid var(--dim)',
                }}>
                  <span style={{ ...fp, fontSize: 6, color: 'var(--cyan)' }}>{a.user?.username ?? '—'}</span>
                  <span style={{ ...fp, fontSize: 5, color: getActionCol(a.action), letterSpacing: 0.5 }}>{a.action}</span>
                  <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)', whiteSpace: 'nowrap' }}>
                    {new Date(a.createdAt).toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Players */}
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '20px 22px' }}>
          <div style={{ ...fp, fontSize: 7, color: 'var(--yellow)', letterSpacing: 2, marginBottom: 16 }}>TOP PLAYERS</div>
          {loading ? (
            <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)' }}>Уншиж байна...</div>
          ) : (stats?.topPlayers ?? []).length === 0 ? (
            <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)' }}>Өгөгдөл алга</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {(stats?.topPlayers ?? []).slice(0, 8).map((p, i) => {
                const rankCol = i === 0 ? 'var(--yellow)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--dim2)'
                const medal   = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''
                return (
                  <div key={p.username} style={{
                    display: 'grid', gridTemplateColumns: '24px 1fr auto auto',
                    alignItems: 'center', gap: 8,
                    padding: '7px 8px', borderBottom: '1px solid var(--dim)',
                    background: i < 3 ? `${rankCol}06` : 'transparent',
                  }}>
                    <span style={{ ...fp, fontSize: 9, color: rankCol, textAlign: 'center' }}>
                      {medal || <span style={{ fontSize: 6 }}>{i + 1}</span>}
                    </span>
                    <span style={{ ...fp, fontSize: 6, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.username}</span>
                    <span style={{ ...fp, fontSize: 5, color: 'var(--yellow)', whiteSpace: 'nowrap' }}>{p.xp.toLocaleString()}</span>
                    <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)', minWidth: 32, textAlign: 'right' }}>LV{p.level}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Quick Actions */}
      <div>
        <div style={{ ...fp, fontSize: 6, color: 'var(--dim2)', letterSpacing: 2, marginBottom: 12 }}>ШУУРХАЙ ХАНДАЛТ</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          <QuickAction href='/admin/users'         icon='👥' label='USERS'         col='var(--cyan)'   desc='Хэрэглэгч удирдах' />
          <QuickAction href='/admin/courses'       icon='📚' label='COURSES'       col='var(--green)'  desc='Курс удирдах' />
          <QuickAction href='/admin/payments'      icon='💳' label='PAYMENTS'      col='var(--purple)' desc='Төлбөр батлах' />
          <QuickAction href='/admin/notifications' icon='🔔' label='NOTIFY'        col='var(--red)'    desc='Мэдэгдэл илгээх' />
          <QuickAction href='/admin/contest'       icon='🏆' label='CONTEST'       col='var(--yellow)' desc='Тэмцээн үүсгэх' />
          <QuickAction href='/admin/reports'       icon='📊' label='REPORTS'       col='var(--dim2)'   desc='Тайлан харах' />
        </div>
      </div>

    </div>
  )
}

const REVENUE_BARS = [
  { label: 'PRO',     sub: '500 хэрэглэгч',    value: 102, total: 175, col: 'var(--cyan)',   detail: '₮17,000 × 500 × 12' },
  { label: 'VIP',     sub: '100 хэрэглэгч',    value: 40,  total: 175, col: 'var(--yellow)', detail: '₮34,000 × 100 × 12' },
  { label: 'TOKEN',   sub: '~640 худалдаа/сар', value: 24,  total: 175, col: 'var(--green)',  detail: '₮3,750 дундаж' },
  { label: 'CONTEST', sub: '~240 оролцогч/сар', value: 9,   total: 175, col: 'var(--purple)', detail: '₮3,000 × 240 × 12' },
]

function RevenueChart() {
  const max = Math.max(...REVENUE_BARS.map(b => b.value))
  const total = REVENUE_BARS.reduce((s, b) => s + b.value, 0)

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '22px 24px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
      {/* subtle glow */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: 200, height: 200, background: 'radial-gradient(circle at top right, rgba(0,255,65,.04), transparent 70%)', pointerEvents: 'none' }} />

      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 3, height: 18, background: 'var(--green)', boxShadow: '0 0 8px var(--green)' }} />
          <div style={{ ...fp, fontSize: 7, color: 'var(--green)', letterSpacing: 3 }}>ОРЛОГЫН ТААМАГЛАЛТ</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2 }}>ЖИЛИЙН НИЙТ</span>
          <span style={{ ...fp, fontSize: 18, color: 'var(--green)' }}>~₮{total}M</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
        {REVENUE_BARS.map(bar => {
          const pct = Math.round((bar.value / max) * 100)
          return (
            <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* bar chart area */}
              <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                {/* grid lines */}
                {[25, 50, 75, 100].map(g => (
                  <div key={g} style={{ position: 'absolute', left: 0, right: 0, bottom: `${g}%`, height: 1, background: 'rgba(255,255,255,.04)', pointerEvents: 'none' }} />
                ))}
                {/* bar */}
                <div style={{ width: '100%', position: 'relative', height: `${pct}%`, minHeight: 12 }}>
                  {/* glow at top */}
                  <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: bar.col, boxShadow: `0 0 12px ${bar.col}` }} />
                  {/* bar body */}
                  <div style={{
                    position: 'absolute', inset: 2, insetBlockStart: 2,
                    background: `linear-gradient(180deg, ${bar.col}44 0%, ${bar.col}18 100%)`,
                    border: `1px solid ${bar.col}33`,
                    borderTop: 'none',
                  }} />
                  {/* scanlines texture */}
                  <div style={{
                    position: 'absolute', inset: 2, insetBlockStart: 2,
                    backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,.1) 3px, rgba(0,0,0,.1) 4px)`,
                    pointerEvents: 'none',
                  }} />
                  {/* value label at top */}
                  <div style={{ position: 'absolute', top: -20, left: 0, right: 0, textAlign: 'center', ...fp, fontSize: 8, color: bar.col }}>
                    ₮{bar.value}M
                  </div>
                </div>
              </div>

              {/* share bar */}
              <div style={{ height: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${Math.round(bar.value / total * 100)}%`, background: bar.col, boxShadow: `0 0 6px ${bar.col}88`, transition: 'width 1s ease' }} />
              </div>

              {/* labels */}
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...fp, fontSize: 8, color: bar.col, letterSpacing: 1, marginBottom: 4 }}>{bar.label}</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 3 }}>{bar.sub}</div>
                <div style={{ fontFamily: 'var(--fm)', fontSize: 10, color: 'var(--dim2)' }}>{bar.detail}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* total bar */}
      <div style={{ marginTop: 18, height: 1, background: 'var(--dim)' }} />
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        {REVENUE_BARS.map(bar => (
          <div key={bar.label} title={bar.label} style={{ flex: bar.value, height: 6, background: `linear-gradient(90deg, ${bar.col}88, ${bar.col}55)`, boxShadow: `0 0 8px ${bar.col}44` }} />
        ))}
      </div>
      <div style={{ marginTop: 8, display: 'flex', gap: 20 }}>
        {REVENUE_BARS.map(bar => (
          <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, background: bar.col }} />
            <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>{bar.label} {Math.round(bar.value / total * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}