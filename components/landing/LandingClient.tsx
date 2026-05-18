'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useLang } from '@/context/LanguageContext'

const AuthModal = dynamic(() => import('@/components/ui/AuthModal'), { ssr: false })

const COURSES = [
  { n:'01', t:'HTML',        sub:'Game World Foundation', c:'#00e5ff' },
  { n:'02', t:'CSS',         sub:'Game Style System',     c:'#bf5af2' },
  { n:'03', t:'JavaScript',  sub:'Real Game Logic',       c:'#ffd700' },
  { n:'04', t:'Advanced JS', sub:'Game Logic Deep',       c:'#ff6600' },
  { n:'05', t:'React',       sub:'Game UI System',        c:'#00ff41' },
  { n:'06', t:'Node.js',     sub:'Game Backend',          c:'#68d391' },
  { n:'07', t:'Database',    sub:'Multiplayer System',    c:'#4488ff' },
  { n:'08', t:'Deploy',      sub:'Final Game Launch',     c:'#ffd700' },
]

const FEATURES_MN = [
  { icon:'⚔', col:'#00e5ff', title:'ТОГЛООМЖУУЛСАН СУРГАЛТ', desc:'Task бүрийг шийдэх тусам тоглоомд ахиц гарна. Зөв хариулт → enemy устгана. Буруу хариулт → HP хасагдана.', extra:{ label:'XP PROGRESS', pct:70, col:'#00e5ff' } },
  { icon:'🏆', col:'#ffd700', title:'ДЭЛХИЙН LEADERBOARD', desc:'Монгол болон дэлхийн тоглогчидтой XP-р өрсөлдөж, шилдэг 10-т орж нэрээ мөнхлүүлээрэй.', badge:'LIVE', ranks:[['#1','DARKCODE','#ffd700'],['#2','PIXEL_MAN','#a0a8b8'],['#3','BYTE_Q','#bf5af2']] },
  { icon:'📈', col:'#00ff41', title:'ЯВЦЫН ДЭВШИЛ', desc:'8 course, 56 lesson бүрийн дэвшлийг real-time харж мотивациа хадгал.', bars:[['HTML→CSS','85','#00e5ff'],['JavaScript','60','#ffd700'],['React+Node','30','#00ff41']] },
  { icon:'🤖', col:'#ff2d55', title:'AI AGENT ДЭМЖЛЭГ', badge2:'ШИНЭ', desc:'Task шийдэхэд гацвал ArenaHub-ын AI agent танд hint өгнө, тайлбарлана, жишээ бичиж өгнө.', cta:'AI АШИГЛАХ →' },
]
const FEATURES_EN = [
  { icon:'⚔', col:'#00e5ff', title:'GAMIFIED LEARNING', desc:'Every task you solve advances the game. Correct answer → defeat the enemy. Wrong answer → lose HP.', extra:{ label:'XP PROGRESS', pct:70, col:'#00e5ff' } },
  { icon:'🏆', col:'#ffd700', title:'GLOBAL LEADERBOARD', desc:'Compete with Mongolian and global players by XP. Reach the Top 10 and immortalize your name.', badge:'LIVE', ranks:[['#1','DARKCODE','#ffd700'],['#2','PIXEL_MAN','#a0a8b8'],['#3','BYTE_Q','#bf5af2']] },
  { icon:'📈', col:'#00ff41', title:'PROGRESS TRACKING', desc:'Track your real-time progress across 8 courses and 56 lessons and stay motivated.', bars:[['HTML→CSS','85','#00e5ff'],['JavaScript','60','#ffd700'],['React+Node','30','#00ff41']] },
  { icon:'🤖', col:'#ff2d55', title:'AI AGENT SUPPORT', badge2:'NEW', desc:'Stuck on a task? ArenaHub\'s AI agent gives you hints, explanations, and code examples.', cta:'USE AI →' },
]

const PLANS_MN = [
  { id:'free', icon:'🆓', label:'АНХДАГЧ', price:'₮0', period:'', col:'#5a6a8a', highlight:false, badge:'', desc:'Эхлэгчдэд зориулсан үндсэн эрх', features:[{t:'2 курс (HTML + CSS)',ok:true},{t:'Өдөрт 10 task',ok:true},{t:'Leaderboard харах',ok:true},{t:'5 AI token / өдөр',ok:true},{t:'Бүх 8 курс',ok:false},{t:'Progress analytics',ok:false},{t:'Contest оролцоо',ok:false}], btn:'ЭХЛЭХ' },
  { id:'pro',  icon:'⭐', label:'PRO',      price:'₮17,000', period:'/сар', col:'#00e5ff', highlight:true, badge:'ХАМГИЙН АЛДАРТАЙ', desc:'Бүх курс + AI token + Analytics', features:[{t:'Бүх 8 курс unlock',ok:true},{t:'Хязгааргүй task',ok:true},{t:'Leaderboard оролцох',ok:true},{t:'100 AI token / сар',ok:true},{t:'Progress analytics',ok:true},{t:'Contest (₮3,000 хямд)',ok:true},{t:'Exclusive badge',ok:false}], btn:'▶ PRO БОЛОХ' },
  { id:'vip',  icon:'💎', label:'VIP',      price:'₮34,000', period:'/сар', col:'#ffd700', highlight:false, badge:'💎 PREMIUM', desc:'Pro бүх боломж + дэвшилтэт AI', features:[{t:'Pro бүх боломж',ok:true},{t:'400 AI token / сар',ok:true},{t:'Deep AI explanation',ok:true},{t:'Contest ҮНЭГҮЙ',ok:true},{t:'Leaderboard highlight',ok:true},{t:'Exclusive badge + frame',ok:true},{t:'Early access feature',ok:true}], btn:'💎 VIP БОЛОХ' },
]
const PLANS_EN = [
  { id:'free', icon:'🆓', label:'STARTER',  price:'₮0', period:'', col:'#5a6a8a', highlight:false, badge:'', desc:'Basic access for beginners', features:[{t:'2 courses (HTML + CSS)',ok:true},{t:'10 tasks per day',ok:true},{t:'View leaderboard',ok:true},{t:'5 AI tokens / day',ok:true},{t:'All 8 courses',ok:false},{t:'Progress analytics',ok:false},{t:'Contest access',ok:false}], btn:'GET STARTED' },
  { id:'pro',  icon:'⭐', label:'PRO',      price:'₮17,000', period:'/mo', col:'#00e5ff', highlight:true, badge:'MOST POPULAR', desc:'All courses + AI tokens + Analytics', features:[{t:'All 8 courses unlocked',ok:true},{t:'Unlimited tasks',ok:true},{t:'Join leaderboard',ok:true},{t:'100 AI tokens / mo',ok:true},{t:'Progress analytics',ok:true},{t:'Contest (₮3,000 off)',ok:true},{t:'Exclusive badge',ok:false}], btn:'▶ GO PRO' },
  { id:'vip',  icon:'💎', label:'VIP',      price:'₮34,000', period:'/mo', col:'#ffd700', highlight:false, badge:'💎 PREMIUM', desc:'All Pro features + advanced AI', features:[{t:'All Pro features',ok:true},{t:'400 AI tokens / mo',ok:true},{t:'Deep AI explanation',ok:true},{t:'Contest FREE',ok:true},{t:'Leaderboard highlight',ok:true},{t:'Exclusive badge + frame',ok:true},{t:'Early access features',ok:true}], btn:'💎 GO VIP' },
]

const KF = `
@keyframes scan  { 0%{top:-80px} 100%{top:100%} }
@keyframes ping  { 0%{transform:scale(1);opacity:.8} 100%{transform:scale(2.4);opacity:0} }
@keyframes fadeUp{ from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
@keyframes menuIn{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }
.lp-nav-lnk:hover { color:var(--text) !important; }
.lp-card-hover:hover { transform:translateY(-2px); }

/* ── RESPONSIVE ── */
.lp-hero       { display:grid; grid-template-columns:1fr 420px; min-height:620px; }
.lp-stat-strip { display:grid; grid-template-columns:repeat(4,1fr); }
.lp-grid-4     { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; }
.lp-grid-2     { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
.lp-grid-3     { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
.lp-section    { padding:72px 56px; }
.lp-nav-links  { display:flex; gap:2px; align-items:center; }
.lp-nav        { padding:0 48px; }
.lp-hero-right { display:flex; }
.lp-hide-mobile{ display:block; }
.lp-hamburger  { display:none; }
.lp-mobile-menu{ display:none; }

@media(max-width:1024px){
  .lp-hero   { grid-template-columns:1fr; }
  .lp-hero-right { display:none; }
  .lp-grid-4 { grid-template-columns:repeat(2,1fr); }
  .lp-grid-3 { grid-template-columns:1fr 1fr; }
  .lp-section{ padding:48px 32px; }
  .lp-nav    { padding:0 24px; }
}
@media(max-width:768px){
  .lp-grid-2  { grid-template-columns:1fr; }
  .lp-grid-3  { grid-template-columns:1fr; }
  .lp-stat-strip{ grid-template-columns:repeat(2,1fr); }
  .lp-section { padding:40px 20px; }
  .lp-nav     { padding:0 16px; }
  .lp-nav-links{ display:none; }
  .lp-hamburger{ display:flex; }
  .lp-mobile-menu-open { display:flex; flex-direction:column; position:absolute; top:56px; left:0; right:0; background:rgba(8,12,20,.98); border-bottom:1px solid #151d30; padding:16px; gap:8px; z-index:300; animation:menuIn .2s ease; }
  .lp-hide-mobile{ display:none; }
}
@media(max-width:480px){
  .lp-grid-4  { grid-template-columns:1fr; }
  .lp-section { padding:32px 16px; }
}
`

interface LbEntry { username: string; xp: number }

function GhostBtn({ label, col, onClick }: { label: string; col: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ fontFamily:'var(--fp)', fontSize:7, letterSpacing:2, padding:'10px 22px',
        cursor:'pointer', background:'transparent', color:col,
        border:`1px solid ${col}55`, transition:'all .2s' }}
      onMouseEnter={e => { e.currentTarget.style.background = `${col}18`; e.currentTarget.style.borderColor = col }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = `${col}55` }}>
      {label}
    </button>
  )
}

export default function LandingClient({ initialLb }: { initialLb: LbEntry[] }) {
  const [modal,    setModal]    = useState<'login' | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const { lang, setLang } = useLang()
  const isMn     = lang === 'mn'
  const FEATURES = isMn ? FEATURES_MN : FEATURES_EN
  const PLANS    = isMn ? PLANS_MN    : PLANS_EN
  const [lb,          setLb]          = useState<(LbEntry & { rank: number })[]>(
    initialLb.map((u, i) => ({ ...u, rank: i + 1 }))
  )
  const [lbUpdatedAt, setLbUpdatedAt] = useState<number>(Date.now())
  const [lbPulse,     setLbPulse]     = useState(false)
  const [tick,        setTick]        = useState(0)
  const [stats, setStats] = useState({ courses:8, lessons:56, tasks:280, users:0 })

  const fetchLb = () => {
    fetch('/api/public/leaderboard').then(r => r.json()).then(d => {
      if (d.ok && d.users?.length) {
        setLb(d.users.slice(0, 6).map((u: LbEntry, i: number) => ({ ...u, rank: i + 1 })))
        setLbUpdatedAt(d.updatedAt || Date.now())
        setLbPulse(true)
        setTimeout(() => setLbPulse(false), 600)
      }
    }).catch(() => {})
  }

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    fetchLb()
    fetch('/api/public/stats').then(r => r.json()).then(d => {
      if (d.ok) setStats({ courses: d.courses, lessons: d.lessons, tasks: d.tasks, users: d.users })
    }).catch(() => {})
    const lbInterval   = setInterval(fetchLb, 30_000)
    const tickInterval = setInterval(() => setTick(t => t + 1), 1_000)
    return () => { window.removeEventListener('scroll', fn); clearInterval(lbInterval); clearInterval(tickInterval) }
  }, [])

  const top3 = lb.slice(0, 3)
  const rest  = lb.slice(3)

  return (
    <div style={{ minHeight:'100vh', color:'var(--text)', position:'relative', zIndex:1 }}>
      <style>{KF}</style>

      {/* scan line */}
      <div style={{ position:'fixed', left:0, right:0, height:80, pointerEvents:'none', zIndex:0,
        background:'linear-gradient(180deg,transparent,rgba(0,229,255,.012),transparent)',
        animation:'scan 8s linear infinite' }} />

      {/* ── NAV ──────────────────────────────────────────────────── */}
      <nav style={{
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'0 48px', height:56,
        background: scrolled ? 'rgba(8,12,20,.98)' : 'rgba(8,12,20,.75)',
        borderBottom:`1px solid ${scrolled ? '#151d30' : 'transparent'}`,
        position:'sticky', top:0, zIndex:200,
        backdropFilter:'blur(16px)', transition:'all .3s',
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <img src="/logo.svg" alt="ArenaHub" width={26} height={26} style={{display:'block'}}/>
          <div>
            <div style={{ fontFamily:'var(--fp)', fontSize:9, color:'#fff', letterSpacing:2, lineHeight:1 }}>ARENAHUB</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:4, color:'#1a3050', letterSpacing:3 }}>IT СУРГАЛТ · GAME</div>
          </div>
        </div>

        <div className="lp-nav-links" style={{ gap:2, alignItems:'center' }}>
          {([['FEATURES','features','#00e5ff'],['COURSES','courses','#00ff41'],['PRICING','pricing','#ffd700']] as [string,string,string][]).map(([t,id,col])=>(
            <button key={t} className="lp-nav-lnk"
              onClick={()=>{ document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setMobileMenu(false) }}
              style={{ fontFamily:'var(--fp)', fontSize:5, letterSpacing:2, padding:'8px 14px',
                background:'none', border:'none', color:'#3a4560', cursor:'pointer', transition:'color .15s' }}
              onMouseEnter={e=>{ e.currentTarget.style.color=col }}
              onMouseLeave={e=>{ e.currentTarget.style.color='#3a4560' }}>
              {t}
            </button>
          ))}
          <div className="lp-hide-mobile" style={{ width:1, height:18, background:'#151d30', margin:'0 8px' }}/>
          {(['mn','en'] as const).map(l => (
            <button key={l} onClick={() => setLang(l)}
              style={{ display:'flex', alignItems:'center', gap:4, padding:'5px 8px',
                border:`1px solid ${lang===l?'rgba(0,229,255,.4)':'rgba(255,255,255,.06)'}`,
                background: lang===l ? 'rgba(0,229,255,.08)' : 'transparent',
                cursor:'pointer', transition:'all .15s', marginRight: l==='en' ? 6 : 2 }}>
              <svg width="16" height="10" viewBox="0 0 30 18" style={{imageRendering:'pixelated',display:'block'}}>
                {l==='mn' ? <>
                  <rect x="0" y="0" width="10" height="18" fill="#C4272F"/><rect x="10" y="0" width="10" height="18" fill="#015197"/><rect x="20" y="0" width="10" height="18" fill="#C4272F"/>
                  <rect x="3" y="1" width="4" height="1" fill="#F9CF02"/><rect x="2" y="2" width="6" height="3" fill="#F9CF02"/><rect x="1" y="6" width="8" height="1" fill="#F9CF02"/><rect x="1" y="8" width="8" height="1" fill="#F9CF02"/><rect x="3" y="9" width="4" height="3" fill="#F9CF02"/><rect x="1" y="13" width="8" height="1" fill="#F9CF02"/><rect x="1" y="15" width="8" height="2" fill="#F9CF02"/>
                </> : <>
                  <rect x="0" y="0" width="30" height="18" fill="#B22234"/><rect x="0" y="2" width="30" height="2" fill="#fff"/><rect x="0" y="6" width="30" height="2" fill="#fff"/><rect x="0" y="10" width="30" height="2" fill="#fff"/><rect x="0" y="14" width="30" height="2" fill="#fff"/>
                  <rect x="0" y="0" width="12" height="10" fill="#3C3B6E"/><rect x="1" y="1" width="2" height="1" fill="#fff"/><rect x="5" y="1" width="2" height="1" fill="#fff"/><rect x="9" y="1" width="2" height="1" fill="#fff"/><rect x="3" y="4" width="2" height="1" fill="#fff"/><rect x="7" y="4" width="2" height="1" fill="#fff"/>
                </>}
              </svg>
              <span style={{ fontFamily:'var(--fp)', fontSize:5, color: lang===l ? '#00e5ff' : '#3a5070', letterSpacing:1 }}>
                {l==='mn' ? 'МОН' : 'ENG'}
              </span>
            </button>
          ))}
          <div className="lp-hide-mobile"><GhostBtn label="LOGIN" col="#00ff41" onClick={() => setModal('login')} /></div>
          {/* Hamburger */}
          <button className="lp-hamburger" onClick={() => setMobileMenu(m => !m)}
            style={{ background:'transparent', border:'1px solid #1a2a40', padding:'7px 10px', cursor:'pointer', flexDirection:'column', gap:4, marginLeft:6 }}>
            {[0,1,2].map(i => <div key={i} style={{ width:18, height:2, background: mobileMenu ? (i===1?'transparent':'#00ff41') : '#5a6a8a', transition:'all .2s', transform: mobileMenu ? (i===0?'rotate(45deg) translate(4px,4px)':i===2?'rotate(-45deg) translate(4px,-4px)':'none') : 'none' }}/>)}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="lp-mobile-menu-open" onClick={() => setMobileMenu(false)}>
          {([['FEATURES','features','#00e5ff'],['COURSES','courses','#00ff41'],['PRICING','pricing','#ffd700']] as [string,string,string][]).map(([t,id,col])=>(
            <button key={t} onClick={()=>{ document.getElementById(id)?.scrollIntoView({behavior:'smooth'}); setMobileMenu(false) }}
              style={{ fontFamily:'var(--fp)', fontSize:6, letterSpacing:2, padding:'12px 16px', background:'none', border:`1px solid ${col}22`, color:'#5a6a8a', cursor:'pointer', textAlign:'left', transition:'color .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.color=col}} onMouseLeave={e=>{e.currentTarget.style.color='#5a6a8a'}}>
              {t}
            </button>
          ))}
          <div style={{ display:'flex', gap:8, paddingTop:8, borderTop:'1px solid #151d30' }}>
            {(['mn','en'] as const).map(l=>(
              <button key={l} onClick={()=>{setLang(l);setMobileMenu(false)}}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 12px', border:`1px solid ${lang===l?'rgba(0,229,255,.4)':'#1a2840'}`, background:lang===l?'rgba(0,229,255,.08)':'transparent', cursor:'pointer', flex:1, justifyContent:'center' }}>
                <svg width="16" height="10" viewBox="0 0 30 18" style={{imageRendering:'pixelated'}}>
                  {l==='mn'?<><rect x="0" y="0" width="10" height="18" fill="#C4272F"/><rect x="10" y="0" width="10" height="18" fill="#015197"/><rect x="20" y="0" width="10" height="18" fill="#C4272F"/><rect x="1" y="6" width="8" height="1" fill="#F9CF02"/><rect x="1" y="8" width="8" height="1" fill="#F9CF02"/></>:<><rect x="0" y="0" width="30" height="18" fill="#B22234"/><rect x="0" y="2" width="30" height="2" fill="#fff"/><rect x="0" y="6" width="30" height="2" fill="#fff"/><rect x="0" y="0" width="12" height="10" fill="#3C3B6E"/></>}
                </svg>
                <span style={{ fontFamily:'var(--fp)', fontSize:5, color:lang===l?'#00e5ff':'#3a5070', letterSpacing:1 }}>{l==='mn'?'МОН':'ENG'}</span>
              </button>
            ))}
          </div>
          <button onClick={()=>{setModal('login');setMobileMenu(false)}} style={{ fontFamily:'var(--fp)', fontSize:7, letterSpacing:2, padding:'12px', background:'rgba(0,255,65,.08)', border:'1px solid rgba(0,255,65,.3)', color:'#00ff41', cursor:'pointer' }}>
            ▶ LOGIN
          </button>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <div className="lp-hero" style={{ borderBottom:'1px solid #151d30' }}>

        {/* LEFT */}
        <div className="lp-hero-left" style={{ padding:'clamp(32px,5vw,64px) clamp(20px,5vw,56px)', display:'flex', flexDirection:'column',
          justifyContent:'center', gap:28, animation:'fadeUp .5s ease' }}>

          <div style={{ display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(255,215,0,.08)', border:'1px solid rgba(255,215,0,.3)',
            padding:'6px 14px', width:'fit-content' }}>
            <span style={{ width:6, height:6, background:'#ffd700', borderRadius:'50%',
              animation:'ping 1.5s infinite', display:'inline-block' }} />
            <span style={{ fontFamily:'var(--fp)', fontSize:5, color:'#ffd700', letterSpacing:3 }}>
              {isMn ? 'FULLSTACK DEVELOPER БОЛОХ ЗАМНАЛ' : 'YOUR PATH TO FULLSTACK DEVELOPER'}
            </span>
          </div>

          <div>
            <div style={{ fontFamily:'var(--fp)', fontSize:'clamp(28px,4vw,48px)',
              lineHeight:1.35, color:'var(--text)', letterSpacing:2 }}>{isMn ? 'УР ЧАДВАРАА' : 'LEVEL UP YOUR'}</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:'clamp(28px,4vw,48px)',
              lineHeight:1.35, color:'#00ff41',
              textShadow:'0 0 24px rgba(0,255,65,.4)', letterSpacing:2 }}>{isMn ? 'LEVEL UP ХИЙ' : 'CODING SKILLS'}</div>
          </div>

          <div style={{ fontFamily:'var(--fm)', fontSize:13, color:'#5a6a8a',
            lineHeight:2.2, maxWidth:480 }}>
            {isMn
              ? `${stats.courses} course, ${stats.lessons} lesson дэх практик даалгавраар game механизмоор суралцаж, XP цуглуулж, fullstack developer болох замаа эхлүүл.`
              : `Learn through hands-on tasks across ${stats.courses} courses and ${stats.lessons} lessons with game mechanics. Collect XP and start your journey to become a fullstack developer.`}
          </div>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            <GhostBtn label={isMn ? '▶ ТОГЛООМ ЭХЛЭХ' : '▶ START GAME'} col="#00ff41" onClick={() => setModal('login')} />
            <GhostBtn label={isMn ? 'КУРСҮҮД ↓' : 'COURSES ↓'} col="#00e5ff" onClick={() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' })} />
          </div>

          <div style={{ display:'flex', borderTop:'1px solid #151d30', paddingTop:24, gap:0 }}>
            {([[String(stats.courses),'COURSES','#00e5ff'],[String(stats.lessons),'LESSONS','#00ff41'],[stats.tasks+'+ ','TASKS','#ffd700'],['∞','XP','#bf5af2']] as [string,string,string][]).map(([v,l,c])=>(
              <div key={l} style={{ padding:'0 24px 0 0', marginRight:24,
                borderRight:'1px solid #151d30', textAlign:'left' }}>
                <div style={{ fontFamily:'var(--fp)', fontSize:20, color:c,
                  textShadow:`0 0 12px ${c}66`, marginBottom:5 }}>{v}</div>
                <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#3a4560', letterSpacing:2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — LIVE RANKING */}
        <div className="lp-hero-right" style={{ borderLeft:'1px solid #151d30',
          flexDirection:'column', padding:'28px 24px', position:'relative',
          overflow:'hidden' }}>

          <div style={{ position:'absolute', top:-1, right:-1, width:10, height:10,
            borderTop:'2px solid rgba(0,229,255,.4)', borderRight:'2px solid rgba(0,229,255,.4)' }} />
          <div style={{ position:'absolute', bottom:-1, left:-1, width:10, height:10,
            borderBottom:'2px solid rgba(0,229,255,.4)', borderLeft:'2px solid rgba(0,229,255,.4)' }} />

          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20,
            paddingBottom:14, borderBottom:'1px solid #151d30' }}>
            {/* pulsing dot — flashes on refresh */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:8, height:8, background:'#00ff41', borderRadius:'50%', animation:'ping 1.5s infinite' }}/>
              {lbPulse && <div style={{ position:'absolute', inset:-3, borderRadius:'50%', border:'2px solid #00ff41', animation:'ping .6s ease-out forwards' }}/>}
            </div>
            <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#00e5ff', letterSpacing:2, flex:1 }}>
              LIVE RANKING
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:3 }}>
              <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#00ff41',
                border:'1px solid rgba(0,255,65,.3)', padding:'3px 8px', letterSpacing:2,
                boxShadow: lbPulse ? '0 0 10px rgba(0,255,65,.4)' : 'none', transition:'box-shadow .3s' }}>LIVE</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:3, color:'#1a3050', letterSpacing:1 }}>
                {isMn ? 'ШИНЭЧЛЭГДЛЭЭ' : 'UPDATED'} {Math.floor((tick * 0 + Date.now() - lbUpdatedAt) / 1000)}s {isMn ? 'өмнө' : 'ago'}
              </div>
            </div>
          </div>

          {/* Podium */}
          <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center',
            gap:12, marginBottom:20 }}>
            {[
              { p: top3[1], col:'#a0a8b8', h:80,  label:'2nd' },
              { p: top3[0], col:'#ffd700', h:110, label:'1st' },
              { p: top3[2], col:'#bf5af2', h:60,  label:'3rd' },
            ].map(({ p, col, h, label }) => (
              <div key={label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
                {label === '1st' && <div style={{ fontSize:14, marginBottom:2 }}>👑</div>}
                <div style={{ width: label==='1st'?44:40, height:label==='1st'?44:40,
                  border:`2px solid ${col}`, display:'flex', alignItems:'center',
                  justifyContent:'center', fontFamily:'var(--fp)',
                  fontSize:label==='1st'?9:8, color:col,
                  boxShadow:label==='1st'?`0 0 16px ${col}55`:undefined }}>
                  {p?.username?.slice(0,2).toUpperCase()}
                </div>
                <div style={{ fontFamily:'var(--fp)', fontSize:4, color:col }}>{p?.username?.slice(0,8)}</div>
                <div style={{ width:64, height:h, background:`${col}08`,
                  border:`1px solid ${col}`, display:'flex', alignItems:'center',
                  justifyContent:'center', fontFamily:'var(--fp)', fontSize:6, color:col }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex:1, display:'flex', flexDirection:'column', gap:0 }}>
            {rest.map(p=>(
              <div key={p.rank} style={{ display:'flex', alignItems:'center', gap:10,
                padding:'8px 0', borderTop:'1px solid #151d30',
                fontFamily:'var(--fp)', fontSize:5 }}>
                <span style={{ color:'#3a4560', minWidth:20 }}>#{p.rank}</span>
                <span style={{ color:'var(--text)', flex:1 }}>{p.username}</span>
                <span style={{ color:'#ffd700' }}>{p.xp?.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <button onClick={()=>setModal('login')}
            style={{ marginTop:14, width:'100%', padding:'10px 0',
              fontFamily:'var(--fp)', fontSize:6, letterSpacing:2,
              background:'transparent', color:'#00ff41',
              border:'1px solid rgba(0,255,65,.3)', cursor:'pointer', transition:'all .2s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(0,255,65,.08)'; e.currentTarget.style.borderColor='#00ff41' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(0,255,65,.3)' }}>
            JOIN NOW ▶
          </button>
        </div>
      </div>

      {/* ── STAT STRIP ── */}
      <div className="lp-stat-strip" style={{ borderBottom:'1px solid #151d30',
        background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)' }}>
        {([[String(stats.courses),'COURSES','#00e5ff'],[String(stats.lessons),'LESSONS','#00ff41'],[stats.tasks+'+ ','TASKS','#ffd700'],['∞','XP REWARD','#bf5af2']] as [string,string,string][]).map(([v,l,c],i)=>(
          <div key={l} style={{ padding:'20px 0', display:'flex', flexDirection:'column',
            alignItems:'center', gap:6,
            borderRight: i < 3 ? '1px solid #151d30' : 'none' }}>
            <div style={{ fontFamily:'var(--fp)', fontSize:22, color:c,
              textShadow:`0 0 16px ${c}55` }}>{v}</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#3a4560', letterSpacing:3 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <div id="features" className="lp-section" style={{ scrollMarginTop:56,
        background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)' }}>
        <div style={{ fontFamily:'var(--fp)', fontSize:14, letterSpacing:2, marginBottom:10 }}>{isMn ? 'ТОГЛООМЫН ОНЦЛОГ' : 'GAME FEATURES'}</div>
        <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#3a4560', letterSpacing:3, marginBottom:40 }}>
          {isMn ? 'МОНГОЛЫН АНХНЫ ТОГЛООМЖУУЛСАН IT СУРГАЛТЫН ПЛАТФОРМ' : "MONGOLIA'S FIRST GAMIFIED IT LEARNING PLATFORM"}
        </div>
        <div className="lp-grid-2">
          {FEATURES.map((f,i)=>(
            <div key={i} className="lp-card-hover"
              style={{ background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)',
                border:'1px solid #1a2540', padding:'28px', position:'relative', overflow:'hidden',
                transition:'border-color .2s, box-shadow .2s, transform .2s', cursor:'default' }}
              onMouseEnter={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.borderColor=f.col; d.style.boxShadow=`0 0 20px ${f.col}18` }}
              onMouseLeave={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.borderColor='#151d30'; d.style.boxShadow='none' }}>

              <div style={{ position:'absolute', top:-1, left:-1, width:8, height:8,
                borderTop:`2px solid ${f.col}55`, borderLeft:`2px solid ${f.col}55` }} />
              <div style={{ position:'absolute', bottom:-1, right:-1, width:8, height:8,
                borderBottom:`2px solid ${f.col}55`, borderRight:`2px solid ${f.col}55` }} />

              {f.badge2 && (
                <div style={{ position:'absolute', top:0, right:0,
                  background:'#ff2d55', fontFamily:'var(--fp)', fontSize:4,
                  color:'#fff', padding:'4px 12px', letterSpacing:2 }}>{f.badge2}</div>
              )}

              <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:16 }}>
                <div style={{ width:44, height:44, background:`${f.col}12`,
                  border:`1px solid ${f.col}44`, display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:20, flexShrink:0 }}>{f.icon}</div>
                <div style={{ display:'flex', flex:1, alignItems:'center', gap:10 }}>
                  <div style={{ fontFamily:'var(--fp)', fontSize:7, color:f.col, letterSpacing:1 }}>{f.title}</div>
                  {f.badge && (
                    <div style={{ fontFamily:'var(--fp)', fontSize:4, color:f.col,
                      border:`1px solid ${f.col}55`, padding:'2px 8px', letterSpacing:2 }}>{f.badge}</div>
                  )}
                </div>
              </div>

              <div style={{ fontFamily:'var(--fm)', fontSize:12, color:'#5a6a8a',
                lineHeight:2, marginBottom:16 }}>{f.desc}</div>

              {f.extra && (
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#3a4560', width:50 }}>{f.extra.label}</div>
                  <div style={{ height:4, flex:1, background:'#151d30', position:'relative' }}>
                    <div style={{ position:'absolute', inset:0, width:`${f.extra.pct}%`, background:f.extra.col }} />
                  </div>
                  <span style={{ fontFamily:'var(--fp)', fontSize:5, color:f.extra.col }}>{f.extra.pct}%</span>
                </div>
              )}
              {f.ranks && (
                <div style={{ display:'flex', gap:6 }}>
                  {(f.ranks as [string,string,string][]).map(([rank,name,col])=>(
                    <div key={rank} style={{ flex:1, background:'var(--bg3)',
                      border:`1px solid ${col}44`, padding:'8px 6px', textAlign:'center' }}>
                      <div style={{ fontFamily:'var(--fp)', fontSize:6, color:col, marginBottom:4 }}>{rank}</div>
                      <div style={{ fontFamily:'var(--fp)', fontSize:4, color:'#5a6a8a' }}>{name}</div>
                    </div>
                  ))}
                </div>
              )}
              {f.bars && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {(f.bars as [string,string,string][]).map(([l,p,col])=>(
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <span style={{ fontFamily:'var(--fp)', fontSize:4, color:'#3a4560', width:72, flexShrink:0 }}>{l}</span>
                      <div style={{ height:4, flex:1, background:'#151d30' }}>
                        <div style={{ height:'100%', width:`${p}%`, background:col }} />
                      </div>
                      <span style={{ fontFamily:'var(--fp)', fontSize:4, color:col, width:24, textAlign:'right' }}>{p}%</span>
                    </div>
                  ))}
                </div>
              )}
              {f.cta && (
                <button onClick={()=>setModal('login')}
                  style={{ fontFamily:'var(--fp)', fontSize:6, letterSpacing:2,
                    padding:'9px 20px', cursor:'pointer', background:'transparent',
                    color:'#ff2d55', border:'1px solid rgba(255,45,85,.35)', transition:'all .2s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,45,85,.1)'; e.currentTarget.style.borderColor='#ff2d55' }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(255,45,85,.35)' }}>
                  {f.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── COURSES ── */}
      <div id="courses" className="lp-section" style={{
        background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)',
        borderTop:'1px solid #151d30', scrollMarginTop:56 }}>
        <div style={{ fontFamily:'var(--fp)', fontSize:14, letterSpacing:2, marginBottom:10 }}>FULLSTACK ROADMAP</div>
        <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#3a4560', letterSpacing:3, marginBottom:40 }}>
          {isMn ? `${stats.courses} COURSE · HTML-ЭЭС DEPLOY ХҮРТЭЛ БҮРЭН ЗАМНАЛ` : `${stats.courses} COURSES · COMPLETE PATH FROM HTML TO DEPLOY`}
        </div>
        <div className="lp-grid-4">
          {COURSES.map(co=>(
            <div key={co.n} onClick={()=>setModal('login')}
              style={{ padding:'22px 18px', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)',
                border:'1px solid #1a2540', cursor:'pointer', position:'relative', overflow:'hidden',
                transition:'border-color .2s, box-shadow .2s' }}
              onMouseEnter={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.borderColor=co.c; d.style.boxShadow=`0 0 14px ${co.c}33` }}
              onMouseLeave={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.borderColor='#151d30'; d.style.boxShadow='none' }}>
              <div style={{ fontFamily:'var(--fp)', fontSize:40, color:`${co.c}10`,
                position:'absolute', top:4, right:10, lineHeight:1, userSelect:'none' }}>{co.n}</div>
              <div style={{ position:'absolute', top:-1, left:-1, width:8, height:8,
                borderTop:`2px solid ${co.c}33`, borderLeft:`2px solid ${co.c}33` }} />
              <div style={{ fontFamily:'var(--fp)', fontSize:4, color:co.c, letterSpacing:3, marginBottom:10 }}>COURSE {co.n}</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:9, color:'var(--text)', marginBottom:6, letterSpacing:1 }}>{co.t}</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#3a4560' }}>{co.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" className="lp-section" style={{
        background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)',
        borderTop:'1px solid #151d30', scrollMarginTop:56 }}>
        <div style={{ fontFamily:'var(--fp)', fontSize:14, letterSpacing:2, marginBottom:10 }}>{isMn ? 'ЭРЭМБЭ СОНГОХ' : 'CHOOSE YOUR PLAN'}</div>
        <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#3a4560', letterSpacing:3, marginBottom:40 }}>
          {isMn ? 'ХЭДИЙ ЧИНЭЭ ДЭЭШЭЭ — ТӨДИЙ ЧИНЭЭ ХУРДАН · SUBSCRIPTION ҮНЭ (MNT)' : 'THE HIGHER YOU GO — THE FASTER YOU GROW · SUBSCRIPTION PRICE (MNT)'}
        </div>
        <div className="lp-grid-3" style={{ marginBottom:28 }}>
          {PLANS.map(plan=>(
            <div key={plan.id} className="lp-card-hover"
              style={{ background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)',
                border:`1px solid ${plan.highlight ? `${plan.col}66` : '#1a2540'}`,
                padding:'28px 22px', position:'relative', overflow:'hidden',
                boxShadow:plan.highlight?`0 0 28px ${plan.col}14`:'none',
                transition:'transform .2s, box-shadow .2s', cursor:'default' }}
              onMouseEnter={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.boxShadow=`0 8px 28px ${plan.col}20` }}
              onMouseLeave={e=>{ const d=e.currentTarget as HTMLDivElement; d.style.boxShadow=plan.highlight?`0 0 28px ${plan.col}14`:'none' }}>

              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:plan.col }} />
              <div style={{ position:'absolute', bottom:-1, right:-1, width:8, height:8,
                borderBottom:`2px solid ${plan.col}44`, borderRight:`2px solid ${plan.col}44` }} />

              {plan.badge && (
                <div style={{ position:'absolute', top:10, right:0,
                  fontFamily:'var(--fp)', fontSize:4, color:'var(--bg)',
                  letterSpacing:1, background:plan.col, padding:'4px 12px' }}>{plan.badge}</div>
              )}
              <div style={{ display:'flex', alignItems:'center', gap:8,
                marginBottom:14, marginTop:plan.badge ? 22 : 4 }}>
                <span style={{ fontSize:18 }}>{plan.icon}</span>
                <span style={{ fontFamily:'var(--fp)', fontSize:10, color:plan.col, letterSpacing:2 }}>{plan.label}</span>
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:6, marginBottom:8 }}>
                <span style={{ fontFamily:'var(--fp)', fontSize:28, color:'var(--text)' }}>{plan.price}</span>
                <span style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a4560' }}>{plan.period}</span>
              </div>
              <div style={{ fontFamily:'var(--fm)', fontSize:12, color:'#5a6a8a',
                marginBottom:20, lineHeight:1.7 }}>{plan.desc}</div>
              <div style={{ borderTop:'1px solid #151d30', paddingTop:16, marginBottom:20 }}>
                {plan.features.map((f,i)=>(
                  <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:9 }}>
                    <span style={{ fontFamily:'var(--fp)', fontSize:8, color:f.ok?'#00ff41':'#3a4560', flexShrink:0 }}>{f.ok?'✓':'✗'}</span>
                    <span style={{ fontFamily:'var(--fm)', fontSize:12, color:f.ok?'#d0d8e8':'#5a6a8a' }}>{f.t}</span>
                  </div>
                ))}
              </div>
              <button onClick={()=>setModal('login')} style={{
                display:'block', width:'100%', padding:'12px 0',
                fontFamily:'var(--fp)', fontSize:8, letterSpacing:2,
                textAlign:'center', cursor:'pointer', boxSizing:'border-box',
                color: plan.highlight ? 'var(--bg)' : plan.col,
                background: plan.highlight ? plan.col : 'transparent',
                border:`1px solid ${plan.col}${plan.highlight?'':'55'}`,
                transition:'all .2s',
              }}
                onMouseEnter={e=>{ if(!plan.highlight){e.currentTarget.style.background=`${plan.col}18`;e.currentTarget.style.borderColor=plan.col}else{e.currentTarget.style.opacity='.85'} }}
                onMouseLeave={e=>{ if(!plan.highlight){e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor=`${plan.col}55`}else{e.currentTarget.style.opacity='1'} }}>
                {plan.btn}
              </button>
            </div>
          ))}
        </div>
        <div style={{ textAlign:'center' }}>
          <a href="/pricing" style={{ fontFamily:'var(--fp)', fontSize:6, color:'#3a4560',
            letterSpacing:2, textDecoration:'none', border:'1px solid #151d30',
            padding:'10px 24px', display:'inline-block', transition:'all .2s' }}
            onMouseEnter={e=>{ const a=e.currentTarget as HTMLAnchorElement; a.style.color='var(--text)'; a.style.borderColor='#3a4560' }}
            onMouseLeave={e=>{ const a=e.currentTarget as HTMLAnchorElement; a.style.color='#3a4560'; a.style.borderColor='#151d30' }}>
            {isMn ? 'ДЭЛГЭРЭНГҮЙ ХАРАХ →' : 'VIEW FULL DETAILS →'}
          </a>
        </div>
      </div>

      {/* ── CTA ── */}
      <div style={{ padding:'80px 56px', textAlign:'center',
        background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)',
        borderTop:'1px solid #151d30', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:'50%', left:'30%', width:400, height:400, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,255,65,.04),transparent)',
          transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
        <div style={{ position:'absolute', top:'50%', left:'70%', width:300, height:300, borderRadius:'50%',
          background:'radial-gradient(circle,rgba(0,229,255,.04),transparent)',
          transform:'translate(-50%,-50%)', pointerEvents:'none' }} />
        <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#ffd700', letterSpacing:4, marginBottom:20 }}>
          {isMn ? '▶ АДАЛ ЯВДАЛ ЭХЭЛНЭ' : '▶ YOUR ADVENTURE BEGINS'}
        </div>
        <div style={{ fontFamily:'var(--fp)', fontSize:'clamp(18px,3vw,32px)',
          lineHeight:1.5, marginBottom:16, letterSpacing:2 }}>
          {isMn ? <>КОДЫН УР ЧАДВАРАА<br/>LEVEL UP ХИИХ БОД НЭГД</> : <>LEVEL UP YOUR CODING<br/>SKILLS — JOIN NOW</>}
        </div>
        <div style={{ fontFamily:'var(--fm)', fontSize:13, color:'#5a6a8a', marginBottom:40 }}>
          {isMn ? 'Бүртгэлгүй нэвтэрч 2 курс үнэгүй эхлүүлнэ.' : 'Sign in and start 2 courses for free — no credit card required.'}
        </div>
        <div style={{ display:'flex', gap:14, justifyContent:'center' }}>
          <GhostBtn label={isMn ? '▶ НЭГДЭХ' : '▶ JOIN NOW'} col="#00ff41" onClick={() => setModal('login')} />
          <GhostBtn label="LOGIN" col="#00e5ff" onClick={() => setModal('login')} />
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ padding:'18px 48px', display:'flex', alignItems:'center',
        justifyContent:'space-between',
        background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)',
        borderTop:'1px solid #151d30' }}>
        <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a2a40', letterSpacing:2 }}>
          © 2026 ARENAHUB · ALL RIGHTS RESERVED
        </div>
        <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a2a40', letterSpacing:2 }}>
          IT СУРГАЛТ · GAME · FULLSTACK
        </div>
      </footer>

      {modal && <AuthModal onClose={()=>setModal(null)} />}
    </div>
  )
}