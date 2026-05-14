const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '../components/learn/CourseLearningUI.tsx')
let cui = fs.readFileSync(filePath, 'utf8')

const newCode = `function App() {
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

const startStr = 'const DEFAULT_REACT = `'
const endStr = '\n\nconst DEFAULT_FULLSTACK'
const start = cui.indexOf(startStr)
const end   = cui.indexOf(endStr, start)

if (start === -1 || end === -1) {
  console.error('Boundary not found! start:', start, 'end:', end)
  process.exit(1)
}

const before = cui.substring(0, start)
const after  = cui.substring(end)
const updated = before + 'const DEFAULT_REACT = `' + newCode + '`' + after
fs.writeFileSync(filePath, updated)
console.log('Done! Replaced', end - start, 'chars with', newCode.length, 'chars')