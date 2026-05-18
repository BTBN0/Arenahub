'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import PixelIcon from '@/components/ui/PixelIcon'
import { useLang } from '@/context/LanguageContext'

const kf = `
@keyframes ac-in   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes ac-scan { 0%{top:-80px} 100%{top:100%} }
`

type Achievement = {
  id:string; title:string; description:string; icon:string
  xpReward:number; type:string; rarity:string; rewardType:string; rewardAmount:number
  condition:string; createdAt:string
}
type UserAchievement = { id:string; achievementId:string; unlockedAt:string; achievement:Achievement }

const RARITY_CFG: Record<string, { col:string; label:string }> = {
  EPIC:   { col:'#00e5ff', label:'EPIC' },
  RARE:   { col:'#bf5af2', label:'RARE' },
  COMMON: { col:'#ffd700', label:'COMMON' },
}
const TYPE_LABEL: Record<string, string> = {
  SKILL_BASED:'SKILL', PERFORMANCE_BASED:'PERF', BEHAVIOR_BASED:'BEHAVIOR', PROGRESSION_BASED:'PROGRESS',
}

const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''
const authH = () => ({ Authorization: `Bearer ${tok()}` })

function AchCard({ ach, unlocked, unlockedAt }: { ach:Achievement; unlocked:boolean; unlockedAt?:string }) {
  const rc  = RARITY_CFG[ach.rarity]
  const col = unlocked ? (rc?.col ?? '#ffd700') : '#1a3050'
  return (
    <div style={{ background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', border:`1px solid ${col}${unlocked ? '33' : '18'}`, position:'relative', overflow:'hidden', opacity: unlocked ? 1 : 0.45, transition:'border-color .18s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${col}66`}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${col}${unlocked ? '33' : '18'}`}>

      {unlocked && <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${col},transparent)` }}/>}

      {/* left accent */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:`linear-gradient(180deg,${col},${col}33)`, opacity: unlocked ? 1 : 0.3 }}/>

      <div style={{ padding:'16px 16px 16px 20px', display:'flex', gap:14, alignItems:'flex-start' }}>
        <div style={{ width:46, height:46, flexShrink:0, background:`${col}14`, border:`1px solid ${col}${unlocked ? '33' : '18'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
          {unlocked ? ach.icon : <PixelIcon name="lock" size={24} col='#2a3a54'/>}
        </div>

        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
            <span style={{ fontFamily:'var(--fp)', fontSize:10, color: unlocked ? (rc?.col ?? '#ffd700') : '#2a3a54' }}>{ach.title}</span>
            {rc && (
              <span style={{ fontFamily:'var(--fp)', fontSize:10, color:rc.col, padding:'1px 5px', border:`1px solid ${rc.col}33`, marginLeft:'auto', flexShrink:0 }}>{rc.label}</span>
            )}
          </div>
          <div style={{ fontFamily:'var(--fm)', fontSize:11, color:'#3a5070', marginBottom:8, lineHeight:1.5 }}>{ach.description}</div>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            {ach.xpReward > 0 && <span style={{ fontFamily:'var(--fp)', fontSize:8, color:'#ffd700' }}>+{ach.xpReward} XP</span>}
            {ach.rewardAmount > 0 && <span style={{ fontFamily:'var(--fp)', fontSize:8, color:'#00e5ff' }}>+{ach.rewardAmount} {ach.rewardType}</span>}
            <span style={{ fontFamily:'var(--fp)', fontSize:10, color:'#1a3050', padding:'1px 5px', border:'1px solid #0d1a28', marginLeft:'auto' }}>
              {TYPE_LABEL[ach.type] ?? ach.type}
            </span>
          </div>
          {unlocked && unlockedAt && (
            <div style={{ fontFamily:'var(--fp)', fontSize:10, color:`${col}88`, marginTop:5 }}>
              ✓ {new Date(unlockedAt).toLocaleDateString('mn-MN')}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AchievementsPage() {
  const { isAuthenticated, loading:authLoading } = useAuth()
  const { t } = useLang()
  const router = useRouter()

  const [userAchs, setUserAchs] = useState<UserAchievement[]>([])
  const [allAchs,  setAllAchs]  = useState<Achievement[]>([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState<'ALL'|'UNLOCKED'|'LOCKED'>('ALL')
  const [rarFilter, setRarFilter] = useState('ALL')

  useEffect(() => { if (!authLoading && !isAuthenticated) router.push('/') }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/achievements?list=all', { headers: authH() })
      .then(r => r.json())
      .then(d => {
        const all: (Achievement & { unlocked?:boolean; unlockedAt?:string })[] = d.achievements ?? []
        setAllAchs(all)
        setUserAchs(
          all.filter(a => a.unlocked).map(a => ({
            id: a.id, achievementId: a.id,
            unlockedAt: a.unlockedAt ?? new Date().toISOString(),
            achievement: a,
          }))
        )
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const unlockedIds = new Set(userAchs.map(u => u.achievementId ?? u.achievement?.id))
  const unlockedMap: Record<string, string> = {}
  for (const u of userAchs) unlockedMap[u.achievementId ?? u.achievement?.id] = u.unlockedAt

  const unique = Array.from(new Map(allAchs.map(a => [a.id, a])).values())

  const shown = unique.filter(a => {
    if (filter === 'UNLOCKED' && !unlockedIds.has(a.id)) return false
    if (filter === 'LOCKED'   &&  unlockedIds.has(a.id)) return false
    if (rarFilter !== 'ALL' && a.rarity !== rarFilter) return false
    return true
  })

  const total  = unique.length
  const earned = unlockedIds.size
  const xpTotal = userAchs.reduce((s, u) => s + (u.achievement?.xpReward ?? 0), 0)
  const byRar  = (r: string) => unique.filter(a => a.rarity === r)
  const rarPct = (r: string) => byRar(r).length ? Math.round(byRar(r).filter(a => unlockedIds.has(a.id)).length / byRar(r).length * 100) : 0

  return (
    <>
      <style>{kf}</style>
      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', position:'relative' }}>

        {/* scan line */}
        <div style={{ position:'fixed', left:0, right:0, height:80, pointerEvents:'none', zIndex:0,
          background:'linear-gradient(180deg,transparent,rgba(255,215,0,.008),transparent)',
          animation:'ac-scan 9s linear infinite' }}/>

        {/* HUD TOP BAR */}
        <div style={{ display:'flex', alignItems:'stretch', borderBottom:'2px solid #0d1a28', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', flexShrink:0, position:'relative', zIndex:2, boxShadow:'0 2px 20px rgba(0,0,0,.5)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#ffd70044,transparent)' }}/>

          <div style={{ padding:'16px 28px', borderRight:'1px solid #0d1a28', flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
            <div style={{ fontFamily:'var(--fp)', fontSize:8, color:'#1a3050', letterSpacing:4 }}>ARENAHUB</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:10, color:'#ffd700', letterSpacing:3, textShadow:'0 0 12px rgba(255,215,0,.4)' }}>GAMIFY</div>
          </div>

          <div style={{ flex:1, padding:'0 28px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:'var(--fp)', fontSize:8, color:'#1a3050' }}>▸</span>
              <span style={{ fontFamily:'var(--fp)', fontSize:10, color:'#ffd700', letterSpacing:3, textShadow:'0 0 10px rgba(255,215,0,.3)' }}>{t('ach_title')}</span>
            </div>
            <div style={{ width:1, height:24, background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)' }}/>
            <span style={{ fontFamily:'var(--fp)', fontSize:9, color:'#2a3a54', letterSpacing:2 }}>{earned}/{total} ОЛГОСОН</span>
          </div>

          <div style={{ padding:'16px 28px', borderLeft:'1px solid #0d1a28', display:'flex', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'var(--fp)', fontSize:10, color:'#3a5070' }}>🏆 +{xpTotal} XP</span>
          </div>
        </div>

        {/* STAT STRIP */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderBottom:'1px solid #0d1a28', flexShrink:0, background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', zIndex:2 }}>
          {[
            { k:'НИЙТ',    v:`${earned} / ${total}`, col:'#ffd700', bar: total ? earned/total : 0 },
            { k:'EPIC',    v:`${rarPct('EPIC')}%`,   col:'#00e5ff', bar: rarPct('EPIC')/100 },
            { k:'RARE',    v:`${rarPct('RARE')}%`,   col:'#bf5af2', bar: rarPct('RARE')/100 },
            { k:'XP',      v:`+${xpTotal}`,          col:'#00ff41', bar: total ? Math.min(1, xpTotal/1000) : 0 },
          ].map((s, i) => (
            <div key={s.k} style={{ padding:'18px 24px', borderRight: i < 3 ? '1px solid #0d1a28' : 'none', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${s.col}44,transparent)` }}/>
              <div style={{ fontFamily:'var(--fp)', fontSize:8, color:'#1a3050', letterSpacing:3, marginBottom:8 }}>{s.k}</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:14, color:s.col, textShadow:`0 0 10px ${s.col}55`, marginBottom:8 }}>{s.v}</div>
              <div style={{ height:2, background:'rgba(12,18,34,.62)',  backdropFilter:'blur(16px)' }}>
                <div style={{ height:'100%', width:`${s.bar*100}%`, background:s.col, boxShadow:`0 0 6px ${s.col}66`, transition:'width .5s' }}/>
              </div>
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ flex:1, padding:'24px 40px', position:'relative', zIndex:2 }}>

          {/* Filters */}
          <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
            {([['ALL','ach_all'],['UNLOCKED','ach_unlocked'],['LOCKED','ach_locked']] as const).map(([f, tk]) => (
              <button key={f} onClick={() => setFilter(f)} style={{ fontFamily:'var(--fp)', fontSize:9, padding:'7px 16px', cursor:'pointer', background: filter===f ? 'rgba(255,215,0,.1)' : 'transparent', color: filter===f ? '#ffd700' : '#2a3a54', border:`1px solid ${filter===f ? '#ffd70066' : '#0d1a28'}`, letterSpacing:1, transition:'all .15s' }}>{t(tk)}</button>
            ))}
            <div style={{ width:1, height:20, background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)', margin:'0 2px' }}/>
            {['ALL','EPIC','RARE','COMMON'].map(r => {
              const rc = RARITY_CFG[r]
              const col = rc?.col ?? '#2a3a54'
              const active = rarFilter === r
              return (
                <button key={r} onClick={() => setRarFilter(r)} style={{ fontFamily:'var(--fp)', fontSize:9, padding:'7px 14px', cursor:'pointer', background: active ? `${col}12` : 'transparent', color: active ? col : '#2a3a54', border:`1px solid ${active ? col + '55' : '#0d1a28'}`, letterSpacing:1, transition:'all .15s' }}>{r}</button>
              )
            })}
          </div>

          {/* Grid */}
          {loading ? (
            <div style={{ fontFamily:'var(--fm)', fontSize:13, color:'#2a3a54', textAlign:'center', padding:'48px 0' }}>{t('common_loading')}</div>
          ) : shown.length === 0 ? (
            <div style={{ fontFamily:'var(--fm)', fontSize:13, color:'#2a3a54', textAlign:'center', padding:'48px 0' }}>
              {filter==='UNLOCKED' ? t('ach_no_unlocked') : filter==='LOCKED' ? t('ach_no_locked') : t('ach_no_all')}
            </div>
          ) : (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:10 }}>
              {shown.map((a, i) => (
                <div key={a.id} style={{ animation:`ac-in .3s ease ${i * 0.04}s both` }}>
                  <AchCard ach={a} unlocked={unlockedIds.has(a.id)} unlockedAt={unlockedMap[a.id]} />
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </>
  )
}