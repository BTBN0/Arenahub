'use client'
import { useEffect, useState } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

import { adminFetch } from '@/lib/admin-fetch'

type Player = { id: string; username: string; xp: number; level: number; avatarUrl?: string }

export default function AdminLeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [limit, setLimit]     = useState(50)
  const [resetting, setResetting] = useState(false)
  const [confirm, setConfirm]     = useState(false)
  const [flash, setFlash]         = useState('')
  const [flashCol, setFlashCol]   = useState('var(--cyan)')

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 3500)
  }

  const resetLeaderboard = async () => {
    setResetting(true); setConfirm(false)
    const r = await adminFetch('/api/admin/leaderboard', {method: 'POST', 
      body: JSON.stringify({ action: 'reset'}),
    })
    const d = await r.json()
    setResetting(false)
    if (r.ok) { notify(d.message ?? 'Reset хийгдлээ', 'var(--green)'); setPlayers([]) }
    else notify(d.error ?? 'Алдаа гарлаа', 'var(--red)')
  }

  useEffect(() => {
    setLoading(true)
    adminFetch(`/api/leaderboard?limit=${limit}`)
      .then(r => r.json())
      .then(d => setPlayers(d.users ?? []))
      .finally(() => setLoading(false))
  }, [limit])

  const rankCol = (i: number) =>
    i === 0 ? 'var(--yellow)' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--dim2)'

  const rankBg = (i: number) =>
    i === 0 ? 'var(--yellow)0a' : i === 1 ? '#c0c0c008' : i === 2 ? '#cd7f3208' : 'transparent'

  const maxXp = players[0]?.xp ?? 1

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      {/* Confirm modal */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: '#00000088', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--red)', padding: '28px 32px', maxWidth: 400, width: '90%' }}>
            <div style={{ ...fp, fontSize: 9, color: 'var(--red)', marginBottom: 10 }}>⚠ XP RESET</div>
            <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)', marginBottom: 8 }}>
              Бүх хэрэглэгчийн <span style={{ color: 'var(--yellow)' }}>XP-г тэглэх</span> гэж байна.
            </div>
            <div style={{ ...fm, fontSize: 12, color: 'var(--green)', marginBottom: 20 }}>
              ✓ Level хэвээр үлдэнэ. Энэ үйлдлийг буцаах боломжгүй.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={resetLeaderboard}
                style={{ ...fp, fontSize: 6, padding: '8px 18px', cursor: 'pointer', background: 'var(--red)22', color: 'var(--red)', border: '1px solid var(--red)' }}>
                ТИЙМ, RESET
              </button>
              <button onClick={() => setConfirm(false)}
                style={{ ...fp, fontSize: 6, padding: '8px 18px', cursor: 'pointer', background: 'transparent', color: 'var(--dim2)', border: '1px solid var(--dim)' }}>
                ЦУЦЛАХ
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 22 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · LEADERBOARD</div>
        {flash && (
          <div style={{ padding: '9px 14px', background: `${flashCol}11`, border: `1px solid ${flashCol}33`, ...fp, fontSize: 7, color: flashCol, marginBottom: 12 }}>{flash}</div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
            LEADERBOARD <span style={{ fontSize: 8, color: 'var(--yellow)' }}>◆</span>
          </h1>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {[10, 25, 50].map(n => (
              <button key={n} onClick={() => setLimit(n)}
                style={{ ...fp, fontSize: 6, padding: '5px 12px', cursor: 'pointer', background: limit === n ? 'var(--yellow)18' : 'transparent', color: limit === n ? 'var(--yellow)' : 'var(--dim2)', border: `1px solid ${limit === n ? 'var(--yellow)' : 'var(--dim)'}` }}>
                TOP {n}
              </button>
            ))}
            <button onClick={() => setConfirm(true)} disabled={resetting}
              style={{ ...fp, fontSize: 6, padding: '5px 14px', cursor: resetting ? 'not-allowed' : 'pointer', background: 'var(--red)11', color: resetting ? 'var(--dim)' : 'var(--red)', border: `1px solid ${resetting ? 'var(--dim)' : 'var(--red)55'}`, opacity: resetting ? 0.5 : 1 }}>
              {resetting ? 'RESET...' : 'RESET LEADERBOARD'}
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 podium */}
      {!loading && players.length >= 3 && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 28, alignItems: 'flex-end', justifyContent: 'center' }}>
          {[1, 0, 2].map(i => {
            const p = players[i]
            const heights = [120, 160, 100]
            const cols = ['#c0c0c0', 'var(--yellow)', '#cd7f32']
            return (
              <div key={p.id} style={{ flex: 1, maxWidth: 180, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ ...fp, fontSize: 20, marginBottom: 4 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                <div style={{ ...fp, fontSize: 7, color: 'var(--text)', marginBottom: 2 }}>{p.username}</div>
                <div style={{ ...fp, fontSize: 6, color: cols[i], marginBottom: 8 }}>{p.xp.toLocaleString()} XP</div>
                <div style={{ width: '100%', height: heights[i], background: `${cols[i]}22`, border: `1px solid ${cols[i]}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...fp, fontSize: 12, color: cols[i] }}>{i + 1}</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full table */}
      <div style={{ border: '1px solid var(--dim)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '0.5fr 0.5fr 2fr 1.5fr 0.8fr 3fr', background: 'var(--bg2)', borderBottom: '1px solid var(--dim)', padding: '8px 14px', gap: 8 }}>
          {['RANK', '#', 'USERNAME', 'XP', 'LEVEL', 'XP BAR'].map(h => (
            <span key={h} style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 2 }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: '32px', ...fm, fontSize: 12, color: 'var(--dim2)', textAlign: 'center' }}>Уншиж байна...</div>
        ) : players.map((p, i) => (
          <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '0.5fr 0.5fr 2fr 1.5fr 0.8fr 3fr', padding: '9px 14px', gap: 8, borderBottom: '1px solid var(--dim)', alignItems: 'center', background: rankBg(i) }}>
            <span style={{ fontSize: 14 }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : ''}</span>
            <span style={{ ...fp, fontSize: 8, color: rankCol(i) }}>{i + 1}</span>
            <span style={{ ...fp, fontSize: 7, color: 'var(--text)' }}>{p.username}</span>
            <span style={{ ...fp, fontSize: 7, color: 'var(--yellow)' }}>{p.xp.toLocaleString()}</span>
            <span style={{ ...fp, fontSize: 6, color: 'var(--cyan)' }}>LV{p.level}</span>
            <div style={{ position: 'relative', height: 8, background: 'var(--bg)', border: '1px solid var(--dim)' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${Math.min(100, (p.xp / maxXp) * 100)}%`, background: rankCol(i), transition: 'width .3s' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
