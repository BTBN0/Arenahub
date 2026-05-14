'use client'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

const kf = `
@keyframes nt-in   { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
@keyframes nt-scan { 0%{top:-80px} 100%{top:100%} }
`

type Notif = { id:string; title:string; message:string; type:string; isRead:boolean; createdAt:string }

const TYPE_CFG: Record<string, { col:string; icon:string }> = {
  success: { col:'#00ff41', icon:'✓' },
  warning: { col:'#ffd700', icon:'⚠' },
  error:   { col:'#ff2d55', icon:'✗' },
  info:    { col:'#00e5ff', icon:'◆' },
  system:  { col:'#bf5af2', icon:'⚙' },
}
const getTC = (type: string) => TYPE_CFG[type?.toLowerCase()] ?? TYPE_CFG.info

export default function NotificationsPage() {
  const { isAuthenticated, loading, user } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [notifs, setNotifs] = useState<Notif[]>([])

  useEffect(() => { if (!loading && !isAuthenticated) router.push('/') }, [loading, isAuthenticated])

  const load = useCallback(() => {
    if (!isAuthenticated) return
    const token = localStorage.getItem('arenahub_token')
    fetch('/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setNotifs(d.notifications || []))
      .catch(() => {})
  }, [isAuthenticated])

  useEffect(() => { load() }, [load])

  const markRead = async (id: string) => {
    const token = localStorage.getItem('arenahub_token')
    await fetch(`/api/notifications/${id}`, { method:'PATCH', headers:{ Authorization:`Bearer ${token}` } })
    setNotifs(ns => ns.map(n => n.id === id ? { ...n, isRead:true } : n))
  }

  const markAll = async () => {
    const token = localStorage.getItem('arenahub_token')
    await fetch('/api/notifications', { method:'PATCH', headers:{ Authorization:`Bearer ${token}` } })
    setNotifs(ns => ns.map(n => ({ ...n, isRead:true })))
  }

  if (loading && !user) return null

  const unread = notifs.filter(n => !n.isRead).length

  return (
    <>
      <style>{kf}</style>
      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', position:'relative' }}>

        {/* scan line */}
        <div style={{ position:'fixed', left:0, right:0, height:80, pointerEvents:'none', zIndex:0,
          background:'linear-gradient(180deg,transparent,rgba(0,229,255,.008),transparent)',
          animation:'nt-scan 9s linear infinite' }}/>

        {/* HUD TOP BAR */}
        <div style={{ display:'flex', alignItems:'stretch', borderBottom:'2px solid #0d1a28', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', flexShrink:0, position:'relative', zIndex:2, boxShadow:'0 2px 20px rgba(0,0,0,.5)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#00e5ff44,transparent)' }}/>

          <div style={{ padding:'16px 28px', borderRight:'1px solid #0d1a28', flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
            <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:4 }}>ARENAHUB</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:10, color:'#00e5ff', letterSpacing:3, textShadow:'0 0 12px rgba(0,229,255,.4)' }}>INBOX</div>
          </div>

          <div style={{ flex:1, padding:'0 28px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:'var(--fp)', fontSize:8, color:'#1a3050' }}>▸</span>
              <span style={{ fontFamily:'var(--fp)', fontSize:10, color:'#00e5ff', letterSpacing:3, textShadow:'0 0 10px rgba(0,229,255,.3)' }}>{t('nt_title')}</span>
            </div>
            {unread > 0 && (
              <span style={{ fontFamily:'var(--fp)', fontSize:6, color:'#ff2d55', border:'1px solid #ff2d5533', padding:'3px 10px', background:'rgba(255,45,85,.06)', letterSpacing:1 }}>
                {unread} UNREAD
              </span>
            )}
            <div style={{ width:1, height:24, background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)' }}/>
            <span style={{ fontFamily:'var(--fp)', fontSize:6, color:'#2a3a54', letterSpacing:2 }}>{notifs.length} НИЙТ</span>
          </div>

          {unread > 0 && (
            <div style={{ padding:'0 28px', borderLeft:'1px solid #0d1a28', display:'flex', alignItems:'center', flexShrink:0 }}>
              <button onClick={markAll}
                style={{ fontFamily:'var(--fp)', fontSize:6, color:'#00e5ff', background:'transparent', border:'1px solid #00e5ff33', padding:'8px 18px', cursor:'pointer', letterSpacing:1, transition:'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,229,255,.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00e5ff88' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00e5ff33' }}>
                {t('nt_mark_all')}
              </button>
            </div>
          )}
        </div>

        {/* STAT STRIP */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderBottom:'1px solid #0d1a28', flexShrink:0, background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', zIndex:2 }}>
          {[
            { k: t('nt_all'),    v:notifs.length,        col:'#3a5070' },
            { k: t('nt_unread'), v:unread,               col:'#ff2d55' },
            { k: t('pr_paid'),   v:notifs.length - unread, col:'#00e5ff' },
          ].map((s, i) => (
            <div key={s.k} style={{ padding:'16px 24px', borderRight: i < 2 ? '1px solid #0d1a28' : 'none', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${s.col}44,transparent)` }}/>
              <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:3, marginBottom:6 }}>{s.k}</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:14, color:s.col, textShadow:`0 0 10px ${s.col}55` }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* LIST */}
        <div style={{ flex:1, padding:'24px 40px', position:'relative', zIndex:2 }}>
          {notifs.length === 0 && (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>📭</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:8, color:'#1a3050', letterSpacing:3 }}>{t('nt_no_notifs')}</div>
            </div>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {notifs.map((n, i) => {
              const tc = getTC(n.type)
              return (
                <div key={n.id}
                  style={{ display:'flex', alignItems:'stretch', background: n.isRead ? 'rgba(8,12,22,.96)' : `${tc.col}06`, border:`1px solid ${n.isRead ? '#0d1a28' : tc.col + '22'}`, transition:'border-color .15s', animation:`nt-in .25s ease ${i * 0.04}s both`, position:'relative', overflow:'hidden' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = tc.col + '44')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = n.isRead ? '#0d1a28' : tc.col + '22')}>

                  {/* left accent bar */}
                  <div style={{ width:4, flexShrink:0, background: n.isRead ? '#0d1a28' : tc.col, opacity: n.isRead ? 0.3 : 1 }}/>

                  {/* top glow line (unread only) */}
                  {!n.isRead && <div style={{ position:'absolute', top:0, left:4, right:0, height:1, background:`linear-gradient(90deg,${tc.col}55,transparent)`, pointerEvents:'none' }}/>}

                  <div style={{ flex:1, padding:'16px 18px', display:'flex', gap:14, alignItems:'flex-start' }}>
                    {/* type icon */}
                    <div style={{ width:34, height:34, flexShrink:0, background:`${tc.col}10`, border:`1px solid ${tc.col}33`, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--fp)', fontSize:11, color:tc.col }}>
                      {tc.icon}
                    </div>

                    <div style={{ flex:1 }}>
                      <div style={{ fontFamily:'var(--fp)', fontSize:7, color: n.isRead ? '#3a5070' : '#c0d0e0', letterSpacing:1, marginBottom:5 }}>{n.title}</div>
                      <div style={{ fontFamily:'var(--fm)', fontSize:12, color:'#3a5070', lineHeight:1.6 }}>{n.message}</div>
                    </div>

                    <div style={{ flexShrink:0, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:8 }}>
                      <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:1 }}>
                        {new Date(n.createdAt).toLocaleDateString('mn-MN')}
                      </div>
                      {!n.isRead && (
                        <button onClick={() => markRead(n.id)}
                          style={{ fontFamily:'var(--fp)', fontSize:5, color:tc.col, background:'transparent', border:`1px solid ${tc.col}33`, padding:'4px 10px', cursor:'pointer', letterSpacing:1, transition:'background .15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = `${tc.col}12`}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                          УНШСАН
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

      </main>
    </>
  )
}