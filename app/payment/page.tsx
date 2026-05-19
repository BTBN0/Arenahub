'use client'
import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'

const S = {
  fp: (sz:number, col='#fff', ls=0): React.CSSProperties => ({ fontFamily:'var(--fp)', fontSize:sz, color:col, letterSpacing:ls }),
  fm: (sz:number, col='#d0d8e8'): React.CSSProperties => ({ fontFamily:'var(--fm)', fontSize:sz, color:col }),
}

const ITEMS: Record<string,{label:string;amount:number;desc:string;col:string;icon:string;plan:string}> = {
  pro_monthly:  { label:'PRO — Сарын',  amount:17000,  desc:'Бүх 8 курс · 100 AI token · Analytics',       col:'#00e5ff', icon:'⭐', plan:'PRO'  },
  pro_yearly:   { label:'PRO — Жилийн', amount:170000, desc:'2 сар үнэгүй · PRO бүх боломж',              col:'#00e5ff', icon:'⭐', plan:'PRO'  },
  vip_monthly:  { label:'VIP — Сарын',  amount:34000,  desc:'400 AI token · Deep AI · Highlight · Badge',  col:'#ffd700', icon:'💎', plan:'VIP'  },
  vip_yearly:   { label:'VIP — Жилийн', amount:320000, desc:'2–3 сар үнэгүй · VIP бүх боломж',            col:'#ffd700', icon:'💎', plan:'VIP'  },
  token_10:     { label:'10 AI Token',   amount:3500,   desc:'10 token · ₮350/token',                       col:'#00ff41', icon:'🤖', plan:''     },
  token_50:     { label:'50 AI Token',   amount:15000,  desc:'50 token · ₮300/token',                       col:'#00ff41', icon:'🤖', plan:''     },
  token_200:    { label:'200+20 Token',  amount:45000,  desc:'200+20 bonus token · ₮225/token',             col:'#00ff41', icon:'🤖', plan:''     },
  contest:      { label:'Contest — FREE',  amount:10000, desc:'7 хоногийн coding contest оролцоо',           col:'#ffd700', icon:'⚔',  plan:''     },
  contest_pro:  { label:'Contest — PRO',  amount:3000,  desc:'PRO хямдралтай contest оролцоо · ₮7,000 хямд', col:'#00e5ff', icon:'⚔',  plan:''     },
  contest_vip:  { label:'Contest — VIP',  amount:0,     desc:'VIP — Contest оролцоо ҮНЭГҮЙ',                 col:'#ffd700', icon:'⚔',  plan:''     },
  boost:        { label:'Profile Boost', amount:10000,  desc:'24ц leaderboard highlight',                   col:'#bf5af2', icon:'🔆', plan:''     },
  frame:        { label:'Animated Frame',amount:15000,  desc:'Profile animated frame',                      col:'#bf5af2', icon:'🖼', plan:''     },
}

// Real QR code from qrserver.com — scannable, no API key needed
function PaymentQR({ label, amount }: { label: string; amount: number }) {
  const data = encodeURIComponent(`ARENAHUB DEMO | ${label} | ${amount.toLocaleString()}MNT`)
  const src  = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${data}&format=png&qzone=1`
  return (
    <img
      src={src}
      alt="QR code"
      width={200}
      height={200}
      style={{ display:'block', imageRendering:'pixelated' }}
    />
  )
}

type Phase = 'idle'|'scanning'|'done'

function PaymentContent() {
  const { user, isAuthenticated, loading } = useAuth()
  const { t } = useLang()
  const router  = useRouter()
  const params  = useSearchParams()

  const itemKey  = params.get('item') || 'pro_monthly'
  const fromPath = params.get('from') || '/pricing'
  const item     = ITEMS[itemKey] || ITEMS.pro_monthly

  const [phase,    setPhase]    = useState<Phase>('idle')
  const [progress, setProgress] = useState(0)   // 0-100
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval>|null>(null)

  useEffect(() => { if (!loading && !isAuthenticated) router.replace('/login') }, [loading, isAuthenticated])
  if (loading || !user) return null

  const startPayment = () => {
    setPhase('scanning')
    setProgress(0)
    setError('')
    const total = 4200 // ms
    const tick  = 60   // ms
    let elapsed = 0
    timerRef.current = setInterval(() => {
      elapsed += tick
      setProgress(Math.min(100, Math.round((elapsed / total) * 100)))
      if (elapsed >= total) {
        clearInterval(timerRef.current!)
        submitPayment()
      }
    }, tick)
  }

  const submitPayment = async () => {
    try {
      const bearer = typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') : null
      const res  = await fetch('/api/payment/qr-pay', {
        method:  'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(bearer ? { 'Authorization': `Bearer ${bearer}` } : {}),
        },
        body:    JSON.stringify({ item: itemKey }),
      })
      const data = await res.json()
      if (data.ok) {
        setPhase('done')
      } else {
        setError(data.error || 'Алдаа гарлаа')
        setPhase('idle')
      }
    } catch {
      setError('Холболтын алдаа')
      setPhase('idle')
    }
  }

  const startStripePayment = async () => {
    setLoading(true)
    setError('')
    try {
      const bearer = typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') : null
      const res = await fetch('/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(bearer ? { 'Authorization': `Bearer ${bearer}` } : {}),
        },
        body: JSON.stringify({ item: itemKey }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setError(data.error || 'Алдаа гарлаа')
      }
    } catch {
      setError('Холболтын алдаа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#070d1a', color:'#d0d8e8' }}>

      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'center', padding:'0 36px', height:56,
        background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)',
        borderBottom:'1px solid #3a4560', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ fontFamily:'var(--fp)', fontSize:10, color:'#00e5ff', letterSpacing:3 }}>ARENAHUB</div>
        <span style={{ ...S.fp(6,'#3a4560'), margin:'0 10px' }}>·</span>
        <span style={S.fp(8,'#5a6a8a')}>QR ТӨЛБӨР</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <a href="/pricing?tab=history" style={{ ...S.fp(7,'#5a6a8a'), textDecoration:'none', padding:'7px 14px', border:'1px solid #3a4560' }}>ТҮҮХ</a>
          <a href={fromPath} style={{ ...S.fp(7,'#5a6a8a'), textDecoration:'none', padding:'7px 14px', border:'1px solid #3a4560' }}>← БУЦАХ</a>
        </div>
      </nav>

      <div style={{ maxWidth:480, margin:'0 auto', padding:'52px 20px 80px' }}>

        {/* Item card */}
        <div style={{ background:'rgba(8,12,22,.96)', border:`2px solid ${item.col}44`,
          padding:'20px 24px', marginBottom:28, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:item.col }}/>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                <span style={{ fontSize:22 }}>{item.icon}</span>
                <span style={S.fp(11, item.col, 1)}>{item.label}</span>
              </div>
              <div style={S.fm(12,'#5a6a8a')}>{item.desc}</div>
            </div>
            <div style={S.fp(26,'#fff')}>{item.amount.toLocaleString()}₮</div>
          </div>
        </div>

        {/* ── IDLE: Show QR + button ── */}
        {phase === 'idle' && (
          <div>
            {/* QR panel */}
            <div style={{ background:'rgba(8,12,22,.96)', border:'1px solid #3a4560',
              padding:'32px', marginBottom:20, textAlign:'center' }}>
              <div style={{ ...S.fp(7,'#5a6a8a',2), marginBottom:18 }}>{t('pay_scan')}</div>

              <div style={{ width:216, height:216, margin:'0 auto 18px',
                background:'#fff', display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:`0 0 24px ${item.col}22` }}>
                <PaymentQR label={item.label} amount={item.amount}/>
              </div>

              <div style={{ ...S.fm(12,'#5a6a8a'), lineHeight:1.8, marginBottom:6 }}>
                QPay / SocialPay / MonPay app-аар<br/>
                QR scan хийж <b style={{ color:'#fff' }}>{item.amount.toLocaleString()}₮</b> төлнө
              </div>
              <div style={{ ...S.fp(6,'#3a4560'), letterSpacing:2 }}>DEMO — SIMULATE ДАРЖ ТУРШИНА УУ</div>
            </div>

            {/* Benefits preview */}
            {item.plan && (
              <div style={{ background:'rgba(0,229,255,.04)', border:'1px solid rgba(0,229,255,.1)',
                padding:'16px 20px', marginBottom:20 }}>
                <div style={{ ...S.fp(7, item.col, 2), marginBottom:10 }}>{t('pay_benefits')}</div>
                {item.plan === 'PRO' ? (
                  ['Бүх 8 курс нэмэгдэнэ','100 AI token / сар','Progress analytics','Contest ₮3,000 хямд'].map(f => (
                    <div key={f} style={{ ...S.fm(12,'#d0d8e8'), marginBottom:6 }}>✓ {f}</div>
                  ))
                ) : (
                  ['PRO бүх боломж','400 AI token / сар','Contest ҮНЭГҮЙ','Leaderboard highlight','Exclusive badge'].map(f => (
                    <div key={f} style={{ ...S.fm(12,'#d0d8e8'), marginBottom:6 }}>✓ {f}</div>
                  ))
                )}
              </div>
            )}

            {error && (
              <div style={{ ...S.fp(7,'#ff2d55'), padding:'12px 16px',
                border:'1px solid rgba(255,45,85,.3)', background:'rgba(255,45,85,.05)',
                marginBottom:16 }}>⚠ {error}</div>
            )}

            <div style={{ display:'flex', gap:10 }}>
              <button onClick={startPayment}
                disabled={loading}
                style={{ flex:1, padding:'16px', ...S.fp(10,'#070d1a',2),
                  background: item.col, border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                  transition:'all .2s', opacity: loading ? 0.6 : 1 }}
                onMouseEnter={e => !loading && (e.currentTarget.style.opacity='0.85')}
                onMouseLeave={e => !loading && (e.currentTarget.style.opacity='1')}>
                {t('pay_simulate')}
              </button>
              <button onClick={startStripePayment}
                disabled={loading}
                style={{ flex:1, padding:'16px', ...S.fp(10,'#070d1a',2),
                  background: '#635bff', border:'none', cursor: loading ? 'not-allowed' : 'pointer',
                  transition:'all .2s', opacity: loading ? 0.6 : 1 }}
                onMouseEnter={e => !loading && (e.currentTarget.style.opacity='0.85')}
                onMouseLeave={e => !loading && (e.currentTarget.style.opacity='1')}>
                Stripe {loading ? '...' : ''}
              </button>
            </div>
            <div style={{ ...S.fm(11,'#3a4560'), textAlign:'center', marginTop:10 }}>
              {t('pay_demo')}
            </div>
          </div>
        )}

        {/* ── SCANNING: Progress animation ── */}
        {phase === 'scanning' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ background:'rgba(8,12,22,.96)', border:'1px solid #3a4560',
              padding:'48px 32px', marginBottom:20 }}>

              {/* Animated QR with scan line */}
              <div style={{ position:'relative', width:216, height:216, margin:'0 auto 28px' }}>
                <div style={{ background:'#fff', boxShadow:`0 0 32px ${item.col}44`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <PaymentQR label={item.label} amount={item.amount}/>
                </div>
                {/* scan line */}
                <div style={{ position:'absolute', left:8, right:8, height:3,
                  background:`linear-gradient(90deg,transparent,${item.col},transparent)`,
                  top:`${(progress/100)*216}px`, transition:'top .06s linear',
                  boxShadow:`0 0 8px ${item.col}` }}/>
                {/* corner markers */}
                {[[0,0],[0,1],[1,0],[1,1]].map(([r,c],i) => (
                  <div key={i} style={{
                    position:'absolute',
                    top: r===0 ? 0 : undefined, bottom: r===1 ? 0 : undefined,
                    left: c===0 ? 0 : undefined, right: c===1 ? 0 : undefined,
                    width:20, height:20,
                    borderTop:    r===0 ? `2px solid ${item.col}` : undefined,
                    borderBottom: r===1 ? `2px solid ${item.col}` : undefined,
                    borderLeft:   c===0 ? `2px solid ${item.col}` : undefined,
                    borderRight:  c===1 ? `2px solid ${item.col}` : undefined,
                  }}/>
                ))}
              </div>

              <div style={{ ...S.fp(10,'#fff',2), marginBottom:10 }}>{t('pay_processing')}</div>
              <div style={S.fm(12,'#5a6a8a')}>Түр хүлээнэ үү</div>

              {/* Progress bar */}
              <div style={{ marginTop:24, background:'#1a2035', height:6, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${progress}%`,
                  background:`linear-gradient(90deg,${item.col}88,${item.col})`,
                  transition:'width .06s linear',
                  boxShadow:`0 0 8px ${item.col}` }}/>
              </div>
              <div style={{ ...S.fp(8, item.col), marginTop:8 }}>{progress}%</div>
            </div>
          </div>
        )}

        {/* ── DONE: Success screen ── */}
        {phase === 'done' && (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:72, marginBottom:20,
              animation:'bounce .4s ease', display:'inline-block' }}>✅</div>
            <div style={{ ...S.fp(18,'#00ff41',2), marginBottom:12 }}>{t('pay_success')}</div>
            <div style={{ ...S.fm(14,'#5a6a8a'), lineHeight:2.1, marginBottom:32 }}>
              Таны <b style={{ color: item.col }}>{item.label}</b> эрх<br/>
              <b style={{ color:'#fff' }}>шууд идэвхжлээ.</b>
            </div>

            {/* What's unlocked */}
            <div style={{ background:'rgba(8,12,22,.96)', border:'1px solid #00ff4133',
              marginBottom:28, overflow:'hidden' }}>
              {(item.plan === 'PRO'
                ? ['Бүх 8 курс нэмэгдлээ','100 AI token нэмэгдлээ','Progress analytics','Contest discount']
                : item.plan === 'VIP'
                ? ['PRO бүх боломж','400 AI token нэмэгдлээ','Contest ҮНЭГҮЙ эрх','Leaderboard highlight','Exclusive badge']
                : [`${item.label} амжилттай`]
              ).map(txt => (
                <div key={txt} style={{ display:'flex', alignItems:'center', gap:14,
                  padding:'14px 20px', borderBottom:'1px solid #121829' }}>
                  <span style={S.fp(14,'#00ff41')}>✓</span>
                  <span style={S.fm(13,'#d0d8e8')}>{txt}</span>
                </div>
              ))}
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <a href="/dashboard"
                style={{ flex:1, padding:'14px', ...S.fp(9,'#00e5ff',2), textDecoration:'none',
                  border:'1px solid #00e5ff55', display:'block', textAlign:'center',
                  background:'rgba(0,229,255,.06)', transition:'all .2s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='rgba(0,229,255,.12)'}
                onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background='rgba(0,229,255,.06)'}>
                {t('pay_dashboard')}
              </a>
              <a href="/pricing?tab=history"
                style={{ flex:1, padding:'14px', ...S.fp(9,'#5a6a8a',2), textDecoration:'none',
                  border:'1px solid #3a4560', display:'block', textAlign:'center', transition:'all .2s' }}
                onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='rgba(255,255,255,.03)'}
                onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background='transparent'}>
                {t('pay_view_history')}
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%   { transform: scale(0.3); opacity: 0 }
          60%  { transform: scale(1.1) }
          100% { transform: scale(1);   opacity: 1 }
        }
      `}</style>
    </div>
  )
}

export default function PaymentPage() {
  return <Suspense fallback={<div style={{ minHeight:'100vh', background:'#070d1a' }}/>}>
    <PaymentContent/>
  </Suspense>
}