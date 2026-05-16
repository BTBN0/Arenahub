'use client'
import { useEffect, useState, useCallback } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` })

type Course = {
  id: string; title: string; description: string; category: string
  difficulty: string; isActive: boolean; xpReward: number; orderIndex: number
  _count: { lessons: number; enrollments: number }
}

const DIFFICULTIES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

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
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
          style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      )}
    </div>
  )
}

const empty = () => ({ title: '', description: '', category: '', difficulty: 'BEGINNER', xpReward: '100' })

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [flash, setFlash]     = useState('')
  const [flashCol, setFlashCol] = useState('var(--cyan)')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing]   = useState<Course | null>(null)
  const [form, setForm]         = useState(empty())
  const [saving, setSaving]     = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const r = await fetch('/api/courses?admin=true&limit=100', { headers: authH() })
      const d = await r.json()
      setCourses(d.courses ?? [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3000)
  }

  const openCreate = () => { setEditing(null); setForm(empty()); setShowForm(true) }

  const openEdit = (c: Course) => {
    setEditing(c)
    setForm({ title: c.title, description: c.description ?? '', category: c.category, difficulty: c.difficulty, xpReward: String(c.xpReward) })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title || !form.category) { notify('Title, category шаардлагатай', 'var(--red)'); return }
    setSaving(true)
    const body = { ...form, xpReward: parseInt(form.xpReward) || 100 }
    try {
      let r: Response
      if (editing) {
        r = await fetch(`/api/courses/${editing.id}`, { method: 'PUT', headers: authH(), body: JSON.stringify(body) })
      } else {
        r = await fetch('/api/courses', { method: 'POST', headers: authH(), body: JSON.stringify(body) })
      }
      if (r.ok) { notify(editing ? 'Шинэчлэгдлээ' : 'Үүсгэгдлээ'); setShowForm(false); load() }
      else { const d = await r.json(); notify(d.error ?? 'Алдаа гарлаа', 'var(--red)') }
    } finally { setSaving(false) }
  }

  const togglePublish = async (c: Course) => {
    const r = await fetch(`/api/courses/${c.id}`, { method: 'PUT', headers: authH(), body: JSON.stringify({ isActive: !c.isActive }) })
    if (r.ok) { notify(c.isActive ? 'Draft болгосон' : 'Нийтлэгдлээ'); load() } else notify('Алдаа', 'var(--red)')
  }

  const deleteCourse = async (c: Course) => {
    if (!confirm(`"${c.title}" устгах уу?`)) return
    const r = await fetch(`/api/courses/${c.id}`, { method: 'DELETE', headers: authH() })
    if (r.ok) { notify('Устгагдлаа', 'var(--red)'); load() }
    else {
      const d = await r.json().catch(() => ({}))
      notify(d.error || `Алдаа (${r.status})`, 'var(--red)')
    }
  }

  const diffCol = (d: string) => d === 'BEGINNER' ? 'var(--green)' : d === 'INTERMEDIATE' ? 'var(--yellow)' : 'var(--red)'

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · COURSES</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
            COURSE MANAGEMENT <span style={{ fontSize: 8, color: 'var(--green)' }}>◫</span>
          </h1>
          <Btn label='+ ШИНЭ COURSE' col='var(--green)' onClick={openCreate} size='md' />
        </div>
      </div>

      <Flash msg={flash} col={flashCol} />

      <div style={{ border: '1px solid var(--dim)', overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.2fr 0.8fr 0.8fr 0.8fr 1.6fr', background: 'var(--bg2)', borderBottom: '1px solid var(--dim)', padding: '8px 14px', gap: 8 }}>
          {['TITLE', 'CATEGORY', 'DIFFICULTY', 'LESSONS', 'ENROLLS', 'STATUS', 'ҮЙЛДЭЛ'].map(h => (
            <span key={h} style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2 }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '32px', ...fm, fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Уншиж байна...</div>
        ) : courses.length === 0 ? (
          <div style={{ padding: '32px', ...fm, fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Course алга</div>
        ) : courses.map(c => (
          <div key={c.id} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1.2fr 1.2fr 0.8fr 0.8fr 0.8fr 1.6fr', padding: '10px 14px', gap: 8, borderBottom: '1px solid var(--dim)', alignItems: 'center' }}>
            <span style={{ ...fp, fontSize: 7, color: 'var(--text)' }}>{c.title}</span>
            <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>{c.category}</span>
            <span style={{ ...fp, fontSize: 5, color: diffCol(c.difficulty) }}>{c.difficulty}</span>
            <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>{c._count.lessons}</span>
            <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>{c._count.enrollments}</span>
            <span style={{ ...fp, fontSize: 5, color: c.isActive ? 'var(--green)' : 'var(--dim2)' }}>
              {c.isActive ? 'LIVE' : 'DRAFT'}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <Btn label='ЗАСАХ'   col='var(--cyan)'                             onClick={() => openEdit(c)} />
              <Btn label={c.isActive ? 'DRAFT' : 'PUBLISH'} col={c.isActive ? 'var(--dim2)' : 'var(--green)'} onClick={() => togglePublish(c)} />
              <Btn label='DELETE'  col='var(--red)'                              onClick={() => deleteCourse(c)} />
            </div>
          </div>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--green)', padding: '28px 32px', width: 480, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ ...fp, fontSize: 8, color: 'var(--green)', letterSpacing: 2, marginBottom: 20 }}>
              {editing ? 'COURSE ЗАСАХ' : 'ШИНЭ COURSE'}
            </div>
            <Field label='TITLE'       value={form.title}       onChange={v => setForm(f => ({ ...f, title: v }))}       placeholder='Course нэр' />
            <Field label='CATEGORY'    value={form.category}    onChange={v => setForm(f => ({ ...f, category: v }))}    placeholder='JavaScript, Python...' />
            <Field label='DIFFICULTY'  value={form.difficulty}  onChange={v => setForm(f => ({ ...f, difficulty: v }))}  type='select' options={DIFFICULTIES} />
            <Field label='DESCRIPTION' value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} type='textarea' placeholder='Тайлбар...' />
            <Field label='XP REWARD'   value={form.xpReward}    onChange={v => setForm(f => ({ ...f, xpReward: v }))}    type='number' placeholder='100' />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Btn label={saving ? 'ХАДГАЛЖ...' : 'ХАДГАЛАХ'} col='var(--green)'  onClick={save} disabled={saving} size='md' />
              <Btn label='БОЛИХ'                                 col='var(--dim2)'  onClick={() => setShowForm(false)} size='md' />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
