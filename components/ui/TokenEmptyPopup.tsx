'use client'
import { useEffect, useState } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

const COL   = '#ff6b35'
const GLOW  = 'rgba(255,107,53,0.25)'
const TIMER = 8000

const PACKS = [
  { id: 'token_10',  label: '10 TOKEN',    price: '₮3,500',  col: '#4a8aff' },
  { id: 'token_50',  label: '50 TOKEN',    price: '₮15,000', col: '#00e5ff' },
  { id: 'token_200', label: '200+20',      price: '₮45,000', col: '#ffd700' },
]

type Props = {
  visible:  boolean
  balance:  number
  needed:   number
  onClose:  () => void
}

export default function TokenEmptyPopup({ visible, balance, needed, onClose }: Props) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (visible) {
      // slight delay for mount → animate in
      const t = setTimeout(() => setShow(true), 30)
      return () => clearTimeout(t)
    } else {
      setShow(false)
    }
  }, [visible])

  // auto-dismiss
  useEffect(() => {
    if (!show) return
    const t = setTimeout(onClose, TIMER)
    return () => clearTimeout(t)
  }, [show, onClose])

  if (!visible) return null

  return (
    <>
      <div style={{
        position:   'fixed',
        bottom:     28,
        right:      28,
        zIndex:     9999,
        width:      440,
        transform:  show ? 'translateY(0) scale(1)' : 'translateY(44px) scale(0.88)',
        opacity:    show ? 1 : 0,
        transition: 'transform 0.42s cubic-bezier(0.34,1.56,0.64,1), opacity 0.28s ease',
        pointerEvents: show ? 'auto' : 'none',
      }}>
        <div style={{
          background:     'rgba(8,12,22,0.97)',
          backdropFilter: 'blur(16px)',
          border:         `1px solid ${COL}55`,
          boxShadow:      `0 0 40px ${GLOW}, 0 0 80px rgba(255,107,53,0.08), 0 18px 40px rgba(0,0,0,0.65)`,
          overflow:       'hidden',
          position:       'relative',
        }}>

          {/* top glow line */}
          <div style={{
            position:   'absolute', top: 0, left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg, transparent 0%, ${COL} 40%, ${COL} 60%, transparent 100%)`,
            boxShadow:  `0 0 10px ${COL}`,
          }} />

          {/* left side accent */}
          <div style={{
            position:   'absolute', top: 0, left: 0, bottom: 0, width: 3,
            background: `linear-gradient(180deg, ${COL}, transparent)`,
            opacity:    0.7,
          }} />

          {/* header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px 9px',
            background: `${COL}0d`,
            borderBottom: `1px solid ${COL}22`,
          }}>
            <span style={{ ...fp, fontSize: 8, color: COL, letterSpacing: 3, flex: 1 }}>
              ▲ TOKEN ДУУССАН
            </span>
            <span style={{
              ...fp, fontSize: 6, color: COL,
              padding: '3px 10px', border: `1px solid ${COL}44`,
              background: `${COL}18`, letterSpacing: 1,
            }}>ALERT</span>
            <button onClick={onClose} style={{
              ...fp, fontSize: 16, color: 'var(--dim2)', background: 'none',
              border: 'none', cursor: 'pointer', lineHeight: 1, padding: '0 4px',
            }}>×</button>
          </div>

          {/* body */}
          <div style={{ display: 'flex', gap: 16, padding: '20px 18px 14px', alignItems: 'flex-start' }}>
            {/* icon */}
            <div style={{
              width: 72, height: 72, flexShrink: 0,
              background: `${COL}18`,
              border: `1px solid ${COL}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 36,
              boxShadow: `inset 0 0 14px ${COL}18, 0 0 18px ${COL}22`,
              animation: 'tkn-pulse 1.6s ease-in-out infinite',
            }}>🪙</div>

            {/* text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                ...fp, fontSize: 14, color: COL, letterSpacing: 1, marginBottom: 8,
                textShadow: `0 0 10px ${COL}66`,
              }}>TOKEN ХҮРЭЛЦЭХГҮЙ</div>
              <div style={{ ...fm, fontSize: 13, color: 'var(--dim2)', lineHeight: 1.55, marginBottom: 12 }}>
                Үлдэгдэл: <span style={{ color: 'var(--yellow)', fontFamily: 'var(--fp)' }}>🪙 {balance}</span>
                {needed > 0 && (
                  <> · Шаардлагатай: <span style={{ color: COL, fontFamily: 'var(--fp)' }}>🪙 {needed}</span></>
                )}
              </div>

              {/* pack buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PACKS.map(p => (
                  <a
                    key={p.id}
                    href={`/payment?item=${p.id}`}
                    style={{ textDecoration: 'none' }}
                    onClick={onClose}
                  >
                    <div style={{
                      ...fp, fontSize: 7, color: p.col, letterSpacing: 1,
                      padding: '7px 14px',
                      border: `1px solid ${p.col}55`,
                      background: `${p.col}0f`,
                      cursor: 'pointer', transition: 'background .15s',
                    }}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = `${p.col}22`}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = `${p.col}0f`}
                    >
                      {p.label}<br/>
                      <span style={{ color: 'var(--dim2)', fontSize: 11 }}>{p.price}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* timer bar */}
          <div style={{ height: 2, background: 'var(--dim)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              background: COL,
              boxShadow: `0 0 6px ${COL}`,
              width: show ? '0%' : '100%',
              transition: show ? `width ${TIMER}ms linear` : 'none',
            }} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tkn-pulse {
          0%,100% { box-shadow: inset 0 0 14px rgba(255,107,53,.18), 0 0 18px rgba(255,107,53,.22); }
          50%      { box-shadow: inset 0 0 20px rgba(255,107,53,.35), 0 0 28px rgba(255,107,53,.40); }
        }
      `}</style>
    </>
  )
}