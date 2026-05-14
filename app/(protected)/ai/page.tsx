'use client'
import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import PixelIcon from '@/components/ui/PixelIcon'

const TokenEmptyPopup = dynamic(() => import('@/components/ui/TokenEmptyPopup'), { ssr: false })

interface Msg { role:'user'|'assistant'; content:string; type?:string; cost?:number }

const fp = { fontFamily:'var(--fp)' } as const
const fm = { fontFamily:'var(--fm)' } as const

const REQ_TYPES = [
  { key:'hint',    labelKey:'ai_hint'    as const, icon:'star'    as const, cost:1, descKey:'ai_hint_desc'    as const },
  { key:'debug',   labelKey:'ai_debug'   as const, icon:'sword'   as const, cost:2, descKey:'ai_debug_desc'   as const },
  { key:'explain', labelKey:'ai_explain' as const, icon:'lessons' as const, cost:3, descKey:'ai_explain_desc' as const },
]

const QUICK_PROMPTS = [
  { icon:'star'        as const, label:'Hint',      type:'hint',    text:'Энэ бодлогыг шийдэхэд алхам алхмаар чиглүүлж өгөөч. Шийдлийг шууд бичихгүй.\n\nБодлого: ' },
  { icon:'sword'       as const, label:'Алдаа',     type:'debug',   text:'Энэ кодын алдааг тайлбарлаж, яагаад гарсныг ойлгуулаач.\n\nКод: ' },
  { icon:'lessons'     as const, label:'Тайлбар',   type:'explain', text:'Энэ concept-г жишээтэй гүнзгий тайлбарлаач.\n\nConcept: ' },
  { icon:'leaderboard' as const, label:'Явц',       type:'hint',    text:'Миний явц, pass rate, сул талуудыг шинжилж урамшуулалтайгаар тайлбарлаач.' },
  { icon:'trophy'      as const, label:'Task санал',type:'hint',    text:'Одоогийн түвшиндээ тохирох 3 task санал болгоно уу.' },
  { icon:'ai'          as const, label:'Дараагийн', type:'hint',    text:'Одоо юу хийх хэрэгтэйг заагаач. Дараагийн алхам юу вэ?' },
]

const PACKAGES = [
  { id:'token_10',  tokens:10,  bonus:0,  price:3_500,  label:'BASIC',      col:'#4a8aff', popular:false },
  { id:'token_50',  tokens:50,  bonus:0,  price:15_000, label:'POPULAR',    col:'#00e5ff', popular:true  },
  { id:'token_200', tokens:200, bonus:20, price:45_000, label:'BEST VALUE', col:'#ffd700', popular:false },
]

const TOKEN_COST_MAP: Record<string, number> = { hint:1, debug:2, explain:3, general:1 }

function fmt(text: string) {
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, (_, _l, code) =>
      `<pre style="background:#030a12;border:1px solid #0d1a28;border-left:3px solid #00ff41;padding:12px 14px;margin:8px 0;overflow-x:auto;font-family:'Share Tech Mono',monospace;font-size:11px;line-height:1.7;color:#00ff41">${code.trim()}</pre>`)
    .replace(/`([^`]+)`/g, '<code style="background:#0a1525;border:1px solid #1a2840;padding:1px 6px;font-family:monospace;color:#00e5ff;font-size:11px">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#ffe600">$1</strong>')
    .replace(/^#{1,3} (.+)$/gm, '<div style="font-family:\'Press Start 2P\',monospace;font-size:8px;color:#00e5ff;margin:12px 0 5px;letter-spacing:1px">$1</div>')
    .replace(/\n/g, '<br/>')
}

const kf = `
@keyframes ai-dot  { 0%,100%{transform:translateY(0);opacity:.6} 50%{transform:translateY(-5px);opacity:1} }
@keyframes ai-glow { 0%,100%{opacity:.5} 50%{opacity:1} }
@keyframes ai-in   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes ai-scan { 0%{top:-80px} 100%{top:100%} }
`

function TokenBadge({ cost }: { cost:number }) {
  const col = cost === 1 ? '#00ff41' : cost === 2 ? '#ffd700' : '#00e5ff'
  return (
    <span style={{ ...fp, fontSize:5, color:col, border:`1px solid ${col}44`, padding:'2px 6px', background:`${col}10`, display:'inline-flex', alignItems:'center', gap:3 }}><PixelIcon name="coin" size={8} col={col}/>×{cost}</span>
  )
}

export default function AIPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [msgs,       setMsgs]       = useState<Msg[]>([])
  const [input,      setInput]      = useState('')
  const [sending,    setSending]    = useState(false)
  const [reqType,    setReqType]    = useState('hint')
  const [balance,    setBalance]    = useState<number|null>(null)
  const [balLoading, setBalLoading] = useState(true)
  const [showShop,   setShowShop]   = useState(false)
  const [tokenFlash, setTokenFlash] = useState<string|null>(null)
  const [tokenPopup, setTokenPopup] = useState<{ visible:boolean; balance:number; needed:number }>({ visible:false, balance:0, needed:0 })
  const [dailyFlash, setDailyFlash] = useState(false)
  const [nextGrant,  setNextGrant]  = useState<Date|null>(null)
  const bottomRef   = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (!loading && !isAuthenticated) router.push('/') }, [loading, isAuthenticated, router])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs])

  const loadBalance = useCallback(async () => {
    if (!isAuthenticated) return
    const token = localStorage.getItem('arenahub_token')
    const res = await fetch('/api/tokens', { headers:{ Authorization:`Bearer ${token}` } })
    if (res.ok) {
      const d = await res.json()
      setBalance(d.balance)
      if (d.dailyGranted) { setDailyFlash(true); setTimeout(() => setDailyFlash(false), 5000) }
      if (d.nextGrantAt) setNextGrant(new Date(d.nextGrantAt))
    }
    setBalLoading(false)
  }, [isAuthenticated])

  useEffect(() => { loadBalance() }, [loadBalance])

  const currentCost = useMemo(() => REQ_TYPES.find(r => r.key === reqType)?.cost ?? 1, [reqType])
  const hasTokens   = useMemo(() => balance !== null && balance >= currentCost, [balance, currentCost])
  const balCol      = useMemo(() => balance === null ? '#2a3a54' : balance < 5 ? '#ff2d55' : balance < 15 ? '#ffd700' : '#00ff41', [balance])

  const send = useCallback(async (text?: string, overrideType?: string) => {
    const msg  = (text ?? input).trim()
    const type = overrideType ?? reqType
    if (!msg || sending) return
    setInput('')
    const newMsgs: Msg[] = [...msgs, { role:'user', content:msg, type, cost: TOKEN_COST_MAP[type] ?? 1 }]
    setMsgs(newMsgs)
    setSending(true)
    setTokenFlash(null)
    try {
      const token = localStorage.getItem('arenahub_token')
      const res = await fetch('/api/ai', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ message:msg, requestType:type, history:newMsgs.slice(-8) }),
      })
      const d = await res.json()
      if (res.status === 402) {
        setMsgs(m => m.slice(0,-1))
        setInput(msg)
        setTokenFlash(d.error)
        setTokenPopup({ visible:true, balance:balance ?? 0, needed: TOKEN_COST_MAP[type] ?? 1 })
        setSending(false)
        return
      }
      setMsgs(m => [...m, { role:'assistant', content: d.reply || d.error || 'Алдаа гарлаа', cost: d.tokenUsed }])
      if (d.balance !== undefined) setBalance(d.balance)
    } catch {
      setMsgs(m => [...m, { role:'assistant', content:'Холболтын алдаа гарлаа.' }])
    }
    setSending(false)
  }, [input, reqType, sending, msgs, balance])

  const applyPrompt = useCallback((p: typeof QUICK_PROMPTS[0]) => {
    setInput(p.text); setReqType(p.type); textareaRef.current?.focus()
  }, [])

  const handleKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }, [send])

  const resize = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
  }, [])

  return (
    <>
      <style>{kf}</style>

      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', position:'relative' }}>

        {/* scan line */}
        <div style={{ position:'fixed', left:0, right:0, height:80, pointerEvents:'none', zIndex:0,
          background:'linear-gradient(180deg,transparent,rgba(255,230,0,.008),transparent)',
          animation:'ai-scan 8s linear infinite' }}/>

        {/* HUD TOP BAR */}
        <div style={{ display:'flex', alignItems:'stretch', borderBottom:'2px solid #0d1a28', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', flexShrink:0, position:'relative', zIndex:10, boxShadow:'0 2px 20px rgba(0,0,0,.6)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#ffe60044,transparent)' }}/>

          {/* left: AI label */}
          <div style={{ padding:'14px 24px', borderRight:'1px solid #0d1a28', flexShrink:0, display:'flex', alignItems:'center', gap:14 }}>
            <div style={{ width:40, height:40, background:'rgba(255,230,0,.08)', border:'1px solid rgba(255,230,0,.25)', display:'flex', alignItems:'center', justifyContent:'center', animation:'ai-glow 2.5s ease-in-out infinite' }}><PixelIcon name="robot" size={22} col="#ffe600"/></div>
            <div>
              <div style={{ ...fp, fontSize:10, color:'#ffe600', letterSpacing:2 }}>{t('ai_title')}</div>
              <div style={{ ...fp, fontSize:5, color:'#2a3a54', marginTop:3, letterSpacing:2 }}>GROQ · llama-3.3-70b-versatile · {user?.username?.toUpperCase()}</div>
            </div>
          </div>

          {/* center: quick actions */}
          <div style={{ flex:1, padding:'0 20px', display:'flex', alignItems:'center', gap:8 }}>
            {QUICK_PROMPTS.slice(0, 4).map(p => (
              <button key={p.label} onClick={() => applyPrompt(p)} style={{ ...fp, fontSize:6, letterSpacing:1, padding:'6px 12px', cursor:'pointer', whiteSpace:'nowrap', border:'1px solid #0d1a28', background:'transparent', color:'#2a3a54', transition:'all .15s', display:'flex', alignItems:'center', gap:5 }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ffe60033'; (e.currentTarget as HTMLButtonElement).style.color = '#ffe600' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d1a28'; (e.currentTarget as HTMLButtonElement).style.color = '#2a3a54' }}>
                <PixelIcon name={p.icon} size={12} col="#ffe600"/> {p.label}
              </button>
            ))}
          </div>

          {/* right: token balance + shop */}
          <div style={{ padding:'0 20px', borderLeft:'1px solid #0d1a28', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
            <PixelIcon name="coin" size={18} col="#ffd700"/>
            <div>
              <div style={{ ...fp, fontSize:5, color:'#1a3050', letterSpacing:3, marginBottom:2 }}>TOKEN</div>
              <div style={{ ...fp, fontSize:12, color:balCol }}>{balLoading ? '...' : balance ?? 0}</div>
            </div>
            <div style={{ width:1, height:30, background:'rgba(13,20,38,.65)', backdropFilter:'blur(20px)', margin:'0 4px' }}/>
            <button onClick={() => setShowShop(s => !s)} style={{ ...fp, fontSize:7, padding:'7px 14px', cursor:'pointer', background: showShop ? 'rgba(255,230,0,.12)' : 'transparent', color: showShop ? '#ffe600' : '#3a5070', border:`1px solid ${showShop ? 'rgba(255,230,0,.4)' : '#0d1a28'}`, letterSpacing:1, transition:'all .15s' }}>
              {showShop ? '✕ ХААХ' : '+ BUY'}
            </button>
            {msgs.length > 0 && (
              <button onClick={() => setMsgs([])} style={{ ...fp, fontSize:6, color:'#1a3050', border:'1px solid #0d1a28', background:'transparent', padding:'6px 10px', cursor:'pointer' }}>CLR</button>
            )}
          </div>
        </div>

        {/* DAILY TOKEN FLASH */}
        {dailyFlash && (
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 20px', background:'rgba(0,255,65,.05)', borderBottom:'1px solid rgba(0,255,65,.15)', flexShrink:0, animation:'ai-in .3s ease', zIndex:9 }}>
            <PixelIcon name="coin" size={16} col="#00ff41"/>
            <span style={{ ...fp, fontSize:7, color:'#00ff41', letterSpacing:1 }}>+5 ӨДРИЙН TOKEN ИРЛЭЭ!</span>
            <span style={{ ...fm, fontSize:11, color:'#2a5a3a' }}>Маргааш{nextGrant ? ` ${nextGrant.toLocaleTimeString('mn-MN', { hour:'2-digit', minute:'2-digit' })} цагт` : ''} дахин нэмэгдэнэ</span>
            <button onClick={() => setDailyFlash(false)} style={{ marginLeft:'auto', ...fp, fontSize:12, color:'#2a5a3a', background:'none', border:'none', cursor:'pointer' }}>×</button>
          </div>
        )}

        {/* TOKEN SHOP */}
        {showShop && (
          <div style={{ padding:'16px 20px', borderBottom:'1px solid #0d1a28', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', flexShrink:0, animation:'ai-in .2s ease', zIndex:9 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:3, height:16, background:'#ffe600', boxShadow:'0 0 6px #ffe600' }}/>
              <span style={{ ...fp, fontSize:6, color:'#ffe600', letterSpacing:2 }}>TOKEN SHOP</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
              {PACKAGES.map(pkg => (
                <a key={pkg.id} href={`/payment?item=${pkg.id}`} style={{ textDecoration:'none', display:'block' }}>
                  <div style={{ padding:'14px 16px', position:'relative', overflow:'hidden', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', border:`1px solid ${pkg.popular ? pkg.col+'66' : pkg.col+'22'}`, cursor:'pointer', transition:'border-color .2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = pkg.col + 'aa'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = pkg.popular ? pkg.col+'66' : pkg.col+'22'}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:pkg.col, opacity: pkg.popular ? 1 : 0.5 }}/>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                      <span style={{ ...fp, fontSize:5, color:pkg.col, letterSpacing:1 }}>{pkg.label}</span>
                      {pkg.popular && <span style={{ ...fp, fontSize:3, color:pkg.col, border:`1px solid ${pkg.col}44`, padding:'1px 5px' }}>✓ TOP</span>}
                    </div>
                    <div style={{ ...fp, fontSize:11, color:'#c0d0e0', marginBottom:5, display:'flex', alignItems:'center', gap:5 }}><PixelIcon name="coin" size={11} col="#ffd700"/> {pkg.tokens}{pkg.bonus > 0 ? ` +${pkg.bonus}` : ''}</div>
                    <div style={{ ...fp, fontSize:6, color:pkg.col }}>{pkg.price.toLocaleString()}₮</div>
                    <div style={{ ...fp, fontSize:4, color:'#2a3a54', marginTop:3 }}>₮{Math.round(pkg.price / (pkg.tokens + pkg.bonus))}/token</div>
                    {pkg.bonus > 0 && <div style={{ ...fp, fontSize:4, color:'#00ff41', marginTop:3 }}>✓ ₮{(3500 * ((pkg.tokens + pkg.bonus) / 10) - pkg.price).toLocaleString()} хэмнэлт</div>}
                  </div>
                </a>
              ))}
            </div>
            <div style={{ ...fm, fontSize:10, color:'#1a3050', marginTop:10 }}>Төлбөр хийсний дараа Admin 24ц дотор token нэмнэ · /payment дээр screenshot upload хийнэ</div>
          </div>
        )}

        {/* QUICK PROMPTS BAR */}
        <div style={{ padding:'8px 16px', borderBottom:'1px solid #060e1a', flexShrink:0, display:'flex', gap:5, flexWrap:'wrap', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', zIndex:9 }}>
          {QUICK_PROMPTS.map(p => (
            <button key={p.label} onClick={() => applyPrompt(p)} style={{ ...fp, fontSize:6, letterSpacing:1, padding:'6px 12px', cursor:'pointer', whiteSpace:'nowrap', border:'1px solid #0d1a28', background:'transparent', color:'#2a3a54', transition:'all .15s', display:'flex', alignItems:'center', gap:5 }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#ffe60033'; (e.currentTarget as HTMLButtonElement).style.color = '#ffe600' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d1a28'; (e.currentTarget as HTMLButtonElement).style.color = '#2a3a54' }}>
              <PixelIcon name={p.icon} size={12} col="#ffe600"/> {p.label} <TokenBadge cost={TOKEN_COST_MAP[p.type] ?? 1}/>
            </button>
          ))}
        </div>

        {/* MESSAGES */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16 }}>

          {msgs.length === 0 && (
            <div style={{ margin:'auto', textAlign:'center', maxWidth:540, animation:'ai-in .4s ease' }}>
              <div style={{ width:64, height:64, background:'rgba(255,230,0,.06)', border:'1px solid rgba(255,230,0,.2)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', animation:'ai-glow 2.5s ease-in-out infinite' }}><PixelIcon name="robot" size={36} col="#ffe600"/></div>
              <div style={{ ...fp, fontSize:11, color:'#ffe600', letterSpacing:2, marginBottom:10 }}>AI AGENT</div>
              <div style={{ ...fm, fontSize:13, color:'#2a4060', lineHeight:1.9, marginBottom:28 }}>
                Бодлогыг ойлгоход · алдааг тайлбарлахад · concept задлахад тусална.<br/>
                Шийдлийг өөрөө олоход чиглүүлнэ — шууд хариулт өгөхгүй.
              </div>
              <div style={{ display:'flex', justifyContent:'center', gap:10, marginBottom:28 }}>
                {REQ_TYPES.map(rt => {
                  const col = rt.cost === 1 ? '#00ff41' : rt.cost === 2 ? '#ffd700' : '#00e5ff'
                  return (
                    <div key={rt.key} style={{ padding:'14px 16px', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', border:`1px solid ${col}22`, flex:1, textAlign:'center' }}>
                      <div style={{ position:'relative', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${col}44,transparent)`, marginBottom:12 }}/>
                      <div style={{ marginBottom:8 }}><PixelIcon name={rt.icon} size={22} col={col}/></div>
                      <div style={{ ...fp, fontSize:7, color:col, marginBottom:4 }}>{t(rt.labelKey)}</div>
                      <div style={{ ...fp, fontSize:5, color:'#1a3050' }}>{t(rt.descKey)}</div>
                      <div style={{ ...fp, fontSize:6, color:col, marginTop:8, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}><PixelIcon name="coin" size={10} col={col}/> ×{rt.cost}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {QUICK_PROMPTS.slice(0,4).map(p => (
                  <button key={p.label} onClick={() => applyPrompt(p)} style={{ padding:'14px', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', border:'1px solid #0d1a28', cursor:'pointer', textAlign:'left', transition:'border-color .2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#ffe60033'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.borderColor = '#0d1a28'}>
                    <div style={{ marginBottom:6 }}><PixelIcon name={p.icon} size={20} col="#ffe600"/></div>
                    <div style={{ ...fp, fontSize:7, color:'#ffe600', marginBottom:4 }}>{p.label}</div>
                    <div style={{ ...fm, fontSize:11, color:'#2a3a54', lineHeight:1.5 }}>{p.text.split('\n')[0].slice(0,50)}...</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m, i) => (
            <div key={i} style={{ display:'flex', gap:12, flexDirection: m.role === 'user' ? 'row-reverse' : 'row', alignItems:'flex-start', animation:'ai-in .25s ease' }}>
              <div style={{ width:34, height:34, flexShrink:0, background: m.role === 'user' ? 'rgba(0,229,255,.08)' : 'rgba(255,230,0,.08)', border:`1px solid ${m.role === 'user' ? '#00e5ff22' : '#ffe60022'}`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <PixelIcon name={m.role === 'user' ? 'profile' : 'robot'} size={18} col={m.role === 'user' ? '#00e5ff' : '#ffe600'}/>
              </div>
              <div style={{ maxWidth:'75%' }}>
                {m.role === 'user' && m.type && (
                  <div style={{ display:'flex', justifyContent:'flex-end', gap:6, marginBottom:5 }}>
                    <span style={{ ...fp, fontSize:5, color:'#2a3a54', display:'inline-flex', alignItems:'center', gap:4 }}>
                      {REQ_TYPES.find(r => r.key === m.type) && <PixelIcon name={REQ_TYPES.find(r => r.key === m.type)!.icon} size={10} col="#2a3a54"/>}
                      {m.type?.toUpperCase()}
                    </span>
                    {m.cost && <TokenBadge cost={m.cost}/>}
                  </div>
                )}
                <div style={{ padding:'12px 16px', background:'rgba(8,12,22,.96)', border:`1px solid ${m.role === 'user' ? '#00e5ff10' : '#ffe60008'}`, borderLeft:`3px solid ${m.role === 'user' ? '#00e5ff22' : '#ffe60033'}`, ...fm, fontSize:13, color:'#b0c8e0', lineHeight:1.8 }}
                  dangerouslySetInnerHTML={{ __html: m.role === 'assistant' ? fmt(m.content) : m.content.replace(/\n/g,'<br/>') }}/>
                {m.role === 'assistant' && m.cost && (
                  <div style={{ ...fp, fontSize:5, color:'#1a2840', marginTop:4, textAlign:'right', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4 }}><PixelIcon name="coin" size={8} col="#1a2840"/> {m.cost} token ашиглагдлаа</div>
                )}
              </div>
            </div>
          ))}

          {sending && (
            <div style={{ display:'flex', gap:12, alignItems:'flex-start', animation:'ai-in .2s ease' }}>
              <div style={{ width:34, height:34, flexShrink:0, background:'rgba(255,230,0,.08)', border:'1px solid #ffe60022', display:'flex', alignItems:'center', justifyContent:'center' }}><PixelIcon name="robot" size={18} col="#ffe600"/></div>
              <div style={{ padding:'14px 18px', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', border:'1px solid #ffe60008', borderLeft:'3px solid #ffe60033' }}>
                <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width:6, height:6, background:'#ffe600', animation:`ai-dot .7s ease-in-out ${i * 0.18}s infinite` }}/>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef}/>
        </div>

        {/* INPUT AREA */}
        <div style={{ padding:'12px 16px', borderTop:'2px solid #0d1a28', flexShrink:0, background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', position:'relative', zIndex:10 }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#ffe60022,transparent)' }}/>

          {/* Token error */}
          {tokenFlash && (
            <div style={{ ...fp, fontSize:6, color:'#ff2d55', padding:'8px 14px', marginBottom:10, border:'1px solid rgba(255,45,85,.25)', background:'rgba(255,45,85,.05)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span>⚠ {tokenFlash}</span>
              <button onClick={() => setShowShop(true)} style={{ ...fp, fontSize:6, color:'#ffe600', background:'rgba(255,230,0,.08)', border:'1px solid rgba(255,230,0,.25)', padding:'5px 12px', cursor:'pointer', display:'inline-flex', alignItems:'center', gap:5 }}><PixelIcon name="coin" size={10} col="#ffe600"/> BUY TOKENS</button>
            </div>
          )}

          {/* Request type */}
          <div style={{ display:'flex', gap:6, marginBottom:10 }}>
            {REQ_TYPES.map(rt => {
              const active = reqType === rt.key
              const enough = balance === null || balance >= rt.cost
              const col = rt.cost === 1 ? '#00ff41' : rt.cost === 2 ? '#ffd700' : '#00e5ff'
              return (
                <button key={rt.key} onClick={() => setReqType(rt.key)} style={{ ...fp, fontSize:7, padding:'8px 16px', cursor:'pointer', background: active ? `${col}14` : 'transparent', color: active ? col : enough ? '#2a3a54' : '#1a2440', border:`1px solid ${active ? col+'55' : '#0d1a28'}`, display:'flex', alignItems:'center', gap:5, letterSpacing:1, transition:'all .15s' }}>
                  <PixelIcon name={rt.icon} size={14} col={active ? col : '#2a3a54'}/> {t(rt.labelKey)}
                  <span style={{ ...fp, fontSize:5, color: active ? col : '#1a2440', marginLeft:2 }}>×{rt.cost}</span>
                </button>
              )
            })}
            <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ ...fp, fontSize:5, color:'#1a3050' }}>ҮЛДЭГДЭЛ:</span>
              <span style={{ ...fp, fontSize:11, color:balCol, display:'inline-flex', alignItems:'center', gap:5 }}><PixelIcon name="coin" size={12} col={balCol}/> {balance ?? '...'}</span>
              {!hasTokens && balance !== null && (
                <button onClick={() => setShowShop(true)} style={{ ...fp, fontSize:6, color:'#ffe600', background:'rgba(255,230,0,.08)', border:'1px solid rgba(255,230,0,.25)', padding:'5px 10px', cursor:'pointer' }}>+ BUY</button>
              )}
            </div>
          </div>

          {/* Text box */}
          <div style={{ display:'flex', gap:8, alignItems:'flex-end', border:`1px solid ${!hasTokens ? '#ff2d5522' : '#0d1a28'}`, background:'rgba(2,6,9,.45)', backdropFilter:'blur(14px)', padding:'10px 14px', transition:'border-color .2s' }}
            onFocusCapture={e => { if (hasTokens) (e.currentTarget as HTMLDivElement).style.borderColor = '#ffe60033' }}
            onBlurCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = !hasTokens ? '#ff2d5522' : '#0d1a28'}>
            <textarea ref={textareaRef} value={input} onChange={resize} onKeyDown={handleKey}
              disabled={!hasTokens && balance !== null}
              placeholder={
                balance === null ? 'Token мэдээлэл ачаалж байна...' :
                !hasTokens       ? `Token хүрэлцэхгүй байна (шаардлагатай: ${currentCost})` :
                t('ai_placeholder')
              }
              rows={1}
              style={{ flex:1, background:'transparent', border:'none', outline:'none', color: !hasTokens && balance !== null ? '#1a2840' : '#b0c8e0', ...fm, fontSize:14, lineHeight:1.6, resize:'none', minHeight:24, maxHeight:180 }}/>
            <button onClick={() => send()} disabled={sending || !input.trim() || (!hasTokens && balance !== null)}
              style={{ flexShrink:0, width:40, height:40, background: sending || !input.trim() || (!hasTokens && balance !== null) ? 'transparent' : 'rgba(255,230,0,.1)', border:`1px solid ${sending || !input.trim() || (!hasTokens && balance !== null) ? '#0d1a28' : '#ffe600'}`, color: sending || !input.trim() || (!hasTokens && balance !== null) ? '#1a2840' : '#ffe600', cursor: sending || !input.trim() || (!hasTokens && balance !== null) ? 'not-allowed' : 'pointer', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>
              {sending ? '⏳' : '▶'}
            </button>
          </div>
          <div style={{ ...fp, fontSize:5, color:'#0d1a28', marginTop:5, letterSpacing:1 }}>
            Enter = {t('ai_send')} · Shift+Enter = MӨР · {t((REQ_TYPES.find(r => r.key === reqType)?.labelKey ?? 'ai_hint'))} = 🪙×{currentCost}
          </div>
        </div>
      </div>

      <TokenEmptyPopup
        visible={tokenPopup.visible}
        balance={tokenPopup.balance}
        needed={tokenPopup.needed}
        onClose={() => setTokenPopup(p => ({ ...p, visible:false }))}
      />
    </>
  )
}