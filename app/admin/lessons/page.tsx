'use client'
import { useEffect, useState, useCallback } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` })

type Course  = { id: string; title: string }
type Lesson  = { id: string; title: string; orderIndex: number; xpReward: number; _count: { tasks: number }; content?: string; videoUrl?: string }

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
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
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

const emptyLesson = () => ({ title: '', content: '', videoUrl: '', xpReward: '50', orderIndex: '0' })

export default function AdminLessonsPage() {
  const [courses, setCourses]       = useState<Course[]>([])
  const [courseId, setCourseId]     = useState('')
  const [lessons, setLessons]       = useState<Lesson[]>([])
  const [loading, setLoading]       = useState(false)
  const [flash, setFlash]           = useState('')
  const [flashCol, setFlashCol]     = useState('var(--cyan)')
  const [showForm, setShowForm]     = useState(false)
  const [editing, setEditing]       = useState<Lesson | null>(null)
  const [form, setForm]             = useState(emptyLesson())
  const [saving, setSaving]         = useState(false)

  useEffect(() => {
    fetch('/api/courses?admin=true&limit=100', { headers: authH() })
      .then(r => r.json()).then(d => setCourses(d.courses ?? []))
  }, [])

  const loadLessons = useCallback(async () => {
    if (!courseId) { setLessons([]); return }
    setLoading(true)
    try {
      const r = await fetch(`/api/lessons?courseId=${courseId}`, { headers: authH() })
      const d = await r.json()
      setLessons(d.lessons ?? [])
    } finally { setLoading(false) }
  }, [courseId])

  useEffect(() => { loadLessons() }, [loadLessons])

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3000)
  }

  const openCreate = () => { setEditing(null); setForm(emptyLesson()); setShowForm(true) }

  const openEdit = (l: Lesson) => {
    setEditing(l)
    setForm({ title: l.title, content: l.content ?? '', videoUrl: l.videoUrl ?? '', xpReward: String(l.xpReward), orderIndex: String(l.orderIndex) })
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title) { notify('Title шаардлагатай', 'var(--red)'); return }
    setSaving(true)
    const body = { courseId, title: form.title, content: form.content, videoUrl: form.videoUrl, xpReward: parseInt(form.xpReward) || 50, orderIndex: parseInt(form.orderIndex) || 0 }
    try {
      let r: Response
      if (editing) {
        r = await fetch(`/api/lessons/${editing.id}`, { method: 'PATCH', headers: authH(), body: JSON.stringify(body) })
      } else {
        r = await fetch('/api/lessons', { method: 'POST', headers: authH(), body: JSON.stringify(body) })
      }
      if (r.ok) { notify(editing ? 'Шинэчлэгдлээ' : 'Үүсгэгдлээ'); setShowForm(false); loadLessons() }
      else { const d = await r.json(); notify(d.error ?? 'Алдаа', 'var(--red)') }
    } finally { setSaving(false) }
  }

  const deleteLesson = async (l: Lesson) => {
    if (!confirm(`"${l.title}" устгах уу?`)) return
    const r = await fetch(`/api/lessons/${l.id}`, { method: 'DELETE', headers: authH() })
    if (r.ok) { notify('Устгагдлаа', 'var(--red)'); loadLessons() } else notify('Алдаа', 'var(--red)')
  }

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · LESSONS</div>
        <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
          LESSON MANAGEMENT <span style={{ fontSize: 8, color: 'var(--green)' }}>◧</span>
        </h1>
      </div>

      <Flash msg={flash} col={flashCol} />

      {/* Course selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div style={{ ...fp, fontSize: 6, color: 'var(--dim2)', minWidth: 70 }}>COURSE:</div>
        <select value={courseId} onChange={e => setCourseId(e.target.value)}
          style={{ flex: 1, maxWidth: 360, padding: '8px 12px', background: 'var(--bg2)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none' }}>
          <option value=''>— Course сонгох —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        {courseId && <Btn label='+ ШИНЭ LESSON' col='var(--green)' onClick={openCreate} size='md' />}
      </div>

      {/* Lessons list */}
      {!courseId ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', padding: '40px 0' }}>Course сонгоно уу</div>
      ) : loading ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', padding: '40px 0' }}>Уншиж байна...</div>
      ) : (
        <div style={{ border: '1px solid var(--dim)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 3fr 0.8fr 0.8fr 1.5fr', background: 'var(--bg2)', borderBottom: '1px solid var(--dim)', padding: '8px 14px', gap: 8 }}>
            {['#', 'TITLE', 'TASKS', 'XP', 'ҮЙЛДЭЛ'].map(h => (
              <span key={h} style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2 }}>{h}</span>
            ))}
          </div>
          {lessons.length === 0 ? (
            <div style={{ padding: '28px', ...fm, fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Lesson алга</div>
          ) : lessons.map((l, i) => (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '0.5fr 3fr 0.8fr 0.8fr 1.5fr', padding: '10px 14px', gap: 8, borderBottom: '1px solid var(--dim)', alignItems: 'center' }}>
              <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>{i + 1}</span>
              <span style={{ ...fp, fontSize: 7, color: 'var(--text)' }}>{l.title}</span>
              <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>{l._count.tasks}</span>
              <span style={{ ...fp, fontSize: 6, color: 'var(--yellow)' }}>{l.xpReward}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <Btn label='ЗАСАХ'  col='var(--cyan)' onClick={() => openEdit(l)} />
                <Btn label='DELETE' col='var(--red)'  onClick={() => deleteLesson(l)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={{ background: 'var(--bg)', border: '1px solid var(--green)', padding: '28px 32px', width: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ ...fp, fontSize: 8, color: 'var(--green)', letterSpacing: 2, marginBottom: 20 }}>
              {editing ? 'LESSON ЗАСАХ' : 'ШИНЭ LESSON'}
            </div>
            <Field label='TITLE'       value={form.title}      onChange={v => setForm(f => ({ ...f, title: v }))}      placeholder='Lesson нэр' />
            <Field label='CONTENT (MD)' value={form.content}   onChange={v => setForm(f => ({ ...f, content: v }))}    type='textarea' placeholder='Markdown агуулга...' />
            <Field label='VIDEO URL'   value={form.videoUrl}   onChange={v => setForm(f => ({ ...f, videoUrl: v }))}   placeholder='https://...' />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1 }}><Field label='XP REWARD'   value={form.xpReward}   onChange={v => setForm(f => ({ ...f, xpReward: v }))}   type='number' /></div>
              <div style={{ flex: 1 }}><Field label='ORDER INDEX' value={form.orderIndex} onChange={v => setForm(f => ({ ...f, orderIndex: v }))} type='number' /></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Btn label={saving ? 'ХАДГАЛЖ...' : 'ХАДГАЛАХ'} col='var(--green)' onClick={save} disabled={saving} size='md' />
              <Btn label='БОЛИХ' col='var(--dim2)' onClick={() => setShowForm(false)} size='md' />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
