'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useLang } from '@/context/LanguageContext'
import PixelIcon from '@/components/ui/PixelIcon'

const BG  = '#060e1a'
const BG2 = 'rgba(8,12,22,.96)'
const BG3 = 'rgba(12,18,34,.62)'
const DIM = 'rgba(13,20,38,.65)'
const DIM2 = '#3a5070'
const TEXT = '#b0c8e0'

const kf = `
@keyframes pr-in   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes pr-scan { 0%{top:-80px} 100%{top:100%} }
@keyframes pr-ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
`

const FP = (sz:number, col=TEXT, ls=0): React.CSSProperties => ({ fontFamily:'var(--fp)', fontSize:sz, color:col, letterSpacing:ls })
const FM = (sz:number, col=TEXT):   React.CSSProperties => ({ fontFamily:'var(--fm)', fontSize:sz, color:col })


const STATUS_COL: Record<string,string> = { PENDING:'#ffd700', PAID:'#00ff41', REJECTED:'#ff2d55', REFUNDED:'#5a6a8a' }
const TYPE_LBL:   Record<string,string> = { SUBSCRIPTION:'Subscription', TOKEN:'AI Token', CONTEST:'Contest', BOOST:'Boost' }

type Tab = 'plans'|'tokens'|'contest'|'history'

export default function PricingPage() {
  const { data: session } = useSession()
  const { lang, setLang, t } = useLang()
  const isMn = lang === 'mn'

  const PLANS = [
    {
      id:'free', label: isMn ? 'АНХДАГЧ' : 'FREE', icon:'🆓',
      price:'₮0', period:'', yearPrice:null as string|null,
      col:DIM2, highlight:false, badge:'',
      desc: isMn ? 'Эхлэгчдэд зориулсан үндсэн эрх' : 'Basic access for beginners',
      features:[
        { text: isMn ? '2 курс (HTML + CSS)'  : '2 courses (HTML + CSS)',  ok:true  },
        { text: isMn ? 'Өдөрт 10 task'        : '10 tasks per day',        ok:true  },
        { text: isMn ? 'Leaderboard харах'     : 'View leaderboard',        ok:true  },
        { text: isMn ? '5 AI token / өдөр'    : '5 AI tokens / day',       ok:true  },
        { text: isMn ? 'Бүх 8 курс'           : 'All 8 courses',           ok:false },
        { text: isMn ? 'Progress analytics'   : 'Progress analytics',      ok:false },
        { text: isMn ? 'Contest оролцоо'       : 'Contest access',          ok:false },
      ],
      btn: isMn ? 'ЭХЛЭХ' : 'GET STARTED',
    },
    {
      id:'pro', label:'PRO', icon:'⭐',
      price:'₮17,000', period: isMn ? '/сар' : '/mo', yearPrice:'₮170,000',
      yearNote: isMn ? '2 сар үнэгүй' : '2 months free',
      col:'#00e5ff', highlight:true, badge: isMn ? 'ХАМГИЙН АЛДАРТАЙ' : 'MOST POPULAR',
      desc: isMn ? 'Бүх курс + AI token + Analytics' : 'All courses + AI tokens + Analytics',
      features:[
        { text: isMn ? 'Бүх 8 курс unlock'     : 'All 8 courses unlocked', ok:true  },
        { text: isMn ? 'Хязгааргүй task'        : 'Unlimited tasks',        ok:true  },
        { text: isMn ? 'Leaderboard оролцох'     : 'Join leaderboard',       ok:true  },
        { text: isMn ? '100 AI token / сар'      : '100 AI tokens / month',  ok:true  },
        { text: isMn ? 'Progress analytics'      : 'Progress analytics',     ok:true  },
        { text: isMn ? 'Contest (₮3,000 хямд)'  : 'Contest (₮3,000 off)',   ok:true  },
        { text: isMn ? 'Exclusive badge'         : 'Exclusive badge',        ok:false },
      ],
      btn: isMn ? '▶ PRO БОЛОХ' : '▶ GET PRO',
    },
    {
      id:'vip', label:'VIP', icon:'💎',
      price:'₮34,000', period: isMn ? '/сар' : '/mo', yearPrice:'₮320,000',
      yearNote: isMn ? '2–3 сар үнэгүй' : '2–3 months free',
      col:'#ffd700', highlight:false, badge:'💎 PREMIUM',
      desc: isMn ? 'Pro бүх боломж + дэвшилтэт AI' : 'All Pro features + advanced AI',
      features:[
        { text: isMn ? 'Pro бүх боломж'         : 'All Pro features',       ok:true },
        { text: isMn ? '400 AI token / сар'      : '400 AI tokens / month',  ok:true },
        { text: isMn ? 'Deep AI explanation'     : 'Deep AI explanation',    ok:true },
        { text: isMn ? 'Contest ҮНЭГҮЙ'          : 'Contest FREE',           ok:true },
        { text: isMn ? 'Leaderboard highlight'   : 'Leaderboard highlight',  ok:true },
        { text: isMn ? 'Exclusive badge + frame' : 'Exclusive badge + frame',ok:true },
        { text: isMn ? 'Early access feature'    : 'Early access features',  ok:true },
      ],
      btn: isMn ? '💎 VIP БОЛОХ' : '💎 GET VIP',
    },
  ]

  const TOKEN_USES = [
    { icon:'💡', label: isMn ? 'Hint авах'     : 'Get hint',         cost:1, price:'₮350',   col:'#00ff41' },
    { icon:'📖', label: isMn ? 'Тайлбар авах'  : 'Get explanation',  cost:2, price:'₮700',   col:'#00e5ff' },
    { icon:'🔓', label: isMn ? 'Бүтэн шийдэл' : 'Full solution',    cost:5, price:'₮1,750', col:'#ffd700' },
    { icon:'🔍', label: isMn ? 'Code review'   : 'Code review',      cost:3, price:'₮1,050', col:'#bf5af2' },
  ]

  const TOKEN_PACKS = [
    { amount:10,  price:'₮3,500',  per:'₮350/token', col:DIM2,     popular:false, save:'' },
    { amount:50,  price:'₮15,000', per:'₮300/token', col:'#00e5ff', popular:true,  save: isMn ? '₮2,500 хэмнэлт' : '₮2,500 saved' },
    { amount:200, price:'₮45,000', per:'₮225/token', col:'#ffd700', popular:false, save: isMn ? '₮25,000 хэмнэлт' : '₮25,000 saved', bonus:'+20' },
  ]

  const STATUS_LBL_I18N: Record<string,string> = isMn
    ? { PENDING:'Хүлээгдэж байна', PAID:'Амжилттай', REJECTED:'Цуцлагдсан', REFUNDED:'Буцаалт' }
    : { PENDING:'Pending',          PAID:'Paid',       REJECTED:'Rejected',   REFUNDED:'Refunded' }
  const [tab,      setTab]      = useState<Tab>('plans')
  const [billing,  setBilling]  = useState<'month'|'year'>('month')
  const [tokenSel, setTokenSel] = useState(1)
  const [contests, setContests] = useState<any[]>([])
  const [loadingC, setLoadingC] = useState(false)
  const [payments, setPayments] = useState<any[]>([])
  const [fetchingH,setFetchingH]= useState(false)
  const [selPay,   setSelPay]   = useState<string|null>(null)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('tab') as Tab | null
    if (t && ['plans','tokens','contest','history'].includes(t)) setTab(t)
  }, [])

  useEffect(() => {
    if (tab !== 'contest') return
    setLoadingC(true)
    fetch('/api/contest?status=ACTIVE')
      .then(r => r.json())
      .then(d => { if (d.ok) setContests(d.contests || []) })
      .finally(() => setLoadingC(false))
  }, [tab])

  useEffect(() => {
    if (tab !== 'history') return
    setFetchingH(true)
    const bearer = typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') : null
    fetch('/api/payment', bearer ? { headers: { Authorization: `Bearer ${bearer}` } } : undefined)
      .then(r => r.json())
      .then(d => { if (d.ok) setPayments(d.payments || []) })
      .finally(() => setFetchingH(false))
  }, [tab])

  const TAB_CFG: Record<Tab, { col:string; glow:string }> = {
    plans:   { col:'#00e5ff', glow:'rgba(0,229,255,0.15)' },
    tokens:  { col:'#ffd700', glow:'rgba(255,215,0,0.15)' },
    contest: { col:'#ff6b35', glow:'rgba(255,107,53,0.15)' },
    history: { col:'#00ff41', glow:'rgba(0,255,65,0.15)'  },
  }
  const activeCfg = TAB_CFG[tab]

  return (
    <div style={{ minHeight:'100vh', color:TEXT }}>
      <style>{kf}</style>

      {/* scan line */}
      <div style={{ position:'fixed', left:0, right:0, height:80, pointerEvents:'none', zIndex:0,
        background:`linear-gradient(180deg,transparent,${activeCfg.col}08,transparent)`,
        animation:'pr-scan 9s linear infinite' }}/>

      {/* NAV */}
      <nav style={{ display:'flex', alignItems:'stretch', background:BG2, backdropFilter:'blur(20px)', borderBottom:`2px solid ${DIM}`, position:'sticky', top:0, zIndex:200, boxShadow:'0 2px 24px rgba(0,0,0,.6)', minHeight:76 }}>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${activeCfg.col}55,transparent)` }}/>

        {/* logo */}
        <div style={{ padding:'0 32px', display:'flex', alignItems:'center', gap:14, borderRight:`1px solid ${DIM}`, flexShrink:0 }}>
          <img src="/logo.svg" alt="ArenaHub" width="32" height="32" style={{ display:'block' }}/>
          <div>
            <div style={FP(12,'#c0d0e0',3)}>ARENAHUB</div>
            <div style={FP(5,DIM2,4)}>IT СУРГАЛТ · PRICING</div>
          </div>
        </div>

        {/* tab nav */}
        <div style={{ flex:1, display:'flex', alignItems:'stretch' }}>
          {([
            ['plans',   'crown',  t('prc_plans'),   '#00e5ff'],
            ['tokens',  'coin',   t('prc_tokens'),  '#ffd700'],
            ['contest', 'sword',  t('prc_contest'), '#ff6b35'],
            ['history', 'list',   t('prc_history'), '#00ff41'],
          ] as [Tab, string, string, string][]).map(([id, iconName, lbl, col]) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)} style={{ padding:'0 28px', cursor:'pointer', background: active ? `${col}0e` : 'transparent', border:'none', borderBottom:`3px solid ${active ? col : 'transparent'}`, borderTop:'3px solid transparent', transition:'all .15s', display:'flex', alignItems:'center', gap:10 }}>
                <span style={{ filter: active ? `drop-shadow(0 0 6px ${col}88)` : 'grayscale(1) brightness(0.5)', transition:'filter .15s' }}>
                  <PixelIcon name={iconName as any} size={22} col={col}/>
                </span>
                <span style={{ ...FP(9, active ? col : DIM2, 1) }}>{lbl}</span>
              </button>
            )
          })}
        </div>

        {/* Language switcher + back */}
        <div style={{ padding:'0 16px', display:'flex', alignItems:'center', gap:6, borderLeft:`1px solid ${DIM}`, flexShrink:0 }}>
          {(['mn','en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)} title={l==='mn'?'Монгол':'English'} style={{
              display:'flex', alignItems:'center', gap:5,
              padding:'7px 10px', border:`1px solid ${lang===l?'rgba(0,229,255,.5)':'rgba(255,255,255,.08)'}`,
              background: lang===l ? 'rgba(0,229,255,.12)' : 'transparent',
              cursor:'pointer', transition:'all .2s', borderRadius:2,
            }}>
              <svg width="18" height="11" viewBox="0 0 30 18" style={{imageRendering:'pixelated',display:'block',flexShrink:0}}>
                {l==='mn'?(
                  <><rect x="0" y="0" width="10" height="18" fill="#C4272F"/><rect x="10" y="0" width="10" height="18" fill="#015197"/><rect x="20" y="0" width="10" height="18" fill="#C4272F"/><rect x="4" y="1" width="2" height="1" fill="#F9CF02"/><rect x="2" y="2" width="6" height="3" fill="#F9CF02"/><rect x="1" y="6" width="8" height="1" fill="#F9CF02"/><rect x="1" y="8" width="8" height="1" fill="#F9CF02"/><rect x="3" y="9" width="4" height="3" fill="#F9CF02"/><rect x="1" y="13" width="8" height="1" fill="#F9CF02"/><rect x="1" y="15" width="8" height="2" fill="#F9CF02"/></>
                ):(
                  <><rect x="0" y="0" width="30" height="18" fill="#B22234"/><rect x="0" y="2" width="30" height="2" fill="#fff"/><rect x="0" y="6" width="30" height="2" fill="#fff"/><rect x="0" y="10" width="30" height="2" fill="#fff"/><rect x="0" y="14" width="30" height="2" fill="#fff"/><rect x="0" y="0" width="12" height="10" fill="#3C3B6E"/><rect x="1" y="1" width="2" height="1" fill="#fff"/><rect x="5" y="1" width="2" height="1" fill="#fff"/><rect x="9" y="1" width="2" height="1" fill="#fff"/><rect x="3" y="4" width="2" height="1" fill="#fff"/><rect x="7" y="4" width="2" height="1" fill="#fff"/></>
                )}
              </svg>
              <span style={{ ...FP(6, lang===l ? '#00e5ff' : DIM2), whiteSpace:'nowrap' }}>
                {l==='mn' ? 'МОН' : 'ENG'}
              </span>
            </button>
          ))}
          <a href="/dashboard" style={{ ...FP(8,'#00ff41',2), padding:'11px 18px', border:'1px solid #00ff4133', textDecoration:'none', transition:'all .2s', background:'transparent', display:'flex', alignItems:'center', gap:8, marginLeft:4 }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,255,65,.08)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'}>
            <PixelIcon name="dashboard" size={16} col="#00ff41"/>
            {isMn ? '← БУЦАХ' : '← BACK'}
          </a>
        </div>
      </nav>

      <div style={{ maxWidth:1080, margin:'0 auto', padding:'clamp(24px,4vw,48px) clamp(14px,3vw,28px) 80px', position:'relative', zIndex:1 }}>

        {/* ══ SUBSCRIPTION ══ */}
        {tab === 'plans' && (
          <div style={{ animation:'pr-in .3s ease' }}>
            {/* Section header */}
            <div style={{ textAlign:'center', marginBottom:44 }}>
              <div style={{ ...FP(5,DIM2,5), marginBottom:14 }}>{isMn ? 'SUBSCRIPTION ҮНЭ (MNT)' : 'SUBSCRIPTION PRICING (MNT)'}</div>
              <div style={{ ...FP(26,'#c0d0e0'), marginBottom:10, letterSpacing:2 }}>{isMn ? 'ЭРЭМБЭ СОНГОХ' : 'CHOOSE YOUR PLAN'}</div>
              <div style={{ ...FM(13,DIM2), marginBottom:28 }}>{isMn ? 'Хэдий чинээ дээшээ — төдий чинээ хурдан' : 'Level up faster with more features'}</div>
              <div style={{ display:'inline-flex', border:`1px solid ${DIM}`, overflow:'hidden' }}>
                <button onClick={() => setBilling('month')} style={{ ...FP(8, billing === 'month' ? BG : DIM2, 2), padding:'10px 28px', cursor:'pointer', background: billing === 'month' ? '#00e5ff' : 'transparent', border:'none', transition:'all .2s' }}>{t('prc_monthly')}</button>
                <button onClick={() => setBilling('year')} style={{ ...FP(8, billing === 'year' ? BG : DIM2, 2), padding:'10px 28px', cursor:'pointer', background: billing === 'year' ? '#ffd700' : 'transparent', border:'none', transition:'all .2s' }}>
                  {t('prc_yearly')} <span style={{ ...FP(5, billing === 'year' ? BG : '#ffd700'), marginLeft:4 }}>{t('prc_save2months')}</span>
                </button>
              </div>
            </div>

            {/* Plan cards */}
            <div className="pr-plans-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:32 }}>
              {PLANS.map((plan, pi) => {
                const showYear = billing === 'year' && plan.yearPrice
                return (
                  <div key={plan.id} style={{ background:BG2, border:`1px solid ${plan.col}${plan.highlight ? '66' : '22'}`, padding:'0', position:'relative', overflow:'hidden', boxShadow: plan.highlight ? `0 0 32px ${plan.col}14` : 'none', transition:'transform .2s,box-shadow .2s', animation:`pr-in .35s ease ${pi*0.08}s both` }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${plan.col}22` }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLDivElement).style.boxShadow = plan.highlight ? `0 0 32px ${plan.col}14` : 'none' }}>

                    <div style={{ height:3, background: plan.highlight ? plan.col : `${plan.col}66` }}/>

                    {plan.badge && (
                      <div style={{ position:'absolute', top:12, right:0, ...FP(5,BG,1), background:plan.col, padding:'5px 12px' }}>{plan.badge}</div>
                    )}

                    <div style={{ padding:'22px 22px 24px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16, marginTop: plan.badge ? 18 : 0 }}>
                        <span style={{ fontSize:20 }}>{plan.icon}</span>
                        <span style={FP(10, plan.col, 2)}>{plan.label}</span>
                      </div>

                      {showYear ? (
                        <div style={{ marginBottom:10 }}>
                          <div style={{ display:'flex', alignItems:'baseline', gap:5 }}>
                            <span style={FP(28,'#c0d0e0')}>{plan.yearPrice}</span>
                            <span style={FP(9,DIM2)}>/жил</span>
                          </div>
                          <div style={{ ...FP(7,'#00ff41'), marginTop:6 }}>✓ {plan.yearNote}</div>
                        </div>
                      ) : (
                        <div style={{ display:'flex', alignItems:'baseline', gap:5, marginBottom:10 }}>
                          <span style={FP(28,'#c0d0e0')}>{plan.price}</span>
                          <span style={FP(9,DIM2)}>{plan.period}</span>
                        </div>
                      )}

                      <div style={{ ...FM(12,DIM2), marginBottom:20, lineHeight:1.7 }}>{plan.desc}</div>

                      <div style={{ borderTop:`1px solid ${DIM}`, paddingTop:16, marginBottom:22 }}>
                        {plan.features.map((f, i) => (
                          <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:10 }}>
                            <span style={{ ...FP(8, f.ok ? '#00ff41' : DIM2), flexShrink:0, lineHeight:1 }}>{f.ok ? '✓' : '✗'}</span>
                            <span style={FM(12, f.ok ? TEXT : DIM2)}>{f.text}</span>
                          </div>
                        ))}
                      </div>

                      <a href={plan.id === 'free' ? '/dashboard' : `/payment?item=${plan.id}_${billing === 'year' ? 'yearly' : 'monthly'}`}
                        style={{ display:'block', width:'100%', padding:'13px 0', ...FP(9, plan.highlight ? BG : plan.col, 2), textAlign:'center', textDecoration:'none', background: plan.highlight ? plan.col : 'transparent', border:`1px solid ${plan.col}${plan.highlight ? '' : '44'}`, transition:'all .2s', boxSizing:'border-box' }}
                        onMouseEnter={e => { if (!plan.highlight) { (e.currentTarget as HTMLAnchorElement).style.background = `${plan.col}14`; (e.currentTarget as HTMLAnchorElement).style.borderColor = plan.col } else { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85' } }}
                        onMouseLeave={e => { if (!plan.highlight) { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.borderColor = `${plan.col}44` } else { (e.currentTarget as HTMLAnchorElement).style.opacity = '1' } }}>
                        {plan.btn}
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Comparison table */}
            <SectionLabel label={isMn ? 'ХАРЬЦУУЛАЛТ' : 'COMPARISON'} col="#00e5ff"/>
            <div style={{ background:BG2, border:`1px solid ${DIM}`, overflow:'hidden', marginBottom:24 }}>
              <div style={{ display:'flex', background:BG3, borderBottom:`1px solid ${DIM}` }}>
                <div style={{ flex:2, padding:'13px 20px', ...FP(7,DIM2,2) }}>{isMn ? 'ОНЦЛОГ' : 'FEATURE'}</div>
                {[[isMn?'АНХДАГЧ':'FREE',DIM2],['⭐ PRO','#00e5ff'],['💎 VIP','#ffd700']].map(([p,c]) => (
                  <div key={p} style={{ flex:1, padding:'13px 10px', ...FP(8,c,1), textAlign:'center' }}>{p}</div>
                ))}
              </div>
              {(isMn ? [
                ['Курс','2 курс','8 курс','8 курс'],
                ['Task','10/өдөр','Хязгааргүй','Хязгааргүй'],
                ['AI Token','5/өдөр','100/сар','400/сар'],
                ['Leaderboard','Харах','Оролцох','Highlight'],
                ['Contest','₮10,000','₮3,000','ҮНЭГҮЙ'],
                ['Analytics','—','✓','✓ Advanced'],
                ['XP','1x','2x','5x'],
              ] : [
                ['Courses','2 courses','8 courses','8 courses'],
                ['Tasks','10/day','Unlimited','Unlimited'],
                ['AI Tokens','5/day','100/mo','400/mo'],
                ['Leaderboard','View','Join','Highlight'],
                ['Contest','₮10,000','₮3,000','FREE'],
                ['Analytics','—','✓','✓ Advanced'],
                ['XP','1x','2x','5x'],
              ]).map(([feat,...vals], i) => (
                <div key={feat} style={{ display:'flex', borderBottom:`1px solid ${BG3}`, background: i%2===0?'transparent':'rgba(255,255,255,.01)' }}>
                  <div style={{ flex:2, padding:'12px 20px', ...FM(12,DIM2) }}>{feat}</div>
                  {vals.map((v,j) => (
                    <div key={j} style={{ flex:1, padding:'12px 10px', ...FM(12, v==='—'?DIM2:v==='ҮНЭГҮЙ'||v==='FREE'||v==='✓'||v.includes('Хязгаар')||v.includes('Unlimited')||v.includes('Advanced')?'#00ff41':TEXT), textAlign:'center' }}>{v}</div>
                  ))}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* ══ AI TOKENS ══ */}
        {tab === 'tokens' && (
          <div style={{ animation:'pr-in .3s ease' }}>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <div style={{ ...FP(5,DIM2,5), marginBottom:14 }}>🤖 AI TOKEN {isMn ? 'ҮНЭ' : 'PRICING'}</div>
              <div style={{ ...FP(24,'#c0d0e0'), marginBottom:10, letterSpacing:2 }}>{isMn ? 'BULK АВАХ ТУСАМ ХЯМД' : 'BULK DISCOUNTS AVAILABLE'}</div>
              <div style={FM(13,DIM2)}>{isMn ? 'Task шийдэхэд гацвал AI-г ашигла' : 'Use AI when you get stuck on a task'}</div>
            </div>

            <SectionLabel label={isMn ? 'TOKEN АШИГЛАЛТ' : 'TOKEN USAGE'} col="#ffd700"/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:32 }}>
              {TOKEN_USES.map((u, i) => (
                <div key={u.label} style={{ background:BG2, border:`1px solid ${u.col}22`, padding:'0', overflow:'hidden', transition:'border-color .2s', animation:`pr-in .3s ease ${i*0.08}s both` }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${u.col}55`}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${u.col}22`}>
                  <div style={{ height:3, background:u.col }}/>
                  <div style={{ padding:'22px 16px', textAlign:'center' }}>
                    <div style={{ fontSize:32, marginBottom:12 }}>{u.icon}</div>
                    <div style={{ ...FP(8,u.col), marginBottom:10 }}>{u.label}</div>
                    <div style={{ display:'flex', justifyContent:'center', alignItems:'baseline', gap:6, marginBottom:6 }}>
                      <span style={FP(24,'#c0d0e0')}>{u.cost}</span>
                      <span style={FP(8,DIM2)}>token</span>
                    </div>
                    <div style={FP(9,u.col)}>{u.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <SectionLabel label={isMn ? 'TOKEN БАГЦ' : 'TOKEN PACKS'} col="#00e5ff"/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
              {TOKEN_PACKS.map((tk, i) => (
                <div key={i} style={{ background:BG2, border:`2px solid ${tokenSel===i ? tk.col : `${tk.col}22`}`, padding:'0', position:'relative', cursor:'pointer', transition:'all .2s', boxShadow: tokenSel===i ? `0 0 24px ${tk.col}14` : 'none' }}
                  onClick={() => setTokenSel(i)}>
                  <div style={{ height:3, background:tk.col }}/>
                  {tk.popular && (
                    <div style={{ position:'absolute', top:12, right:0, ...FP(6,BG), background:tk.col, padding:'4px 10px' }}>{isMn ? 'АЛДАРТАЙ' : 'POPULAR'}</div>
                  )}
                  <div style={{ padding:'22px 22px 24px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                      <span style={{ fontSize:26 }}>🤖</span>
                      <span style={FP(26,tk.col)}>{tk.amount}</span>
                      <span style={FP(10,DIM2)}>token</span>
                      {(tk as any).bonus && <span style={{ ...FP(7,'#00ff41'), border:'1px solid #00ff4133', padding:'2px 8px' }}>{(tk as any).bonus} bonus</span>}
                    </div>
                    <div style={{ ...FP(24,'#c0d0e0'), marginBottom:5 }}>{tk.price}</div>
                    <div style={{ ...FM(12,DIM2), marginBottom:8 }}>{tk.per}</div>
                    {tk.save && <div style={FP(8,'#00ff41')}>✓ {tk.save}</div>}
                    {tokenSel === i && (
                      <a href={`/payment?item=token_${tk.amount}`} style={{ display:'block', width:'100%', marginTop:18, padding:'13px', textAlign:'center', ...FP(9,BG,2), textDecoration:'none', background:tk.col, boxSizing:'border-box', transition:'opacity .2s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'}
                        onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.opacity = '1'}>
                        💳 {isMn ? 'ХУДАЛДАН АВАХ' : 'BUY NOW'}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <SectionLabel label={isMn ? 'SUBSCRIPTION VS TOKEN' : 'SUBSCRIPTION VS TOKEN'} col="#bf5af2"/>
            <div style={{ background:BG2, border:`1px solid ${DIM}`, padding:'22px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:14 }}>
                {[
                  { plan:'FREE', tok: isMn?'5/өдөр':'5/day',  cost:'₮0',         note:'₮350/token',    col:DIM2 },
                  { plan:'PRO',  tok: isMn?'100/сар':'100/mo', cost:isMn?'₮17,000/сар':'₮17,000/mo', note:'₮170/token ✓', col:'#00e5ff' },
                  { plan:'VIP',  tok: isMn?'400/сар':'400/mo', cost:isMn?'₮34,000/сар':'₮34,000/mo', note:'₮85/token ✓',  col:'#ffd700' },
                ].map(r => (
                  <div key={r.plan} style={{ padding:'16px', background:BG, border:`1px solid ${r.col}22`, position:'relative' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${r.col}44,transparent)` }}/>
                    <div style={{ ...FP(9,r.col,1), marginBottom:10 }}>{r.plan}</div>
                    <div style={{ ...FP(14,'#c0d0e0'), marginBottom:5 }}>{r.tok}</div>
                    <div style={{ ...FM(12,DIM2), marginBottom:5 }}>{r.cost}</div>
                    <div style={FP(8,r.col)}>{r.note}</div>
                  </div>
                ))}
              </div>
              <div style={{ padding:'14px 16px', background:BG, border:`1px solid #00e5ff14`, ...FM(12,DIM2), lineHeight:1.9 }}>
                💡 <b style={{ color:'#c0d0e0' }}>PRO subscription</b> нь token худалдаахаас <b style={{ color:'#00e5ff' }}>2x хямд</b>. VIP нь <b style={{ color:'#ffd700' }}>4x хямд</b>.
              </div>
            </div>
          </div>
        )}

        {/* ══ HISTORY ══ */}
        {tab === 'history' && (
          <div style={{ animation:'pr-in .3s ease' }}>
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div style={{ ...FP(5,DIM2,5), marginBottom:14 }}>💳 ТӨЛБӨРИЙН ТҮҮХ</div>
              <div style={{ ...FP(24,'#c0d0e0'), marginBottom:10, letterSpacing:2 }}>МИНИЙ ЗАХИАЛГУУД</div>
            </div>

            {fetchingH ? (
              <div style={{ padding:'60px', textAlign:'center', ...FP(8,DIM2) }}>АЧААЛЛАЖ БАЙНА...</div>
            ) : !session ? (
              <div style={{ background:BG2, border:`1px solid ${DIM}`, padding:'64px', textAlign:'center' }}>
                <div style={{ fontSize:44, marginBottom:14 }}>🔒</div>
                <div style={{ ...FP(9,DIM2), marginBottom:20 }}>Түүх харахын тулд нэвтэрнэ үү</div>
                <a href="/login" style={{ ...FP(8,'#00e5ff'), padding:'11px 24px', border:'1px solid #00e5ff55', textDecoration:'none' }}>НЭВТРЭХ →</a>
              </div>
            ) : payments.length === 0 ? (
              <div style={{ background:BG2, border:`1px solid ${DIM}`, padding:'64px', textAlign:'center' }}>
                <div style={{ fontSize:44, marginBottom:14 }}>💳</div>
                <div style={{ ...FP(9,DIM2), marginBottom:8 }}>{isMn ? 'Төлбөрийн түүх байхгүй' : 'No payment history'}</div>
                <div style={{ ...FM(12,DIM2), marginBottom:24 }}>{isMn ? 'Эрэмбэ дэвшүүлж эхэл' : 'Start leveling up'}</div>
                <button onClick={() => setTab('plans')}
                  style={{ ...FP(8,'#00e5ff'), padding:'11px 24px', border:'1px solid #00e5ff55', background:'transparent', cursor:'pointer' }}>
                  {isMn ? 'SUBSCRIPTION ХАРАХ →' : 'VIEW PLANS →'}
                </button>
              </div>
            ) : (
              <>
                {/* Stats */}
                <div style={{ display:'flex', border:`1px solid ${DIM}`, overflow:'hidden', marginBottom:20 }}>
                  {([
                    [t('pr_total'),       String(payments.length),                                                                    DIM2     ],
                    [t('pr_paid'),        String(payments.filter((p:any)=>p.status==='PAID').length),                                 '#00ff41'],
                    [t('pr_total_spent'), `${payments.filter((p:any)=>p.status==='PAID').reduce((s:number,p:any)=>s+p.amount,0).toLocaleString()}₮`, '#00e5ff'],
                  ] as [string,string,string][]).map(([l,v,c],i) => (
                    <div key={l} style={{ flex:1, padding:'16px 20px', background:BG2, borderLeft:i>0?`1px solid ${DIM}`:'none' }}>
                      <div style={{ ...FP(5,DIM2,2), marginBottom:6 }}>{l}</div>
                      <div style={FP(18,c)}>{v}</div>
                    </div>
                  ))}
                </div>

                {/* Table */}
                <div style={{ background:BG2, border:`1px solid ${DIM}`, overflow:'hidden', marginBottom:24 }}>
                  <div style={{ display:'flex', background:BG3, borderBottom:`1px solid ${DIM}` }}>
                    {(isMn ? [['ОГНОО',1.4],['ТӨРӨЛ',1],['ДҮН',0.9],['ТӨЛӨВ',1.2]] : [['DATE',1.4],['TYPE',1],['AMOUNT',0.9],['STATUS',1.2]] as [string,number][]).map(([h,f]) => (
                      <div key={h} style={{ flex:f, padding:'11px 16px', ...FP(6,DIM2,2) }}>{h}</div>
                    ))}
                  </div>
                  {payments.map((p:any) => {
                    const col = STATUS_COL[p.status] || DIM2
                    const isSelected = selPay === p.id
                    return (
                      <div key={p.id}>
                        <div
                          onClick={() => setSelPay(isSelected ? null : p.id)}
                          style={{ display:'flex', alignItems:'center', borderBottom:`1px solid ${BG3}`, cursor:'pointer', transition:'background .15s', background:isSelected?'rgba(0,255,65,.04)':'transparent' }}
                          onMouseEnter={e => !isSelected && ((e.currentTarget as HTMLDivElement).style.background='rgba(255,255,255,.02)')}
                          onMouseLeave={e => !isSelected && ((e.currentTarget as HTMLDivElement).style.background='transparent')}>
                          <div style={{ width:3, alignSelf:'stretch', background:col, flexShrink:0 }}/>
                          <div style={{ flex:1.4, padding:'13px 16px', ...FM(11,DIM2) }}>{new Date(p.createdAt).toLocaleDateString('mn-MN')}</div>
                          <div style={{ flex:1,   padding:'13px 16px', ...FP(7,TEXT) }}>{TYPE_LBL[p.type]||p.type}</div>
                          <div style={{ flex:0.9, padding:'13px 16px', ...FP(11,'#c0d0e0') }}>{p.amount.toLocaleString()}₮</div>
                          <div style={{ flex:1.2, padding:'13px 16px' }}>
                            <span style={{ ...FP(6,col), border:`1px solid ${col}44`, padding:'4px 10px' }}>{STATUS_LBL_I18N[p.status]||p.status}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div style={{ background:'rgba(0,255,65,.03)', borderBottom:`1px solid ${DIM}`, padding:'16px 24px 16px 27px' }}>
                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                              {([['ID', p.id.slice(0,20)+'...'],['Арга', p.method||'—'],['Metadata', JSON.stringify(p.metadata||{})],['Approved', p.approvedAt ? new Date(p.approvedAt).toLocaleDateString('mn-MN') : '—']] as [string,string][]).map(([k,v]) => (
                                <div key={k} style={{ padding:'10px 14px', background:BG, border:`1px solid ${DIM}` }}>
                                  <div style={{ ...FP(5,DIM2,2), marginBottom:5 }}>{k}</div>
                                  <div style={FM(11,TEXT)}>{v}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ══ CONTEST ══ */}
        {tab === 'contest' && (
          <div style={{ animation:'pr-in .3s ease' }}>
            <div style={{ textAlign:'center', marginBottom:36 }}>
              <div style={{ ...FP(5,DIM2,5), marginBottom:14 }}>⚔ CONTEST ENTRY ҮНЭ</div>
              <div style={{ ...FP(24,'#c0d0e0'), marginBottom:10, letterSpacing:2 }}>7 ХОНОГ ТУТМЫН ШАЛГАЛТ</div>
              <div style={FM(13,DIM2)}>Өрсөлдөж XP · Badge · AI token · Prize pool шагнал аваарай</div>
            </div>

            <SectionLabel label="ENTRY ҮНЭ" col="#ff6b35"/>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
              {[
                { tier:'🆓 FREE', fee:'₮10,000', note:'Стандарт тариф',          col:DIM2,     href:'/payment?item=contest' },
                { tier:'⭐ PRO',  fee:'₮3,000',  note:'₮7,000 хямд — 70% off',  col:'#00e5ff', href:'/payment?item=contest' },
                { tier:'💎 VIP',  fee:'ҮНЭГҮЙ',  note:'Бүх contest — free entry', col:'#ffd700', href:'/dashboard' },
              ].map((p, i) => (
                <div key={p.tier} style={{ background:BG2, border:`1px solid ${p.col}33`, padding:'0', position:'relative', overflow:'hidden', animation:`pr-in .3s ease ${i*0.1}s both` }}>
                  <div style={{ height:3, background:p.col }}/>
                  <div style={{ padding:'22px 22px 24px' }}>
                    <div style={{ ...FP(12,p.col,1), marginBottom:16 }}>{p.tier}</div>
                    <div style={{ ...FP(28,'#c0d0e0'), marginBottom:8 }}>{p.fee}</div>
                    <div style={{ ...FM(12,DIM2), marginBottom:22, lineHeight:1.7 }}>{p.note}</div>
                    <a href={p.href} style={{ display:'block', padding:'12px', textAlign:'center', ...FP(9, p.fee==='ҮНЭГҮЙ'?BG:p.col, 2), textDecoration:'none', background: p.fee==='ҮНЭГҮЙ'?p.col:'transparent', border:`1px solid ${p.col}44`, transition:'all .2s', boxSizing:'border-box' }}
                      onMouseEnter={e => { if (p.fee !== 'ҮНЭГҮЙ') (e.currentTarget as HTMLAnchorElement).style.background = `${p.col}14` }}
                      onMouseLeave={e => { if (p.fee !== 'ҮНЭГҮЙ') (e.currentTarget as HTMLAnchorElement).style.background = 'transparent' }}>
                      {p.fee === 'ҮНЭГҮЙ' ? 'ШУУД ОРОЛЦОХ' : '💳 БҮРТГҮҮЛЭХ'}
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {loadingC ? (
              <div style={{ padding:'40px', textAlign:'center', ...FP(8,DIM2) }}>АЧААЛЛАЖ БАЙНА...</div>
            ) : contests.length === 0 ? (
              <div style={{ background:BG2, border:`1px solid ${DIM}`, padding:'56px', textAlign:'center' }}>
                <div style={{ fontSize:44, marginBottom:14 }}>⚔</div>
                <div style={{ ...FP(9,DIM2), marginBottom:8 }}>Одоогоор идэвхтэй contest байхгүй</div>
                <div style={FM(12,DIM2)}>Удахгүй шинэ challenge нэмэгдэнэ</div>
              </div>
            ) : contests.map(contest => {
              const end  = new Date(contest.endDate)
              const diff = Math.max(0, end.getTime() - Date.now())
              const days = Math.floor(diff / 86400000)
              const hrs  = Math.floor((diff % 86400000) / 3600000)
              const mins = Math.floor((diff % 3600000) / 60000)
              return (
                <div key={contest.id} style={{ background:BG2, border:'1px solid #ffd70033', padding:'0', marginBottom:16, position:'relative', overflow:'hidden' }}>
                  <div style={{ height:3, background:'#ffd700' }}/>
                  <div style={{ padding:'24px 28px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                      <div>
                        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                          <div style={{ position:'relative', width:8, height:8 }}>
                            <div style={{ width:8, height:8, background:'#ff2d55', borderRadius:'50%' }}/>
                            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#ff2d55', animation:'pr-ping 1.2s ease-out infinite' }}/>
                          </div>
                          <div style={{ ...FP(6,'#ff2d55',2) }}>ИДЭВХТЭЙ</div>
                        </div>
                        <div style={{ ...FP(16,'#c0d0e0'), marginBottom:8 }}>{contest.title}</div>
                        <div style={FM(13,DIM2)}>{contest.description}</div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0, paddingLeft:24 }}>
                        <div style={{ ...FP(5,DIM2,2), marginBottom:6 }}>ДУУСАХ</div>
                        <div style={FP(22,'#ffd700')}>{days}д {hrs}ц {mins}м</div>
                      </div>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:20 }}>
                      {[
                        ['ОРОЛЦОГЧ', String(contest.participantCount), '#00e5ff'],
                        ['TASK',     String(contest.taskCount),        TEXT],
                        ['PRIZE',    `₮${(contest.prizePool||0).toLocaleString()}`, '#00ff41'],
                        ['ТОП',      contest.topScore ? `${contest.topScore} XP` : '—', '#ffd700'],
                      ].map(([l,v,col]) => (
                        <div key={l} style={{ background:BG, padding:'14px', textAlign:'center', border:`1px solid ${col}22`, position:'relative' }}>
                          <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${col}44,transparent)` }}/>
                          <div style={{ ...FP(5,col,1), marginBottom:8 }}>{l}</div>
                          <div style={FP(15,col)}>{v}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                      {[
                        ['🥇 1-р байр', [`₮${(contest.prizeFirst||0).toLocaleString()}`, '500 XP', '50 AI token', 'Gold badge'], '#ffd700'],
                        ['🥈 2-р байр', [`₮${(contest.prizeSecond||0).toLocaleString()}`, '300 XP', '30 AI token', 'Silver badge'], TEXT],
                        ['🥉 3-р байр', [`₮${(contest.prizeThird||0).toLocaleString()}`, '150 XP', '15 AI token', 'Bronze badge'], '#cd7f32'],
                      ].map(([place, rewards, col]) => (
                        <div key={String(place)} style={{ padding:'16px', background:BG, border:`1px solid ${String(col)}33` }}>
                          <div style={{ ...FP(10,String(col)), marginBottom:10 }}>{place}</div>
                          {(rewards as string[]).map(rw => (
                            <div key={rw} style={{ ...FM(12,DIM2), marginBottom:6 }}>✓ {rw}</div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ label, col }: { label:string; col:string }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
      <div style={{ width:3, height:18, background:col, boxShadow:`0 0 8px ${col}` }}/>
      <div style={{ fontFamily:'var(--fp)', fontSize:6, color:col, letterSpacing:4, opacity:.8 }}>{label}</div>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${col}33,transparent)` }}/>
    </div>
  )
}