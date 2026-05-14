'use client'
import { useEffect, useState, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { tasksApi, lessonsApi, type Task, type Lesson } from '@/lib/api-client'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.default),
  { ssr: false, loading: () => (
    <div style={{ height: '100%', background: '#1e1e1e', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--fm)', fontSize: 12, color: '#4a6a8a' }}>
      EDITOR LOADING...
    </div>
  )}
)

// ── Types ─────────────────────────────────────────────────────────────
type HtmlRule = {
  type: string; tag?: string; text?: string; attr?: string; value?: string
  id?: string; cls?: string; parent?: string; child?: string
  inputType?: string; hint: string
}
type CssRule = {
  type: string; selector?: string; property?: string; value?: string
  text?: string; hint: string
}
type JsRule = {
  type: string; keyword?: string; text?: string; count?: number
  pattern?: string; hint: string
}
type CheckResult   = { pass: boolean; hint: string }
type CssTaskMeta   = { mode: 'css';   baseHtml: string; checks: CssRule[] }
type JsTaskMeta    = { mode: 'js';    checks: JsRule[] }
type ReactTaskMeta = { mode: 'react'; checks: JsRule[] }
type NodeTaskMeta      = { mode: 'node';      checks: JsRule[] }
type FullstackTaskMeta = { mode: 'fullstack'; checks: JsRule[] }

// ── HTML checker ──────────────────────────────────────────────────────
function runHtmlChecks(code: string, rules: HtmlRule[]): CheckResult[] {
  if (typeof window === 'undefined') return rules.map(r => ({ pass: false, hint: r.hint }))
  const parser = new DOMParser()
  const doc = parser.parseFromString(code, 'text/html')
  const lc = code.toLowerCase()

  return rules.map((rule): CheckResult => {
    switch (rule.type) {
      case 'hasDoctype':    return { pass: lc.includes('<!doctype'), hint: rule.hint }
      case 'hasTag':        return { pass: doc.getElementsByTagName(rule.tag!).length > 0, hint: rule.hint }
      case 'tagText': {
        const el = doc.getElementsByTagName(rule.tag!)[0]
        return { pass: !!el && el.textContent?.trim() === rule.text, hint: rule.hint }
      }
      case 'tagContains': {
        const el = doc.getElementsByTagName(rule.tag!)[0]
        return { pass: !!el && (el.textContent || '').toLowerCase().includes((rule.text || '').toLowerCase()), hint: rule.hint }
      }
      case 'hasAttr': {
        const el = doc.getElementsByTagName(rule.tag!)[0]
        return { pass: !!el && el.hasAttribute(rule.attr!), hint: rule.hint }
      }
      case 'hasAttrValue': {
        const el = doc.getElementsByTagName(rule.tag!)[0]
        return { pass: !!el && el.getAttribute(rule.attr!) === rule.value, hint: rule.hint }
      }
      case 'hasId':    return { pass: doc.getElementById(rule.id!) !== null, hint: rule.hint }
      case 'hasClass': return { pass: doc.getElementsByClassName(rule.cls!).length > 0, hint: rule.hint }
      case 'hasChild': {
        const parent = doc.getElementsByTagName(rule.parent!)[0]
        return { pass: !!parent && parent.getElementsByTagName(rule.child!).length > 0, hint: rule.hint }
      }
      case 'hasInput': {
        const inputs = Array.from(doc.getElementsByTagName('input'))
        return { pass: inputs.some(i => i.getAttribute('type') === rule.inputType), hint: rule.hint }
      }
      default: return { pass: false, hint: rule.hint }
    }
  })
}

// ── CSS checker ───────────────────────────────────────────────────────
function runCssChecks(css: string, rules: CssRule[]): CheckResult[] {
  return rules.map((rule): CheckResult => {
    switch (rule.type) {
      case 'hasSelector': {
        const esc = rule.selector!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return { pass: new RegExp(esc + '\\s*[{,]').test(css), hint: rule.hint }
      }
      case 'hasProperty': {
        const p = rule.property!
        return { pass: css.includes(p + ':') || css.includes(p + ' :'), hint: rule.hint }
      }
      case 'hasPropValue': {
        const p = rule.property!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const v = rule.value!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return { pass: new RegExp(p + '\\s*:\\s*' + v).test(css), hint: rule.hint }
      }
      case 'selectorHasProp': {
        const esc = rule.selector!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        const match = new RegExp(esc + '[^{]*\\{([^}]*)\\}', 's').exec(css)
        if (!match) return { pass: false, hint: rule.hint }
        const block = match[1]
        const p = rule.property!
        return { pass: block.includes(p + ':') || block.includes(p + ' :'), hint: rule.hint }
      }
      case 'hasKeyframes': return { pass: css.includes('@keyframes'), hint: rule.hint }
      case 'hasAnimation': return { pass: css.includes('animation'), hint: rule.hint }
      case 'hasText':      return { pass: css.includes(rule.text!), hint: rule.hint }
      default:             return { pass: false, hint: rule.hint }
    }
  })
}

// ── JS / React checker (shared) ───────────────────────────────────────
function runJsChecks(code: string, rules: JsRule[]): CheckResult[] {
  return rules.map((rule): CheckResult => {
    switch (rule.type) {
      case 'hasKeyword': {
        const k = rule.keyword!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return { pass: new RegExp('\\b' + k + '\\b').test(code), hint: rule.hint }
      }
      case 'hasText':    return { pass: code.includes(rule.text!), hint: rule.hint }
      case 'hasPattern': return { pass: new RegExp(rule.pattern!, 's').test(code), hint: rule.hint }
      case 'hasCount': {
        const t = rule.text!
        let cnt = 0, pos = 0
        while ((pos = code.indexOf(t, pos)) !== -1) { cnt++; pos++ }
        return { pass: cnt >= (rule.count ?? 2), hint: rule.hint }
      }
      default: return { pass: false, hint: rule.hint }
    }
  })
}

// ── Constants ─────────────────────────────────────────────────────────
const DEFAULT_HTML = `<!DOCTYPE html>
<html>
  <head>
    <title></title>
  </head>
  <body>

  </body>
</html>`

const DEFAULT_CSS   = `/* Style нэмнэ үү */\n`
const DEFAULT_JS    = `// JavaScript code бичнэ үү\n`
const DEFAULT_REACT = `function App() {
  const BUILDINGS = [
    { x:4,  w:8,  h:52, col:'#00e5ff', label:'DATA' },
    { x:14, w:11, h:70, col:'#bf5af2', label:'AI' },
    { x:27, w:7,  h:40, col:'#00ff41', label:'DRONE' },
    { x:36, w:10, h:58, col:'#ffd700', label:'ENERGY' },
    { x:48, w:8,  h:44, col:'#00e5ff', label:'DEF' },
    { x:58, w:13, h:75, col:'#ff6b35', label:'NEXUS' },
    { x:73, w:9,  h:50, col:'#bf5af2', label:'MKT' },
    { x:84, w:10, h:62, col:'#00e5ff', label:'HUB' },
  ]
  const [tick,    setTick]    = useState(0)
  const [radar,   setRadar]   = useState(0)
  const [energy,  setEnergy]  = useState(78)
  const [xp,      setXp]      = useState(340)
  const [level,   setLevel]   = useState(3)
  const [credits, setCredits] = useState(12400)
  const [drones,  setDrones]  = useState(() =>
    Array.from({ length:5 }, (_, i) => ({
      id:i, x:10+i*18, y:25+i*8,
      dx:(i%2===0?1:-1)*0.8, dy:(i%3===0?1:-1)*0.5,
      col:['#00e5ff','#bf5af2','#00ff41','#ffd700','#ff6b35'][i],
    }))
  )
  const [enemies,  setEnemies]  = useState([])
  const [flash,    setFlash]    = useState(false)
  const [weather,  setWeather]  = useState('clear')
  const [alerts,   setAlerts]   = useState(['▶ SYSTEM ONLINE','▶ AI CORE ACTIVE','▶ DRONE PATROL ON'])

  useEffect(() => {
    const id = setInterval(() => {
      setTick(t => t + 1)
      setRadar(r => (r + 3) % 360)
      setEnergy(e => Math.max(20, Math.min(100, e + (Math.random()*2 - 1) * 0.4)))
      setCredits(c => c + Math.floor(Math.random()*12)+3)
      setDrones(ds => ds.map(d => {
        let nx = d.x + d.dx, ny = d.y + d.dy
        let ndx = d.dx, ndy = d.dy
        if (nx < 3 || nx > 92) ndx = -d.dx
        if (ny < 8 || ny > 72) ndy = -d.dy
        return { ...d, x:Math.max(3,Math.min(92,nx)), y:Math.max(8,Math.min(72,ny)), dx:ndx, dy:ndy }
      }))
      if (Math.random() < 0.1) {
        setXp(x => {
          const nx = x + Math.floor(Math.random()*4) + 1
          if (nx >= level * 500) { setLevel(l => l+1); return 0 }
          return nx
        })
      }
    }, 80)
    return () => clearInterval(id)
  }, [level])

  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() < 0.55) {
        const names = ['MALWARE','VIRUS.EXE','SH4DOW','GL1TCH','D4EMON']
        const side  = Math.random() < 0.5
        const e = { id:Date.now(), name:names[Math.floor(Math.random()*names.length)], x:side?-4:104, y:48+Math.random()*28 }
        setEnemies(es => [...es.slice(-3), e])
        setAlerts(a => ['⚠ '+e.name+' INCOMING', ...a.slice(0,3)])
      }
    }, 4000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setEnemies(es => es.map(e => ({ ...e, x: e.x < 50 ? e.x+0.25 : e.x-0.25 })).filter(e => {
        if (Math.abs(e.x-50) < 12) {
          setFlash(true); setTimeout(()=>setFlash(false),250)
          setAlerts(a => ['✓ '+e.name+' DESTROYED', ...a.slice(0,3)])
          setXp(x => x+30)
          return false
        }
        return true
      }))
    }, 200)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setWeather(['clear','clear','clear','rain','storm'][Math.floor(Math.random()*5)])
    }, 12000)
    return () => clearInterval(id)
  }, [])

  const eCol = energy>60?'#00ff41':energy>30?'#ffd700':'#ff2d55'
  const xpPct = Math.min(100,(xp/(level*500))*100)
  const fp = { fontFamily:"'Press Start 2P', monospace" }

  return (
    <div style={{ ...fp, background:'#020406', color:'#8ab0cc', display:'flex', flexDirection:'column', height:'100%', minHeight:280, overflow:'hidden', fontSize:7, position:'relative' }}>
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:20,
        backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,229,255,.012) 2px,rgba(0,229,255,.012) 4px)' }}/>
      {flash && <div style={{ position:'absolute', inset:0, background:'rgba(0,229,255,.07)', zIndex:18, pointerEvents:'none' }}/>}

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'5px 10px',
        background:'rgba(8,12,22,.97)', borderBottom:'1px solid #0d2040', flexShrink:0, zIndex:5 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ color:'#bf5af2' }}>◆</span>
          <span style={{ color:'#00e5ff', letterSpacing:3, fontSize:8 }}>PIXEL CYBER CITY</span>
          <span style={{ color:'#1a3050', fontSize:5 }}>SECTOR-7</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ background:'rgba(191,90,242,.15)', border:'1px solid #bf5af244', padding:'2px 8px', color:'#bf5af2', fontSize:5 }}>LVL {level}</span>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <span style={{ color:'#1a3050', fontSize:5 }}>PWR</span>
            <div style={{ width:55, height:5, background:'#0a1020', border:'1px solid #0d2040' }}>
              <div style={{ width:energy+'%', height:'100%', background:'linear-gradient(90deg,'+eCol+','+eCol+'88)', boxShadow:'0 0 5px '+eCol, transition:'width .6s' }}/>
            </div>
            <span style={{ color:eCol, fontSize:6 }}>{Math.round(energy)}%</span>
          </div>
          <span style={{ fontSize:9 }}>{weather==='storm'?'⚡':weather==='rain'?'💧':'✦'}</span>
        </div>
      </div>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>
        <div style={{ flex:'0 0 56%', position:'relative', overflow:'hidden', borderRight:'1px solid #0d2040',
          background:'linear-gradient(180deg,#010204 35%,#030810 100%)' }}>

          {Array.from({length:18},(_,i)=>(
            <div key={i} style={{ position:'absolute', width:1, height:1, borderRadius:'50%', background:'#fff',
              opacity:Math.abs(Math.sin(tick*0.04+i))*0.4+0.15,
              left:((i*43+17)%92)+'%', top:((i*29+5)%40)+'%' }}/>
          ))}
          {weather!=='clear' && Array.from({length:14},(_,i)=>(
            <div key={i} style={{ position:'absolute', width:1, height:7, background:'rgba(0,229,255,.25)',
              left:((i*7+tick*3)%100)+'%', top:((tick*4+i*22)%100)+'%', transform:'skewX(-20deg)' }}/>
          ))}

          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:20,
            background:'linear-gradient(0deg,#030c1a,transparent)', borderTop:'1px solid #0d2040' }}>
            <div style={{ position:'absolute', bottom:5, left:0, right:0, height:1,
              background:'linear-gradient(90deg,transparent,rgba(0,229,255,.3),rgba(191,90,242,.2),transparent)' }}/>
          </div>

          {BUILDINGS.map((b,bi)=>{
            const pulse = Math.sin(tick*0.06+bi)*0.35+0.65
            const on = energy > 25
            return (
              <div key={bi} style={{ position:'absolute', bottom:20, left:b.x+'%', width:b.w+'%', height:b.h,
                background:'linear-gradient(0deg,'+b.col+'28,'+b.col+'08)',
                border:'1px solid '+b.col+(on?'55':'18'),
                boxShadow:on?'0 0 '+Math.round(pulse*10)+'px '+b.col+'44,inset 0 0 8px '+b.col+'08':'none',
                transition:'box-shadow .3s' }}>
                {Array.from({length:3},(_,r)=>Array.from({length:2},(_,c)=>(
                  <div key={r+'-'+c} style={{ position:'absolute',
                    left:(12+c*48)+'%', top:(12+r*28)+'%', width:'16%', height:'12%',
                    background:on && Math.sin(tick*0.09+bi+r+c)>0.1 ? b.col+'bb' : '#080c18',
                    transition:'background .4s' }}/>
                )))}
                <div style={{ position:'absolute', top:-7, left:'50%', transform:'translateX(-50%)', width:1, height:7, background:b.col, opacity:.6 }}/>
                <div style={{ position:'absolute', top:-10, left:'50%', transform:'translateX(-50%)', width:4, height:4, borderRadius:'50%',
                  background:b.col, boxShadow:'0 0 5px '+b.col, opacity:Math.sin(tick*0.18+bi)>0?1:0.05, transition:'opacity .1s' }}/>
                <div style={{ position:'absolute', bottom:2, left:0, right:0, textAlign:'center', fontSize:4, color:b.col+'66', letterSpacing:1 }}>{b.label}</div>
              </div>
            )
          })}

          {drones.map(d=>(
            <div key={d.id} style={{ position:'absolute', left:d.x+'%', top:d.y+'%',
              width:7, height:4, background:d.col, boxShadow:'0 0 7px '+d.col,
              transform:'translateX(-50%) translateY(-50%)', transition:'left .08s linear,top .08s linear' }}>
              <div style={{ position:'absolute', top:'50%', left:'-4px', width:3, height:1, background:d.col+'88', transform:'translateY(-50%)' }}/>
              <div style={{ position:'absolute', top:'50%', right:'-4px', width:3, height:1, background:d.col+'88', transform:'translateY(-50%)' }}/>
              <div style={{ position:'absolute', bottom:'-4px', left:'50%', transform:'translateX(-50%)', width:4, height:3,
                background:d.col+'55', opacity:Math.abs(Math.sin(tick*0.35+d.id))*0.7+0.3 }}/>
            </div>
          ))}

          {enemies.map(e=>(
            <div key={e.id} style={{ position:'absolute', left:e.x+'%', top:e.y+'%',
              width:9, height:9, background:'#ff2d5514', border:'1px solid #ff2d55',
              boxShadow:'0 0 10px #ff2d5555', transform:'translateX(-50%) translateY(-50%)',
              transition:'left .2s linear' }}>
              <div style={{ position:'absolute', inset:2, background:'#ff2d5533' }}/>
              <div style={{ position:'absolute', top:-9, left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', fontSize:4, color:'#ff2d55' }}>{e.name}</div>
            </div>
          ))}

          <div style={{ position:'absolute', bottom:22, left:0, right:0, textAlign:'center', fontSize:4, color:'#0d2040', letterSpacing:2 }}>
            POP {(847291+tick*3).toLocaleString()} · ONLINE
          </div>
        </div>

        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div style={{ flex:'0 0 55%', borderBottom:'1px solid #0d2040', display:'flex' }}>
            <div style={{ flex:'0 0 42%', display:'flex', alignItems:'center', justifyContent:'center', borderRight:'1px solid #0d2040', padding:5 }}>
              <div style={{ position:'relative', width:55, height:55 }}>
                {[1,.66,.33].map((r,i)=>(
                  <div key={i} style={{ position:'absolute', inset:((1-r)*27.5)+'px', border:'1px solid rgba(0,229,255,.18)', borderRadius:'50%' }}/>
                ))}
                <div style={{ position:'absolute', top:'50%', left:0, right:0, height:1, background:'rgba(0,229,255,.1)', transform:'translateY(-50%)' }}/>
                <div style={{ position:'absolute', left:'50%', top:0, bottom:0, width:1, background:'rgba(0,229,255,.1)', transform:'translateX(-50%)' }}/>
                <div style={{ position:'absolute', inset:0, borderRadius:'50%', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:'50%', left:'50%', width:'50%', height:1,
                    background:'linear-gradient(90deg,transparent,rgba(0,255,65,.7))', transformOrigin:'0 50%',
                    transform:'rotate('+radar+'deg)' }}/>
                </div>
                {enemies.map(e=>(
                  <div key={e.id} style={{ position:'absolute', width:3, height:3, borderRadius:'50%', background:'#ff2d55',
                    boxShadow:'0 0 5px #ff2d55', left:(e.x/2)+'%', top:(e.y*0.7)+'%', transform:'translate(-50%,-50%)',
                    opacity:Math.abs(Math.sin(tick*0.2))>0.3?1:0.3 }}/>
                ))}
                <div style={{ position:'absolute', top:'50%', left:'50%', width:5, height:5, borderRadius:'50%',
                  background:'#00ff41', boxShadow:'0 0 8px #00ff41', transform:'translate(-50%,-50%)' }}/>
                <div style={{ position:'absolute', bottom:1, left:0, right:0, textAlign:'center', fontSize:4, color:'#00e5ff33', letterSpacing:1 }}>RADAR</div>
              </div>
            </div>
            <div style={{ flex:1, padding:'7px 8px', display:'flex', flexDirection:'column', gap:5 }}>
              <div style={{ fontSize:5, color:'#00e5ff', letterSpacing:2, marginBottom:1 }}>SYS STATUS</div>
              {[
                { k:'DRONES',  v:drones.length+' ACTIVE', c:'#00e5ff' },
                { k:'THREATS', v:enemies.length>0?enemies.length+' ⚠':'CLEAR', c:enemies.length>0?'#ff2d55':'#00ff41' },
                { k:'DEFENSE', v:flash?'FIRING':'STANDBY', c:flash?'#ff6b35':'#00ff41' },
                { k:'WEATHER', v:weather.toUpperCase(), c:'#bf5af2' },
              ].map(row=>(
                <div key={row.k} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'#1a3050', fontSize:5 }}>{row.k}</span>
                  <span style={{ color:row.c, fontSize:5 }}>{row.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex:1, padding:'6px 8px', display:'flex', flexDirection:'column', gap:4, overflow:'hidden' }}>
            <div style={{ fontSize:5, color:'#ffd700', letterSpacing:2 }}>XP → LVL {level+1}</div>
            <div style={{ height:4, background:'#0a1020', border:'1px solid #0d2040', overflow:'hidden' }}>
              <div style={{ width:xpPct+'%', height:'100%', background:'linear-gradient(90deg,#ffd700,#ff6b35)',
                boxShadow:'0 0 6px #ffd70055', transition:'width .5s' }}/>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:3, flex:1 }}>
              {[
                { k:'CREDITS', v:'₱'+credits.toLocaleString(), c:'#ffd700' },
                { k:'AI CORES', v:level*2+3, c:'#00e5ff' },
                { k:'BLDGS',   v:BUILDINGS.length, c:'#bf5af2' },
                { k:'POWER',   v:Math.round(energy)+'%', c:eCol },
              ].map(item=>(
                <div key={item.k} style={{ background:'rgba(0,0,0,.4)', border:'1px solid #0d2040', padding:'3px 5px' }}>
                  <div style={{ fontSize:4, color:'#0d2040', marginBottom:2 }}>{item.k}</div>
                  <div style={{ fontSize:6, color:item.c }}>{item.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding:'4px 10px', background:'rgba(8,12,22,.97)', borderTop:'1px solid #0d2040', flexShrink:0, display:'flex', gap:14, overflow:'hidden' }}>
        {alerts.slice(0,3).map((a,i)=>(
          <span key={i} style={{ fontSize:5, whiteSpace:'nowrap',
            color:a.includes('⚠')?'#ff2d55':a.includes('✓')?'#00ff41':'#00e5ff',
            opacity:1-i*0.28 }}>{a}</span>
        ))}
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)`

const DEFAULT_FULLSTACK = `const express = require('express')
require('dotenv').config()
const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' })
})

app.listen(PORT, () => {
  console.log(\`Server running on port \${PORT}\`)
})
`

const DEFAULT_NODE = `const express = require('express')
const app = express()
const PORT = 3000

app.use(express.json())

// Routes here...
app.get('/', (req, res) => {
  res.json({ message: 'server running' })
})

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT)
})
`

// ── JS sandbox executor ───────────────────────────────────────────────
function executeJs(code: string): Promise<string[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') { resolve([]); return }
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px'
    iframe.setAttribute('sandbox', 'allow-scripts')
    document.body.appendChild(iframe)
    let settled = false
    const cleanup = () => {
      if (settled) return; settled = true
      window.removeEventListener('message', handler)
      try { document.body.removeChild(iframe) } catch {}
    }
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'ahub-js-logs') {
        const logs = e.data.logs as string[]
        cleanup(); resolve(logs)
      }
    }
    window.addEventListener('message', handler)
    const safe = JSON.stringify(code).replace(/<\//g, '<\\/')
    iframe.srcdoc = `<!DOCTYPE html><html><body><script>
      var L=[];var oc=console.log;
      console.log=function(){L.push([].slice.call(arguments).map(function(x){return typeof x==='object'?JSON.stringify(x):String(x);}).join(' '));};
      console.error=function(){L.push('ERR: '+[].slice.call(arguments).join(' '));};
      try{eval(${safe});}catch(e){L.push('ERROR: '+e.message);}
      window.parent.postMessage({type:'ahub-js-logs',logs:L},'*');
    <\/script></body></html>`
    setTimeout(() => { cleanup(); resolve(['(execution timeout)']) }, 5000)
  })
}

// ── Fullstack CI/CD simulator ─────────────────────────────────────────
async function simulateFullstack(code: string): Promise<string[]> {
  await new Promise(r => setTimeout(r, 700))
  const out: string[] = []
  const has = (t: string) => code.includes(t)

  if (has('require(') || has('express') || has('dotenv') || has('"dependencies"') || has('npm install') || has('npm run')) {
    out.push('$ npm install')
    if (has('express'))              out.push('  + express')
    if (has('dotenv') || has('process.env')) out.push('  + dotenv')
    if (has('socket') || has('socket.io'))   out.push('  + socket.io')
    out.push('✓ Dependencies installed')
    out.push('')
  }

  if (has('build') || has('"build"') || has('npm run build') || has('webpack') || has('vite')) {
    out.push('$ npm run build')
    out.push('  Compiling assets...')
    out.push('  Bundling modules...')
    out.push('✓ Build completed (1.2s)')
    out.push('')
  }

  if (has('process.env') || has('PORT=') || has('API_URL') || has('NODE_ENV') || has('.env')) {
    out.push('$ Loading environment')
    if (has('PORT') || has('process.env.PORT'))  out.push('  ✓ PORT = 3000')
    if (has('API_URL'))                           out.push('  ✓ API_URL loaded')
    if (has('NODE_ENV'))                          out.push('  ✓ NODE_ENV = production')
    out.push('')
  }

  if (has('git init') || has('git add') || has('git commit') || has('git push') || has('git remote')) {
    out.push('$ git')
    if (has('git init'))   out.push('  ✓ Repository initialized')
    if (has('git add'))    out.push('  ✓ Files staged')
    if (has('git commit')) out.push('  ✓ Commit created')
    if (has('git push'))   out.push('  ✓ Pushed to remote')
    out.push('')
  }

  if (has('deploy') || has('render') || has('vercel') || has('heroku') || has('render.yaml')) {
    out.push('$ Deploying to cloud...')
    out.push('  → Uploading...')
    out.push('✓ Deployed: https://your-app.onrender.com')
    out.push('')
  }

  if (has('app.listen') || has('listen(')) {
    out.push('$ Server started')
    out.push('✓ http://localhost:3000')
    out.push('')
  }

  if (has('/api/health') || has('health')) {
    out.push('$ API health check')
    out.push('✓ GET /api/health → 200 OK')
    out.push('')
  }

  if (has('socket') || has('WebSocket') || has('io(') || has('socket.emit') || has('socket.on')) {
    out.push('$ WebSocket server')
    out.push('✓ Socket.io ready')
    out.push('  Connected players: 0')
    out.push('')
  }

  if (has('setInterval') && (has('score') || has('enemy') || has('hp'))) {
    out.push('$ Auto game loop')
    out.push('✓ Server-side simulation running')
    out.push('')
  }

  if (out.length === 0) {
    out.push('(no simulation output)')
    out.push('Hint: код бичиж RUN дарна уу')
  }

  return out
}

// ── Node.js sandbox executor (mock Express) ───────────────────────────
function executeNode(code: string): Promise<string[]> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') { resolve([]); return }
    const iframe = document.createElement('iframe')
    iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px'
    iframe.setAttribute('sandbox', 'allow-scripts')
    document.body.appendChild(iframe)
    let settled = false
    const cleanup = () => {
      if (settled) return; settled = true
      window.removeEventListener('message', handler)
      try { document.body.removeChild(iframe) } catch {}
    }
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'ahub-node-logs') {
        const logs = e.data.logs as string[]
        cleanup(); resolve(logs)
      }
    }
    window.addEventListener('message', handler)
    const safe = JSON.stringify(code).replace(/<\//g, '<\\/')
    iframe.srcdoc = `<!DOCTYPE html><html><body><script>
var _routes=[],_port=null,_resp={},_clogs=[];
var process={env:{PORT:3000,NODE_ENV:'development'}};
var module={exports:{}};
function require(mod){
  if(mod==='express'){
    function express(){
      var a={};
      a.use=function(){return a;};
      function mkR(m){return function(p,fn){
        _routes.push({m:m,p:p});
        if(m==='GET'&&typeof fn==='function'){
          var rq={params:{},body:{},query:{},headers:{}};
          var cap=null;
          var rs={json:function(d){cap=d;},send:function(d){cap=d;},
            status:function(){return{json:function(d){cap=d;},send:function(d){cap=d;}};}};
          try{fn(rq,rs,function(){});}catch(e){}
          if(cap!==null)_resp[p]=typeof cap==='object'?JSON.stringify(cap):String(cap);
        }
        return a;
      };}
      a.get=mkR('GET');a.post=mkR('POST');a.put=mkR('PUT');
      a.delete=mkR('DELETE');a.patch=mkR('PATCH');
      a.listen=function(port,cb){_port=port;if(typeof cb==='function')cb();return{close:function(){}};};
      return a;
    }
    express.json=function(){return function(){};};
    express.urlencoded=function(){return function(){};};
    express.static=function(){return function(){};};
    return express;
  }
  return {};
}
console.log=function(){_clogs.push([].slice.call(arguments).map(function(x){return typeof x==='object'?JSON.stringify(x):String(x);}).join(' '));};
console.error=function(){_clogs.push('ERR: '+[].slice.call(arguments).join(' '));};
try{eval(${safe});}catch(e){_clogs.push('ERROR: '+e.message);}
var out=[];
if(_port)out.push('✓ Server started → port '+_port);
if(_routes.length){out.push('');out.push('Routes:');_routes.forEach(function(r){var s=_resp[r.p]?'  → '+_resp[r.p]:'';out.push('  ['+r.m+'] '+r.p+s);});}
if(_clogs.length){out.push('');out.push('Console:');_clogs.forEach(function(l){out.push('  '+l);});}
if(!out.length)out.push('(no output — app.listen() хэрэгтэй)');
window.parent.postMessage({type:'ahub-node-logs',logs:out},'*');
<\/script></body></html>`
    setTimeout(() => { cleanup(); resolve(['(execution timeout)']) }, 5000)
  })
}

// ── Helper components ─────────────────────────────────────────────────
function XpFlash({ xp }: { xp: number }) {
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(0,255,65,.08)', border: '2px solid #00ff41',
      padding: '18px 40px', fontFamily: 'var(--fp)', fontSize: 18,
      color: '#00ff41', zIndex: 200, letterSpacing: 3,
      textShadow: '0 0 24px #00ff41', pointerEvents: 'none',
    }}>
      +{xp} XP!
    </div>
  )
}

// ── Inner component ───────────────────────────────────────────────────
function CourseLearningInner() {
  const sp = useSearchParams()
  const router = useRouter()
  const lessonId = sp.get('lessonId')

  const [lesson, setLesson]       = useState<Lesson | null>(null)
  const [tasks, setTasks]         = useState<Task[]>([])
  const [idx, setIdx]             = useState(0)
  const [code, setCode]           = useState(DEFAULT_HTML)
  const [preview, setPreview]     = useState('')
  const [checks, setChecks]       = useState<CheckResult[] | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [xpFlash, setXpFlash]     = useState(0)
  const [loading, setLoading]     = useState(true)
  const [showBaseHtml, setShowBaseHtml] = useState(false)
  const [consoleLogs, setConsoleLogs]   = useState<string[]>([])
  const [reactLogs, setReactLogs]       = useState<string[]>([])
  const [reactError, setReactError]     = useState<string | null>(null)
  const [nodeLogs, setNodeLogs]              = useState<string[]>([])
  const [fullstackLogs, setFullstackLogs]    = useState<string[]>([])
  const [runningJs, setRunningJs]            = useState(false)

  const reactIframeRef = useRef<HTMLIFrameElement | null>(null)

  // ── Derived values ───────────────────────────────────────────────
  const task   = tasks[idx]
  const rawTC  = task?.testCases as unknown
  const tcMode = (rawTC && !Array.isArray(rawTC) && typeof rawTC === 'object')
    ? (rawTC as { mode?: string }).mode : undefined

  const isCssMode   = tcMode === 'css'
  const isJsMode    = tcMode === 'js'
  const isReactMode = tcMode === 'react'
  const isNodeMode       = tcMode === 'node'
  const isFullstackMode  = tcMode === 'fullstack'

  const cssConfig      = isCssMode       ? (rawTC as unknown as CssTaskMeta)      : null
  const jsConfig       = isJsMode        ? (rawTC as unknown as JsTaskMeta)       : null
  const rctConfig      = isReactMode     ? (rawTC as unknown as ReactTaskMeta)    : null
  const nodeConfig     = isNodeMode      ? (rawTC as unknown as NodeTaskMeta)     : null
  const fsConfig       = isFullstackMode ? (rawTC as unknown as FullstackTaskMeta): null

  const isCodeMode = isJsMode || isReactMode || isNodeMode || isFullstackMode

  const htmlRules: HtmlRule[] = (!isCssMode && !isCodeMode && Array.isArray(rawTC))
    ? (rawTC as HtmlRule[]) : []
  const cssRules:  CssRule[]  = isCssMode       ? (cssConfig?.checks ?? []) : []
  const jsRules:   JsRule[]   = isJsMode        ? (jsConfig?.checks  ?? [])
    : isReactMode     ? (rctConfig?.checks ?? [])
    : isNodeMode      ? (nodeConfig?.checks ?? [])
    : isFullstackMode ? (fsConfig?.checks   ?? [])
    : []

  const hasRules    = isCodeMode ? jsRules.length > 0
    : isCssMode ? cssRules.length > 0 : htmlRules.length > 0
  const totalChecks = isCodeMode ? jsRules.length
    : isCssMode ? cssRules.length : htmlRules.length

  const accent    = isFullstackMode ? '#ff9500' : isNodeMode ? '#68d391' : isReactMode ? '#61dafb' : isJsMode ? '#f7df1e' : isCssMode ? '#bf5af2' : '#00e5ff'
  const accentDim = isFullstackMode ? 'rgba(255,149,0,.1)' : isNodeMode ? 'rgba(104,211,145,.1)' : isReactMode ? 'rgba(97,218,251,.1)' : isJsMode ? 'rgba(247,223,30,.1)'
    : isCssMode ? 'rgba(191,90,242,.12)' : 'rgba(0,229,255,.1)'
  const langLabel  = isFullstackMode ? 'FULLSTACK' : isNodeMode ? 'NODE' : isReactMode ? 'JSX' : isJsMode ? 'JS' : isCssMode ? 'CSS' : 'HTML'
  const fileExt    = isFullstackMode ? 'js' : isNodeMode ? 'js' : isReactMode ? 'jsx' : isJsMode ? 'js' : isCssMode ? 'css' : 'html'

  const allPass = hasRules
    ? checks !== null && checks.length > 0 && checks.every(c => c.pass)
    : isJsMode   ? consoleLogs.length > 0
    : isReactMode ? (!reactError && reactLogs.length >= 0 && preview === '__react_ran__')
    : isNodeMode       ? nodeLogs.some(l => l.includes('Server started'))
    : isFullstackMode  ? fullstackLogs.some(l => l.startsWith('✓'))
    : preview.length > 0
  const passedChecks = checks ? checks.filter(c => c.pass).length : 0
  const doneCount    = tasks.filter(t => t.submitted?.status === 'PASSED').length
  const progress     = tasks.length > 0 ? (doneCount / tasks.length) * 100 : 0
  const taskPassed   = task?.submitted?.status === 'PASSED'

  const getDefaultCode = (t: Task | undefined) => {
    if (!t) return DEFAULT_HTML
    const tc = t.testCases as unknown
    if (tc && !Array.isArray(tc) && typeof tc === 'object') {
      const m = (tc as { mode?: string }).mode
      if (m === 'css')   return t.starterCode || DEFAULT_CSS
      if (m === 'js')    return t.starterCode || DEFAULT_JS
      if (m === 'react') return t.starterCode || DEFAULT_REACT
      if (m === 'node')       return t.starterCode || DEFAULT_NODE
      if (m === 'fullstack') return t.starterCode || DEFAULT_FULLSTACK
    }
    return t.starterCode || DEFAULT_HTML
  }

  // ── Fetch lesson + tasks ─────────────────────────────────────────
  useEffect(() => {
    if (!lessonId) { router.push('/lessons'); return }
    setLoading(true)
    Promise.all([
      lessonsApi.get(lessonId).catch(() => ({ lesson: null })),
      tasksApi.byLesson(lessonId).catch(() => ({ tasks: [] })),
    ]).then(([ld, td]) => {
      setLesson(ld.lesson as Lesson | null)
      const ts = td.tasks as Task[]
      setTasks(ts)
      if (ts[0]) setCode(getDefaultCode(ts[0]))
    }).finally(() => setLoading(false))
  }, [lessonId])

  // ── Reset on task switch ─────────────────────────────────────────
  useEffect(() => {
    if (!task) return
    setCode(getDefaultCode(task))
    setChecks(null)
    setPreview('')
    setConsoleLogs([])
    setReactLogs([])
    setReactError(null)
    setNodeLogs([])
    setFullstackLogs([])
    // Reset React sandbox
    if (reactIframeRef.current?.contentWindow) {
      reactIframeRef.current.contentWindow.postMessage({ type: 'react-reset' }, '*')
    }
  }, [idx, task?.id])

  // ── React sandbox message listener ──────────────────────────────
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'react-result') {
        setReactLogs(e.data.logs as string[] || [])
        setReactError(e.data.error as string | null || null)
        setRunningJs(false)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // ── Preview builder (HTML/CSS) ───────────────────────────────────
  const buildPreview = (c: string): string => {
    if (!isCssMode) return c
    const base = cssConfig?.baseHtml || '<html><body></body></html>'
    const tag = `<style>\n${c}\n</style>`
    if (base.includes('</head>')) return base.replace('</head>', tag + '</head>')
    if (base.includes('<head>'))  return base.replace('<head>', '<head>' + tag)
    return `<html><head>${tag}</head><body>${base}</body></html>`
  }

  // ── Run handler ──────────────────────────────────────────────────
  const handleRun = async () => {
    if (isReactMode) {
      setRunningJs(true)
      setReactLogs([])
      setReactError(null)
      if (hasRules) setChecks(runJsChecks(code, jsRules))
      reactIframeRef.current?.contentWindow?.postMessage({ type: 'react-run', code }, '*')
      setPreview('__react_ran__')
      setTimeout(() => setRunningJs(false), 8000)
      return
    }
    if (isFullstackMode) {
      setRunningJs(true)
      setFullstackLogs([])
      if (hasRules) setChecks(runJsChecks(code, jsRules))
      const logs = await simulateFullstack(code)
      setFullstackLogs(logs)
      setRunningJs(false)
      return
    }
    if (isNodeMode) {
      setRunningJs(true)
      setNodeLogs([])
      if (hasRules) setChecks(runJsChecks(code, jsRules))
      const logs = await executeNode(code)
      setNodeLogs(logs)
      setRunningJs(false)
      return
    }
    if (isJsMode) {
      setRunningJs(true)
      setConsoleLogs([])
      if (hasRules) setChecks(runJsChecks(code, jsRules))
      const logs = await executeJs(code)
      setConsoleLogs(logs)
      setRunningJs(false)
      return
    }
    setPreview(buildPreview(code))
    if (hasRules) {
      setChecks(isCssMode
        ? runCssChecks(code, cssRules)
        : runHtmlChecks(code, htmlRules)
      )
    }
  }

  // ── Submit handler ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!task || !allPass || submitting) return
    setSubmitting(true)
    try {
      const token = typeof window !== 'undefined'
        ? localStorage.getItem('arenahub_token') : null
      const res = await fetch(`/api/tasks/${task.id}?action=submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ code, allPass: true }),
      })
      const data = await res.json()
      if (data.xpEarned > 0) {
        setXpFlash(data.xpEarned)
        setTimeout(() => setXpFlash(0), 2500)
      }
      setTasks(prev => prev.map((t, i) =>
        i === idx
          ? { ...t, submitted: { id: '', status: 'PASSED', xpEarned: data.xpEarned ?? 0 } }
          : t
      ))
      if (idx < tasks.length - 1) {
        setTimeout(() => setIdx(i => i + 1), 1100)
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading / empty ──────────────────────────────────────────────
  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#070d1a',
      fontFamily: 'var(--fp)', fontSize: 10, color: accent }}>
      LOADING...
    </div>
  )

  if (!tasks.length) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#070d1a', gap: 20 }}>
      <div style={{ fontFamily: 'var(--fp)', fontSize: 9, color: '#4a6a8a' }}>TASK ОЛДСОНГҮЙ</div>
      <Link href="/lessons" style={{ fontFamily: 'var(--fp)', fontSize: 8,
        color: '#00e5ff', textDecoration: 'none' }}>◀ БУЦАХ</Link>
    </div>
  )

  // ── Main render ──────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh',
      background: '#070d1a', overflow: 'hidden', position: 'relative', zIndex: 1 }}>

      <style>{`
        .task-btn:hover  { opacity:.8 !important; }
        .run-btn:hover   { background:${accentDim} !important; filter:brightness(1.15); }
        .submit-btn:hover{ background:rgba(0,255,65,.22) !important; }
        .nav-btn:hover:not(:disabled){ border-color:rgba(0,229,255,.5) !important; color:#00e5ff !important; }
        .reset-btn:hover { background:rgba(255,45,85,.1) !important; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }
      `}</style>

      {xpFlash > 0 && <XpFlash xp={xpFlash} />}

      {/* ── TOP BAR ───────────────────────────────────────── */}
      <div style={{ height: 52, flexShrink: 0, background: 'rgba(7,13,26,.98)',
        borderBottom: '1px solid rgba(0,229,255,.12)',
        display: 'flex', alignItems: 'center', padding: '0 20px', gap: 16 }}>

        <Link href="/lessons" style={{ fontFamily: 'var(--fp)', fontSize: 7,
          color: '#3a4560', textDecoration: 'none', letterSpacing: 1,
          whiteSpace: 'nowrap', flexShrink: 0 }}>
          ◀ БУЦАХ
        </Link>
        <div style={{ width: 1, height: 22, background: 'rgba(0,229,255,.12)', flexShrink: 0 }} />

        <div style={{ fontFamily: 'var(--fp)', fontSize: 6, color: accent,
          padding: '2px 8px', border: `1px solid ${accent}44`,
          background: accentDim, flexShrink: 0 }}>
          {langLabel}
        </div>

        <div style={{ fontFamily: 'var(--fp)', fontSize: 8, color: '#d0d8e8',
          letterSpacing: 1, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: 'nowrap' }}>
          {lesson?.title || `${langLabel} COURSE`}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <span style={{ fontFamily: 'var(--fm)', fontSize: 12, color: '#4a6a8a' }}>
            {doneCount}/{tasks.length}
          </span>
          <div style={{ width: 110, height: 6, background: '#0e1428',
            border: '1px solid #1a2a40', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#00ff41',
              transition: 'width .6s ease' }} />
          </div>
          <span style={{ fontFamily: 'var(--fm)', fontSize: 12, color: '#00ff41',
            minWidth: 34 }}>{Math.round(progress)}%</span>
        </div>

        {lesson?.xpReward != null && (
          <div style={{ fontFamily: 'var(--fp)', fontSize: 7, color: '#ffe600',
            padding: '4px 10px', border: '1px solid rgba(255,230,0,.2)',
            background: 'rgba(255,230,0,.04)', flexShrink: 0 }}>
            {lesson.xpReward} XP
          </div>
        )}
      </div>

      {/* ── MAIN ──────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* ── LEFT PANEL ──────────────────────────────────── */}
        <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: `1px solid ${accent}18`, background: 'rgba(10,16,34,.97)' }}>

          {/* Task header */}
          <div style={{ padding: '14px 20px', borderBottom: `1px solid ${accent}12`, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--fp)', fontSize: 7, color: accent, letterSpacing: 1 }}>
                TASK {String(idx + 1).padStart(2, '0')}/{String(tasks.length).padStart(2, '0')}
              </span>
              {taskPassed && (
                <span style={{ fontFamily: 'var(--fp)', fontSize: 6, color: '#00ff41',
                  padding: '2px 7px', border: '1px solid rgba(0,255,65,.3)',
                  background: 'rgba(0,255,65,.06)' }}>✓ PASSED</span>
              )}
            </div>
            <div style={{ fontFamily: 'var(--fp)', fontSize: 9, color: '#e0e8f4',
              lineHeight: 1.9, letterSpacing: .4 }}>
              {task?.title}
            </div>
          </div>

          {/* Instructions */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px', minHeight: 0 }}>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 13, color: '#8898b8',
              lineHeight: 1.9, whiteSpace: 'pre-wrap' }}>
              {task?.description}
            </div>
          </div>

          {/* Base HTML panel (CSS mode only) */}
          {isCssMode && cssConfig?.baseHtml && (
            <div style={{ borderTop: `1px solid ${accent}12`, flexShrink: 0 }}>
              <button onClick={() => setShowBaseHtml(v => !v)} style={{
                width: '100%', padding: '8px 20px', background: 'transparent',
                border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontFamily: 'var(--fp)', fontSize: 7, color: '#4a6a8a', letterSpacing: 1 }}>BASE HTML</span>
                <span style={{ fontFamily: 'var(--fp)', fontSize: 7, color: '#4a6a8a' }}>{showBaseHtml ? '▲' : '▼'}</span>
              </button>
              {showBaseHtml && (
                <div style={{ padding: '0 20px 10px', maxHeight: 140, overflowY: 'auto' }}>
                  <pre style={{ fontFamily: 'var(--fm)', fontSize: 11, color: '#3a4a60',
                    lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                    {cssConfig.baseHtml.trim()}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Checker results */}
          {checks !== null && hasRules && (
            <div style={{ padding: '12px 20px', borderTop: `1px solid ${accent}12`,
              flexShrink: 0, maxHeight: 170, overflowY: 'auto' }}>
              <div style={{ fontFamily: 'var(--fp)', fontSize: 7, color: '#4a6a8a',
                marginBottom: 8, letterSpacing: 1 }}>
                CHECKER [{passedChecks}/{totalChecks}]
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {checks.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8,
                    fontFamily: 'var(--fm)', fontSize: 12,
                    color: c.pass ? '#00ff41' : '#ff2d55', lineHeight: 1.5 }}>
                    <span style={{ flexShrink: 0 }}>{c.pass ? '✓' : '✗'}</span>
                    <span>{c.hint}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* React error hint */}
          {isReactMode && reactError && (
            <div style={{ padding: '10px 20px', borderTop: `1px solid ${accent}12`,
              flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: '#ff2d55',
                lineHeight: 1.5, background: 'rgba(255,45,85,.06)',
                padding: '8px 12px', borderLeft: '3px solid #ff2d55' }}>
                {reactError}
              </div>
            </div>
          )}

          {/* Task nav dots */}
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${accent}12`, flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--fp)', fontSize: 7, color: '#4a6a8a',
              marginBottom: 8, letterSpacing: 1 }}>TASKS</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {tasks.map((t, i) => {
                const done = t.submitted?.status === 'PASSED'
                const cur  = i === idx
                return (
                  <button key={t.id} className="task-btn" onClick={() => setIdx(i)} style={{
                    width: 34, height: 34,
                    border: `2px solid ${cur ? accent : done ? '#00ff41' : accent + '28'}`,
                    background: cur ? accentDim : done ? 'rgba(0,255,65,.07)' : 'transparent',
                    color: cur ? accent : done ? '#00ff41' : '#4a6a8a',
                    fontFamily: 'var(--fp)', fontSize: 7, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}>
                    {done ? '✓' : i + 1}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${accent}12`,
            display: 'flex', gap: 8, flexShrink: 0 }}>
            <button className="nav-btn" onClick={() => setIdx(Math.max(0, idx - 1))}
              disabled={idx === 0} style={{
                flex: 1, height: 36, background: 'transparent',
                border: `1px solid ${idx === 0 ? accent + '14' : accent + '30'}`,
                color: idx === 0 ? '#2a3a50' : '#8898b8',
                fontFamily: 'var(--fp)', fontSize: 7,
                cursor: idx === 0 ? 'not-allowed' : 'pointer', transition: 'all .15s',
              }}>◀ PREV</button>

            {allPass && !taskPassed ? (
              <button className="submit-btn" onClick={handleSubmit} disabled={submitting} style={{
                flex: 2, height: 36, background: 'rgba(0,255,65,.1)',
                border: '2px solid #00ff41', color: '#00ff41',
                fontFamily: 'var(--fp)', fontSize: 7,
                cursor: 'pointer', letterSpacing: .5, transition: 'background .15s',
              }}>
                {submitting ? 'SAVING...' : '✓ SUBMIT'}
              </button>
            ) : (
              <button className="nav-btn"
                onClick={() => setIdx(Math.min(tasks.length - 1, idx + 1))}
                disabled={idx === tasks.length - 1} style={{
                  flex: 2, height: 36, background: 'transparent',
                  border: `1px solid ${idx === tasks.length - 1 ? accent + '14' : accent + '30'}`,
                  color: idx === tasks.length - 1 ? '#2a3a50' : '#8898b8',
                  fontFamily: 'var(--fp)', fontSize: 7,
                  cursor: idx === tasks.length - 1 ? 'not-allowed' : 'pointer',
                  transition: 'all .15s',
                }}>NEXT ▶</button>
            )}
          </div>
        </div>

        {/* ── RIGHT PANEL ─────────────────────────────────── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', minWidth: 0 }}>

          {/* Editor toolbar */}
          <div style={{ height: 40, flexShrink: 0, background: 'rgba(7,13,26,.98)',
            borderBottom: `1px solid ${accent}12`,
            display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#ff5f57' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#febc2e' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#28c840' }} />
            </div>
            <div style={{ fontFamily: 'var(--fp)', fontSize: 7, color: accent, letterSpacing: 1 }}>
              {langLabel}
            </div>
            <div style={{ fontFamily: 'var(--fm)', fontSize: 11, color: '#2a3a50' }}>
              {task?.title
                ? `${task.title.toLowerCase().replace(/\s+/g, '-')}.${fileExt}`
                : `app.${fileExt}`}
            </div>
            <div style={{ flex: 1 }} />
            <button className="reset-btn"
              onClick={() => setCode(getDefaultCode(task))}
              style={{ background: 'transparent', border: '1px solid rgba(255,45,85,.25)',
                color: '#ff2d55', fontFamily: 'var(--fp)', fontSize: 6,
                padding: '4px 10px', cursor: 'pointer', transition: 'background .15s' }}>
              RESET
            </button>
          </div>

          {/* Monaco Editor */}
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <MonacoEditor
              height="100%"
              language={isCssMode ? 'css' : isCodeMode ? 'javascript' : 'html'}
              value={code}
              theme="vs-dark"
              onChange={v => setCode(v ?? '')}
              options={{
                fontSize: 14,
                fontFamily: "'Share Tech Mono', 'Courier New', monospace",
                minimap: { enabled: false },
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                padding: { top: 10 },
                renderLineHighlight: 'all',
                cursorBlinking: 'blink',
                smoothScrolling: true,
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Run bar */}
          <div style={{ height: 52, flexShrink: 0, background: 'rgba(7,13,26,.98)',
            borderTop: `1px solid ${accent}18`, borderBottom: `1px solid ${accent}10`,
            display: 'flex', alignItems: 'center', padding: '0 16px', gap: 14 }}>
            <button className="run-btn" onClick={handleRun} disabled={runningJs} style={{
              height: 36, padding: '0 22px',
              background: accentDim, border: `2px solid ${accent}`,
              color: accent, fontFamily: 'var(--fp)', fontSize: 8,
              cursor: runningJs ? 'not-allowed' : 'pointer', letterSpacing: 1,
              display: 'flex', alignItems: 'center', gap: 8, transition: 'background .15s',
              opacity: runningJs ? .6 : 1,
            }}>
              {runningJs ? '...' : '▶ RUN CODE'}
            </button>

            {checks !== null && hasRules && (
              <div style={{ fontFamily: 'var(--fm)', fontSize: 13,
                color: allPass ? '#00ff41' : '#ff2d55',
                display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 15 }}>{allPass ? '✓' : '✗'}</span>
                <span>
                  {allPass
                    ? `All ${totalChecks} checks passed!`
                    : `${passedChecks}/${totalChecks} checks passed`}
                </span>
              </div>
            )}

            {/* React run feedback */}
            {isReactMode && !hasRules && preview === '__react_ran__' && !reactError && (
              <span style={{ fontFamily: 'var(--fm)', fontSize: 13, color: accent }}>
                ✓ React rendered
              </span>
            )}
            {/* JS run feedback */}
            {isJsMode && !hasRules && consoleLogs.length > 0 && (
              <span style={{ fontFamily: 'var(--fm)', fontSize: 13, color: accent }}>
                ✓ {consoleLogs.length} line{consoleLogs.length > 1 ? 's' : ''} output
              </span>
            )}
            {/* Node run feedback */}
            {isNodeMode && !hasRules && nodeLogs.some(l => l.includes('Server started')) && (
              <span style={{ fontFamily: 'var(--fm)', fontSize: 13, color: accent }}>
                ✓ Server running
              </span>
            )}
            {/* Fullstack run feedback */}
            {isFullstackMode && !hasRules && fullstackLogs.some(l => l.startsWith('✓')) && (
              <span style={{ fontFamily: 'var(--fm)', fontSize: 13, color: accent }}>
                ✓ Pipeline complete
              </span>
            )}
          </div>

          {/* ── OUTPUT PANEL ─────────────────────────────────────── */}
          <div style={{ height: isReactMode ? 290 : 210, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

            {/* Panel header */}
            <div style={{ height: 30, flexShrink: 0, background: 'rgba(10,16,34,.97)',
              borderBottom: `1px solid ${accent}10`,
              display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8 }}>
              <span style={{ fontFamily: 'var(--fp)', fontSize: 7, color: '#4a6a8a', letterSpacing: 1 }}>
                {isFullstackMode ? 'CI/CD PIPELINE' : isNodeMode ? 'SERVER TERMINAL' : isJsMode ? 'CONSOLE OUTPUT' : isReactMode ? 'REACT PREVIEW' : 'PREVIEW'}
              </span>
              {isReactMode && preview === '__react_ran__' && !reactError && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--fp)', fontSize: 6, color: '#61dafb', letterSpacing: 1,
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#61dafb',
                    boxShadow: '0 0 6px #61dafb', display: 'inline-block',
                    animation: 'pulse 1.5s infinite',
                  }} />
                  LIVE
                </span>
              )}
              {isJsMode && !consoleLogs.length && (
                <span style={{ fontFamily: 'var(--fm)', fontSize: 11, color: '#2a3a50' }}>
                  — RUN хийж console.log харна уу
                </span>
              )}
              {isNodeMode && !nodeLogs.length && (
                <span style={{ fontFamily: 'var(--fm)', fontSize: 11, color: '#2a3a50' }}>
                  — RUN хийж server terminal харна уу
                </span>
              )}
              {isFullstackMode && !fullstackLogs.length && (
                <span style={{ fontFamily: 'var(--fm)', fontSize: 11, color: '#2a3a50' }}>
                  — RUN хийж pipeline харна уу
                </span>
              )}
              {!isJsMode && !isReactMode && !isNodeMode && !isFullstackMode && !preview && (
                <span style={{ fontFamily: 'var(--fm)', fontSize: 11, color: '#2a3a50' }}>
                  — RUN хийж preview харна уу
                </span>
              )}
              {isJsMode && consoleLogs.length > 0 && (
                <button onClick={() => setConsoleLogs([])} style={{
                  marginLeft: 'auto', background: 'transparent', border: 'none',
                  color: '#2a3a50', cursor: 'pointer', fontFamily: 'var(--fp)', fontSize: 7,
                }}>CLEAR</button>
              )}
              {isNodeMode && nodeLogs.length > 0 && (
                <button onClick={() => setNodeLogs([])} style={{
                  marginLeft: 'auto', background: 'transparent', border: 'none',
                  color: '#2a3a50', cursor: 'pointer', fontFamily: 'var(--fp)', fontSize: 7,
                }}>CLEAR</button>
              )}
              {isFullstackMode && fullstackLogs.length > 0 && (
                <button onClick={() => setFullstackLogs([])} style={{
                  marginLeft: 'auto', background: 'transparent', border: 'none',
                  color: '#2a3a50', cursor: 'pointer', fontFamily: 'var(--fp)', fontSize: 7,
                }}>CLEAR</button>
              )}
            </div>

            {/* Panel content */}
            {isFullstackMode ? (
              /* CI/CD pipeline */
              <div style={{ flex: 1, overflowY: 'auto', background: '#060c1a',
                padding: '8px 16px', fontFamily: 'var(--fm)', fontSize: 13 }}>
                {fullstackLogs.length === 0 && !runningJs && (
                  <div style={{ color: '#1a2a40', paddingTop: 8 }}>$ pipeline waiting...</div>
                )}
                {runningJs && (
                  <div style={{ color: '#4a6a8a' }}>
                    <span style={{ color: '#ff9500' }}>●</span> Running pipeline...
                  </div>
                )}
                {fullstackLogs.map((line, i) => (
                  <div key={i} style={{
                    color: line.startsWith('✓') ? '#ff9500'
                      : line.startsWith('$') ? '#8898b8'
                      : line.startsWith('  ✓') ? '#68d391'
                      : line.startsWith('  →') ? '#61dafb'
                      : line === '' ? 'transparent'
                      : '#5a6a80',
                    lineHeight: 1.7, marginBottom: 1,
                    fontWeight: line.startsWith('✓') ? 600 : 400,
                  }}>
                    {line || ' '}
                  </div>
                ))}
              </div>
            ) : isNodeMode ? (
              /* Server terminal */
              <div style={{ flex: 1, overflowY: 'auto', background: '#060c1a',
                padding: '8px 16px', fontFamily: 'var(--fm)', fontSize: 13 }}>
                {nodeLogs.length === 0 && !runningJs && (
                  <div style={{ color: '#1a2a40', paddingTop: 8 }}>$ _</div>
                )}
                {runningJs && <div style={{ color: '#4a6a8a' }}>$ Starting server...</div>}
                {nodeLogs.map((line, i) => (
                  <div key={i} style={{
                    color: line.startsWith('ERROR:') || line.startsWith('  ERR:') ? '#ff2d55'
                      : line.startsWith('✓') ? '#68d391'
                      : line.startsWith('Routes:') || line.startsWith('Console:') ? '#4a6a8a'
                      : line.startsWith('  [GET]') || line.startsWith('  [POST]') || line.startsWith('  [PUT]') || line.startsWith('  [DELETE]') ? '#61dafb'
                      : line === '' ? 'transparent'
                      : '#8898b8',
                    lineHeight: 1.7, marginBottom: 1,
                  }}>
                    {line === '' ? ' ' : (line.startsWith('  ') ? line : '$ ' + line)}
                  </div>
                ))}
              </div>
            ) : isJsMode ? (
              /* Console */
              <div style={{ flex: 1, overflowY: 'auto', background: '#060c1a',
                padding: '8px 16px', fontFamily: 'var(--fm)', fontSize: 13 }}>
                {consoleLogs.length === 0 && !runningJs && (
                  <div style={{ color: '#1a2a40', paddingTop: 8 }}>{'>'} _</div>
                )}
                {runningJs && <div style={{ color: '#4a6a8a' }}>{'>'} Running...</div>}
                {consoleLogs.map((line, i) => (
                  <div key={i} style={{
                    color: line.startsWith('ERROR:') ? '#ff2d55' : line.startsWith('ERR:') ? '#ff6680' : '#00ff41',
                    lineHeight: 1.7, marginBottom: 2,
                  }}>
                    {'> '}{line}
                  </div>
                ))}
              </div>
            ) : isReactMode ? (
              /* React sandbox */
              <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                <iframe
                  ref={reactIframeRef}
                  src="/react-sandbox.html"
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="React Preview"
                />
                {reactLogs.length > 0 && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    background: 'rgba(6,12,26,.92)', borderTop: '1px solid rgba(97,218,251,.15)',
                    padding: '4px 12px', maxHeight: 60, overflowY: 'auto',
                    fontFamily: 'var(--fm)', fontSize: 11,
                  }}>
                    {reactLogs.map((line, i) => (
                      <div key={i} style={{
                        color: line.startsWith('ERROR:') ? '#ff2d55' : '#61dafb',
                        lineHeight: 1.5,
                      }}>
                        {'> '}{line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* HTML/CSS iframe */
              <div style={{ flex: 1, overflow: 'hidden', background: '#fff' }}>
                {preview && (
                  <iframe
                    srcDoc={preview}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    sandbox="allow-scripts"
                    title="preview"
                  />
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

// ── Export ────────────────────────────────────────────────────────────
export default function CourseLearningUI() {
  return (
    <Suspense fallback={
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#070d1a',
        fontFamily: 'var(--fp)', fontSize: 10, color: '#00e5ff' }}>
        LOADING...
      </div>
    }>
      <CourseLearningInner />
    </Suspense>
  )
}