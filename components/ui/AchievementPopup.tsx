'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

type Toast = {
  id: string; title: string; description: string; icon: string
  rarity: string; xpBonus: number
}

const RARITY: Record<string, { col: string; label: string; glow: string }> = {
  EPIC:   { col: 'var(--cyan)',   label: 'EPIC',   glow: '#00e5ff' },
  RARE:   { col: 'var(--purple)', label: 'RARE',   glow: '#bf5af2' },
  COMMON: { col: 'var(--yellow)', label: 'COMMON', glow: '#ffd700' },
}

const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''

/* Tiny pixel-art sound via AudioContext */
const playUnlockSound = () => {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const freqs = [523, 659, 784, 1047]
    freqs.forEach((f, i) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain); gain.connect(ctx.destination)
      osc.frequency.value = f
      osc.type = 'square'
      gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.12)
      osc.start(ctx.currentTime + i * 0.08)
      osc.stop(ctx.currentTime  + i * 0.08 + 0.15)
    })
  } catch { /* AudioContext not supported */ }
}

export default function AchievementPopup() {
  const { isAuthenticated } = useAuth()
  const [queue,   setQueue]   = useState<Toast[]>([])
  const [current, setCurrent] = useState<Toast | null>(null)
  const [visible, setVisible] = useState(false)
  const seenIds = useRef<Set<string>>(new Set())
  const lastPoll = useRef(Date.now())

  /* Queue → show next */
  const showNext = useCallback((q: Toast[]) => {
    if (q.length === 0) return
    const [next, ...rest] = q
    setQueue(rest)
    setCurrent(next)
    setTimeout(() => { setVisible(true); playUnlockSound() }, 80)
  }, [])

  const dismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => {
      setCurrent(null)
      setQueue(prev => { if (prev.length) setTimeout(() => showNext(prev), 200); return prev })
    }, 380)
  }, [showNext])

  /* Auto-dismiss after 6s */
  useEffect(() => {
    if (!visible) return
    const t = setTimeout(dismiss, 6000)
    return () => clearTimeout(t)
  }, [visible, current, dismiss])

  /* Show queued after current finishes */
  useEffect(() => {
    if (!current && queue.length > 0) showNext(queue)
  }, [current, queue, showNext])

  /* Poll notifications every 8s */
  useEffect(() => {
    if (!isAuthenticated) return

    const poll = async () => {
      try {
        const res = await fetch('/api/notifications?unread=true', {
          headers: { Authorization: `Bearer ${tok()}` }
        })
        if (!res.ok) return
        const { notifications = [] } = await res.json()

        const fresh: Toast[] = (notifications as { id: string; title: string; message: string; type: string; createdAt: string }[])
          .filter(n => n.type === 'achievement' && !seenIds.current.has(n.id) && new Date(n.createdAt).getTime() > lastPoll.current - 10000)
          .map(n => {
            seenIds.current.add(n.id)
            const title = n.title.replace(/^🏅\s*Achievement:\s*/i, '')
            const iconMatch = n.title.match(/\p{Emoji}/u)
            const icon  = iconMatch ? iconMatch[0] : '🏅'
            const lower = title.toLowerCase()
            const rarity = lower.includes('legend') || lower.includes('elite') || lower.includes('champion') || lower.includes('master') || lower.includes('king') || lower.includes('warrior') ? 'EPIC'
                         : lower.includes('runner') || lower.includes('hunter') || lower.includes('engineer') || lower.includes('fighter') || lower.includes('rare') ? 'RARE'
                         : 'COMMON'
            const xpMatch = n.message.match(/\+(\d+) XP/)
            return { id: n.id, title, description: n.message.replace(/ \(\+\d+ XP\)$/, ''), icon, rarity, xpBonus: xpMatch ? parseInt(xpMatch[1]) : 0 }
          })

        lastPoll.current = Date.now()
        if (fresh.length) setQueue(q => [...q, ...fresh])
      } catch { /* silent */ }
    }

    poll()
    const iv = setInterval(poll, 8000)
    return () => clearInterval(iv)
  }, [isAuthenticated])

  if (!current) return null

  const r = RARITY[current.rarity] ?? RARITY.COMMON

  return (
    <>
      {/* Backdrop particles (epic only) */}
      {current.rarity === 'EPIC' && visible && (
        <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:9998 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              position:'absolute',
              bottom: 60 + Math.random() * 200,
              right:  28 + Math.random() * 320,
              width:  4, height:4,
              background: r.col,
              borderRadius:'50%',
              boxShadow:`0 0 8px ${r.col}`,
              animation:`float-${i} 2s ease-out forwards`,
              animationDelay:`${i * 0.15}s`,
              opacity: visible ? 1 : 0,
            }} />
          ))}
        </div>
      )}

      {/* Main popup */}
      <div style={{
        position:  'fixed', bottom: 28, right: 28, zIndex: 9999,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.9)',
        opacity:   visible ? 1 : 0,
        transition:'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        width: 340,
      }}>
        <div style={{
          background:  'rgba(8,12,22,0.97)',
          backdropFilter: 'blur(16px)',
          border:       `1px solid ${r.col}55`,
          boxShadow:    `0 0 40px ${r.glow}22, 0 0 80px ${r.glow}11, 0 16px 40px rgba(0,0,0,0.6)`,
          overflow:     'hidden',
          position:     'relative',
        }}>

          {/* Top glow line */}
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:2,
            background:`linear-gradient(90deg, transparent 0%, ${r.col} 40%, ${r.col} 60%, transparent 100%)`,
            boxShadow:`0 0 12px ${r.col}`,
          }} />

          {/* Side glow */}
          <div style={{
            position:'absolute', top:0, left:0, bottom:0, width:3,
            background:`linear-gradient(180deg, ${r.col}, transparent)`,
            opacity:0.6,
          }} />

          {/* Header bar */}
          <div style={{
            display:'flex', alignItems:'center', gap:8,
            padding:'10px 14px 8px',
            background:`${r.col}0d`,
            borderBottom:`1px solid ${r.col}22`,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, flex:1 }}>
              <span style={{ ...fp, fontSize:5, color:r.col, letterSpacing:3 }}>▲ ACHIEVEMENT UNLOCKED</span>
            </div>
            <span style={{
              ...fp, fontSize:4, color:r.col,
              padding:'2px 8px', border:`1px solid ${r.col}44`,
              background:`${r.col}18`, letterSpacing:1,
            }}>{r.label}</span>
            <button onClick={dismiss} style={{
              ...fp, fontSize:10, color:'var(--dim2)', background:'none',
              border:'none', cursor:'pointer', lineHeight:1, padding:'0 2px',
            }}>×</button>
          </div>

          {/* Content */}
          <div style={{ display:'flex', gap:14, padding:'16px 16px 14px', alignItems:'center' }}>
            {/* Icon */}
            <div style={{
              width:58, height:58, flexShrink:0,
              background:`${r.col}18`,
              border:`1px solid ${r.col}55`,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:30,
              boxShadow:`inset 0 0 16px ${r.col}18, 0 0 20px ${r.col}22`,
              position:'relative',
            }}>
              {current.icon}
              {current.rarity === 'EPIC' && (
                <div style={{
                  position:'absolute', inset:-1,
                  border:`1px solid ${r.col}`,
                  animation:'pulse-border 1.5s ease-in-out infinite',
                  pointerEvents:'none',
                }} />
              )}
            </div>

            {/* Text */}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{
                ...fp, fontSize:10, color:r.col, letterSpacing:1, marginBottom:6,
                textShadow:`0 0 12px ${r.col}66`,
              }}>
                {current.title}
              </div>
              <div style={{ ...fm, fontSize:11, color:'var(--dim2)', lineHeight:1.5, marginBottom:8 }}>
                {current.description}
              </div>
              {current.xpBonus > 0 && (
                <div style={{
                  display:'inline-flex', alignItems:'center', gap:4,
                  ...fp, fontSize:6, color:'var(--yellow)',
                  padding:'3px 8px', border:'1px solid var(--yellow)33',
                  background:'var(--yellow)0d',
                }}>
                  +{current.xpBonus} XP
                </div>
              )}
            </div>
          </div>

          {/* Timer bar */}
          <div style={{ height:2, background:'var(--dim)', margin:'0', overflow:'hidden' }}>
            <div style={{
              height:'100%', background:r.col,
              boxShadow:`0 0 6px ${r.col}`,
              width: visible ? '0%' : '100%',
              transition: visible ? 'width 6s linear' : 'none',
            }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-border {
          0%,100% { opacity:0.4; transform:scale(1); }
          50%      { opacity:1;   transform:scale(1.04); }
        }
      `}</style>
    </>
  )
}