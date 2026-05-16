'use client'
import { useEffect, useState } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

import { adminFetch } from '@/lib/admin-fetch'

type UsageStat = { label: string; value: string | number; col: string }

export default function AdminAIPage() {
  const [stats, setStats]     = useState<UsageStat[]>([])
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt]   = useState('')
  const [saving, setSaving]   = useState(false)
  const [flash, setFlash]     = useState('')
  const [flashCol, setFlashCol] = useState('var(--cyan)')

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3500)
  }

  useEffect(() => {
    Promise.all([
      adminFetch('/api/admin/stats?type=usage').then(r => r.json()),
      adminFetch('/api/admin/config').then(r => r.json()),
    ]).then(([s, cfg]) => {
      setStats([
        { label: 'НИЙТ ХЭРЭГЛЭГЧ',  value: s.stats?.totalUsers       ?? '—', col: 'var(--cyan)'   },
        { label: 'НИЙТ TASK',        value: s.stats?.totalTasks        ?? '—', col: 'var(--green)'  },
        { label: 'НИЙТ SUBMISSION',  value: s.stats?.totalSubmissions  ?? '—', col: 'var(--yellow)' },
        { label: 'AVG PASS RATE',    value: `${s.stats?.avgPassRate    ?? 0}%`, col: 'var(--purple)' },
      ])
      setPrompt(cfg.aiPrompt ?? '')
    }).finally(() => setLoading(false))
  }, [])

  const savePrompt = async () => {
    setSaving(true)
    const r = await adminFetch('/api/admin/config', {method: 'PUT', 
      body: JSON.stringify({ ai_prompt: prompt}),
    })
    setSaving(false)
    const d = await r.json()
    if (r.ok) notify(d.message ?? 'Хадгалагдлаа', 'var(--green)')
    else notify(d.error ?? 'Алдаа гарлаа', 'var(--red)')
  }

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · AI SYSTEM</div>
        <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
          AI SYSTEM CONFIG <span style={{ fontSize: 8, color: 'var(--purple)' }}>◈</span>
        </h1>
      </div>

      {flash && (
        <div style={{ padding: '9px 14px', background: `${flashCol}11`, border: `1px solid ${flashCol}33`, ...fp, fontSize: 7, color: flashCol, marginBottom: 16 }}>{flash}</div>
      )}

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Left: System Prompt editor */}
        <div style={{ flex: 1.4 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--purple)33', padding: '20px 22px', marginBottom: 16 }}>
            <div style={{ ...fp, fontSize: 7, color: 'var(--purple)', letterSpacing: 2, marginBottom: 14 }}>SYSTEM PROMPT</div>
            {loading ? (
              <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)' }}>Уншиж байна...</div>
            ) : (
              <>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  rows={14}
                  style={{ width: '100%', padding: '12px 14px', background: 'var(--bg)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 11, outline: 'none', resize: 'vertical', boxSizing: 'border-box', lineHeight: 1.6 }}
                  placeholder="You are a helpful AI assistant for ArenaCodes..."
                />
                <div style={{ marginTop: 10, display: 'flex', gap: 10, alignItems: 'center' }}>
                  <button onClick={savePrompt} disabled={saving}
                    style={{ ...fp, fontSize: 6, letterSpacing: 1, padding: '8px 20px', cursor: saving ? 'not-allowed' : 'pointer', background: saving ? 'transparent' : 'var(--purple)18', color: saving ? 'var(--dim)' : 'var(--purple)', border: `1px solid ${saving ? 'var(--dim)' : 'var(--purple)'}`, opacity: saving ? 0.5 : 1 }}>
                    {saving ? 'ХАДГАЛЖ...' : 'ХАДГАЛАХ'}
                  </button>
                  <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>DB-д хадгалагдана · /api/admin/config</span>
                </div>
              </>
            )}
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--cyan)22', padding: '20px 22px' }}>
            <div style={{ ...fp, fontSize: 7, color: 'var(--cyan)', letterSpacing: 2, marginBottom: 14 }}>ГОРИМ ТАЙЛБАР</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { mode: 'USER MODE',  col: 'var(--cyan)',   desc: 'Хэрэглэгч бодлого шийдэхэд алхмаар чиглүүлнэ. Шууд хариулт өгөхгүй, зөвхөн hint, псевдокод.' },
                { mode: 'ADMIN MODE', col: 'var(--yellow)', desc: 'Admin үйлдлийн keyword (нэмэх, устгах, ban, хэрэглэгч гэх мэт) илрүүлэхэд идэвхждэг. Товч тайлбар өгнө.' },
              ].map(m => (
                <div key={m.mode} style={{ padding: '12px 14px', background: 'var(--bg)', border: `1px solid ${m.col}22` }}>
                  <div style={{ ...fp, fontSize: 6, color: m.col, marginBottom: 6 }}>{m.mode}</div>
                  <div style={{ ...fm, fontSize: 11, color: 'var(--dim2)' }}>{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Stats + Model info */}
        <div style={{ flex: 1 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '20px 22px', marginBottom: 16 }}>
            <div style={{ ...fp, fontSize: 7, color: 'var(--dim2)', letterSpacing: 2, marginBottom: 14 }}>PLATFORM STATS</div>
            {loading ? (
              <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)' }}>Уншиж байна...</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg)', border: `1px solid ${s.col}22` }}>
                    <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 1 }}>{s.label}</span>
                    <span style={{ ...fp, fontSize: 11, color: s.col }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '20px 22px' }}>
            <div style={{ ...fp, fontSize: 7, color: 'var(--dim2)', letterSpacing: 2, marginBottom: 14 }}>AI ТОХИРГОО</div>
            {[
              { label: 'PROVIDER',   value: 'Groq API',                col: 'var(--cyan)'   },
              { label: 'MODEL',      value: 'llama-3.3-70b-versatile', col: 'var(--green)'  },
              { label: 'MAX TOKENS', value: '1024',                    col: 'var(--yellow)' },
              { label: 'ENDPOINT',   value: '/api/ai',                 col: 'var(--purple)' },
            ].map(c => (
              <div key={c.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--dim)' }}>
                <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)' }}>{c.label}</span>
                <span style={{ ...fp, fontSize: 6, color: c.col }}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}