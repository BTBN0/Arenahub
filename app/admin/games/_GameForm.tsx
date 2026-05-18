'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

// ── Types ──────────────────────────────────────────────
export type GameFormData = {
  name:        string
  slug:        string
  gameType:    string
  description: string
  thumbnail:   string
  hpMax:       string
  xpReward:    string
  isActive:    boolean
  config:      string   // raw JSON string
}

export type GameFormProps = {
  mode:         'create' | 'edit'
  gameId?:      string
  initial?:     Partial<GameFormData>
  onSave:       (data: GameFormData) => Promise<{ ok: boolean; error?: string }>
}

// ── Game type options ──────────────────────────────────
const GAME_TYPE_OPTIONS = [
  { value: 'city',        icon: '🏙', label: 'City Build'   },
  { value: 'island',      icon: '🏝', label: 'Island'       },
  { value: 'castle',      icon: '🏰', label: 'Castle'       },
  { value: 'kingdom',     icon: '👑', label: 'Kingdom'      },
  { value: 'timemachine', icon: '⏱', label: 'Time Machine' },
  { value: 'megacity',    icon: '🌆', label: 'Mega City'    },
  { value: 'enemy',       icon: '👾', label: 'Enemy Raid'   },
  { value: 'quiz',        icon: '❓', label: 'Quiz Arena'   },
  { value: 'code',        icon: '💻', label: 'Code Editor'  },
]

const GAME_COLORS: Record<string, string> = {
  city: '#ffe600', island: '#00e5ff', castle: '#ff6b35', kingdom: '#ffd700',
  timemachine: '#00ffff', megacity: '#ff00ff', enemy: '#ff3333', quiz: '#a855f7', code: '#22d3ee',
}
const getCol = (t: string) => GAME_COLORS[t] ?? '#ff6b35'

// ── Slug generator ─────────────────────────────────────
const toSlug = (s: string) => s.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-').replace(/^-|-$/g, '')

// ── Mini components ────────────────────────────────────
function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return <div style={{ padding: '9px 14px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 12 }}>{msg}</div>
}

function Field({ label, value, onChange, placeholder, type = 'text', options, rows = 3, hint }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
  type?: string; options?: { value: string; label: string; icon?: string }[]; rows?: number; hint?: string
}) {
  const base: React.CSSProperties = { width: '100%', padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', boxSizing: 'border-box' }
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
      {type === 'select' ? (
        <select value={value} onChange={e => onChange(e.target.value)} style={base}>
          {(options ?? []).map(o => <option key={o.value} value={o.value}>{o.icon ? `${o.icon} ` : ''}{o.label}</option>)}
        </select>
      ) : type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
          style={{ ...base, resize: 'vertical' }}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} type={type}
          style={base}
          onFocus={e => e.currentTarget.style.borderColor = 'var(--cyan)'}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      )}
      {hint && <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', marginTop: 3 }}>{hint}</div>}
    </div>
  )
}

function Toggle({ label, checked, onChange, col }: { label: string; checked: boolean; onChange: (v: boolean) => void; col?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
      <div
        onClick={() => onChange(!checked)}
        style={{ width: 36, height: 20, background: checked ? (col ?? 'var(--cyan)') : 'var(--dim)', borderRadius: 10, position: 'relative', cursor: 'pointer', transition: 'background .2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: checked ? 19 : 3, width: 14, height: 14, background: '#fff', borderRadius: '50%', transition: 'left .2s' }} />
      </div>
      <span style={{ ...fp, fontSize: 7, color: checked ? (col ?? 'var(--cyan)') : 'var(--dim2)', letterSpacing: 1 }}>{label}</span>
    </div>
  )
}

// ── JSON Config Editor ─────────────────────────────────
function ConfigEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [error, setError] = useState('')
  const [formatted, setFormatted] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const validate = (v: string) => {
    if (!v.trim()) { setError(''); return }
    try { JSON.parse(v); setError('') }
    catch (e: unknown) { setError((e as Error).message) }
  }

  const format = () => {
    try {
      const parsed = JSON.parse(value)
      const pretty = JSON.stringify(parsed, null, 2)
      onChange(pretty)
      setFormatted(true)
      setTimeout(() => setFormatted(false), 1200)
      setError('')
    } catch { setError('JSON формат буруу байна') }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1 }}>CONFIG JSON</div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {error && <span style={{ ...fm, fontSize: 9, color: 'var(--red)' }}>⚠ {error}</span>}
          {!error && value.trim() && <span style={{ ...fm, fontSize: 9, color: 'var(--green)' }}>✓ VALID</span>}
          <button onClick={format}
            style={{ ...fp, fontSize: 5, padding: '3px 8px', background: formatted ? 'var(--cyan)22' : 'transparent', color: formatted ? 'var(--cyan)' : 'var(--dim2)', border: `1px solid ${formatted ? 'var(--cyan)' : 'var(--dim)'}`, cursor: 'pointer', letterSpacing: 1 }}>
            {formatted ? '✓ FORMATTED' : 'FORMAT'}
          </button>
        </div>
      </div>
      <textarea
        ref={taRef}
        value={value}
        onChange={e => { onChange(e.target.value); validate(e.target.value) }}
        rows={10}
        placeholder={'{\n  "bgColor": "#1a1a2e",\n  "particleColor": "#ffe600"\n}'}
        spellCheck={false}
        style={{ width: '100%', padding: '10px 12px', background: '#0a0a0f', border: `1px solid ${error ? 'var(--red)' : 'var(--dim)'}`, color: error ? '#ff9999' : '#a8ff78', fontFamily: 'monospace', fontSize: 12, outline: 'none', boxSizing: 'border-box', resize: 'vertical', lineHeight: 1.6 }}
        onFocus={e => { if (!error) e.currentTarget.style.borderColor = 'var(--cyan)' }}
        onBlur={e => { if (!error) e.currentTarget.style.borderColor = 'var(--dim)' }}
      />
      <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', marginTop: 4 }}>
        Тоглоомын тохиргоо: bgColor, particleColor, musicUrl, гэх мэт
      </div>
    </div>
  )
}

// ── Default config presets ─────────────────────────────
const CONFIG_PRESETS: Record<string, Record<string, unknown>> = {
  city:        { bgColor: '#1a1a2e', groundColor: '#16213e', particleColor: '#ffe600' },
  island:      { bgColor: '#0d1b2a', waterColor: '#1e90ff', particleColor: '#00e5ff' },
  castle:      { bgColor: '#1a0a2e', wallColor: '#8b6914', particleColor: '#ff6b35' },
  kingdom:     { bgColor: '#0a1628', particleColor: '#ffd700' },
  timemachine: { bgColor: '#0d0d1a', particleColor: '#00ffff' },
  megacity:    { bgColor: '#050510', particleColor: '#ff00ff' },
  enemy:       { bgColor: '#1a0000', particleColor: '#ff3333' },
  quiz:        {},
  code:        { language: 'javascript' },
}

// ── Main form ──────────────────────────────────────────
export default function GameForm({ mode, gameId, initial, onSave }: GameFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<GameFormData>({
    name:        initial?.name        ?? '',
    slug:        initial?.slug        ?? '',
    gameType:    initial?.gameType    ?? 'quiz',
    description: initial?.description ?? '',
    thumbnail:   initial?.thumbnail   ?? '',
    hpMax:       initial?.hpMax       ?? '3',
    xpReward:    initial?.xpReward    ?? '50',
    isActive:    initial?.isActive    ?? true,
    config:      initial?.config      ?? '{}',
  })
  const [slugManual, setSlugManual] = useState(!!initial?.slug)
  const [saving,  setSaving]  = useState(false)
  const [flash,   setFlash]   = useState('')
  const [flashCol,setFlashCol]= useState('var(--cyan)')

  const showFlash = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3500)
  }

  // Auto-slug from name
  const setField = <K extends keyof GameFormData>(k: K, v: GameFormData[K]) => {
    setForm(prev => {
      const next = { ...prev, [k]: v }
      if (k === 'name' && !slugManual) next.slug = toSlug(v as string)
      if (k === 'gameType') {
        const preset = CONFIG_PRESETS[v as string]
        if (preset !== undefined && (!prev.config || prev.config === '{}' || !prev.config.trim())) {
          next.config = JSON.stringify(preset, null, 2)
        }
      }
      return next
    })
  }

  // When gameType changes, offer preset config if config is empty
  useEffect(() => {
    if (!form.config || form.config.trim() === '{}') {
      const preset = CONFIG_PRESETS[form.gameType]
      if (preset) setForm(prev => ({ ...prev, config: JSON.stringify(preset, null, 2) }))
    }
  }, [form.gameType]) // eslint-disable-line react-hooks/exhaustive-deps

  const validate = () => {
    if (!form.name.trim())    return 'Нэр оруулна уу'
    if (!form.slug.trim())    return 'Slug оруулна уу'
    if (!/^[a-z0-9-]+$/.test(form.slug)) return 'Slug: зөвхөн жижиг үсэг, тоо, зураас'
    if (!form.gameType)       return 'Тоглоомын төрөл сонгоно уу'
    if (Number(form.hpMax) < 1 || Number(form.hpMax) > 10) return 'HP: 1-10'
    if (Number(form.xpReward) < 0) return 'XP 0-аас их байна'
    if (form.config.trim()) {
      try { JSON.parse(form.config) } catch { return 'Config JSON формат буруу' }
    }
    return null
  }

  const handleSave = async () => {
    const err = validate()
    if (err) { showFlash(err, 'var(--red)'); return }
    setSaving(true)
    const res = await onSave(form)
    setSaving(false)
    if (res.ok) {
      showFlash('Хадгалагдлаа ✓', 'var(--green)')
      setTimeout(() => router.push('/admin/games'), 1000)
    } else {
      showFlash(res.error ?? 'Алдаа гарлаа', 'var(--red)')
    }
  }

  const accentCol = getCol(form.gameType)
  const gtOpt = GAME_TYPE_OPTIONS.find(o => o.value === form.gameType)

  return (
    <div style={{ padding: 24, maxWidth: 900 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push('/admin/games')}
          style={{ ...fp, fontSize: 7, color: 'var(--dim2)', background: 'transparent', border: '1px solid var(--dim)', padding: '5px 10px', cursor: 'pointer' }}>
          ← БУЦАХ
        </button>
        <div>
          <div style={{ ...fp, fontSize: 14, color: accentCol, letterSpacing: 2 }}>
            {mode === 'create' ? '+ NEW GAME' : `✏ EDIT — ${form.name || '...'}`}
          </div>
          {mode === 'edit' && gameId && (
            <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', marginTop: 2 }}>
              ID: {gameId}
            </div>
          )}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button onClick={() => router.push('/admin/games')}
            style={{ ...fp, fontSize: 7, color: 'var(--dim2)', background: 'transparent', border: '1px solid var(--dim)', padding: '6px 14px', cursor: 'pointer' }}>
            ЦУЦЛАХ
          </button>
          <button onClick={handleSave} disabled={saving}
            style={{ ...fp, fontSize: 7, letterSpacing: 1, color: accentCol, background: `${accentCol}18`, border: `1px solid ${accentCol}66`, padding: '6px 18px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
            {saving ? 'ХАДГАЛЖ БАЙНА...' : '✓ ХАДГАЛАХ'}
          </button>
        </div>
      </div>

      <Flash msg={flash} col={flashCol} />

      {/* Game type preview strip */}
      {gtOpt && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: `${accentCol}0d`, border: `1px solid ${accentCol}33`, marginBottom: 20 }}>
          <span style={{ fontSize: 28 }}>{gtOpt.icon}</span>
          <div>
            <div style={{ ...fp, fontSize: 10, color: accentCol, letterSpacing: 1 }}>{gtOpt.label}</div>
            <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)' }}>gameType: {form.gameType}</div>
          </div>
          <Toggle label="ACTIVE" checked={form.isActive} onChange={v => setField('isActive', v)} col={accentCol} />
        </div>
      )}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Left column */}
        <div>
          <div style={{ ...fp, fontSize: 6, color: 'var(--dim2)', letterSpacing: 2, marginBottom: 12, borderBottom: '1px solid var(--dim)', paddingBottom: 6 }}>ТОГЛООМЫН МЭДЭЭЛЭЛ</div>

          <Field label="НЭР *" value={form.name} onChange={v => setField('name', v)} placeholder="City Builder" />

          <div style={{ marginBottom: 14 }}>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, marginBottom: 4 }}>SLUG *</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={form.slug} onChange={e => { setSlugManual(true); setField('slug', e.target.value) }} placeholder="city-builder"
                style={{ flex: 1, padding: '8px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none' }}
                onFocus={e => e.currentTarget.style.borderColor = accentCol}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
              <button onClick={() => { setField('slug', toSlug(form.name)); setSlugManual(false) }}
                style={{ ...fp, fontSize: 5, padding: '5px 8px', background: 'transparent', color: 'var(--dim2)', border: '1px solid var(--dim)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                AUTO
              </button>
            </div>
            <div style={{ ...fm, fontSize: 9, color: 'var(--dim2)', marginTop: 3 }}>URL-д ашиглагдана · жижиг үсэг, тоо, зураас</div>
          </div>

          <Field label="ТОГЛООМЫН ТӨРӨЛ *" value={form.gameType} onChange={v => setField('gameType', v)} type="select"
            options={GAME_TYPE_OPTIONS.map(o => ({ value: o.value, label: o.label, icon: o.icon }))} />

          <Field label="ТАЙЛБАР" value={form.description} onChange={v => setField('description', v)}
            placeholder="Тоглоомын тайлбар..." type="textarea" rows={3} />

          <Field label="THUMBNAIL URL" value={form.thumbnail} onChange={v => setField('thumbnail', v)}
            placeholder="https://..." hint="Тоглоомын жижиг зураг (optional)" />
        </div>

        {/* Right column */}
        <div>
          <div style={{ ...fp, fontSize: 6, color: 'var(--dim2)', letterSpacing: 2, marginBottom: 12, borderBottom: '1px solid var(--dim)', paddingBottom: 6 }}>ТОГЛООМЫН ТОХИРГОО</div>

          {/* HP & XP row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 0 }}>
            <Field label="HP MAX" value={form.hpMax} onChange={v => setField('hpMax', v)} type="number"
              placeholder="3" hint="1–10" />
            <Field label="XP REWARD" value={form.xpReward} onChange={v => setField('xpReward', v)} type="number"
              placeholder="50" hint="0–9999" />
          </div>

          {/* HP visual preview */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 14, padding: '8px 12px', background: 'var(--bg)', border: '1px solid var(--dim)' }}>
            {Array.from({ length: Math.min(Number(form.hpMax) || 3, 10) }).map((_, i) => (
              <span key={i} style={{ fontSize: 14 }}>❤️</span>
            ))}
            <span style={{ ...fp, fontSize: 7, color: 'var(--dim2)', alignSelf: 'center', marginLeft: 4 }}>
              PREVIEW
            </span>
          </div>

          {/* Config JSON editor */}
          <ConfigEditor value={form.config} onChange={v => setField('config', v)} />

          {/* Config presets */}
          <div style={{ marginTop: 8 }}>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1, marginBottom: 6 }}>PRESET CONFIG</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {Object.entries(CONFIG_PRESETS).filter(([k]) => k === form.gameType).map(([k, v]) => (
                <button key={k} onClick={() => setField('config', JSON.stringify(v, null, 2))}
                  style={{ ...fp, fontSize: 5, padding: '3px 8px', background: `${accentCol}18`, color: accentCol, border: `1px solid ${accentCol}44`, cursor: 'pointer' }}>
                  ⚡ {k.toUpperCase()} PRESET
                </button>
              ))}
              <button onClick={() => setField('config', '{}')}
                style={{ ...fp, fontSize: 5, padding: '3px 8px', background: 'transparent', color: 'var(--dim2)', border: '1px solid var(--dim)', cursor: 'pointer' }}>
                CLEAR
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom save bar */}
      <div style={{ marginTop: 28, paddingTop: 16, borderTop: '1px solid var(--dim)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={() => router.push('/admin/games')}
          style={{ ...fp, fontSize: 7, color: 'var(--dim2)', background: 'transparent', border: '1px solid var(--dim)', padding: '8px 20px', cursor: 'pointer' }}>
          ЦУЦЛАХ
        </button>
        {mode === 'edit' && gameId && (
          <button onClick={() => router.push(`/admin/games/${gameId}/tasks`)}
            style={{ ...fp, fontSize: 7, color: 'var(--cyan)', background: 'var(--cyan)11', border: '1px solid var(--cyan)55', padding: '8px 20px', cursor: 'pointer' }}>
            📋 TASK POOL
          </button>
        )}
        <button onClick={handleSave} disabled={saving}
          style={{ ...fp, fontSize: 7, letterSpacing: 1, color: accentCol, background: `${accentCol}18`, border: `1px solid ${accentCol}66`, padding: '8px 24px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
          {saving ? 'ХАДГАЛЖ БАЙНА...' : mode === 'create' ? '✓ ҮҮСГЭХ' : '✓ ХАДГАЛАХ'}
        </button>
      </div>
    </div>
  )
}
