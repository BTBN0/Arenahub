// @ts-nocheck
// ── MISC GAMES ──
// These game draw functions are closures — they use ctx, W, H, f, state, passedCount, etc.
// from the parent GameTaskCanvas component via closure scope.

    const drawCity=()=>{
      // Sky
      const sky=ctx.createLinearGradient(0,0,0,H)
      sky.addColorStop(0,'#040610'); sky.addColorStop(1,'#080c18')
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H)
      stars(130)
      r(0,H-35,W,35,'#0a0a18')
      for(let i=0;i<W;i+=20) r(i,H-35,18,3,'#14142a')

      // Buildings grow with each correct answer
      const blds=[
        {x:30, maxH:90, w:40, col:'#1a3060', win:'#4488ff', label:'HTML'},
        {x:90, maxH:120,w:50, col:'#2a1050', win:'#8844ff', label:'CSS'},
        {x:160,maxH:80, w:40, col:'#103040', win:'#44ffaa', label:'JS'},
        {x:220,maxH:100,w:45, col:'#402010', win:'#ff8844', label:'DOM'},
        {x:285,maxH:70, w:40, col:'#203010', win:'#88ff44', label:'REACT'},
        {x:345,maxH:110,w:50, col:'#301040', win:'#ff44aa', label:'API'},
        {x:415,maxH:90, w:45, col:'#102040', win:'#44aaff', label:'FULL'},
      ]

      // Only show progress buildings
      const visibleCount = Math.min(progress, blds.length)
      blds.slice(0, visibleCount).forEach((b,i)=>{
        // Last built building has grow animation
        const isNew = i === visibleCount-1 && state==='correct' && buildAnim<b.maxH
        const curH = isNew ? Math.min(buildAnim, b.maxH) : b.maxH
        if(isNew) buildAnim+=4

        const by = H-35-curH
        r(b.x, by, b.w, curH, b.col)
        // Windows
        for(let wy=by+6;wy<H-40;wy+=12){
          for(let wx=b.x+4;wx<b.x+b.w-6;wx+=10){
            const lit = Math.random()>.25
            r(wx,wy,6,7,lit?b.win:'#0a0a18')
          }
        }
        // Label on building
        ctx.fillStyle='#ffffff33';ctx.font='9px monospace';ctx.textAlign='center'
        ctx.fillText(b.label,b.x+b.w/2,H-38)
        // Antenna on tall buildings
        if(b.maxH>90){ r(b.x+b.w/2-1,by-15,2,16,'#aaa'); r(b.x+b.w/2-4,by-14,8,2,'#aaa') }
      })

      // Blueprint for next building (ghost)
      if(visibleCount < blds.length){
        const next=blds[visibleCount]
        ctx.fillStyle='rgba(100,150,255,0.08)'
        ctx.fillRect(next.x,H-35-next.maxH,next.w,next.maxH)
        ctx.strokeStyle='rgba(100,150,255,0.2)';ctx.lineWidth=1;ctx.setLineDash([3,3])
        ctx.strokeRect(next.x,H-35-next.maxH,next.w,next.maxH)
        ctx.setLineDash([])
        ctx.fillStyle='rgba(100,150,255,0.4)';ctx.font='9px monospace';ctx.textAlign='center'
        ctx.fillText(next.label,next.x+next.w/2,H-38)
      }

      // Construction worker character
      const workerX = visibleCount<blds.length?blds[Math.min(visibleCount,blds.length-1)].x+20:W-60
      const jump = state==='correct'?Math.abs(Math.sin(f*.3))*20:0
      drawChar(workerX, H-45, '#ffe600', state==='running', jump)

      // Progress HUD
      r(W-170,8,160,28,'rgba(0,0,0,.5)')
      r(W-168,10,156,24,'#0a1020')
      tx(`CITY ${progress}/${Math.min(totalTasks,blds.length)}`,W-90,28,'#ffe600',10)
      // Progress bar
      r(W-168,10,Math.floor(156*(progress/Math.max(totalTasks,1))),4,'#00ff41')

      // Status
      if(state==='idle') tx('▼ ANSWER TO BUILD',W/2-100,H-8,'#2a4a6a',5,'left')
      else if(state==='correct'){
        if(f>5){
          tx('✓ BUILDING ADDED!',W/2,40,'#00ff41',9)
          if(f>15){tx(`+XP`,W/2,58,'#ffe600',7); if(f===16) burst(workerX,H-60,['#ffe600','#00ff41','#4488ff'])}
        }
      }
      else if(state==='wrong'){
        tx('✗ WRONG!',W/2,35,'#ff0040',8)
        // Crack effect on last building
        if(visibleCount>0){
          const b=blds[visibleCount-1]
          ctx.fillStyle='rgba(255,0,64,.3)'
          ctx.fillRect(b.x,H-35-b.maxH,b.w,b.maxH)
        }
      }
    }

    // ─── SURVIVAL ISLAND (Foundations) ───

    const drawIsland=()=>{
      const sky=ctx.createLinearGradient(0,0,0,H)
      sky.addColorStop(0,'#0a1530'); sky.addColorStop(1,'#1a3a5a')
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H)
      stars(120)
      // Ocean
      const wave=Math.sin(f*.05)*3
      r(0,H-45+wave,W,45,'#0a2a4a')
      for(let i=0;i<W;i+=30) r(i,H-43+wave,20,3,'#0d3560')

      // Island grows with progress
      const islandW=80+progress*20
      const islandX=(W-islandW)/2
      r(islandX, H-65, islandW, 25, '#8B6914')
      r(islandX-10, H-63, islandW+20, 10, '#5a8a3a')

      // Survival items appear with progress
      const items=['🏕','🌿','🔧','🖥','💡','📡','🚀']
      for(let i=0;i<Math.min(progress,items.length);i++){
        const ix=islandX+10+i*22
        ctx.font='18px serif'; ctx.textAlign='center'
        ctx.fillText(items[i],ix,H-58)
      }

      // Palm tree
      r(islandX+islandW-20,H-88,5,28,'#8B4513')
      r(islandX+islandW-35,H-100,28,6,'#2a8a2a')
      r(islandX+islandW-28,H-106,18,8,'#3aaa3a')

      // Character
      const jump=state==='correct'?Math.abs(Math.sin(f*.3))*18:0
      drawChar(islandX+30,H-58,'#00e5ff',state==='running',jump)

      // Progress HUD
      r(W-170,8,160,28,'rgba(0,0,0,.5)')
      r(W-168,10,156,24,'#0a1020')
      tx(`SURVIVAL ${progress}/${Math.min(totalTasks,7)}`,W-90,28,'#00e5ff',10)
      r(W-168,10,Math.floor(156*(progress/Math.max(totalTasks,1))),4,'#00ff41')

      if(state==='idle') tx('▼ ANSWER TO SURVIVE',W/2-120,H-4,'#2a4a6a',5,'left')
      else if(state==='correct'){
        if(f>5){tx('✓ SURVIVED!',W/2,40,'#00ff41',9);if(f>15){tx('+XP',W/2,58,'#ffe600',7);if(f===16) burst(islandX+30,H-70,['#00ff41','#ffe600','#00e5ff'])}}
      }
      else if(state==='wrong') tx('✗ DANGER!',W/2,35,'#ff0040',8)
    }

    // ─── SERVER CASTLE (Backend) ───

    const drawCastle=()=>{
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#080012'); bg.addColorStop(1,'#100020')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      stars(120)
      r(0,H-30,W,30,'#1a0a2a')

      // Castle walls grow with progress
      const wallH = 40+progress*12
      const cX=W-180
      r(cX,H-30-wallH,160,wallH,'#2a1a3a')
      // Towers
      if(progress>1){ r(cX,H-30-wallH-30,30,35,'#3a2a4a'); r(cX-2,H-30-wallH-38,34,12,'#2a1a3a') }
      if(progress>2){ r(cX+130,H-30-wallH-30,30,35,'#3a2a4a'); r(cX+128,H-30-wallH-38,34,12,'#2a1a3a') }
      if(progress>3){ r(cX+60,H-30-wallH-40,40,45,'#4a2a5a'); r(cX+58,H-30-wallH-48,44,12,'#3a1a4a') }
      // Battlements
      for(let i=0;i<8;i++) r(cX+i*20,H-30-wallH-8,12,10,'#3a2a4a')
      // Gate
      r(cX+65,H-55,30,30,'#0a0010')
      // Shield upgrade
      if(progress>4){
        ctx.fillStyle='rgba(100,50,255,0.2)'
        ctx.beginPath();ctx.arc(cX+80,H-30-wallH-20,50,0,Math.PI*2);ctx.fill()
      }

      // Requests (enemies)
      for(let i=0;i<3;i++){
        const ex=((f*2+i*90)%(W+60))-30
        const ey=H-50+Math.sin(ex*.02)*10
        r(ex-7,ey-14,14,12,'#cc0030'); r(ex-3,ey-11,6,6,'#ff4466')
        ctx.fillStyle='#ff4466';ctx.font='9px monospace';ctx.textAlign='center'
        ctx.fillText('REQ',ex,ey-18)
      }

      // Defender
      const jump=state==='correct'?Math.abs(Math.sin(f*.3))*15:0
      drawChar(cX-30,H-40,'#aa44ff',false,jump)
      if(state==='correct'||state==='running'){
        ctx.fillStyle='rgba(100,50,255,0.4)'
        ctx.beginPath();ctx.arc(cX-30,H-50,25,0,Math.PI*2);ctx.fill()
        tx('200',cX-30,H-60,'#aa44ff',9)
      }

      r(W-170,8,160,28,'rgba(0,0,0,.5)')
      r(W-168,10,156,24,'#0a1020')
      tx(`CASTLE LVL ${progress}`,W-90,28,'#aa44ff',10)
      r(W-168,10,Math.floor(156*(progress/Math.max(totalTasks,1))),4,'#aa44ff')

      if(state==='idle') tx('▼ ANSWER TO DEFEND',W/2-110,H-4,'#2a1a4a',5,'left')
      else if(state==='correct'){
        if(f>5){tx('✓ DEFENDED!',W/2,35,'#00ff41',9);if(f>15){tx('+XP',W/2,52,'#ffe600',7);if(f===16) burst(cX+80,H-80,['#aa44ff','#6644ff','#ffe600'])}}
      }
      else if(state==='wrong'){
        tx('✗ CASTLE HIT!',W/2,35,'#ff0040',7)
        r(cX,H-30-wallH,(f%15)*4,6,'#ff4400')
      }
    }

    // ─── DATA KINGDOM (Database) ───

    const drawKingdom=()=>{
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#040810'); bg.addColorStop(1,'#081418')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      stars(120)
      r(0,H-30,W,30,'#0a1520')

      // Database tables appear with progress
      const tables=[
        {x:40, label:'USERS',  col:'#1a4a8a',active:progress>0},
        {x:130,label:'POSTS',  col:'#1a6a3a',active:progress>1},
        {x:220,label:'ORDERS', col:'#5a3a1a',active:progress>2},
        {x:310,label:'ITEMS',  col:'#4a1a5a',active:progress>3},
        {x:400,label:'LOGS',   col:'#5a4a1a',active:progress>4},
        {x:490,label:'CACHE',  col:'#1a4a4a',active:progress>5},
      ]
      tables.forEach(tb=>{
        if(!tb.active){ // ghost
          ctx.fillStyle='rgba(50,80,120,0.1)'
          ctx.fillRect(tb.x-20,H-90,40,50)
          ctx.strokeStyle='rgba(50,80,120,0.2)';ctx.lineWidth=1;ctx.setLineDash([2,3])
          ctx.strokeRect(tb.x-20,H-90,40,50);ctx.setLineDash([])
          return
        }
        r(tb.x-20,H-90,40,50,tb.col)
        r(tb.x-20,H-92,40,6,'#3a5a7a')
        r(tb.x-20,H-96,40,6,'#4a6a8a')
        ctx.fillStyle='#88ccff';ctx.font='9px monospace';ctx.textAlign='center'
        ctx.fillText(tb.label,tb.x,H-98)
        // Rows
        for(let row=0;row<3;row++){
          r(tb.x-14,H-84+row*12,28,8,'rgba(0,0,0,.4)')
          ctx.fillStyle='#44aa77';ctx.font='9px monospace';ctx.textAlign='center'
          ctx.fillText(`ROW${row+1}`,tb.x,H-77+row*12)
        }
      })

      // SQL beam animation
      if(state==='running'||state==='correct'){
        ctx.fillStyle='rgba(0,229,255,.25)'
        const beamW=state==='running'?Math.min(f*12,480):480
        ctx.fillRect(40,H-60,beamW,9)
        tx('SELECT *',320,H-68,'#00e5ff',10)
      }

      const jump=state==='correct'?Math.abs(Math.sin(f*.3))*18:0
      drawChar(W/2-20,H-45,'#ffe600',state==='running',jump)
      r(W/2-26,H-68,12,6,'#ffcc00')
      r(W/2-23,H-73,6,6,'#ffe600')

      r(W-170,8,160,28,'rgba(0,0,0,.5)')
      r(W-168,10,156,24,'#0a1020')
      tx(`TABLES: ${progress}/${Math.min(totalTasks,10)}`,W-90,28,'#4488ff',10)
      r(W-168,10,Math.floor(156*(progress/Math.max(totalTasks,1))),4,'#4488ff')

      if(state==='idle') tx('▼ ANSWER TO QUERY',W/2-110,H-4,'#1a3a4a',5,'left')
      else if(state==='correct'){
        if(f>5){tx('✓ DATA FOUND!',W/2,35,'#00ff41',9);if(f>15){tx('+XP',W/2,52,'#ffe600',7);if(f===16) burst(W/2,H-50,['#4488ff','#44ffaa','#ffe600','#00e5ff'])}}
      }
      else if(state==='wrong') tx('✗ QUERY FAILED!',W/2,35,'#ff0040',7)
    }

    // ─── TIME MACHINE (DevTools) ───

    const drawTimeMachine=()=>{
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#040810'); bg.addColorStop(1,'#081020')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      stars(130)
      // Timeline
      r(0,H/2-2,W,4,'#1a2840')
      // Commits appear with progress
      for(let i=0;i<Math.min(progress+1,totalTasks);i++){
        const cx=60+i*(W-120)/(Math.max(totalTasks-1,1))
        const active=i<progress
        r(cx-10,H/2-10,20,20,active?'#00ff41':'#1a2840')
        r(cx-8,H/2-8,16,16,active?'#00cc33':'#0e1828')
        ctx.fillStyle=active?'#00ff41':'#2a4a2a';ctx.font='9px monospace';ctx.textAlign='center'
        ctx.fillText(`v${i+1}`,cx,H/2+26)
        if(active&&i>0){
          ctx.fillStyle='rgba(0,255,65,.3)'
          ctx.fillRect(cx-10+(W-120)/(Math.max(totalTasks-1,1))-20,H/2-10,20,20)
        }
      }
      // Branch
      if(progress>2){
        ctx.strokeStyle='#ffe60066';ctx.lineWidth=2;ctx.setLineDash([4,4])
        const bx=60+2*(W-120)/(Math.max(totalTasks-1,1))
        const bx2=bx+(W-120)/(Math.max(totalTasks-1,1))*2
        ctx.beginPath();ctx.moveTo(bx,H/2);ctx.lineTo(bx+30,H/2-50);ctx.lineTo(bx2-30,H/2-50);ctx.lineTo(bx2,H/2)
        ctx.stroke();ctx.setLineDash([])
        tx('feature',bx+(bx2-bx)/2,H/2-58,'#ffe600',9)
      }
      // Time capsule
      const capX=60+Math.min(progress,totalTasks-1)*(W-120)/(Math.max(totalTasks-1,1))
      r(capX-12,H/2-22,24,18,'#2a4a8a')
      r(capX-9,H/2-19,18,12,'#3a5a9a')
      r(capX-5,H/2-17,10,7,'rgba(0,229,255,.4)')
      const jump=state==='correct'?Math.abs(Math.sin(f*.3))*18:0
      drawChar(capX,H/2+35,'#00e5ff',state==='running',jump)
      // Clock
      const ang=f*.08
      ctx.strokeStyle='#ffe600';ctx.lineWidth=1.5
      ctx.beginPath();ctx.arc(W-45,45,22,0,Math.PI*2);ctx.stroke()
      ctx.beginPath();ctx.moveTo(W-45,45);ctx.lineTo(W-45+Math.cos(ang)*16,45+Math.sin(ang)*16);ctx.stroke()

      r(20,8,160,28,'rgba(0,0,0,.5)')
      r(22,10,156,24,'#0a1020')
      tx(`COMMITS: ${progress}`,110,28,'#00e5ff',10)
      r(22,10,Math.floor(156*(progress/Math.max(totalTasks,1))),4,'#00e5ff')

      if(state==='idle') tx('▼ ANSWER TO COMMIT',W/2-110,H-4,'#1a2a4a',5,'left')
      else if(state==='correct'){
        if(f>5){tx('✓ COMMITTED!',W/2,35,'#00ff41',9);if(f>15){tx('+XP',W/2,52,'#ffe600',7);if(f===16) burst(capX,H/2-10,['#00ff41','#ffe600','#00e5ff'])}}
      }
      else if(state==='wrong') tx('✗ CONFLICT!',W/2,35,'#ff0040',8)
    }

    // ─── MEGA CITY (Advanced) ───

    const drawMegaCity=()=>{
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#030608'); bg.addColorStop(1,'#060810')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)
      stars(130)
      r(0,H-25,W,25,'#0a0a14')

      const systems=[
        {x:20, h:80, w:45, col:'#1a3a5a', label:'FRONTEND'},
        {x:80, h:120,w:55, col:'#3a1a5a', label:'BACKEND'},
        {x:155,h:90, w:50, col:'#1a4a2a', label:'DATABASE'},
        {x:225,h:110,w:50, col:'#4a3a1a', label:'AUTH'},
        {x:295,h:75, w:40, col:'#3a2a4a', label:'API'},
        {x:350,h:130,w:55, col:'#2a4a3a', label:'DEPLOY'},
        {x:425,h:95, w:50, col:'#4a1a3a', label:'MONITOR'},
      ]

      systems.slice(0,Math.max(1,progress)).forEach((b,i)=>{
        const isNew=i===progress-1&&state==='correct'&&buildAnim<b.h
        const curH=isNew?Math.min(buildAnim,b.h):b.h
        if(isNew) buildAnim+=5
        r(b.x,H-25-curH,b.w,curH,b.col)
        for(let wy=H-20-curH;wy<H-30;wy+=10)
          for(let wx=b.x+3;wx<b.x+b.w-3;wx+=8)
            r(wx,wy,5,6,Math.random()>.3?'#aaccff':'#1a1a2a')
        ctx.fillStyle='#ffffff44';ctx.font='9px monospace';ctx.textAlign='center'
        ctx.fillText(b.label,b.x+b.w/2,H-28-curH-2)
      })

      // Connection lines
      if(state==='correct'&&f>15){
        ctx.strokeStyle='rgba(0,229,255,.35)';ctx.lineWidth=1
        systems.slice(0,progress).forEach((a,i)=>{
          if(i===0) return
          const b=systems[i-1]
          ctx.beginPath();ctx.moveTo(a.x+a.w/2,H-25-a.h/2);ctx.lineTo(b.x+b.w/2,H-25-b.h/2);ctx.stroke()
        })
      }

      const jump=state==='correct'?Math.abs(Math.sin(f*.3))*20:0
      drawChar(progress>0?systems[Math.min(progress-1,systems.length-1)].x+22:30,H-38,'#00ff41',state==='running',jump)

      r(W-175,8,168,28,'rgba(0,0,0,.5)')
      r(W-173,10,164,24,'#0a1020')
      tx(`SYSTEMS: ${progress}/${Math.min(totalTasks,7)}`,W-90,28,'#00ff41',10)
      r(W-173,10,Math.floor(164*(progress/Math.max(totalTasks,1))),4,'#00ff41')

      if(state==='idle') tx('▼ ANSWER TO BUILD',W/2-110,H-4,'#1a2a1a',5,'left')
      else if(state==='correct'){
        if(f>5){tx('✓ SYSTEM ONLINE!',W/2,35,'#00ff41',8);if(f>15){tx('+XP',W/2,52,'#ffe600',7);if(f===16) burst(W/2,H/2,['#00ff41','#4488ff','#ffe600','#aa44ff'],20)}}
      }
      else if(state==='wrong') tx('✗ SYSTEM DOWN!',W/2,35,'#ff0040',8)
    }


    // ─── WALK GAME (Вэб суурь) ───

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
    // Task бүр дэвших тусам game UI element нэмэгдэнэ

