'use client'
import { useEffect, useState, useCallback } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

import { adminFetch } from '@/lib/admin-fetch'

type Payment = {
  id: string; amount: number; type: string; status: string; adminNote?: string
  createdAt: string; approvedAt?: string
  user: { id: string; username: string; email: string }
  metadata?: Record<string, unknown>
}

const STATUS_TABS = ['PENDING', 'PAID', 'REJECTED', 'ALL']

function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return <div style={{ padding: '9px 14px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 12 }}>{msg}</div>
}

function Btn({ label, col = 'var(--cyan)', onClick, size = 'sm', disabled = false }:
  { label: string; col?: string; onClick?: () => void; size?: 'sm' | 'md'; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...fp, fontSize: 6, letterSpacing: 1, padding: size === 'sm' ? '5px 10px' : '8px 18px', cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent', color: disabled ? 'var(--dim)' : col, border: `1px solid ${disabled ? 'var(--dim)' : col + '55'}`, transition: 'all .15s', opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = `${col}18`; (e.currentTarget as HTMLButtonElement).style.borderColor = col } }}
      onMouseLeave={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = `${col}55` } }}>
      {label}
    </button>
  )
}

function statusCol(s: string) {
  return s === 'PAID' ? 'var(--green)' : s === 'REJECTED' ? 'var(--red)' : s === 'PENDING' ? 'var(--yellow)' : 'var(--dim2)'
}

export default function AdminPaymentsPage() {
  const [payments, setPayments]   = useState<Payment[]>([])
  const [status, setStatus]       = useState('PENDING')
  const [loading, setLoading]     = useState(true)
  const [flash, setFlash]         = useState('')
  const [flashCol, setFlashCol]   = useState('var(--cyan)')
  const [actionNote, setActionNote] = useState('')
  const [actingId, setActingId]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await adminFetch(`/api/admin/payment?status=${status}`)
      const d = await r.json()
      setPayments(d.payments ?? [])
    } finally { setLoading(false) }
  }, [status])

  useEffect(() => { load() }, [load])

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 4000)
  }

  const act = async (paymentId: string, action: 'approve' | 'reject') => {
    setActingId(paymentId)
    const r = await adminFetch('/api/admin/payment', {method: 'POST', 
      body: JSON.stringify({ paymentId, action, adminNote: actionNote}),
    })
    setActingId('')
    if (r.ok) {
      const d = await r.json()
      notify(d.message ?? (action === 'approve' ? 'Батлагдлаа' : 'Цуцлагдлаа'), action === 'approve' ? 'var(--green)' : 'var(--red)')
      setActionNote('')
      load()
    } else {
      const d = await r.json()
      notify(d.error ?? 'Алдаа гарлаа', 'var(--red)')
    }
  }

  const total = payments.reduce((s, p) => s + (p.status === 'PAID' ? p.amount : 0), 0)
  const pending = payments.filter(p => p.status === 'PENDING')

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · PAYMENTS</div>
        <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
          PAYMENT MANAGEMENT <span style={{ fontSize: 8, color: 'var(--purple)' }}>◐</span>
        </h1>
      </div>

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, border: '1px solid var(--dim)' }}>
        {[
          { label: 'PENDING', value: payments.filter(p => p.status === 'PENDING').length, col: 'var(--yellow)' },
          { label: 'PAID', value: payments.filter(p => p.status === 'PAID').length, col: 'var(--green)' },
          { label: 'REJECTED', value: payments.filter(p => p.status === 'REJECTED').length, col: 'var(--red)' },
          { label: 'НИЙТ ОРЛОГО', value: `${total.toLocaleString()}₮`, col: 'var(--purple)' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, padding: '16px 20px', background: 'var(--bg2)', borderRight: '1px solid var(--dim)' }}>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2, marginBottom: 6 }}>{s.label}</div>
            <div style={{ ...fp, fontSize: 13, color: s.col }}>{s.value}</div>
          </div>
        ))}
      </div>

      <Flash msg={flash} col={flashCol} />

      {/* Admin note for actions */}
      {status === 'PENDING' && pending.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
          <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)', minWidth: 80 }}>ADMIN NOTE:</span>
          <input value={actionNote} onChange={e => setActionNote(e.target.value)} placeholder='(заавал биш)'
            style={{ flex: 1, maxWidth: 360, padding: '7px 10px', background: 'var(--bg2)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none' }} />
        </div>
      )}

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--dim)' }}>
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setStatus(s)}
            style={{ ...fp, fontSize: 6, padding: '8px 16px', cursor: 'pointer', background: status === s ? 'var(--bg2)' : 'transparent', border: 'none', borderBottom: status === s ? `2px solid ${statusCol(s)}` : '2px solid transparent', color: status === s ? statusCol(s) : 'var(--dim2)', transition: 'all .15s' }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid var(--dim)', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.5fr', background: 'var(--bg2)', borderBottom: '1px solid var(--dim)', padding: '8px 14px', gap: 8 }}>
          {['ХЭРЭГЛЭГЧ', 'ТӨС', 'TYPE', 'ДҮНГИЙН ХЭМЖЭЭ', 'STATUS', 'ҮЙЛДЭЛ'].map(h => (
            <span key={h} style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2 }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '32px', ...fm, fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Уншиж байна...</div>
        ) : payments.length === 0 ? (
          <div style={{ padding: '32px', ...fm, fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Төлбөр алга</div>
        ) : payments.map(p => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr 1.5fr', padding: '11px 14px', gap: 8, borderBottom: '1px solid var(--dim)', alignItems: 'center' }}>
            <div>
              <div style={{ ...fp, fontSize: 7, color: 'var(--text)' }}>{p.user.username}</div>
              <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)' }}>{p.user.email}</div>
            </div>
            <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)' }}>{new Date(p.createdAt).toLocaleDateString('mn-MN')}</div>
            <span style={{ ...fp, fontSize: 5, color: 'var(--cyan)', border: '1px solid var(--cyan)44', padding: '2px 6px', width: 'fit-content' }}>{p.type}</span>
            <span style={{ ...fp, fontSize: 8, color: 'var(--yellow)' }}>{p.amount.toLocaleString()}₮</span>
            <span style={{ ...fp, fontSize: 5, color: statusCol(p.status), border: `1px solid ${statusCol(p.status)}44`, padding: '2px 6px', width: 'fit-content' }}>{p.status}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {p.status === 'PENDING' && <>
                <Btn label='БАТЛАХ' col='var(--green)' onClick={() => act(p.id, 'approve')} disabled={actingId === p.id} />
                <Btn label='ЦУЦЛАХ' col='var(--red)'   onClick={() => act(p.id, 'reject')}  disabled={actingId === p.id} />
              </>}
              {p.status !== 'PENDING' && (
                <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>{p.adminNote ?? '—'}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
