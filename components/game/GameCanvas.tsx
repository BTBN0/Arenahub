'use client'
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Task } from '@/lib/api-client'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.default),
  {
    ssr: false,
    loading: () => (
      <div style={{flex:1,background:'#0d1117',display:'flex',
        alignItems:'center',justifyContent:'center',color:'#4a6a8a',fontFamily:'monospace',fontSize:12}}>
        ⏳ Loading editor...
      </div>
    )
  }
)

type ExtTask = Task & { starterCode?:string; testCases?:TestCase[] }
interface TestCase { input:unknown; expected:unknown; label?:string }
interface RunResult { label:string; input:unknown; expected:unknown; actual:unknown; passed:boolean; error?:string }
/* ══════════════════════════════════════
   INTEGRATED GAME + TASK CANVAS
   Game reacts to quiz answers in real-time
══════════════════════════════════════ */

export type GameState = 'idle'|'running'|'correct'|'wrong'

export default function GameTaskCanvas({
  state, gameType, passedCount, totalTasks, taskTitle
}: {
  state: GameState
  gameType: string
  passedCount: number
  totalTasks: number
  taskTitle: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef    = useRef(0)

  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return
    const ctx = canvas.getContext('2d')!
    const W = canvas.width  = canvas.offsetWidth  || 760
    const H = canvas.height = canvas.offsetHeight || 300
    let f = 0
    let particles:{x:number;y:number;vx:number;vy:number;life:number;color:string;s:number}[]=[]
    let buildAnim = 0 // animation for new building appearing

    const r=(x:number,y:number,w:number,h:number,c:string)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h)}
    const tx=(txt:string,x:number,y:number,c:string,sz=10,align:'center'|'left'='center')=>{
      ctx.fillStyle='rgba(0,0,0,.6)'
      ctx.font=`bold ${sz}px 'Press Start 2P',monospace`
      ctx.textAlign=align
      ctx.fillText(txt,x+1,y+1)
      ctx.fillStyle=c
      ctx.fillText(txt,x,y)
    }
    const burst=(x:number,y:number,cols:string[],n=14)=>{
      for(let i=0;i<n;i++){
        const a=Math.random()*Math.PI*2,s=2+Math.random()*5
        particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:40+Math.random()*20,
          color:cols[i%cols.length],s:2+Math.random()*4})
      }
    }
    const drawChar=(x:number,y:number,col:string,walk=false,jump=0)=>{
      const lg=walk?Math.sin(f*.2)*5:0
      // Head
      r(x-7,y-28-jump,14,12,col)
      // Eyes
      r(x-4,y-26-jump,3,3,'#fff'); r(x+2,y-26-jump,3,3,'#fff')
      r(x-3,y-25-jump,2,2,'#000'); r(x+3,y-25-jump,2,2,'#000')
      // Body
      r(x-8,y-16-jump,16,14,col)
      // Arms
      r(x-14,y-14-jump,6,10,col); r(x+8,y-14-jump,6,10,col)
      // Legs
      r(x-7,y-2-jump,6,9+lg,'#888'); r(x+1,y-2-jump,6,9-lg,'#888')
      // Feet
      r(x-8,y+7+lg-jump,8,4,'#555'); r(x,y+7-lg-jump,8,4,'#555')
    }
    const scanlines=()=>{
      ctx.fillStyle='rgba(0,0,0,.05)'
      for(let y=0;y<H;y+=3) ctx.fillRect(0,y,W,1)
    }
    const stars=(maxY=120)=>{
      for(let i=0;i<40;i++){
        const br=.3+Math.sin(f*.04+i)*.2
        ctx.fillStyle=`rgba(255,255,255,${br})`
        const sz=i%5===0?2:1
        ctx.fillRect((i*89+f*.06)%W,(i*43)%maxY,sz,sz)
      }
    }

    // How many buildings/progress elements to show
    const progress = passedCount // 0..totalTasks

    // ─── CITY BUILDER (Frontend) ───
    const drawJump=()=>{
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#04080e'); bg.addColorStop(1,'#080c18')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      stars(120)
      r(0,H-25,W,25,'#0a0f1a')

      // Floating platforms - unlock with progress
      const platforms=[
        {x:60, y:H-70, w:80, col:'#1a3060', label:'margin'},
        {x:200,y:H-100,w:80, col:'#1a4030', label:'padding'},
        {x:330,y:H-80, w:80, col:'#301a50', label:'border'},
        {x:450,y:H-110,w:80, col:'#402010', label:'flex'},
        {x:570,y:H-90, w:80, col:'#104040', label:'media'},
      ]
      platforms.forEach((p,i)=>{
        const active=i<passedCount
        const bob=active?Math.sin(f*.06+i)*.3:0
        r(p.x,p.y+bob,p.w,10,active?p.col:'#0a1020')
        r(p.x,p.y+bob,p.w,3,active?'#ffffff22':'#ffffff08')
        ctx.fillStyle=active?'#aaccff55':'#2a3a4a'
        ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText(p.label,p.x+p.w/2,p.y+bob-4)
        if(active){
          ctx.fillStyle='rgba(100,200,255,.1)'
          ctx.fillRect(p.x,p.y+bob+10,p.w,H-p.y-35)
        }
      })

      // Character jumps between platforms
      const targetP=platforms[Math.min(passedCount,platforms.length-1)]
      const baseY=targetP?targetP.y-20:H-45
      const jumpH=state==='correct'?Math.abs(Math.sin(f*.25))*30:Math.abs(Math.sin(f*.06))*4
      const charX=targetP?targetP.x+targetP.w/2:80
      r(charX-5,baseY-jumpH-18,10,9,'#bf5af2')
      r(charX+1,baseY-jumpH-17,3,3,'#000')
      r(charX-7,baseY-jumpH-10,14,10,'#9b44cc')
      r(charX-5,baseY-jumpH,5,7,'#7722aa')
      r(charX,  baseY-jumpH,5,7,'#7722aa')

      r(W-170,8,160,26,'rgba(0,0,0,.5)')
      r(W-168,10,156,22,'#0a1020')
      tx(`PLATFORM ${passedCount}/${Math.min(totalTasks,9)}`,W-90,28,'#bf5af2',10)
      r(W-168,10,Math.floor(156*(passedCount/Math.max(totalTasks,1))),4,'#bf5af2')

      if(state==='idle') tx('▼ ХАРИУЛААД ҮСЭР',W/2-110,H-4,'#1a1a3a',5,'left')
      else if(state==='correct'){
        if(f>5){tx('✓ ДЭВШСЭН!',W/2,35,'#00ff41',9);if(f>15) tx('+XP',W/2,52,'#ffe600',7)}
      }
      else if(state==='wrong') tx('✗ УНАСАН!',W/2,35,'#ff0040',8)
    }

    // ─── ENEMY GAME (JavaScript) - Enemy гарна, зөв хариулт устгана ───
    const drawEnemy=()=>{
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#0a0000'); bg.addColorStop(1,'#180808')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      stars(120)
      r(0,H-28,W,28,'#0f0808')

      // Enemy pool - 3 enemies max, defeated = progress
      const totalEnemies=Math.min(totalTasks,9)
      const defeated=passedCount
      const alive=totalEnemies-defeated

      // Draw defeated markers
      for(let i=0;i<defeated;i++){
        const ex=80+i*100
        r(ex-12,H-58,24,24,'#111')
        ctx.fillStyle='#00ff4155'; ctx.font='20px serif'; ctx.textAlign='center'
        ctx.fillText('💀',ex,H-40)
        ctx.fillStyle='#00ff4133'; ctx.font='9px monospace'
        ctx.fillText('DEFEATED',ex,H-26)
      }

      // Draw alive enemies
      for(let i=0;i<Math.min(alive,3);i++){
        const ex=80+defeated*100+i*80+(Math.sin(f*.08+i))*8
        const ey=H-60+Math.sin(f*.12+i)*5
        // Enemy body
        r(ex-10,ey-20,20,18,'#cc0020')
        r(ex-8, ey-18,16,14,'#ff2244')
        // Eyes
        r(ex-6,ey-16,4,4,'#fff')
        r(ex+2, ey-16,4,4,'#fff')
        r(ex-5,ey-15,2,2,'#000')
        r(ex+3, ey-15,2,2,'#000')
        // Angry brows
        ctx.fillStyle='#ff0000';
        ctx.fillRect(ex-7,ey-18,5,2)
        ctx.fillRect(ex+2, ey-18,5,2)
        // Legs
        r(ex-6,ey-2,5,6,'#991133')
        r(ex+1, ey-2,5,6,'#991133')
        // Label
        ctx.fillStyle='#ff4466'; ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText('BUG',ex,ey-24)
      }

      // Hero on left
      const heroX=35
      const heroJump=state==='correct'?Math.abs(Math.sin(f*.3))*20:0
      // Sword swing animation
      if(state==='correct'&&f<20){
        r(heroX+8,H-70-heroJump,3,20,'#aaaaff')
        r(heroX+8,H-70-heroJump,14,3,'#aaaaff')
      }
      r(heroX-5,H-70-heroJump,10,9,'#ffe600')
      r(heroX+1, H-69-heroJump,3,3,'#000')
      r(heroX-7, H-62-heroJump,14,10,'#aa8800')
      r(heroX-5, H-52-heroJump,5,8,'#886600')
      r(heroX,   H-52-heroJump,5,8,'#886600')

      // Energy beam when correct
      if(state==='correct'&&f<25){
        ctx.fillStyle=`rgba(255,230,0,${.3-f*.012})`
        ctx.fillRect(heroX+10,H-68-heroJump,W-heroX-10,10)
        if(f===1 && alive>0){
          // Explosion at first enemy
          const tx2=80+defeated*100
          for(let p=0;p<12;p++){
            const a=Math.random()*Math.PI*2
            ctx.fillStyle=['#ff0040','#ffe600','#ff6600'][p%3]
            ctx.fillRect(tx2+Math.cos(a)*20,H-50+Math.sin(a)*15,4,9)
          }
        }
      }

      r(W-170,8,160,26,'rgba(0,0,0,.5)')
      r(W-168,10,156,22,'#0a1020')
      tx(`BUG ${defeated}/${totalEnemies} DEFEATED`,W-90,28,'#ff2244',9)
      r(W-168,10,Math.floor(156*(defeated/Math.max(totalEnemies,1))),4,'#00ff41')

      if(state==='idle') tx('▼ ХАРИУЛЖ BUG УСТГА',W/2-130,H-4,'#3a1a1a',5,'left')
      else if(state==='correct'){
        if(f>5){tx('✓ BUG УСТГАСАН!',W/2,35,'#00ff41',9);if(f>15) tx('+XP',W/2,52,'#ffe600',7)}
      }
      else if(state==='wrong'){tx('✗ BUG АМИЛСАН!',W/2,35,'#ff0040',8)}
    }


    // ─── EVOLUTION GAME (HTML Course) ───
    // Living digital civilization that grows with progress
    const drawEvolution=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('ev' in cvs)){
        if(!cvs) return
        cvs.ev={
          corruption:0,
          evFlash:0,
          corrFlash:0,
          creatures:[] as {x:number;y:number;vx:number;dir:number;type:number}[],
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string}[],
          frame:0,
          prevPassed:-1,
          prevState:'idle' as string,
        }
        for(let i=0;i<3;i++) cvs.ev.creatures.push({x:80+i*220,y:H-45,vx:(Math.random()-.5)*1.2,dir:Math.random()>.5?1:-1,type:i%3})
      }
      const g=cvs.ev
      const p=passedCount
      const total=Math.max(totalTasks,1)
      const ratio=p/total

      const stage=ratio<.07?0:ratio<.18?1:ratio<.32?2:ratio<.48?3:ratio<.62?4:ratio<.76?5:ratio<.90?6:7
      const SNAMES=['VOID','CELL','SPROUT','ECOSYSTEM','VILLAGE','CITY','MEGACITY','CIVILIZATION']

      // ── STATE TRANSITIONS ──
      if(g.prevState!==state){
        if(state==='correct'){
          g.evFlash=40; g.corruption=Math.max(0,g.corruption-20)
          for(let i=0;i<20;i++){
            const a=Math.random()*Math.PI*2,s=2+Math.random()*5
            g.particles.push({x:W/2,y:H*.7,vx:Math.cos(a)*s,vy:Math.sin(a)*s-3,life:40+Math.random()*20,col:['#00ff41','#ffe600','#7fff00','#00e5ff'][i%4]})
          }
        }
        if(state==='wrong'){
          g.corrFlash=30; g.corruption=Math.min(100,g.corruption+25)
          for(let i=0;i<12;i++){
            const a=Math.random()*Math.PI*2
            g.particles.push({x:W*.3+Math.random()*W*.4,y:H*.5,vx:Math.cos(a)*3,vy:Math.sin(a)*3-1,life:25,col:'#ff2d55'})
          }
        }
        g.prevState=state
      }

      // ── TASK PROGRESS ──
      if(g.prevPassed!==p){
        g.prevPassed=p
        if(p>0&&stage>=1){
          const sd=Math.random()>.5?1:-1
          g.creatures.push({x:sd>0?-20:W+20,y:H-45,vx:sd*(.5+Math.random()*.5),dir:sd,type:Math.floor(Math.random()*3)})
        }
      }

      // Corruption slow decay
      if(g.frame%180===0&&g.corruption>0) g.corruption=Math.max(0,g.corruption-2)

      // ── CREATURE UPDATE ──
      const gndY=H-45
      g.creatures=g.creatures.filter((c:any)=>c.x>-100&&c.x<W+100)
      g.creatures.forEach((c:any)=>{
        c.x+=c.vx
        if(c.x>W-20&&c.vx>0){c.vx*=-1;c.dir*=-1}
        if(c.x<20&&c.vx<0){c.vx*=-1;c.dir*=-1}
      })
      const maxCr=Math.min(p*2+stage,14)
      if(g.creatures.length>maxCr) g.creatures=g.creatures.slice(-maxCr)
      while(g.creatures.length<Math.min(stage+1,8)&&stage>0){
        g.creatures.push({x:60+Math.random()*(W-120),y:gndY,vx:(Math.random()-.5)*1.2,dir:Math.random()>.5?1:-1,type:Math.floor(Math.random()*3)})
      }

      // ── PARTICLE UPDATE ──
      g.particles.forEach((pt:any)=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.15;pt.life--})
      g.particles=g.particles.filter((pt:any)=>pt.life>0)
      g.frame++

      // ── SKY ──
      const sky=ctx.createLinearGradient(0,0,0,H)
      if(stage===0){sky.addColorStop(0,'#000008');sky.addColorStop(1,'#00000e')}
      else if(stage===1){sky.addColorStop(0,'#000820');sky.addColorStop(1,'#001030')}
      else if(stage===2){sky.addColorStop(0,'#001428');sky.addColorStop(1,'#002010')}
      else if(stage===3){sky.addColorStop(0,'#002038');sky.addColorStop(1,'#003820')}
      else if(stage===4){sky.addColorStop(0,'#041428');sky.addColorStop(1,'#081c10')}
      else if(stage===5){sky.addColorStop(0,'#040820');sky.addColorStop(1,'#081018')}
      else if(stage===6){sky.addColorStop(0,'#060418');sky.addColorStop(1,'#0a0614')}
      else{sky.addColorStop(0,'#040020');sky.addColorStop(1,'#080030')}
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H)

      // Stars
      if(stage<4){
        for(let i=0;i<50;i++){
          const br=.2+Math.sin(g.frame*.03+i*.8)*.15
          ctx.fillStyle=`rgba(255,255,255,${br})`
          ctx.fillRect((i*137+g.frame*.02)%W,(i*53)%(H*.6),1,1)
        }
      }

      // Digital grid (early stages)
      if(stage<=2){
        ctx.strokeStyle=`rgba(0,229,255,${.03+stage*.01})`;ctx.lineWidth=.5
        for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
        for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      }

      // Clouds (later stages)
      if(stage>=3){
        const cc=stage>=6?'rgba(80,40,120,0.12)':'rgba(20,60,30,0.10)'
        for(let i=0;i<3;i++){
          const cx2=(i*260+g.frame*.12)%(W+100)-50,cy2=28+i*22
          ctx.fillStyle=cc;ctx.beginPath();ctx.ellipse(cx2,cy2,65+i*18,16+i*4,0,0,Math.PI*2);ctx.fill()
        }
      }

      // ── GROUND ──
      const gcol=stage<=1?'#030810':stage<=3?'#061408':stage<=5?'#0a1806':'#080614'
      r(0,gndY,W,H-gndY,gcol)
      r(0,gndY,W,4,stage<=1?'#0a1828':stage<=3?'#0a2810':stage<=5?'#142810':'#140828')

      // Grass (eco/village stages)
      if(stage>=2&&stage<=5){
        for(let gx=0;gx<W;gx+=12){
          if((gx+g.frame)%36<12){
            const gh=3+(gx%3)*2
            ctx.fillStyle=`rgba(0,180,${60+gx%40},0.3)`;ctx.fillRect(gx,gndY-gh,3,gh)
          }
        }
      }

      // Road (city+)
      if(stage>=5){
        r(0,gndY-4,W,8,'#0e0e18')
        for(let rx=0;rx<W;rx+=50){
          const off=(rx+g.frame*.5)%W
          ctx.fillStyle='rgba(255,255,0,0.10)';ctx.fillRect(off%W,gndY-1,20,2)
        }
        ctx.fillStyle='rgba(255,215,0,0.20)';ctx.font='7px monospace';ctx.textAlign='center'
        ctx.fillText('<nav>',W*.5,gndY+10)
      }

      // ── STRUCTURES ──
      const tagLabels=['<div>','<header>','<section>','<article>','<main>','<aside>','<footer>','<nav>','<span>','<p>']
      const tagCols  =['#00e5ff','#ffd700','#00ff41','#bf5af2','#ff9500','#ff2d55','#4cd964','#5ac8fa','#ffcc00','#dd88ff']
      const numStr=Math.min(p,10)
      const sp=numStr>1?(W-80)/(numStr-1):0

      for(let i=0;i<numStr;i++){
        const sx=numStr===1?W/2:40+i*sp
        const sType=Math.max(0,Math.min(7,Math.floor(p*.8-i*.4)))
        const lbl=tagLabels[i%tagLabels.length]
        const lcol=tagCols[i%tagCols.length]
        const bob=sType<2?Math.sin(g.frame*.05+sx*.01)*2:0

        if(sType===0){
          // CELL - pulsing orb
          const sz=6+Math.sin(g.frame*.08+sx*.01)*2.5
          ctx.fillStyle=`${lcol}22`;ctx.beginPath();ctx.arc(sx,gndY-sz-bob,sz,0,Math.PI*2);ctx.fill()
          ctx.fillStyle=`${lcol}88`;ctx.beginPath();ctx.arc(sx,gndY-sz-bob,sz*.5,0,Math.PI*2);ctx.fill()
        }else if(sType===1){
          // SPROUT
          r(sx-2,gndY-22,4,22+bob,'#1a4010')
          r(sx-9,gndY-22+bob,12,8,'#1a6010');r(sx-6,gndY-30+bob,10,9,'#228b22');r(sx-3,gndY-37+bob,6,7,'#2aa020')
        }else if(sType===2){
          // TREE
          r(sx-3,gndY-36,6,36,'#2d1a0a')
          r(sx-14,gndY-62,28,26,'#1a5a10');r(sx-10,gndY-82,20,22,'#228b22');r(sx-6,gndY-100,12,18,'#2aa020')
          ctx.fillStyle='#00cc44';ctx.beginPath();ctx.arc(sx,gndY-100,6,0,Math.PI*2);ctx.fill()
        }else if(sType===3){
          // HUT
          r(sx-16,gndY-30,32,30,'#3d2a1a')
          ctx.fillStyle='#5a3a20';ctx.beginPath();ctx.moveTo(sx-20,gndY-30);ctx.lineTo(sx,gndY-56);ctx.lineTo(sx+20,gndY-30);ctx.fill()
          r(sx-5,gndY-15,10,15,'#1a0a04');r(sx-13,gndY-25,7,7,`${lcol}22`)
        }else if(sType===4){
          // HOUSE
          r(sx-20,gndY-46,40,46,'#2a2a3a')
          ctx.fillStyle='#3a3a4a';ctx.beginPath();ctx.moveTo(sx-25,gndY-46);ctx.lineTo(sx,gndY-72);ctx.lineTo(sx+25,gndY-46);ctx.fill()
          r(sx-15,gndY-38,10,10,`${lcol}33`);r(sx+5,gndY-38,10,10,`${lcol}33`);r(sx-5,gndY-20,10,20,'#0a0a14')
        }else if(sType===5){
          // TOWER
          r(sx-14,gndY-82,28,82,'#1a1a2a');r(sx-12,gndY-84,24,6,'#2a2a3a')
          for(let wy=0;wy<4;wy++){r(sx-8,gndY-72+wy*16,6,8,`${lcol}44`);r(sx+2,gndY-72+wy*16,6,8,`${lcol}44`)}
          r(sx-1,gndY-98,2,16,'#3a3a4a')
          if(g.frame%60<30){ctx.fillStyle='#ff2d5599';ctx.fillRect(sx-1,gndY-98,3,3)}
        }else if(sType===6){
          // SKYSCRAPER
          r(sx-16,gndY-122,32,122,'#151520');r(sx-14,gndY-124,28,6,'#1e1e2e')
          for(let wy=0;wy<8;wy++) for(let wx=0;wx<3;wx++){
            const lit=Math.sin(g.frame*.02+wy*.4+wx*.7+sx*.01)>.3
            r(sx-12+wx*10,gndY-112+wy*13,7,9,lit?`${lcol}55`:`${lcol}11`)
          }
          r(sx-1,gndY-132,2,10,'#2a2a3a')
          ctx.fillStyle=`${lcol}88`;ctx.beginPath();ctx.arc(sx,gndY-130,3,0,Math.PI*2);ctx.fill()
        }else{
          // MEGALITH / LANDMARK
          r(sx-20,gndY-162,40,162,'#0e0e1e');r(sx-18,gndY-164,36,8,'#1a1a2e')
          for(let wy=0;wy<12;wy++) for(let wx=0;wx<4;wx++){
            const lit=Math.sin(g.frame*.015+wy*.3+wx*.9+sx*.005)>0
            r(sx-16+wx*9,gndY-152+wy*12,6,8,lit?`${lcol}66`:`${lcol}0f`)
          }
          ctx.fillStyle=`${lcol}44`;ctx.beginPath();ctx.arc(sx,gndY-162,8,0,Math.PI*2);ctx.fill()
          if(g.frame%40<20){ctx.fillStyle=lcol;ctx.beginPath();ctx.arc(sx,gndY-162,3,0,Math.PI*2);ctx.fill()}
        }

        // HTML tag label above structure
        const lblY=gndY-Math.max(22,sType*22+10)-6
        ctx.fillStyle=`${lcol}99`;ctx.font='7px monospace';ctx.textAlign='center'
        ctx.fillText(lbl,sx,lblY)
      }

      // ── CORRUPTION TILES ──
      if(g.corruption>5){
        const nc=Math.floor(g.corruption/10)
        for(let ci=0;ci<nc;ci++){
          const cx2=((ci*137+g.frame*.3)%(W-40))+20,cy2=gndY-30-((ci*71)%80)
          ctx.fillStyle=`rgba(255,45,85,${.1+(g.corruption/100)*.3})`;ctx.fillRect(cx2,cy2,8+(ci%4)*4,8+(ci%3)*3)
          if(ci%2===0){ctx.fillStyle='rgba(255,45,85,.18)';ctx.fillRect(cx2-20,cy2+4,50+ci*5,2)}
        }
      }

      // ── CREATURES ──
      g.creatures.forEach((c:any,i:number)=>{
        const walk=Math.sin(g.frame*.15+i)*4
        const cx2=c.x,cy2=gndY-20
        const ccol=['#00e5ff','#00ff41','#ffd700'][c.type%3]
        r(cx2-5,cy2-12,10,10,ccol)
        r(cx2+(c.dir>0?1:-3),cy2-11,3,3,'#fff')
        r(cx2-6,cy2-2,12,10,ccol+'bb')
        r(cx2-5,cy2+8+(walk>0?2:0),4,Math.max(2,4+(walk>0?-2:0)),'#555')
        r(cx2+1,cy2+8+(walk<0?2:0),4,Math.max(2,4+(walk<0?-2:0)),'#555')
      })

      // ── EVOLUTION FLASH ──
      if(g.evFlash>0){
        ctx.fillStyle=`rgba(0,255,65,${(g.evFlash/40)*.2})`;ctx.fillRect(0,0,W,H)
        if(g.evFlash>25){ctx.fillStyle='#00ff41';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('◀ EVOLUTION ▶',W/2,H*.45)}
        g.evFlash--
      }

      // ── CORRUPTION FLASH ──
      if(g.corrFlash>0){
        ctx.fillStyle=`rgba(255,45,85,${(g.corrFlash/30)*.25})`;ctx.fillRect(0,0,W,H)
        if(g.corrFlash>18){ctx.fillStyle='#ff2d55';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('⚠ CORRUPTION SPREADING',W/2,H*.45)}
        g.corrFlash--
      }

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{
        ctx.globalAlpha=Math.max(0,pt.life/50)
        ctx.fillStyle=pt.col;ctx.fillRect(pt.x-2,pt.y-2,4,4)
        ctx.globalAlpha=1
      })

      // ── HUD ──
      r(0,0,W,26,'rgba(0,0,0,.85)')
      ctx.fillStyle='#ffd700';ctx.font='bold 10px monospace';ctx.textAlign='left'
      ctx.fillText(`◆ ${SNAMES[stage]}`,10,17)
      if(g.corruption>0){
        r(W-140,5,100,16,'#1a0010')
        r(W-139,6,Math.floor(98*(g.corruption/100)),14,g.corruption>60?'#ff2d55':'#ff9900')
        ctx.fillStyle='#ff2d5588';ctx.font='8px monospace';ctx.textAlign='left';ctx.fillText('CORRUPT',W-136,17)
      }
      ctx.fillStyle='#4cd964';ctx.font='bold 9px monospace';ctx.textAlign='center'
      ctx.fillText(`${p}/${total} EVOLVING`,W/2,17)
      r(0,22,W,4,'#111')
      const pCol=stage<=1?'#0080ff':stage<=3?'#00cc44':stage<=5?'#ffd700':'#ff2d55'
      r(0,22,Math.floor(W*(p/total)),4,pCol)

      // Scanlines
      ctx.fillStyle='rgba(0,0,0,.04)';for(let y=0;y<H;y+=3) ctx.fillRect(0,y,W,1)

      // ── VICTORY ──
      if(p>=total&&total>0){
        ctx.fillStyle='rgba(0,0,0,.75)';ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle=`rgba(255,215,0,${.1+Math.sin(g.frame*.05)*.05})`;ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#ffd700';ctx.font='bold 15px monospace';ctx.textAlign='center'
        ctx.fillText('🌐 HTML CIVILIZATION!',W/2,H/2-12)
        ctx.fillStyle='#00ff41';ctx.font='10px monospace';ctx.fillText('Digital world fully evolved!',W/2,H/2+10)
        ctx.fillStyle='#4a6080';ctx.font='9px monospace';ctx.fillText(`${p} tasks mastered`,W/2,H/2+26)
      }
    }


    // ─── CODE QUEST BATTLE (JavaScript Course) ───
    // Logic dungeon: JS tasks power up abilities, enemies = code bugs
    const drawCodeQuestBattle=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('cqb' in cvs)){
        if(!cvs) return
        cvs.cqb={
          hp:100, mana:60, stability:90, combo:0,
          enemies:[] as {x:number;y:number;hp:number;maxHp:number;type:number;vx:number;id:number;flash:number}[],
          bullets:[] as {x:number;y:number;vx:number;vy:number;type:number;dmg:number;life:number;id:number}[],
          summons:[] as {x:number;y:number;id:number;life:number}[],
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string;s:number}[],
          scrollX:0, shieldTimer:0, timeSlowTimer:0,
          unlockTimer:0, unlockMsg:'',
          corruptFlash:0, attackFlash:0,
          prevState:'idle' as string, prevPassed:-1, frame:0, spawnTimer:60,
        }
      }
      const g=cvs.cqb
      const p=passedCount
      const total=Math.max(totalTasks,1)
      const ratio=p/total
      const ceilY=24, floorY=H-40, playerY=H*.55
      const stage=ratio<.08?0:ratio<.20?1:ratio<.33?2:ratio<.48?3:ratio<.62?4:ratio<.76?5:ratio<.90?6:7
      const STAGES=['SCRIPT KID','DEBUGGER','LOOP MASTER','FUNC CODER','ARRAY MASTER','ASYNC RUNNER','DOM MASTER','CODE MASTER']

      // Ability flags
      const hasAutoAttack=stage>=1
      const hasLoopStrike=stage>=2
      const hasFuncSummon=stage>=3
      const hasArrayClone=stage>=4
      const hasTimeSlow  =stage>=5
      const hasDomStrike =stage>=6
      const tslFactor    =g.timeSlowTimer>0?.4:1

      // Task type detection
      const ttl=taskTitle.toLowerCase()
      const isIfTask   =ttl.includes('if')||ttl.includes('condition')||ttl.includes('else')
      const isLoopTask =ttl.includes('loop')||ttl.includes('for')||ttl.includes('while')
      const isFuncTask =ttl.includes('function')||ttl.includes('func')
      const isArrayTask=ttl.includes('array')||ttl.includes('push')||ttl.includes('map')
      const isAsyncTask=ttl.includes('async')||ttl.includes('promise')||ttl.includes('await')
      const isDomTask  =ttl.includes('dom')||ttl.includes('event')||ttl.includes('click')

      // ── STATE TRANSITIONS ──
      if(g.prevState!==state){
        if(state==='correct'){
          g.attackFlash=30; g.mana=Math.min(100,g.mana+20)
          g.stability=Math.min(100,g.stability+12); g.combo++
          if(isIfTask&&stage>=1){
            g.shieldTimer=180; g.unlockMsg='🛡 IF SHIELD ON'; g.unlockTimer=45
          } else if(isLoopTask&&hasLoopStrike){
            for(let i=0;i<5;i++) g.bullets.push({x:80,y:playerY+(i-2)*14,vx:8+i*.5,vy:(i-2)*.3,type:1,dmg:3,life:60,id:Date.now()+i})
            g.unlockMsg='🔁 LOOP STRIKE ×5'; g.unlockTimer=45
          } else if(isFuncTask&&hasFuncSummon){
            g.summons.push({x:100+Math.random()*40,y:playerY-40-Math.random()*30,id:Date.now(),life:200})
            g.unlockMsg='⚡ FUNCTION SUMMON'; g.unlockTimer=45
          } else if(isArrayTask&&hasArrayClone){
            for(let i=0;i<3;i++) g.bullets.push({x:72+i*6,y:playerY-18+i*18,vx:7+Math.random()*3,vy:(Math.random()-.5)*2,type:3,dmg:5,life:70,id:Date.now()+i})
            g.unlockMsg='📋 ARRAY CLONE ×3'; g.unlockTimer=45
          } else if(isAsyncTask&&hasTimeSlow){
            g.timeSlowTimer=150; g.unlockMsg='⏳ ASYNC TIME SLOW'; g.unlockTimer=45
          } else if(isDomTask&&hasDomStrike){
            g.enemies.forEach((e:any)=>{e.hp-=15;e.flash=20})
            g.unlockMsg='🌐 DOM AREA STRIKE'; g.unlockTimer=45
          } else {
            g.bullets.push({x:80,y:playerY,vx:9,vy:0,type:0,dmg:8,life:55,id:Date.now()})
          }
          for(let i=0;i<12;i++){
            const a=Math.random()*Math.PI*2,s=2+Math.random()*4
            g.particles.push({x:65,y:playerY,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:30+Math.random()*20,col:['#00ff41','#00e5ff','#ffd700','#bf5af2'][i%4],s:3})
          }
        }
        if(state==='wrong'){
          g.corruptFlash=32; g.stability=Math.max(0,g.stability-25); g.combo=0; g.mana=Math.max(0,g.mana-10)
          for(let i=0;i<2;i++) g.enemies.push({x:W+20+i*45,y:H*.28+Math.random()*(H*.45),hp:6+p*.5,maxHp:6+p*.5,type:Math.floor(Math.random()*4)+1,vx:-(1+Math.random()*.5),id:Date.now()+i,flash:0})
          for(let i=0;i<14;i++){
            const a=Math.random()*Math.PI*2
            g.particles.push({x:W*.4+Math.random()*W*.3,y:H*.4+Math.random()*H*.2,vx:Math.cos(a)*3,vy:Math.sin(a)*3-1,life:25,col:'#ff2d55',s:4})
          }
        }
        g.prevState=state
      }

      // ── TIMERS & REGEN ──
      g.mana=Math.min(100,g.mana+.09)
      if(g.shieldTimer>0) g.shieldTimer--
      if(g.timeSlowTimer>0) g.timeSlowTimer--
      if(g.unlockTimer>0) g.unlockTimer--
      g.scrollX+=1.4*tslFactor

      // ── SPAWN ENEMIES ──
      g.spawnTimer-=tslFactor
      if(g.spawnTimer<=0&&stage>=1){
        g.spawnTimer=Math.max(55,190-p*8)
        const et=Math.min(Math.floor(Math.random()*(stage+1)),4)
        const eh=8+p*.8
        g.enemies.push({x:W+20,y:H*.28+Math.random()*(H*.45),hp:eh,maxHp:eh,type:et,vx:-(0.9+p*.05)*tslFactor,id:Date.now(),flash:0})
      }

      // Auto attack
      if(hasAutoAttack&&g.frame%Math.max(38,80-stage*8)===0){
        g.bullets.push({x:80,y:playerY,vx:8+stage,vy:0,type:0,dmg:5+stage,life:55,id:Date.now()})
      }

      // ── UPDATE ENEMIES ──
      g.enemies.forEach((e:any)=>{
        e.x+=e.vx*tslFactor
        e.y+=Math.sin(g.frame*.04+e.id*.1)*.9
        if(e.flash>0) e.flash--
        if(e.x<28){
          e.x=W+30
          if(g.shieldTimer<=0){
            g.hp=Math.max(0,g.hp-8)
            for(let i=0;i<8;i++){const a=Math.random()*Math.PI*2;g.particles.push({x:58,y:playerY,vx:Math.cos(a)*4,vy:Math.sin(a)*4,life:25,col:'#ff2d55',s:3})}
          }
        }
      })
      g.enemies=g.enemies.filter((e:any)=>e.hp>0)

      // ── UPDATE BULLETS ──
      g.bullets.forEach((b:any)=>{
        b.x+=b.vx; b.y+=b.vy; b.life--
        g.enemies.forEach((e:any)=>{
          if(Math.abs(b.x-e.x)<18&&Math.abs(b.y-e.y)<18&&b.life>0){
            e.hp-=b.dmg; e.flash=15; b.life=0
            for(let i=0;i<6;i++){const a=Math.random()*Math.PI*2;g.particles.push({x:e.x,y:e.y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:20,col:['#ff4444','#ff8800','#ffe600'][i%3],s:3})}
          }
        })
      })
      g.bullets=g.bullets.filter((b:any)=>b.life>0&&b.x<W+20)

      // ── UPDATE SUMMONS ──
      g.summons=g.summons.filter((s:any)=>s.life>0)
      g.summons.forEach((sm:any)=>{
        sm.life--
        if(g.frame%25===0){
          const near=g.enemies.reduce((best:any,e:any)=>!best||Math.abs(e.x-sm.x)<Math.abs((best as any).x-sm.x)?e:best,null)
          if(near){const dx=near.x-sm.x,dy=near.y-sm.y,d=Math.sqrt(dx*dx+dy*dy)||1;g.bullets.push({x:sm.x,y:sm.y,vx:dx/d*7,vy:dy/d*7,type:2,dmg:4,life:40,id:Date.now()})}
        }
      })

      // ── PARTICLES & HP REGEN ──
      g.particles.forEach((pt:any)=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.15;pt.life--})
      g.particles=g.particles.filter((pt:any)=>pt.life>0)
      if(g.frame%300===0&&g.hp<100) g.hp=Math.min(100,g.hp+2)
      g.frame++

      // ── BACKGROUND ──
      const bg=ctx.createLinearGradient(0,0,0,H)
      if(stage<=1){bg.addColorStop(0,'#04060e');bg.addColorStop(1,'#080818')}
      else if(stage<=3){bg.addColorStop(0,'#030508');bg.addColorStop(1,'#060618')}
      else if(stage<=5){bg.addColorStop(0,'#020408');bg.addColorStop(1,'#040814')}
      else{bg.addColorStop(0,'#020312');bg.addColorStop(1,'#05051e')}
      ctx.fillStyle=bg;ctx.fillRect(0,0,W,H)

      // Code grid
      ctx.strokeStyle=`rgba(0,229,255,${.025+stage*.005})`;ctx.lineWidth=.5
      const gs=36
      for(let x=(g.scrollX*.2)%gs;x<W;x+=gs){ctx.beginPath();ctx.moveTo(x,ceilY);ctx.lineTo(x,floorY);ctx.stroke()}
      for(let y=ceilY;y<floorY;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

      // Floating code snippets
      const snips=['if(x>0)','for(;;)','()=>{}','[...arr]','async()','callback','Promise','new Map()']
      for(let i=0;i<4;i++){
        const sx=(i*210-g.scrollX*.07+40)%(W+100)-50,sy=ceilY+18+i*(H*.18)
        ctx.fillStyle=`rgba(0,229,255,${.04+stage*.005})`;ctx.font='8px monospace';ctx.textAlign='left'
        ctx.fillText(snips[(i+Math.floor(g.scrollX*.004))%snips.length],sx,sy)
      }

      // Background building silhouettes (stage 4+)
      if(stage>=4){
        const ba=Math.min(.25,(stage-3)*.07)
        const bc=stage>=6?`rgba(160,40,255,${ba})`:`rgba(0,80,200,${ba})`
        for(let i=0;i<6;i++){
          const bx=(i*160-g.scrollX*.05)%(W+160)-80,bh=35+i*20
          ctx.fillStyle=bc;ctx.fillRect(bx,floorY-bh,55+i*8,bh)
        }
      }

      // Dungeon floor/ceiling
      r(0,ceilY,W,4,stage<=2?'#1a1a2a':stage<=5?'#1a1030':'#100820')
      r(0,floorY,W,4,stage<=2?'#1a1a2a':stage<=5?'#1a1030':'#100820')
      // Tile pattern on floor
      for(let tx=(g.scrollX*.5)%48;tx<W;tx+=48){ctx.fillStyle='rgba(255,255,255,.025)';ctx.fillRect(tx,floorY,46,4)}

      // Time slow overlay
      if(g.timeSlowTimer>0){
        ctx.fillStyle=`rgba(0,200,255,${Math.min(.07,g.timeSlowTimer/200*.07)})`;ctx.fillRect(0,0,W,H)
        ctx.fillStyle='#00e5ff44';ctx.font='7px monospace';ctx.textAlign='right'
        ctx.fillText(`⏳ ${Math.ceil(g.timeSlowTimer/60)}s`,W-8,ceilY+14)
      }

      // ── SUMMONS ──
      g.summons.forEach((sm:any,i:number)=>{
        const a=Math.min(1,sm.life/30),bob=Math.sin(g.frame*.1+i)*5
        ctx.globalAlpha=a
        ctx.fillStyle='#00ff4133';ctx.beginPath();ctx.arc(sm.x,sm.y+bob,16,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#00ff41';ctx.beginPath();ctx.arc(sm.x,sm.y+bob,9,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#fff';ctx.font='6px monospace';ctx.textAlign='center';ctx.fillText('fn()',sm.x,sm.y+bob+3)
        ctx.globalAlpha=1
      })

      // ── BULLETS ──
      g.bullets.forEach((b:any)=>{
        ctx.globalAlpha=Math.min(1,b.life/20)
        if(b.type===0){
          const gr=ctx.createLinearGradient(b.x-14,0,b.x,0);gr.addColorStop(0,'transparent');gr.addColorStop(1,'#00e5ff')
          ctx.fillStyle=gr;ctx.fillRect(b.x-14,b.y-3,14,6);ctx.fillStyle='#fff';ctx.fillRect(b.x-3,b.y-2,5,4)
        }else if(b.type===1){
          ctx.fillStyle='#00ff41';ctx.fillRect(b.x-10,b.y-2,12,5);ctx.fillStyle='#00ff4155';ctx.fillRect(b.x-18,b.y-4,12,9)
        }else if(b.type===2){
          ctx.fillStyle='#bf5af2';ctx.beginPath();ctx.arc(b.x,b.y,4,0,Math.PI*2);ctx.fill()
        }else{
          ctx.fillStyle='#ffd700';ctx.fillRect(b.x-5,b.y-5,10,10);ctx.fillStyle='#ffd70044';ctx.fillRect(b.x-8,b.y-8,16,16)
        }
        ctx.globalAlpha=1
      })

      // ── ENEMIES ──
      const ECOLS=['#cc2233','#9933cc','#226699','#cc6600','#cc0066']
      const ELBLS=['BUG','NULL','UNDEF','ERROR','CRASH']
      g.enemies.forEach((e:any)=>{
        const bob=Math.sin(g.frame*.06+e.id*.5)*5*tslFactor
        const col=ECOLS[e.type%ECOLS.length]
        ctx.globalAlpha=e.flash>0?.5+Math.random()*.5:1
        ctx.fillStyle=col+'33';ctx.beginPath();ctx.arc(e.x,e.y+bob,20,0,Math.PI*2);ctx.fill()
        r(e.x-12,e.y+bob-14,24,24,col);r(e.x-10,e.y+bob-12,20,20,col+'cc')
        r(e.x-7,e.y+bob-10,5,5,'#ff0');r(e.x+2,e.y+bob-10,5,5,'#ff0')
        r(e.x-5,e.y+bob-8,3,3,'#000');r(e.x+4,e.y+bob-8,3,3,'#000')
        ctx.fillStyle=col;ctx.font='7px monospace';ctx.textAlign='center';ctx.fillText(ELBLS[e.type%ELBLS.length],e.x,e.y+bob-18)
        const hw=28; r(e.x-hw/2,e.y+bob+14,hw,4,'#1a0008')
        r(e.x-hw/2,e.y+bob+14,Math.floor(hw*(e.hp/e.maxHp)),4,e.hp/e.maxHp>.5?'#00cc44':'#ff4444')
        ctx.globalAlpha=1
      })

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{
        ctx.globalAlpha=Math.max(0,pt.life/40);ctx.fillStyle=pt.col;ctx.fillRect(pt.x-pt.s/2,pt.y-pt.s/2,pt.s,pt.s);ctx.globalAlpha=1
      })

      // ── PLAYER ──
      {
        const px=55,py=playerY,wk=Math.sin(g.frame*.12)*4
        const cc=stage<=1?'#5a8ab0':stage<=3?'#00e5ff':stage<=5?'#bf5af2':'#ffd700'
        if(g.shieldTimer>0){
          const sa=Math.min(.28,g.shieldTimer/60*.28)
          ctx.fillStyle=`rgba(0,229,255,${sa})`;ctx.beginPath();ctx.arc(px,py,28,0,Math.PI*2);ctx.fill()
          ctx.strokeStyle='#00e5ff88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,28,0,Math.PI*2);ctx.stroke()
        }
        if(stage>=3){ctx.fillStyle=cc+'18';ctx.beginPath();ctx.arc(px,py,22,0,Math.PI*2);ctx.fill()}
        r(px-7,py-28,14,13,cc)
        r(px-4,py-26,4,4,'#fff');r(px+1,py-26,4,4,'#fff')
        r(px-3,py-25,2,2,'#000');r(px+2,py-25,2,2,'#000')
        r(px-8,py-15,16,14,cc)
        if(g.attackFlash>0){
          r(px+8,py-14,18,8,cc);ctx.fillStyle=cc+'77';ctx.fillRect(px+24,py-11,W-px-24,4);g.attackFlash--
        }else{r(px-14,py-14+wk,6,10,cc);r(px+8,py-14-wk,6,10,cc)}
        r(px-7,py-1,6,Math.max(4,10+wk*.5),'#555');r(px+1,py-1,6,Math.max(4,10-wk*.5),'#555')
        if(stage>=5){
          ctx.fillStyle=cc+'55'
          for(let i=0;i<3;i++){const a=g.frame*.04+i*Math.PI*2/3;ctx.fillRect(px+Math.cos(a)*22-3,py+Math.sin(a)*12-3,6,6)}
        }
      }

      // ── FLASHES ──
      if(g.attackFlash>20){ctx.fillStyle=`rgba(0,229,255,${(g.attackFlash/30)*.1})`;ctx.fillRect(0,0,W,H)}
      if(g.corruptFlash>0){
        ctx.fillStyle=`rgba(255,45,85,${(g.corruptFlash/32)*.25})`;ctx.fillRect(0,0,W,H)
        if(g.corruptFlash>18){ctx.fillStyle='#ff2d55';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('⚠ LOGIC CORRUPTED',W/2,H*.44)}
        g.corruptFlash--
      }

      // ── HUD ──
      r(0,0,W,ceilY,'rgba(0,0,0,.9)')
      const sc2=stage>=6?'#ffd700':stage>=4?'#bf5af2':stage>=2?'#00e5ff':'#4a6a8a'
      ctx.fillStyle=sc2;ctx.font='bold 9px monospace';ctx.textAlign='left';ctx.fillText(`◆ ${STAGES[stage]}`,8,15)
      // HP
      r(W*.30,4,100,14,'#1a0010');r(W*.30+1,5,Math.floor(98*(g.hp/100)),12,g.hp>50?'#00cc44':g.hp>25?'#ff9900':'#ff2d55')
      ctx.fillStyle='#ffffff55';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('HP',W*.30+3,14)
      // Mana
      r(W*.30+108,4,80,14,'#000820');r(W*.30+109,5,Math.floor(78*(g.mana/100)),12,'#0080ff')
      ctx.fillStyle='#4488ff88';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('MP',W*.30+111,14)
      // Stability
      r(W*.30+196,4,80,14,'#080800');r(W*.30+197,5,Math.floor(78*(g.stability/100)),12,g.stability>60?'#ffe600':'#ff8800')
      ctx.fillStyle='#ffee0066';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('STB',W*.30+199,14)
      // Combo
      if(g.combo>1){ctx.fillStyle='#ffd700';ctx.font='bold 9px monospace';ctx.textAlign='right';ctx.fillText(`×${g.combo} CHAIN`,W-8,15)}
      // Progress bar
      r(0,ceilY-3,W,3,'#111')
      const pCol2=stage<=1?'#2a4080':stage<=3?'#4040c0':stage<=5?'#bf5af2':'#ffd700'
      r(0,ceilY-3,Math.floor(W*(p/total)),3,pCol2)
      // Unlock banner
      if(g.unlockTimer>0&&g.unlockMsg){
        ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(W/2-130,H/2-20,260,34)
        ctx.strokeStyle='#ffd700';ctx.lineWidth=1;ctx.strokeRect(W/2-130,H/2-20,260,34)
        ctx.fillStyle='#ffd700';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(g.unlockMsg,W/2,H/2+4)
      }

      // Scanlines
      ctx.fillStyle='rgba(0,0,0,.04)';for(let y=0;y<H;y+=3) ctx.fillRect(0,y,W,1)

      // ── VICTORY ──
      if(p>=total&&total>0){
        ctx.fillStyle='rgba(0,0,0,.82)';ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle=`rgba(255,215,0,${.12+Math.sin(g.frame*.05)*.05})`;ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#ffd700';ctx.font='bold 15px monospace';ctx.textAlign='center'
        ctx.fillText('👑 CODE MASTER!',W/2,H/2-14)
        ctx.fillStyle='#00ff41';ctx.font='10px monospace';ctx.fillText('Reality controlled by code!',W/2,H/2+6)
        ctx.fillStyle='#00e5ff';ctx.font='9px monospace';ctx.fillText(`×${g.combo} Chain | STB: ${Math.floor(g.stability)}%`,W/2,H/2+22)
      }
    }

    
    // ─── REACT UI RUNNER (React Course) ───
    // Endless runner through a living component world
    const drawAutoCodeRunner=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('acr' in cvs)){
        if(!cvs) return
        cvs.acr={
          nodes:[{id:0,x:W/2,y:H-68,label:'<App/>',col:'#00e5ff',glitch:0,pulse:0,parentId:-1,layer:0}] as any[],
          packets:[] as {x:number;y:number;tx:number;ty:number;t:number;col:string;lbl:string}[],
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string;s:number}[],
          renderCount:0,stateCount:0,combo:0,
          glitchTimer:0,flashTimer:0,flashCol:'#00ff41',flashMsg:'',
          abilityTimer:0,abilityMsg:'',
          frame:0,prevState:'idle' as string,
        }
      }
      const g=cvs.acr
      const p=passedCount,total=Math.max(totalTasks,1),ratio=p/total
      const stage=ratio<.08?0:ratio<.20?1:ratio<.33?2:ratio<.48?3:ratio<.62?4:ratio<.76?5:ratio<.90?6:7
      const STAGES=['IDLE','MOUNTING','STATEFUL','EFFECTED','CONNECTED','CONTEXTUAL','MEMOIZED','REACTIVE']
      const NLBLS=[
        ['<App/>'],
        ['<Header/>','<Main/>','<Footer/>','<Nav/>'],
        ['useState()','<Form/>','<Input/>','useReducer()'],
        ['useEffect()','<Card/>','<List/>','<Item/>'],
        ['useContext()','<Provider/>','<Consumer/>','<Context/>'],
        ['<Button/>','<Modal/>','<Toast/>','<Badge/>'],
        ['useMemo()','useCallback()','useRef()','memo()'],
        ['<Suspense/>','<ErrorBoundary/>','<Lazy/>','<Portal/>'],
      ]
      const NCOLS=['#00e5ff','#00ff88','#bf5af2','#ff9500','#4488ff','#ffd700','#ff2244','#a020ff']
      const layerY=(l:number)=>H-68-l*Math.min(62,Math.floor((H-96)/(Math.max(stage,3)+1)))
      const nodesInLayer=(l:number)=>g.nodes.filter((n:any)=>n.layer===l)
      const reposLayer=(l:number)=>{
        const ln=nodesInLayer(l),cnt=ln.length
        const spr=Math.min(W*.85,cnt*112)
        const sx=W/2-spr/2+spr/(cnt*2)
        ln.forEach((n:any,i:number)=>{n.x=sx+i*(spr/cnt);n.y=layerY(l)})
      }

      const ttl=taskTitle.toLowerCase()
      const isState=ttl.includes('state')||ttl.includes('usestate')
      const isEffect=ttl.includes('effect')||ttl.includes('useeffect')
      const isCtx=ttl.includes('context')||ttl.includes('provider')
      const isHook=ttl.includes('hook')||ttl.includes('usememo')||ttl.includes('useref')
      const isComp=ttl.includes('component')||ttl.includes('jsx')

      // ── STATE TRANSITIONS ──
      if(g.prevState!==state){
        if(state==='correct'){
          g.combo++;g.renderCount++;g.stateCount++
          g.flashTimer=42;g.flashCol='#00ff41';g.flashMsg='COMPONENT MOUNTED ✓'
          const maxL=g.nodes.length>0?Math.max(...g.nodes.map((n:any)=>n.layer)):0
          const cands=maxL>2?g.nodes.filter((n:any)=>n.layer<maxL):g.nodes
          const par=cands[Math.floor(Math.random()*cands.length)]||g.nodes[0]
          const nl=par.layer+1
          const used=new Set(g.nodes.map((n:any)=>n.label))
          const pool=NLBLS[Math.min(nl,NLBLS.length-1)]
          const avail=pool.filter((l:string)=>!used.has(l))
          const lbl=avail.length?avail[0]:pool[g.nodes.length%pool.length]
          const nid=g.nodes.length
          g.nodes.push({id:nid,x:par.x,y:par.y,label:lbl,col:NCOLS[nl%NCOLS.length],glitch:0,pulse:24,parentId:par.id,layer:nl})
          reposLayer(nl)
          const nn=g.nodes[nid]
          g.packets.push({x:par.x,y:par.y,tx:nn.x,ty:nn.y,t:0,col:nn.col,lbl:'mount'})
          for(let i=0;i<16;i++){const a=Math.random()*Math.PI*2,s=2+Math.random()*4;g.particles.push({x:nn.x,y:nn.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:32+Math.random()*20,col:nn.col,s:3})}
          if(isState){g.abilityMsg='useState → STATE SYNC 📦';g.abilityTimer=52}
          else if(isEffect){g.abilityMsg='useEffect → SIDE EFFECT ⚡';g.abilityTimer=52}
          else if(isCtx){g.abilityMsg='Context → DATA FLOW 🌐';g.abilityTimer=52}
          else if(isHook){g.abilityMsg='Hook → OPTIMIZATION 🪝';g.abilityTimer=52}
          else if(isComp){g.abilityMsg='Component → TREE GROWS 🌿';g.abilityTimer=52}
        }
        if(state==='wrong'){
          g.combo=0;g.glitchTimer=55;g.flashTimer=38;g.flashCol='#ff2244';g.flashMsg='RENDER CRASH ✕'
          const nonRoot=g.nodes.filter((n:any)=>n.id!==0)
          if(nonRoot.length>0){const v=nonRoot[Math.floor(Math.random()*nonRoot.length)];v.glitch=55}
          for(let i=0;i<14;i++){const a=Math.random()*Math.PI*2;g.particles.push({x:W*.45+Math.random()*W*.1,y:H*.5,vx:Math.cos(a)*5,vy:Math.sin(a)*5,life:22,col:'#ff2244',s:4})}
        }
        g.prevState=state
      }

      // Auto-spawn data packets along random edges
      if(g.frame%48===0&&g.nodes.length>1){
        const kids=g.nodes.filter((n:any)=>n.parentId>=0)
        const k=kids[Math.floor(Math.random()*kids.length)]
        if(k){
          const par=g.nodes.find((n:any)=>n.id===k.parentId)
          if(par){
            const dir=Math.random()<.5,fN=dir?par:k,tN=dir?k:par
            const pc=['#00e5ff','#00ff88','#bf5af2','#ffd700'],pl=['props','state','event','data']
            const pi=g.frame%4
            g.packets.push({x:fN.x,y:fN.y,tx:tN.x,ty:tN.y,t:0,col:pc[pi],lbl:pl[pi]})
          }
        }
      }

      // ── UPDATE ──
      g.packets.forEach((pk:any)=>{pk.t+=0.028+stage*.003})
      g.packets=g.packets.filter((pk:any)=>pk.t<1)
      g.particles.forEach((pt:any)=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.1;pt.life--})
      g.particles=g.particles.filter((pt:any)=>pt.life>0)
      g.nodes.forEach((n:any)=>{if(n.glitch>0)n.glitch--;if(n.pulse>0)n.pulse--})
      if(g.flashTimer>0)g.flashTimer--
      if(g.glitchTimer>0)g.glitchTimer--
      if(g.abilityTimer>0)g.abilityTimer--
      g.frame++

      // ══ DRAW ══════════════════════════════════
      const sky=ctx.createLinearGradient(0,0,0,H)
      if(stage<=1){sky.addColorStop(0,'#05050e');sky.addColorStop(1,'#0a0a1a')}
      else if(stage<=3){sky.addColorStop(0,'#040614');sky.addColorStop(1,'#08081e')}
      else if(stage<=5){sky.addColorStop(0,'#040416');sky.addColorStop(1,'#080826')}
      else{sky.addColorStop(0,'#04041a');sky.addColorStop(1,'#07062c')}
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H)

      // Grid
      if(stage>=2){
        ctx.strokeStyle=`rgba(0,180,255,${.025+stage*.003})`;ctx.lineWidth=.5
        for(let x=0;x<W;x+=42){ctx.beginPath();ctx.moveTo(x,26);ctx.lineTo(x,H);ctx.stroke()}
        for(let y=26;y<H;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      }
      // Glitch scanlines
      if(g.glitchTimer>0){
        for(let i=0;i<4;i++){const gy=Math.random()*H;ctx.fillStyle=`rgba(255,30,80,${g.glitchTimer/55*.28})`;ctx.fillRect((Math.random()-.5)*20,gy,W,2+Math.random()*4)}
      }

      // ── EDGES ──
      g.nodes.forEach((child:any)=>{
        if(child.parentId<0) return
        const par=g.nodes.find((n:any)=>n.id===child.parentId)
        if(!par) return
        const isG=child.glitch>0||par.glitch>0
        ctx.strokeStyle=isG?`rgba(255,30,80,${.4+Math.sin(g.frame*.3)*.2})`:`rgba(0,229,255,${.12+stage*.022})`
        ctx.lineWidth=isG?1.5:1;ctx.setLineDash(isG?[4,4]:[])
        ctx.beginPath();ctx.moveTo(par.x,par.y+12);ctx.lineTo(child.x,child.y-12);ctx.stroke()
        ctx.setLineDash([])
      })

      // ── PACKETS ──
      g.packets.forEach((pk:any)=>{
        const t=Math.min(pk.t,1),px2=pk.x+(pk.tx-pk.x)*t,py2=pk.y+(pk.ty-pk.y)*t
        ctx.fillStyle=pk.col+'44';ctx.beginPath();ctx.arc(px2,py2,8,0,Math.PI*2);ctx.fill()
        ctx.fillStyle=pk.col;ctx.beginPath();ctx.arc(px2,py2,3.5,0,Math.PI*2);ctx.fill()
        ctx.fillStyle=pk.col+'cc';ctx.font='6px monospace';ctx.textAlign='center';ctx.fillText(pk.lbl,px2,py2-11)
      })

      // ── NODES ──
      g.nodes.forEach((n:any)=>{
        const isG=n.glitch>0
        const glow=n.pulse>0?n.pulse/24:.12+Math.sin(g.frame*.04+n.id*.7)*.07
        const nw=Math.max(52,n.label.length*6+18),nh=22
        const nx=n.x-nw/2,ny=n.y-nh/2
        if(isG){
          ctx.fillStyle=`rgba(255,30,80,${.55+Math.sin(g.frame*.5)*.25})`
          ctx.fillRect(nx+(Math.random()-.5)*5,ny,nw,nh)
          ctx.strokeStyle='#ff2244';ctx.lineWidth=1.5;ctx.strokeRect(nx,ny,nw,nh)
          ctx.fillStyle='#ff2244aa';ctx.font='7px monospace';ctx.textAlign='center';ctx.fillText('unmounted',n.x,n.y+4)
        } else {
          ctx.fillStyle=n.col+Math.floor(glow*.55*255).toString(16).padStart(2,'0')+'22'
          ctx.fillRect(nx-5,ny-5,nw+10,nh+10)
          ctx.fillStyle='#080818';ctx.fillRect(nx,ny,nw,nh)
          ctx.strokeStyle=n.col+Math.floor((.35+glow*.65)*255).toString(16).padStart(2,'0')
          ctx.lineWidth=n.id===0?2:1.2;ctx.strokeRect(nx,ny,nw,nh)
          ctx.fillStyle=n.col+Math.floor(.75*255).toString(16).padStart(2,'0');ctx.fillRect(nx,ny,nw,2)
          ctx.fillStyle=n.id===0?'#ffffff':n.col
          ctx.font=`${n.id===0?'bold ':''}7px monospace`;ctx.textAlign='center';ctx.fillText(n.label,n.x,n.y+4)
          ctx.fillStyle=n.col;ctx.fillRect(nx,ny,3,3);ctx.fillRect(nx+nw-3,ny,3,3)
        }
      })

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{ctx.globalAlpha=Math.max(0,pt.life/50);ctx.fillStyle=pt.col;ctx.fillRect(pt.x-pt.s/2,pt.y-pt.s/2,pt.s,pt.s);ctx.globalAlpha=1})

      // Flash overlay
      if(g.flashTimer>0){
        const fa=g.flashTimer/42
        ctx.fillStyle=g.flashCol+Math.floor(fa*.22*255).toString(16).padStart(2,'0');ctx.fillRect(0,26,W,H-26)
        if(g.flashTimer>22){ctx.fillStyle=g.flashCol;ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText(g.flashMsg,W/2,H*.44)}
      }
      // Ability toast
      if(g.abilityTimer>0&&g.abilityMsg){
        ctx.fillStyle='rgba(0,0,0,.9)';ctx.fillRect(W/2-140,H*.74-16,280,28)
        ctx.strokeStyle='#00e5ff';ctx.lineWidth=1;ctx.strokeRect(W/2-140,H*.74-16,280,28)
        ctx.fillStyle='#00e5ff';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(g.abilityMsg,W/2,H*.74+2)
      }

      // ── HUD ──
      r(0,0,W,26,'rgba(0,0,0,.9)')
      const sc4=stage>=6?'#a020ff':stage>=4?'#bf5af2':stage>=2?'#00e5ff':'#4a6a8a'
      ctx.fillStyle=sc4;ctx.font='bold 9px monospace';ctx.textAlign='left';ctx.fillText(`⚛ ${STAGES[stage]}`,8,16)
      r(W*.3,4,54,16,'#000820');ctx.fillStyle='#00e5ff88';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('REND',W*.3+3,15)
      ctx.fillStyle='#00e5ff';ctx.font='bold 9px monospace';ctx.textAlign='right';ctx.fillText(`${g.renderCount}`,W*.3+50,15)
      r(W*.3+62,4,54,16,'#100820');ctx.fillStyle='#bf5af288';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('STAT',W*.3+65,15)
      ctx.fillStyle='#bf5af2';ctx.font='bold 9px monospace';ctx.textAlign='right';ctx.fillText(`${g.stateCount}`,W*.3+112,15)
      r(W*.3+124,4,60,16,'#002010');ctx.fillStyle='#00ff8888';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('COMP',W*.3+127,15)
      ctx.fillStyle='#00ff88';ctx.font='bold 9px monospace';ctx.textAlign='right';ctx.fillText(`${g.nodes.length}`,W*.3+180,15)
      if(g.combo>1){ctx.fillStyle='#ffd700';ctx.font='bold 9px monospace';ctx.textAlign='right';ctx.fillText(`×${g.combo} COMBO`,W-8,16)}
      r(0,22,W,4,'#111');r(0,22,Math.floor(W*(p/total)),4,stage<=2?'#00e5ff':stage<=5?'#bf5af2':'#a020ff')
      ctx.fillStyle='rgba(0,0,0,.04)';for(let y=0;y<H;y+=3) ctx.fillRect(0,y,W,1)

      if(p>=total&&total>0){
        ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle=`rgba(0,229,255,${.08+Math.sin(g.frame*.05)*.05})`;ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#00e5ff';ctx.font='bold 15px monospace';ctx.textAlign='center';ctx.fillText('⚛ REACT TREE COMPLETE!',W/2,H/2-18)
        ctx.fillStyle='#00ff88';ctx.font='10px monospace';ctx.fillText(`${g.nodes.length} Components | ${g.renderCount} Renders | ${g.stateCount} States`,W/2,H/2+4)
        ctx.fillStyle='#ffd700';ctx.font='9px monospace';ctx.fillText('Full reactive application built!',W/2,H/2+22)
      }
    }

    
    // ─── AUTOMATION FACTORY (Backend Course) ───
    const drawOnlineCodeFactory=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('ocf' in cvs)){
        if(!cvs) return
        cvs.ocf={
          serverLoad:30, prodSpeed:1.0, efficiency:85, integrity:90,
          boost:0, overloadTimer:0, repairFlash:0, corruptFlash:0, combo:0,
          machines:[] as {x:number;type:number;broken:boolean;procTimer:number}[],
          packets:[] as {x:number;y:number;type:string;speed:number;id:number;col:string;stuck:number}[],
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string;s:number}[],
          frame:0, prevState:'idle' as string, prevPassed:-1,
        }
      }
      const g=cvs.ocf
      const p=passedCount, total=Math.max(totalTasks,1), ratio=p/total
      const stage=ratio<.08?0:ratio<.20?1:ratio<.33?2:ratio<.48?3:ratio<.62?4:ratio<.76?5:ratio<.90?6:7
      const STAGES=['MACHINE ROOM','WORKSHOP','FACTORY','DATA CENTER','SERVER GRID','CLUSTER','CLOUD','MEGA FACTORY']
      const mCount=Math.min(stage+2,7)
      const ML=70, MR=W-70
      const PIPE_Y=Math.floor(H*.52)
      const FLOOR_Y=Math.floor(H*.80)

      // Task type detection
      const ttl=taskTitle.toLowerCase()
      const isApiTask =ttl.includes('api')||ttl.includes('route')||ttl.includes('endpoint')
      const isDbTask  =ttl.includes('database')||ttl.includes('db')||ttl.includes('mongodb')
      const isOptTask =ttl.includes('optim')||ttl.includes('cache')||ttl.includes('perf')
      const isAuthTask=ttl.includes('auth')||ttl.includes('jwt')||ttl.includes('token')
      const isMwTask  =ttl.includes('middleware')||ttl.includes('async')||ttl.includes('error')

      // Build machine slots
      while(g.machines.length<mCount) g.machines.push({x:0,type:g.machines.length,broken:false,procTimer:0})
      const mxArr:number[]=[]
      for(let mi=0;mi<mCount;mi++) mxArr.push(ML+(MR-ML)*(mi/Math.max(mCount-1,1)))
      g.machines.slice(0,mCount).forEach((m:any,mi:number)=>{ m.x=mxArr[mi] })

      // ── STATE TRANSITIONS ──
      if(g.prevState!==state){
        if(state==='correct'){
          g.combo++; g.repairFlash=34
          const brk=g.machines.slice(0,mCount).find((m:any)=>m.broken)
          if(brk) brk.broken=false
          g.prodSpeed=Math.min(2.8,g.prodSpeed+0.5); g.boost=90
          g.efficiency=Math.min(100,g.efficiency+10)
          g.serverLoad=Math.max(0,g.serverLoad-15)
          if(isApiTask) g.machines.slice(0,mCount).forEach((m:any)=>{ m.broken=false })
          if(isDbTask){ g.prodSpeed=Math.min(2.8,g.prodSpeed+0.5); g.boost=130 }
          if(isOptTask){ g.serverLoad=Math.max(0,g.serverLoad-18); g.overloadTimer=0 }
          if(isMwTask) g.packets=g.packets.filter((pk:any)=>pk.type!=='HACK')
          for(let pi=0;pi<14;pi++){
            const a=Math.random()*Math.PI*2
            g.particles.push({x:W*.5,y:PIPE_Y,vx:Math.cos(a)*3.5,vy:Math.sin(a)*3-1.5,life:38,col:['#00ff41','#00e5ff','#ffd700'][pi%3],s:3+Math.random()*3})
          }
        }
        if(state==='wrong'){
          g.combo=0; g.corruptFlash=24
          g.serverLoad=Math.min(100,g.serverLoad+20)
          g.efficiency=Math.max(10,g.efficiency-12)
          g.integrity=Math.max(10,g.integrity-9)
          const ok=g.machines.slice(0,mCount).filter((m:any)=>!m.broken&&m.type<mCount-1)
          if(ok.length) ok[Math.floor(Math.random()*ok.length)].broken=true
          g.packets.push({x:-22,y:PIPE_Y,type:'HACK',speed:1.6,id:Date.now(),col:'#ff0040',stuck:0})
          if(g.serverLoad>65) g.overloadTimer=100
        }
        g.prevState=state
      }
      if(g.prevPassed!==p){ g.prevPassed=p; g.integrity=Math.min(100,g.integrity+5) }

      // ── UPDATE ──
      const spd=g.boost>0?g.prodSpeed*1.6:g.prodSpeed
      if(g.boost>0) g.boost--
      if(g.repairFlash>0) g.repairFlash--
      if(g.corruptFlash>0) g.corruptFlash--
      if(g.overloadTimer>0) g.overloadTimer--
      if(g.frame%100===0) g.serverLoad=Math.max(Math.max(8,stage*7),g.serverLoad-3)
      if(g.frame%200===0) g.prodSpeed=Math.max(1.0,g.prodSpeed-.04)

      // Spawn packets
      const spRate=Math.max(24,85-stage*9-Math.floor(g.prodSpeed*4))
      if(g.frame%spRate===0){
        const pool=['GET','POST','PUT','DB','AUTH'].slice(0,Math.min(2+stage,5))
        const pt=pool[Math.floor(Math.random()*pool.length)]
        const pc:Record<string,string>={GET:'#00e5ff',POST:'#00ff41',PUT:'#ffe600',DB:'#bf5af2',AUTH:'#ff9500',HACK:'#ff0040'}
        g.packets.push({x:-22,y:PIPE_Y,type:pt,speed:(0.9+stage*.14)*spd*.7,id:Date.now()+Math.random()*999,col:pc[pt]||'#888',stuck:0})
      }
      // Move packets
      g.packets.forEach((pk:any)=>{
        const blk=g.machines.slice(0,mCount).find((m:any)=>m.broken&&m.x>pk.x&&m.x<pk.x+55)
        if(blk){ pk.stuck=Math.min(pk.stuck+1,20); pk.x+=pk.speed*.25 }
        else{ pk.stuck=Math.max(0,pk.stuck-1); pk.x+=pk.speed }
        if(pk.type==='HACK'&&g.frame%55===0&&pk.x>0&&pk.x<W) g.serverLoad=Math.min(100,g.serverLoad+2)
      })
      g.packets=g.packets.filter((pk:any)=>pk.x<W+28).slice(-28)

      // Machine proc timers
      g.machines.slice(0,mCount).forEach((m:any)=>{ if(!m.broken) m.procTimer=(m.procTimer+1)%120 })

      // Particles
      g.particles.forEach((pt:any)=>{ pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=.07; pt.life--; pt.vx*=.94 })
      g.particles=g.particles.filter((pt:any)=>pt.life>0)
      g.frame++

      // ── DRAW ──
      // Background
      const factBg=ctx.createLinearGradient(0,0,0,H)
      factBg.addColorStop(0,'#020a06'); factBg.addColorStop(.5,'#031008'); factBg.addColorStop(1,'#020a05')
      ctx.fillStyle=factBg; ctx.fillRect(0,0,W,H)

      // Grid
      ctx.strokeStyle='rgba(0,255,65,.033)'; ctx.lineWidth=1
      for(let ix=0;ix<W;ix+=46){ctx.beginPath();ctx.moveTo(ix,0);ctx.lineTo(ix,H);ctx.stroke()}
      for(let iy=0;iy<H;iy+=34){ctx.beginPath();ctx.moveTo(0,iy);ctx.lineTo(W,iy);ctx.stroke()}

      // Overload screen flash
      if(g.overloadTimer>0){
        ctx.fillStyle=`rgba(255,80,0,${Math.sin(g.overloadTimer*.18)*.07+.025})`
        ctx.fillRect(0,26,W,H-26)
      }

      // Floor
      r(0,FLOOR_Y,W,3,'#051405')
      ctx.strokeStyle='#0a2010'; ctx.lineWidth=1
      for(let ix=0;ix<W;ix+=18){ctx.beginPath();ctx.moveTo(ix,FLOOR_Y);ctx.lineTo(ix,FLOOR_Y+8);ctx.stroke()}

      // Stage BG text
      ctx.fillStyle='rgba(0,255,65,.024)'
      ctx.font=`bold ${36+stage*3}px monospace`; ctx.textAlign='center'
      ctx.fillText(STAGES[stage],W/2,H*.73)

      // ── PIPELINE TUBE ──
      r(ML-24,PIPE_Y-7,MR-ML+48,14,'#020c04')
      ctx.strokeStyle='#0a2812'; ctx.lineWidth=1; ctx.strokeRect(ML-24,PIPE_Y-7,MR-ML+48,14)
      r(ML-24,PIPE_Y-7,MR-ML+48,2,'#0d3018')
      const integFill=g.integrity>70?'#00ff4120':g.integrity>40?'#ffe60018':'#ff004015'
      r(ML-24,PIPE_Y-6,Math.floor((MR-ML+48)*(g.integrity/100)),11,integFill)

      // ── MACHINES ──
      const MLBLS=['INPUT','CPU','ROUTER','DB','AUTH','CACHE','CLOUD']
      const MCOLS=['#00e5ff','#00ff41','#ffe600','#bf5af2','#ff9500','#00ffaa','#4488ff']
      g.machines.slice(0,mCount).forEach((m:any,mi:number)=>{
        const mx=m.x, mc=MCOLS[m.type%7]
        const bw=44,bh=44,bx=mx-22,by=FLOOR_Y-62
        const broken=m.broken
        const glow=broken?0:.08+Math.sin(g.frame*.07+mi)*.04
        const active=!broken&&g.packets.some((pk:any)=>Math.abs(pk.x-mx)<35)

        // Glow halo
        if(!broken){
          ctx.fillStyle=`${mc}${Math.floor(glow*200).toString(16).padStart(2,'0')}`
          ctx.beginPath(); ctx.arc(mx,by+22,26,0,Math.PI*2); ctx.fill()
        }
        // Body casing
        r(bx-2,by-2,bw+4,bh+4,broken?'#1a0404':'#061206')
        r(bx,by,bw,bh,broken?'#1c0606':active?'#081c08':'#070e07')
        ctx.strokeStyle=broken?`#330d0d${g.frame%12<5?'ff':'55'}`:active?mc+'aa':mc+'44'
        ctx.lineWidth=broken?2:1.5; ctx.strokeRect(bx,by,bw,bh)
        if(g.repairFlash>0&&!broken){ctx.fillStyle=`rgba(0,255,65,${g.repairFlash*.018})`;ctx.fillRect(bx,by,bw,bh)}

        // Internal detail by type
        if(!broken){
          const tp=m.type%7
          if(tp===0){
            ctx.fillStyle=mc+'88'; ctx.font='10px monospace'; ctx.textAlign='center'
            ctx.fillText('▶▶',mx,by+28)
          } else if(tp===1){
            for(let ci=0;ci<3;ci++) for(let cj=0;cj<3;cj++)
              r(bx+4+ci*13,by+4+cj*13,10,10,((m.procTimer+ci*3+cj)%9<5)?mc+'55':'#060e06')
          } else if(tp===2){
            ctx.strokeStyle=mc+'55'; ctx.lineWidth=1.5
            ctx.beginPath(); ctx.moveTo(mx,by+4); ctx.lineTo(mx,by+22); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(mx,by+22); ctx.lineTo(bx+8,by+bh-4); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(mx,by+22); ctx.lineTo(bx+bw-8,by+bh-4); ctx.stroke()
          } else if(tp===3){
            for(let ri=0;ri<4;ri++){
              ctx.strokeStyle=mc+(ri%2===0?'77':'33')
              ctx.beginPath(); ctx.ellipse(mx,by+8+ri*8,12,4,0,0,Math.PI*2); ctx.stroke()
            }
          } else if(tp===4){
            ctx.strokeStyle=mc+'77'; ctx.lineWidth=2
            ctx.beginPath(); ctx.arc(mx,by+14,8,Math.PI,0); ctx.stroke()
            r(mx-7,by+13,14,12,'#070e07'); ctx.strokeRect(mx-7,by+13,14,12)
            r(mx-2,by+17,4,5,mc+'99')
          } else {
            for(let ri=0;ri<3;ri++){
              r(bx+4,by+4+ri*13,bw-8,10,mc+((ri===Math.floor(m.procTimer/40)%3)?'44':'15'))
              r(bx+6,by+8+ri*13,4,4,mc+(g.frame%(6-ri*2)===0?'ff':'22'))
            }
          }
        } else {
          ctx.strokeStyle=`#ff0040${g.frame%10<4?'cc':'55'}`; ctx.lineWidth=2.5
          ctx.beginPath(); ctx.moveTo(bx+7,by+7); ctx.lineTo(bx+bw-7,by+bh-7); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(bx+bw-7,by+7); ctx.lineTo(bx+7,by+bh-7); ctx.stroke()
          if(g.frame%12<4){ctx.fillStyle='#ff2244';ctx.font='7px monospace';ctx.textAlign='center';ctx.fillText('ERR',mx,by+bh+10)}
        }
        // LED
        r(mx-3,by-8,6,5,!broken&&m.procTimer%8<5?mc:'#080808')
        // Label
        ctx.fillStyle=broken?'#440a0a':mc+'99'; ctx.font='6px monospace'; ctx.textAlign='center'
        ctx.fillText(MLBLS[m.type%7],mx,by-11)
        // Vertical connector machine → pipe
        ctx.strokeStyle=(broken?'#330a0a':mc)+'33'; ctx.lineWidth=2; ctx.setLineDash([2,5])
        ctx.beginPath(); ctx.moveTo(mx,by+bh); ctx.lineTo(mx,PIPE_Y-7); ctx.stroke()
        ctx.setLineDash([])
        r(mx-4,PIPE_Y-5,8,9,broken?'#330a0a':mc+'55')
      })

      // ── PACKETS ──
      g.packets.forEach((pk:any)=>{
        const pc=pk.col,pw=20,ph=10
        const bob=Math.sin(g.frame*.11+pk.id*.001)*2
        ctx.fillStyle=pc+'15'; ctx.fillRect(pk.x-pw-8,PIPE_Y-ph/2+bob,pw+8,ph)
        r(pk.x-pw/2,PIPE_Y-ph/2+bob,pw,ph,pc+'20')
        ctx.strokeStyle=pk.type==='HACK'?pc+'ee':pc+'77'
        ctx.lineWidth=pk.type==='HACK'?2:1; ctx.strokeRect(pk.x-pw/2,PIPE_Y-ph/2+bob,pw,ph)
        ctx.fillStyle=pc; ctx.font='bold 6px monospace'; ctx.textAlign='center'
        ctx.fillText(pk.type.slice(0,3),pk.x,PIPE_Y+bob+3)
        if(pk.type==='HACK'&&g.frame%5<2){ctx.fillStyle='#ff004030';ctx.fillRect(pk.x-pw/2,PIPE_Y-ph/2+bob,pw,ph)}
        if(pk.stuck>5){ctx.fillStyle='rgba(255,120,0,.12)';ctx.fillRect(pk.x-pw/2-4,PIPE_Y-ph/2+bob-4,pw+8,ph+8)}
      })

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{
        const al=Math.floor(Math.max(0,(pt.life/38)*255)).toString(16).padStart(2,'0')
        ctx.fillStyle=pt.col+al; ctx.fillRect(pt.x-pt.s/2,pt.y-pt.s/2,pt.s,pt.s)
      })

      // Flashes
      if(g.repairFlash>0){ctx.fillStyle=`rgba(0,255,65,${g.repairFlash*.004})`;ctx.fillRect(0,26,W,H-26)}
      if(g.corruptFlash>0){ctx.fillStyle=`rgba(255,0,64,${g.corruptFlash*.006})`;ctx.fillRect(0,26,W,H-26)}

      // ── HUD ──
      r(0,0,W,26,'rgba(0,0,0,.88)')
      // Stage label left
      ctx.fillStyle='#00ff4177'; ctx.font='bold 8px monospace'; ctx.textAlign='left'
      ctx.fillText(`⚙ ${STAGES[stage]}`,8,16)
      // LOAD bar (high = bad)
      const lc=g.serverLoad>74?'#ff0040':g.serverLoad>49?'#ff9500':'#00ff41'
      r(162,5,88,16,'#071007'); r(163,6,Math.floor(86*(g.serverLoad/100)),14,lc)
      ctx.fillStyle='#2a4a2a'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.fillText('LOAD',165,15)
      ctx.fillStyle=lc; ctx.textAlign='right'; ctx.fillText(`${Math.ceil(g.serverLoad)}%`,248,15)
      // EFFIC bar
      r(258,5,78,16,'#071007'); r(259,6,Math.floor(76*(g.efficiency/100)),14,'#00e5ff')
      ctx.fillStyle='#2a4a2a'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.fillText('EFFC',262,15)
      ctx.fillStyle='#00e5ff'; ctx.textAlign='right'; ctx.fillText(`${Math.ceil(g.efficiency)}%`,334,15)
      // INTEG bar
      const ic=g.integrity>69?'#00ff88':g.integrity>39?'#ffe600':'#ff2244'
      r(344,5,78,16,'#071007'); r(345,6,Math.floor(76*(g.integrity/100)),14,ic)
      ctx.fillStyle='#2a4a2a'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.fillText('INTG',348,15)
      ctx.fillStyle=ic; ctx.textAlign='right'; ctx.fillText(`${Math.ceil(g.integrity)}%`,420,15)
      // Combo
      if(g.combo>1){ctx.fillStyle='#ffd700';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText(`×${g.combo} COMBO`,W/2,16)}
      // Progress bar
      r(0,22,W,4,'#020a04')
      const pgc=stage>=6?'#ff00ff':stage>=4?'#4488ff':stage>=2?'#00e5ff':'#00ff41'
      r(0,22,Math.floor(W*(p/total)),4,pgc)
      // Task count right
      ctx.fillStyle='#1a4a2a'; ctx.font='bold 8px monospace'; ctx.textAlign='right'
      ctx.fillText(`${p}/${total}`,W-8,16)

      // Overload warning blinking
      if(g.overloadTimer>0&&g.frame%14<7){
        ctx.fillStyle='rgba(0,0,0,.88)'; ctx.fillRect(W/2-115,H*.35,230,32)
        ctx.strokeStyle='#ff9500'; ctx.lineWidth=1; ctx.strokeRect(W/2-115,H*.35,230,32)
        ctx.fillStyle='#ff9500'; ctx.font='bold 10px monospace'; ctx.textAlign='center'
        ctx.fillText('⚠ SERVER OVERLOAD!',W/2,H*.35+21)
      }

      // Repair flash message
      if(g.repairFlash>22){
        const rmsg=isApiTask?'API REPAIR → ALL MACHINES RESTARTED':
                   isDbTask?'DB SYNC → PRODUCTION SPEED UP':
                   isOptTask?'OPTIMIZATION → LOAD REDUCED':
                   isAuthTask?'AUTH FIXED → SECURE MODE':
                   isMwTask?'MIDDLEWARE OK → PACKETS CLEARED':
                   'TASK SOLVED → SYSTEM OPTIMIZED'
        ctx.fillStyle=`rgba(0,255,65,${(g.repairFlash-22)*.055})`
        ctx.font='bold 9px monospace'; ctx.textAlign='center'
        ctx.fillText(rmsg,W/2,H*.30)
      }
    }

    
    // ─── TACTICAL AUTO BATTLE (Advanced JS Course) ───
    // Army vs enemy waves: task solutions = combat strategy abilities
    const drawTaskBattleSurvival=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('tbs' in cvs)){
        if(!cvs) return
        cvs.tbs={
          // Player side
          morale:100, energy:60, rage:0,
          kills:0, combo:0, critChain:0,
          // Units (allied)
          units:[] as {x:number;y:number;hp:number;maxHp:number;type:number;vx:number;target:any;atkTimer:number;id:number}[],
          // Enemies
          enemies:[] as {x:number;y:number;hp:number;maxHp:number;type:number;vx:number;id:number;flash:number}[],
          // Projectiles
          projectiles:[] as {x:number;y:number;vx:number;vy:number;dmg:number;side:number;type:number;life:number;id:number}[],
          // FX
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string;s:number}[],
          explosions:[] as {x:number;y:number;r:number;maxR:number;life:number;col:string}[],
          // State
          scrollX:0,
          prevState:'idle' as string, prevPassed:-1, frame:0, spawnTimer:80,
          // Flash timers
          victoryFlash:0, corruptFlash:0, abilityTimer:0, abilityMsg:'',
          // Special
          timeSlowTimer:0, bossActive:false, bossHp:0, bossMaxHp:0,
        }
        // Seed starting unit
        cvs.tbs.units.push({x:120,y:0,hp:30,maxHp:30,type:0,vx:0,target:null,atkTimer:0,id:1})
      }
      const g=cvs.tbs

      // On state change
      const p=passedCount, total=Math.max(totalTasks,1), ratio=p/total
      const tsl=g.timeSlowTimer>0?.35:1
      const BATTLE_LINE=W*.42  // divide: player side left | enemy side right
      const stage=ratio<.08?0:ratio<.20?1:ratio<.33?2:ratio<.48?3:ratio<.62?4:ratio<.76?5:ratio<.90?6:7
      const STAGES=['RECRUIT','SOLDIER','COMMANDER','TACTICIAN','WARLORD','GENERAL','LEGEND','WAR GOD']

      // Task type detection
      const ttl=taskTitle.toLowerCase()
      const isObjTask  =ttl.includes('object')||ttl.includes('{}')
      const isClassTask=ttl.includes('class')||ttl.includes('extends')||ttl.includes('new ')
      const isAsyncTask=ttl.includes('async')||ttl.includes('promise')||ttl.includes('await')
      const isRandTask =ttl.includes('random')||ttl.includes('math.')||ttl.includes('crit')
      const isAITask   =ttl.includes('ai')||ttl.includes('collision')||ttl.includes('physics')

      // ── UNIT / ABILITY TYPES ──
      // 0: Soldier  1: Archer  2: Mage  3: Elite  4: Tank
      const UCOLS =['#00e5ff','#00ff88','#bf5af2','#ffd700','#ff9500']
      const ULBLS =['SLD','ARC','MGE','ELIT','TANK']
      // Enemy types: 0: Grunt 1: Berserker 2: Sniper 3: Boss
      const ECOLS2=['#cc2233','#cc6600','#6600cc','#ff0044']
      const ELBLS2=['GNT','BSK','SNP','BOSS']

      // ── STATE TRANSITIONS ──
      if(g.prevState!==state){
        if(state==='correct'){
          g.victoryFlash=35; g.combo++; g.morale=Math.min(100,g.morale+10)
          g.energy=Math.min(100,g.energy+18); g.rage=Math.min(100,g.rage+15)
          g.kills+=g.enemies.length

          // Destroy all current enemies with explosions
          g.enemies.forEach((e:any)=>{
            for(let i=0;i<16;i++){
              const a=Math.random()*Math.PI*2,s=3+Math.random()*4
              g.particles.push({x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:35+Math.random()*20,col:['#ff4444','#ff8800','#ffe600','#ff0066'][i%4],s:3+Math.random()*3})
            }
            g.explosions.push({x:e.x,y:e.y,r:0,maxR:35,life:20,col:ECOLS2[e.type%ECOLS2.length]})
          })
          g.enemies=[]

          // Spawn ability based on task type
          if(isObjTask&&stage>=1){
            // Object → summon standard unit
            const ut=Math.floor(Math.random()*2)
            g.units.push({x:40+Math.random()*80,y:H*.3+Math.random()*(H*.4),hp:20+stage*5,maxHp:20+stage*5,type:ut,vx:0,target:null,atkTimer:0,id:Date.now()})
            g.abilityMsg='{ } OBJECT → UNIT SUMMONED'; g.abilityTimer=45
          } else if(isClassTask&&stage>=2){
            // Class → elite warrior
            g.units.push({x:50+Math.random()*60,y:H*.35+Math.random()*(H*.3),hp:40+stage*8,maxHp:40+stage*8,type:3,vx:0,target:null,atkTimer:0,id:Date.now()})
            g.abilityMsg='class ELITE → WARRIOR FORGED'; g.abilityTimer=45
          } else if(isAsyncTask&&stage>=3){
            // Async → time slow
            g.timeSlowTimer=200; g.abilityMsg='async/await → TIME WARP'; g.abilityTimer=45
          } else if(isRandTask&&stage>=4){
            // Random → critical chain: all units deal ×3 dmg next shots
            g.critChain=5; g.abilityMsg='Math.random() → CRIT ×3'; g.abilityTimer=45
          } else if(isAITask&&stage>=5){
            // AI/Physics → summon tank + heal morale
            g.units.push({x:30+Math.random()*50,y:H*.4+Math.random()*(H*.2),hp:60+stage*10,maxHp:60+stage*10,type:4,vx:0,target:null,atkTimer:0,id:Date.now()})
            g.morale=Math.min(100,g.morale+25); g.abilityMsg='AI.fix() → TANK DEPLOYED'; g.abilityTimer=45
          } else {
            // Default: shoot volley from all units + critical burst
            g.units.forEach((u:any)=>{
              g.projectiles.push({x:u.x+12,y:u.y,vx:5+Math.random()*3,vy:(Math.random()-.5),dmg:(g.critChain>0?12:5)+stage,side:0,type:0,life:50,id:Date.now()})
            })
            if(g.critChain>0) g.critChain--
          }

          for(let i=0;i<14;i++){
            const a=Math.random()*Math.PI*2,s=2+Math.random()*4
            g.particles.push({x:BATTLE_LINE,y:H*.4+Math.random()*H*.2,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:30+Math.random()*20,col:['#00ff41','#ffd700','#00e5ff'][i%3],s:3})
          }
        }
        if(state==='wrong'){
          g.corruptFlash=32; g.combo=0; g.morale=Math.max(0,g.morale-20)
          g.energy=Math.max(0,g.energy-12)
          // Boss invasion on wrong at later stages
          if(stage>=4&&!g.bossActive&&Math.random()<.4){
            const bh=80+stage*20; g.bossHp=bh; g.bossMaxHp=bh; g.bossActive=true
            g.abilityMsg='⚠ BOSS INVASION!'; g.abilityTimer=50
          }
          // Extra enemy wave
          for(let i=0;i<3;i++){
            const et=Math.min(stage,3)
            const eh=10+p*.8; g.enemies.push({x:W-20-i*40,y:H*.25+Math.random()*(H*.5),hp:eh,maxHp:eh,type:et,vx:-(0.9+p*.04)*tsl,id:Date.now()+i,flash:0})
          }
          // Hurt weakest unit
          if(g.units.length>0){
            const weak=g.units.reduce((a:any,b:any)=>a.hp<b.hp?a:b)
            weak.hp=Math.max(0,weak.hp-15)
          }
          for(let i=0;i<12;i++){
            const a=Math.random()*Math.PI*2
            g.particles.push({x:BATTLE_LINE,y:H/2,vx:Math.cos(a)*4,vy:Math.sin(a)*4,life:25,col:'#ff2d55',s:4})
          }
        }
        g.prevState=state
      }

      // ── PREV PASSED TRACKER: bonus unit on new task ──
      if(g.prevPassed!==p){
        g.prevPassed=p
        if(p>0&&g.units.length<4+stage){
          const ut=Math.min(stage,4)
          g.units.push({x:20+Math.random()*80,y:H*.3+Math.random()*(H*.4),hp:15+stage*6,maxHp:15+stage*6,type:ut%5,vx:0,target:null,atkTimer:0,id:Date.now()})
        }
      }

      // ── TIMER UPDATES ──
      if(g.timeSlowTimer>0) g.timeSlowTimer--
      if(g.abilityTimer>0) g.abilityTimer--

      // Auto-spawn enemies
      g.spawnTimer-=tsl
      if(g.spawnTimer<=0&&stage>=1){
        g.spawnTimer=Math.max(50,180-p*8)
        const et=Math.min(Math.floor(Math.random()*(stage+1)),3)
        const eh=8+p*.8
        g.enemies.push({x:W-15,y:H*.22+Math.random()*(H*.55),hp:eh,maxHp:eh,type:et,vx:-(0.7+p*.05)*tsl,id:Date.now(),flash:0})
      }

      // ── UNIT AI ──
      g.units.forEach((u:any)=>{
        // Find nearest enemy
        const near=g.enemies.reduce((best:any,e:any)=>!best||e.x<best.x?e:best,null)
        u.target=near
        // Move toward enemy side slowly
        if(near&&u.x<BATTLE_LINE-10) u.x+=(.4+stage*.05)*tsl
        // Attack
        u.atkTimer-=tsl
        if(u.atkTimer<=0&&near){
          const dx=near.x-u.x,dy=near.y-u.y,d=Math.sqrt(dx*dx+dy*dy)||1
          const spd=u.type===1?9:u.type===2?6:7
          const dmg=(g.critChain>0?u.type===3?20:12:u.type===3?10:u.type===4?8:5)+stage
          g.projectiles.push({x:u.x+12,y:u.y,vx:dx/d*spd,vy:dy/d*spd*.3,dmg,side:0,type:u.type,life:55,id:Date.now()})
          u.atkTimer=Math.max(28,60-stage*4)
          if(g.critChain>0) g.critChain--
        }
        // Units take damage from enemies reaching left side
      })
      g.units=g.units.filter((u:any)=>u.hp>0)

      // ── ENEMY MOVEMENT + SHOOTING ──
      g.enemies.forEach((e:any)=>{
        e.x+=e.vx*tsl
        e.y+=Math.sin(g.frame*.05+e.id*.3)*.8
        if(e.flash>0) e.flash--
        // Shoot at units
        if(g.frame%Math.max(40,80-stage*6)===0&&g.units.length>0){
          const near2=g.units.reduce((best:any,u:any)=>!best||u.x>best.x?u:best,null)
          if(near2){
            const dx=near2.x-e.x,dy=near2.y-e.y,d=Math.sqrt(dx*dx+dy*dy)||1
            g.projectiles.push({x:e.x-8,y:e.y,vx:dx/d*(-4-stage*.3),vy:dy/d*.8,dmg:4+stage,side:1,type:e.type,life:50,id:Date.now()})
          }
        }
        // If enemy reaches far left: damages morale
        if(e.x<-20){g.morale=Math.max(0,g.morale-8);e.x=W-20}
      })
      g.enemies=g.enemies.filter((e:any)=>e.hp>0)

      // ── BOSS UPDATE ──
      if(g.bossActive&&g.bossHp>0){
        g.bossHp-=tsl*.05
        if(g.frame%30===0){
          // Boss fires 3-way
          for(let i=-1;i<=1;i++) g.projectiles.push({x:W*0.7,y:H/2,vx:-5,vy:i*2.5,dmg:8,side:1,type:3,life:65,id:Date.now()+i})
        }
        if(g.bossHp<=0) g.bossActive=false
      }

      // ── PROJECTILE UPDATE ──
      g.projectiles.forEach((b:any)=>{
        b.x+=b.vx*tsl; b.y+=b.vy; b.life--
        if(b.side===0){
          g.enemies.forEach((e:any)=>{
            if(Math.abs(b.x-e.x)<16&&Math.abs(b.y-e.y)<16&&b.life>0){
              e.hp-=b.dmg; e.flash=14; b.life=0
              g.explosions.push({x:e.x,y:e.y,r:0,maxR:18,life:12,col:ECOLS2[e.type%ECOLS2.length]})
            }
          })
        } else {
          g.units.forEach((u:any)=>{
            if(Math.abs(b.x-u.x)<14&&Math.abs(b.y-u.y)<14&&b.life>0){
              u.hp-=b.dmg; b.life=0
              g.explosions.push({x:u.x,y:u.y,r:0,maxR:14,life:10,col:'#ff4444'})
            }
          })
        }
      })
      g.projectiles=g.projectiles.filter((b:any)=>b.life>0&&b.x>-10&&b.x<W+10)

      // ── EXPLOSION UPDATE ──
      g.explosions.forEach((ex:any)=>{ex.r+=3;ex.life--})
      g.explosions=g.explosions.filter((ex:any)=>ex.life>0)

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.12;pt.life--})
      g.particles=g.particles.filter((pt:any)=>pt.life>0)
      g.frame++

      // ══ DRAW ══════════════════════════
      // ── BACKGROUND ──
      const bg2=ctx.createLinearGradient(0,0,0,H)
      if(stage<=1){bg2.addColorStop(0,'#050510');bg2.addColorStop(1,'#080816')}
      else if(stage<=3){bg2.addColorStop(0,'#040408');bg2.addColorStop(1,'#060614')}
      else if(stage<=5){bg2.addColorStop(0,'#030308');bg2.addColorStop(1,'#050512')}
      else{bg2.addColorStop(0,'#030210');bg2.addColorStop(1,'#060518')}
      ctx.fillStyle=bg2;ctx.fillRect(0,0,W,H)

      // Battlefield grid
      ctx.strokeStyle=`rgba(100,60,200,${.04+stage*.006})`;ctx.lineWidth=.5
      for(let x2=0;x2<W;x2+=44){ctx.beginPath();ctx.moveTo(x2,0);ctx.lineTo(x2,H);ctx.stroke()}
      for(let y2=0;y2<H;y2+=44){ctx.beginPath();ctx.moveTo(0,y2);ctx.lineTo(W,y2);ctx.stroke()}

      // Battle line (front line)
      ctx.strokeStyle=`rgba(255,100,50,${.15+stage*.03})`;ctx.lineWidth=1;ctx.setLineDash([6,10])
      ctx.beginPath();ctx.moveTo(BATTLE_LINE,0);ctx.lineTo(BATTLE_LINE,H);ctx.stroke()
      ctx.setLineDash([]);ctx.fillStyle='rgba(255,100,50,.25)';ctx.font='7px monospace';ctx.textAlign='center'
      ctx.fillText('FRONT LINE',BATTLE_LINE,H-6)

      // HQ glow (left side)
      ctx.fillStyle=`rgba(0,180,255,${.06+stage*.01})`
      ctx.beginPath();ctx.arc(W*.12,H/2,70,0,Math.PI*2);ctx.fill()

      // Ground
      r(0,H-28,W,28,stage<=2?'#0a0a14':stage<=5?'#070710':'#050518')
      for(let gx=0;gx<W;gx+=55){ctx.fillStyle='rgba(255,255,255,.018)';ctx.fillRect(gx,H-26,52,8)}

      // Time slow overlay
      if(g.timeSlowTimer>0){
        ctx.fillStyle=`rgba(0,200,255,${Math.min(.08,g.timeSlowTimer/200*.08)})`;ctx.fillRect(0,0,W,H)
        ctx.fillStyle='#00e5ffaa';ctx.font='7px monospace';ctx.textAlign='right'
        ctx.fillText(`⏳ ${Math.ceil(g.timeSlowTimer/60)}s`,W-8,42)
      }

      // ── EXPLOSIONS ──
      g.explosions.forEach((ex:any)=>{
        ctx.globalAlpha=Math.max(0,ex.life/20)*.7
        ctx.fillStyle=ex.col+'55';ctx.beginPath();ctx.arc(ex.x,ex.y,ex.r,0,Math.PI*2);ctx.fill()
        ctx.globalAlpha=1
      })

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{
        ctx.globalAlpha=Math.max(0,pt.life/50);ctx.fillStyle=pt.col;ctx.fillRect(pt.x-pt.s/2,pt.y-pt.s/2,pt.s,pt.s);ctx.globalAlpha=1
      })

      // ── PROJECTILES ──
      g.projectiles.forEach((b:any)=>{
        ctx.globalAlpha=Math.min(1,b.life/15)
        const pc=b.side===0?(b.type===3?'#ffd700':b.type===2?'#bf5af2':b.type===1?'#00ff88':'#00e5ff'):'#ff4444'
        if(b.side===0){
          const gr=ctx.createLinearGradient(b.x-14,0,b.x,0);gr.addColorStop(0,'transparent');gr.addColorStop(1,pc)
          ctx.fillStyle=gr;ctx.fillRect(b.x-14,b.y-2,14,5);ctx.fillStyle='#fff';ctx.fillRect(b.x-2,b.y-2,4,5)
        } else {
          const gr=ctx.createLinearGradient(b.x,0,b.x+14,0);gr.addColorStop(0,'transparent');gr.addColorStop(1,pc)
          ctx.fillStyle=gr;ctx.fillRect(b.x,b.y-2,14,5);ctx.fillStyle='#fff';ctx.fillRect(b.x,b.y-2,4,5)
        }
        ctx.globalAlpha=1
      })

      // ── PLAYER UNITS ──
      g.units.forEach((u:any,i:number)=>{
        const bob=Math.sin(g.frame*.1+i*.8)*3,col=UCOLS[u.type%UCOLS.length]
        // Glow
        ctx.fillStyle=col+'22';ctx.beginPath();ctx.arc(u.x,u.y+bob,16,0,Math.PI*2);ctx.fill()
        // Body (pixel character)
        r(u.x-6,u.y+bob-12,12,12,col)
        r(u.x-3,u.y+bob-10,3,3,'#fff');r(u.x+1,u.y+bob-10,3,3,'#fff')
        r(u.x-7,u.y+bob-1,14,10,col+'cc')
        r(u.x-5,u.y+bob+9,4,6,'#444');r(u.x+1,u.y+bob+9,4,6,'#444')
        // Label
        ctx.fillStyle=col;ctx.font='6px monospace';ctx.textAlign='center';ctx.fillText(ULBLS[u.type%ULBLS.length],u.x,u.y+bob-16)
        // HP bar
        r(u.x-10,u.y+bob+17,20,3,'#111');r(u.x-10,u.y+bob+17,Math.floor(20*(u.hp/u.maxHp)),3,col)
        // Crit indicator
        if(g.critChain>0){ctx.fillStyle='#ffd700';ctx.font='7px monospace';ctx.textAlign='center';ctx.fillText('★',u.x,u.y+bob-22)}
      })

      // ── ENEMIES ──
      g.enemies.forEach((e:any)=>{
        const bob=Math.sin(g.frame*.07+e.id*.4)*4*tsl,col=ECOLS2[e.type%ECOLS2.length]
        ctx.globalAlpha=e.flash>0?.4+Math.random()*.6:1
        ctx.fillStyle=col+'33';ctx.beginPath();ctx.arc(e.x,e.y+bob,19,0,Math.PI*2);ctx.fill()
        r(e.x-11,e.y+bob-13,22,22,col);r(e.x-9,e.y+bob-11,18,18,col+'bb')
        r(e.x-6,e.y+bob-9,4,4,'#ff0');r(e.x+2,e.y+bob-9,4,4,'#ff0')
        r(e.x-4,e.y+bob-7,2,2,'#000');r(e.x+4,e.y+bob-7,2,2,'#000')
        ctx.fillStyle=col;ctx.font='6px monospace';ctx.textAlign='center';ctx.fillText(ELBLS2[e.type%ELBLS2.length],e.x,e.y+bob-17)
        const hw=26;r(e.x-hw/2,e.y+bob+13,hw,3,'#1a0008');r(e.x-hw/2,e.y+bob+13,Math.floor(hw*(e.hp/e.maxHp)),3,e.hp/e.maxHp>.5?'#00cc44':'#ff4444')
        ctx.globalAlpha=1
      })

      // ── BOSS ──
      if(g.bossActive&&g.bossHp>0){
        const bx=W*.7,by=H/2,bob=Math.sin(g.frame*.06)*6
        ctx.fillStyle='rgba(255,0,68,.2)';ctx.beginPath();ctx.arc(bx,by+bob,40,0,Math.PI*2);ctx.fill()
        r(bx-22,by+bob-26,44,44,'#cc0044');r(bx-18,by+bob-22,36,36,'#ff2255')
        r(bx-10,by+bob-18,7,7,'#ff0');r(bx+3,by+bob-18,7,7,'#ff0')
        r(bx-7,by+bob-15,5,5,'#000');r(bx+5,by+bob-15,5,5,'#000')
        ctx.fillStyle='#ff0044';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText('BOSS',bx,by+bob-30)
        r(bx-30,by+bob+22,60,6,'#1a0008');r(bx-30,by+bob+22,Math.floor(60*(g.bossHp/g.bossMaxHp)),6,'#ff0044')
      }

      // ── VICTORY FLASH ──
      if(g.victoryFlash>0){
        ctx.fillStyle=`rgba(0,255,65,${(g.victoryFlash/35)*.18})`;ctx.fillRect(0,0,W,H)
        if(g.victoryFlash>22){ctx.fillStyle='#00ff41';ctx.font='bold 12px monospace';ctx.textAlign='center';ctx.fillText('⚔ VICTORY!',W/2,H*.44)}
        g.victoryFlash--
      }

      // ── CORRUPT FLASH ──
      if(g.corruptFlash>0){
        ctx.fillStyle=`rgba(255,45,85,${(g.corruptFlash/32)*.25})`;ctx.fillRect(0,0,W,H)
        if(g.corruptFlash>18){ctx.fillStyle='#ff2d55';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('⚠ BATTLE CORRUPTION',W/2,H*.44)}
        g.corruptFlash--
      }

      // ── HUD ──
      r(0,0,W,26,'rgba(0,0,0,.9)')
      const stagecol2=stage>=6?'#ffd700':stage>=4?'#ff9500':stage>=2?'#bf5af2':'#4a6a8a'
      ctx.fillStyle=stagecol2;ctx.font='bold 9px monospace';ctx.textAlign='left';ctx.fillText(`◆ ${STAGES[stage]}`,8,16)
      // Morale bar
      r(W*.28,4,90,16,'#1a0020');r(W*.28+1,5,Math.floor(88*(g.morale/100)),14,g.morale>60?'#00cc44':g.morale>30?'#ff9900':'#ff2d55')
      ctx.fillStyle='#ffffff55';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('MRL',W*.28+3,15)
      // Energy bar
      r(W*.28+98,4,80,16,'#000820');r(W*.28+99,5,Math.floor(78*(g.energy/100)),14,'#0080ff')
      ctx.fillStyle='#4488ff88';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('NRG',W*.28+101,15)
      // Rage bar
      r(W*.28+186,4,72,16,'#200000');r(W*.28+187,5,Math.floor(70*(g.rage/100)),14,g.rage>70?'#ff2d55':'#ff8800')
      ctx.fillStyle='#ff440066';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('RAGE',W*.28+189,15)
      // Kills + combo
      ctx.fillStyle='#ffd700';ctx.font='bold 9px monospace';ctx.textAlign='right';ctx.fillText(`💀${g.kills}${g.combo>1?` ×${g.combo}COMBO`:''}`,W-8,16)
      // Progress bar
      r(0,22,W,4,'#111')
      r(0,22,Math.floor(W*(p/total)),4,stage<=2?'#4040c0':stage<=5?'#bf5af2':'#ffd700')
      // Ability banner
      if(g.abilityTimer>0&&g.abilityMsg){
        ctx.fillStyle='rgba(0,0,0,.88)';ctx.fillRect(W/2-138,H/2-18,276,32)
        ctx.strokeStyle='#ffd700';ctx.lineWidth=1;ctx.strokeRect(W/2-138,H/2-18,276,32)
        ctx.fillStyle='#ffd700';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText(g.abilityMsg,W/2,H/2+4)
      }

      // Scanlines
      ctx.fillStyle='rgba(0,0,0,.04)';for(let y3=0;y3<H;y3+=3) ctx.fillRect(0,y3,W,1)

      // ── WIN ──
      if(p>=total&&total>0){
        ctx.fillStyle='rgba(0,0,0,.85)';ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle=`rgba(255,215,0,${.12+Math.sin(g.frame*.05)*.05})`;ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#ffd700';ctx.font='bold 15px monospace';ctx.textAlign='center'
        ctx.fillText('👑 WAR GOD ACHIEVED!',W/2,H/2-14)
        ctx.fillStyle='#00ff41';ctx.font='10px monospace';ctx.fillText('Automated war simulation complete!',W/2,H/2+6)
        ctx.fillStyle='#ff9500';ctx.font='9px monospace';ctx.fillText(`Kills: ${g.kills} | Morale: ${Math.floor(g.morale)}%`,W/2,H/2+22)
      }
    }

    
    // ─── NETWORK CIVILIZATION (DB + Multiplayer Course) ───
    const drawMultiplayerArena=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('ngc' in cvs)){
        if(!cvs) return
        cvs.ngc={
          latency:45, integrity:90, syncRate:75, combo:0,
          nodes:[] as {x:number;y:number;type:number;active:boolean;corrupt:number;pulse:number;id:number}[],
          edges:[] as {a:number;b:number;active:boolean;corrupt:number}[],
          packets:[] as {from:number;to:number;prog:number;type:string;col:string;id:number}[],
          attacks:[] as {x:number;y:number;vx:number;vy:number;life:number}[],
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string;s:number}[],
          frame:0, prevState:'idle' as string, prevPassed:-1,
          ddosTimer:0, stabilizeFlash:0, corruptFlash:0,
        }
        cvs.ngc.nodes.push({x:0,y:0,type:0,active:true,corrupt:0,pulse:0,id:0})
      }
      const g=cvs.ngc
      const p=passedCount, total=Math.max(totalTasks,1), ratio=p/total
      const stage=ratio<.08?0:ratio<.20?1:ratio<.33?2:ratio<.48?3:ratio<.62?4:ratio<.76?5:ratio<.90?6:7
      const STAGES=['LOCAL DB','LAN NETWORK','CITY CLUSTER','REGIONAL NET','NATIONAL GRID','CONTINENTAL','INTERCONTINENTAL','GLOBAL NETWORK']
      const CX=W/2, CY=H/2

      // Task type detection
      const ttl=taskTitle.toLowerCase()
      const isSqlTask   =ttl.includes('sql')||ttl.includes('query')||ttl.includes('select')||ttl.includes('table')
      const isIndexTask =ttl.includes('index')||ttl.includes('optim')||ttl.includes('latency')
      const isRelTask   =ttl.includes('relation')||ttl.includes('join')||ttl.includes('foreign')||ttl.includes('schema')
      const isSyncTask  =ttl.includes('sync')||ttl.includes('real-time')||ttl.includes('socket')||ttl.includes('multi')
      const isRepairTask=ttl.includes('repair')||ttl.includes('fix')||ttl.includes('debug')||ttl.includes('error')

      const NCOLS=['#4488ff','#00ff41','#00e5ff','#ffe600','#ff9500','#bf5af2','#ff2244','#ffffff']
      const NRADIUS=[16,13,11,13,11,15,14,18]

      // Keep center node at canvas center
      if(g.nodes.length>0){ g.nodes[0].x=CX; g.nodes[0].y=CY }

      // ── SPAWN NODES on progress ──
      const targetNodeCount=Math.min(2+Math.floor(p*2.2),18)
      while(g.nodes.length<targetNodeCount){
        const idx=g.nodes.length
        const type=Math.min(Math.floor(idx*.55),7)
        const ring=Math.floor(idx/5)+1
        const ang=idx*1.3+ring*.7
        const dist=55+ring*50+Math.random()*28
        const nx=Math.max(34,Math.min(W-34,CX+Math.cos(ang)*dist))
        const ny=Math.max(38,Math.min(H-22,CY+Math.sin(ang)*dist*.58))
        g.nodes.push({x:nx,y:ny,type,active:true,corrupt:0,pulse:idx%8,id:idx})
        // Connect to nearest node
        let nearIdx=0, nearDist=9999
        g.nodes.slice(0,-1).forEach((n:any,ni:number)=>{
          const d=Math.hypot(n.x-nx,n.y-ny)
          if(d<nearDist){ nearDist=d; nearIdx=ni }
        })
        g.edges.push({a:nearIdx,b:g.nodes.length-1,active:true,corrupt:0})
        // Extra connection occasionally
        if(idx>3&&Math.random()<.4){
          const rn=Math.floor(Math.random()*(g.nodes.length-2))
          const b2=g.nodes.length-1
          if(!g.edges.some((e:any)=>(e.a===rn&&e.b===b2)||(e.b===rn&&e.a===b2)))
            g.edges.push({a:rn,b:b2,active:true,corrupt:0})
        }
      }

      // ── STATE TRANSITIONS ──
      if(g.prevState!==state){
        if(state==='correct'){
          g.combo++; g.stabilizeFlash=34
          g.latency=Math.max(5,g.latency-12)
          g.integrity=Math.min(100,g.integrity+10)
          g.syncRate=Math.min(100,g.syncRate+8)
          g.ddosTimer=0
          g.nodes.forEach((n:any)=>{ n.corrupt=Math.max(0,n.corrupt-30) })
          g.edges.forEach((e:any)=>{ e.corrupt=Math.max(0,e.corrupt-20) })
          if(isSqlTask){ g.latency=Math.max(5,g.latency-10); g.integrity=Math.min(100,g.integrity+8) }
          if(isIndexTask){ g.latency=Math.max(5,g.latency-15) }
          if(isRelTask&&g.nodes.length>=3){
            const na2=Math.floor(Math.random()*(g.nodes.length-1))
            const nb2=Math.floor(Math.random()*(g.nodes.length-1))
            if(na2!==nb2&&!g.edges.some((e:any)=>(e.a===na2&&e.b===nb2)||(e.b===na2&&e.a===nb2)))
              g.edges.push({a:na2,b:nb2,active:true,corrupt:0})
          }
          if(isSyncTask){ g.syncRate=Math.min(100,g.syncRate+15) }
          if(isRepairTask){ g.nodes.forEach((n:any)=>{ n.corrupt=0 }); g.edges.forEach((e:any)=>{ e.corrupt=0 }) }
          for(let pi=0;pi<16;pi++){
            const a=Math.random()*Math.PI*2
            g.particles.push({x:CX,y:CY,vx:Math.cos(a)*4,vy:Math.sin(a)*4-1,life:42,col:NCOLS[pi%8],s:3+Math.random()*3})
          }
        }
        if(state==='wrong'){
          g.combo=0; g.corruptFlash=24
          g.latency=Math.min(200,g.latency+25)
          g.integrity=Math.max(5,g.integrity-12)
          g.syncRate=Math.max(10,g.syncRate-10)
          if(g.nodes.length>1) g.nodes[1+Math.floor(Math.random()*(g.nodes.length-1))].corrupt=80
          if(g.edges.length>0) g.edges[Math.floor(Math.random()*g.edges.length)].corrupt=60
          if(g.latency>80) g.ddosTimer=100
          for(let ai=0;ai<8;ai++){
            const ang=Math.random()*Math.PI*2, dist=W*.44
            g.attacks.push({x:CX+Math.cos(ang)*dist,y:CY+Math.sin(ang)*dist*.58,vx:-Math.cos(ang)*2.4,vy:-Math.sin(ang)*2.4*.58,life:50})
          }
        }
        g.prevState=state
      }
      if(g.prevPassed!==p){ g.prevPassed=p; g.integrity=Math.min(100,g.integrity+3) }

      // ── UPDATE ──
      if(g.stabilizeFlash>0) g.stabilizeFlash--
      if(g.corruptFlash>0) g.corruptFlash--
      if(g.ddosTimer>0) g.ddosTimer--
      if(g.frame%120===0) g.latency=Math.max(Math.max(8,stage*3),g.latency-1)
      if(g.frame%90===0&&g.integrity<95) g.integrity=Math.min(95,g.integrity+1)
      g.nodes.forEach((n:any)=>{ if(n.corrupt>0) n.corrupt=Math.max(0,n.corrupt-1); n.pulse=(n.pulse+1)%120 })
      g.edges.forEach((e:any)=>{ if(e.corrupt>0) e.corrupt=Math.max(0,e.corrupt-1) })

      // Spawn data packets on edges
      const pkRate=Math.max(14,50-stage*4)
      if(g.frame%pkRate===0&&g.edges.length>0){
        const edge=g.edges[Math.floor(Math.random()*g.edges.length)]
        if(!edge.corrupt){
          const rev=Math.random()<.5
          g.packets.push({from:rev?edge.b:edge.a,to:rev?edge.a:edge.b,prog:0,type:'data',col:NCOLS[Math.floor(Math.random()*6)],id:Date.now()+Math.random()*999})
        }
      }
      g.packets.forEach((pk:any)=>{ pk.prog=Math.min(1,pk.prog+(0.026+stage*.003)) })
      g.packets=g.packets.filter((pk:any)=>pk.prog<1).slice(-40)

      // Attack particles
      g.attacks.forEach((a:any)=>{ a.x+=a.vx; a.y+=a.vy; a.life-- })
      g.attacks=g.attacks.filter((a:any)=>a.life>0&&Math.hypot(a.x-CX,a.y-CY)>14)

      // Particles
      g.particles.forEach((pt:any)=>{ pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=.06; pt.life--; pt.vx*=.95 })
      g.particles=g.particles.filter((pt:any)=>pt.life>0)
      g.frame++

      // ── DRAW ──
      const netBg=ctx.createRadialGradient(CX,CY,0,CX,CY,W*.55)
      netBg.addColorStop(0,'#030810'); netBg.addColorStop(.5,'#020610'); netBg.addColorStop(1,'#010408')
      ctx.fillStyle=netBg; ctx.fillRect(0,0,W,H)

      // Grid dots
      ctx.fillStyle='rgba(0,80,160,.1)'
      for(let ix=20;ix<W;ix+=32) for(let iy=32;iy<H;iy+=28) ctx.fillRect(ix-1,iy-1,2,2)

      // DDoS screen flash
      if(g.ddosTimer>0){
        ctx.fillStyle=`rgba(255,30,0,${Math.sin(g.ddosTimer*.25)*.06+.02})`
        ctx.fillRect(0,26,W,H-26)
      }
      // Stage BG text
      ctx.fillStyle='rgba(0,80,255,.022)'
      ctx.font=`bold ${36+stage*3}px monospace`; ctx.textAlign='center'
      ctx.fillText(STAGES[stage],CX,H*.73)

      // ── EDGES ──
      g.edges.forEach((e:any)=>{
        const na=g.nodes[e.a], nb=g.nodes[e.b]
        if(!na||!nb) return
        const cor=e.corrupt>0||na.corrupt>10||nb.corrupt>10
        const al=cor?.06+Math.sin(g.frame*.15)*.04:.11+Math.sin(g.frame*.04+e.a)*.04
        ctx.strokeStyle=cor?`rgba(255,50,50,${al*2})`:`rgba(0,150,255,${al})`
        ctx.lineWidth=cor?1:1.5
        if(cor) ctx.setLineDash([3,5])
        ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y); ctx.stroke()
        ctx.setLineDash([])
      })

      // ── PACKETS ──
      g.packets.forEach((pk:any)=>{
        const na=g.nodes[pk.from], nb=g.nodes[pk.to]
        if(!na||!nb) return
        const px2=na.x+(nb.x-na.x)*pk.prog, py2=na.y+(nb.y-na.y)*pk.prog
        const sz=3+Math.sin(pk.prog*Math.PI)*2
        ctx.fillStyle=pk.col+'cc'; ctx.beginPath(); ctx.arc(px2,py2,sz,0,Math.PI*2); ctx.fill()
        const tx2=na.x+(nb.x-na.x)*Math.max(0,pk.prog-.06), ty2=na.y+(nb.y-na.y)*Math.max(0,pk.prog-.06)
        ctx.fillStyle=pk.col+'44'; ctx.beginPath(); ctx.arc(tx2,ty2,sz*.6,0,Math.PI*2); ctx.fill()
      })

      // ── ATTACK PARTICLES ──
      g.attacks.forEach((a:any)=>{
        const al=a.life/50
        ctx.fillStyle=`rgba(255,30,30,${al*.7})`; ctx.beginPath(); ctx.arc(a.x,a.y,3+al*3,0,Math.PI*2); ctx.fill()
        ctx.fillStyle=`rgba(255,80,0,${al*.3})`; ctx.beginPath(); ctx.arc(a.x,a.y,8,0,Math.PI*2); ctx.fill()
      })

      // ── NODES ──
      g.nodes.forEach((n:any,ni:number)=>{
        const nc=NCOLS[n.type%8], nr=NRADIUS[n.type%8]
        const cor=n.corrupt>10, isCenter=ni===0
        const glow=.06+Math.sin(g.frame*.05+ni*.8)*.03

        // Outer glow
        ctx.fillStyle=cor?`rgba(255,50,50,${glow*.8})`:`${nc}${Math.floor(glow*155).toString(16).padStart(2,'0')}`
        ctx.beginPath(); ctx.arc(n.x,n.y,nr+12,0,Math.PI*2); ctx.fill()
        // Ring
        ctx.strokeStyle=cor?`rgba(255,60,60,${.55+Math.sin(g.frame*.12)*.3})`:`${nc}${isCenter?'ee':'88'}`
        ctx.lineWidth=isCenter?2.5:2
        ctx.beginPath(); ctx.arc(n.x,n.y,nr,0,Math.PI*2); ctx.stroke()
        // Fill
        r(n.x-nr+2,n.y-nr+2,nr*2-4,nr*2-4,cor?'#1a0505':isCenter?'#0a1a2a':'#060e18')
        // Corruption flicker
        if(cor&&g.frame%8<4){ ctx.fillStyle='rgba(255,40,40,.2)'; ctx.beginPath(); ctx.arc(n.x,n.y,nr+2,0,Math.PI*2); ctx.fill() }
        // Center hub extra rings
        if(isCenter){
          ctx.strokeStyle=`${nc}${Math.floor((.035+Math.sin(g.frame*.04)*.015)*255).toString(16).padStart(2,'0')}`
          ctx.lineWidth=1
          ctx.beginPath(); ctx.arc(n.x,n.y,nr+22,0,Math.PI*2); ctx.stroke()
          ctx.beginPath(); ctx.arc(n.x,n.y,nr+36,0,Math.PI*2); ctx.stroke()
        }
        // Label
        ctx.fillStyle=cor?'#ff4444':nc+(isCenter?'ff':'cc')
        ctx.font=`bold ${isCenter?9:7}px monospace`; ctx.textAlign='center'
        ctx.fillText(['DB','SRV','CACHE','API','CDN','CLU','DC','HUB'][n.type%8],n.x,n.y+3)
        if(ni>0){ ctx.fillStyle=nc+'44'; ctx.font='5px monospace'; ctx.fillText(`N${ni}`,n.x,n.y+nr+10) }
      })

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{
        const al=Math.floor(Math.max(0,(pt.life/42)*255)).toString(16).padStart(2,'0')
        ctx.fillStyle=pt.col+al; ctx.fillRect(pt.x-pt.s/2,pt.y-pt.s/2,pt.s,pt.s)
      })

      // Flashes
      if(g.stabilizeFlash>0){ctx.fillStyle=`rgba(0,100,255,${g.stabilizeFlash*.004})`;ctx.fillRect(0,26,W,H-26)}
      if(g.corruptFlash>0){ctx.fillStyle=`rgba(255,0,64,${g.corruptFlash*.006})`;ctx.fillRect(0,26,W,H-26)}

      // ── HUD ──
      r(0,0,W,26,'rgba(0,0,0,.9)')
      // Stage label
      ctx.fillStyle='#4488ffaa'; ctx.font='bold 8px monospace'; ctx.textAlign='left'
      ctx.fillText(`◈ ${STAGES[stage]}`,8,16)
      // LATENCY bar (low = good)
      const latCol=g.latency>100?'#ff0040':g.latency>50?'#ff9500':'#00ff41'
      r(162,5,88,16,'#070710'); r(163,6,Math.floor(86*Math.min(g.latency/200,1)),14,latCol)
      ctx.fillStyle='#2a2a4a'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.fillText('LAT',165,15)
      ctx.fillStyle=latCol; ctx.textAlign='right'; ctx.fillText(`${Math.ceil(g.latency)}ms`,248,15)
      // INTEG bar
      const intCol=g.integrity>70?'#00e5ff':g.integrity>40?'#ffe600':'#ff2244'
      r(258,5,78,16,'#070710'); r(259,6,Math.floor(76*(g.integrity/100)),14,intCol)
      ctx.fillStyle='#2a2a4a'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.fillText('INT',262,15)
      ctx.fillStyle=intCol; ctx.textAlign='right'; ctx.fillText(`${Math.ceil(g.integrity)}%`,334,15)
      // SYNC bar
      const syncCol=g.syncRate>70?'#bf5af2':g.syncRate>40?'#ffe600':'#ff2244'
      r(344,5,78,16,'#070710'); r(345,6,Math.floor(76*(g.syncRate/100)),14,syncCol)
      ctx.fillStyle='#2a2a4a'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.fillText('SYNC',348,15)
      ctx.fillStyle=syncCol; ctx.textAlign='right'; ctx.fillText(`${Math.ceil(g.syncRate)}%`,420,15)
      // Combo
      if(g.combo>1){ctx.fillStyle='#ffd700';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.fillText(`×${g.combo} COMBO`,W/2,16)}
      // Node count right
      ctx.fillStyle='#2a4a6a'; ctx.font='bold 8px monospace'; ctx.textAlign='right'
      ctx.fillText(`${g.nodes.length} nodes`,W-8,16)
      // Progress bar
      r(0,22,W,4,'#030610')
      const pgc=stage>=6?'#ff00ff':stage>=4?'#bf5af2':stage>=2?'#4488ff':'#00e5ff'
      r(0,22,Math.floor(W*(p/total)),4,pgc)

      // DDoS warning
      if(g.ddosTimer>0&&g.frame%14<7){
        ctx.fillStyle='rgba(0,0,0,.88)'; ctx.fillRect(W/2-120,H*.35,240,32)
        ctx.strokeStyle='#ff4400'; ctx.lineWidth=1; ctx.strokeRect(W/2-120,H*.35,240,32)
        ctx.fillStyle='#ff4400'; ctx.font='bold 10px monospace'; ctx.textAlign='center'
        ctx.fillText('⚠ DDoS ATTACK DETECTED!',W/2,H*.35+21)
      }

      // Stabilize flash message
      if(g.stabilizeFlash>22){
        const smsg=isSqlTask?'SQL FIXED → NETWORK STABILIZED':
                   isIndexTask?'INDEX OPTIMIZED → LATENCY DOWN':
                   isRelTask?'RELATIONS LINKED → NEW EDGE':
                   isSyncTask?'SYNC RESTORED → RATE UP':
                   isRepairTask?'REPAIR COMPLETE → NODES RESTORED':
                   'TASK SOLVED → NETWORK GROWS'
        ctx.fillStyle=`rgba(0,150,255,${(g.stabilizeFlash-22)*.05})`
        ctx.font='bold 9px monospace'; ctx.textAlign='center'
        ctx.fillText(smsg,CX,H*.30)
      }
    }

    // ─── GLOBAL DEPLOYMENT (Course 8: Final Launch) ───
    const drawCodeFactory=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('dcf' in cvs)){
        if(!cvs) return
        cvs.dcf={
          trafficLoad:5, uptime:100, stability:90, liveUsers:0, combo:0,
          launchFlash:0, crashFlash:0, rollbackTimer:0, launchCountdown:0, prevStage:-1,
          hub:{x:0,y:0} as {x:number;y:number},
          regions:[] as {x:number;y:number;name:string;col:string;type:number;active:boolean;crashed:number;servers:number;bootProg:number;appear:number;pingMs:number}[],
          arcs:[] as {x1:number;y1:number;x2:number;y2:number;t:number;col:string}[],
          traffic:[] as {x:number;y:number;tx:number;ty:number;t:number;spd:number;col:string;sz:number}[],
          pulses:[] as {x:number;y:number;r:number;maxR:number;life:number;col:string}[],
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string;s:number}[],
          frame:0, prevState:'idle' as string, prevPassed:-1,
        }
        const RDEFS=[
          {name:'AMERICAS',col:'#00e5ff',type:0},
          {name:'EUROPE',  col:'#00ff88',type:1},
          {name:'AFRICA',  col:'#ffd700',type:2},
          {name:'ASIA',    col:'#ff9500',type:3},
          {name:'PACIFIC', col:'#bf5af2',type:4},
        ]
        RDEFS.forEach(rd=>{ cvs.dcf.regions.push({...rd,x:0,y:0,active:false,crashed:0,servers:1,bootProg:0,appear:0,pingMs:Math.floor(12+Math.random()*55)}) })
      }
      const g=cvs.dcf
      const p=passedCount, total=Math.max(totalTasks,1), ratio=p/total
      const stage=ratio<.08?0:ratio<.20?1:ratio<.33?2:ratio<.48?3:ratio<.62?4:ratio<.76?5:ratio<.90?6:7
      const STAGES=['LOCAL BUILD','TESTING','STAGING','PRODUCTION','SCALING','MULTI-REGION','GLOBAL','UNIVERSE']

      // Hub at canvas center
      g.hub.x=Math.round(W/2); g.hub.y=Math.round(H/2)

      // Region positions (geographic layout, fractions of W/H)
      const REG_POS=[[.12,.48],[.36,.32],[.46,.65],[.68,.36],[.85,.52]]
      const rActive=stage<5?stage:5   // 0 at stage 0, grows to 5

      g.regions.forEach((reg:any,i:number)=>{
        reg.x=Math.round(REG_POS[i][0]*W)
        reg.y=Math.round(REG_POS[i][1]*H)
        const shouldBeActive=i<rActive
        if(shouldBeActive&&!reg.active){
          reg.active=true; reg.bootProg=0; reg.appear=50
          g.arcs.push({x1:g.hub.x,y1:g.hub.y,x2:reg.x,y2:reg.y,t:0,col:reg.col})
        }
        if(reg.active){
          if(reg.appear>0){ reg.appear-- }
          else if(reg.bootProg<100){ reg.bootProg=Math.min(100,reg.bootProg+.9) }
        }
        if(reg.crashed>0) reg.crashed--
      })

      // Stage change → launch countdown
      if(g.prevStage!==-1&&g.prevStage!==stage) g.launchCountdown=180
      g.prevStage=stage

      const activeRegs:any[]=g.regions.filter((rg:any)=>rg.active&&rg.crashed===0&&rg.bootProg>=100)

      // Task type detection
      const ttl=taskTitle.toLowerCase()
      const isDeployTask = ttl.includes('deploy')||ttl.includes('pipeline')||ttl.includes('build')||ttl.includes('ci/')
      const isScaleTask  = ttl.includes('scal')||ttl.includes('load')||ttl.includes('traffic')||ttl.includes('balancer')
      const isMonTask    = ttl.includes('monitor')||ttl.includes('uptime')||ttl.includes('alert')||ttl.includes('log')
      const isDockerTask = ttl.includes('docker')||ttl.includes('container')||ttl.includes('k8s')||ttl.includes('kube')
      const isDbTask     = ttl.includes('db')||ttl.includes('database')||ttl.includes('migrate')||ttl.includes('backup')

      // Live users scale with stage + passed tasks
      const targetUsers=Math.floor((stage+1)*800+p*220)
      if(g.liveUsers<targetUsers) g.liveUsers=Math.min(targetUsers,g.liveUsers+Math.ceil((targetUsers-g.liveUsers)*.04)+1)

      // ── STATE TRANSITIONS ──
      if(g.prevState!==state){
        if(state==='correct'){
          g.combo++; g.launchFlash=36
          g.uptime    =Math.min(100,g.uptime+10)
          g.stability =Math.min(100,g.stability+12)
          g.trafficLoad=Math.max(5,g.trafficLoad-8)
          if(isDeployTask){ activeRegs.forEach((rg:any)=>{ rg.servers=Math.min(rg.servers+1,8) }) }
          if(isScaleTask) { g.trafficLoad=Math.max(5,g.trafficLoad-14); g.stability=Math.min(100,g.stability+8) }
          if(isMonTask)   { g.uptime=Math.min(100,g.uptime+15); g.rollbackTimer=0 }
          if(isDockerTask){ activeRegs.forEach((rg:any)=>{ rg.servers=Math.min(rg.servers+1,8) }) }
          if(isDbTask)    { g.stability=Math.min(100,g.stability+10) }
          g.regions.forEach((rg:any)=>{ if(rg.active) rg.crashed=0 })
          // Pulse rings from hub and active regions
          g.pulses.push({x:g.hub.x,y:g.hub.y,r:10,maxR:52,life:40,col:'#00e5ff'})
          for(let pi=0;pi<Math.min(3,activeRegs.length);pi++){
            g.pulses.push({x:activeRegs[pi].x,y:activeRegs[pi].y,r:8,maxR:36,life:34,col:activeRegs[pi].col})
          }
          // Burst particles
          for(let pi=0;pi<22;pi++){
            if(!activeRegs.length) break
            const ar=activeRegs[pi%activeRegs.length]
            const a=Math.random()*Math.PI*2
            g.particles.push({x:ar.x,y:ar.y,vx:Math.cos(a)*3.5,vy:Math.sin(a)*3.5,life:40,col:ar.col,s:2+Math.random()*2})
          }
        }
        if(state==='wrong'){
          g.combo=0; g.crashFlash=30
          g.trafficLoad =Math.min(100,g.trafficLoad+22)
          g.stability   =Math.max(5,g.stability-20)
          g.uptime      =Math.max(5,g.uptime-12)
          g.rollbackTimer=90
          // Crash one random online region
          const crashable=g.regions.filter((rg:any)=>rg.active&&rg.crashed===0&&rg.bootProg>=100)
          if(crashable.length>0) crashable[Math.floor(Math.random()*crashable.length)].crashed=120
          // Traffic explosion: surge of red dots
          for(let ti=0;ti<16;ti++){
            const ex=Math.random()<.5?0:W, ey=Math.random()*H
            const tr=activeRegs[Math.floor(Math.random()*Math.max(1,activeRegs.length))]
            if(tr) g.traffic.push({x:ex,y:ey,tx:tr.x,ty:tr.y,t:0,spd:.022+Math.random()*.018,col:'#ff2244',sz:2.5})
          }
        }
        g.prevState=state
      }
      if(g.prevPassed!==p){ g.prevPassed=p; g.uptime=Math.min(100,g.uptime+4) }

      // ── UPDATE ──
      if(g.launchFlash>0)    g.launchFlash--
      if(g.crashFlash>0)     g.crashFlash--
      if(g.rollbackTimer>0)  g.rollbackTimer--
      if(g.launchCountdown>0) g.launchCountdown--
      if(g.frame%120===0) g.stability  =Math.max(Math.max(10,stage*5), g.stability-1)
      if(g.frame%160===0) g.trafficLoad=Math.min(Math.min(90,20+stage*8), g.trafficLoad+2)

      // Spawn traffic: hub → regions + edge → regions
      const spawnRate=Math.max(2,9-stage)
      if(g.frame%spawnRate===0&&activeRegs.length>0){
        const tr=activeRegs[Math.floor(Math.random()*activeRegs.length)]
        const fromHub=Math.random()<.55
        const ox=fromHub?g.hub.x:(Math.random()<.5?0:W)
        const oy=fromHub?g.hub.y:Math.random()*H
        const col=g.trafficLoad>75?'#ff6644':g.trafficLoad>50?'#ffe600':tr.col
        g.traffic.push({x:ox,y:oy,tx:tr.x,ty:tr.y,t:0,spd:.015+Math.random()*.022,col,sz:g.trafficLoad>75?2.5:1.5})
      }
      g.traffic.forEach((t:any)=>{ t.t=Math.min(1,t.t+t.spd) })
      g.traffic=g.traffic.filter((t:any)=>t.t<1)
      if(g.traffic.length>100) g.traffic=g.traffic.slice(-100)

      // Arcs animate
      g.arcs.forEach((a:any)=>{ a.t=Math.min(1,a.t+.028) })
      g.arcs=g.arcs.filter((a:any)=>a.t<1)
      // Pulse rings expand
      g.pulses.forEach((pu:any)=>{ pu.r=Math.min(pu.maxR,pu.r+1.3); pu.life-- })
      g.pulses=g.pulses.filter((pu:any)=>pu.life>0)

      g.particles.forEach((pt:any)=>{ pt.x+=pt.vx; pt.y+=pt.vy; pt.vy+=.04; pt.life--; pt.vx*=.93 })
      g.particles=g.particles.filter((pt:any)=>pt.life>0)
      g.frame++

      // ── DRAW ──
      ctx.fillStyle='#010508'; ctx.fillRect(0,0,W,H)

      // World grid
      ctx.strokeStyle='rgba(0,80,160,.04)'; ctx.lineWidth=1
      for(let gx=0;gx<W;gx+=52){ ctx.beginPath(); ctx.moveTo(gx,26); ctx.lineTo(gx,H); ctx.stroke() }
      for(let gy2=26;gy2<H;gy2+=52){ ctx.beginPath(); ctx.moveTo(0,gy2); ctx.lineTo(W,gy2); ctx.stroke() }
      // Scan
      ctx.fillStyle='rgba(0,150,255,.022)'; ctx.fillRect(0,(g.frame*1.3)%H,W,2)

      // Stage BG watermark
      ctx.fillStyle='rgba(0,60,180,.016)'; ctx.font=`bold ${26+stage*2}px monospace`; ctx.textAlign='center'
      ctx.fillText(STAGES[stage],W/2,H*.72)

      // Flash overlays
      if(g.launchFlash>0) { ctx.fillStyle=`rgba(0,200,100,${g.launchFlash*.004})`;  ctx.fillRect(0,26,W,H-26) }
      if(g.crashFlash>0)  { ctx.fillStyle=`rgba(255,30,0,${g.crashFlash*.006})`;    ctx.fillRect(0,26,W,H-26) }
      if(g.rollbackTimer>0){ ctx.fillStyle=`rgba(255,180,0,${Math.sin(g.rollbackTimer*.25)*.025+.008})`; ctx.fillRect(0,26,W,H-26) }

      // ── LAUNCH ARCS ──
      g.arcs.forEach((a:any)=>{
        const t=a.t, cx2=(a.x1+a.x2)/2, cy2=Math.min(a.y1,a.y2)-H*.14
        const ax=(1-t)*(1-t)*a.x1+2*(1-t)*t*cx2+t*t*a.x2
        const ay=(1-t)*(1-t)*a.y1+2*(1-t)*t*cy2+t*t*a.y2
        ctx.strokeStyle=a.col+'99'; ctx.lineWidth=2; ctx.setLineDash([4,7])
        ctx.beginPath(); ctx.moveTo(a.x1,a.y1); ctx.quadraticCurveTo(cx2,cy2,ax,ay); ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle=a.col; ctx.beginPath(); ctx.arc(ax,ay,4,0,Math.PI*2); ctx.fill()
        ctx.fillStyle=a.col+'33'; ctx.beginPath(); ctx.arc(ax,ay,10,0,Math.PI*2); ctx.fill()
      })

      // ── CONNECTION LINES (hub → region, region ↔ region) ──
      const onlineRegs=g.regions.filter((rg:any)=>rg.active&&rg.bootProg>=100)
      onlineRegs.forEach((ra:any,ri:number)=>{
        if(ra.crashed>0) return
        ctx.strokeStyle=`${ra.col}${Math.floor((.065+.03*Math.sin(g.frame*.06+ri))*255).toString(16).padStart(2,'0')}`
        ctx.lineWidth=1; ctx.setLineDash([5,9])
        ctx.beginPath(); ctx.moveTo(g.hub.x,g.hub.y); ctx.lineTo(ra.x,ra.y); ctx.stroke()
        ctx.setLineDash([])
        onlineRegs.slice(0,ri).forEach((rb:any)=>{
          if(rb.crashed>0||Math.hypot(ra.x-rb.x,ra.y-rb.y)>W*.58) return
          ctx.strokeStyle=`rgba(0,110,200,${.04+.02*Math.sin(g.frame*.04+ri+2)})`
          ctx.lineWidth=1; ctx.setLineDash([4,10])
          ctx.beginPath(); ctx.moveTo(ra.x,ra.y); ctx.lineTo(rb.x,rb.y); ctx.stroke()
          ctx.setLineDash([])
        })
      })

      // ── TRAFFIC DOTS ──
      g.traffic.forEach((t:any)=>{
        const tx2=t.x+(t.tx-t.x)*t.t, ty2=t.y+(t.ty-t.y)*t.t
        const al=Math.max(0,1-Math.abs(t.t-.5)*2)
        ctx.globalAlpha=al*.85
        ctx.fillStyle=t.col; ctx.beginPath(); ctx.arc(tx2,ty2,t.sz||1.5,0,Math.PI*2); ctx.fill()
        ctx.globalAlpha=1
      })

      // ── PULSE RINGS ──
      g.pulses.forEach((pu:any)=>{
        const al=Math.max(0,pu.life/40)*.45
        ctx.strokeStyle=pu.col+Math.floor(al*255).toString(16).padStart(2,'0')
        ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(pu.x,pu.y,pu.r,0,Math.PI*2); ctx.stroke()
      })

      // ── DEPLOYMENT HUB ──
      const hubPulse=Math.sin(g.frame*.07)*.5+.5
      ctx.fillStyle=`rgba(0,200,255,${.07+hubPulse*.05})`
      ctx.beginPath(); ctx.arc(g.hub.x,g.hub.y,26+hubPulse*5,0,Math.PI*2); ctx.fill()
      r(g.hub.x-18,g.hub.y-18,36,36,'#010c16')
      ctx.strokeStyle=`rgba(0,220,255,${.55+hubPulse*.35})`; ctx.lineWidth=2
      ctx.strokeRect(g.hub.x-18,g.hub.y-18,36,36)
      ctx.strokeStyle='rgba(0,200,255,.4)'; ctx.lineWidth=1
      ctx.beginPath(); ctx.moveTo(g.hub.x-10,g.hub.y); ctx.lineTo(g.hub.x+10,g.hub.y); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(g.hub.x,g.hub.y-10); ctx.lineTo(g.hub.x,g.hub.y+10); ctx.stroke()
      ctx.fillStyle=`rgba(0,220,255,${.7+hubPulse*.25})`; ctx.font='bold 7px monospace'; ctx.textAlign='center'
      ctx.fillText('HUB',g.hub.x,g.hub.y+3)
      ctx.fillStyle='rgba(0,180,255,.35)'; ctx.font='5px monospace'
      ctx.fillText(`${rActive} REGION${rActive!==1?'S':''}`,g.hub.x,g.hub.y+20)

      // ── SERVER REGIONS ──
      g.regions.forEach((reg:any,i:number)=>{
        if(!reg.active) return
        const rc=reg.col, isCrashed=reg.crashed>0, isBooting=reg.bootProg<100

        if(isBooting){
          // Boot sequence: progress bar
          r(reg.x-26,reg.y-22,52,44,'#020c18')
          ctx.strokeStyle=rc+'33'; ctx.lineWidth=1; ctx.strokeRect(reg.x-26,reg.y-22,52,44)
          r(reg.x-18,reg.y+4,36,7,'#030e1e')
          r(reg.x-18,reg.y+4,Math.floor(36*(reg.bootProg/100)),7,rc)
          ctx.fillStyle=rc+'aa'; ctx.font='bold 6px monospace'; ctx.textAlign='center'
          ctx.fillText('BOOTING',reg.x,reg.y-6)
          ctx.fillStyle=rc+'66'; ctx.font='5px monospace'
          ctx.fillText(`${Math.floor(reg.bootProg)}%`,reg.x,reg.y+20)
          if(g.frame%8<4){ r(reg.x+12,reg.y-12,4,4,rc) }
          return
        }

        const pulse=Math.sin(g.frame*.08+i*.9)*.5+.5
        if(!isCrashed){
          ctx.fillStyle=`${rc}${Math.floor((.05+pulse*.04)*255).toString(16).padStart(2,'0')}`
          ctx.beginPath(); ctx.arc(reg.x,reg.y,22+pulse*4,0,Math.PI*2); ctx.fill()
        }
        // Server stack
        const srvCount=reg.servers, bW=32, bH=8, gap=4
        const stackH=srvCount*(bH+gap)-gap
        const sx=reg.x-bW/2, sy=reg.y-stackH/2
        for(let si=0;si<srvCount;si++){
          const by=sy+si*(bH+gap)
          r(sx,by,bW,bH,isCrashed?'#1e0000':rc+'18')
          ctx.strokeStyle=isCrashed?'rgba(255,40,40,.5)':rc+'55'; ctx.lineWidth=1
          ctx.strokeRect(sx,by,bW,bH)
          if(!isCrashed){ r(sx+bW-6,by+2,4,4,si<srvCount-1?'#00ff41':'#00e5ff') }
        }
        ctx.fillStyle=isCrashed?'#cc2222':rc
        ctx.font='bold 7px monospace'; ctx.textAlign='center'
        ctx.fillText(isCrashed?'OFFLINE':reg.name,reg.x,reg.y+stackH/2+14)
        if(!isCrashed){
          ctx.fillStyle=rc+'66'; ctx.font='5px monospace'
          ctx.fillText(`${reg.servers}× · ${reg.pingMs}ms`,reg.x,reg.y-stackH/2-5)
        }
        if(isCrashed){
          ctx.strokeStyle=`rgba(255,40,40,${g.frame%10<5?.9:.3})`; ctx.lineWidth=2
          ctx.beginPath(); ctx.moveTo(reg.x-9,reg.y-9); ctx.lineTo(reg.x+9,reg.y+9); ctx.stroke()
          ctx.beginPath(); ctx.moveTo(reg.x+9,reg.y-9); ctx.lineTo(reg.x-9,reg.y+9); ctx.stroke()
        }
      })

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{
        ctx.globalAlpha=Math.max(0,pt.life/40)
        ctx.fillStyle=pt.col; ctx.fillRect(pt.x-pt.s/2,pt.y-pt.s/2,pt.s,pt.s)
        ctx.globalAlpha=1
      })

      // ── HUD ──
      r(0,0,W,26,'rgba(0,0,0,.92)')
      ctx.fillStyle='#00e5ffaa'; ctx.font='bold 8px monospace'; ctx.textAlign='left'
      ctx.fillText(`> ${STAGES[stage]}`,8,16)
      // TRAF bar (high = bad)
      const tc=g.trafficLoad>75?'#ff2244':g.trafficLoad>50?'#ffe600':'#00ff41'
      r(150,5,76,16,'#070712'); r(151,6,Math.floor(74*(g.trafficLoad/100)),14,tc)
      ctx.fillStyle='#2a2a4a'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.fillText('TRAF',154,15)
      ctx.fillStyle=tc; ctx.textAlign='right'; ctx.fillText(`${Math.ceil(g.trafficLoad)}%`,224,15)
      // UPTIME bar
      const uc2=g.uptime>80?'#00ff88':g.uptime>50?'#ffe600':'#ff2244'
      r(234,5,76,16,'#070712'); r(235,6,Math.floor(74*(g.uptime/100)),14,uc2)
      ctx.fillStyle='#2a2a4a'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.fillText('UPTM',238,15)
      ctx.fillStyle=uc2; ctx.textAlign='right'; ctx.fillText(`${Math.ceil(g.uptime)}%`,308,15)
      // STABILITY bar
      const sc=g.stability>70?'#00e5ff':g.stability>40?'#ffe600':'#ff2244'
      r(318,5,76,16,'#070712'); r(319,6,Math.floor(74*(g.stability/100)),14,sc)
      ctx.fillStyle='#2a2a4a'; ctx.font='7px monospace'; ctx.textAlign='left'; ctx.fillText('STAB',322,15)
      ctx.fillStyle=sc; ctx.textAlign='right'; ctx.fillText(`${Math.ceil(g.stability)}%`,392,15)
      // Combo
      if(g.combo>1){ ctx.fillStyle='#ffd700'; ctx.font='bold 8px monospace'; ctx.textAlign='center'; ctx.fillText(`×${g.combo} DEPLOY`,W/2,16) }
      // Live users (right)
      const uStr=g.liveUsers>=1000?`${(g.liveUsers/1000).toFixed(1)}K`:String(g.liveUsers)
      ctx.fillStyle='#00e5ff88'; ctx.font='bold 7px monospace'; ctx.textAlign='right'
      ctx.fillText(`▲ ${uStr} USERS`,W-8,16)
      // Progress bar
      r(0,22,W,4,'#03060e')
      const pgc=stage>=6?'#ff00ff':stage>=4?'#bf5af2':stage>=2?'#00e5ff':'#00ff88'
      r(0,22,Math.floor(W*(p/total)),4,pgc)

      // ── LAUNCH COUNTDOWN OVERLAY ──
      if(g.launchCountdown>120){
        const cnt=Math.ceil((g.launchCountdown-120)/20)
        ctx.fillStyle='rgba(0,0,0,.8)'; ctx.fillRect(W/2-80,H*.38,160,40)
        ctx.strokeStyle='rgba(0,229,255,.4)'; ctx.lineWidth=1; ctx.strokeRect(W/2-80,H*.38,160,40)
        ctx.fillStyle='#00e5ff'; ctx.font='bold 22px monospace'; ctx.textAlign='center'
        ctx.fillText(`T-${cnt}`,W/2,H*.38+28)
      } else if(g.launchCountdown>50){
        ctx.fillStyle='rgba(0,0,0,.8)'; ctx.fillRect(W/2-100,H*.38,200,40)
        ctx.strokeStyle='rgba(0,255,136,.4)'; ctx.lineWidth=1; ctx.strokeRect(W/2-100,H*.38,200,40)
        ctx.fillStyle='#00ff88'; ctx.font='bold 16px monospace'; ctx.textAlign='center'
        ctx.fillText('▶ LAUNCHING...',W/2,H*.38+27)
      } else if(g.launchCountdown>0){
        ctx.fillStyle=`rgba(0,180,100,${(g.launchCountdown/50)*.7})`
        ctx.font='bold 11px monospace'; ctx.textAlign='center'
        ctx.fillText('REGION ONLINE',W/2,H*.42)
      }

      // Rollback warning
      if(g.rollbackTimer>0&&g.frame%14<7){
        ctx.fillStyle='rgba(0,0,0,.88)'; ctx.fillRect(W/2-130,H*.33,260,30)
        ctx.strokeStyle='#ffe600'; ctx.lineWidth=1; ctx.strokeRect(W/2-130,H*.33,260,30)
        ctx.fillStyle='#ffe600'; ctx.font='bold 9px monospace'; ctx.textAlign='center'
        ctx.fillText('⚠ DEPLOYMENT ROLLBACK IN PROGRESS',W/2,H*.33+19)
      }
      // Launch success message
      if(g.launchFlash>22){
        const dmsg=isDeployTask?'PIPELINE DEPLOYED → SERVERS ONLINE':
                   isScaleTask?'AUTO-SCALE TRIGGERED → LOAD BALANCED':
                   isMonTask?'MONITORING RESTORED → ALL SYSTEMS GO':
                   isDockerTask?'CONTAINER SCALED → CAPACITY UP':
                   isDbTask?'DATABASE MIGRATED → STABLE':
                   'TASK SOLVED → DEPLOYMENT OK'
        ctx.fillStyle=`rgba(0,200,100,${(g.launchFlash-22)*.055})`
        ctx.font='bold 9px monospace'; ctx.textAlign='center'
        ctx.fillText(dmsg,W/2,H*.28)
      }
    }

        // ─── CSS PLATFORM RUNNER (CSS Course) ───
    // Neon cyberpunk auto-runner: CSS tasks style & build the world
    const drawCSSPlatform=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('csp' in cvs)){
        if(!cvs) return
        const gy=H-52
        cvs.csp={
          charY:gy-28, velY:0, onGround:true, jumpBoost:1,
          platforms:[] as {x:number;y:number;w:number;h:number;type:number;broken:boolean;label:string;col:string;ncol:string}[],
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string}[],
          glitch:[] as {x:number;y:number;w:number;h:number;life:number}[],
          scrollX:0, styleEnergy:60, worldBeauty:0, animCombo:0,
          prevState:'idle' as string, prevPassed:-1, frame:0, styleFlash:0, corruptFlash:0,
        }
        const g=cvs.csp
        for(let i=0;i<9;i++) g.platforms.push({x:i*110,y:gy,w:90,h:14,type:0,broken:false,label:'',col:'#1a2030',ncol:'#2a3a50'})
      }
      const g=cvs.csp
      const p=passedCount, total=Math.max(totalTasks,1), ratio=p/total
      const gy=H-52
      const stage=ratio<.08?0:ratio<.20?1:ratio<.35?2:ratio<.50?3:ratio<.65?4:ratio<.80?5:ratio<.93?6:7
      const STAGES=['BROKEN','BASIC CSS','STYLED','ANIMATED','FLEXBOX','GRID','NEON','ULTRA']
      const CSS_LABELS=['display:flex','grid-template','background:gradient','animation:pulse','border-radius','box-shadow','@keyframes','transform:scale','transition','filter:blur']
      const PLAT_COLS =['#1a2030','#1a3060','#0a3820','#2a1a50','#1a4040','#3a1800','#001a38','#200040']
      const PLAT_NCOLS=['#2a3a50','#2a50a0','#1a7030','#6a3ab0','#2a8080','#805020','#0050b0','#6000c0']

      // ── STATE TRANSITIONS ──
      if(g.prevState!==state){
        if(state==='correct'){
          g.styleFlash=35; g.animCombo++
          g.styleEnergy=Math.min(100,g.styleEnergy+15)
          g.worldBeauty+=10+g.animCombo*2
          g.jumpBoost=Math.min(2.5,1+g.animCombo*.15)
          // Spawn styled platform
          const pt=Math.min(stage,7)
          const extraH=g.animCombo>3?Math.floor(Math.random()*3)*25:0
          g.platforms.push({x:W+30,y:gy-extraH,w:80+Math.random()*40,h:14,
            type:pt,broken:false,label:CSS_LABELS[p%CSS_LABELS.length],
            col:PLAT_COLS[pt],ncol:PLAT_NCOLS[pt]})
          for(let i=0;i<16;i++){
            const a=Math.random()*Math.PI*2,s=3+Math.random()*4
            g.particles.push({x:80,y:g.charY,vx:Math.cos(a)*s,vy:Math.sin(a)*s-2,life:35+Math.random()*20,col:['#00e5ff','#00ff41','#ffd700','#bf5af2'][i%4]})
          }
        }
        if(state==='wrong'){
          g.corruptFlash=28; g.animCombo=0
          g.styleEnergy=Math.max(0,g.styleEnergy-20)
          g.jumpBoost=Math.max(0.7,g.jumpBoost-.2)
          const ahead=g.platforms.find((pl:any)=>pl.x>90&&pl.x<90+220&&!pl.broken)
          if(ahead) ahead.broken=true
          for(let i=0;i<10;i++){
            const a=Math.random()*Math.PI*2
            g.glitch.push({x:80+Math.cos(a)*50,y:g.charY+Math.sin(a)*25,w:6+Math.random()*14,h:4+Math.random()*8,life:20+Math.random()*15})
          }
        }
        g.prevState=state
      }

      // ── TASK PROGRESS ──
      if(g.prevPassed!==p){
        g.prevPassed=p
        if(p>0){
          const pt=Math.min(stage,7)
          g.platforms.push({x:W+60,y:gy-Math.floor(Math.random()*3)*28,
            w:80+p*3,h:14,type:pt,broken:false,
            label:CSS_LABELS[p%CSS_LABELS.length],col:PLAT_COLS[pt],ncol:PLAT_NCOLS[pt]})
        }
      }

      // Auto-fill gaps
      const lastX=g.platforms.reduce((mx:number,pl:any)=>Math.max(mx,pl.x+pl.w),0)
      const gapSize=Math.max(50,130-stage*12)
      if(lastX<W+gapSize){
        const pt=Math.min(Math.floor(stage*.9),7)
        const broken=Math.random()<Math.max(0,.08*(5-stage))
        g.platforms.push({x:lastX+20+Math.random()*20,y:gy-(stage>=3?Math.floor(Math.random()*3)*26:0),
          w:65+Math.random()*40,h:14,type:pt,broken,
          label:CSS_LABELS[pt%CSS_LABELS.length],col:PLAT_COLS[pt],ncol:PLAT_NCOLS[pt]})
      }

      // ── WORLD SCROLL ──
      const spd=1.2+stage*.3+(state==='correct'?.4:0)
      g.scrollX+=spd
      g.platforms.forEach((pl:any)=>pl.x-=spd)
      g.platforms=g.platforms.filter((pl:any)=>pl.x>-200)
      g.glitch.forEach((gt:any)=>{gt.x-=spd*.5;gt.life--})
      g.glitch=g.glitch.filter((gt:any)=>gt.life>0)

      // ── CHARACTER PHYSICS ──
      g.velY+=0.58
      g.onGround=false
      const cx=80
      g.platforms.forEach((pl:any)=>{
        if(!pl.broken&&cx+10>pl.x&&cx-10<pl.x+pl.w&&
            g.charY+14>=pl.y&&g.charY+14<=pl.y+pl.h+9&&g.velY>=0){
          g.charY=pl.y-14; g.velY=0; g.onGround=true
        }
      })
      // Auto-jump when gap ahead
      if(g.onGround){
        const noGround=!g.platforms.some((pl:any)=>
          !pl.broken&&pl.x<cx+70&&pl.x+pl.w>cx+12&&Math.abs(pl.y-(g.charY+14))<6)
        if(noGround){g.velY=-(8+g.jumpBoost*2);g.onGround=false}
      }
      // Respawn on fall
      if(g.charY>H+20){g.charY=gy-28;g.velY=0;g.styleEnergy=Math.max(0,g.styleEnergy-5)}
      g.charY+=g.velY
      if(g.charY>gy-14) g.charY=gy-14

      // Particles + slow energy drain
      g.particles.forEach((pt:any)=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.18;pt.life--})
      g.particles=g.particles.filter((pt:any)=>pt.life>0)
      if(g.frame%240===0&&g.styleEnergy>0) g.styleEnergy=Math.max(0,g.styleEnergy-1)
      g.frame++

      // ── SKY ──
      const sky=ctx.createLinearGradient(0,0,0,H)
      if(stage===0){sky.addColorStop(0,'#090909');sky.addColorStop(1,'#111')}
      else if(stage===1){sky.addColorStop(0,'#05081a');sky.addColorStop(1,'#0a0c22')}
      else if(stage===2){sky.addColorStop(0,'#040c1c');sky.addColorStop(1,'#060818')}
      else if(stage===3){sky.addColorStop(0,'#040a1e');sky.addColorStop(1,'#06102a')}
      else if(stage===4){sky.addColorStop(0,'#03061a');sky.addColorStop(1,'#080820')}
      else if(stage===5){sky.addColorStop(0,'#040410');sky.addColorStop(1,'#080618')}
      else if(stage===6){sky.addColorStop(0,'#030010');sky.addColorStop(1,'#060025')}
      else{sky.addColorStop(0,'#020012');sky.addColorStop(1,'#07002a')}
      ctx.fillStyle=sky;ctx.fillRect(0,0,W,H)

      // Stars (early) / neon grid (late)
      if(stage<=1){
        for(let i=0;i<40;i++){
          const br=.15+Math.sin(g.frame*.04+i)*.1
          ctx.fillStyle=`rgba(255,255,255,${br})`;ctx.fillRect((i*127+g.scrollX*.02)%W,(i*47)%(H*.55),1,1)
        }
      } else if(stage>=5){
        const gc=stage>=6?'rgba(160,40,255,.05)':'rgba(0,229,255,.04)'
        ctx.strokeStyle=gc;ctx.lineWidth=.5
        const gs=40
        for(let x=(g.scrollX*.3)%gs;x<W;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
        for(let y=0;y<H;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
      }

      // City silhouette (stage 3+)
      if(stage>=3){
        const ba=Math.min(.3,(stage-2)*.08)
        const bc=stage>=6?`rgba(140,20,220,${ba})`:`rgba(0,60,180,${ba})`
        for(let i=0;i<7;i++){
          const bx=(i*140-g.scrollX*.07)%(W+100)-50,bh=40+i*18
          ctx.fillStyle=bc;ctx.fillRect(bx,gy-bh,50+i*7,bh)
        }
      }

      // ── GROUND ──
      const gcol=stage<=1?'#0d0d10':stage<=3?'#080c18':stage<=5?'#060410':'#040018'
      r(0,gy+14,W,H-gy-14,gcol)

      // ── PLATFORMS ──
      g.platforms.forEach((pl:any)=>{
        if(pl.x+pl.w<0) return
        if(pl.broken){
          for(let bx=pl.x;bx<pl.x+pl.w;bx+=8){
            if((Math.floor(bx)+g.frame)%4!==0){
              ctx.fillStyle=`rgba(255,45,85,${.15+Math.random()*.2})`;ctx.fillRect(bx,pl.y+(Math.random()*4-2),6,pl.h)
            }
          }
          ctx.fillStyle='rgba(255,45,85,.5)';ctx.font='7px monospace';ctx.textAlign='center'
          ctx.fillText('broken',pl.x+pl.w/2,pl.y-3);return
        }
        // Body
        r(pl.x,pl.y,pl.w,pl.h,pl.col)
        // Top edge
        r(pl.x,pl.y,pl.w,2,pl.ncol)
        // Side glow (stage 3+)
        if(pl.type>=3){
          const ga=.18+Math.sin(g.frame*.05+pl.x*.02)*.08
          ctx.fillStyle=pl.ncol+(Math.floor(ga*255).toString(16).padStart(2,'0'))
          ctx.fillRect(pl.x-2,pl.y-4,pl.w+4,pl.h+8)
        }
        // Neon border (stage 5+)
        if(pl.type>=5){
          const ng=stage>=6?'#a020ff':'#00e5ff'
          ctx.strokeStyle=ng+'77';ctx.lineWidth=1;ctx.strokeRect(pl.x,pl.y,pl.w,pl.h)
          ctx.fillStyle=ng;ctx.fillRect(pl.x,pl.y,2,2);ctx.fillRect(pl.x+pl.w-2,pl.y,2,2)
        }
        // Pixel sparkles on top (ultra)
        if(pl.type>=7&&g.frame%20<10){
          const si=Math.floor(g.frame*.3+pl.x*.1)%Math.max(1,Math.floor(pl.w/8))
          ctx.fillStyle='#ffffff88';ctx.fillRect(pl.x+si*8,pl.y-2,2,2)
        }
        // CSS label
        if(pl.label&&pl.type>=2&&pl.w>55){
          ctx.fillStyle=pl.ncol+'cc';ctx.font='6px monospace';ctx.textAlign='center'
          ctx.fillText(pl.label,pl.x+pl.w/2,pl.y-4)
        }
      })

      // ── GLITCH TILES ──
      g.glitch.forEach((gt:any)=>{
        ctx.fillStyle=`rgba(255,45,85,${Math.max(0,gt.life/35)*.5})`;ctx.fillRect(gt.x,gt.y,gt.w,gt.h)
      })

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{
        ctx.globalAlpha=Math.max(0,pt.life/50)
        ctx.fillStyle=pt.col;ctx.fillRect(pt.x-2,pt.y-2,4,4);ctx.globalAlpha=1
      })

      // ── CHARACTER ──
      {
        const cy=g.charY,walk=Math.sin(g.frame*.18)*3,air=!g.onGround
        const cc=stage<=1?'#5a7a9a':stage<=3?'#00e5ff':stage<=5?'#bf5af2':'#ff9500'
        if(stage>=4){ctx.fillStyle=cc+'22';ctx.beginPath();ctx.arc(cx,cy,18,0,Math.PI*2);ctx.fill()}
        r(cx-6,cy-26,12,11,cc)
        r(cx-3,cy-24,3,3,'#fff');r(cx+1,cy-24,3,3,'#fff')
        r(cx-2,cy-23,2,2,'#000');r(cx+2,cy-23,2,2,'#000')
        r(cx-7,cy-15,14,12,cc)
        r(cx-12,cy-14+walk,5,9,cc);r(cx+7,cy-14-walk,5,9,cc)
        const l1=air?-4:walk,l2=air?4:-walk
        r(cx-6,cy-3,5,Math.max(4,9+l1),'#555');r(cx+1,cy-3,5,Math.max(4,9+l2),'#555')
        if(air){
          for(let ti=1;ti<4;ti++){ctx.fillStyle=cc+'33';ctx.fillRect(cx-6,cy-14+ti*5,12,3)}
        }
      }

      // ── STYLE FLASH ──
      if(g.styleFlash>0){
        ctx.fillStyle=`rgba(0,229,255,${(g.styleFlash/35)*.18})`;ctx.fillRect(0,0,W,H)
        if(g.styleFlash>22){ctx.fillStyle='#00e5ff';ctx.font='bold 11px monospace';ctx.textAlign='center';ctx.fillText('✦ STYLE UNLOCKED',W/2,H*.44)}
        g.styleFlash--
      }

      // ── CORRUPT FLASH ──
      if(g.corruptFlash>0){
        ctx.fillStyle=`rgba(255,45,85,${(g.corruptFlash/28)*.2})`;ctx.fillRect(0,0,W,H)
        if(g.corruptFlash>16){ctx.fillStyle='#ff2d55';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('✗ BROKEN RENDER',W/2,H*.44)}
        g.corruptFlash--
      }

      // ── HUD ──
      r(0,0,W,26,'rgba(0,0,0,.88)')
      const sg=stage>=6?'#a020ff':stage>=4?'#00e5ff':'#ffd700'
      ctx.fillStyle=sg;ctx.font='bold 9px monospace';ctx.textAlign='left'
      ctx.fillText(`◈ ${STAGES[stage]}`,8,17)
      // Style energy bar
      r(W-148,5,112,16,'#0a0a14')
      r(W-147,6,Math.floor(110*(g.styleEnergy/100)),14,g.styleEnergy>60?'#00e5ff':g.styleEnergy>30?'#ffd700':'#ff2d55')
      ctx.fillStyle='#ffffff44';ctx.font='7px monospace';ctx.textAlign='left';ctx.fillText('STYLE',W-144,16)
      // Combo badge
      if(g.animCombo>1){ctx.fillStyle='#ffd700';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(`×${g.animCombo} COMBO`,W/2,17)}
      // Progress bar
      r(0,22,W,4,'#111')
      const pc2=stage<=1?'#2a4080':stage<=3?'#00cc66':stage<=5?'#bf5af2':'#ff9500'
      r(0,22,Math.floor(W*(p/total)),4,pc2)

      // Scanlines
      ctx.fillStyle='rgba(0,0,0,.04)';for(let y=0;y<H;y+=3) ctx.fillRect(0,y,W,1)

      // ── VICTORY ──
      if(p>=total&&total>0){
        ctx.fillStyle='rgba(0,0,0,.82)';ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle=`rgba(160,30,255,${.12+Math.sin(g.frame*.05)*.05})`;ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#a020ff';ctx.font='bold 14px monospace';ctx.textAlign='center'
        ctx.fillText('🎨 CSS ULTRA MASTER!',W/2,H/2-12)
        ctx.fillStyle='#00e5ff';ctx.font='10px monospace';ctx.fillText('World fully styled!',W/2,H/2+8)
        ctx.fillStyle='#ffd700';ctx.font='9px monospace'
        ctx.fillText(`Beauty: ${g.worldBeauty} | Combo: ${g.animCombo}`,W/2,H/2+24)
      }
    }

    const drawCity=()=>{
      const sky=ctx.createLinearGradient(0,0,0,H)
      sky.addColorStop(0,'#040610'); sky.addColorStop(1,'#080c18')
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H)
      stars(130)
      r(0,H-35,W,35,'#0a0a18')
      for(let i=0;i<W;i+=20) r(i,H-35,18,3,'#14142a')
      const blds=[
        {x:30, maxH:90, w:40, col:'#1a3060', win:'#4488ff', label:'HTML'},
        {x:90, maxH:120,w:50, col:'#2a1050', win:'#8844ff', label:'CSS'},
        {x:160,maxH:80, w:40, col:'#103040', win:'#44ffaa', label:'JS'},
        {x:220,maxH:100,w:45, col:'#402010', win:'#ff8844', label:'DOM'},
        {x:285,maxH:70, w:40, col:'#203010', win:'#88ff44', label:'REACT'},
        {x:345,maxH:110,w:50, col:'#301040', win:'#ff44aa', label:'API'},
        {x:415,maxH:90, w:45, col:'#102040', win:'#44aaff', label:'FULL'},
      ]
      const visibleCount=Math.min(progress,blds.length)
      blds.slice(0,visibleCount).forEach((b,i)=>{
        const isNew=i===visibleCount-1&&state==='correct'&&buildAnim<b.maxH
        const curH=isNew?Math.min(buildAnim,b.maxH):b.maxH
        if(isNew) buildAnim+=4
        const by=H-35-curH
        r(b.x,by,b.w,curH,b.col)
        for(let wy=by+6;wy<H-40;wy+=12){
          for(let wx=b.x+4;wx<b.x+b.w-6;wx+=10){
            const lit=Math.random()>.25
            r(wx,wy,6,7,lit?b.win:'#0a0a18')
          }
        }
        ctx.fillStyle='#ffffff33';ctx.font='9px monospace';ctx.textAlign='center'
        ctx.fillText(b.label,b.x+b.w/2,H-38)
        if(b.maxH>90){ r(b.x+b.w/2-1,by-15,2,16,'#aaa'); r(b.x+b.w/2-4,by-14,8,2,'#aaa') }
      })
      if(visibleCount<blds.length){
        const next=blds[visibleCount]
        ctx.fillStyle='rgba(100,150,255,0.08)'
        ctx.fillRect(next.x,H-35-next.maxH,next.w,next.maxH)
        ctx.strokeStyle='rgba(100,150,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([3,3])
        ctx.strokeRect(next.x,H-35-next.maxH,next.w,next.maxH)
        ctx.setLineDash([])
        ctx.fillStyle='rgba(100,150,255,0.4)';ctx.font='9px monospace';ctx.textAlign='center'
        ctx.fillText(next.label,next.x+next.w/2,H-38)
      }
      const workerX=visibleCount<blds.length?blds[Math.min(visibleCount,blds.length-1)].x+20:W-60
      const jump=state==='correct'?Math.abs(Math.sin(f*.3))*20:0
      drawChar(workerX,H-45,'#ffe600',state==='running',jump)
      r(W-170,8,160,28,'rgba(0,0,0,.5)')
      r(W-168,10,156,24,'#0a1020')
      tx(`CITY ${progress}/${Math.min(totalTasks,blds.length)}`,W-90,28,'#ffe600',10)
      r(W-168,10,Math.floor(156*(progress/Math.max(totalTasks,1))),4,'#00ff41')
      if(state==='idle') tx('▼ ANSWER TO BUILD',W/2-100,H-8,'#2a4a6a',5,'left')
      else if(state==='correct'){
        if(f>5){
          tx('✓ BUILDING ADDED!',W/2,40,'#00ff41',9)
          if(f>15){tx('+XP',W/2,58,'#ffe600',7);if(f===16) burst(workerX,H-60,['#ffe600','#00ff41','#4488ff'])}
        }
      }
      else if(state==='wrong'){
        tx('✗ WRONG!',W/2,35,'#ff0040',8)
        if(visibleCount>0){
          const b=blds[visibleCount-1]
          ctx.fillStyle='rgba(255,0,64,.3)'
          ctx.fillRect(b.x,H-35-b.maxH,b.w,b.maxH)
        }
      }
    }

    const games:Record<string,()=>void>={ jump:drawJump, enemy:drawEnemy, evolution:drawEvolution,
      cssplatform:drawCSSPlatform, codequestbattle:drawCodeQuestBattle,
      autocoderunner:drawAutoCodeRunner, onlinecodefactory:drawOnlineCodeFactory,
      taskbattlesurvival:drawTaskBattleSurvival, multiplayerarena:drawMultiplayerArena,
      codefactory:drawCodeFactory, city:drawCity
    }

    const draw=()=>{
      if(!canvasRef.current) return
      ;(games[gameType]||drawEvolution)()
      particles=particles.filter(p=>{
        p.x+=p.vx;p.y+=p.vy;p.vy+=.2;p.life--
        if(p.life<=0) return false
        ctx.globalAlpha=p.life/55;ctx.fillStyle=p.color;ctx.fillRect(p.x,p.y,p.s,p.s)
        ctx.globalAlpha=1;return true
      })
      scanlines()
      f++;rafRef.current=requestAnimationFrame(draw)
    }
    f=0;buildAnim=0;particles=[]
    rafRef.current=requestAnimationFrame(draw)
    return()=>{
      cancelAnimationFrame(rafRef.current)
      const g=(canvasRef.current as any)?.cqb
      if(g?.keyHandler){
        window.removeEventListener('keydown',g.keyHandler)
        window.removeEventListener('keyup',g.keyHandler)
        delete (canvasRef.current as any).cqb
      }
    }
  },[state,gameType,passedCount,totalTasks])

  const GAME_LABELS: Record<string,{icon:string;name:string;col:string}> = {
    evolution:        {icon:'🌱',name:'EVOLUTION',      col:'#00ff41'},
    cssplatform:      {icon:'🎨',name:'CSS PLATFORM',   col:'#bf5af2'},
    codequestbattle:  {icon:'⚔️', name:'CODE QUEST',    col:'#ff9500'},
    taskbattlesurvival:{icon:'🛡',name:'BATTLE ARENA',  col:'#ff2244'},
    autocoderunner:   {icon:'🤖',name:'AUTO RUNNER',    col:'#00e5ff'},
    onlinecodefactory:{icon:'⚙️', name:'CODE FACTORY',  col:'#00ff88'},
    multiplayerarena: {icon:'🌐',name:'NET ARENA',      col:'#4488ff'},
    codefactory:      {icon:'🚀',name:'DEPLOY',         col:'#ffd700'},
    jump:             {icon:'🎯',name:'JUMP',            col:'#bf5af2'},
    enemy:            {icon:'⚡',name:'BUG HUNT',        col:'#ff2244'},
    city:             {icon:'🏙',name:'CITY BUILD',      col:'#ffe600'},
  }
  const gInfo = GAME_LABELS[gameType] ?? {icon:'🎮',name:'GAME',col:'#1a3050'}

  const sc=state==='correct'?'#00ff41':state==='wrong'?'#ff0040':'#1a3050'
  const stateLabel=state==='correct'?'CORRECT':state==='wrong'?'WRONG':'PLAYING'
  return(
    <div style={{display:'flex',flexDirection:'column',height:'100%',background:'#020609'}}>
      {/* ── GAME HEADER ── */}
      <div style={{
        display:'flex',alignItems:'center',gap:8,flexShrink:0,
        background:'#010407',borderBottom:`1px solid ${gInfo.col}22`,
        padding:'0 12px',height:32,position:'relative',overflow:'hidden',
      }}>
        {/* left accent bar */}
        <div style={{width:3,height:20,background:gInfo.col,boxShadow:`0 0 6px ${gInfo.col}`,flexShrink:0}}/>
        {/* icon + name */}
        <span style={{fontFamily:'var(--fp)',fontSize:8,color:gInfo.col,letterSpacing:2,flexShrink:0}}>
          {gInfo.icon} {gInfo.name}
        </span>
        {/* state pill */}
        <div style={{
          padding:'2px 8px',border:`1px solid ${sc}44`,background:`${sc}0d`,flexShrink:0,
        }}>
          <span style={{fontFamily:'var(--fp)',fontSize:5,color:sc,letterSpacing:2}}>{stateLabel}</span>
        </div>
        {/* progress bar (right) */}
        <div style={{flex:1,height:4,background:'#03060e',marginLeft:4,position:'relative'}}>
          <div style={{
            position:'absolute',top:0,left:0,height:'100%',
            width:`${totalTasks>0?Math.round((passedCount/totalTasks)*100):0}%`,
            background:gInfo.col,boxShadow:`0 0 6px ${gInfo.col}`,
            transition:'width .4s ease',
          }}/>
        </div>
        {/* task title (right) */}
        <span style={{fontFamily:'var(--fp)',fontSize:5,color:'#2a3a54',flexShrink:0,
          maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
          {taskTitle}
        </span>
        {/* top edge glow line */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:1,
          background:`linear-gradient(90deg,transparent,${gInfo.col}55,transparent)`}}/>
      </div>
      <canvas ref={canvasRef} style={{flex:1,width:'100%',imageRendering:'pixelated',display:'block'}}/>
    </div>
  )
}

/* ══ GUIDE PANEL COMPONENT ══ */
