'use client'
import { useEffect, useState } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` })

type Achievement = {
  id: string; title: string; description: string; icon: string
  xpReward: number; condition: string; type: string; rarity: string
  rewardType: string; rewardAmount: number; createdAt: string
}

const RARITY_COL: Record<string, string> = {
  EPIC: 'var(--cyan)', RARE: 'var(--purple)', COMMON: 'var(--yellow)',
}

function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return <div style={{ padding: '9px 14px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 14 }}>{msg}</div>
}

function Btn({ label, col = 'var(--cyan)', onClick, disabled = false, size = 'sm' }:
  { label: string; col?: string; onClick?: () => void; disabled?: boolean; size?: 'sm'|'md' }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...fp, fontSize: 6, letterSpacing: 1, padding: size === 'md' ? '8px 20px' : '5px 10px',
      cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent',
      color: disabled ? 'var(--dim)' : col, border: `1px solid ${disabled ? 'var(--dim)' : col + '55'}`,
      transition: 'all .15s', opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap',
    }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = `${col}18`; (e.currentTarget as HTMLButtonElement).style.borderColor = col } }}
      onMouseLeave={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = `${col}55` } }}>
      {label}
    </button>
  )
}

export default function AdminAchievementsPage() {
  const [achs, setAchs]     = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [flash, setFlash]   = useState('')
  const [flashCol, setFlashCol] = useState('var(--cyan)')
  const [seeding, setSeeding] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [icon, setIcon]       = useState('🏆')
  const [title, setTitle]     = useState('')
  const [desc, setDesc]       = useState('')
  const [cond, setCond]       = useState('')
  const [xp, setXp]           = useState('0')
  const [type, setType]       = useState('PROGRESSION_BASED')
  const [rarity, setRarity]   = useState('COMMON')
  const [rewType, setRewType] = useState('XP')
  const [rewAmt, setRewAmt]   = useState('0')
  const [saving, setSaving]   = useState(false)

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 4000)
  }

  const load = () => {
    setLoading(true)
    fetch('/api/achievements?list=all', { headers: authH() })
      .then(r => r.json())
      .then(d => setAchs(d.achievements ?? []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const seedDefaults = async () => {
    setSeeding(true)
    const r = await fetch('/api/admin/seed-achievements', { method: 'POST', headers: authH() })
    const d = await r.json()
    setSeeding(false)
    if (r.ok) { notify(d.message, 'var(--green)'); load() }
    else notify(d.error ?? 'Алдаа', 'var(--red)')
  }

  const createAch = async () => {
    if (!title || !cond) return notify('Title болон condition шаардлагатай', 'var(--red)')
    setSaving(true)
    const r = await fetch('/api/achievements', {
      method: 'POST', headers: authH(),
      body: JSON.stringify({ title, description: desc, icon, xpReward: +xp, condition: cond, type, rarity, rewardType: rewType, rewardAmount: +rewAmt }),
    })
    const d = await r.json()
    setSaving(false)
    if (r.ok) {
      notify('Achievement үүсгэгдлээ', 'var(--green)')
      setTitle(''); setDesc(''); setCond(''); setXp('0'); setRewAmt('0'); setShowForm(false)
      load()
    } else notify(d.error ?? 'Алдаа', 'var(--red)')
  }

  const delAch = async (id: string) => {
    if (!confirm('Устгах уу?')) return
    const r = await fetch(`/api/achievements/${id}`, { method: 'DELETE', headers: authH() })
    if (r.ok) { notify('Устгагдлаа', 'var(--red)'); load() }
  }

  const RARITY_ORDER = ['EPIC','RARE','COMMON']
  const grouped = RARITY_ORDER.reduce((acc, r) => {
    acc[r] = achs.filter(a => a.rarity === r)
    return acc
  }, {} as Record<string, Achievement[]>)

  const inputStyle = { width: '100%', padding: '7px 10px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 12, outline: 'none', boxSizing: 'border-box' as const }
  const labelStyle = { ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 5, display: 'block' as const }

  return (
    <div style={{ padding: '28px 36px', minHeight: '100%' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div>
          <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · ACHIEVEMENTS</div>
          <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
            ACHIEVEMENTS <span style={{ fontSize: 8, color: 'var(--yellow)' }}>🏆</span>
          </h1>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Btn label={seeding ? 'SEED...' : '⚡ SEED DEFAULTS'} col='var(--green)'  onClick={seedDefaults} disabled={seeding} size='md' />
          <Btn label={showForm ? 'ХААХ' : '+ НЭМЭХ'}           col='var(--yellow)' onClick={() => setShowForm(f => !f)}        size='md' />
        </div>
      </div>

      <Flash msg={flash} col={flashCol} />

      {/* Create form */}
      {showForm && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--yellow)33', padding: '20px 22px', marginBottom: 22 }}>
          <div style={{ ...fp, fontSize: 7, color: 'var(--yellow)', letterSpacing: 2, marginBottom: 16 }}>ШИНЭ ACHIEVEMENT</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 12 }}>
            <div>
              <span style={labelStyle}>ICON</span>
              <input value={icon} onChange={e => setIcon(e.target.value)} style={{ ...inputStyle, width: 60 }} />
            </div>
            <div style={{ gridColumn: '2 / 4' }}>
              <span style={labelStyle}>TITLE *</span>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder='Achievement нэр...' style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <span style={labelStyle}>DESCRIPTION</span>
              <input value={desc} onChange={e => setDesc(e.target.value)} placeholder='Тайлбар...' style={inputStyle} />
            </div>
            <div>
              <span style={labelStyle}>CONDITION *</span>
              <input value={cond} onChange={e => setCond(e.target.value)} placeholder='passedTasks >= 10' style={inputStyle} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 12, marginBottom: 16 }}>
            <div>
              <span style={labelStyle}>TYPE</span>
              <select value={type} onChange={e => setType(e.target.value)} style={{ ...inputStyle }}>
                <option value='PROGRESSION_BASED'>PROGRESSION</option>
                <option value='SKILL_BASED'>SKILL</option>
                <option value='PERFORMANCE_BASED'>PERFORMANCE</option>
                <option value='BEHAVIOR_BASED'>BEHAVIOR</option>
              </select>
            </div>
            <div>
              <span style={labelStyle}>RARITY</span>
              <select value={rarity} onChange={e => setRarity(e.target.value)} style={{ ...inputStyle }}>
                <option value='COMMON'>COMMON</option>
                <option value='RARE'>RARE</option>
                <option value='EPIC'>EPIC</option>
              </select>
            </div>
            <div>
              <span style={labelStyle}>XP REWARD</span>
              <input type='number' value={xp} onChange={e => setXp(e.target.value)} style={inputStyle} />
            </div>
            <div>
              <span style={labelStyle}>REWARD TYPE</span>
              <select value={rewType} onChange={e => setRewType(e.target.value)} style={{ ...inputStyle }}>
                <option value='XP'>XP</option>
                <option value='TOKEN'>TOKEN</option>
                <option value='COIN'>COIN</option>
                <option value='BADGE'>BADGE</option>
              </select>
            </div>
            <div>
              <span style={labelStyle}>AMOUNT</span>
              <input type='number' value={rewAmt} onChange={e => setRewAmt(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 12 }}>
            Condition variables: passedTasks · completedLessons · level · totalXp · streakDays · aiUsage · noErrorRun · hintUsed
          </div>
          <Btn label={saving ? 'ХАДГАЛЖ...' : 'ХАДГАЛАХ'} col='var(--yellow)' onClick={createAch} disabled={saving} size='md' />
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 22 }}>
        {RARITY_ORDER.map(r => (
          <div key={r} style={{ background: 'var(--bg2)', border: `1px solid ${RARITY_COL[r]}22`, padding: '14px 18px' }}>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2, marginBottom: 6 }}>{r}</div>
            <div style={{ ...fp, fontSize: 16, color: RARITY_COL[r] }}>{grouped[r]?.length ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Grouped list */}
      {loading ? (
        <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', textAlign: 'center', padding: '32px 0' }}>Уншиж байна...</div>
      ) : (
        RARITY_ORDER.map(r => {
          if (!grouped[r]?.length) return null
          const col = RARITY_COL[r]
          return (
            <div key={r} style={{ marginBottom: 24 }}>
              <div style={{ ...fp, fontSize: 7, color: col, letterSpacing: 2, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                {r}
                <span style={{ fontSize: 5, color: 'var(--dim2)', ...fp }}>({grouped[r].length})</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 8 }}>
                {grouped[r].map(a => (
                  <div key={a.id} style={{ background: 'var(--bg)', border: `1px solid ${col}22`, padding: '14px 16px', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...fp, fontSize: 7, color: col, marginBottom: 3 }}>{a.title}</div>
                        <div style={{ ...fm, fontSize: 10, color: 'var(--dim2)', marginBottom: 6 }}>{a.description}</div>
                        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 4 }}>
                          <span style={{ color: 'var(--green)' }}>{a.condition}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {a.xpReward > 0 && <span style={{ ...fp, fontSize: 4, color: 'var(--yellow)' }}>+{a.xpReward} XP</span>}
                          {a.rewardAmount > 0 && <span style={{ ...fp, fontSize: 4, color: 'var(--cyan)' }}>+{a.rewardAmount} {a.rewardType}</span>}
                          <button onClick={() => delAch(a.id)} style={{ ...fp, fontSize: 4, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 'auto', padding: '0 4px' }}>
                            ✕
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}