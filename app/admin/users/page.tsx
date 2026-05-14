'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` })

type User = {
  id: string; username: string; email: string; role: string
  xp: number; level: number; coins: number; createdAt: string
  _count: { enrollments: number; taskSubmissions: number }
}

function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return <div style={{ padding: '9px 14px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 12 }}>{msg}</div>
}

function Btn({ label, col = 'var(--cyan)', onClick, size = 'sm', disabled = false }:
  { label: string; col?: string; onClick?: () => void; size?: 'sm' | 'md'; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...fp, fontSize: 5, letterSpacing: 1, padding: size === 'sm' ? '4px 8px' : '8px 18px', cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent', color: disabled ? 'var(--dim)' : col, border: `1px solid ${disabled ? 'var(--dim)' : col + '55'}`, transition: 'all .15s', opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap' }}
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
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
        style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
        onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
        onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const col = role === 'ADMIN' ? 'var(--cyan)' : role === 'INSTRUCTOR' ? 'var(--purple)' : 'var(--dim2)'
  return <span style={{ ...fp, fontSize: 5, color: col, border: `1px solid ${col}44`, padding: '2px 6px' }}>{role}</span>
}

type AdjustType = 'xp' | 'coins' | 'tokens'

export default function AdminUsersPage() {
  const { user: me } = useAuth()
  const myId    = (me as { id?: string }    | null)?.id    ?? ''
  const myEmail = (me as { email?: string } | null)?.email ?? ''

  const [users, setUsers]         = useState<User[]>([])
  const [total, setTotal]         = useState(0)
  const [page, setPage]           = useState(1)
  const [search, setSearch]       = useState('')
  const [loading, setLoading]     = useState(true)
  const [flash, setFlash]         = useState('')
  const [flashCol, setFlashCol]   = useState('var(--cyan)')

  // Edit modal
  const [editUser, setEditUser]   = useState<User | null>(null)
  const [editName, setEditName]   = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [saving, setSaving]       = useState(false)

  // Adjust modal
  const [adjustUser, setAdjustUser] = useState<User | null>(null)
  const [adjType, setAdjType]       = useState<AdjustType>('xp')
  const [adjDelta, setAdjDelta]     = useState('')
  const [adjNote, setAdjNote]       = useState('')
  const [adjusting, setAdjusting]   = useState(false)

  const limit = 20

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const q = new URLSearchParams({ page: String(page), limit: String(limit), ...(search ? { search } : {}) })
      const r = await fetch(`/api/users?${q}`, { headers: authH() })
      const d = await r.json()
      setUsers(d.users ?? [])
      setTotal(d.total ?? 0)
    } finally { setLoading(false) }
  }, [page, search])

  useEffect(() => { load() }, [load])

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3500)
  }

  const isProtected = (u: User) =>
    u.username.toLowerCase() === 'admin' ||
    u.id === myId ||
    (!!myEmail && u.email === myEmail)

  const changeRole = async (u: User, role: string) => {
    if (isProtected(u)) return
    const r = await fetch(`/api/users/${u.id}?action=role`, { method: 'PATCH', headers: authH(), body: JSON.stringify({ role }) })
    if (r.ok) { notify(`${u.username} → ${role}`); load() } else notify('Алдаа гарлаа', 'var(--red)')
  }

  const banUser = async (u: User) => {
    if (isProtected(u)) return
    if (!confirm(`${u.username}-г ban хийх үү?`)) return
    const r = await fetch(`/api/users/${u.id}?action=ban`, { method: 'PATCH', headers: authH(), body: '{}' })
    if (r.ok) { notify(`${u.username} ban хийгдлээ`, 'var(--yellow)'); load() } else notify('Алдаа гарлаа', 'var(--red)')
  }

  const unbanUser = async (u: User) => {
    if (isProtected(u)) return
    const r = await fetch(`/api/users/${u.id}?action=unban`, { method: 'PATCH', headers: authH(), body: '{}' })
    if (r.ok) { notify(`${u.username} unban хийгдлээ`, 'var(--green)'); load() } else notify('Алдаа гарлаа', 'var(--red)')
  }

  const deleteUser = async (u: User) => {
    if (isProtected(u)) return
    if (!confirm(`${u.username}-г БҮРМӨСӨН устгах уу? Энэ үйлдлийг буцааж болохгүй.`)) return
    const r = await fetch(`/api/users/${u.id}`, { method: 'DELETE', headers: authH() })
    if (r.ok) { notify('Устгагдлаа', 'var(--red)'); load() } else notify('Алдаа гарлаа', 'var(--red)')
  }

  const openEdit = (u: User) => {
    setEditUser(u); setEditName(u.username); setEditEmail(u.email)
  }

  const saveEdit = async () => {
    if (!editUser) return
    setSaving(true)
    const r = await fetch(`/api/users/${editUser.id}?action=profile`, { method: 'PATCH', headers: authH(), body: JSON.stringify({ username: editName, email: editEmail }) })
    setSaving(false)
    if (r.ok) { notify('Хадгалагдлаа'); setEditUser(null); load() } else notify('Алдаа гарлаа', 'var(--red)')
  }

  const openAdjust = (u: User, type: AdjustType) => {
    setAdjustUser(u); setAdjType(type); setAdjDelta(''); setAdjNote('')
  }

  const saveAdjust = async () => {
    if (!adjustUser || !adjDelta) return
    setAdjusting(true)
    const r = await fetch('/api/admin/adjust', {
      method: 'POST', headers: authH(),
      body: JSON.stringify({ userId: adjustUser.id, type: adjType, delta: parseInt(adjDelta), note: adjNote }),
    })
    setAdjusting(false)
    const d = await r.json()
    if (r.ok) { notify(d.message, 'var(--green)'); setAdjustUser(null); load() }
    else notify(d.error ?? 'Алдаа', 'var(--red)')
  }

  const adjCol: Record<AdjustType, string> = { xp: 'var(--yellow)', coins: 'var(--cyan)', tokens: 'var(--purple)' }
  const pages = Math.ceil(total / limit)

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · USERS</div>
        <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
          USER MANAGEMENT <span style={{ fontSize: 8, color: 'var(--cyan)' }}>◉</span>
        </h1>
      </div>

      <Flash msg={flash} col={flashCol} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <input
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder='Хэрэглэгч хайх...'
          style={{ flex: 1, maxWidth: 320, padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
        />
        <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>НИЙТ: {total}</span>
      </div>

      <div style={{ border: '1px solid var(--dim)', overflowX: 'auto' }}>
        {/* Head */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.8fr 0.9fr 1fr 2.8fr', background: 'var(--bg2)', borderBottom: '1px solid var(--dim)', padding: '8px 14px', gap: 8 }}>
          {['USERNAME / EMAIL', 'ROLE', 'LV · XP · 🪙', 'ENROLLS', 'ҮЙЛДЭЛ'].map(h => (
            <span key={h} style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2 }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '32px', ...fm, fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Уншиж байна...</div>
        ) : users.length === 0 ? (
          <div style={{ padding: '32px', ...fm, fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Хэрэглэгч олдсонгүй</div>
        ) : users.map(u => {
          const prot = isProtected(u)
          return (
            <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.8fr 0.9fr 1fr 2.8fr', padding: '9px 14px', gap: 8, borderBottom: '1px solid var(--dim)', alignItems: 'center', background: prot ? 'var(--yellow)06' : 'transparent' }}>
              <div>
                <div style={{ ...fp, fontSize: 7, color: prot ? 'var(--yellow)' : 'var(--text)' }}>
                  {u.username}{prot && ' 🔒'}
                </div>
                <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)' }}>{u.email}</div>
              </div>
              <RoleBadge role={u.role} />
              <div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--cyan)' }}>LV{u.level}</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--yellow)' }}>{u.xp.toLocaleString()} XP</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--green)' }}>{(u.coins ?? 0)} 🪙</div>
              </div>
              <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>{u._count.enrollments}</span>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Btn label='ЗАСАХ'    col='var(--cyan)'   onClick={() => openEdit(u)} disabled={prot} />
                <Btn label={u.role === 'ADMIN' ? '↓STUDENT' : '↑ADMIN'} col='var(--purple)' onClick={() => changeRole(u, u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN')} disabled={prot} />
                <Btn label='+XP'      col='var(--yellow)' onClick={() => openAdjust(u, 'xp')} />
                <Btn label='+🪙'      col='var(--green)'  onClick={() => openAdjust(u, 'coins')} />
                <Btn label='+TOKEN'   col='var(--purple)' onClick={() => openAdjust(u, 'tokens')} />
                <Btn label='BAN'      col='var(--orange, #ff9800)' onClick={() => banUser(u)} disabled={prot} />
                <Btn label='UNBAN'    col='var(--green)'  onClick={() => unbanUser(u)} disabled={prot} />
                <Btn label='DELETE'   col='var(--red)'    onClick={() => deleteUser(u)} disabled={prot} />
              </div>
            </div>
          )
        })}
      </div>

      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, marginTop: 14, alignItems: 'center' }}>
          <Btn label='← ӨМНӨХ' disabled={page <= 1}    onClick={() => setPage(p => p - 1)} size='md' />
          <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)', padding: '0 10px' }}>{page} / {pages}</span>
          <Btn label='ДАРААХ →' disabled={page >= pages} onClick={() => setPage(p => p + 1)} size='md' />
        </div>
      )}

      {/* Edit modal */}
      {editUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setEditUser(null) }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--cyan)', padding: '28px 32px', width: 400 }}>
            <div style={{ ...fp, fontSize: 8, color: 'var(--cyan)', letterSpacing: 2, marginBottom: 20 }}>ХЭРЭГЛЭГЧ ЗАСАХ</div>
            <Field label='USERNAME' value={editName}  onChange={setEditName}  placeholder='Username' />
            <Field label='EMAIL'    value={editEmail} onChange={setEditEmail} placeholder='Email' />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Btn label={saving ? 'ХАДГАЛЖ...' : 'ХАДГАЛАХ'} col='var(--cyan)'  onClick={saveEdit} disabled={saving} size='md' />
              <Btn label='БОЛИХ' col='var(--dim2)' onClick={() => setEditUser(null)} size='md' />
            </div>
          </div>
        </div>
      )}

      {/* Adjust modal */}
      {adjustUser && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setAdjustUser(null) }}>
          <div style={{ background: 'var(--bg)', border: `1px solid ${adjCol[adjType]}`, padding: '28px 32px', width: 400 }}>
            <div style={{ ...fp, fontSize: 8, color: adjCol[adjType], letterSpacing: 2, marginBottom: 6 }}>
              {adjType.toUpperCase()} ӨӨРЧЛӨХ
            </div>
            <div style={{ ...fp, fontSize: 6, color: 'var(--dim2)', marginBottom: 20 }}>
              {adjustUser.username} · одоогийн {adjType === 'xp' ? `${adjustUser.xp} XP` : adjType === 'coins' ? `${adjustUser.coins} 🪙` : 'tokens'}
            </div>

            {/* Type selector */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {(['xp', 'coins', 'tokens'] as AdjustType[]).map(t => (
                <button key={t} onClick={() => setAdjType(t)}
                  style={{ ...fp, fontSize: 6, padding: '5px 12px', cursor: 'pointer', background: adjType === t ? `${adjCol[t]}18` : 'transparent', color: adjType === t ? adjCol[t] : 'var(--dim2)', border: `1px solid ${adjType === t ? adjCol[t] : 'var(--dim)'}` }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 5 }}>ХЭМЖЭЭ (сөрөг тоо хасна)</div>
              <input type='number' value={adjDelta} onChange={e => setAdjDelta(e.target.value)} placeholder='+100 эсвэл -50'
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: `1px solid ${adjCol[adjType]}`, color: 'var(--text)', ...fm, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 5 }}>ТАЙЛБАР (заавал биш)</div>
              <input value={adjNote} onChange={e => setAdjNote(e.target.value)} placeholder='Шалтгаан...'
                style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn label={adjusting ? 'ХИЙЖ БАЙНА...' : 'ХЭРЭГЖҮҮЛЭХ'} col={adjCol[adjType]} onClick={saveAdjust} disabled={adjusting || !adjDelta} size='md' />
              <Btn label='БОЛИХ' col='var(--dim2)' onClick={() => setAdjustUser(null)} size='md' />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
