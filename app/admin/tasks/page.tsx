'use client'
import { useEffect, useState, useCallback } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

import { adminFetch } from '@/lib/admin-fetch'

type Course = { id: string; title: string }
type Lesson = { id: string; title: string }
type Task   = {
  id: string; title: string; titleEn?: string; taskType: string
  xpReward: number; orderIndex: number; description: string; descriptionEn?: string
  options?: unknown; optionsEn?: unknown; answer?: number
  starterCode?: string; testCases?: unknown
  _count: { submissions: number }
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

function Field({ label, value, onChange, placeholder, type = 'text', accent }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; accent?: string }) {
  const col = accent || 'var(--cyan)'
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ ...fp, fontSize: 5, color: accent ? col : 'var(--dim2)', marginBottom: 5 }}>{label}</div>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: `1px solid var(--dim)`, color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = col}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
          style={{ width: '100%', padding: '8px 10px', background: 'var(--bg)', border: `1px solid var(--dim)`, color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = col}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      )}
    </div>
  )
}

const emptyForm = () => ({
  title: '', titleEn: '',
  description: '', descriptionEn: '',
  taskType: 'quiz',
  xpReward: '20', orderIndex: '0',
  options: ['', '', '', ''],
  optionsEn: ['', '', '', ''],
  answer: '0',
  starterCode: '', testCases: '[]',
})

export default function AdminTasksPage() {
  const [courses, setCourses]     = useState<Course[]>([])
  const [lessons, setLessons]     = useState<Lesson[]>([])
  const [courseId, setCourseId]   = useState('')
  const [lessonId, setLessonId]   = useState('')
  const [tasks, setTasks]         = useState<Task[]>([])
  const [loading, setLoading]     = useState(false)
  const [flash, setFlash]         = useState('')
  const [flashCol, setFlashCol]   = useState('var(--cyan)')
  const [showForm, setShowForm]   = useState(false)
  const [editId, setEditId]       = useState<string|null>(null)
  const [form, setForm]           = useState(emptyForm())
  const [saving, setSaving]       = useState(false)
  const [langTab, setLangTab]     = useState<'mn'|'en'>('mn')

  useEffect(() => {
    adminFetch('/api/courses?admin=true&limit=100')
      .then(r => r.json()).then(d => setCourses(d.courses ?? []))
  }, [])

  useEffect(() => {
    if (!courseId) { setLessons([]); setLessonId(''); return }
    adminFetch(`/api/lessons?courseId=${courseId}`)
      .then(r => r.json()).then(d => setLessons(d.lessons ?? []))
  }, [courseId])

  const loadTasks = useCallback(async () => {
    if (!lessonId) { setTasks([]); return }
    setLoading(true)
    try {
      const r = await adminFetch(`/api/tasks?lessonId=${lessonId}`)
      const d = await r.json()
      setTasks(d.tasks ?? [])
    } finally { setLoading(false) }
  }, [lessonId])

  useEffect(() => { loadTasks() }, [loadTasks])

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3000)
  }

  const openCreate = () => {
    setEditId(null)
    setForm(emptyForm())
    setLangTab('mn')
    setShowForm(true)
  }

  const openEdit = (t: Task) => {
    const parseOpts = (v: unknown): string[] => {
      if (!v) return ['','','','']
      const arr = typeof v === 'string' ? JSON.parse(v) : v
      if (!Array.isArray(arr)) return ['','','','']
      const flat = Array.isArray(arr[0]) ? arr[0] : arr
      return [...flat.map(String), ...Array(4)].slice(0,4)
    }
    setEditId(t.id)
    setForm({
      title:        t.title ?? '',
      titleEn:      t.titleEn ?? '',
      description:  t.description ?? '',
      descriptionEn: t.descriptionEn ?? '',
      taskType:     t.taskType ?? 'quiz',
      xpReward:     String(t.xpReward ?? 20),
      orderIndex:   String(t.orderIndex ?? 0),
      options:      parseOpts(t.options),
      optionsEn:    parseOpts(t.optionsEn),
      answer:       String(t.answer ?? 0),
      starterCode:  t.starterCode ?? '',
      testCases:    t.testCases ? JSON.stringify(t.testCases, null, 2) : '[]',
    })
    setLangTab('mn')
    setShowForm(true)
  }

  const save = async () => {
    if (!form.title || !lessonId) { notify('Title, lesson шаардлагатай', 'var(--red)'); return }
    setSaving(true)
    const body: Record<string, unknown> = {
      lessonId, title: form.title, description: form.description,
      titleEn: form.titleEn || undefined,
      descriptionEn: form.descriptionEn || undefined,
      taskType: form.taskType, xpReward: parseInt(form.xpReward) || 20,
      orderIndex: parseInt(form.orderIndex) || 0,
    }
    if (form.taskType === 'quiz') {
      body.options   = form.options.filter(o => o.trim())
      body.optionsEn = form.optionsEn.filter(o => o.trim()).length > 0
        ? form.optionsEn.filter(o => o.trim())
        : undefined
      body.answer    = parseInt(form.answer)
    } else {
      body.starterCode = form.starterCode
      try { body.testCases = JSON.parse(form.testCases) } catch { body.testCases = [] }
    }
    try {
      let r: Response
      if (editId) {
        r = await adminFetch(`/api/tasks/${editId}`, {method: 'PUT',  body: JSON.stringify(body)})
      } else {
        r = await adminFetch('/api/tasks', {method: 'POST',  body: JSON.stringify(body)})
      }
      if (r.ok) {
        notify(editId ? 'Task шинэчлэгдлээ' : 'Task үүсгэгдлээ')
        setShowForm(false); loadTasks()
      } else {
        const d = await r.json(); notify(d.error ?? 'Алдаа', 'var(--red)')
      }
    } finally { setSaving(false) }
  }

  const deleteTask = async (t: Task) => {
    if (!confirm(`"${t.title}" устгах уу?`)) return
    const r = await adminFetch(`/api/tasks/${t.id}`, {method: 'DELETE'})
    if (r.ok) { notify('Устгагдлаа', 'var(--red)'); loadTasks() } else notify('Алдаа', 'var(--red)')
  }

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 22 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · TASKS</div>
        <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
          TASK MANAGEMENT <span style={{ fontSize: 8, color: 'var(--green)' }}>◨</span>
        </h1>
      </div>

      <Flash msg={flash} col={flashCol} />

      {/* Selectors */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ ...fp, fontSize: 6, color: 'var(--dim2)', minWidth: 60 }}>COURSE:</div>
        <select value={courseId} onChange={e => { setCourseId(e.target.value); setLessonId('') }}
          style={{ flex: 1, maxWidth: 280, padding: '7px 10px', background: 'var(--bg2)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 11, outline: 'none' }}>
          <option value=''>— Course —</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
        </select>
        {courseId && <>
          <div style={{ ...fp, fontSize: 6, color: 'var(--dim2)', minWidth: 60 }}>LESSON:</div>
          <select value={lessonId} onChange={e => setLessonId(e.target.value)}
            style={{ flex: 1, maxWidth: 280, padding: '7px 10px', background: 'var(--bg2)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 11, outline: 'none' }}>
            <option value=''>— Lesson —</option>
            {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
          </select>
        </>}
        {lessonId && <Btn label='+ ШИНЭ TASK' col='var(--green)' onClick={openCreate} size='md' />}
      </div>

      {/* Tasks table */}
      {!lessonId ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', padding: '40px 0' }}>Course болон Lesson сонгоно уу</div>
      ) : loading ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', padding: '40px 0' }}>Уншиж байна...</div>
      ) : (
        <div style={{ border: '1px solid var(--dim)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 0.8fr 0.8fr 1.2fr', background: 'var(--bg2)', borderBottom: '1px solid var(--dim)', padding: '8px 14px', gap: 8 }}>
            {['TITLE', 'TYPE', 'XP', 'SUBMISSIONS', 'ҮЙЛДЭЛ'].map(h => (
              <span key={h} style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2 }}>{h}</span>
            ))}
          </div>
          {tasks.length === 0 ? (
            <div style={{ padding: '28px', ...fm, fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Task алга</div>
          ) : tasks.map(t => (
            <div key={t.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 0.8fr 0.8fr 1.2fr', padding: '10px 14px', gap: 8, borderBottom: '1px solid var(--dim)', alignItems: 'center' }}>
              <div>
                <span style={{ ...fp, fontSize: 7, color: 'var(--text)' }}>{t.title}</span>
                {t.titleEn && <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginLeft: 8 }}>{t.titleEn}</span>}
              </div>
              <span style={{ ...fp, fontSize: 5, color: t.taskType === 'quiz' ? 'var(--cyan)' : 'var(--purple)', border: `1px solid ${t.taskType === 'quiz' ? 'var(--cyan)' : 'var(--purple)'}44`, padding: '2px 6px', width: 'fit-content' }}>{t.taskType.toUpperCase()}</span>
              <span style={{ ...fp, fontSize: 6, color: 'var(--yellow)' }}>{t.xpReward}</span>
              <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>{t._count?.submissions ?? 0}</span>
              <div style={{ display: 'flex', gap: 4 }}>
                <Btn label='EDIT' col='var(--cyan)' onClick={() => openEdit(t)} />
                <Btn label='DEL' col='var(--red)' onClick={() => deleteTask(t)} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.82)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
          onClick={e => { if (e.target === e.currentTarget) setShowForm(false) }}>
          <div style={{ background: 'var(--bg)', border: `1px solid ${editId ? 'var(--cyan)' : 'var(--green)'}`, padding: '28px 32px', width: 600, maxHeight: '92vh', overflowY: 'auto' }}>

            <div style={{ ...fp, fontSize: 8, color: editId ? 'var(--cyan)' : 'var(--green)', letterSpacing: 2, marginBottom: 18 }}>
              {editId ? 'TASK ЗАСАХ' : 'ШИНЭ TASK'}
            </div>

            {/* Lang tabs */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 18, borderBottom: '1px solid var(--dim)', paddingBottom: 12 }}>
              {(['mn','en'] as const).map(l => (
                <button key={l} onClick={() => setLangTab(l)}
                  style={{ ...fp, fontSize: 6, padding: '5px 14px', cursor: 'pointer', border: `1px solid ${langTab===l?'var(--cyan)':'var(--dim)'}`, background: langTab===l?'rgba(0,229,255,.1)':'transparent', color: langTab===l?'var(--cyan)':'var(--dim2)' }}>
                  {l==='mn' ? '🇲🇳 МОНГОЛ' : '🇺🇸 ENGLISH'}
                </button>
              ))}
            </div>

            {langTab === 'mn' ? (
              <>
                <Field label='ГАРЧИГ (МН)' value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder='Task нэр монголоор' />
                <Field label='ТАЙЛБАР (МН)' value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} type='textarea' placeholder='Тайлбар монголоор...' />
              </>
            ) : (
              <>
                <Field label='TITLE (EN)' value={form.titleEn} onChange={v => setForm(f => ({ ...f, titleEn: v }))} placeholder='Task title in English' accent='var(--purple)' />
                <Field label='DESCRIPTION (EN)' value={form.descriptionEn} onChange={v => setForm(f => ({ ...f, descriptionEn: v }))} type='textarea' placeholder='Description in English...' accent='var(--purple)' />
              </>
            )}

            {/* Task type */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 5 }}>TASK TYPE</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {['quiz', 'code'].map(tp => (
                  <button key={tp} onClick={() => setForm(f => ({ ...f, taskType: tp }))}
                    style={{ ...fp, fontSize: 6, padding: '6px 16px', cursor: 'pointer', background: form.taskType === tp ? 'var(--green)18' : 'transparent', color: form.taskType === tp ? 'var(--green)' : 'var(--dim2)', border: `1px solid ${form.taskType === tp ? 'var(--green)' : 'var(--dim)'}` }}>
                    {tp.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {form.taskType === 'quiz' ? (
              <>
                <div style={{ ...fp, fontSize: 5, color: langTab==='mn'?'var(--dim2)':'var(--purple)', marginBottom: 8 }}>
                  {langTab==='mn' ? 'ХАРИУЛТУУД (МН)' : 'OPTIONS (EN)'}
                </div>
                {form.options.map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                    {langTab === 'mn' && (
                      <input type='radio' name='answer' checked={form.answer === String(i)} onChange={() => setForm(f => ({ ...f, answer: String(i) }))} style={{ accentColor: 'var(--green)', flexShrink: 0 }} />
                    )}
                    {langTab === 'mn' ? (
                      <input value={form.options[i]} onChange={e => { const o=[...form.options]; o[i]=e.target.value; setForm(f=>({...f,options:o})) }}
                        placeholder={`Сонголт ${i+1}`}
                        style={{ flex:1, padding:'7px 10px', background:'var(--bg)', border:`1px solid ${form.answer===String(i)?'var(--green)':'var(--dim)'}`, color:'var(--text)', ...fm, fontSize:12, outline:'none' }} />
                    ) : (
                      <input value={form.optionsEn[i]} onChange={e => { const o=[...form.optionsEn]; o[i]=e.target.value; setForm(f=>({...f,optionsEn:o})) }}
                        placeholder={`Option ${i+1} (English)`}
                        style={{ flex:1, padding:'7px 10px', background:'var(--bg)', border:'1px solid var(--dim)', color:'var(--text)', ...fm, fontSize:12, outline:'none' }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--purple)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
                    )}
                    {langTab === 'mn' && (
                      <span style={{ ...fp, fontSize: 5, color: form.answer===String(i)?'var(--green)':'var(--dim)', minWidth: 20 }}>
                        {form.answer===String(i)?'✓':''}
                      </span>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <>
                <Field label='STARTER CODE' value={form.starterCode} onChange={v => setForm(f => ({ ...f, starterCode: v }))} type='textarea' placeholder='function solution() {}' />
                <Field label='TEST CASES (JSON)' value={form.testCases} onChange={v => setForm(f => ({ ...f, testCases: v }))} type='textarea' placeholder='[{"input":"1","expected":"2"}]' />
              </>
            )}

            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <div style={{ flex: 1 }}><Field label='XP REWARD' value={form.xpReward} onChange={v => setForm(f => ({ ...f, xpReward: v }))} type='number' /></div>
              <div style={{ flex: 1 }}><Field label='ORDER' value={form.orderIndex} onChange={v => setForm(f => ({ ...f, orderIndex: v }))} type='number' /></div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Btn label={saving ? 'ХАДГАЛЖ...' : editId ? 'ШИНЭЧЛЭХ' : 'ҮҮСГЭХ'} col={editId?'var(--cyan)':'var(--green)'} onClick={save} disabled={saving} size='md' />
              <Btn label='БОЛИХ' col='var(--dim2)' onClick={() => setShowForm(false)} size='md' />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}