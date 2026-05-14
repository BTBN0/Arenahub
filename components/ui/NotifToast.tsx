'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

interface Notif { id:string; title:string; message:string; type:string; createdAt:string }
interface Toast  extends Notif { visible:boolean }

const TYPE_COL: Record<string, string> = {
  success:'#00ff41', error:'#ff2d55', warning:'#ffe600', info:'#00e5ff', achievement:'#ffd700',
}
const TYPE_ICON: Record<string, string> = {
  success:'✓', error:'✗', warning:'⚠', info:'●', achievement:'★',
}
const TYPE_KEY_MN: Record<string, string> = {
  success:'АМЖИЛТТАЙ', error:'АЛДАА', warning:'АНХААРУУЛГА', info:'МЭДЭЭЛЭЛ', achievement:'АМЖИЛТ',
}
const TYPE_KEY_EN: Record<string, string> = {
  success:'SUCCESS', error:'ERROR', warning:'WARNING', info:'INFO', achievement:'ACHIEVEMENT',
}

const tok = () =>
  typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''

export default function NotifToast() {
  const { isAuthenticated } = useAuth()
  const { lang } = useLang()
  const typeLabel = (type: string) => {
    const icon = TYPE_ICON[type] ?? '●'
    const name = (lang === 'mn' ? TYPE_KEY_MN : TYPE_KEY_EN)[type] ?? type.toUpperCase()
    return `${icon} ${name}`
  }
  const typeCfg = (type: string) => ({
    col: TYPE_COL[type] ?? '#00e5ff',
    label: typeLabel(type),
  })
  const [toasts, setToasts] = useState<Toast[]>([])
  const seenIds     = useRef<Set<string>>(new Set())
  const initialized = useRef(false)
  const timerMap    = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(ts => ts.map(t => t.id === id ? {...t, visible:false} : t))
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 420)
    const tm = timerMap.current.get(id)
    if (tm) { clearTimeout(tm); timerMap.current.delete(id) }
  }, [])

  const scheduleToast = useCallback((t: Toast) => {
    // trigger visible on next tick
    setTimeout(() => setToasts(ts => ts.map(x => x.id === t.id ? {...x, visible:true} : x)), 40)
    // auto-dismiss after 5s
    const tm = setTimeout(() => dismiss(t.id), 5400)
    timerMap.current.set(t.id, tm)
  }, [dismiss])

  useEffect(() => {
    if (!isAuthenticated) return

    const poll = async () => {
      try {
        const res = await fetch('/api/notifications?unread=true', {
          headers: { Authorization: `Bearer ${tok()}` }
        })
        if (!res.ok) return
        const { notifications = [] } = await res.json() as { notifications: Notif[] }

        if (!initialized.current) {
          // First poll: mark all existing as seen silently
          notifications.forEach(n => seenIds.current.add(n.id))
          initialized.current = true
          return
        }

        const fresh = notifications.filter(n => !seenIds.current.has(n.id))
        if (!fresh.length) return

        fresh.forEach(n => seenIds.current.add(n.id))
        const newToasts = fresh.map(n => ({...n, visible:false}))

        setToasts(ts => [...ts.slice(-2), ...newToasts])  // max 3 visible
        newToasts.forEach(scheduleToast)
      } catch { /* silent */ }
    }

    poll()
    const iv = setInterval(poll, 5000)
    return () => {
      clearInterval(iv)
      timerMap.current.forEach(clearTimeout)
    }
  }, [isAuthenticated, scheduleToast])

  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes notif-in  { from{opacity:0;transform:translateX(340px)} to{opacity:1;transform:translateX(0)} }
        @keyframes notif-out { from{opacity:1;transform:translateX(0)}     to{opacity:0;transform:translateX(340px)} }
        @keyframes notif-bar { from{width:100%} to{width:0%} }
      `}</style>

      <div style={{
        position:'fixed', top:20, right:20, zIndex:9997,
        display:'flex', flexDirection:'column', gap:10, width:320,
        pointerEvents:'none',
      }}>
        {toasts.map(t => {
          const cfg = typeCfg(t.type)
          return (
            <div key={t.id} style={{
              pointerEvents:'all',
              transform: t.visible ? 'translateX(0)' : 'translateX(340px)',
              opacity:   t.visible ? 1 : 0,
              transition:'transform .38s cubic-bezier(.34,1.56,.64,1), opacity .3s ease',
            }}>
              <div style={{
                background:'rgba(4,8,15,.97)',
                backdropFilter:'blur(14px)',
                border:`1px solid ${cfg.col}33`,
                borderLeft:`3px solid ${cfg.col}`,
                boxShadow:`0 0 32px ${cfg.col}12, 0 8px 28px rgba(0,0,0,.6)`,
                overflow:'hidden', position:'relative',
              }}>
                {/* top glow */}
                <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:`linear-gradient(90deg,${cfg.col},transparent)`}}/>

                {/* header */}
                <div style={{
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                  padding:'8px 12px 6px',
                  background:`${cfg.col}0a`, borderBottom:`1px solid ${cfg.col}1a`,
                }}>
                  <span style={{...fp, fontSize:5, color:cfg.col, letterSpacing:2}}>
                    {cfg.label}
                  </span>
                  <button onClick={() => dismiss(t.id)} style={{
                    background:'none', border:'none', color:'#2a4060',
                    cursor:'pointer', fontSize:16, lineHeight:1, padding:'0 2px',
                    transition:'color .15s',
                  }}
                    onMouseEnter={e=>(e.currentTarget.style.color=cfg.col)}
                    onMouseLeave={e=>(e.currentTarget.style.color='#2a4060')}
                  >×</button>
                </div>

                {/* body */}
                <div style={{padding:'10px 14px 12px'}}>
                  <div style={{...fp, fontSize:7, color:'#d0e4f8', marginBottom:5, letterSpacing:.5, lineHeight:1.6}}>
                    {t.title}
                  </div>
                  <div style={{...fm, fontSize:12, color:'#4a6080', lineHeight:1.6}}>
                    {t.message}
                  </div>
                </div>

                {/* timer bar */}
                <div style={{height:2, background:'#060e1a', overflow:'hidden'}}>
                  <div style={{
                    height:'100%', background:cfg.col,
                    boxShadow:`0 0 6px ${cfg.col}`,
                    width: t.visible ? '0%' : '100%',
                    transition: t.visible ? 'width 5.4s linear' : 'none',
                  }}/>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}