// @ts-nocheck
// ── MULTIPLAYER GAMES ──
// These game draw functions are closures — they use ctx, W, H, f, state, passedCount, etc.
// from the parent GameTaskCanvas component via closure scope.

    const drawMultiplayerArena=()=>{
      const cvs=canvasRef.current as any
      if(!cvs||!('mpa' in cvs)){
        if(!cvs) return
        // Simulate multiple players joining as tasks progress
        cvs.mpa={
          players:[] as {id:string;x:number;y:number;score:number;color:string;name:string;vx:number;vy:number}[],
          coins:[] as {x:number;y:number;id:number}[],
          particles:[] as any[],
          frame:0, prevP:-1,
          dbPulse:0, netLines:[] as {x1:number;y1:number;x2:number;y2:number;life:number}[],
        }
      }
      const g=cvs.mpa
      const p=passedCount
      const total=Math.max(totalTasks,1)

      // Add players as tasks progress
      const colors=['#00e5ff','#00ff41','#ffe600','#ff2244','#bf5af2','#ff8800','#00ffcc']
      const names=['You','Bat','Bold','Gon','Ana','Tur','Mur']
      const targetCount=Math.min(p+1,7)
      while(g.players.length<targetCount){
        const i=g.players.length
        const angle=(i/7)*Math.PI*2
        g.players.push({
          id:'p'+i, x:W/2+Math.cos(angle)*80, y:H/2+Math.sin(angle)*80,
          score:0, color:colors[i], name:names[i],
          vx:(Math.random()-.5)*2, vy:(Math.random()-.5)*2,
        })
      }

      // Spawn coins
      if(g.coins.length<5&&g.frame%60===0&&p>=2){
        g.coins.push({x:30+Math.random()*(W-60),y:40+Math.random()*(H-60),id:Date.now()})
      }

      // Update players (autonomous movement to simulate multiplayer)
      g.players.forEach((pl:any,i:number)=>{
        if(i===0) return // "You" stays center
        pl.x+=pl.vx*(0.8+i*0.1)
        pl.y+=pl.vy*(0.8+i*0.1)
        if(pl.x<16||pl.x>W-16) pl.vx*=-1
        if(pl.y<36||pl.y>H-16) pl.vy*=-1
        // Collect coins
        g.coins=g.coins.filter((coin:any)=>{
          if(Math.abs(pl.x-coin.x)<18&&Math.abs(pl.y-coin.y)<18){
            pl.score++
            for(let k=0;k<8;k++){
              const a=Math.random()*Math.PI*2
              g.particles.push({x:coin.x,y:coin.y,vx:Math.cos(a)*3,vy:Math.sin(a)*3,life:25,col:'#ffe600'})
            }
            return false
          }
          return true
        })
      })

      // Network lines between players (multiplayer sync visualization)
      if(p>=5&&g.frame%20===0&&g.players.length>1){
        const a=g.players[0], b=g.players[Math.floor(Math.random()*(g.players.length-1))+1]
        g.netLines.push({x1:a.x,y1:a.y,x2:b.x,y2:b.y,life:30})
      }
      g.netLines.forEach((l:any)=>l.life--)
      g.netLines=g.netLines.filter((l:any)=>l.life>0)

      // DB pulse on correct
      if(state==='correct'&&g.prevP!==p){
        g.dbPulse=60; g.prevP=p
        g.players.forEach((pl:any)=>pl.score+=2)
        for(let i=0;i<20;i++){
          const a=Math.random()*Math.PI*2
          g.particles.push({x:W/2,y:H/2,vx:Math.cos(a)*5,vy:Math.sin(a)*5,life:50,col:colors[i%7]})
        }
      }
      if(g.dbPulse>0) g.dbPulse--
      g.particles.forEach((pt:any)=>{pt.x+=pt.vx;pt.y+=pt.vy;pt.vy+=.1;pt.life--})
      g.particles=g.particles.filter((pt:any)=>pt.life>0)
      g.frame++

      // ── DRAW ──
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#040a10'); bg.addColorStop(1,'#081018')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)

      // Grid
      ctx.strokeStyle='rgba(0,100,150,.07)'; ctx.lineWidth=1
      for(let x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

      // Arena border
      ctx.strokeStyle='rgba(0,150,255,.2)'; ctx.lineWidth=2
      ctx.strokeRect(4,30,W-8,H-34)

      // Network lines (sync visualization)
      g.netLines.forEach((l:any)=>{
        ctx.strokeStyle=`rgba(0,200,255,${l.life/30*.4})`
        ctx.lineWidth=1; ctx.setLineDash([4,6])
        ctx.beginPath();ctx.moveTo(l.x1,l.y1);ctx.lineTo(l.x2,l.y2);ctx.stroke()
        ctx.setLineDash([])
      })

      // DB indicator (right side)
      if(p>=1){
        const dbX=W-55, dbY=H/2-35
        const pulse=g.dbPulse>0
        ctx.fillStyle=`rgba(0,150,100,${pulse?.2:.07})`
        ctx.beginPath();ctx.ellipse(dbX+20,H/2,28,10,0,0,Math.PI*2);ctx.fill()
        for(let d=0;d<2;d++){
          ctx.fillStyle=`rgba(0,${100+d*50},80,${pulse?.3:.12})`
          ctx.beginPath();ctx.ellipse(dbX+20,dbY+d*28,22,8,0,0,Math.PI*2);ctx.fill()
          ctx.strokeStyle=`rgba(0,200,120,${pulse?.5:.2})`; ctx.lineWidth=1
          ctx.beginPath();ctx.ellipse(dbX+20,dbY+d*28,22,8,0,0,Math.PI*2);ctx.stroke()
          r(dbX-2,dbY+d*28,44,18,`rgba(0,80,50,${pulse?.2:.08})`)
        }
        ctx.fillStyle=pulse?'#00cc88':'#006644'; ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText('DB',dbX+20,dbY+70)
        if(pulse){ctx.fillStyle='#00ff88';ctx.font='8px monospace';ctx.fillText('SAVE',dbX+20,dbY+82)}
      }

      // Coins
      g.coins.forEach((coin:any,i:number)=>{
        const bob=Math.sin(g.frame*.1+i)*4
        ctx.fillStyle='rgba(255,230,0,.2)'; ctx.beginPath();ctx.arc(coin.x,coin.y+bob,14,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#ffd700'; ctx.beginPath();ctx.arc(coin.x,coin.y+bob,10,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='rgba(255,255,255,.4)'; ctx.beginPath();ctx.arc(coin.x-3,coin.y+bob-3,3,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#000'; ctx.font='bold 8px monospace'; ctx.textAlign='center'; ctx.fillText('$',coin.x,coin.y+bob+3)
      })

      // Particles
      g.particles.forEach((pt:any)=>{
        ctx.globalAlpha=pt.life/50; ctx.fillStyle=pt.col; ctx.fillRect(pt.x-2,pt.y-2,5,5); ctx.globalAlpha=1
      })

      // Players
      g.players.forEach((pl:any,i:number)=>{
        const bob=Math.sin(g.frame*.08+i)*3
        const isYou=i===0
        // Glow
        if(isYou){ctx.fillStyle='rgba(0,229,255,.15)';ctx.beginPath();ctx.arc(pl.x,pl.y+bob,20,0,Math.PI*2);ctx.fill()}
        // Body
        ctx.fillStyle=pl.color
        ctx.beginPath();ctx.arc(pl.x,pl.y+bob,isYou?13:10,0,Math.PI*2);ctx.fill()
        // Eyes
        ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(pl.x-3,pl.y+bob-3,2.5,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(pl.x+3,pl.y+bob-3,2.5,0,Math.PI*2);ctx.fill()
        ctx.fillStyle='#000';ctx.beginPath();ctx.arc(pl.x-2,pl.y+bob-3,1.5,0,Math.PI*2);ctx.fill()
        ctx.beginPath();ctx.arc(pl.x+4,pl.y+bob-3,1.5,0,Math.PI*2);ctx.fill()
        // Name + score
        ctx.fillStyle=pl.color; ctx.font=`${isYou?9:8}px monospace`; ctx.textAlign='center'
        ctx.fillText(isYou?'YOU':pl.name,pl.x,pl.y+bob-(isYou?22:18))
        ctx.fillStyle='#ffe600'; ctx.font='8px monospace'
        ctx.fillText(pl.score,pl.x,pl.y+bob+(isYou?28:22))
      })

      // HUD
      r(0,0,W,26,'rgba(0,0,0,.85)')
      // Player count
      ctx.fillStyle='#00e5ff'; ctx.font='bold 10px monospace'; ctx.textAlign='left'
      ctx.fillText(`👾 ${g.players.length} players`,8,17)
      // Leaderboard mini
      if(p>=3){
        const sorted=[...g.players].sort((a:any,b:any)=>b.score-a.score)
        ctx.fillStyle='#ffe600'; ctx.font='bold 9px monospace'; ctx.textAlign='center'
        ctx.fillText(`🏆 ${sorted[0]?.name}:${sorted[0]?.score}`,W/2,17)
      }
      // Progress
      ctx.fillStyle='#4488ff'; ctx.font='9px monospace'; ctx.textAlign='right'
      ctx.fillText(`${p}/${total}`,W-8,17)
      r(0,22,W,4,'#0a0f1a')
      r(0,22,Math.floor(W*(p/total)),4,p>=5?'#00ff41':p>=3?'#4488ff':'#00e5ff')

      // Unlock banners
      const msgs:Record<number,string>={1:'🌐 SERVER ONLINE!',2:'💾 DATABASE CONNECTED!',4:'🏆 LEADERBOARD LIVE!',5:'📡 REAL-TIME SYNC!',7:'🎮 MULTIPLAYER READY!'}
      if(state==='correct'&&g.dbPulse>48&&msgs[p]){
        ctx.fillStyle='rgba(0,0,0,.8)'; ctx.fillRect(W/2-130,H/2-20,260,36)
        ctx.strokeStyle='#00ff41'; ctx.lineWidth=1; ctx.strokeRect(W/2-130,H/2-20,260,36)
        ctx.fillStyle='#00ff41'; ctx.font='bold 12px monospace'; ctx.textAlign='center'
        ctx.fillText(msgs[p],W/2,H/2+5)
      }

      // Locked
      if(p===0){
        ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(0,28,W,H-28)
        ctx.fillStyle='#4488ff'; ctx.font='bold 13px monospace'; ctx.textAlign='center'
        ctx.fillText('🔒 Task 1 → SERVER UP',W/2,H/2-10)
        ctx.fillStyle='#2a4a6a'; ctx.font='10px monospace'
        ctx.fillText('Database + Multiplayer эхэлнэ',W/2,H/2+16)
      }

      // WIN
      if(p>=total&&total>0){
        ctx.fillStyle='rgba(0,0,0,.88)'; ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#ffd700'; ctx.font='bold 18px monospace'; ctx.textAlign='center'
        ctx.fillText('🌐 ONLINE GAME READY!',W/2,H/2-15)
        const sorted=[...g.players].sort((a:any,b:any)=>b.score-a.score)
        ctx.fillStyle='#00ff41'; ctx.font='11px monospace'
        ctx.fillText(`🏆 ${sorted[0]?.name} wins with ${sorted[0]?.score} pts`,W/2,H/2+10)
      }
    }

