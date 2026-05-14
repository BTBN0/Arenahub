'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useEffect, useRef, useState, type ReactElement } from 'react'

const W_COLLAPSED = 56
const W_EXPANDED  = 200

// Colorful pixel icons as SVG
const icons: Record<string, {svg: ReactElement; color: string}> = {
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

const navItems = [
  { href:'/dashboard',     label:'DASHBOARD',    key:'dashboard' },
  { href:'/lessons',       label:'LESSONS',      key:'lessons' },
  { href:'/leaderboard',   label:'LEADERBOARD',  key:'leaderboard' },
  { href:'/achievements',  label:'ACHIEVEMENTS', key:'achievements' },
  { href:'/rewards',       label:'REWARDS',      key:'rewards' },
  { href:'/notifications', label:'NOTIFS',       key:'notifications', badge:true },
  { href:'/ai',            label:'AI AGENT',     key:'ai' },
  { href:'/profile',       label:'PROFILE',      key:'profile' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const [open,       setOpen]       = useState(false)
  const [notifCount, setNotifCount] = useState(0)
  const timerRef = useRef<NodeJS.Timeout|null>(null)

  useEffect(()=>{
    if(!isAuthenticated) return
    const token=localStorage.getItem('arenahub_token')
    fetch('/api/notifications?unread=true',{headers:{Authorization:`Bearer ${token}`}})
      .then(r=>r.json()).then(d=>setNotifCount(d.notifications?.length||0)).catch(()=>{})
  },[isAuthenticated,pathname])

  const onEnter=()=>{ if(timerRef.current) clearTimeout(timerRef.current); setOpen(true) }
  const onLeave=()=>{ timerRef.current=setTimeout(()=>setOpen(false),120) }

  const level = user?.level||1
  const xp    = user?.xp||0

  return (
    <>
      <div style={{width:W_COLLAPSED,flexShrink:0}}/>
      <aside
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
            filter:'brightness(0) invert(1)',
          }}>
            <Image src="/logo.svg" alt="ArenaHub" width={28} height={28}/>
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
                      fontSize:5,padding:'1px 4px',
                      fontFamily:'var(--fp)',lineHeight:1.4,
                    }}>{notifCount}</span>
                  )}
                </span>

                {/* Label */}
                <span style={{
                  fontFamily:'var(--fp)',fontSize:7,letterSpacing:1,
                  opacity:open?1:0,
                  transform:open?'translateX(0)':'translateX(-6px)',
                  transition:'opacity .18s, transform .18s',
                  color:'inherit',
                }}>
                  {item.label}
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
              fontSize:7,color:'#bf5af2',fontFamily:'var(--fp)',
            }}>
              {user?.username?.slice(0,2).toUpperCase()||'ME'}
            </div>
            <div style={{
              opacity:open?1:0,
              transform:open?'translateX(0)':'translateX(-6px)',
              transition:'opacity .18s, transform .18s',
              minWidth:0,overflow:'hidden',
            }}>
              <div style={{fontFamily:'var(--fp)',fontSize:7,color:'var(--text)',
                whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {user?.username||'USER'}
              </div>
              <div style={{fontFamily:'var(--fp)',fontSize:5,color:'var(--dim2)',marginTop:3}}>
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
              fontFamily:'var(--fp)',fontSize:7,letterSpacing:1,
              opacity:open?1:0,
              transition:'opacity .18s',
            }}>LOGOUT</span>
          </button>
        </div>
      </aside>
    </>
  )
}
