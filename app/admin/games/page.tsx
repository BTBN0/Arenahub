'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import { aGet, aPost, aPut, aDel } from '@/lib/admin-fetch'
import type { GameState } from '@/components/game/GameCanvas'

const GamePreview = dynamic(() => import('@/components/game/GameCanvas'), { ssr: false })

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

// ── Canvas-registered game types (STEP 4 — source of truth) ───────────────
const GAME_TYPES: Record<string, { icon: string; label: string; col: string }> = {
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
const getGT = (t: string) => GAME_TYPES[t] ?? { icon: '🎮', label: t.toUpperCase(), col: 'var(--dim2)' }

// ── Types ──────────────────────────────────────────────────────────────────
type Game = {
  id: string; name: string; slug: string; gameType: string
  description: string | null; thumbnail: string | null
  hpMax: number; xpReward: number; isActive: boolean; createdAt: string
  _count: { gameTasks: number; lessonGames: number }
}
type TaskEntry = {
  id: string; title: string; titleEn: string | null; taskType: string
  xpReward: number; orderIndex: number; gameTaskId?: string
  lesson?: { id: string; title: string; course?: { id: string; title: string } }
}
type LessonEntry = { lessonGameId: string; lesson: { id: string; title: string; courseId: string } }
type GameDetail = Game & { gameTasks?: { orderIndex: number; task: TaskEntry }[]; lessonGames?: LessonEntry[] }

// ── Mini components ────────────────────────────────────────────────────────
function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return (
    <div style={{ padding: '6px 12px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 10, flexShrink: 0 }}>
      {msg}
    </div>
  )
}

function Btn({ label, col = 'var(--cyan)', onClick, size = 'sm', disabled = false }: {
  label: string; col?: string; onClick?: () => void; size?: 'sm' | 'md'; disabled?: boolean
}) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...fp, fontSize: 6, letterSpacing: 1, padding: size === 'sm' ? '5px 10px' : '8px 18px', cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent', color: disabled ? 'var(--dim)' : col, border: `1px solid ${disabled ? 'var(--dim)' : col + '55'}`, transition: 'all .15s', opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled) { const b = e.currentTarget; b.style.background = `${col}18`; b.style.borderColor = col } }}
      onMouseLeave={e => { if (!disabled) { const b = e.currentTarget; b.style.background = 'transparent'; b.style.borderColor = `${col}55` } }}>
      {label}
    </button>
  )
}

function SectionHead({ label, col = 'var(--dim2)' }: { label: string; col?: string }) {
  return (
    <div style={{ ...fp, fontSize: 5, color: col, letterSpacing: 2, padding: '4px 0 8px', borderBottom: '1px solid var(--dim)', marginBottom: 10 }}>
      {label}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function GameStudioPage() {
  // ── List state ──
  const [games,        setGames]       = useState<Game[]>([])
  const [listLoading,  setListLoading] = useState(true)
  const [search,       setSearch]      = useState('')
  const [typeFilter,   setTypeFilter]  = useState('')
  const [activeFilter, setActiveFilter]= useState<'all'|'active'|'archived'>('active')

  // ── Selection ──
  const [selectedId,   setSelectedId]  = useState<string|null>(null)
  const [detail,       setDetail]      = useState<GameDetail|null>(null)
  const [detailLoad,   setDetailLoad]  = useState(false)

  // ── Form state ──
  const [fName,   setFName]   = useState('')
  const [fSlug,   setFSlug]   = useState('')
  const [fType,   setFType]   = useState('evolution')
  const [fHp,     setFHp]     = useState(3)
  const [fXp,     setFXp]     = useState(50)
  const [fDesc,   setFDesc]   = useState('')
  const [fActive, setFActive] = useState(true)
  const [fCfg,    setFCfg]    = useState('{}')
  const [saving,  setSaving]  = useState(false)

  // ── Flash ──
  const [flash,    setFlash]    = useState('')
  const [flashCol, setFlashCol] = useState('var(--cyan)')
  const showFlash = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col); setTimeout(() => setFlash(''), 3000)
  }

  // ── Preview state ──
  const [previewState,  setPreviewState]  = useState<GameState>('idle')
  const [previewPassed, setPreviewPassed] = useState(0)
  const [previewTotal,  setPreviewTotal]  = useState(5)

  // ── Task pool state ──
  const [taskSearch,  setTaskSearch]  = useState('')
  const [taskResults, setTaskResults] = useState<TaskEntry[]>([])
  const [taskLoading, setTaskLoading] = useState(false)
  const [addingTask,  setAddingTask]  = useState(false)
  const searchRef = useRef<ReturnType<typeof setTimeout>|null>(null)

  // ── Attach lesson state ──
  const [lessonInput,   setLessonInput]   = useState('')
  const [attachingLesson, setAttachingLesson] = useState(false)

  // ── Load game list ──────────────────────────────────────────────────────
  const loadList = useCallback(async () => {
    setListLoading(true)
    const params = new URLSearchParams()
    if (search)                     params.set('search', search)
    if (typeFilter)                 params.set('gameType', typeFilter)
    if (activeFilter !== 'all')     params.set('active', activeFilter === 'active' ? 'true' : 'false')
    const r = await aGet(`/api/admin/games?${params}`)
    const d = await r.json()
    setGames(d.games ?? [])
    setListLoading(false)
  }, [search, typeFilter, activeFilter])

  useEffect(() => { loadList() }, [loadList])

  // ── Load game detail ────────────────────────────────────────────────────
  const loadDetail = useCallback(async (id: string) => {
    if (id === '__new__') return
    setDetailLoad(true)
    const r = await aGet(`/api/admin/games/${id}`)
    const d = await r.json()
    setDetail(d.game ?? null)
    setDetailLoad(false)
  }, [])

  // Populate form when detail loads
  useEffect(() => {
    if (!detail || selectedId === '__new__') return
    setFName(detail.name)
    setFSlug(detail.slug)
    setFType(detail.gameType)
    setFHp(detail.hpMax)
    setFXp(detail.xpReward)
    setFDesc(detail.description ?? '')
    setFActive(detail.isActive)
    try { setFCfg(JSON.stringify((detail as GameDetail & { config?: unknown }).config ?? {}, null, 2)) } catch { setFCfg('{}') }
    setPreviewTotal(Math.max(1, detail._count.gameTasks || 5))
    setPreviewPassed(0)
  }, [detail, selectedId])

  // Auto-slug from name (new game only)
  useEffect(() => {
    if (selectedId !== '__new__') return
    setFSlug(fName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40))
  }, [fName, selectedId])

  // ── Select game ─────────────────────────────────────────────────────────
  const selectGame = (id: string) => {
    setSelectedId(id)
    setTaskSearch(''); setTaskResults([])
    setLessonInput('')
    if (id !== '__new__') loadDetail(id)
  }

  // New game
  const handleNew = () => {
    setSelectedId('__new__')
    setDetail(null)
    setFName(''); setFSlug(''); setFType('evolution')
    setFHp(3); setFXp(50); setFDesc(''); setFActive(true); setFCfg('{}')
    setTaskSearch(''); setTaskResults([])
    setLessonInput('')
    setPreviewPassed(0); setPreviewTotal(5); setPreviewState('idle')
  }

  // ── Save (create or update) ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!fName.trim() || !fSlug.trim()) return showFlash('Нэр болон slug шаардлагатай', 'var(--red)')
    let cfg: Record<string, unknown> = {}
    try { cfg = JSON.parse(fCfg) } catch { return showFlash('Config JSON буруу байна', 'var(--red)') }

    const body = { name: fName.trim(), slug: fSlug.trim(), gameType: fType, hpMax: fHp, xpReward: fXp, description: fDesc || undefined, isActive: fActive, config: cfg }
    setSaving(true)
    if (selectedId === '__new__') {
      const r = await aPost('/api/admin/games', body)
      const d = await r.json()
      setSaving(false)
      if (!r.ok) return showFlash(d.error ?? 'Алдаа гарлаа', 'var(--red)')
      showFlash('Тоглоом үүсгэгдлээ', 'var(--green)')
      loadList()
      setSelectedId(d.game.id)
      setDetail(d.game)
    } else if (selectedId) {
      const r = await aPut(`/api/admin/games/${selectedId}`, body)
      const d = await r.json()
      setSaving(false)
      if (!r.ok) return showFlash(d.error ?? 'Алдаа гарлаа', 'var(--red)')
      showFlash('Хадгалагдлаа', 'var(--green)')
      setDetail(d.game)
      loadList()
    }
  }

  // ── Archive / Restore ───────────────────────────────────────────────────
  const handleArchive = async () => {
    if (!selectedId || selectedId === '__new__') return
    if (!confirm(`"${fName}" тоглоомыг архивлах уу?`)) return
    const r = await aDel(`/api/admin/games/${selectedId}`)
    if (r.ok) { showFlash('Архивлагдлаа'); setFActive(false); loadList() }
    else       showFlash('Алдаа гарлаа', 'var(--red)')
  }
  const handleRestore = async () => {
    if (!selectedId || selectedId === '__new__') return
    const r = await aPut(`/api/admin/games/${selectedId}`, { isActive: true })
    if (r.ok) { showFlash('Сэргээгдлээ', 'var(--green)'); setFActive(true); loadList() }
    else       showFlash('Алдаа гарлаа', 'var(--red)')
  }

  // ── Duplicate ───────────────────────────────────────────────────────────
  const handleDuplicate = async () => {
    if (!selectedId || selectedId === '__new__') return
    const newSlug = `${fSlug}-copy-${Date.now().toString(36)}`
    const r = await aPost('/api/admin/games', { name: `${fName} (Copy)`, slug: newSlug, gameType: fType, hpMax: fHp, xpReward: fXp, description: fDesc || undefined, isActive: true, config: {} })
    const d = await r.json()
    if (r.ok) { showFlash('Хуулагдлаа', 'var(--yellow)'); loadList(); selectGame(d.game.id) }
    else       showFlash('Алдаа гарлаа', 'var(--red)')
  }

  // ── Task pool ───────────────────────────────────────────────────────────
  const searchTasks = useCallback(async (q: string) => {
    if (!q.trim()) { setTaskResults([]); return }
    setTaskLoading(true)
    const r = await aGet(`/api/admin/tasks?search=${encodeURIComponent(q)}&limit=20`)
    const d = await r.json()
    setTaskResults(d.tasks ?? [])
    setTaskLoading(false)
  }, [])

  const onTaskSearchChange = (v: string) => {
    setTaskSearch(v)
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => searchTasks(v), 350)
  }

  const handleAddTask = async (taskId: string) => {
    if (!selectedId || selectedId === '__new__') return
    setAddingTask(true)
    const r = await aPost(`/api/admin/games/${selectedId}/tasks`, { taskId })
    setAddingTask(false)
    if (!r.ok) { const d = await r.json(); return showFlash(d.error ?? 'Алдаа', 'var(--red)') }
    showFlash('Task нэмэгдлээ', 'var(--cyan)')
    loadDetail(selectedId)
    setPreviewTotal(t => t + 1)
  }

  const handleRemoveTask = async (taskId: string) => {
    if (!selectedId || selectedId === '__new__') return
    const r = await aDel(`/api/admin/games/${selectedId}/tasks/${taskId}`)
    if (!r.ok) return showFlash('Алдаа гарлаа', 'var(--red)')
    showFlash('Task хасагдлаа', 'var(--yellow)')
    loadDetail(selectedId)
    setPreviewTotal(t => Math.max(1, t - 1))
  }

  // ── Attach to lesson ────────────────────────────────────────────────────
  const handleAttachLesson = async () => {
    if (!selectedId || selectedId === '__new__' || !lessonInput.trim()) return
    setAttachingLesson(true)
    const r = await aPost(`/api/admin/lessons/${lessonInput.trim()}/games`, { gameId: selectedId })
    setAttachingLesson(false)
    if (!r.ok) { const d = await r.json(); return showFlash(d.error ?? 'Алдаа гарлаа', 'var(--red)') }
    showFlash('Хичээлд оноогдлоо', 'var(--green)')
    setLessonInput('')
    loadDetail(selectedId)
    loadList()
  }

  const handleDetachLesson = async (lessonId: string) => {
    if (!selectedId || selectedId === '__new__') return
    const r = await aDel(`/api/admin/lessons/${lessonId}/games/${selectedId}`)
    if (!r.ok) return showFlash('Алдаа гарлаа', 'var(--red)')
    showFlash('Хасагдлаа', 'var(--yellow)')
    loadDetail(selectedId)
    loadList()
  }

  const gameTasks: TaskEntry[] = (detail?.gameTasks ?? []).map(gt => ({ ...gt.task, orderIndex: gt.orderIndex }))
  const lessonGames: LessonEntry[] = (detail?.lessonGames ?? [])
  const gt = getGT(fType)

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>

      {/* ══ LEFT PANEL — Game list ══════════════════════════════════════ */}
      <div style={{ width: 240, minWidth: 240, borderRight: '1px solid var(--dim)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
          <div style={{ ...fp, fontSize: 9, color: '#ff6b35', letterSpacing: 2, marginBottom: 8 }}>🎮 GAME STUDIO</div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Хайх..."
            style={{ ...fm, fontSize: 10, padding: '6px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
            onFocus={e => e.currentTarget.style.borderColor = '#ff6b35'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
          />
          {/* Active filter */}
          <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
            {(['active', 'all', 'archived'] as const).map(f => (
              <button key={f} onClick={() => setActiveFilter(f)}
                style={{ ...fp, fontSize: 5, letterSpacing: 1, padding: '3px 7px', cursor: 'pointer', background: activeFilter === f ? '#ff6b3522' : 'transparent', color: activeFilter === f ? '#ff6b35' : 'var(--dim2)', border: `1px solid ${activeFilter === f ? '#ff6b35' : 'var(--dim)'}`, flex: 1 }}>
                {f === 'active' ? 'ON' : f === 'all' ? 'ALL' : 'OFF'}
              </button>
            ))}
          </div>
          {/* Type filter */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 8 }}>
            <button onClick={() => setTypeFilter('')}
              style={{ ...fp, fontSize: 5, padding: '3px 6px', cursor: 'pointer', background: !typeFilter ? 'var(--dim)22' : 'transparent', color: !typeFilter ? 'var(--text)' : 'var(--dim2)', border: `1px solid ${!typeFilter ? 'var(--dim2)' : 'var(--dim)'}` }}>
              ALL
            </button>
            {Object.entries(GAME_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setTypeFilter(typeFilter === k ? '' : k)}
                style={{ ...fp, fontSize: 5, padding: '3px 6px', cursor: 'pointer', background: typeFilter === k ? `${v.col}22` : 'transparent', color: typeFilter === k ? v.col : 'var(--dim2)', border: `1px solid ${typeFilter === k ? v.col + '66' : 'var(--dim)'}` }}>
                {v.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Game list */}
        <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none' }}>
          {listLoading ? (
            <div style={{ ...fp, fontSize: 7, color: 'var(--dim2)', padding: 20, textAlign: 'center' }}>УНШИЖ БАЙНА...</div>
          ) : games.length === 0 ? (
            <div style={{ ...fp, fontSize: 7, color: 'var(--dim2)', padding: 20, textAlign: 'center' }}>Тоглоом олдсонгүй</div>
          ) : (
            games.map(game => {
              const ggt = getGT(game.gameType)
              const active = selectedId === game.id
              return (
                <div key={game.id} onClick={() => selectGame(game.id)}
                  style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--dim)22', background: active ? `${ggt.col}12` : 'transparent', borderLeft: `2px solid ${active ? ggt.col : 'transparent'}`, transition: 'all .12s', opacity: game.isActive ? 1 : 0.55 }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--dim)11' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{ggt.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...fp, fontSize: 7, color: active ? ggt.col : 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{game.name}</div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 3 }}>
                        <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>❤ {game.hpMax}</span>
                        <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>⚡ {game.xpReward}</span>
                        <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>📋 {game._count.gameTasks}</span>
                      </div>
                    </div>
                    {!game.isActive && <span style={{ ...fp, fontSize: 5, color: 'var(--red)' }}>OFF</span>}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* New game button */}
        <div style={{ padding: 12, borderTop: '1px solid var(--dim)', flexShrink: 0 }}>
          <button onClick={handleNew}
            style={{ ...fp, fontSize: 7, width: '100%', padding: '8px', cursor: 'pointer', background: selectedId === '__new__' ? '#ff6b3522' : 'transparent', color: '#ff6b35', border: `1px solid ${selectedId === '__new__' ? '#ff6b35' : '#ff6b3555'}`, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#ff6b3518'; e.currentTarget.style.borderColor = '#ff6b35' }}
            onMouseLeave={e => { if (selectedId !== '__new__') { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#ff6b3555' } }}>
            + NEW GAME
          </button>
        </div>
      </div>

      {/* ══ CENTER PANEL — Builder ══════════════════════════════════════ */}
      {!selectedId ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎮</div>
            <div style={{ ...fp, fontSize: 9, color: 'var(--dim2)' }}>Тоглоом сонгох эсвэл шинэ үүсгэх</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Title bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <span style={{ fontSize: 24 }}>{gt.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ ...fp, fontSize: 12, color: gt.col }}>
                {selectedId === '__new__' ? 'NEW GAME' : fName || 'GAME BUILDER'}
              </div>
              <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', marginTop: 2 }}>
                {selectedId === '__new__' ? 'Шинэ тоглоом үүсгэх' : `/${fSlug}`}
              </div>
            </div>
            {selectedId !== '__new__' && !fActive && (
              <span style={{ ...fp, fontSize: 6, color: 'var(--red)', background: 'var(--red)22', padding: '3px 8px', border: '1px solid var(--red)44' }}>ARCHIVED</span>
            )}
          </div>

          <Flash msg={flash} col={flashCol} />

          {detailLoad ? (
            <div style={{ ...fp, fontSize: 8, color: 'var(--dim2)', padding: 20 }}>УНШИЖ БАЙНА...</div>
          ) : (
            <>
              {/* ── Form ─────────────────────────────────────────── */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {/* Name */}
                <div style={{ gridColumn: '1 / 2' }}>
                  <label style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, display: 'block', marginBottom: 5 }}>GAME NAME</label>
                  <input value={fName} onChange={e => setFName(e.target.value)} placeholder="My Game"
                    style={{ ...fm, fontSize: 11, padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    onFocus={e => e.currentTarget.style.borderColor = gt.col}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
                  />
                </div>
                {/* Slug */}
                <div>
                  <label style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, display: 'block', marginBottom: 5 }}>SLUG</label>
                  <input value={fSlug} onChange={e => setFSlug(e.target.value)} placeholder="my-game"
                    style={{ ...fm, fontSize: 11, padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    onFocus={e => e.currentTarget.style.borderColor = gt.col}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
                  />
                </div>
                {/* GameType */}
                <div>
                  <label style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, display: 'block', marginBottom: 5 }}>GAME TYPE</label>
                  <select value={fType} onChange={e => setFType(e.target.value)}
                    style={{ ...fm, fontSize: 10, padding: '7px 10px', background: 'var(--bg)', border: `1px solid ${gt.col}55`, color: gt.col, outline: 'none', width: '100%', cursor: 'pointer' }}>
                    {Object.entries(GAME_TYPES).map(([k, v]) => (
                      <option key={k} value={k} style={{ color: 'var(--text)', background: 'var(--bg)' }}>
                        {v.icon} {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                {/* HP + XP */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, display: 'block', marginBottom: 5 }}>HP MAX</label>
                    <input type="number" min={1} max={10} value={fHp} onChange={e => setFHp(parseInt(e.target.value) || 1)}
                      style={{ ...fm, fontSize: 11, padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--red)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, display: 'block', marginBottom: 5 }}>XP REWARD</label>
                    <input type="number" min={0} value={fXp} onChange={e => setFXp(parseInt(e.target.value) || 0)}
                      style={{ ...fm, fontSize: 11, padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--yellow)', outline: 'none', width: '100%', boxSizing: 'border-box' }} />
                  </div>
                </div>
                {/* Description */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, display: 'block', marginBottom: 5 }}>DESCRIPTION (OPTIONAL)</label>
                  <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} rows={2} placeholder="Тоглоомын тайлбар..."
                    style={{ ...fm, fontSize: 10, padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none', width: '100%', resize: 'vertical', boxSizing: 'border-box' }}
                    onFocus={e => e.currentTarget.style.borderColor = gt.col}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
                  />
                </div>
                {/* Config JSON */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, display: 'block', marginBottom: 5 }}>CONFIG JSON</label>
                  <textarea value={fCfg} onChange={e => setFCfg(e.target.value)} rows={3}
                    style={{ ...fm, fontSize: 9, padding: '7px 10px', background: '#0d1117', border: '1px solid var(--dim)', color: 'var(--cyan)', outline: 'none', width: '100%', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
                  />
                </div>
                {/* isActive toggle */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div onClick={() => setFActive(v => !v)}
                    style={{ width: 36, height: 18, background: fActive ? 'var(--green)' : 'var(--dim)', cursor: 'pointer', position: 'relative', transition: 'background .2s', boxShadow: fActive ? '0 0 8px var(--green)66' : 'none' }}>
                    <div style={{ position: 'absolute', top: 2, left: fActive ? 18 : 2, width: 14, height: 14, background: 'white', transition: 'left .2s' }} />
                  </div>
                  <span style={{ ...fp, fontSize: 6, color: fActive ? 'var(--green)' : 'var(--red)' }}>
                    {fActive ? 'ACTIVE' : 'ARCHIVED'}
                  </span>
                </div>
              </div>

              {/* ── Action buttons ────────────────────────────── */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Btn label={saving ? 'ХАДГАЛЖ БАЙНА...' : 'ХАДГАЛАХ'} col={gt.col} size="md" disabled={saving} onClick={handleSave} />
                {selectedId !== '__new__' && <>
                  <Btn label="ХУУЛАХ" col="var(--yellow)" onClick={handleDuplicate} />
                  {fActive
                    ? <Btn label="АРХИВЛАХ" col="var(--red)" onClick={handleArchive} />
                    : <Btn label="СЭРГЭЭХ" col="var(--green)" onClick={handleRestore} />
                  }
                </>}
              </div>

              {/* ── Task Pool ──────────────────────────────────── */}
              {selectedId !== '__new__' && (
                <div>
                  <SectionHead label={`TASK POOL — ${gameTasks.length} TASK`} col="var(--cyan)" />

                  {/* Current tasks */}
                  {gameTasks.length === 0 ? (
                    <div style={{ ...fp, fontSize: 7, color: 'var(--dim2)', padding: '10px 0' }}>Task байхгүй байна</div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                      {gameTasks.map(t => (
                        <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--dim)11', border: '1px solid var(--dim)' }}>
                          <span style={{ ...fp, fontSize: 6, color: t.taskType === 'CODE' ? 'var(--cyan)' : 'var(--yellow)', background: t.taskType === 'CODE' ? 'var(--cyan)18' : 'var(--yellow)18', padding: '1px 5px', flexShrink: 0 }}>{t.taskType}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ ...fm, fontSize: 9, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                            {t.lesson && (
                              <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginTop: 2 }}>{t.lesson.course?.title} › {t.lesson.title}</div>
                            )}
                          </div>
                          <span style={{ ...fp, fontSize: 6, color: 'var(--yellow)', flexShrink: 0 }}>⚡{t.xpReward}</span>
                          <Btn label="✕" col="var(--red)" onClick={() => handleRemoveTask(t.id)} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add task search */}
                  <div style={{ marginTop: 8 }}>
                    <input value={taskSearch} onChange={e => onTaskSearchChange(e.target.value)}
                      placeholder="Task хайх (нэр)..."
                      style={{ ...fm, fontSize: 10, padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
                    />
                    {taskLoading && (
                      <div style={{ ...fp, fontSize: 6, color: 'var(--dim2)', padding: '6px 0' }}>ХАЙЖ БАЙНА...</div>
                    )}
                    {taskResults.length > 0 && (
                      <div style={{ border: '1px solid var(--dim)', borderTop: 'none', maxHeight: 200, overflowY: 'auto' }}>
                        {taskResults.map(t => {
                          const alreadyAdded = gameTasks.some(gt => gt.id === t.id)
                          return (
                            <div key={t.id}
                              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderBottom: '1px solid var(--dim)22', opacity: alreadyAdded ? 0.5 : 1 }}>
                              <span style={{ ...fp, fontSize: 5, color: t.taskType === 'CODE' ? 'var(--cyan)' : 'var(--yellow)', flexShrink: 0 }}>{t.taskType}</span>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ ...fm, fontSize: 9, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                                {t.lesson && <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>{t.lesson.title}</div>}
                              </div>
                              <Btn label={alreadyAdded ? '✓' : '+'} col={alreadyAdded ? 'var(--dim)' : 'var(--cyan)'} disabled={alreadyAdded || addingTask} onClick={() => handleAddTask(t.id)} />
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ══ RIGHT PANEL — Live Preview ═════════════════════════════════ */}
      <div style={{ width: 300, minWidth: 300, borderLeft: '1px solid var(--dim)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ ...fp, fontSize: 7, color: '#ff6b35', letterSpacing: 2, padding: '12px 14px 8px', borderBottom: '1px solid var(--dim)', flexShrink: 0 }}>
          LIVE PREVIEW
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 12, scrollbarWidth: 'none' }}>

          {/* Canvas preview */}
          <div style={{ background: '#000', border: `1px solid ${gt.col}44`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ height: 180 }}>
              {selectedId ? (
                <GamePreview
                  state={previewState}
                  gameType={fType}
                  passedCount={previewPassed}
                  totalTasks={previewTotal}
                  taskTitle="PREVIEW MODE"
                />
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', ...fp, fontSize: 7, color: 'var(--dim2)' }}>
                  SELECT GAME
                </div>
              )}
            </div>
            {/* gameType badge */}
            <div style={{ position: 'absolute', top: 6, left: 6, ...fp, fontSize: 5, color: gt.col, background: `${gt.col}22`, border: `1px solid ${gt.col}44`, padding: '2px 6px' }}>
              {gt.icon} {gt.label}
            </div>
          </div>

          {/* State simulator */}
          <div>
            <SectionHead label="STATE SIMULATOR" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {(['idle', 'running', 'correct', 'wrong'] as GameState[]).map(s => (
                <button key={s} onClick={() => setPreviewState(s)}
                  style={{ ...fp, fontSize: 6, padding: '6px', cursor: 'pointer', background: previewState === s ? (s === 'correct' ? 'var(--green)22' : s === 'wrong' ? 'var(--red)22' : s === 'running' ? 'var(--cyan)22' : 'var(--dim)22') : 'transparent', color: previewState === s ? (s === 'correct' ? 'var(--green)' : s === 'wrong' ? 'var(--red)' : s === 'running' ? 'var(--cyan)' : 'var(--text)') : 'var(--dim2)', border: `1px solid ${previewState === s ? (s === 'correct' ? 'var(--green)' : s === 'wrong' ? 'var(--red)' : s === 'running' ? 'var(--cyan)' : 'var(--dim2)') : 'var(--dim)'}`, transition: 'all .15s', letterSpacing: 1 }}>
                  {s.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Progress */}
            <div style={{ marginTop: 10 }}>
              <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 6, letterSpacing: 1 }}>PROGRESS</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button onClick={() => setPreviewPassed(p => Math.max(0, p - 1))}
                  style={{ ...fp, fontSize: 9, padding: '3px 8px', cursor: 'pointer', background: 'transparent', color: 'var(--dim2)', border: '1px solid var(--dim)' }}>−</button>
                <div style={{ flex: 1, textAlign: 'center', ...fp, fontSize: 7, color: 'var(--cyan)' }}>
                  {previewPassed} / {previewTotal}
                </div>
                <button onClick={() => setPreviewPassed(p => Math.min(previewTotal, p + 1))}
                  style={{ ...fp, fontSize: 9, padding: '3px 8px', cursor: 'pointer', background: 'transparent', color: 'var(--cyan)', border: '1px solid var(--cyan)55' }}>+</button>
              </div>
              <div style={{ height: 4, background: 'var(--dim)', marginTop: 6 }}>
                <div style={{ height: '100%', background: 'var(--cyan)', width: `${previewTotal > 0 ? (previewPassed / previewTotal) * 100 : 0}%`, boxShadow: '0 0 6px var(--cyan)88', transition: 'width .2s' }} />
              </div>
            </div>
          </div>

          {/* HP / XP preview */}
          <div>
            <SectionHead label="STATS" />
            <div style={{ display: 'flex', gap: 12 }}>
              <div style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid var(--red)44', background: 'var(--red)11' }}>
                <div style={{ ...fp, fontSize: 14, color: 'var(--red)' }}>{fHp}</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginTop: 3 }}>HP MAX</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid var(--yellow)44', background: 'var(--yellow)11' }}>
                <div style={{ ...fp, fontSize: 14, color: 'var(--yellow)' }}>{fXp}</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginTop: 3 }}>XP</div>
              </div>
              <div style={{ flex: 1, textAlign: 'center', padding: '8px', border: '1px solid var(--cyan)44', background: 'var(--cyan)11' }}>
                <div style={{ ...fp, fontSize: 14, color: 'var(--cyan)' }}>{gameTasks.length}</div>
                <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginTop: 3 }}>TASKS</div>
              </div>
            </div>
          </div>

          {/* Attach to Lesson */}
          {selectedId && selectedId !== '__new__' && (
            <div>
              <SectionHead label="ATTACH TO LESSON" col="var(--green)" />

              {/* Current lessons */}
              {lessonGames.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
                  {lessonGames.map(lg => (
                    <div key={lg.lessonGameId} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: 'var(--green)11', border: '1px solid var(--green)33' }}>
                      <span style={{ fontSize: 12 }}>📚</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...fp, fontSize: 6, color: 'var(--green)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lg.lesson.title}</div>
                        <div style={{ ...fm, fontSize: 8, color: 'var(--dim2)' }}>{lg.lesson.id.slice(0, 8)}…</div>
                      </div>
                      <button onClick={() => handleDetachLesson(lg.lesson.id)}
                        style={{ ...fp, fontSize: 6, padding: '2px 6px', cursor: 'pointer', background: 'transparent', color: 'var(--red)', border: '1px solid var(--red)44' }}>✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Attach form */}
              <div style={{ display: 'flex', gap: 6 }}>
                <input value={lessonInput} onChange={e => setLessonInput(e.target.value)}
                  placeholder="Lesson ID..."
                  style={{ ...fm, fontSize: 9, flex: 1, padding: '6px 8px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--green)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
                  onKeyDown={e => e.key === 'Enter' && handleAttachLesson()}
                />
                <Btn label={attachingLesson ? '...' : '+'} col="var(--green)" disabled={!lessonInput.trim() || attachingLesson} onClick={handleAttachLesson} />
              </div>
              <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginTop: 5 }}>
                Хичээлийн ID оруулан Enter эсвэл + дар
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
