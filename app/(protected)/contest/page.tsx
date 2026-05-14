'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'

const kf = `
@keyframes ct-in    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
@keyframes ct-scan  { 0%{top:-100px} 100%{top:110%} }
@keyframes ct-ping  { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.5);opacity:0} }
@keyframes ct-flame { 0%,100%{transform:scaleY(1) translateY(0)} 50%{transform:scaleY(1.08) translateY(-1px)} }
@keyframes ct-glow  { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes ct-slide { from{transform:translateX(-100%)} to{transform:translateX(200%)} }
`

const FP = (sz:number, col='#c0d0e0', ls=0): React.CSSProperties => ({ fontFamily:'var(--fp)', fontSize:sz, color:col, letterSpacing:ls })
const FM = (sz:number, col='#5a7a9a'): React.CSSProperties => ({ fontFamily:'var(--fm)', fontSize:sz, color:col })

/* ── Countdown ─────────────────────────────────────────────────────── */
function Countdown({ endDate, startDate, status }: { endDate:string; startDate:string; status:string }) {
  const [parts, setParts] = useState({ d:0, h:0, m:0, s:0, done:false })
  useEffect(() => {
    const tick = () => {
      const target = status === 'UPCOMING' ? new Date(startDate).getTime() : new Date(endDate).getTime()
      const diff = target - Date.now()
      if (diff <= 0) { setParts({ d:0, h:0, m:0, s:0, done:true }); return }
      setParts({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000)  / 60000),
        s: Math.floor((diff % 60000)    / 1000),
        done: false,
      })
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [endDate, startDate, status])

  if (parts.done) return <span style={FP(10,'#3a5070')}>ДУУССАН</span>
  const col = status === 'ACTIVE' ? '#ff6b35' : '#00e5ff'
  const { t } = useLang()
  const seg = (v:number, lbl:string) => (
    <div style={{ textAlign:'center' }}>
      <div style={{ ...FP(20, col), background:'rgba(8,12,22,.9)', border:`1px solid ${col}33`,
        padding:'6px 10px', minWidth:44, fontVariantNumeric:'tabular-nums',
        textShadow:`0 0 12px ${col}88` }}>
        {String(v).padStart(2,'0')}
      </div>
      <div style={{ ...FP(4,'#2a3a54',2), marginTop:4 }}>{lbl}</div>
    </div>
  )
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:6 }}>
      {parts.d > 0 && <>{seg(parts.d, t('ct_days'))}<span style={{ ...FP(16,col), marginTop:6 }}>:</span></>}
      {seg(parts.h, t('ct_hours'))}
      <span style={{ ...FP(16,col), marginTop:6 }}>:</span>
      {seg(parts.m, t('ct_mins'))}
      <span style={{ ...FP(16,col), marginTop:6 }}>:</span>
      {seg(parts.s, t('ct_secs'))}
    </div>
  )
}

/* ── Prize podium ───────────────────────────────────────────────────── */
function PrizePodium({ first, second, third }: { first:number; second:number; third:number }) {
  const medals = [
    { place:'2', prize:second, col:'#b0c0d0', h:44, icon:'🥈' },
    { place:'1', prize:first,  col:'#ffd700', h:60, icon:'🥇' },
    { place:'3', prize:third,  col:'#cd7f32', h:34, icon:'🥉' },
  ]
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:2, height:90 }}>
      {medals.map(m => (
        <div key={m.place} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div style={{ ...FP(7, m.col), marginBottom:3 }}>{m.prize.toLocaleString()}₮</div>
          <div style={{ width:'100%', height:m.h, background:`${m.col}12`,
            border:`1px solid ${m.col}44`, borderBottom:'none',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:16 }}>
            {m.icon}
          </div>
        </div>
      ))}
    </div>
  )
}

const STATUS_CFG = {
  ACTIVE:   { col:'#ff6b35', dim:'#cc4411', glow:'rgba(255,107,53,.18)', label:'LIVE',     badge:'rgba(255,107,53,.15)' },
  UPCOMING: { col:'#00e5ff', dim:'#0099bb', glow:'rgba(0,229,255,.12)',  label:'UPCOMING', badge:'rgba(0,229,255,.1)'  },
  ENDED:    { col:'#3a5070', dim:'#2a3a54', glow:'rgba(0,0,0,0)',        label:'ENDED',    badge:'rgba(0,0,0,0)'       },
}

export default function ContestPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [contests,  setContests]  = useState<any[]>([])
  const [fetching,  setFetching]  = useState(true)
  const [tab,       setTab]       = useState<'ACTIVE'|'UPCOMING'|'ENDED'>('ACTIVE')
  const [joining,   setJoining]   = useState<string|null>(null)   // contestId being joined
  const [joinMsg,   setJoinMsg]   = useState<{id:string;ok:boolean;text:string}|null>(null)

  useEffect(() => { if (!loading && !isAuthenticated) router.push('/') }, [loading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    fetch('/api/contest?status=ALL')
      .then(r => r.json())
      .then(d => { if (d.contests) setContests(d.contests) })
      .finally(() => setFetching(false))
  }, [isAuthenticated])

  if (loading && !user) return null

  const { t } = useLang()

  const joinContest = async (contestId: string) => {
    if (joining) return
    setJoining(contestId)
    setJoinMsg(null)
    try {
      const bearer = typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') : null
      const res  = await fetch('/api/contest/join', {
        method:  'POST',
        headers: { 'Content-Type':'application/json', ...(bearer ? { Authorization:`Bearer ${bearer}` } : {}) },
        body:    JSON.stringify({ contestId }),
      })
      const data = await res.json()
      if (data.ok) {
        setJoinMsg({ id: contestId, ok: true, text: data.alreadyJoined ? 'Аль хэдийн бүртгэгдсэн байна' : `✓ Бүртгэгдлээ! +${data.xp} XP · +${data.tokens} AI Token` })
        // Optimistically mark as joined
        setContests(prev => prev.map(c => c.id === contestId
          ? { ...c, participants: [...(c.participants||[]), { userId: (user as any)?.id, score:0 }], participantCount: (c.participantCount||0)+1 }
          : c
        ))
      } else {
        setJoinMsg({ id: contestId, ok: false, text: data.error || 'Алдаа гарлаа' })
      }
    } catch {
      setJoinMsg({ id: contestId, ok: false, text: 'Сүлжээний алдаа гарлаа' })
    } finally {
      setJoining(null)
    }
  }

  const plan      = (user as any)?.subscription?.plan ?? 'FREE'
  const planCol   = plan === 'VIP' ? '#ffd700' : plan === 'PRO' ? '#00e5ff' : '#3a5070'
  const filtered  = contests.filter(c => c.status === tab)

  const entryPrice = (c: any) =>
    plan === 'VIP' ? c.entryVip : plan === 'PRO' ? c.entryPro : c.entryFree


  return (
    <>
      <style>{kf}</style>
      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column',
        background:'#070d1a', position:'relative' }}>

        {/* animated scan line */}
        <div style={{ position:'fixed', left:0, right:0, height:120, pointerEvents:'none', zIndex:0,
          background:'linear-gradient(180deg,transparent,rgba(255,107,53,.006),transparent)',
          animation:'ct-scan 11s linear infinite' }}/>

        {/* ── HUD TOP BAR ─────────────────────────────────── */}
        <div style={{ display:'flex', alignItems:'stretch', borderBottom:'2px solid #0d1a28',
          background:'rgba(7,10,18,.98)', backdropFilter:'blur(24px)', flexShrink:0,
          position:'relative', zIndex:2, boxShadow:'0 2px 30px rgba(0,0,0,.6)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:2,
            background:'linear-gradient(90deg,transparent,#ff6b3566,transparent)' }}/>

          {/* Brand */}
          <div style={{ padding:'14px 28px', borderRight:'1px solid #0d1a28',
            display:'flex', flexDirection:'column', justifyContent:'center', gap:5, flexShrink:0 }}>
            <div style={FP(4,'#1a2a3a',5)}>ARENAHUB</div>
            <div style={{ ...FP(11,'#ff6b35',3), textShadow:'0 0 16px rgba(255,107,53,.5)' }}>CONTEST</div>
          </div>

          {/* Center */}
          <div style={{ flex:1, padding:'0 32px', display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <svg width="18" height="18" viewBox="0 0 10 10" style={{ imageRendering:'pixelated' }}>
                <rect x="4" y="0" width="2" height="6" fill="#ff6b35"/>
                <rect x="2" y="6" width="6" height="1" fill="#ff6b35"/>
                <rect x="1" y="7" width="8" height="1" fill="#cc4400"/>
                <rect x="4" y="8" width="2" height="2" fill="#ff6b35"/>
              </svg>
              <span style={{ ...FP(11,'#ff6b35',2), textShadow:'0 0 10px rgba(255,107,53,.4)' }}>{t('ct_battle')}</span>
            </div>
            <div style={{ width:1, height:20, background:'#0d1a28' }}/>
            {contests.filter(c=>c.status==='ACTIVE').length > 0
              ? <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  <span style={{ position:'relative', display:'inline-flex' }}>
                    <span style={{ width:6, height:6, background:'#00ff41', borderRadius:'50%', display:'block' }}/>
                    <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#00ff41', animation:'ct-ping 1.4s ease-out infinite' }}/>
                  </span>
                  <span style={FP(6,'#00ff41',2)}>{contests.filter(c=>c.status==='ACTIVE').length} {t('ct_live')}</span>
                </div>
              : <span style={FP(6,'#2a3a54',2)}>{t('ct_no_contest')}</span>
            }
          </div>

          {/* Plan badge */}
          <div style={{ padding:'14px 28px', borderLeft:'1px solid #0d1a28',
            display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <div style={{ padding:'6px 14px', border:`1px solid ${planCol}44`,
              background:`${planCol}0e`, ...FP(7, planCol, 2) }}>
              {plan}
            </div>
            {plan === 'VIP' && <span style={FP(6,'#ffd700')}>{t('ct_vip_free')}</span>}
            {plan === 'PRO' && <span style={FP(6,'#00e5ff')}>{t('ct_pro_disc')}</span>}
          </div>
        </div>

        {/* ── STATUS TABS ─────────────────────────────────── */}
        <div style={{ display:'flex', borderBottom:'1px solid #0d1a28',
          background:'rgba(7,10,18,.95)', flexShrink:0, position:'relative', zIndex:2 }}>
          {(['ACTIVE','UPCOMING','ENDED'] as const).map(st => {
            const cfg = STATUS_CFG[st]
            const cnt = contests.filter(c => c.status === st).length
            const active = tab === st
            return (
              <button key={st} onClick={() => setTab(st)} style={{
                padding:'13px 32px', border:'none',
                cursor:'pointer', position:'relative', overflow:'hidden',
                borderBottom:`2px solid ${active ? cfg.col : 'transparent'}`,
                background: active ? cfg.badge : 'transparent',
                transition:'all .2s',
              }}>
                {active && <div style={{ position:'absolute', bottom:0, left:0, right:0, height:2,
                  background:cfg.col, boxShadow:`0 0 8px ${cfg.col}` }}/>}
                <span style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={FP(7, active ? cfg.col : '#3a5070', 2)}>{t(st === 'ACTIVE' ? 'ct_active' : st === 'UPCOMING' ? 'ct_upcoming' : 'ct_ended')}</span>
                  <span style={{ ...FP(5, active ? cfg.col : '#2a3a54'),
                    border:`1px solid ${active ? cfg.col+'55' : '#1a2a3a'}`,
                    padding:'2px 8px', background: active ? `${cfg.col}14` : 'transparent',
                    transition:'all .2s' }}>
                    {cnt}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        {/* ── BODY ───────────────────────────────────────── */}
        <div style={{ flex:1, padding:'28px 32px 56px', position:'relative', zIndex:2 }}>

          {/* Loading */}
          {fetching && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', padding:'100px 0', gap:16 }}>
              <div style={{ position:'relative', width:40, height:40 }}>
                <div style={{ position:'absolute', inset:0, border:'2px solid #ff6b3522', borderTop:'2px solid #ff6b35',
                  borderRadius:'50%', animation:'ct-glow 1s linear infinite' }}/>
              </div>
              <div style={FP(7,'#3a5070',3)}>{t('ct_loading')}</div>
            </div>
          )}

          {/* Empty state */}
          {!fetching && filtered.length === 0 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
              justifyContent:'center', padding:'80px 0', gap:20 }}>
              <div style={{ width:80, height:80, border:'2px solid #1a2a3a',
                display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>⚔</div>
              <div style={FP(9,'#2a3a54',2)}>
                {tab==='ACTIVE' ? t('ct_no_active') : tab==='UPCOMING' ? t('ct_no_upcoming') : t('ct_no_ended')}
              </div>
              <div style={FM(12)}>{t('ct_next_soon')}</div>
            </div>
          )}

          {/* Contest cards */}
          <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
            {filtered.map((c, i) => {
              const cfg   = STATUS_CFG[c.status as keyof typeof STATUS_CFG] || STATUS_CFG.ENDED
              const price = entryPrice(c)
              const isMe  = c.participants?.some((p:any) => p.userId === (user as any)?.id)
              const top3  = [...(c.participants||[])].sort((a:any,b:any)=>b.score-a.score).slice(0,3)
              const ended = c.status === 'ENDED'

              return (
                <div key={c.id} style={{
                  position:'relative', overflow:'hidden',
                  border:`1px solid ${cfg.col}2a`,
                  background:'rgba(8,12,22,.96)',
                  animation:`ct-in .35s ease ${i*.1}s both`,
                  boxShadow: c.status==='ACTIVE' ? `0 0 40px ${cfg.glow}, inset 0 0 40px rgba(0,0,0,.3)` : 'none',
                }}>
                  {/* Top color stripe */}
                  <div style={{ height:3, background:`linear-gradient(90deg,${cfg.col},${cfg.dim})`,
                    position:'relative', overflow:'hidden' }}>
                    <div style={{ position:'absolute', inset:0,
                      background:'linear-gradient(90deg,transparent 20%,rgba(255,255,255,.3) 50%,transparent 80%)',
                      animation:'ct-slide 2s ease infinite' }}/>
                  </div>

                  {/* Status badge — absolute top right */}
                  <div style={{ position:'absolute', top:16, right:20,
                    display:'flex', alignItems:'center', gap:7,
                    padding:'5px 12px', background:cfg.badge, border:`1px solid ${cfg.col}33` }}>
                    {c.status === 'ACTIVE' && (
                      <span style={{ position:'relative', display:'inline-flex', width:8, height:8 }}>
                        <span style={{ width:8, height:8, background:'#00ff41', borderRadius:'50%', display:'block' }}/>
                        <span style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#00ff41',
                          animation:'ct-ping 1.2s ease-out infinite' }}/>
                      </span>
                    )}
                    <span style={FP(6, cfg.col, 2)}>{cfg.label}</span>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:0 }}>

                    {/* ── LEFT PANEL ── */}
                    <div style={{ padding:'24px 28px', borderRight:'1px solid #0d1a28' }}>

                      {/* Title */}
                      <div style={{ ...FP(4, cfg.col, 4), marginBottom:10, opacity:.8 }}>
                        CODING BATTLE #{i + 1}
                      </div>
                      <h2 style={{ ...FP(18,'#e8f0fa'), margin:'0 0 10px', lineHeight:1.2 }}>
                        {c.title}
                      </h2>
                      <p style={{ ...FM(12), margin:'0 0 24px', lineHeight:1.8 }}>
                        {c.description}
                      </p>

                      {/* Countdown or dates */}
                      <div style={{ marginBottom:24 }}>
                        {c.status !== 'ENDED' && (
                          <>
                            <div style={{ ...FP(5,'#3a5070',3), marginBottom:10 }}>
                              {c.status === 'ACTIVE' ? t('ct_ends_in') : t('ct_starts_in')}
                            </div>
                            <Countdown endDate={c.endDate} startDate={c.startDate} status={c.status}/>
                          </>
                        )}
                        {c.status === 'ENDED' && (
                          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                            <span style={FP(5,'#2a3a54',2)}>{t('ct_period')}</span>
                            <span style={FM(12)}>
                              {new Date(c.startDate).toLocaleDateString('mn-MN')} —{' '}
                              {new Date(c.endDate).toLocaleDateString('mn-MN')}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Stats row */}
                      <div style={{ display:'flex', gap:1, background:'#0d1a28',
                        overflow:'hidden', marginBottom:24 }}>
                        {[
                          { l: t('ct_participants'), v:String(c.participantCount), col:cfg.col  },
                          { l: t('ct_tasks'),        v:`${c.taskCount}`,            col:'#00e5ff'},
                          { l: t('ct_prize_pool'),   v:`${c.prizePool?.toLocaleString()}₮`, col:'#ffd700'},
                        ].map(s => (
                          <div key={s.l} style={{ flex:1, padding:'14px 16px',
                            background:'rgba(8,12,22,.96)', borderRight:'1px solid #0d1a28' }}>
                            <div style={FP(4,'#2a3a54',2)}>{s.l}</div>
                            <div style={{ ...FP(13, s.col), marginTop:6,
                              textShadow:`0 0 8px ${s.col}44` }}>{s.v}</div>
                          </div>
                        ))}
                      </div>

                      {/* Entry price per plan */}
                      <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
                        {[
                          { lbl:'FREE', price:c.entryFree, col:'#3a5070', active: plan==='FREE' },
                          { lbl:'PRO',  price:c.entryPro,  col:'#00e5ff', active: plan==='PRO'  },
                          { lbl:'VIP',  price:c.entryVip,  col:'#ffd700', active: plan==='VIP'  },
                        ].map(p => (
                          <div key={p.lbl} style={{
                            padding:'8px 14px', border:`1px solid ${p.active ? p.col+'88' : p.col+'22'}`,
                            background: p.active ? `${p.col}10` : 'transparent',
                            boxShadow: p.active ? `0 0 12px ${p.col}22` : 'none',
                          }}>
                            <div style={{ ...FP(4, p.active ? p.col : p.col+'66', 2), marginBottom:4 }}>
                              {p.lbl}{p.active && ' ◄'}
                            </div>
                            <div style={{ ...FP(10, p.active ? p.col : '#2a3a54') }}>
                              {p.price === 0 ? 'ҮНЭГҮЙ' : `₮${p.price.toLocaleString()}`}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Participation rewards */}
                      {!ended && (
                        <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                          <div style={{ display:'flex', alignItems:'center', gap:6,
                            padding:'6px 12px', background:'rgba(255,215,0,.08)',
                            border:'1px solid #ffd70033' }}>
                            <span style={{ fontSize:12 }}>⚡</span>
                            <span style={FP(7,'#ffd700')}>+150 XP</span>
                          </div>
                          <div style={{ display:'flex', alignItems:'center', gap:6,
                            padding:'6px 12px', background:'rgba(64,196,255,.08)',
                            border:'1px solid #40c4ff33' }}>
                            <span style={{ fontSize:12 }}>🤖</span>
                            <span style={FP(7,'#40c4ff')}>+15 AI Token</span>
                          </div>
                          <div style={{ ...FP(5,'#2a3a54'), padding:'6px 10px',
                            border:'1px solid #1a2a3a', display:'flex', alignItems:'center' }}>
                            {t('ct_reward_label')}
                          </div>
                        </div>
                      )}

                      {/* Feedback message */}
                      {joinMsg?.id === c.id && joinMsg && (
                        <div style={{ ...FP(7, joinMsg.ok ? '#00ff41' : '#ff2d55'),
                          padding:'10px 16px', marginBottom:12,
                          border:`1px solid ${joinMsg.ok ? '#00ff4133' : '#ff2d5533'}`,
                          background: joinMsg.ok ? 'rgba(0,255,65,.06)' : 'rgba(255,45,85,.06)' }}>
                          {joinMsg.text}
                        </div>
                      )}

                      {/* Join / joined button */}
                      {!ended && !isMe && (
                        <button
                          onClick={() => joinContest(c.id)}
                          disabled={joining === c.id}
                          style={{
                            display:'inline-flex', alignItems:'center', gap:12,
                            padding:'14px 32px', border:'none', cursor: joining === c.id ? 'wait' : 'pointer',
                            background: joining === c.id
                              ? 'rgba(255,107,53,.3)'
                              : `linear-gradient(90deg,${cfg.col},${cfg.dim})`,
                            color:'#050a12', ...FP(9,'#050a12',2),
                            boxShadow: joining === c.id ? 'none' : `0 4px 20px ${cfg.glow}`,
                            transition:'all .2s', opacity: joining === c.id ? .7 : 1,
                          }}
                          onMouseEnter={e => { if (joining !== c.id) (e.currentTarget as HTMLButtonElement).style.opacity='.85' }}
                          onMouseLeave={e => { if (joining !== c.id) (e.currentTarget as HTMLButtonElement).style.opacity='1' }}>
                          {joining === c.id ? t('ct_joining') : t('ct_join')}
                          {joining !== c.id && (
                            <span style={{ padding:'3px 10px', background:'rgba(0,0,0,.2)', ...FP(7,'#050a12') }}>
                              {price === 0 ? t('ct_free') : `₮${price.toLocaleString()}`}
                            </span>
                          )}
                        </button>
                      )}
                      {!ended && isMe && (
                        <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                          <div style={{ display:'inline-flex', alignItems:'center', gap:10,
                            padding:'14px 32px', border:'1px solid #00ff4144',
                            background:'rgba(0,255,65,.06)', ...FP(9,'#00ff41',2) }}>
                            {t('ct_joined')}
                          </div>
                          <div style={FM(11)}>{t('ct_joined_rewards')}</div>
                        </div>
                      )}
                    </div>

                    {/* ── RIGHT PANEL — prizes + leaderboard ── */}
                    <div style={{ display:'flex', flexDirection:'column' }}>

                      {/* Prize podium */}
                      <div style={{ padding:'24px 24px 20px', borderBottom:'1px solid #0d1a28' }}>
                        <div style={{ ...FP(5,'#2a3a54',3), marginBottom:16 }}>{t('ct_prize_label')}</div>
                        <PrizePodium first={c.prizeFirst} second={c.prizeSecond} third={c.prizeThird}/>
                        <div style={{ display:'flex', flexDirection:'column', gap:4, marginTop:14 }}>
                          {[
                            ['🥇 1-р байр', c.prizeFirst,  '#ffd700'],
                            ['🥈 2-р байр', c.prizeSecond, '#b0c0d0'],
                            ['🥉 3-р байр', c.prizeThird,  '#cd7f32'],
                          ].map(([lbl,v,col]) => (
                            <div key={String(lbl)} style={{ display:'flex', justifyContent:'space-between',
                              alignItems:'center', padding:'6px 10px',
                              background:'rgba(13,20,38,.4)', border:'1px solid #0d1a28' }}>
                              <span style={FM(11)}>{lbl}</span>
                              <span style={{ ...FP(10, col as string) }}>{(v as number).toLocaleString()}₮</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top scores */}
                      <div style={{ flex:1, padding:'16px 24px' }}>
                        <div style={{ ...FP(5,'#2a3a54',3), marginBottom:12 }}>
                          {top3.length > 0 ? '🏅 TOP SCORE' : '👥 ОРОЛЦОГЧИД'}
                        </div>
                        {top3.length === 0 ? (
                          <div style={{ padding:'20px 0', textAlign:'center' }}>
                            <div style={FM(11)}>Одоогоор оролцогч байхгүй</div>
                            <div style={{ ...FM(10,'#1a2a3a'), marginTop:6 }}>Эхний байрыг та эзлэх үү?</div>
                          </div>
                        ) : top3.map((p:any, ri:number) => {
                          const rankCol = ri===0?'#ffd700':ri===1?'#b0c0d0':'#cd7f32'
                          return (
                            <div key={p.id} style={{ display:'flex', alignItems:'center', gap:10,
                              padding:'10px 12px', marginBottom:4,
                              background:`${rankCol}08`, border:`1px solid ${rankCol}22`,
                              borderLeft:`3px solid ${rankCol}` }}>
                              <span style={{ ...FP(9, rankCol), minWidth:20 }}>#{ri+1}</span>
                              <span style={{ ...FM(11,'#7a9ab8'), flex:1, overflow:'hidden',
                                textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                                {p.userId?.slice(0,10)}…
                              </span>
                              <span style={{ ...FP(9,'#00ff41'), whiteSpace:'nowrap' }}>
                                {p.score?.toLocaleString()} pts
                              </span>
                            </div>
                          )
                        })}
                      </div>
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