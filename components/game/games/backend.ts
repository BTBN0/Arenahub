// @ts-nocheck
// ── BACKEND GAMES ──
// These game draw functions are closures — they use ctx, W, H, f, state, passedCount, etc.
// from the parent GameTaskCanvas component via closure scope.

    const drawOnlineCodeFactory=()=>{
      const cvs=canvasRef.current as any
      if(!('sdf' in cvs)){
        cvs.sdf={ hp:100, blocked:0, passed:0, requests:[] as any[], frame:0, prevP:-1 }
      }
      const g=cvs.sdf
      const p=passedCount
      const total=Math.max(totalTasks,1)

      // Features
      const hasRoutes   = p>=2
      const hasDB       = p>=4
      const hasAuth     = p>=6
      const hasSecurity = p>=8
      const isComplete  = p>=total

      if(g.prevP!==p){ g.prevP=p; if(state==='correct'){g.blocked+=5;g.hp=Math.min(100,g.hp+15)} if(state==='wrong') g.hp=Math.max(0,g.hp-10) }

      // Spawn requests
      if(g.frame%Math.max(35-p*2,10)===0){
        const types=['GET','POST','DELETE','PUT','HACK']
        const type=p<2?'GET':types[Math.floor(Math.random()*Math.min(p+1,types.length))]
        g.requests.push({x:W+20,y:40+Math.random()*(H-80),type,blocked:false,id:Date.now(),speed:1+p*.1})
      }
      // Move requests
      g.requests.forEach((r:any)=>{ r.x-=r.speed })
      // Check if reached server
      g.requests.forEach((r:any)=>{
        if(r.x<80&&!r.blocked){
          r.blocked=true
          if(r.type==='HACK') g.hp=Math.max(0,g.hp-8)
          else g.passed++
        }
      })
      g.requests=g.requests.filter((r:any)=>r.x>60)
      // Auto-block with security
      if(hasSecurity){
        g.requests.forEach((r:any)=>{ if(r.type==='HACK'&&r.x<W*0.6&&!r.blocked){ r.blocked=true; g.blocked++ } })
      }
      g.frame++

      // BG
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#080012'); bg.addColorStop(1,'#0a0020')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)

      // Grid
      ctx.strokeStyle='rgba(100,50,200,.06)'; ctx.lineWidth=1
      for(let x=0;x<W;x+=50){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
      for(let y=0;y<H;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}

      // Server (left side)
      const srvX=30, srvY=H/2-50
      // Server glow
      ctx.fillStyle=`rgba(100,50,200,${.1+Math.sin(g.frame*.05)*.05})`
      ctx.beginPath();ctx.arc(srvX+25,H/2,60,0,Math.PI*2);ctx.fill()
      // Server body
      for(let i=0;i<3;i++){
        r(srvX,srvY+i*34,50,28,i===0?'#1a0a3a':i===1?'#160830':'#120620')
        ctx.strokeStyle='rgba(100,50,200,.4)'; ctx.lineWidth=1
        ctx.strokeRect(srvX,srvY+i*34,50,28)
        // LED
        const on=g.frame%(8-i*2)===0
        r(srvX+4,srvY+i*34+10,6,6,on?'#00ff41':'#0a1a0a')
        r(srvX+14,srvY+i*34+10,6,6,hasDB&&on?'#00e5ff':'#0a0a1a')
        ctx.fillStyle='#8b5cf6'; ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText(['SRV','DB','API'][i],srvX+38,srvY+i*34+17)
      }

      // Firewall layers
      const layers=[
        {x:100,label:'ROUTES',on:hasRoutes,col:'#4488ff'},
        {x:160,label:'AUTH',on:hasAuth,col:'#ffe600'},
        {x:220,label:'SEC',on:hasSecurity,col:'#00ff41'},
      ]
      layers.forEach(layer=>{
        if(!layer.on) return
        ctx.strokeStyle=`${layer.col}55`; ctx.lineWidth=2; ctx.setLineDash([4,6])
        ctx.beginPath();ctx.moveTo(layer.x,28);ctx.lineTo(layer.x,H-4);ctx.stroke()
        ctx.setLineDash([])
        ctx.fillStyle=layer.col; ctx.font='8px monospace'; ctx.textAlign='center'
        ctx.fillText(layer.label,layer.x,22)
      })

      // Requests
      const reqCols:Record<string,string>={GET:'#00e5ff',POST:'#00ff41',PUT:'#ffe600',DELETE:'#ff8800',HACK:'#ff0040'}
      g.requests.forEach((req:any)=>{
        const col=reqCols[req.type]||'#888'
        const bob=Math.sin(g.frame*.08+req.id*.001)*4
        // Trail
        ctx.fillStyle=`${col}22`; ctx.fillRect(req.x,req.y+bob-6,20,12)
        // Packet
        ctx.fillStyle=col; ctx.fillRect(req.x-8,req.y+bob-6,16,12)
        ctx.strokeStyle=col+'88'; ctx.lineWidth=1; ctx.strokeRect(req.x-8,req.y+bob-6,16,12)
        ctx.fillStyle='#000'; ctx.font='bold 7px monospace'; ctx.textAlign='center'
        ctx.fillText(req.type==='HACK'?'⚠':req.type[0],req.x,req.y+bob+3)
        // Label
        ctx.fillStyle=col+'cc'; ctx.font='7px monospace'; ctx.textAlign='center'
        ctx.fillText(req.type,req.x,req.y+bob-10)
      })

      // HUD
      r(0,0,W,26,'rgba(0,0,0,.85)')
      // Server HP
      r(8,5,120,16,'#1a0020')
      r(9,6,Math.floor(118*(g.hp/100)),14,g.hp>50?'#00cc33':g.hp>25?'#ff9900':'#ff2244')
      ctx.fillStyle='#fff'; ctx.font='bold 9px monospace'; ctx.textAlign='left'
      ctx.fillText(`🏰 ${Math.ceil(g.hp)}`,12,17)
      // Stats
      ctx.fillStyle='#00ff41'; ctx.font='bold 9px monospace'; ctx.textAlign='center'
      ctx.fillText(`✓${g.blocked}`,W/2-20,17)
      ctx.fillStyle='#ff4444'; ctx.font='bold 9px monospace'
      ctx.fillText(`✗${g.passed}`,W/2+30,17)
      ctx.fillStyle='#bf5af2'; ctx.font='9px monospace'; ctx.textAlign='right'
      ctx.fillText(`${p}/${total}`,W-8,17)
      // Progress
      r(0,22,W,4,'#111')
      r(0,22,Math.floor(W*(p/total)),4,hasSecurity?'#00ff41':hasAuth?'#ffe600':hasDB?'#4488ff':hasRoutes?'#bf5af2':'#333')

      // Unlock banner
      const msgs:Record<number,string>={2:'🛣 ROUTES ACTIVE!',4:'💾 DATABASE ONLINE!',6:'🔐 AUTH ENABLED!',8:'🛡 SECURITY UP!'}
      if(state==='correct'&&f<25&&msgs[p]){
        ctx.fillStyle='rgba(0,0,0,.8)'; ctx.fillRect(W/2-130,H/2-20,260,36)
        ctx.strokeStyle='#00ff41'; ctx.lineWidth=1; ctx.strokeRect(W/2-130,H/2-20,260,36)
        ctx.fillStyle='#00ff41'; ctx.font='bold 13px monospace'; ctx.textAlign='center'
        ctx.fillText(msgs[p],W/2,H/2+5)
      } else if(state==='correct'&&f<12&&!msgs[p]){
        ctx.fillStyle=`rgba(0,255,65,${.1-f*.009})`; ctx.fillRect(0,26,W,H-26)
        if(f<8){ ctx.fillStyle='#00ff41'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillText('+5 BLOCKED +15 HP',W/2,H/2) }
      } else if(state==='wrong'&&f<10){
        ctx.fillStyle=`rgba(255,0,64,${.08-f*.008})`; ctx.fillRect(0,26,W,H-26)
        if(f<6){ ctx.fillStyle='#ff0040'; ctx.font='bold 11px monospace'; ctx.textAlign='center'; ctx.fillText('SERVER HIT! -10 HP',W/2,H/2) }
      }
      if(!hasRoutes){
        ctx.fillStyle='rgba(0,0,0,.5)'; ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#bf5af2'; ctx.font='bold 13px monospace'; ctx.textAlign='center'
        ctx.fillText('🔒 Task 2 → Routes',W/2,H/2-10)
        ctx.fillStyle='#6a4a9a'; ctx.font='10px monospace'
        ctx.fillText('Code бичвэл server хамгаална',W/2,H/2+16)
      }
      if(isComplete){
        ctx.fillStyle='rgba(0,0,0,.85)'; ctx.fillRect(0,26,W,H-26)
        ctx.fillStyle='#ffd700'; ctx.font='bold 20px monospace'; ctx.textAlign='center'
        ctx.fillText('🏆 SERVER MASTER!',W/2,H/2-15)
        ctx.fillStyle='#00ff41'; ctx.font='10px monospace'
        ctx.fillText(`Blocked: ${g.blocked} | HP: ${Math.ceil(g.hp)}`,W/2,H/2+10)
      }
    }

    
    // ─── TASK BATTLE SURVIVAL (Advanced JS Course) ───
    // Зөв answer → enemy үхнэ | Буруу → HP буурна | 3 буруу → next task, HP бүтэн

