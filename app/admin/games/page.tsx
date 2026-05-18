'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { aGet, aDel } from '@/lib/admin-fetch'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

// ── Types ─────────────────────────────────────────────
type Game = {
  id: string
  name: string
  slug: string
  gameType: string
  description: string | null
  thumbnail: string | null
  hpMax: number
  xpReward: number
  isActive: boolean
  createdAt: string
  _count: { gameTasks: number; lessonGames: number }
}

// ── Game type metadata ─────────────────────────────────
const GAME_TYPES: Record<string, { icon: string; label: string; col: string }> = {
  city:        { icon: '🏙', label: 'CITY BUILD',   col: '#ffe600' },
  island:      { icon: '🏝', label: 'ISLAND',       col: '#00e5ff' },
  castle:      { icon: '🏰', label: 'CASTLE',       col: '#ff6b35' },
  kingdom:     { icon: '👑', label: 'KINGDOM',      col: '#ffd700' },
  timemachine: { icon: '⏱', label: 'TIME MACHINE', col: '#00ffff' },
  megacity:    { icon: '🌆', label: 'MEGA CITY',    col: '#ff00ff' },
  enemy:       { icon: '👾', label: 'ENEMY RAID',   col: '#ff3333' },
  quiz:        { icon: '❓', label: 'QUIZ ARENA',   col: '#a855f7' },
  code:        { icon: '💻', label: 'CODE EDITOR',  col: '#22d3ee' },
}
const getGT = (t: string) => GAME_TYPES[t] ?? { icon: '🎮', label: t.toUpperCase(), col: 'var(--dim2)' }

// ── Mini components ────────────────────────────────────
function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return (
    <div style={{ padding: '9px 14px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 12 }}>
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

// ── Game Card ──────────────────────────────────────────
function GameCard({ game, onEdit, onTasks, onDuplicate, onArchive, onRestore }: {
  game: Game
  onEdit: () => void
  onTasks: () => void
  onDuplicate: () => void
  onArchive: () => void
  onRestore: () => void
}) {
  const gt = getGT(game.gameType)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'var(--bg2,#111)' : 'var(--bg)',
        border: `1px solid ${hovered ? gt.col + '66' : 'var(--dim)'}`,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        transition: 'all .2s',
        position: 'relative',
        opacity: game.isActive ? 1 : 0.6,
      }}>
      {/* Status badge */}
      {!game.isActive && (
        <div style={{ position: 'absolute', top: 8, right: 8, ...fp, fontSize: 5, color: 'var(--red)', background: 'var(--red)22', padding: '2px 6px', border: '1px solid var(--red)44' }}>
          ARCHIVED
        </div>
      )}

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 28, lineHeight: 1, flexShrink: 0 }}>{gt.icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...fp, fontSize: 10, color: gt.col, letterSpacing: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {game.name}
          </div>
          <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', marginTop: 2 }}>
            /{game.slug}
          </div>
        </div>
      </div>

      {/* gameType badge */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <span style={{ ...fp, fontSize: 6, color: gt.col, background: `${gt.col}18`, border: `1px solid ${gt.col}44`, padding: '2px 7px', letterSpacing: 1 }}>
          {gt.label}
        </span>
      </div>

      {/* Description */}
      {game.description && (
        <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {game.description}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: 'flex', gap: 12, borderTop: '1px solid var(--dim)', paddingTop: 8 }}>
        {[
          { label: 'HP',      value: game.hpMax,                icon: '❤️' },
          { label: 'XP',      value: game.xpReward,             icon: '⚡' },
          { label: 'TASKS',   value: game._count.gameTasks,     icon: '📋' },
          { label: 'LESSONS', value: game._count.lessonGames,   icon: '📚' },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{ ...fp, fontSize: 9, color: 'var(--text)' }}>{s.icon} {s.value}</div>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', borderTop: '1px solid var(--dim)', paddingTop: 8 }}>
        <Btn label="EDIT" col={gt.col} onClick={onEdit} />
        <Btn label="TASKS" col="var(--cyan)" onClick={onTasks} />
        <Btn label="DUPE" col="var(--yellow)" onClick={onDuplicate} />
        {game.isActive
          ? <Btn label="ARCHIVE" col="var(--red)" onClick={onArchive} />
          : <Btn label="RESTORE" col="var(--green)" onClick={onRestore} />}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────
export default function AdminGamesPage() {
  const router = useRouter()
  const [games,    setGames]    = useState<Game[]>([])
  const [loading,  setLoading]  = useState(true)
  const [flash,    setFlash]    = useState('')
  const [flashCol, setFlashCol] = useState('var(--cyan)')
  const [search,   setSearch]   = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'archived'>('active')
  const [view,     setView]     = useState<'grid' | 'list'>('grid')

  const showFlash = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3000)
  }

  const load = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search)           params.set('search', search)
    if (typeFilter)       params.set('gameType', typeFilter)
    if (activeFilter !== 'all') params.set('active', activeFilter === 'active' ? 'true' : 'false')
    const r = await aGet(`/api/admin/games?${params}`)
    const d = await r.json()
    setGames(d.games ?? [])
    setLoading(false)
  }, [search, typeFilter, activeFilter])

  useEffect(() => { load() }, [load])

  const handleArchive = async (game: Game) => {
    if (!confirm(`"${game.name}" тоглоомыг архивлах уу?`)) return
    const r = await aDel(`/api/admin/games/${game.id}`)
    if (r.ok) { showFlash('Архивлагдлаа'); load() }
    else       showFlash('Алдаа гарлаа', 'var(--red)')
  }

  const handleRestore = async (game: Game) => {
    const r = await fetch(`/api/admin/games/${game.id}`, {
      method: 'PUT', credentials: 'include',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('arenahub_token') || ''}` },
      body: JSON.stringify({ isActive: true }),
    })
    if (r.ok) { showFlash('Сэргээгдлээ', 'var(--green)'); load() }
    else       showFlash('Алдаа гарлаа', 'var(--red)')
  }

  const handleDuplicate = async (game: Game) => {
    const newSlug = `${game.slug}-copy-${Date.now().toString(36)}`
    const r = await fetch('/api/admin/games', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('arenahub_token') || ''}` },
      body: JSON.stringify({ ...game, name: `${game.name} (Copy)`, slug: newSlug, _count: undefined }),
    })
    if (r.ok) { showFlash('Хуулагдлаа', 'var(--yellow)'); load() }
    else       showFlash('Алдаа гарлаа', 'var(--red)')
  }

  const allTypes = Array.from(new Set(games.map(g => g.gameType)))

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ ...fp, fontSize: 16, color: '#ff6b35', letterSpacing: 2 }}>🎮 GAME MANAGER</div>
          <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)', marginTop: 4 }}>
            {games.length} тоглоом · Дахин ашиглагдах модуль тоглоомуудыг удирдана
          </div>
        </div>
        <Btn label="+ NEW GAME" col="#ff6b35" size="md" onClick={() => router.push('/admin/games/new')} />
      </div>

      <Flash msg={flash} col={flashCol} />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Search */}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Тоглоом хайх..."
          style={{ ...fm, fontSize: 11, padding: '7px 12px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', outline: 'none', width: 200 }}
          onFocus={e => e.currentTarget.style.borderColor = '#ff6b35'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'}
        />

        {/* Active filter */}
        {(['all', 'active', 'archived'] as const).map(f => (
          <button key={f} onClick={() => setActiveFilter(f)}
            style={{ ...fp, fontSize: 6, letterSpacing: 1, padding: '5px 10px', cursor: 'pointer', background: activeFilter === f ? '#ff6b3522' : 'transparent', color: activeFilter === f ? '#ff6b35' : 'var(--dim2)', border: `1px solid ${activeFilter === f ? '#ff6b35' : 'var(--dim)'}`, transition: 'all .15s' }}>
            {f.toUpperCase()}
          </button>
        ))}

        {/* Type filter chips */}
        {allTypes.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button onClick={() => setTypeFilter('')}
              style={{ ...fp, fontSize: 6, padding: '4px 8px', cursor: 'pointer', background: !typeFilter ? 'var(--dim)22' : 'transparent', color: !typeFilter ? 'var(--text)' : 'var(--dim2)', border: `1px solid ${!typeFilter ? 'var(--dim2)' : 'var(--dim)'}` }}>
              ALL
            </button>
            {allTypes.map(t => {
              const gt = getGT(t)
              const active = typeFilter === t
              return (
                <button key={t} onClick={() => setTypeFilter(active ? '' : t)}
                  style={{ ...fp, fontSize: 6, padding: '4px 8px', cursor: 'pointer', background: active ? `${gt.col}22` : 'transparent', color: active ? gt.col : 'var(--dim2)', border: `1px solid ${active ? gt.col + '66' : 'var(--dim)'}` }}>
                  {gt.icon} {gt.label}
                </button>
              )
            })}
          </div>
        )}

        {/* View toggle */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
          {(['grid', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ ...fp, fontSize: 6, padding: '5px 8px', cursor: 'pointer', background: view === v ? '#ff6b3522' : 'transparent', color: view === v ? '#ff6b35' : 'var(--dim2)', border: `1px solid ${view === v ? '#ff6b35' : 'var(--dim)'}` }}>
              {v === 'grid' ? '⊞' : '☰'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ ...fp, fontSize: 9, color: 'var(--dim2)', padding: 40, textAlign: 'center' }}>УНШИЖ БАЙНА...</div>
      ) : games.length === 0 ? (
        <div style={{ ...fp, fontSize: 9, color: 'var(--dim2)', padding: 60, textAlign: 'center', border: '1px dashed var(--dim)' }}>
          🎮 Тоглоом олдсонгүй
          <div style={{ marginTop: 12 }}>
            <Btn label="+ АНХНЫ ТОГЛООМ ҮҮСГЭХ" col="#ff6b35" onClick={() => router.push('/admin/games/new')} />
          </div>
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
          {games.map(game => (
            <GameCard
              key={game.id}
              game={game}
              onEdit={() => router.push(`/admin/games/${game.id}`)}
              onTasks={() => router.push(`/admin/games/${game.id}/tasks`)}
              onDuplicate={() => handleDuplicate(game)}
              onArchive={() => handleArchive(game)}
              onRestore={() => handleRestore(game)}
            />
          ))}
        </div>
      ) : (
        /* List view */
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--dim)' }}>
              {['ТОГЛООМ', 'ТӨРӨЛ', 'HP', 'XP', 'TASKS', 'LESSONS', 'СТАТУС', 'ҮЙЛДЭЛ'].map(h => (
                <th key={h} style={{ ...fp, fontSize: 6, color: 'var(--dim2)', letterSpacing: 1, padding: '6px 10px', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {games.map(game => {
              const gt = getGT(game.gameType)
              return (
                <tr key={game.id} style={{ borderBottom: '1px solid var(--dim)22' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2,#111)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ fontSize: 16 }}>{gt.icon}</span>
                    <span style={{ ...fp, fontSize: 9, color: 'var(--text)', marginLeft: 8 }}>{game.name}</span>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ ...fp, fontSize: 6, color: gt.col, background: `${gt.col}18`, border: `1px solid ${gt.col}44`, padding: '2px 6px' }}>{gt.label}</span>
                  </td>
                  <td style={{ ...fp, fontSize: 9, color: 'var(--text)', padding: '8px 10px' }}>{game.hpMax}</td>
                  <td style={{ ...fp, fontSize: 9, color: 'var(--text)', padding: '8px 10px' }}>{game.xpReward}</td>
                  <td style={{ ...fp, fontSize: 9, color: 'var(--text)', padding: '8px 10px' }}>{game._count.gameTasks}</td>
                  <td style={{ ...fp, fontSize: 9, color: 'var(--text)', padding: '8px 10px' }}>{game._count.lessonGames}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{ ...fp, fontSize: 5, color: game.isActive ? 'var(--green)' : 'var(--red)', background: game.isActive ? 'var(--green)22' : 'var(--red)22', padding: '2px 6px', border: `1px solid ${game.isActive ? 'var(--green)44' : 'var(--red)44'}` }}>
                      {game.isActive ? 'ACTIVE' : 'ARCHIVED'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Btn label="EDIT" col={gt.col} onClick={() => router.push(`/admin/games/${game.id}`)} />
                      <Btn label="TASKS" col="var(--cyan)" onClick={() => router.push(`/admin/games/${game.id}/tasks`)} />
                      {game.isActive
                        ? <Btn label="ARCHIVE" col="var(--red)" onClick={() => handleArchive(game)} />
                        : <Btn label="RESTORE" col="var(--green)" onClick={() => handleRestore(game)} />}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}
