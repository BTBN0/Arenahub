'use client'
import { useEffect, useState } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

import { adminFetch } from '@/lib/admin-fetch'

type DashStats = { users: number; tasks: number; courses: number }
type UsageStats = { totalUsers: number; totalTasks: number; totalSubmissions: number; passedCount: number; avgPassRate: number }
type Payment = { amount: number; status: string; createdAt: string; type: string }

function Bar({ pct, col }: { pct: number; col: string }) {
  return (
    <div style={{ flex: 1, height: 10, background: 'var(--bg)', border: '1px solid var(--dim)', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(100, pct)}%`, background: col }} />
    </div>
  )
}

export default function AdminReportsPage() {
  const [dash, setDash]       = useState<DashStats | null>(null)
  const [usage, setUsage]     = useState<UsageStats | null>(null)
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      adminFetch('/api/admin/stats').then(r => r.json()),
      adminFetch('/api/admin/stats?type=usage').then(r => r.json()),
      adminFetch('/api/admin/payment?status=ALL').then(r => r.json()),
    ]).then(([d, u, p]) => {
      setDash(d.stats ?? null)
      setUsage(u.stats ?? null)
      setPayments(p.payments ?? [])
    }).finally(() => setLoading(false))
  }, [])

  const paidPayments  = payments.filter(p => p.status === 'PAID')
  const totalRevenue  = paidPayments.reduce((s, p) => s + p.amount, 0)

  const byMonth: Record<string, number> = {}
  paidPayments.forEach(p => {
    const k = p.createdAt.slice(0, 7)
    byMonth[k] = (byMonth[k] ?? 0) + p.amount
  })
  const monthKeys   = Object.keys(byMonth).sort().slice(-6)
  const monthValues = monthKeys.map(k => byMonth[k])
  const maxVal      = Math.max(...monthValues, 1)

  const byType: Record<string, number> = {}
  paidPayments.forEach(p => { byType[p.type] = (byType[p.type] ?? 0) + p.amount })

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · REPORTS</div>
        <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
          REPORTS & ANALYTICS <span style={{ fontSize: 8, color: 'var(--purple)' }}>◑</span>
        </h1>
      </div>

      {loading ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', padding: '40px 0' }}>Уншиж байна...</div>
      ) : (
        <>
          {/* Top Stats */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 28, border: '1px solid var(--dim)' }}>
            {[
              { label: 'НИЙТ ХЭРЭГЛЭГЧ',   value: dash?.users ?? 0,          col: 'var(--cyan)'   },
              { label: 'НИЙТ SUBMISSION',   value: usage?.totalSubmissions ?? 0, col: 'var(--green)'  },
              { label: 'AVG PASS RATE',     value: `${usage?.avgPassRate ?? 0}%`, col: 'var(--yellow)' },
              { label: 'НИЙТ ОРЛОГО',       value: `${totalRevenue.toLocaleString()}₮`, col: 'var(--purple)' },
            ].map(s => (
              <div key={s.label} style={{ flex: 1, padding: '18px 20px', background: 'var(--bg2)', borderRight: '1px solid var(--dim)' }}>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
                <div style={{ ...fp, fontSize: 14, color: s.col }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            {/* Revenue Chart */}
            <div style={{ flex: 2, background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '20px 22px' }}>
              <div style={{ ...fp, fontSize: 7, color: 'var(--purple)', letterSpacing: 2, marginBottom: 18 }}>САРЫН ОРЛОГО</div>
              {monthKeys.length === 0 ? (
                <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)' }}>Өгөгдөл алга</div>
              ) : (
                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120 }}>
                  {monthKeys.map((k, i) => (
                    <div key={k} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <div style={{ ...fp, fontSize: 4, color: 'var(--purple)' }}>{monthValues[i].toLocaleString()}</div>
                      <div style={{ width: '100%', height: `${Math.max(4, (monthValues[i] / maxVal) * 96)}px`, background: 'var(--purple)', opacity: 0.7 }} />
                      <div style={{ ...fp, fontSize: 4, color: 'var(--dim2)' }}>{k.slice(5)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* By type */}
            <div style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '20px 22px' }}>
              <div style={{ ...fp, fontSize: 7, color: 'var(--cyan)', letterSpacing: 2, marginBottom: 18 }}>ОРЛОГЫН ТӨРӨЛ</div>
              {Object.keys(byType).length === 0 ? (
                <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)' }}>Өгөгдөл алга</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {Object.entries(byType).map(([type, amt]) => (
                    <div key={type}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ ...fp, fontSize: 6, color: 'var(--cyan)' }}>{type}</span>
                        <span style={{ ...fp, fontSize: 6, color: 'var(--yellow)' }}>{amt.toLocaleString()}₮</span>
                      </div>
                      <Bar pct={(amt / totalRevenue) * 100} col='var(--cyan)' />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Usage stats */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '20px 22px' }}>
            <div style={{ ...fp, fontSize: 7, color: 'var(--green)', letterSpacing: 2, marginBottom: 16 }}>ПЛАТФОРМ СТАТИСТИК</div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              {[
                { label: 'Нийт task', value: usage?.totalTasks ?? 0, col: 'var(--green)' },
                { label: 'Нийт submission', value: usage?.totalSubmissions ?? 0, col: 'var(--cyan)' },
                { label: 'Давсан submission', value: usage?.passedCount ?? 0, col: 'var(--green)' },
                { label: 'Дундаж pass rate', value: `${usage?.avgPassRate ?? 0}%`, col: 'var(--yellow)' },
                { label: 'Нийт course', value: dash?.courses ?? 0, col: 'var(--purple)' },
              ].map(s => (
                <div key={s.label} style={{ padding: '12px 16px', background: 'var(--bg)', border: `1px solid ${s.col}22`, minWidth: 140 }}>
                  <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 6 }}>{s.label}</div>
                  <div style={{ ...fp, fontSize: 12, color: s.col }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
