'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'

const kf = `
@keyframes drawer-in  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
@keyframes drawer-out { from{transform:translateX(0)} to{transform:translateX(-100%)} }
@keyframes overlay-in { from{opacity:0} to{opacity:1} }
`

const ITEMS = [
  { href:'/dashboard',     label:{ mn:'ДАШБОРД',     en:'DASHBOARD'    }, color:'#00e5ff', emoji:'⬛' },
  { href:'/lessons',       label:{ mn:'ХИЧЭЭЛҮҮД',   en:'LESSONS'      }, color:'#00ff41', emoji:'📚' },
  { href:'/contest',       label:{ mn:'ТЭМЦЭЭН',     en:'CONTEST'      }, color:'#ff6b35', emoji:'⚔️' },
  { href:'/ai',            label:{ mn:'AI ТУСЛАМЖ',  en:'AI HELP'      }, color:'#40c4ff', emoji:'🤖' },
  { href:'/leaderboard',   label:{ mn:'ЭРЭМБЭ',      en:'LEADERBOARD'  }, color:'#ffd700', emoji:'🏆' },
  { href:'/achievements',  label:{ mn:'АМЖИЛТУУД',   en:'ACHIEVEMENTS' }, color:'#bf5af2', emoji:'🎖' },
  { href:'/rewards',       label:{ mn:'ШАГНАЛУУД',   en:'REWARDS'      }, color:'#ff9800', emoji:'🎁' },
  { href:'/notifications', label:{ mn:'МЭДЭГДЭЛ',    en:'NOTIFS'       }, color:'#ff2d55', emoji:'🔔' },
  { href:'/pricing',       label:{ mn:'ҮНЭ ТАРИФ',   en:'PRICING'      }, color:'#ffd700', emoji:'💰' },
  { href:'/profile',       label:{ mn:'ПРОФАЙЛ',     en:'PROFILE'      }, color:'#69f0ae', emoji:'👤' },
]

export default function MobileDrawer() {
  const [open,     setOpen]     = useState(false)
  const [closing,  setClosing]  = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { lang, setLang, t } = useLang()
  const isMn = lang === 'mn'

  // Close on route change
  useEffect(() => { close() }, [pathname])

  function open_() { setOpen(true); setClosing(false) }
  function close()  {
    if (!open) return
    setClosing(true)
    setTimeout(() => { setOpen(false); setClosing(false) }, 240)
  }

  return (
    <>
      <style>{kf}</style>

      {/* ── Hamburger button ── */}
      <button
        className="mob-hamburger"
        onClick={open_}
        aria-label="Open menu"
        style={{
          position: 'fixed', top: 12, left: 12, zIndex: 200,
          width: 40, height: 40,
          background: 'rgba(8,12,22,.9)', backdropFilter: 'blur(12px)',
          border: '1px solid #1a2840',
          display: 'none', /* shown via CSS */
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 5, cursor: 'pointer', padding: 0,
        }}>
        {[0,1,2].map(i => (
          <span key={i} style={{
            display: 'block', width: 18, height: 2,
            background: '#00e5ff', transition: 'all .2s',
          }}/>
        ))}
      </button>

      {/* ── Backdrop ── */}
      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed', inset: 0, zIndex: 300,
            background: 'rgba(0,0,0,.65)', backdropFilter: 'blur(4px)',
            animation: 'overlay-in .2s ease',
          }}
        />
      )}

      {/* ── Drawer panel ── */}
      {open && (
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 400,
          width: 260, background: 'rgba(6,10,20,.98)', backdropFilter: 'blur(20px)',
          borderRight: '1px solid #1a2840',
          display: 'flex', flexDirection: 'column',
          animation: closing ? 'drawer-out .24s ease forwards' : 'drawer-in .24s ease',
          overflowY: 'auto',
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 18px', borderBottom: '1px solid #0d1a28', flexShrink: 0,
          }}>
            <div>
              <div style={{ fontFamily:'var(--fp)', fontSize: 8, color: '#00ff41', letterSpacing: 2 }}>ARENAHUB</div>
              {user && <div style={{ fontFamily:'var(--fp)', fontSize: 5, color: '#2a4060', letterSpacing: 2, marginTop: 4 }}>{user.username?.toUpperCase()}</div>}
            </div>
            <button onClick={close} style={{
              background: 'transparent', border: '1px solid #1a2840', color: '#3a5070',
              width: 30, height: 30, cursor: 'pointer', fontSize: 14,
            }}>✕</button>
          </div>

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '8px 0' }}>
            {ITEMS.map(item => {
              const active = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link key={item.href} href={item.href}
                  style={{ textDecoration: 'none' }}
                  onClick={close}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 18px',
                    background: active ? `${item.color}0d` : 'transparent',
                    borderLeft: `3px solid ${active ? item.color : 'transparent'}`,
                    transition: 'all .15s',
                  }}>
                    <span style={{ fontSize: 16, lineHeight: 1 }}>{item.emoji}</span>
                    <span style={{
                      fontFamily: 'var(--fp)', fontSize: 7, letterSpacing: 1,
                      color: active ? item.color : '#5a6a8a',
                    }}>
                      {isMn ? item.label.mn : item.label.en}
                    </span>
                    {active && (
                      <span style={{ marginLeft: 'auto', fontFamily:'var(--fp)', fontSize: 8, color: item.color }}>›</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Lang switcher + logout */}
          <div style={{ borderTop: '1px solid #0d1a28', padding: '12px 18px 20px', flexShrink: 0 }}>
            {/* MN / EN */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(['mn','en'] as const).map(l => (
                <button key={l} onClick={() => setLang(l)}
                  style={{
                    flex: 1, padding: '8px 0', fontFamily: 'var(--fp)', fontSize: 6, letterSpacing: 1,
                    border: `1px solid ${lang===l?'rgba(0,229,255,.5)':'#1a2840'}`,
                    background: lang===l ? 'rgba(0,229,255,.1)' : 'transparent',
                    color: lang===l ? '#00e5ff' : '#2a4060', cursor: 'pointer',
                  }}>
                  {l==='mn'?'🇲🇳 МОН':'🇺🇸 ENG'}
                </button>
              ))}
            </div>
            {/* Logout */}
            <button onClick={() => { logout(); close() }}
              style={{
                width: '100%', padding: '10px', fontFamily: 'var(--fp)', fontSize: 7, letterSpacing: 1,
                background: 'transparent', border: '1px solid #ff2d5533', color: '#ff2d55', cursor: 'pointer',
              }}>
              ⏻ {isMn ? 'ГАРАХ' : 'LOGOUT'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}