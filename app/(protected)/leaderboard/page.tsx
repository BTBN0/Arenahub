'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import PixelIcon from '@/components/ui/PixelIcon'
import CountryFlag from '@/components/ui/CountryFlag'
import { useLang } from '@/context/LanguageContext'

const kf = `
@keyframes lb-in   { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes lb-scan { 0%{top:-80px} 100%{top:100%} }
@keyframes lb-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
@keyframes lb-glow  { 0%,100%{opacity:.6} 50%{opacity:1} }
@keyframes lb-pulse { 0%,100%{box-shadow:0 0 30px rgba(255,215,0,.15)} 50%{box-shadow:0 0 60px rgba(255,215,0,.35)} }
@keyframes pop-in   { from{opacity:0;transform:scale(.93) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
`

const fp = { fontFamily:'var(--fp)' } as const
const fm = { fontFamily:'var(--fm)' } as const

const RANK_CFG = [
  { col: '#ffd700', glow: 'rgba(255,215,0,0.25)',  label: '#1', icon: 'crown'  as const, podH: 160 },
  { col: '#b0c0d0', glow: 'rgba(176,192,208,0.15)', label: '#2', icon: 'trophy' as const, podH: 120 },
  { col: '#cd7f32', glow: 'rgba(205,127,50,0.2)',  label: '#3', icon: 'star'   as const, podH: 100 },
]

type Player = {
  id: string; username: string; xp: number; level: number
  avatarUrl?: string | null; country?: string | null; bio?: string | null
  streakCount?: number; _count?: { taskSubmissions: number; enrollments: number }
}

function Avatar({ player, size, col, fontSize }: { player: Player; size: number; col: string; fontSize: number }) {
  return player.avatarUrl ? (
    <img src={player.avatarUrl} alt={player.username}
      style={{ width: size, height: size, objectFit: 'cover', imageRendering: 'pixelated', display: 'block' }} />
  ) : (
    <span style={{ ...fp, fontSize, color: col }}>{player.username?.slice(0, 2).toUpperCase()}</span>
  )
}

function ProfilePopup({ player, rank, onClose }: { player: Player; rank: number; onClose: () => void }) {
  const cfg       = RANK_CFG[rank - 1]
  const accentCol = cfg?.col ?? '#00e5ff'
  const xpNext    = player.level * 500
  const xpPct     = Math.min((player.xp % xpNext) / xpNext * 100, 100)

  const STATS = [
    { label:'RANK',    value:`#${rank}`,                                col: accentCol },
    { label:'LEVEL',   value:`LV. ${player.level}`,                    col:'#00e5ff'  },
    { label:'XP',      value:(player.xp ?? 0).toLocaleString(),        col:'#ffd700'  },
    { label:'STREAK',  value:`${player.streakCount ?? 0} 🔥`,          col:'#ff6b35'  },
    { label:'TASKS',   value:`${player._count?.taskSubmissions ?? 0}`, col:'#00ff41'  },
    { label:'COURSES', value:`${player._count?.enrollments ?? 0}`,     col:'#a855f7'  },
  ]

  return (
    <div style={{ position:'fixed', inset:0, zIndex:300, background:'rgba(0,0,0,.82)',
      backdropFilter:'blur(14px)', display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div style={{ width:500, background:'#020609', position:'relative', animation:'pop-in .22s ease',
        boxShadow:`0 0 0 1px ${accentCol}28, 0 0 80px ${accentCol}22, 0 32px 64px rgba(0,0,0,.9)` }}>

        {/* top color bar */}
        <div style={{ height:3, background:`linear-gradient(90deg,transparent,${accentCol},transparent)` }}/>

        {/* header bg glow */}
        <div style={{ position:'absolute', top:3, left:0, right:0, height:160,
          background:`radial-gradient(ellipse at 50% 0%,${accentCol}0f 0%,transparent 70%)`, pointerEvents:'none' }}/>

        {/* close */}
        <button onClick={onClose}
          style={{ position:'absolute', top:12, right:14, background:'transparent', border:'none',
            color:'#2a4060', cursor:'pointer', fontSize:18, lineHeight:1, zIndex:10, transition:'color .15s' }}
          onMouseEnter={e => (e.currentTarget.style.color='#ff2d55')}
          onMouseLeave={e => (e.currentTarget.style.color='#2a4060')}>✕</button>

        {/* rank icon */}
        {rank <= 3 && (
          <div style={{ position:'absolute', top:14, left:16 }}>
            <PixelIcon name={cfg.icon} size={22} col={accentCol}/>
          </div>
        )}

        {/* HERO: avatar + name */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'28px 24px 20px', gap:12 }}>
          {/* avatar ring */}
          <div style={{ position:'relative' }}>
            <div style={{ width:120, height:120, border:`2px solid ${accentCol}`,
              background:`${accentCol}08`, overflow:'hidden', display:'flex', alignItems:'center',
              justifyContent:'center', boxShadow:`0 0 0 6px ${accentCol}14, 0 0 40px ${accentCol}33` }}>
              <Avatar player={player} size={120} col={accentCol} fontSize={24}/>
            </div>
            {/* rank badge on avatar */}
            {rank <= 3 && (
              <div style={{ position:'absolute', bottom:-8, right:-8, width:30, height:30,
                background:accentCol, display:'flex', alignItems:'center', justifyContent:'center',
                ...fp, fontSize:10, color:'#020609', boxShadow:`0 0 16px ${accentCol}` }}>
                {rank}
              </div>
            )}
          </div>

          {/* name + country */}
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <div style={{ ...fp, fontSize:13, color:accentCol, letterSpacing:2, textShadow:`0 0 18px ${accentCol}66` }}>
              {player.username}
            </div>
            {player.country && (
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <CountryFlag country={player.country} size={20}/>
                <span style={{ ...fm, fontSize:12, color:'#3a5070' }}>{player.country}</span>
              </div>
            )}
            {player.bio && (
              <div style={{ ...fm, fontSize:12, color:'#3a5a7a', textAlign:'center',
                lineHeight:1.7, maxWidth:280, marginTop:4, fontStyle:'italic' }}>
                "{player.bio}"
              </div>
            )}
          </div>
        </div>

        {/* divider */}
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${accentCol}22,transparent)`, margin:'0 24px' }}/>

        {/* STATS grid */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:1, margin:'16px 0', background:'#0a1020' }}>
          {STATS.map(s => (
            <div key={s.label} style={{ padding:'12px 0', background:'#020609', display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}>
              <div style={{ ...fp, fontSize:3, color:'#1a3050', letterSpacing:2 }}>{s.label}</div>
              <div style={{ ...fp, fontSize:7, color:s.col }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* XP BAR */}
        <div style={{ padding:'0 24px 24px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
            <span style={{ ...fp, fontSize:4, color:'#1a3050', letterSpacing:2 }}>XP TO NEXT LEVEL</span>
            <span style={{ ...fp, fontSize:4, color:`${accentCol}88` }}>{Math.round(xpPct)}%</span>
          </div>
          <div style={{ height:6, background:'#0a1020', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', inset:0, width:`${xpPct}%`,
              background:`linear-gradient(90deg,${accentCol}88,${accentCol})`,
              boxShadow:`0 0 8px ${accentCol}66`, transition:'width .7s ease' }}/>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:5 }}>
            <span style={{ ...fm, fontSize:11, color:'#1a3050' }}>{(player.xp ?? 0).toLocaleString()} XP</span>
            <span style={{ ...fm, fontSize:11, color:'#1a3050' }}>LV {player.level + 1} → {(player.level * xpNext).toLocaleString()}</span>
          </div>
        </div>

        {/* bottom accent */}
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${accentCol}18,transparent)` }}/>
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const { isAuthenticated, loading, user } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [board,        setBoard]        = useState<Player[]>([])
  const [popup,        setPopup]        = useState<{ player: Player; rank: number } | null>(null)
  const [search,       setSearch]       = useState('')
  const [searchRes,    setSearchRes]    = useState<(Player & { rank: number })[]>([])
  const [searching,    setSearching]    = useState(false)

  useEffect(() => { if (!loading && !isAuthenticated) router.push('/') }, [loading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    const token = localStorage.getItem('arenahub_token')
    fetch('/api/leaderboard?limit=20', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.ok) setBoard(d.users || []) })
      .catch(() => {})
  }, [isAuthenticated])

  // debounced search
  useEffect(() => {
    if (!search.trim()) { setSearchRes([]); return }
    const t = setTimeout(async () => {
      setSearching(true)
      try {
        const token = localStorage.getItem('arenahub_token')
        const r = await fetch(`/api/leaderboard?search=${encodeURIComponent(search)}`, { headers: { Authorization: `Bearer ${token}` } })
        const d = await r.json()
        if (d.ok) setSearchRes(d.users || [])
      } catch {} finally { setSearching(false) }
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  if (loading || !user) return null

  const plan = user?.subscription?.plan ?? 'FREE'
  const hasAccess = plan === 'PRO' || plan === 'VIP' || user?.role === 'ADMIN'

  /* ── PAYWALL ── */
  if (!hasAccess) return (
    <>
      <style>{kf}</style>
      <main style={{ flex:1, overflow:'hidden', display:'flex', flexDirection:'column', position:'relative' }}>
        <div style={{ position:'absolute', inset:0, filter:'blur(6px) brightness(.35)', pointerEvents:'none', overflow:'hidden', userSelect:'none' }}>
          <div style={{ height:72, background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', borderBottom:'2px solid #0d1a28' }}/>
          <div style={{ padding:'32px 40px 24px' }}>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:12, marginTop:24 }}>
              {[{h:120,w:140,c:'#b0c0d0'},{h:160,w:160,c:'#ffd700'},{h:100,w:130,c:'#cd7f32'}].map((pp,i)=>(
                <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                  <div style={{ width:52, height:52, background:`${pp.c}18`, border:`2px solid ${pp.c}44` }}/>
                  <div style={{ width:80, height:8, background:`${pp.c}22` }}/>
                  <div style={{ width:pp.w, height:pp.h, background:`${pp.c}08`, border:`1px solid ${pp.c}22` }}/>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:10 }}>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:16, padding:'48px 56px', background:'rgba(8,12,20,.92)', border:'2px solid #ffd70033', boxShadow:'0 0 80px rgba(255,215,0,.08)', backdropFilter:'blur(20px)', animation:'lb-pulse 3s ease infinite', maxWidth:480, textAlign:'center' }}>
            <div style={{ position:'absolute', top:0, left:'20%', right:'20%', height:2, background:'linear-gradient(90deg,transparent,#ffd700,transparent)' }}/>
            <div style={{ animation:'lb-float 3s ease infinite' }}><PixelIcon name="lock" size={48} col="#ffd70088"/></div>
            <div style={{ ...fp, fontSize:5, color:'#ffd70055', letterSpacing:4 }}>{t('lb_premium')}</div>
            <div style={{ ...fp, fontSize:13, color:'#ffd700', letterSpacing:2, animation:'lb-glow 2s ease infinite' }}>{t('lb_ranking')}</div>
            <div style={{ ...fm, fontSize:13, color:'#4a6080', lineHeight:1.8, marginTop:4 }}>
              {t('lb_lock_desc').split('\n').map((l,i)=><span key={i}>{l}{i===0&&<br/>}</span>)}
            </div>
            <div style={{ display:'flex', gap:12, marginTop:4 }}>
              {[{label:'PRO',col:'#00e5ff',desc:'Monthly'},{label:'VIP',col:'#ffd700',desc:'Annual'}].map(pp=>(
                <div key={pp.label} style={{ padding:'10px 20px', border:`1px solid ${pp.col}44`, background:`${pp.col}08`, textAlign:'center' }}>
                  <div style={{ ...fp, fontSize:8, color:pp.col, letterSpacing:2 }}>{pp.label}</div>
                  <div style={{ ...fp, fontSize:4, color:`${pp.col}66`, marginTop:4 }}>{pp.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ ...fp, fontSize:5, color:'#2a4060', marginTop:4 }}>{t('lb_current_plan')}: <span style={{ color:'#3a5070' }}>FREE</span></div>
            <button onClick={()=>router.push('/pricing')}
              style={{ ...fp, fontSize:7, letterSpacing:2, padding:'14px 36px', cursor:'pointer', border:'2px solid #ffd700', background:'rgba(255,215,0,.08)', color:'#ffd700', boxShadow:'0 0 30px rgba(255,215,0,.15)', marginTop:4, transition:'all .2s' }}
              onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,215,0,.18)';(e.currentTarget as HTMLButtonElement).style.boxShadow='0 0 50px rgba(255,215,0,.3)'}}
              onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,215,0,.08)';(e.currentTarget as HTMLButtonElement).style.boxShadow='0 0 30px rgba(255,215,0,.15)'}}>
              {t('lb_upgrade')}
            </button>
          </div>
        </div>
      </main>
    </>
  )

  const top3 = board.slice(0, 3)
  const rest = board.slice(3)
  const podiumOrder = [
    { player: top3[1], rankIdx: 1 },
    { player: top3[0], rankIdx: 0 },
    { player: top3[2], rankIdx: 2 },
  ]

  return (
    <>
      <style>{kf}</style>
      {popup && <ProfilePopup player={popup.player} rank={popup.rank} onClose={() => setPopup(null)}/>}

      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', position:'relative' }}>
        <div style={{ position:'fixed', left:0, right:0, height:80, pointerEvents:'none', zIndex:0, background:'linear-gradient(180deg,transparent,rgba(255,215,0,.008),transparent)', animation:'lb-scan 9s linear infinite' }}/>

        {/* HUD */}
        <div style={{ display:'flex', alignItems:'stretch', borderBottom:'2px solid #0d1a28', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', flexShrink:0, position:'relative', zIndex:2, boxShadow:'0 2px 20px rgba(0,0,0,.5)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#ffd70044,transparent)' }}/>
          <div style={{ padding:'16px 28px', borderRight:'1px solid #0d1a28', flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
            <div style={{ ...fp, fontSize:5, color:'#1a3050', letterSpacing:4 }}>ARENAHUB</div>
            <div style={{ ...fp, fontSize:10, color:'#ffd700', letterSpacing:3, textShadow:'0 0 12px rgba(255,215,0,.4)' }}>{t('lb_ranking')}</div>
          </div>
          <div style={{ flex:1, padding:'0 28px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ ...fp, fontSize:8, color:'#1a3050' }}>▸</span>
              <span style={{ ...fp, fontSize:10, color:'#ffd700', letterSpacing:3, textShadow:'0 0 10px rgba(255,215,0,.3)' }}>LEADERBOARD</span>
            </div>
            <div style={{ width:1, height:24, background:'#0d1a28' }}/>
            <span style={{ ...fp, fontSize:6, color:'#2a3a54', letterSpacing:2 }}>{board.length} {t('lb_players')}</span>
          </div>

          {/* Search bar */}
          <div style={{ padding:'10px 20px', borderLeft:'1px solid #0d1a28', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ position:'relative', display:'flex', alignItems:'center' }}>
              <span style={{ position:'absolute', left:10, ...fp, fontSize:8, color:'#1a3050', pointerEvents:'none' }}>⌕</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search player..."
                style={{ ...fm, fontSize:12, padding:'7px 12px 7px 28px', background:'#060e1a', border:'1px solid #0d1a28', color:'#7a9ab8', outline:'none', width:200, transition:'border-color .15s, width .2s' }}
                onFocus={e => { e.currentTarget.style.borderColor='#ffd70066'; e.currentTarget.style.width='260px' }}
                onBlur={e => { e.currentTarget.style.borderColor='#0d1a28'; e.currentTarget.style.width='200px' }}
              />
              {search && (
                <button onClick={() => setSearch('')}
                  style={{ position:'absolute', right:8, background:'transparent', border:'none', color:'#2a4060', cursor:'pointer', fontSize:14, lineHeight:1 }}
                  onMouseEnter={e => (e.currentTarget.style.color='#ff2d55')}
                  onMouseLeave={e => (e.currentTarget.style.color='#2a4060')}>✕</button>
              )}
            </div>
            {searching && <span style={{ ...fp, fontSize:5, color:'#ffd70066' }}>...</span>}
          </div>

          <div style={{ padding:'16px 28px', borderLeft:'1px solid #0d1a28', display:'flex', alignItems:'center', flexShrink:0 }}>
            <span style={{ ...fp, fontSize:7, color:'#3a5070' }}>🏆 GLOBAL RANK</span>
          </div>
        </div>

        {/* PODIUM */}
        <div style={{ padding:'32px 40px 24px', position:'relative', zIndex:2, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:28 }}>
            <div style={{ width:3, height:18, background:'#ffd700', boxShadow:'0 0 8px #ffd700' }}/>
            <div style={{ ...fp, fontSize:7, color:'#2a4060', letterSpacing:4 }}>{t('lb_top_players')}</div>
          </div>

          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:12 }}>
            {podiumOrder.map(({ player, rankIdx }, i) => {
              if (!player) return <div key={i} style={{ width:160 }}/>
              const cfg = RANK_CFG[rankIdx]
              const avatarSz = rankIdx === 0 ? 68 : 52
              const isMe = player.username === user?.username
              return (
                <div key={player.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', animation:`lb-in .35s ease ${i * 0.08}s both` }}>
                  <div style={{ marginBottom:8 }}><PixelIcon name={cfg.icon} size={28} col={cfg.col}/></div>

                  {/* clickable avatar */}
                  <div onClick={() => setPopup({ player, rank: rankIdx + 1 })}
                    style={{ position:'relative', marginBottom:8, cursor:'pointer' }}
                    title={player.username}>
                    <div style={{ width:avatarSz, height:avatarSz, border:`2px solid ${cfg.col}`, background:`${cfg.col}0d`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 0 20px ${cfg.glow}`, overflow:'hidden', transition:'box-shadow .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.boxShadow=`0 0 32px ${cfg.col}55`)}
                      onMouseLeave={e => (e.currentTarget.style.boxShadow=`0 0 20px ${cfg.glow}`)}>
                      <Avatar player={player} size={avatarSz} col={cfg.col} fontSize={rankIdx===0?14:10}/>
                    </div>
                    {isMe && <div style={{ position:'absolute', inset:-3, border:'2px solid #00e5ff', boxShadow:'0 0 12px rgba(0,229,255,.4)', pointerEvents:'none' }}/>}
                  </div>

                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4, justifyContent:'center' }}>
                    {player.country && <CountryFlag country={player.country} size={18}/>}
                    <div style={{ ...fp, fontSize:6, color:cfg.col, letterSpacing:1, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{player.username}</div>
                  </div>
                  <div style={{ ...fp, fontSize:5, color:'#3a5070', marginBottom:10 }}>{player.xp?.toLocaleString()} XP · LV.{player.level}</div>

                  <div style={{ width:160, height:cfg.podH, background:`${cfg.col}08`, border:`1px solid ${cfg.col}33`, borderBottom:'none', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:`0 -4px 24px ${cfg.glow}` }}>
                    <div style={{ ...fp, fontSize:20, color:`${cfg.col}66`, textShadow:`0 0 16px ${cfg.col}` }}>{cfg.label}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* TABLE */}
        <div style={{ margin:'0 40px 40px', border:'1px solid #0d1a28', position:'relative', zIndex:2 }}>
          {/* table header */}
          <div style={{ display:'grid', gridTemplateColumns:'56px 44px 1fr 36px 70px 90px 110px', padding:'10px 20px', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid #0d1a28' }}>
            {[t('lb_rank'),'',t('lb_player'),t('lb_country'),'','LEVEL','XP'].map((h,i) => (
              <div key={i} style={{ ...fp, fontSize:5, color:'#1a3050', letterSpacing:3, textAlign: i > 4 ? 'right' : 'left' }}>{h}</div>
            ))}
          </div>

          {/* SEARCH RESULTS */}
          {search.trim() ? (
            searchRes.length === 0 && !searching ? (
              <div style={{ padding:'28px 20px', ...fp, fontSize:6, color:'#1a3050', textAlign:'center' }}>
                No players found for "{search}"
              </div>
            ) : (
              searchRes.map((pl, i) => {
                const isMe = pl.username === user?.username
                return (
                  <div key={pl.id}
                    style={{ display:'grid', gridTemplateColumns:'56px 44px 1fr 36px 70px 90px 110px', alignItems:'center', padding:'10px 20px', borderBottom:'1px solid #060e1a', background: isMe ? 'rgba(0,229,255,.04)' : 'rgba(255,215,0,.015)', transition:'background .15s', animation:`lb-in .15s ease ${i*0.04}s both` }}
                    onMouseEnter={e => (e.currentTarget.style.background = isMe ? 'rgba(0,229,255,.08)' : 'rgba(255,215,0,.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isMe ? 'rgba(0,229,255,.04)' : 'rgba(255,215,0,.015)')}>
                    <div style={{ ...fp, fontSize:6, color:'#ffd70088' }}>#{pl.rank}</div>
                    <div onClick={() => setPopup({ player: pl, rank: pl.rank })}
                      style={{ width:32, height:32, border:'1px solid #1a2840', background:'#060e1a', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor:'pointer', flexShrink:0, transition:'border-color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor='#ffd70066')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor='#1a2840')}>
                      <Avatar player={pl} size={32} col='#ffd70088' fontSize={6}/>
                    </div>
                    <div style={{ ...fp, fontSize:7, color: isMe ? '#00e5ff' : '#c0a840', letterSpacing:1 }}>{pl.username}</div>
                    <div>{pl.country && <CountryFlag country={pl.country} size={22}/>}</div>
                    <div style={{ ...fp, fontSize:5, color:'#00e5ff33' }}>{isMe ? t('lb_you') : ''}</div>
                    <div style={{ textAlign:'right', ...fp, fontSize:6, color:'#00ff41' }}>LVL {pl.level}</div>
                    <div style={{ textAlign:'right', ...fp, fontSize:7, color:'#ffd700' }}>{pl.xp?.toLocaleString()}</div>
                  </div>
                )
              })
            )
          ) : (
            /* NORMAL TOP 20 LIST */
            <>
              {board.length === 0 && (
                <div style={{ padding:40, textAlign:'center', ...fp, fontSize:7, color:'#1a3050' }}>{t('lb_no_players')}</div>
              )}
              {rest.map((pl, i) => {
                const isMe = pl.username === user?.username
                const rank = i + 4
                return (
                  <div key={pl.id}
                    style={{ display:'grid', gridTemplateColumns:'56px 44px 1fr 36px 70px 90px 110px', alignItems:'center', padding:'10px 20px', borderBottom:'1px solid #060e1a', background: isMe ? 'rgba(0,229,255,.04)' : 'transparent', transition:'background .15s', animation:`lb-in .25s ease ${i * 0.025}s both` }}
                    onMouseEnter={e => (e.currentTarget.style.background = isMe ? 'rgba(0,229,255,.08)' : 'rgba(255,255,255,.015)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isMe ? 'rgba(0,229,255,.04)' : 'transparent')}>
                    <div style={{ ...fp, fontSize:6, color:'#2a3a54' }}>#{rank}</div>
                    <div onClick={() => setPopup({ player: pl, rank })}
                      style={{ width:32, height:32, border:'1px solid #1a2840', background:'#060e1a', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', cursor:'pointer', flexShrink:0, transition:'border-color .15s' }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor='#00e5ff66')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor='#1a2840')}>
                      <Avatar player={pl} size={32} col='#4a6a8a' fontSize={6}/>
                    </div>
                    <div style={{ ...fp, fontSize:7, color: isMe ? '#00e5ff' : '#7a9ab8', letterSpacing:1 }}>{pl.username}</div>
                    <div>{pl.country && <CountryFlag country={pl.country} size={22}/>}</div>
                    <div style={{ ...fp, fontSize:5, color:'#00e5ff33' }}>{isMe ? t('lb_you') : ''}</div>
                    <div style={{ textAlign:'right', ...fp, fontSize:6, color:'#00ff41' }}>LVL {pl.level}</div>
                    <div style={{ textAlign:'right', ...fp, fontSize:7, color:'#ffd700' }}>{pl.xp?.toLocaleString()}</div>
                  </div>
                )
              })}
            </>
          )}
        </div>
      </main>
    </>
  )
}