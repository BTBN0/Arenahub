'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import React, { useEffect, useRef, useState, useSyncExternalStore } from 'react'

const emptySubscribe = () => () => {}

const W_COLLAPSED = 56
const W_EXPANDED  = 200

// Colorful pixel icons as SVG
const icons: Record<string, {svg: React.ReactElement; color: string}> = {
  dashboard: { color:'#00e5ff', svg:(
    <svg width="20" height="20" viewBox="0 0 8 8" style={{imageRendering:'pixelated'}}>
      <rect x="0" y="0" width="3" height="3" fill="#00e5ff"/>
      <rect x="5" y="0" width="3" height="3" fill="#00b4d8"/>
      <rect x="0" y="5" width="3" height="3" fill="#0096c7"/>
      <rect x="5" y="5" width="3" height="3" fill="#00e5ff"/>
    </svg>
  )},
  lessons: { color:'#00ff41', svg:(
    <svg width="20" height="20" viewBox="0 0 8 8" style={{imageRendering:'pixelated'}}>
      <rect x="1" y="0" width="6" height="1" fill="#00ff41"/>
      <rect x="0" y="1" width="1" height="6" fill="#00cc33"/>
      <rect x="7" y="1" width="1" height="6" fill="#00cc33"/>
      <rect x="1" y="7" width="6" height="1" fill="#00ff41"/>
      <rect x="2" y="2" width="4" height="1" fill="#00ff41"/>
      <rect x="2" y="4" width="3" height="1" fill="#00cc33"/>
      <rect x="2" y="6" width="2" height="1" fill="#009922"/>
    </svg>
  )},
  leaderboard: { color:'#ffd700', svg:(
    <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated'}}>
      <rect x="0" y="8" width="10" height="2" fill="#ffd700"/>
      <rect x="0" y="5" width="3" height="3" fill="#ffd700"/>
      <rect x="3" y="6" width="3" height="2" fill="#ffaa00"/>
      <rect x="6" y="2" width="3" height="6" fill="#ff8800"/>
      <rect x="6" y="1" width="3" height="1" fill="#ffd700" opacity=".7"/>
    </svg>
  )},
  achievements: { color:'#bf5af2', svg:(
    <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated'}}>
      <rect x="2" y="0" width="6" height="1" fill="#bf5af2"/>
      <rect x="1" y="1" width="1" height="4" fill="#9b44cc"/>
      <rect x="8" y="1" width="1" height="4" fill="#9b44cc"/>
      <rect x="2" y="5" width="2" height="1" fill="#bf5af2"/>
      <rect x="6" y="5" width="2" height="1" fill="#bf5af2"/>
      <rect x="3" y="6" width="4" height="1" fill="#7b2fa8"/>
      <rect x="4" y="7" width="2" height="1" fill="#bf5af2"/>
      <rect x="3" y="8" width="4" height="2" fill="#9b44cc"/>
    </svg>
  )},
  rewards: { color:'#ff9800', svg:(
    <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated'}}>
      <rect x="2" y="0" width="6" height="3" rx="3" fill="#ff9800"/>
      <rect x="3" y="1" width="4" height="1" fill="#ffbb33"/>
      <rect x="0" y="3" width="10" height="2" fill="#ff6600"/>
      <rect x="2" y="5" width="6" height="5" fill="#ff9800"/>
      <rect x="4" y="5" width="2" height="5" fill="#ff6600"/>
    </svg>
  )},
  notifications: { color:'#ff2d55', svg:(
    <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated'}}>
      <rect x="4" y="0" width="2" height="1" fill="#ff2d55"/>
      <rect x="3" y="1" width="4" height="1" fill="#cc1133"/>
      <rect x="1" y="2" width="8" height="5" fill="#ff2d55"/>
      <rect x="0" y="6" width="10" height="1" fill="#cc1133"/>
      <rect x="4" y="7" width="2" height="3" fill="#ff2d55"/>
      <rect x="7" y="0" width="3" height="3" rx="1" fill="#ff4466"/>
    </svg>
  )},
  contest: { color:'#ff6b35', svg:(
    <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated'}}>
      <rect x="4" y="0" width="2" height="6" fill="#ff6b35"/>
      <rect x="3" y="1" width="1" height="1" fill="#ff9a6b"/>
      <rect x="6" y="1" width="1" height="1" fill="#ff9a6b"/>
      <rect x="2" y="6" width="6" height="1" fill="#ff6b35"/>
      <rect x="1" y="7" width="8" height="1" fill="#cc4400"/>
      <rect x="4" y="8" width="2" height="2" fill="#ff6b35"/>
      <rect x="3" y="9" width="4" height="1" fill="#cc4400"/>
    </svg>
  )},
  pricing: { color:'#ffd700', svg:(
    <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated'}}>
      <rect x="1" y="0" width="8" height="8" fill="#ffd700"/>
      <rect x="2" y="1" width="6" height="6" fill="#0a0f1a"/>
      <rect x="3" y="2" width="4" height="1" fill="#ffd700"/>
      <rect x="3" y="4" width="2" height="1" fill="#ffd700"/>
      <rect x="3" y="6" width="4" height="1" fill="#ffd700"/>
      <rect x="4" y="8" width="2" height="2" fill="#ffd700"/>
      <rect x="3" y="9" width="4" height="1" fill="#ffd700"/>
    </svg>
  )},
  ai: { color:'#40c4ff', svg:(
    <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated'}}>
      <rect x="1" y="1" width="8" height="7" fill="#40c4ff"/>
      <rect x="2" y="2" width="2" height="2" fill="#0a0f1a"/>
      <rect x="6" y="2" width="2" height="2" fill="#0a0f1a"/>
      <rect x="2" y="5" width="6" height="1" fill="#0a0f1a"/>
      <rect x="4" y="0" width="2" height="1" fill="#29b6f6"/>
      <rect x="0" y="8" width="4" height="2" fill="#40c4ff"/>
      <rect x="6" y="8" width="4" height="2" fill="#40c4ff"/>
    </svg>
  )},
  profile: { color:'#69f0ae', svg:(
    <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated'}}>
      <rect x="3" y="0" width="4" height="4" fill="#69f0ae"/>
      <rect x="2" y="1" width="1" height="2" fill="#40c080"/>
      <rect x="7" y="1" width="1" height="2" fill="#40c080"/>
      <rect x="0" y="6" width="10" height="4" fill="#69f0ae"/>
      <rect x="4" y="4" width="2" height="3" fill="#40c080"/>
    </svg>
  )},
}

type NavItem = { href:string; tKey:string; key:string; badge?:boolean }
const navItems: NavItem[] = [
  { href:'/dashboard',     tKey:'nav_dashboard',    key:'dashboard' },
  { href:'/lessons',       tKey:'nav_courses',      key:'lessons' },
  { href:'/leaderboard',   tKey:'nav_leaderboard',  key:'leaderboard' },
  { href:'/achievements',  tKey:'nav_achievements', key:'achievements' },
  { href:'/rewards',       tKey:'nav_rewards',      key:'rewards' },
  { href:'/notifications', tKey:'nav_notifications',key:'notifications', badge:true },
  { href:'/ai',            tKey:'nav_ai',           key:'ai' },
  { href:'/contest',       tKey:'nav_contest',      key:'contest' },
  { href:'/pricing',       tKey:'nav_pricing',      key:'pricing' },
  { href:'/profile',       tKey:'nav_profile',      key:'profile' },
]

const STAFF_ROLES = ['ADMIN','MODERATOR','CONTENT_MANAGER','AI_MANAGER','PAYMENT_MANAGER','CONTEST_ADMIN','ANALYTICS_ADMIN','INSTRUCTOR']

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const { lang, setLang, t } = useLang()
  const [open,       setOpen]       = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const timerRef = useRef<NodeJS.Timeout|null>(null)
  const hasMounted = useSyncExternalStore(emptySubscribe, () => true, () => false)

  useEffect(()=>{
    if(!isAuthenticated) return
    const fetchCount=()=>{
      const token=localStorage.getItem('arenahub_token')
      fetch('/api/notifications?unread=true',{headers:{Authorization:`Bearer ${token}`}})
        .then(r=>r.json()).then(d=>setNotifCount(d.notifications?.length||0)).catch(()=>{})
    }
    fetchCount()
    const id=setInterval(fetchCount,60_000)
    return ()=>clearInterval(id)
  },[isAuthenticated])

  const isStaff = hasMounted && STAFF_ROLES.includes((user as {role?:string}|null)?.role ?? '')

  const onEnter=()=>{ if(timerRef.current) clearTimeout(timerRef.current); setOpen(true) }
  const onLeave=()=>{ timerRef.current=setTimeout(()=>setOpen(false),120) }

  const level  = hasMounted ? (user?.level  || 1) : 1
  const xp     = hasMounted ? (user?.xp     || 0) : 0
  const avatar = hasMounted ? (user?.username?.slice(0,2).toUpperCase() || 'ME') : 'ME'
  const uname  = hasMounted ? (user?.username || '') : ''

  return (
    <>
      <div className="sidebar-spacer" style={{width:W_COLLAPSED,flexShrink:0}}/>
      <aside
        className="sidebar"
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          position:'fixed',top:0,left:0,bottom:0,
          width: open ? W_EXPANDED : W_COLLAPSED,
          background:'rgba(8,12,22,0.96)',
          backdropFilter:'blur(12px)',
          borderRight:'1px solid rgba(0,229,255,0.12)',
          display:'flex',flexDirection:'column',
          zIndex:100,
          transition:'width .28s cubic-bezier(.4,0,.2,1)',
          overflow:'hidden',
          boxShadow: open ? '4px 0 32px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        {/* Logo */}
        <div style={{
          height:64,flexShrink:0,
          display:'flex',alignItems:'center',
          borderBottom:'1px solid rgba(255,255,255,0.06)',
          padding:'0 14px',gap:12,
          overflow:'hidden',
        }}>
          <div style={{
            width:28,height:28,flexShrink:0,
            display:'flex',alignItems:'center',justifyContent:'center',
          }}>
            <img src="/logo.svg" alt="ArenaHub" width="28" height="28" style={{display:"block"}}/>
          </div>
          <div style={{
            display:'flex',flexDirection:'column',
            opacity:open?1:0,
            transform:open?'translateX(0)':'translateX(-10px)',
            transition:'opacity .2s, transform .2s',
            whiteSpace:'nowrap',
          }}>
            <span style={{
              fontFamily:'var(--fp)',fontSize:11,color:'#ffffff',
              letterSpacing:2,lineHeight:1,
            }}>ARENAHUB</span>

          </div>
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:'6px 0',overflowY:'auto',overflowX:'hidden'}}>
          {navItems.map(item=>{
            const ic = icons[item.key]
            const isActive=pathname===item.href||pathname.startsWith(item.href+'/')
            return(
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display:'flex',alignItems:'center',
                  padding:'0 18px',height:46,gap:16,
                  textDecoration:'none',
                  color: isActive ? ic.color : '#5a6a8a',
                  background: isActive ? `${ic.color}12` : 'transparent',
                  borderLeft:`3px solid ${isActive?ic.color:'transparent'}`,
                  transition:'all .18s',
                  position:'relative',
                  whiteSpace:'nowrap',
                }}
                onMouseEnter={e=>{
                  const el=e.currentTarget as HTMLElement
                  if(!isActive){
                    el.style.color=ic.color
                    el.style.background=`${ic.color}0c`
                    el.style.borderLeftColor=`${ic.color}55`
                  }
                }}
                onMouseLeave={e=>{
                  const el=e.currentTarget as HTMLElement
                  if(!isActive){
                    el.style.color='#5a6a8a'
                    el.style.background='transparent'
                    el.style.borderLeftColor='transparent'
                  }
                }}
              >
                {/* Pixel icon */}
                <span style={{
                  flexShrink:0, display:'flex',
                  alignItems:'center',justifyContent:'center',
                  width:20,height:20,
                  filter:isActive?`drop-shadow(0 0 5px ${ic.color}88)`:'grayscale(0.5) brightness(0.7)',
                  transition:'filter .2s',
                  position:'relative',
                }}>
                  {ic.svg}
                  {item.badge&&notifCount>0&&(
                    <span style={{
                      position:'absolute',top:-6,right:-8,
                      background:'#ff2d55',color:'#fff',
                      fontSize:11,padding:'1px 4px',
                      fontFamily:'var(--fp)',lineHeight:1.4,
                    }}>{notifCount}</span>
                  )}
                </span>

                {/* Label */}
                <span style={{
                  fontFamily:'var(--fp)',fontSize:13,letterSpacing:1,
                  opacity:open?1:0,
                  transform:open?'translateX(0)':'translateX(-6px)',
                  transition:'opacity .18s, transform .18s',
                  color:'inherit',
                }}>
                  {t(item.tKey as any)}
                </span>

                {isActive&&open&&(
                  <span style={{
                    marginLeft:'auto',flexShrink:0,
                    width:4,height:4,
                    background:ic.color,
                    boxShadow:`0 0 8px ${ic.color}`,
                  }}/>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Admin Panel link — staff only */}
        {isStaff && (
          <Link href='/admin' style={{
            display:'flex',alignItems:'center',
            padding:'0 18px',height:46,gap:16,
            textDecoration:'none',
            color: pathname.startsWith('/admin') ? '#ff9800' : '#5a6a8a',
            background: pathname.startsWith('/admin') ? 'rgba(255,152,0,0.10)' : 'transparent',
            borderLeft:`3px solid ${pathname.startsWith('/admin') ? '#ff9800' : 'transparent'}`,
            borderTop:'1px solid rgba(255,152,0,0.15)',
            transition:'all .18s',
            whiteSpace:'nowrap',
          }}
          onMouseEnter={e=>{
            const el=e.currentTarget as HTMLElement
            if(!pathname.startsWith('/admin')){el.style.color='#ff9800';el.style.background='rgba(255,152,0,0.08)';el.style.borderLeftColor='rgba(255,152,0,0.4)'}
          }}
          onMouseLeave={e=>{
            const el=e.currentTarget as HTMLElement
            if(!pathname.startsWith('/admin')){el.style.color='#5a6a8a';el.style.background='transparent';el.style.borderLeftColor='transparent'}
          }}>
            <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated',flexShrink:0,color:'inherit'}}>
              <rect x="1" y="1" width="8" height="6" fill="none" stroke="currentColor" strokeWidth="1"/>
              <rect x="3" y="3" width="4" height="2" fill="currentColor" opacity="0.6"/>
              <rect x="0" y="8" width="10" height="1" fill="currentColor" opacity="0.4"/>
              <rect x="4" y="7" width="2" height="2" fill="currentColor"/>
            </svg>
            <span style={{
              fontFamily:'var(--fp)',fontSize:13,letterSpacing:1,color:'inherit',
              opacity:open?1:0,
              transform:open?'translateX(0)':'translateX(-6px)',
              transition:'opacity .18s, transform .18s',
            }}>ADMIN PANEL</span>
          </Link>
        )}

        {/* ── Language switcher ── */}
        <div style={{
          borderTop:'1px solid rgba(255,255,255,0.08)',
          padding:'6px 8px', display:'flex', gap:3, flexShrink:0,
          background:'rgba(4,8,16,.6)',
        }}>
          {(['mn','en'] as const).map(l => {
            const active = lang === l
            return (
              <button key={l} onClick={() => setLang(l)} title={l==='mn'?'Монгол':'English'} style={{
                flex:1,
                height: 32,
                display:'flex', alignItems:'center', justifyContent:'center', gap: open ? 6 : 0,
                background: active ? 'rgba(0,229,255,0.18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? 'rgba(0,229,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 2,
                cursor:'pointer',
                transition:'all .2s',
                overflow:'hidden',
                flexShrink: 0,
              }}
                onMouseEnter={e => { if(!active)(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { if(!active)(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,0.04)' }}
              >
                {/* flag */}
                <svg width="20" height="13" viewBox="0 0 30 18" style={{imageRendering:'pixelated',flexShrink:0,display:'block'}}>
                  {l === 'mn' ? (
                    <>
                      <rect x="0"  y="0" width="10" height="18" fill="#C4272F"/>
                      <rect x="10" y="0" width="10" height="18" fill="#015197"/>
                      <rect x="20" y="0" width="10" height="18" fill="#C4272F"/>
                      <rect x="4" y="0" width="2" height="1" fill="#F9CF02"/>
                      <rect x="2" y="1" width="6" height="2" fill="#F9CF02"/>
                      <rect x="3" y="3" width="4" height="3" fill="#F9CF02"/>
                      <rect x="1" y="7" width="8" height="1" fill="#F9CF02"/>
                      <rect x="1" y="9" width="8" height="1" fill="#F9CF02"/>
                      <rect x="3" y="10" width="4" height="4" fill="#F9CF02"/>
                      <rect x="1" y="14" width="8" height="1" fill="#F9CF02"/>
                      <rect x="1" y="16" width="8" height="2" fill="#F9CF02"/>
                    </>
                  ) : (
                    <>
                      <rect x="0"  y="0"  width="30" height="18" fill="#B22234"/>
                      <rect x="0"  y="2"  width="30" height="2"  fill="#fff"/>
                      <rect x="0"  y="6"  width="30" height="2"  fill="#fff"/>
                      <rect x="0"  y="10" width="30" height="2"  fill="#fff"/>
                      <rect x="0"  y="14" width="30" height="2"  fill="#fff"/>
                      <rect x="0"  y="0"  width="12" height="10" fill="#3C3B6E"/>
                      <rect x="1"  y="1"  width="2"  height="1"  fill="#fff"/>
                      <rect x="5"  y="1"  width="2"  height="1"  fill="#fff"/>
                      <rect x="9"  y="1"  width="2"  height="1"  fill="#fff"/>
                      <rect x="3"  y="4"  width="2"  height="1"  fill="#fff"/>
                      <rect x="7"  y="4"  width="2"  height="1"  fill="#fff"/>
                      <rect x="1"  y="7"  width="2"  height="1"  fill="#fff"/>
                      <rect x="5"  y="7"  width="2"  height="1"  fill="#fff"/>
                      <rect x="9"  y="7"  width="2"  height="1"  fill="#fff"/>
                    </>
                  )}
                </svg>
                {/* label — always visible but shifts position */}
                <span style={{
                  fontFamily:'var(--fp)', fontSize: open ? 7 : 5,
                  color: active ? '#00e5ff' : '#4a6080',
                  letterSpacing: 1,
                  transition:'all .18s',
                  whiteSpace:'nowrap',
                  maxWidth: open ? 40 : 20,
                  overflow:'hidden',
                }}>
                  {l === 'mn' ? 'МОН' : 'ENG'}
                </span>
              </button>
            )
          })}
        </div>

        {/* User + Logout */}
        <div style={{borderTop:'1px solid rgba(255,255,255,0.06)',flexShrink:0}}>
          <div style={{
            display:'flex',alignItems:'center',gap:12,
            padding:'10px 18px',overflow:'hidden',
          }}>
            <div style={{
              width:28,height:28,flexShrink:0,
              border:'1px solid #bf5af2',
              background:'rgba(191,90,242,0.12)',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:13,color:'#bf5af2',fontFamily:'var(--fp)',
            }}>
              {avatar}
            </div>
            <div style={{
              opacity:open?1:0,
              transform:open?'translateX(0)':'translateX(-6px)',
              transition:'opacity .18s, transform .18s',
              minWidth:0,overflow:'hidden',
            }}>
              <div style={{fontFamily:'var(--fp)',fontSize:13,color:'var(--text)',
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {uname}
              </div>
              <div style={{fontFamily:'var(--fp)',fontSize:11,color:'var(--dim2)',marginTop:3}}>
                LV{level} · {xp}XP
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            style={{
              width:'100%',display:'flex',alignItems:'center',
              gap:16,padding:'0 18px',height:42,
              background:'transparent',border:'none',
              borderLeft:'3px solid transparent',
              cursor:'pointer',color:'#5a6a8a',
              transition:'all .18s',whiteSpace:'nowrap',overflow:'hidden',
            }}
            onMouseEnter={e=>{
              const el=e.currentTarget as HTMLElement
              el.style.color='#ff2d55'
              el.style.background='rgba(255,45,85,0.08)'
              el.style.borderLeftColor='rgba(255,45,85,0.4)'
            }}
            onMouseLeave={e=>{
              const el=e.currentTarget as HTMLElement
              el.style.color='#5a6a8a'
              el.style.background='transparent'
              el.style.borderLeftColor='transparent'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 10 10" style={{imageRendering:'pixelated',flexShrink:0}}>
              <rect x="4" y="0" width="2" height="5" fill="currentColor"/>
              <path d="M2 2 Q0 4 0 5 Q0 9 5 9 Q10 9 10 5 Q10 4 8 2" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            </svg>
            <span style={{
              fontFamily:'var(--fp)',fontSize:13,letterSpacing:1,
              opacity:open?1:0,
              transition:'opacity .18s',
            }}>LOGOUT</span>
          </button>
        </div>
      </aside>
    </>
  )
}
