// @ts-nocheck
// ── CSS GAMES ──
// These game draw functions are closures — they use ctx, W, H, f, state, passedCount, etc.
// from the parent GameTaskCanvas component via closure scope.

    const drawPixelWorld=()=>{
      // Game world background
      ctx.fillStyle='#0d0d1a'; ctx.fillRect(0,0,W,H)

      // Stars bg
      for(let i=0;i<40;i++){
        const sx=(i*137)%W, sy=(i*97)%120
        ctx.fillStyle=`rgba(255,255,255,${.2+Math.sin(f*.05+i)*.15})`
        ctx.fillRect(sx,sy,1,1)
      }

      const p=passedCount
      const total=Math.max(totalTasks,1)

      // ── MAP ──
      // Map size grows with progress (lesson 5 grid unlock)
      const mapX=40, mapY=50, mapW=W-80, mapH=H-80
      const mapColor=p>=5?'#1a1a2e':'#0d0d18'
      r(mapX,mapY,mapW,mapH,mapColor)

      // Grid cells unlock at lesson 5
      if(p>=5){
        const cols=5, rows=3
        const cw=Math.floor(mapW/cols), ch=Math.floor(mapH/rows)
        ctx.strokeStyle='rgba(0,255,65,.08)'; ctx.lineWidth=1
        for(let col=0;col<=cols;col++){ ctx.beginPath();ctx.moveTo(mapX+col*cw,mapY);ctx.lineTo(mapX+col*cw,mapY+mapH);ctx.stroke() }
        for(let row=0;row<=rows;row++){ ctx.beginPath();ctx.moveTo(mapX,mapY+row*ch);ctx.lineTo(mapX+mapW,mapY+row*ch);ctx.stroke() }
      }

      // Map border - color changes with progress
      const borderCol=p<5?'#1f2937':p<10?'#00ff4144':p<15?'#3b82f644':'#00ff41'
      ctx.strokeStyle=borderCol; ctx.lineWidth=2
      ctx.strokeRect(mapX,mapY,mapW,mapH)

      // Border glow effect (lesson 8 hover/glow unlock)
      if(p>=8){
        ctx.shadowColor='#00ff41'; ctx.shadowBlur=8
        ctx.strokeStyle='#00ff4188'; ctx.lineWidth=1
        ctx.strokeRect(mapX-2,mapY-2,mapW+4,mapH+4)
        ctx.shadowBlur=0
      }

      // ── PLAYER CHARACTER ──
      const playerUnlocked=p>=1
      if(playerUnlocked){
        // Player position - can move with arrow keys (lesson 6 position)
        const px2=mapX+20+Math.sin(f*.02)*3
        const py2=mapY+mapH-60
        const playerSize=p>=3?20:16 // bigger with box model lesson
        const playerCol=p>=1?'#00ff41':'#333'

        // Shadow (lesson 3 box model shadow)
        if(p>=3){
          ctx.fillStyle='rgba(0,0,0,.4)'
          ctx.beginPath(); ctx.ellipse(px2+playerSize/2,py2+playerSize+4,playerSize/2,4,0,0,Math.PI*2); ctx.fill()
        }

        // Player body - circle if p>=2 (border-radius lesson)
        const bob2=Math.sin(f*.08)*4
        if(p>=2){
          // Styled player (circle)
          ctx.fillStyle=playerCol
          ctx.beginPath(); ctx.arc(px2+playerSize/2,py2+playerSize/2+bob2,playerSize/2,0,Math.PI*2); ctx.fill()
          // Eyes
          ctx.fillStyle='#000'
          ctx.beginPath(); ctx.arc(px2+playerSize/2-4,py2+playerSize/2-2+bob2,2,0,Math.PI*2); ctx.fill()
          ctx.beginPath(); ctx.arc(px2+playerSize/2+4,py2+playerSize/2-2+bob2,2,0,Math.PI*2); ctx.fill()
        } else {
          r(px2,py2+bob2,playerSize,playerSize,playerCol)
        }

        // Label
        ctx.fillStyle='#00ff4188'; ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText('player',px2+playerSize/2,py2+playerSize+14+bob2)

        // Glow on hover lesson
        if(p>=8&&state==='correct'){
          ctx.shadowColor=playerCol; ctx.shadowBlur=12
          ctx.fillStyle=playerCol
          ctx.beginPath(); ctx.arc(px2+playerSize/2,py2+playerSize/2,playerSize/2+2,0,Math.PI*2); ctx.fill()
          ctx.shadowBlur=0
        }
      }

      // ── ENEMIES ──
      const enemyCount=Math.min(Math.floor(p/5)+1,9)
      for(let ei=0;ei<enemyCount;ei++){
        const ex=mapX+mapW-60-ei*70
        const ey=mapY+20

        // Animation (lesson 7)
        const anim=p>=7?Math.sin(f*.12+ei*1.5)*8:0
        const escale=p>=8&&state==='running'?.9:1

        ctx.save()
        ctx.translate(ex+16,ey+16+anim)
        ctx.scale(escale,escale)

        // Enemy body
        ctx.fillStyle=p>=4?'#ef4444':'#7f1d1d'
        ctx.beginPath(); ctx.arc(0,0,p>=2?14:12,0,Math.PI*2); ctx.fill()

        // Eyes (angry)
        ctx.fillStyle='#ffd700'
        ctx.beginPath(); ctx.arc(-5,-3,3,0,Math.PI*2); ctx.fill()
        ctx.beginPath(); ctx.arc(5,-3,3,0,Math.PI*2); ctx.fill()
        ctx.fillStyle='#000'
        ctx.beginPath(); ctx.arc(-4,-3,1.5,0,Math.PI*2); ctx.fill()
        ctx.beginPath(); ctx.arc(6,-3,1.5,0,Math.PI*2); ctx.fill()

        // Mouth
        ctx.strokeStyle='#000'; ctx.lineWidth=1.5
        ctx.beginPath(); ctx.arc(0,4,5,0,Math.PI); ctx.stroke()

        ctx.restore()

        ctx.fillStyle='#ef444488'; ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText('enemy',ex+16,ey+38+anim)
      }

      // ── CSS PROPERTIES UNLOCKED (floating pills) ──
      const cssProps=[
        {n:'color',col:'#f97316',x:mapX+80,y:mapY+10},
        {n:'background',col:'#8b5cf6',x:mapX+145,y:mapY+10},
        {n:'flex',col:'#3b82f6',x:mapX+230,y:mapY+10},
        {n:'grid',col:'#10b981',x:mapX+290,y:mapY+10},
        {n:'position',col:'#f59e0b',x:mapX+350,y:mapY+10},
        {n:'animation',col:'#ec4899',x:mapX+430,y:mapY+10},
        {n:'hover',col:'#06b6d4',x:mapX+510,y:mapY+10},
        {n:'@media',col:'#84cc16',x:mapX+570,y:mapY+10},
      ]
      cssProps.slice(0,Math.ceil(p/5)).forEach(prop=>{
        const bob3=Math.sin(f*.06+prop.x*.01)*3
        r(prop.x,prop.y+bob3,prop.n.length*5+10,14,prop.col+'33')
        ctx.strokeStyle=prop.col; ctx.lineWidth=1
        ctx.strokeRect(prop.x,prop.y+bob3,prop.n.length*5+10,14)
        ctx.fillStyle=prop.col; ctx.font='10px monospace'; ctx.textAlign='left'
        ctx.fillText(prop.n,prop.x+5,prop.y+10+bob3)
      })

      // ── HUD ──
      // Score / HP bar
      r(mapX,mapY-24,mapW,18,'#111')
      r(mapX+1,mapY-23,Math.floor((mapW-2)*(p/total)),16,'#00ff41')
      ctx.fillStyle='#fff'; ctx.font='12px monospace'; ctx.textAlign='center'
      ctx.fillText(`CSS POWER: ${p}/${total}`,W/2,mapY-10)

      // Stage label
      const stages=['🌑 Empty','🎨 Color','⬜ Box','🔘 Radius','💎 Style','🗺 Grid','📌 Position','✨ Animation','🖱 Hover','📱 Responsive','🎮 FULL GAME']
      const stageIdx=Math.min(Math.floor(p/5),stages.length-1)
      ctx.fillStyle='#8b949e'; ctx.font='11px monospace'; ctx.textAlign='right'
      ctx.fillText(stages[stageIdx],mapX+mapW-4,mapY-10)

      // ── BOTTOM STATUS ──
      if(state==='idle'){
        ctx.fillStyle='#30363d'; ctx.font='10px monospace'; ctx.textAlign='center'
        ctx.fillText('▼ CSS CODE БИЧИЖ PIXEL WORLD БУДУ',W/2,H-8)
      } else if(state==='correct'){
        if(f>3){
          ctx.fillStyle=`rgba(0,255,65,${Math.max(0,.6-f*.02)})`
          ctx.fillRect(0,0,W,H)
          ctx.fillStyle='#00ff41'; ctx.font='bold 14px monospace'; ctx.textAlign='center'
          if(f<20) ctx.fillText('✓ STYLE APPLIED!',W/2,H/2)
        }
      } else if(state==='wrong'){
        ctx.fillStyle=`rgba(239,68,68,${Math.max(0,.3-f*.015)})`
        ctx.fillRect(0,0,W,H)
        if(f<15){
          ctx.fillStyle='#ef4444'; ctx.font='bold 14px monospace'; ctx.textAlign='center'
          ctx.fillText('✗ CSS ERROR!',W/2,H/2)
        }
      }

      // VICTORY
      if(p>=total&&total>0){
        ctx.fillStyle='rgba(0,255,65,.12)'; ctx.fillRect(0,0,W,H)
        ctx.fillStyle='#00ff41'; ctx.font='bold 16px monospace'; ctx.textAlign='center'
        ctx.fillText('🎮 PIXEL WORLD COMPLETE!',W/2,H/2-12)
        ctx.fillStyle='#ffd700'; ctx.font='13px monospace'
        ctx.fillText('Next: JavaScript → Real Gameplay!',W/2,H/2+10)
      }
    }

    
    // ─── CODE DUNGEON ───

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

