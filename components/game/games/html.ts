// @ts-nocheck
// ── HTML GAMES ──
// These game draw functions are closures — they use ctx, W, H, f, state, passedCount, etc.
// from the parent GameTaskCanvas component via closure scope.

    const drawEvolution=()=>{
      // Dark code editor background
      const bg=ctx.createLinearGradient(0,0,0,H)
      bg.addColorStop(0,'#0d1117'); bg.addColorStop(1,'#010409')
      ctx.fillStyle=bg; ctx.fillRect(0,0,W,H)

      // Grid lines
      ctx.strokeStyle='rgba(0,229,255,.04)'; ctx.lineWidth=1
      for(let x=0;x<W;x+=40){ ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke() }
      for(let y=0;y<H;y+=40){ ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke() }

      // GAME EVOLUTION STAGES based on passedCount
      // Stage 0: Empty screen
      // Stage 1-2: DOCTYPE + html structure appears
      // Stage 3-4: head + body + title
      // Stage 5-6: headings + text visible
      // Stage 7-8: image/character spawns
      // Stage 9-10: buttons + inputs appear
      // Stage 11-13: divs + layout forms
      // Stage 14-16: links + nav
      // Stage 17-19: forms + player
      // Stage 20-24: semantic + full UI
      // Stage 25+: FULL GAME running

      const p = passedCount
      const cx = W/2, cy = H/2

      // ── BROWSER FRAME ──
      r(20,10,W-40,H-20,'#161b22')
      r(20,10,W-40,28,'#21262d')
      // Browser buttons
      r(30,17,10,10,'#ff5f57'); r(46,17,10,10,'#febc2e'); r(62,17,10,10,'#28c840')
      // URL bar
      r(80,18,W-120,8,'#0d1117')
      ctx.fillStyle='#8b949e'; ctx.font='9px monospace'; ctx.textAlign='left'
      ctx.fillText(p>0?'file:///game.html':'about:blank', 85, 24)

      // ── CODE EDITOR (LEFT PANEL) ──
      const codeLines=[
        {ln:'1', code:'<!DOCTYPE html>',          col:'#ff7b72', show:p>=1},
        {ln:'2', code:'<html>',                   col:'#7ee787', show:p>=2},
        {ln:'3', code:'  <head>',                 col:'#7ee787', show:p>=3},
        {ln:'4', code:'    <title>Game</title>',  col:'#a5d6ff', show:p>=4},
        {ln:'5', code:'  </head>',                col:'#7ee787', show:p>=5},
        {ln:'6', code:'  <body>',                 col:'#7ee787', show:p>=6},
        {ln:'7', code:'    <h1>Code Quest</h1>',  col:'#ff7b72', show:p>=7},
        {ln:'8', code:'    <p>Start game</p>',    col:'#a5d6ff', show:p>=8},
        {ln:'9', code:'    <img src="player.png">',col:'#ffa657',show:p>=9},
        {ln:'10',code:'    <img src="enemy.png">', col:'#ffa657', show:p>=10},
        {ln:'11',code:'    <button>Start</button>',col:'#d2a8ff', show:p>=11},
        {ln:'12',code:'    <input type="text">',  col:'#d2a8ff', show:p>=12},
        {ln:'13',code:'  <div id="game">',        col:'#7ee787', show:p>=13},
        {ln:'14',code:'    <nav>...</nav>',        col:'#a5d6ff', show:p>=14},
        {ln:'15',code:'    <form>...</form>',      col:'#ffa657', show:p>=15},
      ]

      const visibleLines = codeLines.filter(l=>l.show).slice(-9)
      visibleLines.forEach((line,i)=>{
        const ly = 48+i*14
        // Line number
        ctx.fillStyle='#3d4451'; ctx.font='10px monospace'; ctx.textAlign='right'
        ctx.fillText(line.ln, 45, ly)
        // Code
        ctx.fillStyle=line.col; ctx.textAlign='left'
        ctx.fillText(line.code, 52, ly)
      })

      // Cursor blink
      if(p<codeLines.length){
        const curLine=48+Math.min(visibleLines.length,9)*14
        if((f>>3)%2===0){
          ctx.fillStyle='#00e5ff'
          ctx.fillRect(52,curLine-6,6,10)
        }
      }

      // ── BROWSER PREVIEW (RIGHT PANEL) ──
      r(W/2+5,38,W/2-25,H-48,'#ffffff08')
      ctx.fillStyle='rgba(255,255,255,.05)'; ctx.font='9px monospace'
      ctx.textAlign='center'; ctx.fillText('PREVIEW',W*3/4,48)

      // Preview content builds up with progress
      const px=W/2+20, pw=W/2-40

      if(p>=7){
        // h1 title
        ctx.fillStyle='#e6edf3'; ctx.font='bold 11px monospace'; ctx.textAlign='left'
        ctx.fillText('Code Quest', px, 65)
      }
      if(p>=8){
        // paragraph
        ctx.fillStyle='#8b949e'; ctx.font='12px monospace'
        ctx.fillText('Start your game...', px, 80)
      }
      if(p>=9){
        // Player character (pixel art)
        const charX=px+10, charY=100
        const bob=Math.sin(f*.08)*3
        r(charX,charY-20+bob,14,14,'#238636') // head
        r(charX+2,charY-18+bob,4,4,'#fff')   // eye
        r(charX+8,charY-18+bob,4,4,'#fff')   // eye
        r(charX-2,charY-6+bob,18,16,'#1f6feb') // body
        r(charX,charY+10+bob,5,10,'#1f6feb') // leg l
        r(charX+8,charY+10+bob,5,10,'#1f6feb') // leg r
        ctx.fillStyle='#3d8b40'; ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText('player.png',charX+7,charY+25+bob)
      }
      if(p>=10){
        // Enemy
        const ex=px+60, ey=100
        const esh=Math.sin(f*.12+1)*3
        r(ex,ey-20+esh,14,14,'#b91c1c')
        r(ex+2,ey-18+esh,4,4,'#ff0')
        r(ex+8,ey-18+esh,4,4,'#ff0')
        r(ex-2,ey-6+esh,18,16,'#7f1d1d')
        r(ex,ey+10+esh,5,10,'#7f1d1d')
        r(ex+8,ey+10+esh,5,10,'#7f1d1d')
        ctx.fillStyle='#b91c1c'; ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText('enemy.png',ex+7,ey+25+esh)
      }
      if(p>=11){
        // Button appears
        r(px,130,60,16,'#238636')
        r(px+1,131,58,14,'rgba(255,255,255,.1)')
        ctx.fillStyle='#fff'; ctx.font='10px monospace'; ctx.textAlign='center'
        ctx.fillText('Start',px+30,141)
      }
      if(p>=12){
        // Input appears
        r(px+65,130,80,16,'#0d1117')
        r(px+65,130,80,16,'transparent')
        ctx.strokeStyle='#30363d'; ctx.lineWidth=1
        ctx.strokeRect(px+65,130,80,16)
        ctx.fillStyle='#484f58'; ctx.font='10px monospace'; ctx.textAlign='left'
        ctx.fillText('Enter name...', px+68, 141)
      }
      if(p>=13){
        // div box outline
        ctx.strokeStyle='#21262d'; ctx.lineWidth=1; ctx.setLineDash([2,3])
        ctx.strokeRect(px-2,56,pw-4,H-100)
        ctx.setLineDash([])
        ctx.fillStyle='#21262d'; ctx.font='9px monospace'; ctx.textAlign='left'
        ctx.fillText('div#game',px,53)
      }

      // HUD — score
      if(p>=5){
        r(W-100,42,90,14,'#161b22')
        ctx.fillStyle='#3fb950'; ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText(`TASKS: ${p}/${totalTasks}`,W-55,51)
      }

      // Progress bar at bottom
      r(20,H-22,W-40,8,'#21262d')
      const barW=Math.floor((W-40)*(p/Math.max(totalTasks,1)))
      const barCol=p<5?'#238636':p<10?'#3fb950':p<15?'#1f6feb':'#a371f7'
      r(20,H-22,barW,8,barCol)
      ctx.fillStyle='#8b949e'; ctx.font='11px monospace'; ctx.textAlign='center'
      ctx.fillText(`${p}/${totalTasks} TASKS COMPLETE — GAME EVOLVING...`,W/2,H-6)

      // State feedback
      if(state==='correct'){
        if(f>3){
          // Green flash
          ctx.fillStyle=`rgba(35,134,54,${Math.max(0,.5-f*.02)})`
          ctx.fillRect(20,38,W-40,H-48)
          if(f<20){
            ctx.fillStyle='#3fb950'; ctx.font='bold 12px monospace'; ctx.textAlign='center'
            ctx.fillText('✓ CODE UNLOCKED!',W/2,H/2)
          }
        }
      } else if(state==='wrong'){
        ctx.fillStyle=`rgba(248,81,73,${Math.max(0,.3-f*.015)})`
        ctx.fillRect(20,38,W-40,H-48)
        if(f<15){
          ctx.fillStyle='#f85149'; ctx.font='bold 14px monospace'; ctx.textAlign='center'
          ctx.fillText('✗ SYNTAX ERROR!',W/2,H/2)
        }
      }

      // VICTORY - full game
      if(p>=totalTasks&&totalTasks>0){
        ctx.fillStyle='rgba(163,113,247,.15)'
        ctx.fillRect(20,38,W-40,H-48)
        ctx.fillStyle='#a371f7'; ctx.font='bold 14px monospace'; ctx.textAlign='center'
        ctx.fillText('🎮 GAME COMPLETE!',W/2,H/2-10)
        ctx.fillStyle='#3fb950'; ctx.font='12px monospace'
        ctx.fillText('Full HTML game is ready!',W/2,H/2+10)
      }
    }

    
    // ─── PIXEL WORLD GAME (CSS Course) ───

    const drawWalk=()=>{
      // Sky gradient
      const sky=ctx.createLinearGradient(0,0,0,H)
      sky.addColorStop(0,'#020510'); sky.addColorStop(.6,'#061030'); sky.addColorStop(1,'#0a1828')
      ctx.fillStyle=sky; ctx.fillRect(0,0,W,H)

      // Stars
      for(let i=0;i<30;i++){
        const sx=(i*137+f*.03)%W, sy=(i*71)%120
        const br=.3+Math.sin(f*.05+i)*.2
        ctx.fillStyle=`rgba(255,255,255,${br})`
        ctx.fillRect(sx,sy,i%3===0?2:1,i%3===0?2:1)
      }

      // Scrolling ground
      r(0,H-32,W,32,'#080e18')
      for(let i=0;i<W;i+=32) r((i-f*2)%W+W%32,H-32,30,4,'#0c1422')
      // Road
      ctx.fillStyle='#0a0f18'; ctx.fillRect(0,H-24,W,24)
      for(let i=0;i<W;i+=50){
        const lx=(i-f*(1+passedCount*.5)*1.5+W*10)%W
        r(lx,H-15,28,3,'rgba(255,230,0,.12)')
      }

      // Finish line
      const finishX=W-60
      if(passedCount>=totalTasks-1){
        for(let row=0;row<8;row++)
          for(let col=0;col<4;col++)
            r(finishX+col*6,H-80+row*7,5,6,
              (row+col)%2===0?'#ffffff':'#000000')
        tx('FINISH!',finishX+12,H-85,'#ffe600',10)
      }

      // Items in a line across screen
      const itemData=[
        {emoji:'🌐',label:'WWW',   color:'#00e5ff'},
        {emoji:'📡',label:'WiFi',  color:'#00ff41'},
        {emoji:'🖥️',label:'Server',color:'#ffe600'},
        {emoji:'🔗',label:'URL',   color:'#ff9800'},
        {emoji:'🔒',label:'HTTPS', color:'#bf5af2'},
      ]
      const spacing=Math.floor((W-100)/(Math.max(totalTasks,1)))
      itemData.slice(0,totalTasks).forEach((item,i)=>{
        const ix=80+i*spacing
        const collected=i<passedCount
        const isNext=i===passedCount
        const bob=isNext?Math.sin(f*.1)*7:0

        // Glow for next item
        if(isNext&&!collected){
          ctx.fillStyle=`rgba(255,255,255,.06)`
          ctx.beginPath(); ctx.arc(ix,H-68,22,0,Math.PI*2); ctx.fill()
        }

        // Item
        ctx.globalAlpha=collected?.3:1
        ctx.font=collected?'14px serif':'20px serif'
        ctx.textAlign='center'
        ctx.fillText(item.emoji,ix,H-60+bob*(collected?0:1))
        ctx.globalAlpha=1

        // Label
        ctx.fillStyle=collected?item.color+'44':isNext?item.color:'#2a3a54'
        ctx.font='9px monospace'; ctx.textAlign='center'
        ctx.fillText(item.label,ix,H-46)

        // Collected check
        if(collected){
          ctx.fillStyle='#00ff41'; ctx.font='18px serif'; ctx.textAlign='center'
          ctx.fillText('✓',ix,H-70)
        }

        // Connecting line
        if(i>0){
          ctx.strokeStyle=collected?`${item.color}33`:'#0a1520'
          ctx.lineWidth=1; ctx.setLineDash([3,5])
          ctx.beginPath()
          ctx.moveTo(ix-spacing+16,H-60)
          ctx.lineTo(ix-16,H-60)
          ctx.stroke(); ctx.setLineDash([])
        }
      })

      // Character position - moves toward next item
      const targetX = passedCount < totalTasks
        ? 80 + passedCount * spacing - 30
        : W - 80
      const charBaseX = Math.min(targetX, W-80)

      // Smooth movement
      const walkLeg=Math.sin(f*.22)*5
      const jumpH = state==='correct' ? Math.abs(Math.sin(f*.28))*25 : 0
      const charY = H-55

      // Speed trail
      const speed=1+passedCount*.4
      if(speed>1.5){
        for(let i=1;i<=4;i++){
          ctx.fillStyle=`rgba(0,229,255,${.08/i})`
          ctx.fillRect(charBaseX-6-i*9,charY-8,7,18)
        }
      }

      // Character body
      ctx.fillStyle='#00e5ff'
      ctx.fillRect(charBaseX-5,charY-jumpH-18,10,9)
      // Eyes
      ctx.fillStyle='#000'
      ctx.fillRect(charBaseX+1,charY-jumpH-17,3,3)
      // Visor glow
      ctx.fillStyle='rgba(0,229,255,.4)'
      ctx.fillRect(charBaseX-2,charY-jumpH-16,8,2)
      // Body
      ctx.fillStyle='#0088cc'
      ctx.fillRect(charBaseX-7,charY-jumpH-10,14,11)
      // Legs
      ctx.fillStyle='#006699'
      ctx.fillRect(charBaseX-5,charY-jumpH,5,7+walkLeg)
      ctx.fillRect(charBaseX, charY-jumpH,5,7-walkLeg)

      // Speed badge
      const spd=speed.toFixed(1)
      r(charBaseX-12,charY-jumpH-30,24,10,'rgba(0,229,255,.15)')
      ctx.fillStyle='#00e5ff'; ctx.font='9px monospace'; ctx.textAlign='center'
      ctx.fillText(`x${spd}`,charBaseX,charY-jumpH-22)

      // HUD top right
      r(W-175,6,168,28,'rgba(0,0,0,.6)')
      r(W-173,8,164,24,'#04080f')
      tx(`🌐 ${passedCount}/${totalTasks} COLLECTED`,W-90,26,'#00e5ff',9)
      r(W-173,8,Math.floor(164*(passedCount/Math.max(totalTasks,1))),3,'#00e5ff')

      // Status text
      if(state==='idle'){
        tx('▼ ХАРИУЛААД ITEM ЦУГЛУУЛ',W/2,H-6,'#1a3050',9)
      } else if(state==='correct'){
        if(f>3){
          tx('✓  ЦУГЛУУЛСАН!',W/2,35,'#00ff41',10)
          if(f>12) tx(`+XP · SPEED x${(speed+.4).toFixed(1)}`,W/2,54,'#ffe600',7)
        }
      } else if(state==='wrong'){
        tx('✗ БУРУУ — ХУРД БУУРЛАА',W/2,35,'#ff0040',7)
      }
    }

    // ─── JUMP GAME (CSS) - Character үсэрнэ, platforms ───

