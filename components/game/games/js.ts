// @ts-nocheck
// ── JS GAMES ──
// These game draw functions are closures — they use ctx, W, H, f, state, passedCount, etc.
// from the parent GameTaskCanvas component via closure scope.

    const drawCodeQuestBattle=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('cqb' in cvs)){
        cvs.cqb={
          px:W/2,py:H/2,
          keys:{} as Record<string,boolean>,
          kd:null as any,ku:null as any,
          doorAnim:0, roomFlash:0, prevPassed:-1,
        }
        const g=cvs.cqb
        g.kd=(e:KeyboardEvent)=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();g.keys[e.key]=true}}
        g.ku=(e:KeyboardEvent)=>{delete g.keys[e.key]}
        window.addEventListener('keydown',g.kd)
        window.addEventListener('keyup',g.ku)
      }
      const g=cvs.cqb
      const p=passedCount
      const total=Math.max(totalTasks,1)

      // Room transition flash
      if(g.prevPassed!==p){
        g.doorAnim=0; g.roomFlash=30
        // Teleport player to center of new room
        g.px=W/2; g.py=H/2
        g.prevPassed=p
      }
      if(g.roomFlash>0) g.roomFlash--
      if(state==='correct'&&f<3) g.doorAnim=60

      // Move player (only if task done = door open)
      const doorOpen=p>0
      if(doorOpen){
        const spd=3
        if(g.keys['ArrowLeft'])  g.px=Math.max(24,g.px-spd)
        if(g.keys['ArrowRight']) g.px=Math.min(W-24,g.px+spd)
        if(g.keys['ArrowUp'])    g.py=Math.max(50,g.py-spd)
        if(g.keys['ArrowDown'])  g.py=Math.min(H-24,g.py+spd)
      }

      // ── ROOM COLORS per stage ──
      const roomPalettes=[
        {wall:'#1a0a2a',floor:'#120818',accent:'#bf5af2',name:'START ROOM'},
        {wall:'#0a1a2a',floor:'#081020',accent:'#00e5ff',name:'VARIABLE ROOM'},
        {wall:'#0a2a10',floor:'#081808',accent:'#00ff41',name:'FUNCTION ROOM'},
        {wall:'#2a1a00',floor:'#180e00',accent:'#ffe600',name:'LOOP ROOM'},
        {wall:'#2a0a0a',floor:'#180808',accent:'#ff2244',name:'ENEMY ROOM'},
        {wall:'#002a2a',floor:'#001818',accent:'#00ffff',name:'COLLISION ROOM'},
        {wall:'#1a1a00',floor:'#101000',accent:'#ffcc00',name:'AI ROOM'},
        {wall:'#0a0a2a',floor:'#080820',accent:'#4488ff',name:'ENGINE ROOM'},
        {wall:'#2a0a2a',floor:'#180818',accent:'#ff44ff',name:'UI ROOM'},
        {wall:'#002a00',floor:'#001800',accent:'#00ff88',name:'BOSS ROOM'},
      ]
      const roomIdx=Math.min(p,roomPalettes.length-1)
      const room=roomPalettes[roomIdx]

      // ── DRAW ROOM ──
      // Floor
      ctx.fillStyle=room.floor; ctx.fillRect(0,0,W,H)
      // Floor tiles
      for(let tx=0;tx<W;tx+=40){
        for(let ty=40;ty<H;ty+=40){
          ctx.fillStyle=`rgba(255,255,255,${(tx+ty)%80===0?.04:.02})`
          ctx.fillRect(tx+1,ty+1,38,38)
        }
      }
      // Walls (top/bottom/left/right borders)
      ctx.fillStyle=room.wall
      ctx.fillRect(0,0,W,32)           // top wall
      ctx.fillRect(0,H-24,W,24)        // bottom wall
      ctx.fillRect(0,32,20,H-56)       // left wall
      ctx.fillRect(W-20,32,20,H-56)    // right wall
      // Wall bricks
      ctx.fillStyle=`rgba(255,255,255,.04)`
      for(let bx=0;bx<W;bx+=32) ctx.fillRect(bx,2,30,28)
      for(let bx=16;bx<W;bx+=32) ctx.fillRect(bx,H-22,30,20)

      // Room number + name
      ctx.fillStyle=room.accent; ctx.font='bold 14px monospace'; ctx.textAlign='left'
      ctx.fillText(`ROOM ${p+1}/${total}`,28,21)
      ctx.fillStyle=`${room.accent}bb`; ctx.font='12px monospace'; ctx.textAlign='center'
      ctx.fillText(room.name,W/2,21)

      // ── DOOR (right wall center) ──
      const doorX=W-20, doorY=H/2-30, doorH=60
      const doorProgress=Math.min(p/total,1)
      // Door frame
      ctx.fillStyle='#2a1a3a'
      ctx.fillRect(doorX-4,doorY-4,28,doorH+8)
      // Door itself
      const isOpen=p>=total
      const doorOpenPx=isOpen?doorH:Math.min(g.doorAnim/60*doorH,doorH*doorProgress)
      // Door background (open space)
      if(doorOpenPx>0){
        ctx.fillStyle='rgba(0,255,65,.15)'
        ctx.fillRect(doorX,doorY+doorH-doorOpenPx,20,doorOpenPx)
        // Light rays
        for(let i=0;i<3;i++){
          ctx.fillStyle=`rgba(0,255,65,${.06-i*.02})`
          ctx.fillRect(doorX-i*8,doorY+doorH-doorOpenPx,20+i*16,doorOpenPx)
        }
      }
      // Door panels (slide up when opening)
      if(!isOpen){
        ctx.fillStyle=room.wall
        ctx.fillRect(doorX,doorY,20,doorH-doorOpenPx)
        // Door grid lines
        ctx.strokeStyle=`${room.accent}44`; ctx.lineWidth=1
        ctx.strokeRect(doorX+2,doorY+2,16,doorH-doorOpenPx-4)
        ctx.beginPath(); ctx.moveTo(doorX+12,doorY+4); ctx.lineTo(doorX+12,doorY+doorH-doorOpenPx-4); ctx.stroke()
        // Lock icon
        if(doorOpenPx===0){
          ctx.fillStyle=room.accent+'88'; ctx.font='20px serif'; ctx.textAlign='center'
          ctx.fillText('🔒',doorX+10,doorY+doorH/2+5)
        }
      } else {
        // Fully open - passage to next room
        ctx.fillStyle='rgba(0,255,65,.3)'
        ctx.fillRect(doorX,doorY,20,doorH)
        ctx.fillStyle='#00ff41'; ctx.font='bold 10px monospace'; ctx.textAlign='center'
        ctx.fillText('→',doorX+10,doorY+doorH/2+3)
      }

      // Door progress label
      ctx.fillStyle=doorOpenPx>0?'#00ff41':'#4a3a6a'
      ctx.font='9px monospace'; ctx.textAlign='center'
      ctx.fillText(isOpen?'OPEN!':p===0?'DO TASK →':`${Math.round(doorProgress*100)}%`,doorX+10,doorY+doorH+14)

      // ── TASK CLUE on wall ──
      const clues=[
        '📜 Write code to\nopen the door',
        '💡 var x = 0',
        '⚡ function move()',
        '🔄 for(let i=0...)',
        '👾 if(collision)',
        '💥 checkHit()',
        '🧠 enemy.chase()',
        '🔁 gameLoop()',
        '🎨 updateUI()',
        '🏆 FINAL TASK!',
      ]
      const clue=clues[Math.min(p,clues.length-1)]
      ctx.fillStyle=`${room.accent}33`
      ctx.fillRect(30,50,160,60)
      ctx.strokeStyle=`${room.accent}44`; ctx.lineWidth=1
      ctx.strokeRect(30,50,160,60)
      ctx.fillStyle=room.accent; ctx.font='bold 10px monospace'; ctx.textAlign='left'
      ctx.fillText('📋 CLUE:',38,65)
      ctx.fillStyle=`${room.accent}cc`; ctx.font='12px monospace'
      clue.split('\n').forEach((line,i)=>ctx.fillText(line,38,80+i*14))

      // ── PLAYER ──
      if(g.roomFlash>0){
        // Room transition flash
        ctx.fillStyle=`rgba(255,255,255,${g.roomFlash/30*.4})`
        ctx.fillRect(0,0,W,H)
      } else {
        const jmp=state==='correct'?Math.abs(Math.sin(f*.28))*8:0
        const pyy=g.py-jmp
        const dim=doorOpen?1:.5
        ctx.globalAlpha=dim
        // Torch light effect
        const grad=ctx.createRadialGradient(g.px,pyy,0,g.px,pyy,80)
        grad.addColorStop(0,`${room.accent}15`); grad.addColorStop(1,'transparent')
        ctx.fillStyle=grad; ctx.fillRect(g.px-80,pyy-80,160,160)
        // Shadow
        ctx.fillStyle='rgba(0,0,0,.3)'
        ctx.beginPath();ctx.ellipse(g.px,g.py+14,12,4,0,0,Math.PI*2);ctx.fill()
        // Body
        ctx.fillStyle='#00e5ff'
        ctx.beginPath();ctx.arc(g.px,pyy,12,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#fff'
        ctx.beginPath();ctx.arc(g.px-4,pyy-3,3,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(g.px+4,pyy-3,3,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#000'
        ctx.beginPath();ctx.arc(g.px-3,pyy-3,1.5,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(g.px+5,pyy-3,1.5,0,Math.PI*2);ctx.fill()
        ctx.fillStyle=`${room.accent}66`
        ctx.fillRect(g.px-5,pyy,10,3)
        ctx.globalAlpha=1
        // Lock indicator
        if(!doorOpen){
          ctx.fillStyle='#bf5af2'; ctx.font='20px serif'; ctx.textAlign='center'
          ctx.fillText('🔒',g.px,pyy-22)
        } else if(f<80){
          ctx.fillStyle='rgba(0,229,255,.7)'; ctx.font='20px serif'; ctx.textAlign='center'
          ctx.fillText('→',g.px+28,pyy+4)
        }
      }

      // ── CORRECT UNLOCK animation ──
      if(state==='correct'&&f<30){
        ctx.fillStyle=`rgba(0,255,65,${.08-f*.003})`
        ctx.fillRect(0,0,W,H)
        if(f<20){
          ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(W/2-120,H/2-22,240,40)
          ctx.strokeStyle='#00ff41'; ctx.lineWidth=1.5; ctx.strokeRect(W/2-120,H/2-22,240,40)
          ctx.fillStyle='#00ff41'; ctx.font='bold 11px monospace'; ctx.textAlign='center'
          ctx.fillText('🔓 DOOR UNLOCKED!',W/2,H/2+4)
        }
      } else if(state==='wrong'&&f<12){
        ctx.fillStyle=`rgba(255,0,64,${.08-f*.007})`; ctx.fillRect(0,0,W,H)
        if(f<8){
          ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(W/2-100,H/2-18,200,32)
          ctx.strokeStyle='#ff0040'; ctx.lineWidth=1; ctx.strokeRect(W/2-100,H/2-18,200,32)
          ctx.fillStyle='#ff0040'; ctx.font='bold 13px monospace'; ctx.textAlign='center'
          ctx.fillText('✗ DOOR STAYS LOCKED',W/2,H/2+4)
        }
      }

      // Keyboard hint
      if(doorOpen&&f<100){
        ctx.fillStyle='rgba(255,255,255,.2)'; ctx.font='10px monospace'; ctx.textAlign='center'
        ctx.fillText('⌨ ARROW KEYS',W/2,H-6)
      }
    }

    
    // ─── AUTO CODE RUNNER (React Course) ───

    const drawTaskBattleSurvival=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('tbs' in cvs)){
        if(!cvs) return
        cvs.tbs={
          hp:100, kills:0, wrong:0,
          enemies:[] as {x:number;y:number;hp:number;id:number;speed:number;angle:number}[],
          particles:[] as {x:number;y:number;vx:number;vy:number;life:number;col:string}[],
          prevState:'idle' as string,
          spawnTimer:0, phase:0,
        }
      }
      const g=cvs.tbs

      // On state change
      if(g.prevState!==state){
        if(state==='correct'&&g.prevState!=='correct'){
          // Kill all enemies with explosion
          g.enemies.forEach((e:any)=>{
            for(let i=0;i<20;i++){
              const a=Math.random()*Math.PI*2
              g.particles.push({x:e.x,y:e.y,vx:Math.cos(a)*(3+Math.random()*4),vy:Math.sin(a)*(3+Math.random()*4),life:40+Math.random()*20,col:['#00ff41','#ffe600','#00e5ff'][i%3]})
            }
            g.kills++
          })
          g.enemies=[]
          g.wrong=0  // reset wrong count on correct
          g.hp=Math.min(100,g.hp+10) // small heal on correct
          g.spawnTimer=60 // pause before next spawn
        }
        if(state==='wrong'&&g.prevState!=='wrong'){
          g.wrong++
          if(g.wrong>=3){
            // 3 wrong → reset to next task with full HP
            g.hp=100
            g.wrong=0
            g.enemies=[]
            // Full HP burst
            for(let i=0;i<15;i++){
              const a=Math.random()*Math.PI*2
              g.particles.push({x:W/2,y:H/2,vx:Math.cos(a)*5,vy:Math.sin(a)*5,life:40,col:'#00ff41'})
            }
          } else {
            // HP penalty
            g.hp=Math.max(10,g.hp-20)
            // Red flash via particles
            for(let i=0;i<10;i++){
              const a=Math.random()*Math.PI*2
              g.particles.push({x:W/2,y:H/2,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:25,col:'#ff0040'})
            }
            // Enemies attack (rush forward)
            g.enemies.forEach((e:any)=>{ e.speed*=1.5 })
          }
        }
        g.prevState=state
      }

      // Spawn enemies based on task progress
      g.spawnTimer--
      if(g.spawnTimer<=0&&g.enemies.length<3+Math.floor(passedCount/2)){
        const side=Math.floor(Math.random()*4)
        let ex,ey
        if(side===0){ex=Math.random()*W;ey=-20}
        else if(side===1){ex=W+20;ey=Math.random()*H}
        else if(side===2){ex=Math.random()*W;ey=H+20}
        else{ex=-20;ey=Math.random()*H}
        g.enemies.push({x:ex,y:ey,hp:2+Math.floor(passedCount/3),id:Date.now()+Math.random(),speed:0.8+passedCount*0.1,angle:0})
        g.spawnTimer=90-passedCount*5
      }

      // Move enemies toward center (player at center)
      const px=W/2, py=H/2
      g.enemies.forEach((e:any)=>{
        const dx=px-e.x, dy=py-e.y
        const dist=Math.sqrt(dx*dx+dy*dy)||1
        e.x+=dx/dist*e.speed
        e.y+=dy/dist*e.speed
        e.angle+=0.05
        // If reaches player → damage
        if(dist<28&&state!=='correct'){
          g.hp=Math.max(0,g.hp-0.3)
        }
      })

      // Update particles
      g.particles.forEach((p:any)=>{p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life--})
      g.particles=g.particles.filter((p:any)=>p.life>0)

      // ── DRAW ──
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#080010'); bg.addColorStop(1,'#0d001a')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)

      // Arena grid
      ctx.strokeStyle='rgba(100,0,200,.07)'; ctx.lineWidth=1
      for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

      // Arena circle
      ctx.strokeStyle='rgba(100,0,200,.2)'; ctx.lineWidth=2; ctx.setLineDash([8,12])
      ctx.beginPath();ctx.arc(W/2,H/2,Math.min(W,H)/2-20,0,Math.PI*2);ctx.stroke()
      ctx.setLineDash([])

      // Wrong count indicators (bottom left)
      for(let i=0;i<3;i++){
        const filled=i<g.wrong
        r(10+i*22,H-22,16,14,filled?'rgba(255,0,64,.3)':'rgba(255,0,64,.06)')
        ctx.strokeStyle=filled?'#ff0040':'rgba(255,0,64,.2)'; ctx.lineWidth=1
        ctx.strokeRect(10+i*22,H-22,16,14)
        if(filled){ctx.fillStyle='#ff0040';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText('✗',18+i*22,H-11)}
      }
      ctx.fillStyle='rgba(255,0,64,.5)'; ctx.font='7px monospace'; ctx.textAlign='left'
      ctx.fillText('БУРУУ (3 болвол HP нөхөгдөнө)',76,H-11)

      // Particles
      g.particles.forEach((pt:any)=>{
        ctx.globalAlpha=pt.life/60
        ctx.fillStyle=pt.col; ctx.fillRect(pt.x-3,pt.y-3,6,6)
        ctx.globalAlpha=1
      })

      // Enemies
      g.enemies.forEach((e:any,i:number)=>{
        const bob=Math.sin(f*.1+i)*3
        // Danger zone ring
        const proximity=Math.sqrt((px-e.x)**2+(py-e.y)**2)
        if(proximity<100){
          ctx.strokeStyle=`rgba(255,0,64,${.2*(1-proximity/100)})`
          ctx.lineWidth=1
          ctx.beginPath();ctx.arc(e.x,e.y+bob,20+Math.sin(f*.2)*3,0,Math.PI*2);ctx.stroke()
        }
        // Rotate around self
        ctx.save()
        ctx.translate(e.x,e.y+bob)
        ctx.rotate(e.angle)
        // Body
        ctx.fillStyle='#cc0033'
        ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#ff2244'
        ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill()
        // Spikes
        for(let s=0;s<6;s++){
          const a=s*Math.PI/3
          ctx.fillStyle='#cc0033'
          ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*18,Math.sin(a)*18);ctx.lineTo(Math.cos(a+.3)*12,Math.sin(a+.3)*12);ctx.fill()
        }
        ctx.restore()
        // Eyes
        ctx.fillStyle='#ff0'
        ctx.beginPath();ctx.arc(e.x-4,e.y+bob-3,3,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(e.x+4,e.y+bob-3,3,0,Math.PI*2);ctx.fill()
        // HP bar
        if(e.hp>1){
          r(e.x-14,e.y+bob-26,28,5,'#300')
          r(e.x-14,e.y+bob-26,Math.ceil(28*(e.hp/(2+Math.floor(passedCount/3)))),5,'#f44')
        }
      })

      // Player (center)
      {
        const jmp=state==='correct'?Math.abs(Math.sin(f*.3))*10:0
        // Shield aura
        const shieldAlpha=state==='correct'?.3:g.hp<40?.15:.08
        ctx.fillStyle=`rgba(0,229,255,${shieldAlpha})`
        ctx.beginPath();ctx.arc(px,py-jmp,30,0,Math.PI*2);ctx.fill()
        ctx.strokeStyle=state==='correct'?'#00ff41':`rgba(0,229,255,${g.hp/200+.1})`
        ctx.lineWidth=2
        ctx.beginPath();ctx.arc(px,py-jmp,28,0,Math.PI*2);ctx.stroke()
        // Body
        ctx.fillStyle='#00e5ff'
        ctx.beginPath();ctx.arc(px,py-jmp,13,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#fff'
        ctx.beginPath();ctx.arc(px-4,py-jmp-3,3,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(px+4,py-jmp-3,3,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#000'
        ctx.beginPath();ctx.arc(px-3,py-jmp-3,1.5,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(px+5,py-jmp-3,1.5,0,Math.PI*2);ctx.fill()
        // Sword on correct
        if(state==='correct'&&f<20){
          ctx.strokeStyle='#ffe600'; ctx.lineWidth=3
          ctx.beginPath();ctx.moveTo(px+12,py-jmp-12);ctx.lineTo(px+32,py-jmp-32);ctx.stroke()
          ctx.strokeStyle='#888'; ctx.lineWidth=2
          ctx.beginPath();ctx.moveTo(px+18,py-jmp-18);ctx.lineTo(px+28,py-jmp-8);ctx.stroke()
        }
      }

      // ── HUD ──
      r(0,0,W,26,'rgba(0,0,0,.85)')
      // HP bar
      r(8,5,130,16,'#1a001a')
      const hpCol=g.hp>60?'#00cc33':g.hp>30?'#ff9900':'#ff2244'
      r(9,6,Math.floor(128*(g.hp/100)),14,hpCol)
      ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.textAlign='left'
      ctx.fillText(`❤️ ${Math.ceil(g.hp)}`,12,17)
      // Kills
      ctx.fillStyle='#00ff41'; ctx.font='bold 10px monospace'; ctx.textAlign='center'
      ctx.fillText(`💀 ${g.kills}`,W/2,17)
      // Tasks done
      ctx.fillStyle='#bf5af2'; ctx.font='9px monospace'; ctx.textAlign='right'
      ctx.fillText(`✓ ${passedCount}/${totalTasks}`,W-8,17)
      // Progress bar
      r(0,22,W,4,'#111')
      r(0,22,Math.floor(W*(passedCount/Math.max(totalTasks,1))),4,'#bf5af2')

      // State flash
      if(state==='correct'&&f<20){
        ctx.fillStyle=`rgba(0,255,65,${.15-f*.008})`; ctx.fillRect(0,26,W,H-26)
        if(f<12){
          ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(W/2-120,H/2-20,240,36)
          ctx.strokeStyle='#00ff41'; ctx.lineWidth=1; ctx.strokeRect(W/2-120,H/2-20,240,36)
          ctx.fillStyle='#00ff41'; ctx.font='bold 13px monospace'; ctx.textAlign='center'
          ctx.fillText('💥 ENEMY DEFEATED!',W/2,H/2+5)
        }
      } else if(state==='wrong'&&f<15){
        ctx.fillStyle=`rgba(255,0,64,${.12-f*.008})`; ctx.fillRect(0,26,W,H-26)
        if(f<10){
          const msg=g.wrong>=3?'🔄 HP RESTORED! NEW TASK':`✗ WRONG! HP -20 (${g.wrong}/3)`
          ctx.fillStyle='rgba(0,0,0,.7)'; ctx.fillRect(W/2-130,H/2-18,260,32)
          ctx.strokeStyle='#ff0040'; ctx.lineWidth=1; ctx.strokeRect(W/2-130,H/2-18,260,32)
          ctx.fillStyle=g.wrong>=3?'#00ff41':'#ff0040'; ctx.font='bold 11px monospace'; ctx.textAlign='center'
          ctx.fillText(msg,W/2,H/2+4)
        }
      }

      // WIN
      if(passedCount>=totalTasks&&totalTasks>0){
        ctx.fillStyle='rgba(0,0,0,.88)'; ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#ffd700'; ctx.font='bold 20px monospace'; ctx.textAlign='center'
        ctx.fillText('🏆 BATTLE MASTER!',W/2,H/2-15)
        ctx.fillStyle='#00ff41'; ctx.font='11px monospace'
        ctx.fillText(`Kills: ${g.kills} | HP: ${Math.ceil(g.hp)}`,W/2,H/2+10)
      }
    }

    
    // ─── MULTIPLAYER PIXEL ARENA (DB + Multiplayer Course) ───

