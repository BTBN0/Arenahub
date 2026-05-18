'use client'
import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { aGet, adminHeaders } from '@/lib/admin-fetch'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

// ── Types ──────────────────────────────────────────────
type GameInfo = {
  id: string; name: string; slug: string; gameType: string; hpMax: number; xpReward: number
}

type PoolTask = {
  id: string; title: string; titleEn: string | null; taskType: string; xpReward: number
  orderIndex: number; gameTaskId: string
  lesson: { id: string; title: string; course: { id: string; title: string } }
  _count: { submissions: number }
}

type GlobalTask = {
  id: string; title: string; titleEn: string | null; taskType: string; xpReward: number
  lesson: { id: string; title: string; course: { id: string; title: string } } | null
}

// ── Game type colors ───────────────────────────────────
const GAME_COLORS: Record<string, string> = {
  city: '#ffe600', island: '#00e5ff', castle: '#ff6b35', kingdom: '#ffd700',
  timemachine: '#00ffff', megacity: '#ff00ff', enemy: '#ff3333', quiz: '#a855f7', code: '#22d3ee',
}
const GAME_ICONS: Record<string, string> = {
  city: '🏙', island: '🏝', castle: '🏰', kingdom: '👑',
  timemachine: '⏱', megacity: '🌆', enemy: '👾', quiz: '❓', code: '💻',
}

const TASK_TYPE_COLORS: Record<string, string> = {
  quiz: '#a855f7', code: '#22d3ee', fill: '#ff6b35', default: 'var(--dim2)',
}
const ttCol = (t: string) => TASK_TYPE_COLORS[t] ?? TASK_TYPE_COLORS.default

// ── Mini components ────────────────────────────────────
function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return <div style={{ padding: '8px 12px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 10 }}>{msg}</div>
}

function Btn({ label, col = 'var(--cyan)', onClick, disabled = false, small = true }: {
  label: string; col?: string; onClick?: () => void; disabled?: boolean; small?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...fp, fontSize: small ? 5 : 7, letterSpacing: 1, padding: small ? '3px 7px' : '6px 14px', cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent', color: disabled ? 'var(--dim)' : col, border: `1px solid ${disabled ? 'var(--dim)' : col + '55'}`, transition: 'all .15s', opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled) { const b = e.currentTarget; b.style.background = `${col}18`; b.style.borderColor = col } }}
      onMouseLeave={e => { if (!disabled) { const b = e.currentTarget; b.style.background = 'transparent'; b.style.borderColor = `${col}55` } }}>
      {label}
    </button>
  )
}

function TypeBadge({ type }: { type: string }) {
  const col = ttCol(type)
  return (
    <span style={{ ...fp, fontSize: 5, color: col, background: `${col}18`, border: `1px solid ${col}44`, padding: '1px 5px', letterSpacing: 1 }}>
      {type.toUpperCase()}
    </span>
  )
}

// ── Pool task row ──────────────────────────────────────
function PoolRow({ task, idx, total, onUp, onDown, onRemove, accentCol }: {
  task: PoolTask; idx: number; total: number
  onUp: () => void; onDown: () => void; onRemove: () => void; accentCol: string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', background: hovered ? '#ffffff08' : 'transparent', border: '1px solid var(--dim)', marginBottom: 4, transition: 'background .15s' }}>
      {/* Order number */}
      <div style={{ ...fp, fontSize: 7, color: accentCol, width: 24, textAlign: 'center', flexShrink: 0 }}>
        {idx + 1}
      </div>

      {/* Up/Down */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        <button onClick={onUp} disabled={idx === 0}
          style={{ ...fp, fontSize: 7, padding: '1px 5px', background: 'transparent', border: '1px solid var(--dim)', color: idx === 0 ? 'var(--dim)' : 'var(--dim2)', cursor: idx === 0 ? 'not-allowed' : 'pointer', lineHeight: 1 }}>
          ▲
        </button>
        <button onClick={onDown} disabled={idx === total - 1}
          style={{ ...fp, fontSize: 7, padding: '1px 5px', background: 'transparent', border: '1px solid var(--dim)', color: idx === total - 1 ? 'var(--dim)' : 'var(--dim2)', cursor: idx === total - 1 ? 'not-allowed' : 'pointer', lineHeight: 1 }}>
          ▼
        </button>
      </div>

      {/* Task info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <TypeBadge type={task.taskType} />
          <span style={{ ...fp, fontSize: 8, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {task.title}
          </span>
        </div>
        <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)' }}>
          {task.lesson.course.title} › {task.lesson.title}
        </div>
      </div>

      {/* XP */}
      <div style={{ ...fp, fontSize: 7, color: 'var(--yellow)', flexShrink: 0 }}>
        ⚡{task.xpReward}
      </div>

      {/* Submissions */}
      <div style={{ ...fp, fontSize: 7, color: 'var(--dim2)', flexShrink: 0, width: 40, textAlign: 'center' }}>
        {task._count.submissions}✔
      </div>

      {/* Remove */}
      <Btn label="✕" col="var(--red)" onClick={onRemove} />
    </div>
  )
}

// ── Global task row (add panel) ────────────────────────
function GlobalRow({ task, inPool, onAdd }: { task: GlobalTask; inPool: boolean; onAdd: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: inPool ? 'var(--green)08' : 'transparent', border: `1px solid ${inPool ? 'var(--green)44' : 'var(--dim)'}`, marginBottom: 3 }}>
      <TypeBadge type={task.taskType} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...fp, fontSize: 8, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {task.title}
        </div>
        {task.lesson && (
          <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', marginTop: 1 }}>
            {task.lesson.course.title} › {task.lesson.title}
          </div>
        )}
      </div>
      <div style={{ ...fp, fontSize: 7, color: 'var(--yellow)', flexShrink: 0 }}>⚡{task.xpReward}</div>
      {inPool ? (
        <span style={{ ...fp, fontSize: 5, color: 'var(--green)', padding: '2px 6px', border: '1px solid var(--green)44' }}>✓ ADDED</span>
      ) : (
        <Btn label="+ ADD" col="var(--cyan)" onClick={onAdd} />
      )}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────
export default function GameTasksPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [game,      setGame]      = useState<GameInfo | null>(null)
  const [poolTasks, setPoolTasks] = useState<PoolTask[]>([])
  const [allTasks,  setAllTasks]  = useState<GlobalTask[]>([])
  const [loading,   setLoading]   = useState(true)
  const [flash,     setFlash]     = useState('')
  const [flashCol,  setFlashCol]  = useState('var(--cyan)')

  const [taskSearch, setTaskSearch] = useState('')
  const [taskType,   setTaskType]   = useState('')
  const [saving,     setSaving]     = useState(false)

  const showFlash = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3000)
  }

  // Load game info + pool
  const loadPool = useCallback(async () => {
    const [gr, tr] = await Promise.all([
      aGet(`/api/admin/games/${id}`),
      aGet(`/api/admin/games/${id}/tasks`),
    ])
    if (!gr.ok) { setLoading(false); return }
    const [gd, td] = await Promise.all([gr.json(), tr.json()])
    setGame(gd.game)
    setPoolTasks(td.tasks ?? [])
    setLoading(false)
  }, [id])

  // Load all tasks (for add panel)
  const loadAllTasks = useCallback(async () => {
    const r = await aGet('/api/admin/tasks')
    if (!r.ok) return
    const d = await r.json()
    setAllTasks(d.tasks ?? [])
  }, [])

  useEffect(() => {
    loadPool()
    loadAllTasks()
  }, [loadPool, loadAllTasks])

  // Add task to pool
  const handleAdd = async (taskId: string) => {
    setSaving(true)
    const r = await fetch(`/api/admin/games/${id}/tasks`, {
      method: 'POST', credentials: 'include',
      headers: adminHeaders() as Record<string, string>,
      body: JSON.stringify({ taskId }),
    })
    setSaving(false)
    if (r.ok) { showFlash('Даалгавар нэмэгдлээ ✓', 'var(--green)'); loadPool() }
    else {
      const d = await r.json().catch(() => ({}))
      showFlash(d.error ?? 'Алдаа гарлаа', 'var(--red)')
    }
  }

  // Remove task from pool
  const handleRemove = async (taskId: string) => {
    setSaving(true)
    const r = await fetch(`/api/admin/games/${id}/tasks/${taskId}`, {
      method: 'DELETE', credentials: 'include',
      headers: adminHeaders() as Record<string, string>,
    })
    setSaving(false)
    if (r.ok) { showFlash('Хасагдлаа', 'var(--yellow)'); loadPool() }
    else showFlash('Алдаа гарлаа', 'var(--red)')
  }

  // Swap two tasks in pool (up/down)
  const handleSwap = async (idx: number, dir: 'up' | 'down') => {
    const newPool = [...poolTasks]
    const other = dir === 'up' ? idx - 1 : idx + 1
    ;[newPool[idx], newPool[other]] = [newPool[other], newPool[idx]]

    const order = newPool.map((t, i) => ({ taskId: t.id, orderIndex: i }))
    setPoolTasks(newPool.map((t, i) => ({ ...t, orderIndex: i })))

    await fetch(`/api/admin/games/${id}/tasks`, {
      method: 'PATCH', credentials: 'include',
      headers: adminHeaders() as Record<string, string>,
      body: JSON.stringify({ order }),
    })
  }

  const poolIds = new Set(poolTasks.map(t => t.id))
  const accentCol = game ? (GAME_COLORS[game.gameType] ?? '#ff6b35') : '#ff6b35'

  const filteredAll = allTasks.filter(t => {
    const matchSearch = !taskSearch || t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.lesson?.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      t.lesson?.course.title.toLowerCase().includes(taskSearch.toLowerCase())
    const matchType = !taskType || t.taskType === taskType
    return matchSearch && matchType
  })

  const allTaskTypes = Array.from(new Set(allTasks.map(t => t.taskType)))

  if (loading) {
    return <div style={{ padding: 40, ...fp, fontSize: 9, color: 'var(--dim2)', textAlign: 'center' }}>УНШИЖ БАЙНА...</div>
  }

  if (!game) {
    return <div style={{ padding: 40, ...fp, fontSize: 9, color: 'var(--red)', textAlign: 'center' }}>⚠ Тоглоом олдсонгүй</div>
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push(`/admin/games/${id}`)}
          style={{ ...fp, fontSize: 7, color: 'var(--dim2)', background: 'transparent', border: '1px solid var(--dim)', padding: '5px 10px', cursor: 'pointer' }}>
          ← БУЦАХ
        </button>
        <div style={{ fontSize: 24 }}>{GAME_ICONS[game.gameType] ?? '🎮'}</div>
        <div>
          <div style={{ ...fp, fontSize: 13, color: accentCol, letterSpacing: 1 }}>{game.name} — TASK POOL</div>
          <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', marginTop: 2 }}>
            {poolTasks.length} даалгавар · HP: {game.hpMax} · XP: {game.xpReward}
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={() => router.push('/admin/games')}
            style={{ ...fp, fontSize: 6, color: 'var(--dim2)', background: 'transparent', border: '1px solid var(--dim)', padding: '5px 10px', cursor: 'pointer' }}>
            ☰ БҮГД GAMES
          </button>
        </div>
      </div>

      <Flash msg={flash} col={flashCol} />

      {/* Two-panel layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* LEFT: Current pool */}
        <div>
          <div style={{ ...fp, fontSize: 7, color: accentCol, letterSpacing: 1, marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>📋 POOL ({poolTasks.length})</span>
            {poolTasks.length > 0 && (
              <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>
                ▲▼ ДАРЖ ДАРААЛАЛ ӨӨРЧЛӨХ
              </span>
            )}
          </div>

          {poolTasks.length === 0 ? (
            <div style={{ ...fp, fontSize: 8, color: 'var(--dim2)', padding: 30, textAlign: 'center', border: '1px dashed var(--dim)' }}>
              Даалгавар нэмэгдээгүй байна
              <div style={{ ...fm, fontSize: 10, marginTop: 8 }}>Баруун талаас нэмнэ үү →</div>
            </div>
          ) : (
            <div>
              {poolTasks.map((task, idx) => (
                <PoolRow
                  key={task.id}
                  task={task}
                  idx={idx}
                  total={poolTasks.length}
                  onUp={() => handleSwap(idx, 'up')}
                  onDown={() => handleSwap(idx, 'down')}
                  onRemove={() => handleRemove(task.id)}
                  accentCol={accentCol}
                />
              ))}
            </div>
          )}

          {/* Pool stats */}
          {poolTasks.length > 0 && (
            <div style={{ marginTop: 12, padding: '8px 12px', background: `${accentCol}0d`, border: `1px solid ${accentCol}33`, display: 'flex', gap: 16 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...fp, fontSize: 10, color: accentCol }}>{poolTasks.length}</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>TASKS</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...fp, fontSize: 10, color: 'var(--yellow)' }}>
                  {poolTasks.reduce((s, t) => s + t.xpReward, 0)}
                </div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>TOTAL XP</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...fp, fontSize: 10, color: 'var(--cyan)' }}>
                  {poolTasks.filter(t => t.taskType === 'quiz').length}
                </div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>QUIZ</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ ...fp, fontSize: 10, color: '#22d3ee' }}>
                  {poolTasks.filter(t => t.taskType === 'code').length}
                </div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>CODE</div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Add tasks */}
        <div>
          <div style={{ ...fp, fontSize: 7, color: 'var(--cyan)', letterSpacing: 1, marginBottom: 10 }}>
            ➕ ДААЛГАВАР НЭМЭХ
          </div>

          {/* Search + filter */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
            <input
              value={taskSearch}
              onChange={e => setTaskSearch(e.target.value)}
              placeholder="Даалгавар хайх..."
              style={{ ...fm, fontSize: 10, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none', flex: 1, minWidth: 120 }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
            />
            <select value={taskType} onChange={e => setTaskType(e.target.value)}
              style={{ ...fp, fontSize: 7, padding: '6px 8px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none' }}>
              <option value="">ALL TYPE</option>
              {allTaskTypes.map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
            </select>
          </div>

          {/* Counts */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span style={{ ...fp, fontSize: 6, color: 'var(--dim2)' }}>
              AVAILABLE: {filteredAll.filter(t => !poolIds.has(t.id)).length}
            </span>
            <span style={{ ...fp, fontSize: 6, color: 'var(--green)' }}>
              IN POOL: {filteredAll.filter(t => poolIds.has(t.id)).length}
            </span>
          </div>

          {/* Task list — show not-in-pool first */}
          <div style={{ maxHeight: 520, overflowY: 'auto', paddingRight: 4 }}>
            {filteredAll.length === 0 ? (
              <div style={{ ...fp, fontSize: 8, color: 'var(--dim2)', padding: 20, textAlign: 'center' }}>Даалгавар олдсонгүй</div>
            ) : (
              <>
                {/* Not in pool */}
                {filteredAll.filter(t => !poolIds.has(t.id)).map(task => (
                  <GlobalRow key={task.id} task={task} inPool={false} onAdd={() => handleAdd(task.id)} />
                ))}
                {/* Divider */}
                {filteredAll.some(t => poolIds.has(t.id)) && filteredAll.some(t => !poolIds.has(t.id)) && (
                  <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', padding: '6px 0', textAlign: 'center', borderTop: '1px solid var(--dim)', borderBottom: '1px solid var(--dim)', margin: '8px 0', letterSpacing: 1 }}>
                    ─ АЛЬ ХЭДИЙН НЭМЭГДСЭН ─
                  </div>
                )}
                {/* Already in pool */}
                {filteredAll.filter(t => poolIds.has(t.id)).map(task => (
                  <GlobalRow key={task.id} task={task} inPool={true} onAdd={() => {}} />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
