'use client'
import { useEffect, useState, useCallback } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

import { adminFetch } from '@/lib/admin-fetch'

type Contest = {
  id: string; title: string; description: string; status: string
  startDate: string; endDate: string
  entryFree: boolean; entryPro: boolean
  prizeFirst: number; prizeSecond: number; prizeThird: number
  taskCount: number; participantCount: number; prizePool: number
}

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

function Field({ label, value, onChange, placeholder, type = 'text' }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 5 }}>{label}</div>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--red)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
          style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--red)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      )}
    </div>
  )
}

const emptyForm = () => ({
  title: '', description: '',
  startDate: '', endDate: '',
  entryFree: 'true', entryPro: 'true',
  taskCount: '5',
  prizeFirst: '50000', prizeSecond: '30000', prizeThird: '20000',
})

function statusCol(s: string) {
  return s === 'ACTIVE' ? 'var(--green)' : s === 'UPCOMING' ? 'var(--cyan)' : s === 'ENDED' ? 'var(--dim2)' : 'var(--dim2)'
}

export default function AdminContestPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [flash, setFlash]       = useState('')
  const [flashCol, setFlashCol] = useState('var(--cyan)')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyForm())
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await adminFetch(`/api/contest?status=${filter}`)
      const d = await r.json()
      setContests(d.contests ?? [])
    } finally { setLoading(false) }
  }, [filter])

  useEffect(() => { load() }, [load])

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3000)
  }

  const save = async () => {
    if (!form.title || !form.startDate || !form.endDate) {
      notify('Title, startDate, endDate шаардлагатай', 'var(--red)'); return
    }
    setSaving(true)
    try {
      const r = await adminFetch('/api/contest', {method: 'POST', 
        body: JSON.stringify({
          title: form.title, description: form.description,
          startDate: new Date(form.startDate).toISOString(),
          endDate: new Date(form.endDate).toISOString(),
          entryFree: form.entryFree === 'true',
          entryPro: form.entryPro === 'true',
          taskCount: parseInt(form.taskCount) || 5,
          prizeFirst: parseInt(form.prizeFirst) || 0,
          prizeSecond: parseInt(form.prizeSecond) || 0,
          prizeThird: parseInt(form.prizeThird) || 0}),
      })
      if (r.ok) { notify('Contest үүсгэгдлээ', 'var(--green)'); setShowForm(false); setForm(emptyForm()); load() }
      else { const d = await r.json(); notify(d.error ?? 'Алдаа', 'var(--red)') }
    } finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · CONTEST</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
            CONTEST MANAGEMENT <span style={{ fontSize: 8, color: 'var(--red)' }}>◈</span>
          </h1>
          <Btn label='+ ШИНЭ CONTEST' col='var(--red)' onClick={() => { setForm(emptyForm()); setShowForm(true) }} size='md' />
        </div>
      </div>

      <Flash msg={flash} col={flashCol} />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '1px solid var(--dim)' }}>
        {['ALL', 'ACTIVE', 'UPCOMING', 'ENDED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ ...fp, fontSize: 6, padding: '8px 16px', cursor: 'pointer', background: 'transparent', border: 'none', borderBottom: filter === s ? `2px solid ${statusCol(s)}` : '2px solid transparent', color: filter === s ? statusCol(s) : 'var(--dim2)', transition: 'all .15s' }}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', padding: '40px 0' }}>Уншиж байна...</div>
      ) : contests.length === 0 ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', padding: '40px 0' }}>Contest алга</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {contests.map(c => (
            <div key={c.id} style={{ background: 'var(--bg2)', border: `1px solid ${statusCol(c.status)}22`, padding: '18px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ ...fp, fontSize: 9, color: 'var(--text)', marginBottom: 4 }}>{c.title}</div>
                  <div style={{ ...fm, fontSize: 11, color: 'var(--dim2)' }}>{c.description}</div>
                </div>
                <span style={{ ...fp, fontSize: 5, color: statusCol(c.status), border: `1px solid ${statusCol(c.status)}44`, padding: '3px 8px' }}>{c.status}</span>
              </div>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>
                  📅 {new Date(c.startDate).toLocaleDateString('mn-MN')} → {new Date(c.endDate).toLocaleDateString('mn-MN')}
                </div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--cyan)' }}>👥 {c.participantCount} оролцогч</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--yellow)' }}>🏆 {c.prizePool?.toLocaleString() ?? 0}₮ нийт шагнал</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--green)' }}>🥇 {c.prizeFirst?.toLocaleString()}₮</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>🥈 {c.prizeSecond?.toLocaleString()}₮</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>🥉 {c.prizeThird?.toLocaleString()}₮</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--red)', padding: '28px 32px', width: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ ...fp, fontSize: 8, color: 'var(--red)', letterSpacing: 2, marginBottom: 20 }}>ШИНЭ CONTEST</div>
            <Field label='НЭРШИЛ' value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder='Contest нэр' />
            <Field label='ТАЙЛБАР' value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} type='textarea' />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Field label='ЭХЛЭХ ОГНОО' value={form.startDate} onChange={v => setForm(f => ({ ...f, startDate: v }))} type='datetime-local' /></div>
              <div style={{ flex: 1 }}><Field label='ДУУСАХ ОГНОО' value={form.endDate} onChange={v => setForm(f => ({ ...f, endDate: v }))} type='datetime-local' /></div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Field label='1-Р ШАГНАЛ (₮)' value={form.prizeFirst} onChange={v => setForm(f => ({ ...f, prizeFirst: v }))} type='number' /></div>
              <div style={{ flex: 1 }}><Field label='2-Р ШАГНАЛ (₮)' value={form.prizeSecond} onChange={v => setForm(f => ({ ...f, prizeSecond: v }))} type='number' /></div>
              <div style={{ flex: 1 }}><Field label='3-Р ШАГНАЛ (₮)' value={form.prizeThird} onChange={v => setForm(f => ({ ...f, prizeThird: v }))} type='number' /></div>
            </div>
            <Field label='TASK ТОО' value={form.taskCount} onChange={v => setForm(f => ({ ...f, taskCount: v }))} type='number' />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Btn label={saving ? 'ҮҮСГЭЖ...' : 'ҮҮСГЭХ'} col='var(--red)' onClick={save} disabled={saving} size='md' />
              <Btn label='БОЛИХ' col='var(--dim2)' onClick={() => setShowForm(false)} size='md' />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
