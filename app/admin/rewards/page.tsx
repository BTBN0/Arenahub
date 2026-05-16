'use client'
import { useEffect, useState } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

import { adminFetch } from '@/lib/admin-fetch'

type Reward = { id: string; title: string; description: string; icon: string; type: string; value: number; createdAt: string }

const REWARD_TYPES = ['xp', 'badge', 'token', 'discount', 'other']

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

function Field({ label, value, onChange, placeholder, type = 'text', options }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; options?: string[] }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 5 }}>{label}</div>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none' }}>
          {(options ?? []).map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
          style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--yellow)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      )}
    </div>
  )
}

const emptyForm = () => ({ title: '', description: '', icon: '🎁', type: 'xp', value: '100' })

function typeCol(t: string) {
  return t === 'xp' ? 'var(--yellow)' : t === 'token' ? 'var(--cyan)' : t === 'badge' ? 'var(--purple)' : t === 'discount' ? 'var(--green)' : 'var(--dim2)'
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [flash, setFlash]     = useState('')
  const [flashCol, setFlashCol] = useState('var(--cyan)')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(emptyForm())
  const [saving, setSaving]     = useState(false)
  const [seeding, setSeeding]   = useState(false)

  const load = () => {
    setLoading(true)
    adminFetch('/api/rewards')
      .then(r => r.json())
      .then(d => setRewards(d.rewards ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3000)
  }

  const seed = async () => {
    setSeeding(true)
    try {
      const r = await adminFetch('/api/admin/seed-rewards', {method: 'POST'})
      const d = await r.json()
      if (r.ok) { notify(d.message ?? 'Seed дууслаа', 'var(--green)'); load() }
      else notify(d.error ?? 'Алдаа', 'var(--red)')
    } finally { setSeeding(false) }
  }

  const delReward = async (id: string, title: string) => {
    if (!confirm(`"${title}" устгах уу?`)) return
    // Optimistic remove
    setRewards(prev => prev.filter(r => r.id !== id))
    const r = await adminFetch(`/api/rewards/${id}`, {method: 'DELETE'})
    if (r.ok) notify('Устгагдлаа', 'var(--red)')
    else { notify('Алдаа', 'var(--red)'); load() }
  }

  const save = async () => {
    if (!form.title) { notify('Title шаардлагатай', 'var(--red)'); return }
    setSaving(true)
    try {
      const r = await adminFetch('/api/rewards', {method: 'POST', 
        body: JSON.stringify({ title: form.title, description: form.description, icon: form.icon, type: form.type, value: parseInt(form.value) || 0}),
      })
      if (r.ok) { notify('Reward үүсгэгдлээ', 'var(--green)'); setShowForm(false); setForm(emptyForm()); load() }
      else { const d = await r.json(); notify(d.error ?? 'Алдаа', 'var(--red)') }
    } finally { setSaving(false) }
  }

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · REWARDS</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
            REWARDS <span style={{ fontSize: 8, color: 'var(--yellow)' }}>◇</span>
          </h1>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn label={seeding ? 'SEEDING...' : '⚡ SEED DEFAULTS'} col='var(--cyan)' onClick={seed} disabled={seeding} size='md' />
            <Btn label='+ ШИНЭ REWARD' col='var(--yellow)' onClick={() => { setForm(emptyForm()); setShowForm(true) }} size='md' />
          </div>
        </div>
      </div>

      <Flash msg={flash} col={flashCol} />

      {loading ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', padding: '40px 0' }}>Уншиж байна...</div>
      ) : rewards.length === 0 ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', padding: '40px 0' }}>Reward алга</div>
      ) : (
        <div style={{ border: '1px solid var(--dim)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 2fr 1fr 0.8fr 0.8fr 0.7fr', background: 'var(--bg2)', borderBottom: '1px solid var(--dim)', padding: '8px 14px', gap: 8 }}>
            {['', 'НЭРШИЛ', 'ТАЙЛБАР', 'TYPE', 'VALUE', 'ОГНОО', 'ҮЙЛДЭЛ'].map(h => (
              <span key={h} style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2 }}>{h}</span>
            ))}
          </div>
          {rewards.map(r => (
            <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '0.5fr 2fr 2fr 1fr 0.8fr 0.8fr 0.7fr', padding: '10px 14px', gap: 8, borderBottom: '1px solid var(--dim)', alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>{r.icon}</span>
              <span style={{ ...fp, fontSize: 7, color: 'var(--text)' }}>{r.title}</span>
              <span style={{ ...fm, fontSize: 11, color: 'var(--dim2)' }}>{r.description}</span>
              <span style={{ ...fp, fontSize: 5, color: typeCol(r.type), border: `1px solid ${typeCol(r.type)}44`, padding: '2px 7px', width: 'fit-content' }}>{r.type.toUpperCase()}</span>
              <span style={{ ...fp, fontSize: 7, color: 'var(--yellow)' }}>{r.value}</span>
              <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>{new Date(r.createdAt).toLocaleDateString('mn-MN')}</span>
              <Btn label='DEL' col='var(--red)' onClick={() => delReward(r.id, r.title)} />
            </div>
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--yellow)', padding: '28px 32px', width: 440 }}>
            <div style={{ ...fp, fontSize: 8, color: 'var(--yellow)', letterSpacing: 2, marginBottom: 20 }}>ШИНЭ REWARD</div>
            <Field label='ICON (EMOJI)' value={form.icon}        onChange={v => setForm(f => ({ ...f, icon: v }))}        placeholder='🎁' />
            <Field label='НЭРШИЛ'      value={form.title}       onChange={v => setForm(f => ({ ...f, title: v }))}       placeholder='Reward нэр' />
            <Field label='ТАЙЛБАР'     value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
            <Field label='TYPE'        value={form.type}        onChange={v => setForm(f => ({ ...f, type: v }))}        type='select' options={REWARD_TYPES} />
            <Field label='VALUE'       value={form.value}       onChange={v => setForm(f => ({ ...f, value: v }))}       type='number' placeholder='100' />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Btn label={saving ? 'ХАДГАЛЖ...' : 'ҮҮСГЭХ'} col='var(--yellow)' onClick={save} disabled={saving} size='md' />
              <Btn label='БОЛИХ' col='var(--dim2)' onClick={() => setShowForm(false)} size='md' />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
