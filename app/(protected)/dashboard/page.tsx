'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import dynamic from 'next/dynamic'
const PixelModel3D = dynamic(() => import('@/components/ui/Model3D'), { ssr:false, loading:()=><div style={{width:200,height:200}}/> })
import PixelIcon from '@/components/ui/PixelIcon'
import CountryFlag from '@/components/ui/CountryFlag'
import { useLang } from '@/context/LanguageContext'

function HudClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  const timeStr = now.toLocaleTimeString('mn-MN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })
  const dateStr = now.toLocaleDateString('mn-MN', { year:'numeric', month:'short', day:'numeric' })
  return (
    <div style={{ padding:'16px 28px', borderLeft:'1px solid #0d1a28', textAlign:'right', flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
      <div style={{ fontFamily:'var(--fp)', fontSize:11, color:'#1a3050', letterSpacing:3 }}>{dateStr}</div>
      <div style={{ fontFamily:'var(--fp)', fontSize:12, color:'#2a5070', letterSpacing:4, fontVariantNumeric:'tabular-nums' }}>{timeStr}</div>
    </div>
  )
}

const PLAN_CFG = {
  PRO: { col: '#00e5ff', glow: 'rgba(0,229,255,0.2)' },
  VIP: { col: '#ffd700', glow: 'rgba(255,215,0,0.2)' },
}

const kf = `
@keyframes hud-in   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes hud-blink { 0%,100%{opacity:1} 49%{opacity:1} 50%{opacity:0} 99%{opacity:0} }
@keyframes hud-scan { 0%{top:-60px} 100%{top:100%} }
@keyframes hud-ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
`

export default function DashboardPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const { t } = useLang()
  const router   = useRouter()
  const [contest, setContest] = useState<any>(null)

  useEffect(() => { if (!loading && !isAuthenticated) router.push('/') }, [loading, isAuthenticated])

  useEffect(() => {
    fetch('/api/contest?status=ACTIVE')
      .then(r => r.json())
      .then(d => { if (d.ok && d.contests?.length) setContest(d.contests[0]) })
      .catch(() => {})
  }, [])

  if (loading && !user) return null

  const plan   = ((user?.subscription?.plan ?? 'FREE') as 'FREE' | 'PRO' | 'VIP')
  const planCfg = plan !== 'FREE' ? PLAN_CFG[plan] : null
  const level  = user?.level  || 1
  const xp     = user?.xp     || 0
  const xpNext = level * 200
  const pct    = Math.min(100, Math.round((xp % xpNext) / xpNext * 100))

  const contestLeft = contest ? (() => {
    const d = new Date(contest.endDate).getTime() - Date.now()
    if (d <= 0) return null
    const h = Math.floor(d / 3600000)
    const m = Math.floor((d % 3600000) / 60000)
    const s = Math.floor((d % 60000) / 1000)
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
  })() : null

  const ZONES = [
    { href:'/lessons',     label: t('dash_zone_missions'), sub: t('dash_zone_missions_sub'), icon:'lessons',     col:'#00ff41', span:2 },
    { href:'/ai',          label: t('dash_zone_ai'),       sub: t('dash_zone_ai_sub'),       icon:'ai',          col:'#bf5af2', span:1 },
    { href:'/leaderboard', label: t('dash_zone_lb'),       sub: t('dash_zone_lb_sub'),       icon:'leaderboard', col:'#ffd700', span:1 },
    { href:'/rewards',     label: t('dash_zone_rewards'),  sub: t('dash_zone_rewards_sub'),  icon:'rewards',     col:'#ff6b35', span:1 },
    { href:'/profile',     label: t('dash_zone_profile'),  sub: t('dash_zone_profile_sub'),  icon:'profile',     col:'#00e5ff', span:1 },
    { href:'/pricing',     label: t('dash_zone_pricing'),  sub: t('dash_zone_pricing_sub'),  icon:'pricing',     col:'#ffd700', span:1 },
  ]

  return (
    <>
      <style>{kf}</style>

      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', position:'relative' }}>

        {/* scan line */}
        <div style={{ position:'fixed', left:0, right:0, height:80, pointerEvents:'none', zIndex:0,
          background:'linear-gradient(180deg,transparent,rgba(0,229,255,.015),transparent)',
          animation:'hud-scan 7s linear infinite' }}/>

        {/* ── TOP HUD BAR ── */}
        <div style={{
          display:'flex', alignItems:'stretch', gap:0,
          borderBottom:'2px solid #0d1a28',
          background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', flexShrink:0, position:'relative', zIndex:2,
          boxShadow:'0 2px 20px rgba(0,0,0,.5)',
        }}>
          {/* top glow line */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#00e5ff44,transparent)' }}/>

          {/* left: system label */}
          <div style={{ padding:'16px 28px', borderRight:'1px solid #0d1a28', flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
            <div style={{ fontFamily:'var(--fp)', fontSize:11, color:'#1a3050', letterSpacing:4 }}>{t('dash_system')}</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:13, color:'#00e5ff', letterSpacing:3, textShadow:'0 0 12px rgba(0,229,255,.4)' }}>ARENAHUB</div>
          </div>

          {/* center: breadcrumb + user */}
          <div style={{ flex:1, padding:'0 28px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:'var(--fp)', fontSize:11, color:'#1a3050' }}>▸</span>
              <span style={{ fontFamily:'var(--fp)', fontSize:13, color:'#00e5ff', letterSpacing:3, textShadow:'0 0 10px rgba(0,229,255,.3)' }}>{t('dash_title')}</span>
            </div>
            <div style={{ width:1, height:24, background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:'var(--fp)', fontSize:12, color:'#1a3050', letterSpacing:2 }}>USER</span>
              <span style={{ fontFamily:'var(--fp)', fontSize:11, color:'#5a8aaa', letterSpacing:1 }}>{user?.username?.toUpperCase()}</span>
              {user?.country && <CountryFlag country={user.country} size={24}/>}
            </div>
            {planCfg && (
              <span style={{ fontFamily:'var(--fp)', fontSize:12, color:planCfg.col, border:`1px solid ${planCfg.col}55`, padding:'3px 12px', letterSpacing:2, boxShadow:`0 0 12px ${planCfg.glow}`, background:`${planCfg.col}10` }}>
                {plan}
              </span>
            )}
          </div>

          {/* right: clock */}
          <HudClock />
        </div>

        {/* ── PLAYER HUD STRIP ── */}
        <div className="dash-stats" style={{ flexShrink:0 }}>
          {[
            { k: t('dash_level'), v:level,              col:'#00e5ff' },
            { k: t('dash_xp'),    v:xp.toLocaleString(),col:'#00ff41' },
            { k: t('dash_coins'), v:user?.coins ?? 0,   col:'#ffd700' },
            { k: t('dash_role'),  v:user?.role ?? '–',  col:'#bf5af2' },
            { k: t('dash_plan'),  v:plan,               col: plan==='VIP'?'#ffd700':plan==='PRO'?'#00e5ff':'#2a3a54' },
          ].map((s, i) => (
            <div key={s.k} style={{ padding:'20px 24px', borderRight: i < 4 ? '1px solid #0d1a28' : 'none', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${s.col}44,transparent)` }}/>
              <div style={{ fontFamily:'var(--fp)', fontSize:12, color:'#2a3a54', letterSpacing:3, marginBottom:8 }}>{s.k}</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:14, color:s.col, textShadow:`0 0 12px ${s.col}55` }}>{s.v}</div>
            </div>
          ))}
        </div>

        {/* ── XP PROGRESS BAR ── */}
        <div style={{ position:'relative', zIndex:2, flexShrink:0, padding:'14px 20px', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid #0d1a28' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--fp)', fontSize:12, color:'#2a4060', marginBottom:8 }}>
            <span style={{ color:'#00ff4155' }}>{t('dash_xp_progress')} → LVL {level + 1}</span>
            <span style={{ color:'#00ff41' }}>{(xp % xpNext).toLocaleString()} / {xpNext.toLocaleString()}</span>
          </div>
          <div style={{ height:8, background:'rgba(12,18,34,.62)',  backdropFilter:'blur(16px)', border:'1px solid #0d1a28', overflow:'hidden' }}>
            <div style={{
              height:'100%', width:`${pct}%`,
              background:'linear-gradient(90deg,#00ff41,#00e5ff)',
              boxShadow:'0 0 10px rgba(0,255,65,.7)',
              transition:'width 1.2s ease',
              position:'relative',
            }}>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 60%,rgba(255,255,255,.15) 80%,transparent 100%)' }}/>
            </div>
          </div>
          <div style={{ fontFamily:'var(--fp)', fontSize:11, color:'#1a3050', marginTop:6 }}>
            {(xpNext - xp % xpNext).toLocaleString()} {t('dash_xp_left')}
          </div>
        </div>

        {/* ── CONTEST ALERT ── */}
        {contest && contestLeft && (
          <div style={{
            margin:'14px 20px 0', flexShrink:0, position:'relative', zIndex:2,
            background:'rgba(255,215,0,.04)', border:'1px solid #ffd70033',
            padding:'12px 18px', display:'flex', alignItems:'center', gap:16,
            animation:'hud-in .3s ease',
          }}>
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:8, height:8, background:'#ffd700', borderRadius:'50%' }}/>
              <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#ffd700', animation:'hud-ping 1.2s ease-out infinite' }}/>
            </div>
            <div style={{ fontFamily:'var(--fp)', fontSize:13, color:'#ffd700', letterSpacing:3 }}>● {t('dash_live_contest')}</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:13, color:'#fff', flex:1 }}>{contest.title}</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:12, color:'#ffd700', letterSpacing:2, fontVariantNumeric:'tabular-nums' }}>{contestLeft}</div>
            <a href="/pricing?tab=contest" style={{ fontFamily:'var(--fp)', fontSize:11, color:'#060e1a', background:'#ffd700', padding:'5px 14px', textDecoration:'none', letterSpacing:1, flexShrink:0 }}>
              {t('dash_join')} →
            </a>
          </div>
        )}

        {/* ── ZONES + 3D MODEL ── */}
        <div className="dash-layout">

          {/* LEFT — nav zones */}
          <div className="dash-left">
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:3, height:18, background:'#00e5ff', boxShadow:'0 0 8px #00e5ff' }}/>
              <div style={{ fontFamily:'var(--fp)', fontSize:13, color:'#2a4a6a', letterSpacing:4 }}>{t('dash_navigate')}</div>
            </div>
            <div className="dash-zones">
              {(ZONES as Zone[]).map((z, i) => (
                <ZoneCard key={z.href} zone={z} delay={i * 0.07} />
              ))}
            </div>
          </div>

          {/* RIGHT — 3D model panel */}
          <div className="dash-right">
            <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,rgba(0,229,255,.06) 0%,transparent 65%)', pointerEvents:'none' }}/>
            <PixelModel3D model="castle" theme="crystal" size={200} />
          </div>
        </div>

      </main>
    </>
  )
}

type IconName = 'lessons'|'ai'|'leaderboard'|'rewards'|'profile'|'pricing'
interface Zone { href: string; label: string; sub: string; icon: IconName; col: string; span: number }

function ZoneCard({ zone, delay }: { zone: Zone; delay: number }) {
  return (
    <a href={zone.href} style={{ textDecoration:'none', display:'block', animation:`hud-in .35s ease ${delay}s both` }}>
      <div
        style={{
          height:'100%', cursor:'pointer',
          background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)',
          border:`1px solid #0d1a28`,
          position:'relative', overflow:'hidden',
          transition:'all .18s',
          display:'flex', alignItems:'stretch',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = `${zone.col}0c`
          el.style.borderColor = `${zone.col}44`
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = 'rgba(8,12,22,.96)'
          el.style.borderColor = '#0d1a28'
        }}
      >
        {/* left color bar */}
        <div style={{ width:4, flexShrink:0, background:`linear-gradient(180deg,${zone.col},${zone.col}33)` }}/>

        {/* content */}
        <div style={{ flex:1, padding:'18px 16px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <PixelIcon name={zone.icon} size={28} col={zone.col}/>
            <div style={{ fontFamily:'var(--fp)', fontSize:12, color:zone.col, letterSpacing:1, textShadow:`0 0 8px ${zone.col}44` }}>{zone.label}</div>
          </div>
          <div style={{ fontFamily:'var(--fm)', fontSize:11, color:'#3a5a78', lineHeight:1.6 }}>{zone.sub}</div>
        </div>

        {/* arrow */}
        <div style={{ display:'flex', alignItems:'center', paddingRight:14 }}>
          <div style={{ fontFamily:'var(--fp)', fontSize:13, color:`${zone.col}33`, transition:'all .18s' }}>›</div>
        </div>
      </div>
    </a>
  )
}