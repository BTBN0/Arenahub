'use client'
import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { useRouter } from 'next/navigation'
import PixelIcon from '@/components/ui/PixelIcon'

const kf = `
@keyframes rw-in    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes rw-scan  { 0%{top:-80px} 100%{top:100%} }
@keyframes rw-pulse { 0%,100%{box-shadow:0 0 0 0 var(--pulse-col,#0ff3)} 50%{box-shadow:0 0 0 6px transparent} }
@keyframes rw-shine { 0%{transform:translateX(-100%) skewX(-15deg)} 100%{transform:translateX(300%) skewX(-15deg)} }
@keyframes rw-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
`

type Reward     = { id:string; title:string; description:string; icon:string; type:string; value:number; createdAt:string }
type UserReward = { id:string; rewardId:string; claimedAt:string|null; assignedAt:string; reward:Reward }

const TYPE_COLOR: Record<string, string> = {
  xp:'#ffd700', token:'#00e5ff', badge:'#bf5af2', coin:'#00ff41',
  visual:'#ff6b9d', access:'#00ff41', discount:'#00e5ff', other:'#3a5070',
}
const TYPE_ICON: Record<string, string> = {
  xp:'⚡', token:'🪙', badge:'🏅', coin:'💰', visual:'🎨', access:'🔑', discount:'🏷', other:'📦',
}

const tok  = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''
const authH = () => ({ Authorization: `Bearer ${tok()}` })

function RewardCard({ reward, userReward, onClaim, claiming }: { reward:Reward; userReward?:UserReward; onClaim:(id:string)=>void; claiming:string|null }) {
  const { t } = useLang()
  const assigned   = !!userReward
  const claimed    = !!userReward?.claimedAt
  const claimable  = assigned && !claimed
  const col        = TYPE_COLOR[reward.type] ?? '#3a5070'
  const isClaiming = claiming === reward.id
  const [hov, setHov] = useState(false)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ background: claimed ? `${col}0a` : claimable ? `${col}0d` : 'rgba(8,12,22,.96)', border:`1px solid ${hov && (assigned||claimed) ? col+'88' : claimed ? `${col}44` : claimable ? `${col}55` : '#0d1a28'}`, position:'relative', overflow:'hidden', opacity: !assigned && !claimed ? 0.45 : 1, transition:'border-color .2s,transform .15s,box-shadow .2s', transform: hov&&claimable ? 'translateY(-2px)' : 'none', boxShadow: hov&&claimable ? `0 8px 24px ${col}22` : claimable ? `0 0 0 0 ${col}33` : 'none', ...(claimable ? { '--pulse-col': col+'44' } as React.CSSProperties : {}), animation: claimable&&!hov ? 'rw-pulse 2.5s ease-in-out infinite' : 'none' }}>

      {/* top accent */}
      <div style={{ height:3, width:'100%', background: assigned||claimed ? `linear-gradient(90deg,transparent,${col},transparent)` : '#0d1a28', opacity: assigned||claimed ? 1 : 0.3 }}/>

      {/* shine on hover */}
      {hov && claimable && (
        <div style={{ position:'absolute', top:0, left:0, right:0, bottom:0, background:`linear-gradient(105deg,transparent 40%,${col}18 50%,transparent 60%)`, animation:'rw-shine .6s ease forwards', pointerEvents:'none' }}/>
      )}

      {/* claimed watermark */}
      {claimed && (
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%) rotate(-20deg)', fontFamily:'var(--fp)', fontSize:28, color:`${col}10`, letterSpacing:6, whiteSpace:'nowrap', pointerEvents:'none', userSelect:'none' }}>CLAIMED</div>
      )}

      <div style={{ padding:'16px 18px' }}>
        <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>

          {/* icon */}
          <div style={{ width:56, height:56, flexShrink:0, background:`${col}15`, border:`1px solid ${col}${assigned ? '44' : '22'}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, animation: claimable&&hov ? 'rw-float .6s ease-in-out infinite' : 'none', position:'relative' }}>
            {assigned ? reward.icon : <PixelIcon name="lock" size={28} col='#2a3a54'/>}
            {claimable && (
              <div style={{ position:'absolute', top:-4, right:-4, width:10, height:10, borderRadius:'50%', background:col, border:'2px solid #010508', boxShadow:`0 0 6px ${col}` }}/>
            )}
          </div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:'flex', alignItems:'flex-start', gap:8, marginBottom:5 }}>
              <span style={{ fontFamily:'var(--fp)', fontSize:7, color: assigned ? '#c0d0e0' : '#2a3a54', lineHeight:1.2 }}>{reward.title}</span>
              <span style={{ fontFamily:'var(--fp)', fontSize:3, color:col, padding:'2px 6px', border:`1px solid ${col}44`, background:`${col}0f`, marginLeft:'auto', flexShrink:0, letterSpacing:1 }}>
                {TYPE_ICON[reward.type] ?? '◆'} {reward.type.toUpperCase()}
              </span>
            </div>
            <div style={{ fontFamily:'var(--fm)', fontSize:11, color:'#3a5070', marginBottom:10, lineHeight:1.5 }}>{reward.description}</div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              {reward.value > 0 && (
                <span style={{ fontFamily:'var(--fp)', fontSize:5, color:col, background:`${col}12`, padding:'2px 8px', border:`1px solid ${col}33` }}>
                  +{reward.value} {reward.type.toUpperCase()}
                </span>
              )}
              {claimed && userReward?.claimedAt && (
                <span style={{ fontFamily:'var(--fp)', fontSize:4, color:`${col}66`, marginLeft:'auto' }}>
                  ✓ {new Date(userReward.claimedAt).toLocaleDateString('mn-MN')}
                </span>
              )}
              {claimable && (
                <button onClick={() => onClaim(reward.id)} disabled={isClaiming}
                  style={{ fontFamily:'var(--fp)', fontSize:6, padding:'7px 18px', cursor: isClaiming ? 'wait' : 'pointer', background: isClaiming ? `${col}22` : `${col}22`, color:col, border:`1px solid ${col}`, marginLeft:'auto', transition:'background .15s,box-shadow .15s', boxShadow: !isClaiming ? `0 0 10px ${col}44` : 'none', letterSpacing:1 }}
                  onMouseEnter={e => { if (!isClaiming) (e.currentTarget as HTMLButtonElement).style.background = `${col}44` }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = `${col}22` }}>
                  {isClaiming ? t('rw_claiming') : t('rw_claim')}
                </button>
              )}
              {!assigned && (
                <span style={{ fontFamily:'var(--fp)', fontSize:4, color:'#1a3050', marginLeft:'auto', letterSpacing:1 }}>LOCKED</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RewardsPage() {
  const { isAuthenticated, loading:authLoading, user } = useAuth()
  const { t } = useLang()
  const router = useRouter()

  const [allRewards,   setAllRewards]   = useState<Reward[]>([])
  const [userRewards,  setUserRewards]  = useState<UserReward[]>([])
  const [loading,      setLoading]      = useState(true)
  const [claiming,     setClaiming]     = useState<string|null>(null)
  const [flash,        setFlash]        = useState<{ msg:string; ok:boolean }|null>(null)
  const [typeFilter,   setTypeFilter]   = useState('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL'|'AVAILABLE'|'CLAIMED'|'LOCKED'>('ALL')

  useEffect(() => { if (!authLoading && !isAuthenticated) router.push('/') }, [authLoading, isAuthenticated, router])

  const load = useCallback(async () => {
    if (!isAuthenticated) return
    const [allRes, mineRes] = await Promise.all([
      fetch('/api/rewards', { headers: authH() }),
      fetch('/api/rewards?mine=true', { headers: authH() }),
    ])
    const [allData, mineData] = await Promise.all([allRes.json(), mineRes.json()])
    setAllRewards(allData.rewards ?? [])
    setUserRewards(mineData.rewards ?? [])
    setLoading(false)
  }, [isAuthenticated])

  useEffect(() => { load() }, [load])

  const showFlash = (msg: string, ok: boolean) => {
    setFlash({ msg, ok })
    setTimeout(() => setFlash(null), 3200)
  }

  const handleClaim = async (rewardId: string) => {
    setClaiming(rewardId)
    try {
      const res = await fetch(`/api/rewards/${rewardId}`, { method:'POST', headers:authH() })
      if (res.ok) { showFlash('🎁 Reward амжилттай авлаа!', true); await load() }
      else { const d = await res.json(); showFlash(d.error || 'Алдаа гарлаа', false) }
    } catch { showFlash('Серверийн алдаа', false) }
    setClaiming(null)
  }

  const userMap: Record<string, UserReward> = {}
  for (const ur of userRewards) userMap[ur.rewardId] = ur

  const claimableRewards = allRewards.filter(r => userMap[r.id] && !userMap[r.id].claimedAt)
  const claimedRewards   = allRewards.filter(r => userMap[r.id]?.claimedAt)
  const lockedRewards    = allRewards.filter(r => !userMap[r.id])
  const totalXp          = userRewards.filter(u => u.claimedAt && u.reward.type === 'xp').reduce((s, u) => s + u.reward.value, 0)
  const claimPct         = allRewards.length ? Math.round(claimedRewards.length / allRewards.length * 100) : 0

  const types = ['ALL', ...Array.from(new Set(allRewards.map(r => r.type)))]
  const sorted = [...claimableRewards, ...claimedRewards, ...lockedRewards]
  const shown  = sorted.filter(r => {
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false
    if (statusFilter === 'AVAILABLE') return !!userMap[r.id] && !userMap[r.id].claimedAt
    if (statusFilter === 'CLAIMED')   return !!userMap[r.id]?.claimedAt
    if (statusFilter === 'LOCKED')    return !userMap[r.id]
    return true
  })

  return (
    <>
      <style>{kf}</style>
      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', position:'relative' }}>

        {/* scan line */}
        <div style={{ position:'fixed', left:0, right:0, height:80, pointerEvents:'none', zIndex:0,
          background:'linear-gradient(180deg,transparent,rgba(255,107,53,.008),transparent)',
          animation:'rw-scan 9s linear infinite' }}/>

        {/* HUD TOP BAR */}
        <div style={{ display:'flex', alignItems:'stretch', borderBottom:'2px solid #0d1a28', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', flexShrink:0, position:'relative', zIndex:2, boxShadow:'0 2px 20px rgba(0,0,0,.5)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#ff6b3544,transparent)' }}/>

          <div style={{ padding:'16px 28px', borderRight:'1px solid #0d1a28', flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
            <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:4 }}>ARENAHUB</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:10, color:'#ff6b35', letterSpacing:3, textShadow:'0 0 12px rgba(255,107,53,.4)' }}>LOOT</div>
          </div>

          <div style={{ flex:1, padding:'0 28px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:'var(--fp)', fontSize:8, color:'#1a3050' }}>▸</span>
              <span style={{ fontFamily:'var(--fp)', fontSize:10, color:'#ff6b35', letterSpacing:3, textShadow:'0 0 10px rgba(255,107,53,.3)' }}>{t('rw_title')}</span>
            </div>
            {claimableRewards.length > 0 && (
              <span style={{ fontFamily:'var(--fp)', fontSize:6, color:'#ffd700', border:'1px solid #ffd70033', padding:'3px 10px', background:'rgba(255,215,0,.06)', letterSpacing:1, animation:'rw-pulse 2s ease-in-out infinite', '--pulse-col':'rgba(255,215,0,.2)' } as React.CSSProperties}>
                {claimableRewards.length} AVAILABLE
              </span>
            )}
          </div>

          <div style={{ padding:'16px 28px', borderLeft:'1px solid #0d1a28', display:'flex', alignItems:'center', flexShrink:0 }}>
            <span style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a5070' }}>{user?.username?.toUpperCase()} · LV.{user?.level ?? 1}</span>
          </div>
        </div>

        {/* STAT STRIP */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', borderBottom:'1px solid #0d1a28', flexShrink:0, background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', zIndex:2 }}>
          {[
            { k: t('rw_all'), v:allRewards.length,      col:'#3a5070', bar:0 },
            { k:'AVAILABLE',  v:claimableRewards.length, col:'#ffd700', bar:0 },
            { k:'CLAIMED',    v:claimedRewards.length,  col:'#00ff41', bar: claimPct/100 },
            { k:'XP EARNED',  v:`+${totalXp}`,          col:'#00e5ff', bar:0 },
          ].map((s, i) => (
            <div key={s.k} style={{ padding:'18px 24px', borderRight: i < 3 ? '1px solid #0d1a28' : 'none', position:'relative' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${s.col}44,transparent)` }}/>
              <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:3, marginBottom:8 }}>{s.k}</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:14, color:s.col, textShadow:`0 0 10px ${s.col}55`, marginBottom: s.bar ? 8 : 0 }}>{s.v}</div>
              {s.bar > 0 && (
                <div style={{ height:2, background:'rgba(12,18,34,.62)',  backdropFilter:'blur(16px)' }}>
                  <div style={{ height:'100%', width:`${s.bar*100}%`, background:s.col, boxShadow:`0 0 6px ${s.col}66`, transition:'width .5s' }}/>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CONTENT */}
        <div style={{ flex:1, padding:'24px 40px', position:'relative', zIndex:2 }}>

          {/* Flash */}
          {flash && (
            <div style={{ fontFamily:'var(--fp)', fontSize:6, padding:'11px 18px', marginBottom:16, color: flash.ok ? '#00ff41' : '#ff2d55', border:`1px solid ${flash.ok ? '#00ff4144' : '#ff2d5544'}`, background:`${flash.ok ? '#00ff41' : '#ff2d55'}0d`, letterSpacing:1 }}>
              {flash.msg}
            </div>
          )}

          {/* Filters */}
          <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap', alignItems:'center' }}>
            {([['ALL','rw_all'],['AVAILABLE','rw_available'],['CLAIMED','rw_claimed'],['LOCKED','ach_locked']] as const).map(([f, tk]) => (
              <button key={f} onClick={() => setStatusFilter(f)} style={{ fontFamily:'var(--fp)', fontSize:6, padding:'7px 14px', cursor:'pointer', background: statusFilter===f ? 'rgba(255,107,53,.1)' : 'transparent', color: statusFilter===f ? '#ff6b35' : '#2a3a54', border:`1px solid ${statusFilter===f ? '#ff6b3566' : '#0d1a28'}`, letterSpacing:1, transition:'all .15s' }}>
                {f === 'AVAILABLE' && claimableRewards.length > 0 ? `${t(tk)} (${claimableRewards.length})` : t(tk)}
              </button>
            ))}
            <div style={{ width:1, height:18, background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)', margin:'0 4px' }}/>
            {types.map(tp => {
              const col   = tp === 'ALL' ? '#2a3a54' : (TYPE_COLOR[tp] ?? '#2a3a54')
              const active = typeFilter === tp
              return (
                <button key={tp} onClick={() => setTypeFilter(tp)} style={{ fontFamily:'var(--fp)', fontSize:6, padding:'7px 14px', cursor:'pointer', background: active ? `${col}12` : 'transparent', color: active ? col : '#2a3a54', border:`1px solid ${active ? col+'55' : '#0d1a28'}`, letterSpacing:1, transition:'all .15s' }}>
                  {tp === 'ALL' ? t('rw_all') : `${TYPE_ICON[tp] ?? ''} ${tp.toUpperCase()}`}
                </button>
              )
            })}
          </div>

          {/* Claimable spotlight */}
          {statusFilter === 'ALL' && claimableRewards.length > 0 && typeFilter === 'ALL' && (
            <div style={{ marginBottom:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                <div style={{ width:3, height:18, background:'#ffd700', boxShadow:'0 0 8px #ffd700' }}/>
                <span style={{ fontFamily:'var(--fp)', fontSize:6, color:'#ffd700', letterSpacing:2 }}>CLAIM ХИЙХ БОЛОМЖТОЙ</span>
                <div style={{ flex:1, height:1, background:'linear-gradient(90deg,#ffd70033,transparent)' }}/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:10 }}>
                {claimableRewards.map((r, i) => (
                  <div key={r.id} style={{ animation:`rw-in .3s ease ${i*0.05}s both` }}>
                    <RewardCard reward={r} userReward={userMap[r.id]} onClaim={handleClaim} claiming={claiming} />
                  </div>
                ))}
              </div>
              <div style={{ height:1, background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)', margin:'24px 0 0' }}/>
            </div>
          )}

          {/* Main grid */}
          {loading ? (
            <div style={{ fontFamily:'var(--fm)', fontSize:13, color:'#2a3a54', textAlign:'center', padding:'56px 0' }}>
              <div style={{ marginBottom:12 }}><PixelIcon name="rewards" size={28} col='#2a3a54'/></div>Уншиж байна...
            </div>
          ) : shown.length === 0 && !(statusFilter === 'ALL' && typeFilter === 'ALL' && claimableRewards.length > 0) ? (
            <div style={{ fontFamily:'var(--fm)', fontSize:13, color:'#2a3a54', textAlign:'center', padding:'48px 0' }}>Reward олдсонгүй</div>
          ) : (
            <>
              {(statusFilter !== 'ALL' || typeFilter !== 'ALL') && (
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:10 }}>
                  {shown.map((r, i) => (
                    <div key={r.id} style={{ animation:`rw-in .3s ease ${i*0.04}s both` }}>
                      <RewardCard reward={r} userReward={userMap[r.id]} onClaim={handleClaim} claiming={claiming} />
                    </div>
                  ))}
                </div>
              )}
              {statusFilter === 'ALL' && typeFilter === 'ALL' && [...claimedRewards, ...lockedRewards].length > 0 && (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12, marginTop: claimableRewards.length > 0 ? 12 : 0 }}>
                    <div style={{ width:3, height:18, background:'#1a3050' }}/>
                    <span style={{ fontFamily:'var(--fp)', fontSize:6, color:'#2a3a54', letterSpacing:2 }}>ALL REWARDS</span>
                    <div style={{ flex:1, height:1, background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)' }}/>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:10 }}>
                    {[...claimedRewards, ...lockedRewards].map((r, i) => (
                      <div key={r.id} style={{ animation:`rw-in .3s ease ${i*0.04}s both` }}>
                        <RewardCard reward={r} userReward={userMap[r.id]} onClaim={handleClaim} claiming={claiming} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {!loading && allRewards.length === 0 && (
            <div style={{ textAlign:'center', padding:'56px 24px', border:'1px dashed #0d1a28', marginTop:8 }}>
              <div style={{ fontSize:40, marginBottom:14 }}>🎁</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:8, color:'#1a3050', letterSpacing:2, marginBottom:8 }}>REWARD БАЙХГҮЙ</div>
              <div style={{ fontFamily:'var(--fm)', fontSize:11, color:'#0d1a28' }}>Admin panel → Rewards → ⚡ SEED DEFAULTS</div>
            </div>
          )}
        </div>

      </main>
    </>
  )
}