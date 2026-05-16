'use client'
import { useEffect, useState } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

import { adminFetch } from '@/lib/admin-fetch'


function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return <div style={{ padding: '9px 14px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 14 }}>{msg}</div>
}

function Btn({ label, col = 'var(--cyan)', onClick, size = 'sm', disabled = false }:
  { label: string; col?: string; onClick?: () => void; size?: 'sm' | 'md'; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...fp, fontSize: 6, letterSpacing: 1, padding: size === 'sm' ? '5px 10px' : '9px 22px', cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent', color: disabled ? 'var(--dim)' : col, border: `1px solid ${disabled ? 'var(--dim)' : col + '55'}`, transition: 'all .15s', opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = `${col}18`; (e.currentTarget as HTMLButtonElement).style.borderColor = col } }}
      onMouseLeave={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = `${col}55` } }}>
      {label}
    </button>
  )
}

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [flash, setFlash]     = useState('')
  const [flashCol, setFlashCol] = useState('var(--cyan)')

  const [maintenance, setMaintenance] = useState(false)
  const [aiPrompt, setAiPrompt]       = useState('')
  const [tokenXp, setTokenXp]         = useState('10')
  const [tokenCoin, setTokenCoin]     = useState('5')

  useEffect(() => {
    adminFetch('/api/admin/config')
      .then(r => r.json())
      .then(d => {
        setMaintenance(d.maintenanceMode ?? false)
        setAiPrompt(d.aiPrompt ?? '')
        setTokenXp(d.tokenXpRate ?? '10')
        setTokenCoin(d.tokenCoinRate ?? '5')
      })
      .finally(() => setLoading(false))
  }, [])

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3500)
  }

  const save = async (key: string, value: unknown) => {
    setSaving(true)
    const r = await adminFetch('/api/admin/config', {method: 'PUT', 
      body: JSON.stringify({ [key]: value}),
    })
    setSaving(false)
    const d = await r.json()
    if (r.ok) notify(d.message ?? 'Хадгалагдлаа', 'var(--green)')
    else notify(d.error ?? 'Алдаа гарлаа', 'var(--red)')
  }

  const STATIC = [
    { group: 'AUTHENTICATION', col: 'var(--green)', items: [
      { label: 'JWT expires',    value: '15 минут',              note: 'JWT_EXPIRES_IN env' },
      { label: 'Refresh token',  value: '7 хоног',               note: 'auth.ts' },
      { label: 'Password hash',  value: 'bcrypt rounds: 12',     note: 'auth.ts' },
    ]},
    { group: 'XP & LEVEL',      col: 'var(--yellow)', items: [
      { label: 'XP per level',   value: '200 XP',                note: 'game.service.ts' },
      { label: 'Task XP',        value: '20 XP',                 note: 'default' },
      { label: 'Lesson XP',      value: '50 XP',                 note: 'default' },
    ]},
    { group: 'DATABASE',         col: 'var(--dim2)', items: [
      { label: 'ORM',            value: 'Prisma',                note: 'prisma/schema.prisma' },
      { label: 'DB',             value: 'PostgreSQL',            note: 'DATABASE_URL env' },
    ]},
  ]

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · SETTINGS</div>
        <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
          СИСТЕМИЙН ТОХИРГОО <span style={{ fontSize: 8, color: 'var(--dim2)' }}>◉</span>
        </h1>
      </div>

      <Flash msg={flash} col={flashCol} />

      {loading ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)' }}>Уншиж байна...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Maintenance Mode */}
          <div style={{ background: 'var(--bg2)', border: `1px solid ${maintenance ? 'var(--red)' : 'var(--dim)'}`, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ ...fp, fontSize: 8, color: maintenance ? 'var(--red)' : 'var(--dim2)', letterSpacing: 2, marginBottom: 6 }}>
                  {maintenance ? '⚠ MAINTENANCE MODE — ИДЭВХТЭЙ' : 'MAINTENANCE MODE'}
                </div>
                <div style={{ ...fm, fontSize: 11, color: 'var(--dim2)' }}>
                  Асаасан үед зөвхөн admin нэвтрэх боломжтой. Хэрэглэгчид хандалт хаагдана.
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div
                  onClick={() => { const v = !maintenance; setMaintenance(v); save('maintenance_mode', String(v)) }}
                  style={{ width: 48, height: 26, background: maintenance ? 'var(--red)' : 'var(--dim)', borderRadius: 13, cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: maintenance ? 25 : 3, width: 20, height: 20, background: 'white', borderRadius: '50%', transition: 'left .2s' }} />
                </div>
                <span style={{ ...fp, fontSize: 6, color: maintenance ? 'var(--red)' : 'var(--dim2)' }}>
                  {maintenance ? 'ON' : 'OFF'}
                </span>
              </div>
            </div>
          </div>

          {/* AI System Prompt */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--cyan)22', padding: '20px 22px' }}>
            <div style={{ ...fp, fontSize: 7, color: 'var(--cyan)', letterSpacing: 2, marginBottom: 12 }}>AI SYSTEM PROMPT</div>
            <div style={{ ...fm, fontSize: 11, color: 'var(--dim2)', marginBottom: 10 }}>
              AI-д өгөх системийн заавар. Хэрэглэгчийн асуултад хэрхэн хариулахыг тодорхойлно.
            </div>
            <textarea
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              rows={6}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 11, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              placeholder="You are a helpful assistant for ArenaCodes learning platform..."
            />
            <div style={{ marginTop: 10 }}>
              <Btn label={saving ? 'ХАДГАЛЖ...' : 'ХАДГАЛАХ'} col='var(--cyan)'
                onClick={() => save('ai_prompt', aiPrompt)}
                disabled={saving} size='md' />
            </div>
          </div>

          {/* Token Economy */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--purple)22', padding: '20px 22px' }}>
            <div style={{ ...fp, fontSize: 7, color: 'var(--purple)', letterSpacing: 2, marginBottom: 16 }}>TOKEN ECONOMY</div>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
              <div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 5 }}>XP RATE (1 token = N xp)</div>
                <input type='number' value={tokenXp} onChange={e => setTokenXp(e.target.value)}
                  style={{ width: 100, padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 13, outline: 'none' }} />
              </div>
              <div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 5 }}>COIN RATE (1 token = N coins)</div>
                <input type='number' value={tokenCoin} onChange={e => setTokenCoin(e.target.value)}
                  style={{ width: 100, padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 13, outline: 'none' }} />
              </div>
              <Btn label={saving ? 'ХАДГАЛЖ...' : 'ХАДГАЛАХ'} col='var(--purple)'
                onClick={() => save('token_xp_rate', tokenXp).then(() => save('token_coin_rate', tokenCoin))}
                disabled={saving} size='md' />
            </div>
          </div>

          {/* Static config reference */}
          {STATIC.map(s => (
            <div key={s.group} style={{ background: 'var(--bg2)', border: `1px solid ${s.col}22`, padding: '18px 22px' }}>
              <div style={{ ...fp, fontSize: 7, color: s.col, letterSpacing: 2, marginBottom: 12 }}>{s.group}</div>
              <div style={{ border: '1px solid var(--dim)' }}>
                {s.items.map((item, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 2fr', padding: '9px 14px', borderBottom: i < s.items.length - 1 ? '1px solid var(--dim)' : 'none' }}>
                    <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>{item.label}</span>
                    <span style={{ ...fp, fontSize: 7, color: s.col }}>{item.value}</span>
                    <span style={{ ...fm, fontSize: 10, color: 'var(--dim2)', fontStyle: 'italic' }}>{item.note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}