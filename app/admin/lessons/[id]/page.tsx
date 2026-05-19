'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { aGet, adminHeaders } from '@/lib/admin-fetch'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

// ── Types ──────────────────────────────────────────────
type Course = { id: string; title: string; category: string }

type Game = {
  id: string; name: string; slug: string; gameType: string
  description: string | null; thumbnail: string | null
  hpMax: number; xpReward: number; isActive: boolean
  _count: { gameTasks: number; lessonGames: number }
}

type AssignedGame = {
  lessonGameId: string
  orderIndex:   number
  game:         Game
}

type Lesson = {
  id: string; title: string; content: string | null; gameType: string | null
  xpReward: number; orderIndex: number; courseId: string
  course:      Course
  lessonGames: { id: string; orderIndex: number; gameId: string; game: Game }[]
  _count:      { tasks: number; progress: number }
}

// ── Constants ──────────────────────────────────────────
const GAME_META: Record<string, { icon: string; label: string; col: string }> = {
  evolution:          { icon: '🌱', label: 'EVOLUTION',        col: '#00ff88' },
  jump:               { icon: '🏃', label: 'JUMP QUEST',       col: '#00ff41' },
  enemy:              { icon: '👾', label: 'ENEMY RAID',       col: '#ff3333' },
  city:               { icon: '🏙', label: 'CITY BUILD',       col: '#ffe600' },
  island:             { icon: '🏝', label: 'ISLAND',           col: '#00e5ff' },
  castle:             { icon: '🏰', label: 'SERVER CASTLE',    col: '#aa44ff' },
  kingdom:            { icon: '👑', label: 'DATA KINGDOM',     col: '#4488ff' },
  timemachine:        { icon: '⏱', label: 'TIME MACHINE',     col: '#ffe600' },
  megacity:           { icon: '🌆', label: 'MEGA CITY',        col: '#00ff41' },
  cssplatform:        { icon: '🎨', label: 'CSS PLATFORM',     col: '#ff00dd' },
  codequestbattle:    { icon: '⚔', label: 'CODE QUEST',       col: '#ff6b35' },
  autocoderunner:     { icon: '🤖', label: 'AUTO RUNNER',      col: '#00e5ff' },
  onlinecodefactory:  { icon: '🏭', label: 'ONLINE FACTORY',   col: '#ffe600' },
  taskbattlesurvival: { icon: '🛡', label: 'BATTLE SURVIVAL',  col: '#ff4444' },
  multiplayerarena:   { icon: '🏟', label: 'MULTIPLAYER',      col: '#aa44ff' },
  codefactory:        { icon: '⚙', label: 'CODE FACTORY',     col: '#aaaaff' },
}
const gm = (t: string) => GAME_META[t] ?? { icon: '🎮', label: t.toUpperCase(), col: 'var(--dim2)' }

// ── Shared mini-components ─────────────────────────────
function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return <div style={{ padding: '8px 12px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 10 }}>{msg}</div>
}

function Btn({ label, col = 'var(--cyan)', onClick, disabled = false, size = 'sm' }: {
  label: string; col?: string; onClick?: () => void; disabled?: boolean; size?: 'sm' | 'md'
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...fp, fontSize: size === 'sm' ? 6 : 7, letterSpacing: 1, padding: size === 'sm' ? '5px 10px' : '7px 16px', cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent', color: disabled ? 'var(--dim)' : col, border: `1px solid ${disabled ? 'var(--dim)' : col + '55'}`, transition: 'all .15s', opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled) { const b = e.currentTarget; b.style.background = `${col}18`; b.style.borderColor = col } }}
      onMouseLeave={e => { if (!disabled) { const b = e.currentTarget; b.style.background = 'transparent'; b.style.borderColor = `${col}55` } }}>
      {label}
    </button>
  )
}

function Field({ label, value, onChange, type = 'text', placeholder, rows = 4 }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; rows?: number
}) {
  const base: React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', boxSizing: 'border-box' }
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          style={{ ...base, resize: 'vertical' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--green)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
          style={base}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--green)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      )}
    </div>
  )
}

// ── GameAssignmentCard ─────────────────────────────────
function GameAssignmentCard({ ag, idx, total, onUp, onDown, onRemove }: {
  ag: AssignedGame; idx: number; total: number
  onUp: () => void; onDown: () => void; onRemove: () => void
}) {
  const [hov, setHov] = useState(false)
  const meta = gm(ag.game.gameType)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px',
        background: hov ? `${meta.col}08` : 'var(--bg)',
        border: `1px solid ${hov ? meta.col + '55' : 'var(--dim)'}`,
        marginBottom: 6, transition: 'all .2s', position: 'relative',
        opacity: ag.game.isActive ? 1 : 0.55,
      }}>

      {/* Drag handle + order */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0, width: 28 }}>
        <button onClick={onUp} disabled={idx === 0}
          style={{ ...fp, fontSize: 7, padding: '1px 5px', background: 'transparent', border: '1px solid var(--dim)', color: idx === 0 ? 'var(--dim)' : 'var(--dim2)', cursor: idx === 0 ? 'not-allowed' : 'pointer' }}>
          ▲
        </button>
        <div style={{ ...fp, fontSize: 6, color: meta.col, textAlign: 'center' }}>{idx + 1}</div>
        <button onClick={onDown} disabled={idx === total - 1}
          style={{ ...fp, fontSize: 7, padding: '1px 5px', background: 'transparent', border: '1px solid var(--dim)', color: idx === total - 1 ? 'var(--dim)' : 'var(--dim2)', cursor: idx === total - 1 ? 'not-allowed' : 'pointer' }}>
          ▼
        </button>
      </div>

      {/* Game icon */}
      <div style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>{meta.icon}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{ ...fp, fontSize: 9, color: meta.col, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ag.game.name}
          </span>
          <span style={{ ...fp, fontSize: 5, color: meta.col, background: `${meta.col}18`, border: `1px solid ${meta.col}44`, padding: '1px 5px', flexShrink: 0 }}>
            {meta.label}
          </span>
          {!ag.game.isActive && (
            <span style={{ ...fp, fontSize: 5, color: 'var(--red)', border: '1px solid var(--red)44', padding: '1px 5px', flexShrink: 0 }}>
              ARCHIVED
            </span>
          )}
        </div>
        {ag.game.description && (
          <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {ag.game.description}
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 14, flexShrink: 0 }}>
        {[
          { v: `❤️ ${ag.game.hpMax}`,               label: 'HP'     },
          { v: `⚡ ${ag.game.xpReward}`,             label: 'XP'     },
          { v: `📋 ${ag.game._count?.gameTasks ?? 0}`,  label: 'TASKS'  },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ ...fp, fontSize: 8, color: 'var(--text)' }}>{s.v}</div>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Remove */}
      <Btn label="✕ ХАСАХ" col="var(--red)" onClick={onRemove} />
    </div>
  )
}

// ── GamePickerModal ────────────────────────────────────
function GamePickerModal({ lessonId, assignedIds, onAssign, onClose }: {
  lessonId: string; assignedIds: Set<string>
  onAssign: (game: Game) => void; onClose: () => void
}) {
  const [games,    setGames]    = useState<Game[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [typeF,    setTypeF]    = useState('')
  const [assigning, setAssigning] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    aGet('/api/admin/games?active=true').then(r => r.json()).then(d => {
      setGames(d.games ?? [])
      setLoading(false)
    })
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [])

  const allTypes = Array.from(new Set(games.map(g => g.gameType)))

  const filtered = games.filter(g => {
    const matchS = !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.description?.toLowerCase().includes(search.toLowerCase())
    const matchT = !typeF || g.gameType === typeF
    return matchS && matchT
  })

  const notAssigned = filtered.filter(g => !assignedIds.has(g.id))
  const alreadyAssigned = filtered.filter(g => assignedIds.has(g.id))

  const handleAssign = async (game: Game) => {
    if (assigning) return
    setAssigning(game.id)
    const r = await fetch(`/api/admin/lessons/${lessonId}/games`, {
      method: 'POST', credentials: 'include',
      headers: adminHeaders() as Record<string, string>,
      body: JSON.stringify({ gameId: game.id }),
    })
    setAssigning(null)
    if (r.ok) onAssign(game)
  }

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ background: 'var(--bg)', border: '1px solid var(--green)', width: 680, maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--dim)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ ...fp, fontSize: 10, color: 'var(--green)', letterSpacing: 2 }}>
            🎮 ТОГЛООМ ОНООХ
          </div>
          <button onClick={onClose}
            style={{ ...fp, fontSize: 10, color: 'var(--dim2)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 6px' }}>
            ✕
          </button>
        </div>

        {/* Search + filter */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--dim)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input ref={inputRef} value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Тоглоом хайх..."
            style={{ ...fm, fontSize: 11, padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none', flex: 1, minWidth: 160 }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--green)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
          <button onClick={() => setTypeF('')}
            style={{ ...fp, fontSize: 5, padding: '5px 8px', cursor: 'pointer', background: !typeF ? 'var(--dim)22' : 'transparent', color: !typeF ? 'var(--text)' : 'var(--dim2)', border: `1px solid ${!typeF ? 'var(--dim2)' : 'var(--dim)'}` }}>
            ALL
          </button>
          {allTypes.map(t => {
            const m = gm(t)
            return (
              <button key={t} onClick={() => setTypeF(typeF === t ? '' : t)}
                style={{ ...fp, fontSize: 5, padding: '4px 8px', cursor: 'pointer', background: typeF === t ? `${m.col}22` : 'transparent', color: typeF === t ? m.col : 'var(--dim2)', border: `1px solid ${typeF === t ? m.col + '66' : 'var(--dim)'}` }}>
                {m.icon} {m.label}
              </button>
            )
          })}
        </div>

        {/* Game grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
          {loading ? (
            <div style={{ ...fp, fontSize: 9, color: 'var(--dim2)', textAlign: 'center', padding: 30 }}>УНШИЖ БАЙНА...</div>
          ) : filtered.length === 0 ? (
            <div style={{ ...fp, fontSize: 9, color: 'var(--dim2)', textAlign: 'center', padding: 30 }}>Тоглоом олдсонгүй</div>
          ) : (
            <>
              {/* Available games */}
              {notAssigned.length > 0 && (
                <>
                  {notAssigned.map(game => (
                    <PickerGameRow
                      key={game.id}
                      game={game}
                      assigned={false}
                      assigning={assigning === game.id}
                      onAssign={() => handleAssign(game)}
                    />
                  ))}
                </>
              )}

              {/* Separator */}
              {notAssigned.length > 0 && alreadyAssigned.length > 0 && (
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', textAlign: 'center', padding: '8px 0', borderTop: '1px solid var(--dim)', borderBottom: '1px solid var(--dim)', margin: '10px 0', letterSpacing: 2 }}>
                  ─ АЛЬ ХЭДИЙН ОНООГДСОН ─
                </div>
              )}

              {/* Already assigned (greyed) */}
              {alreadyAssigned.map(game => (
                <PickerGameRow
                  key={game.id}
                  game={game}
                  assigned={true}
                  assigning={false}
                  onAssign={() => {}}
                />
              ))}

              {notAssigned.length === 0 && alreadyAssigned.length === 0 && (
                <div style={{ ...fp, fontSize: 9, color: 'var(--dim2)', textAlign: 'center', padding: 30 }}>Тохирох тоглоом олдсонгүй</div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 20px', borderTop: '1px solid var(--dim)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)' }}>
            {notAssigned.length} тоглоом нэмэх боломжтой
          </div>
          <Btn label="ХААХ" col="var(--dim2)" onClick={onClose} />
        </div>
      </div>
    </div>
  )
}

function PickerGameRow({ game, assigned, assigning, onAssign }: {
  game: Game; assigned: boolean; assigning: boolean; onAssign: () => void
}) {
  const [hov, setHov] = useState(false)
  const meta = gm(game.gameType)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: assigned ? 'var(--green)06' : hov ? `${meta.col}08` : 'transparent', border: `1px solid ${assigned ? 'var(--green)33' : hov ? meta.col + '44' : 'var(--dim)'}`, marginBottom: 4, transition: 'all .15s', opacity: assigned ? 0.65 : 1 }}>

      <div style={{ fontSize: 22, flexShrink: 0 }}>{meta.icon}</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <span style={{ ...fp, fontSize: 8, color: meta.col, letterSpacing: 1 }}>{game.name}</span>
          <span style={{ ...fp, fontSize: 5, color: meta.col, background: `${meta.col}18`, border: `1px solid ${meta.col}44`, padding: '1px 5px' }}>{meta.label}</span>
        </div>
        {game.description && (
          <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {game.description}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
        <span style={{ ...fp, fontSize: 7, color: 'var(--dim2)' }}>❤️{game.hpMax} ⚡{game.xpReward} 📋{game._count?.gameTasks ?? 0}</span>
        {assigned ? (
          <span style={{ ...fp, fontSize: 6, color: 'var(--green)', border: '1px solid var(--green)44', padding: '3px 8px' }}>✓ ОНООГДСОН</span>
        ) : (
          <button onClick={onAssign} disabled={assigning}
            style={{ ...fp, fontSize: 6, letterSpacing: 1, padding: '4px 10px', cursor: assigning ? 'not-allowed' : 'pointer', background: assigning ? 'var(--cyan)22' : 'transparent', color: 'var(--cyan)', border: '1px solid var(--cyan)55', transition: 'all .15s', opacity: assigning ? 0.6 : 1 }}
            onMouseEnter={e => { if (!assigning) { const b = e.currentTarget; b.style.background = 'var(--cyan)22'; b.style.borderColor = 'var(--cyan)' } }}
            onMouseLeave={e => { if (!assigning) { const b = e.currentTarget; b.style.background = 'transparent'; b.style.borderColor = 'var(--cyan)55' } }}>
            {assigning ? '...' : '+ ОНООХ'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── Lesson info editor panel ───────────────────────────
function LessonInfoPanel({ lesson, onSaved }: { lesson: Lesson; onSaved: (l: Lesson) => void }) {
  const [form, setForm] = useState({
    title:      lesson.title,
    content:    lesson.content ?? '',
    xpReward:   String(lesson.xpReward),
    orderIndex: String(lesson.orderIndex),
  })
  const [saving,  setSaving]  = useState(false)
  const [flash,   setFlash]   = useState('')
  const [flashCol,setFlashCol]= useState('var(--cyan)')

  const showFlash = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 2500)
  }

  const save = async () => {
    if (!form.title.trim()) { showFlash('Нэр оруулна уу', 'var(--red)'); return }
    setSaving(true)
    const r = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PATCH', credentials: 'include',
      headers: adminHeaders() as Record<string, string>,
      body: JSON.stringify({ title: form.title, content: form.content || null, xpReward: Number(form.xpReward) || 50, orderIndex: Number(form.orderIndex) || 0 }),
    })
    setSaving(false)
    if (r.ok) {
      const d = await r.json()
      showFlash('Хадгалагдлаа ✓', 'var(--green)')
      onSaved({ ...lesson, ...d.lesson })
    } else {
      const d = await r.json().catch(() => ({}))
      showFlash(d.error ?? 'Алдаа гарлаа', 'var(--red)')
    }
  }

  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--dim)', padding: '18px 20px' }}>
      <div style={{ ...fp, fontSize: 7, color: 'var(--green)', letterSpacing: 2, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>◧ ХИЧЭЭЛИЙН МЭДЭЭЛЭЛ</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn label={saving ? 'ХАДГАЛЖ...' : '✓ ХАДГАЛАХ'} col="var(--green)" onClick={save} disabled={saving} />
        </div>
      </div>

      <Flash msg={flash} col={flashCol} />

      <Field label="НЭР *" value={form.title} onChange={v => setForm(f => ({ ...f, title: v }))} placeholder="Хичээлийн нэр" />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="XP REWARD" value={form.xpReward} onChange={v => setForm(f => ({ ...f, xpReward: v }))} type="number" />
        <Field label="ORDER INDEX" value={form.orderIndex} onChange={v => setForm(f => ({ ...f, orderIndex: v }))} type="number" />
      </div>

      <Field label="АГУУЛГА (Markdown)" value={form.content} onChange={v => setForm(f => ({ ...f, content: v }))} type="textarea" placeholder="Markdown агуулга..." rows={5} />

      {/* Lesson meta */}
      <div style={{ display: 'flex', gap: 16, marginTop: 8, paddingTop: 10, borderTop: '1px solid var(--dim)' }}>
        {[
          { label: 'TASKS',    val: lesson._count.tasks,    col: 'var(--cyan)'   },
          { label: 'STUDENTS', val: lesson._count.progress, col: 'var(--yellow)' },
          { label: 'COURSE',   val: lesson.course.title,    col: 'var(--green)'  },
        ].map(s => (
          <div key={s.label}>
            <div style={{ ...fp, fontSize: 9, color: s.col }}>{s.val}</div>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AssignedGamesList ──────────────────────────────────
function AssignedGamesList({ lessonId, initial, onPicker }: {
  lessonId: string; initial: AssignedGame[]; onPicker: () => void
}) {
  const [list,    setList]    = useState<AssignedGame[]>(initial)
  const [flash,   setFlash]   = useState('')
  const [flashCol,setFlashCol]= useState('var(--cyan)')
  const [removing,setRemoving]= useState<string | null>(null)

  const showFlash = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 2500)
  }

  // Sync when parent triggers re-assign
  useEffect(() => { setList(initial) }, [initial])

  const handleSwap = async (idx: number, dir: 'up' | 'down') => {
    const next = [...list]
    const other = dir === 'up' ? idx - 1 : idx + 1
    ;[next[idx], next[other]] = [next[other], next[idx]]
    const reindexed = next.map((ag, i) => ({ ...ag, orderIndex: i }))
    setList(reindexed) // optimistic

    await fetch(`/api/admin/lessons/${lessonId}/games`, {
      method: 'PATCH', credentials: 'include',
      headers: adminHeaders() as Record<string, string>,
      body: JSON.stringify({ order: reindexed.map(ag => ({ gameId: ag.game.id, orderIndex: ag.orderIndex })) }),
    })
  }

  const handleRemove = async (ag: AssignedGame) => {
    if (!confirm(`"${ag.game.name}" хасах уу?`)) return
    setRemoving(ag.game.id)
    const r = await fetch(`/api/admin/lessons/${lessonId}/games/${ag.game.id}`, {
      method: 'DELETE', credentials: 'include',
      headers: adminHeaders() as Record<string, string>,
    })
    setRemoving(null)
    if (r.ok) {
      setList(prev => prev.filter(x => x.game.id !== ag.game.id).map((x, i) => ({ ...x, orderIndex: i })))
      showFlash('Хасагдлаа', 'var(--yellow)')
    } else {
      showFlash('Алдаа гарлаа', 'var(--red)')
    }
  }

  return (
    <div>
      <Flash msg={flash} col={flashCol} />

      {list.length === 0 ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', border: '1px dashed var(--dim)' }}>
          <div style={{ fontSize: 32, marginBottom: 10 }}>🎮</div>
          <div style={{ ...fp, fontSize: 9, color: 'var(--dim2)', marginBottom: 12 }}>
            Энэ хичээлд тоглоом оноогдоогүй байна
          </div>
          <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)', marginBottom: 16 }}>
            Тоглоом оноосноор тухайн хичээлийг нээхэд тоглоомтой хамт харагдана
          </div>
          <Btn label="🎮 ТОГЛООМ ОНООХ" col="var(--green)" onClick={onPicker} size="md" />
        </div>
      ) : (
        <div>
          {list.map((ag, idx) => (
            <div key={ag.game.id} style={{ opacity: removing === ag.game.id ? 0.4 : 1, transition: 'opacity .15s' }}>
              <GameAssignmentCard
                ag={ag}
                idx={idx}
                total={list.length}
                onUp={() => handleSwap(idx, 'up')}
                onDown={() => handleSwap(idx, 'down')}
                onRemove={() => handleRemove(ag)}
              />
            </div>
          ))}

          {/* Summary bar */}
          <div style={{ display: 'flex', gap: 16, padding: '10px 14px', background: 'var(--green)08', border: '1px solid var(--green)33', marginTop: 8 }}>
            <div style={{ ...fp, fontSize: 8, color: 'var(--green)' }}>{list.length} тоглоом оноогдсон</div>
            <div style={{ ...fp, fontSize: 8, color: 'var(--yellow)' }}>
              ⚡ Нийт XP: {list.reduce((s, ag) => s + ag.game.xpReward, 0)}
            </div>
            <div style={{ ...fp, fontSize: 8, color: 'var(--cyan)' }}>
              📋 Нийт task: {list.reduce((s, ag) => s + (ag.game._count?.gameTasks ?? 0), 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────
export default function AdminLessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [lesson,        setLesson]       = useState<Lesson | null>(null)
  const [assignedGames, setAssignedGames]= useState<AssignedGame[]>([])
  const [loading,       setLoading]      = useState(true)
  const [notFound,      setNotFound]     = useState(false)
  const [showPicker,    setShowPicker]   = useState(false)
  const [flash,         setFlash]        = useState('')
  const [flashCol,      setFlashCol]     = useState('var(--cyan)')

  const showFlash = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3000)
  }

  const load = useCallback(async () => {
    if (!id) return
    const [lr, gr] = await Promise.all([
      aGet(`/api/admin/lessons/${id}`),
      aGet(`/api/admin/lessons/${id}/games`),
    ])
    if (!lr.ok) { setNotFound(true); setLoading(false); return }
    const [ld, gd] = await Promise.all([lr.json(), gr.json()])
    setLesson(ld.lesson)
    setAssignedGames(gd.games ?? [])
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  const handleGameAssigned = (game: Game) => {
    // Optimistic: append to list with next orderIndex
    const nextOrder = assignedGames.length
    setAssignedGames(prev => [...prev, {
      lessonGameId: `temp-${game.id}`,
      orderIndex:   nextOrder,
      game,
    }])
    showFlash(`"${game.name}" оноогдлоо ✓`, 'var(--green)')
    // Re-fetch after a tick to get the real lessonGameId
    setTimeout(() => aGet(`/api/admin/lessons/${id}/games`).then(r => r.json()).then(d => setAssignedGames(d.games ?? [])), 600)
  }

  if (loading) {
    return <div style={{ padding: 40, ...fp, fontSize: 9, color: 'var(--dim2)', textAlign: 'center' }}>УНШИЖ БАЙНА...</div>
  }

  if (notFound || !lesson) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ ...fp, fontSize: 9, color: 'var(--red)', marginBottom: 12 }}>⚠ Хичээл олдсонгүй</div>
        <Btn label="← БУЦАХ" col="var(--dim2)" onClick={() => router.push('/admin/lessons')} />
      </div>
    )
  }

  const assignedIds = new Set(assignedGames.map(ag => ag.game.id))

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      {/* Breadcrumb + back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
        <button onClick={() => router.push('/admin/lessons')}
          style={{ ...fp, fontSize: 7, color: 'var(--dim2)', background: 'transparent', border: '1px solid var(--dim)', padding: '5px 10px', cursor: 'pointer' }}>
          ← БУЦАХ
        </button>
        <div style={{ ...fp, fontSize: 6, color: 'var(--dim2)', letterSpacing: 1 }}>
          ADMIN › LESSONS › <span style={{ color: 'var(--green)' }}>{lesson.title}</span>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <Btn label="📋 TASKS" col="var(--cyan)" onClick={() => router.push(`/admin/tasks?lessonId=${lesson.id}`)} />
          <Btn label="🎮 GAMES" col="var(--yellow)" onClick={() => router.push('/admin/games')} />
        </div>
      </div>

      <Flash msg={flash} col={flashCol} />

      {/* Lesson info editor */}
      <LessonInfoPanel lesson={lesson} onSaved={setLesson} />

      {/* ── Assigned Games Section ─────────────────── */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div>
            <div style={{ ...fp, fontSize: 10, color: 'var(--green)', letterSpacing: 2 }}>
              🎮 ОНООГДСОН ТОГЛООМУУД
            </div>
            <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', marginTop: 2 }}>
              Хичээлийг нээхэд эдгээр тоглоомууд дараалан ачаалагдана · {assignedGames.length} тоглоом
            </div>
          </div>
          <Btn label="+ ТОГЛООМ ОНООХ" col="var(--green)" size="md" onClick={() => setShowPicker(true)} />
        </div>

        {/* Future compatibility note */}
        {assignedGames.length > 1 && (
          <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', padding: '7px 12px', background: 'var(--cyan)08', border: '1px solid var(--cyan)22', marginBottom: 10 }}>
            💡 Олон тоглоом оноосон үед хэрэглэгч тус бүрийг дараалан дуусгана (sequential unlock — удахгүй)
          </div>
        )}

        <AssignedGamesList
          lessonId={id}
          initial={assignedGames}
          onPicker={() => setShowPicker(true)}
        />
      </div>

      {/* Legacy gameType note */}
      {lesson.gameType && !assignedGames.some(ag => ag.game.gameType === lesson.gameType) && (
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'var(--yellow)08', border: '1px solid var(--yellow)33' }}>
          <div style={{ ...fp, fontSize: 6, color: 'var(--yellow)', letterSpacing: 1 }}>
            ⚠ ХУУЧИН gameType: <code style={{ ...fm, fontSize: 10 }}>{lesson.gameType}</code>
          </div>
          <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)', marginTop: 3 }}>
            Энэ хичээлд тохирох &quot;{lesson.gameType}&quot; тоглоомыг оноосноор шинэ системрүү шилжинэ
          </div>
        </div>
      )}

      {/* Game picker modal */}
      {showPicker && (
        <GamePickerModal
          lessonId={id}
          assignedIds={assignedIds}
          onAssign={handleGameAssigned}
          onClose={() => setShowPicker(false)}
        />
      )}
    </div>
  )
}
