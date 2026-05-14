// @ts-nocheck
// ── REACT GAMES ──
// These game draw functions are closures — they use ctx, W, H, f, state, passedCount, etc.
// from the parent GameTaskCanvas component via closure scope.

    const drawAutoCodeRunner=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('acr' in cvs)){
        cvs.acr={
          px:60, py:H/2,
          enemies:[] as {x:number;y:number;hp:number;id:number}[],
          bullets:[] as {x:number;y:number;id:number}[],
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string}[],
          score:0, hp:100, frame:0, dist:0,
          prevPassed:-1,
        }
      }
      const g=cvs.acr
      const p=passedCount
      const total=Math.max(totalTasks,1)

      // Feature flags
      const hasSpeed   = p >= 1   // player moves faster
      const hasEnemy   = p >= 2   // enemies appear
      const hasAttack  = p >= 3   // auto bullets
      const hasHP      = p >= 4   // HP/lose/win system
      const hasFaster  = p >= 6
      const hasMulti   = p >= 8
      const isComplete = p >= total

      // Reset on task change
      if(g.prevPassed !== p){
        g.prevPassed = p
        if(state==='correct'){
          // Reward burst
          for(let i=0;i<20;i++){
            const a=Math.random()*Math.PI*2
            g.particles.push({x:g.px,y:g.py,vx:Math.cos(a)*4,vy:Math.sin(a)*4,life:40,col:['#00ff41','#ffe600','#00e5ff'][i%3]})
          }
          g.score += 3
          if(hasHP) g.hp = Math.min(100, g.hp+20)
        }
      }

      // ── UPDATE ──
      const spd = hasSpeed ? (2 + p*0.4 + (hasFaster?2:0)) : 0.5
      g.dist += spd

      // Player bob
      g.py = H/2 + Math.sin(g.frame*0.06)*18

      // Spawn enemies
      if(hasEnemy && g.frame%Math.max(40-p*3,15)===0){
        const count = hasMulti ? 1+Math.floor(Math.random()*3) : 1
        for(let i=0;i<count;i++){
          g.enemies.push({x:W+30+i*40, y:40+Math.random()*(H-80), hp:2, id:Date.now()+i})
        }
      }

      // Move enemies left
      g.enemies.forEach((e:any)=>{ e.x -= 1.5+p*0.2 })
      g.enemies = g.enemies.filter((e:any)=>e.x>-30&&e.hp>0)

      // Auto bullets
      if(hasAttack && g.frame%18===0){
        g.bullets.push({x:g.px+16, y:g.py, id:Date.now()})
      }
      g.bullets.forEach((b:any)=>{ b.x += 10 })
      // Bullet-enemy collision
      g.bullets = g.bullets.filter((b:any)=>{
        if(b.x>W) return false
        let hit=false
        g.enemies.forEach((e:any)=>{
          if(Math.abs(b.x-e.x)<20&&Math.abs(b.y-e.y)<20){
            e.hp--; hit=true
            for(let i=0;i<6;i++){
              const a=Math.random()*Math.PI*2
              g.particles.push({x:e.x,y:e.y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:20,col:'#ff4444'})
            }
            if(e.hp<=0) g.score++
          }
        })
        return !hit
      })

      // Enemy-player collision → HP
      if(hasHP){
        g.enemies.forEach((e:any)=>{
          if(Math.abs(g.px-e.x)<24&&Math.abs(g.py-e.y)<24){
            g.hp = Math.max(0, g.hp-1)
            e.x = W+60
          }
        })
      }

      // Particles
      g.particles.forEach((pt:any)=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.life--})
      g.particles = g.particles.filter((pt:any)=>pt.life>0)

      g.frame++

      // ── DRAW ──
      // Sky gradient
      const sky=ctx.createLinearGradient(0,0,0,H)
      sky.addColorStop(0,'#060010'); sky.addColorStop(1,'#0a0020')
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H)

      // Scrolling ground
      const gnd=Math.floor(g.dist)
      ctx.fillStyle='#0d0025'; ctx.fillRect(0,H-28,W,28)
      for(let i=0;i<W;i+=60){
        const x=(i-gnd%60)
        ctx.fillStyle='rgba(100,60,200,.15)'
        ctx.fillRect(x,H-26,50,9)
      }

      // Distance trail
      for(let i=0;i<5;i++){
        ctx.fillStyle=`rgba(100,60,200,${.04*(5-i)})`
        ctx.fillRect(g.px-4-i*6,g.py-10,4,20)
      }

      // ── PARTICLES ──
      g.particles.forEach((pt:any)=>{
        ctx.globalAlpha=pt.life/40
        ctx.fillStyle=pt.col; ctx.fillRect(pt.x-2,pt.y-2,4,9)
        ctx.globalAlpha=1
      })

      // ── BULLETS ──
      g.bullets.forEach((b:any)=>{
        const grad=ctx.createLinearGradient(b.x-20,0,b.x,0)
        grad.addColorStop(0,'transparent'); grad.addColorStop(1,'#00e5ff')
        ctx.fillStyle=grad; ctx.fillRect(b.x-20,b.y-2,20,9)
        ctx.fillStyle='#fff'; ctx.fillRect(b.x-2,b.y-2,6,9)
      })

      // ── ENEMIES ──
      g.enemies.forEach((e:any,i:number)=>{
        const bob=Math.sin(g.frame*.1+i)*4
        // Glow
        ctx.fillStyle='rgba(255,50,50,.15)'
        ctx.beginPath();ctx.arc(e.x,e.y+bob,20,0,Math.PI*2);ctx.fill()
        // Body
        ctx.fillStyle=e.hp>1?'#cc2233':'#ff5566'
        ctx.beginPath();ctx.arc(e.x,e.y+bob,12,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#ff8888'
        ctx.beginPath();ctx.arc(e.x,e.y+bob,9,0,Math.PI*2);ctx.fill()
        // Eyes
        ctx.fillStyle='#ff0'
        ctx.beginPath();ctx.arc(e.x-4,e.y+bob-3,3,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(e.x+4,e.y+bob-3,3,0,Math.PI*2);ctx.fill()
        // HP bar
        if(e.hp>1){
          r(e.x-14,e.y+bob-24,28,5,'#300')
          r(e.x-14,e.y+bob-24,14,5,'#f44')
        }
      })

      // ── PLAYER ──
      {
        const dim=hasSpeed?1:.6
        ctx.globalAlpha=dim
        // Glow
        ctx.fillStyle=`rgba(100,200,255,.${hasSpeed?'2':'05'})`
        ctx.beginPath();ctx.arc(g.px,g.py,22,0,Math.PI*2);ctx.fill()
        // Speed lines
        if(hasSpeed){
          for(let i=0;i<4;i++){
            ctx.fillStyle=`rgba(0,229,255,${.15-i*.03})`
            ctx.fillRect(g.px-20-i*14,g.py-3+i%2*6,12,3)
          }
        }
        // Body
        ctx.fillStyle='#00e5ff'
        ctx.beginPath();ctx.arc(g.px,g.py,12,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#fff'
        ctx.beginPath();ctx.arc(g.px-4,g.py-3,3,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(g.px+4,g.py-3,3,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#000'
        ctx.beginPath();ctx.arc(g.px-3,g.py-3,1.5,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(g.px+5,g.py-3,1.5,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='rgba(0,229,255,.5)'; ctx.fillRect(g.px-4,g.py,9,3)
        ctx.globalAlpha=1
      }

      // ── LOCKED state ──
      if(!hasSpeed){
        ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,28,W,H-28)
        ctx.fillStyle='rgba(80,40,160,.2)'; ctx.fillRect(W/2-150,H/2-50,300,100)
        ctx.strokeStyle='rgba(100,60,200,.5)'; ctx.lineWidth=1
        ctx.strokeRect(W/2-150,H/2-50,300,100)
        ctx.fillStyle='#bf5af2'; ctx.font='bold 16px monospace'; ctx.textAlign='center'
        ctx.fillText('⚡ Task 1 → SPEED UP',W/2,H/2-10)
        ctx.fillStyle='#6a4a9a'; ctx.font='12px monospace'
        ctx.fillText('Code бичвэл game эхэлнэ',W/2,H/2+22)
      }

      // ── HUD ──
      r(0,0,W,26,'rgba(0,0,0,.8)')

      // Feature pills
      const pills=[
        {n:'⚡SPEED',on:hasSpeed,col:'#00e5ff'},
        {n:'👾ENEMY',on:hasEnemy,col:'#ff4444'},
        {n:'⚔️AUTO',on:hasAttack,col:'#ffe600'},
        {n:'❤️HP',on:hasHP,col:'#ff6688'},
      ]
      pills.forEach((pl,i)=>{
        const px2=8+i*72
        r(px2,4,66,18,pl.on?pl.col+'22':'rgba(255,255,255,.04)')
        ctx.strokeStyle=pl.on?pl.col:'rgba(255,255,255,.1)'; ctx.lineWidth=1
        ctx.strokeRect(px2,4,66,18)
        ctx.fillStyle=pl.on?pl.col:'rgba(255,255,255,.2)'; ctx.font='bold 14px monospace'; ctx.textAlign='center'
        ctx.fillText(pl.n,px2+33,18)
      })

      // HP bar
      if(hasHP){
        r(W-130,5,120,16,'#1a0020')
        r(W-129,6,Math.floor(118*(g.hp/100)),14,g.hp>50?'#00cc33':g.hp>25?'#ff9900':'#ff2244')
        ctx.fillStyle='#fff'; ctx.font='bold 14px monospace'; ctx.textAlign='right'
        ctx.fillText(`❤️${Math.ceil(g.hp)}`,W-8,19)
      }

      // Score + distance
      ctx.fillStyle='#ffe600'; ctx.font='bold 11px monospace'; ctx.textAlign='center'
      ctx.fillText(`💀${g.score} kills`,W/2+60,19)

      // Progress bar
      r(0,22,W,4,'#111')
      r(0,22,Math.floor(W*(p/total)),4,hasHP?'#00ff41':hasFaster?'#ffe600':hasAttack?'#ff4444':hasEnemy?'#ff8800':hasSpeed?'#00e5ff':'#333')

      // Unlock banner
      const unlocks:Record<number,string>={1:'⚡ SPEED UNLOCKED!',2:'👾 ENEMY SPAWNED!',3:'⚔️ AUTO ATTACK ON!',4:'❤️ HP SYSTEM LIVE!',6:'🚀 HYPERSPEED!',8:'💥 MULTI ENEMY!'}
      if(state==='correct'&&f<25&&unlocks[p]){
        ctx.fillStyle='rgba(0,0,0,.75)'; ctx.fillRect(W/2-130,H/2-20,260,36)
        ctx.strokeStyle='#00ff41'; ctx.lineWidth=1; ctx.strokeRect(W/2-130,H/2-20,260,36)
        ctx.fillStyle='#00ff41'; ctx.font='bold 14px monospace'; ctx.textAlign='center'
        ctx.fillText(unlocks[p],W/2,H/2+6)
      }

      // Game over / win
      if(hasHP&&g.hp<=0){
        ctx.fillStyle='rgba(0,0,0,.85)'; ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#ff2244'; ctx.font='bold 22px monospace'; ctx.textAlign='center'
        ctx.fillText('💀 DEFEATED',W/2,H/2-15)
        ctx.fillStyle='#aaa'; ctx.font='11px monospace'
        ctx.fillText('Зөв хариулт өгч HP нөхөөрэй',W/2,H/2+12)
      }
      if(isComplete){
        ctx.fillStyle='rgba(0,0,0,.85)'; ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#ffd700'; ctx.font='bold 22px monospace'; ctx.textAlign='center'
        ctx.fillText('🏆 REACT MASTER!',W/2,H/2-15)
        ctx.fillStyle='#00ff41'; ctx.font='11px monospace'
        ctx.fillText(`Score: ${g.score} kills | HP: ${Math.ceil(g.hp)}`,W/2,H/2+12)
      }

      // Correct flash
      if(state==='correct'&&f<12&&!unlocks[p]){
        ctx.fillStyle=`rgba(0,255,65,${.1-f*.009})`; ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#00ff41'; ctx.font='bold 14px monospace'; ctx.textAlign='center'
        if(f<8) ctx.fillText('+3 SCORE +20 HP',W/2,H/2)
      } else if(state==='wrong'&&f<10){
        ctx.fillStyle=`rgba(255,0,64,${.08-f*.008})`; ctx.fillRect(0,26,W,H-26)
      }
    }

    
    // ─── SERVER DEFENSE (Backend Course) ───

