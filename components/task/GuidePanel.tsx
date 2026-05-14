'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import HintSystem from './HintSystem'
import { useAuth } from '@/context/AuthContext'
import { tasksApi, lessonsApi, Task, Lesson } from '@/lib/api-client'

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
type GameState = 'idle'|'running'|'correct'|'wrong'

/* ══════════════════════════════════════
   INTEGRATED GAME + TASK CANVAS
   Game reacts to quiz answers in real-time
══════════════════════════════════════ */

export default function GuidePanel({gameType,passedCount,tasks,totalXP}:{gameType:string;passedCount:number;tasks:any[];totalXP:number}) {
  const guides:Record<string,{icon:string;title:string;color:string;steps:string[];tip:string}> = {
    evolution:{icon:'💻',title:'EVOLUTION GAME',color:'#3fb950',steps:['Task хийх бүрт browser-д HTML element нэмэгдэнэ','Code editor дээр код бичигдэж preview-д харагдана','Character, enemy, button, input бүгд unlock болно','Бүх task дуусахад FULL GAME ажиллана'],tip:'HTML tag бүр game-ийн нэг хэсгийг unlock хийнэ'},
    onlinecodefactory:{icon:'🏭',title:'ONLINE CODE FACTORY',color:'#4488ff',
      steps:['Task 1 → 🏭 Factory online, мөнгө хийж эхэлнэ','Task 3 → 💾 Database холбогдоно','Task 6 → 💾 Save system live болно','Task 8 → 🏆 Leaderboard гарна'],
      tip:'Task хийх бүрт factory upgrade болж илүү их мөнгө хийнэ!'},
    multiplayerarena:{icon:'🌐',title:'MULTIPLAYER ARENA',color:'#4488ff',
      steps:['Task 1 → Server online, player нэмэгдэнэ','Task 3 → Database холбогдож coin spawn болно','Task 5 → Real-time sync lines харагдана','Task 7 → Full multiplayer game!'],
      tip:'Task хийх бүрт шинэ player join хийж game дүүрнэ!'},
    taskbattlesurvival:{icon:'⚔️',title:'TASK BATTLE SURVIVAL',color:'#bf5af2',
      steps:['Enemy гарч ирнэ — зөв код бичиж устга!','✓ Зөв → Enemy үхнэ + HP +10','✗ Буруу → HP -20 (3 удаа буруу → HP бүтэн нөхөгдөнө)','Бүх task хийж дуусгавал 🏆 MASTER!'],
      tip:'3 удаа буруу хийвэл HP бүтэн нөхөгдөж дараагийн task-д орно!'},
    serverdefense:{icon:'🏰',title:'SERVER DEFENSE',color:'#bf5af2',
      steps:['Task 2 → Routes идэвхтэй болно','Task 4 → Database online болно','Task 6 → Auth хамгаалалт нэмэгдэнэ','Task 8 → Full security систем'],
      tip:'Request-уудыг блоклож server-г хамгаал. HACK request = HP буурна!'},
    autocoderunner:{icon:'🤖',title:'AUTO CODE RUNNER',color:'#00e5ff',
      steps:['Task 1 → ⚡ Speed unlock — player хурдасна','Task 2 → 👾 Enemy spawn болно','Task 3 → ⚔️ Auto attack эхэлнэ','Task 4 → ❤️ HP + Win/Lose system'],
      tip:'Чи control хийхгүй — task хийх тусам game өөрөө upgrade болно!'},
    codequestbattle:{icon:'⚔️',title:'CODE QUEST BATTLE',color:'#ff2244',
      steps:['⌨️ Arrow keys-ээр хөдөл','💰 Gold coin цуглуулж score нэм (10 хүрвэл WIN)','👾 Enemy-нүүдийг зайлс — HP буурна','✓ Зөв хариулт → +2 score +20 HP | ✗ Буруу → -10 HP'],
      tip:'Enemy-ийг зайлсаад coin-уудыг цуглуулж score 10 хүрг!'},
    pixelworld:{icon:'🗺',title:'PIXEL WORLD',color:'#00ff41',steps:['Task хийх бүрт pixel world шинэчлэгдэнэ','Player circle болж enemy animate хийнэ','CSS props unlock болж map дэвшинэ','Бүгд дуусахад FULL GAME!'],tip:'CSS property бүр world-ийн нэг хэсгийг unlock хийнэ'},
    walk:{icon:'🌐',title:'INTERNET WALKER',color:'#00e5ff',steps:['Зөв хариулт өгөх бүрт character хурдасна','🌐WWW → 📡WiFi → 🖥️Server → 🔗URL → 🔒HTTPS','Бүх items цуглуулбал FINISH хүрнэ','Буруу хариулт → хурд буурна'],tip:'Зөв хариулт = x0.4 хурд нэмэгдэнэ'},
    island:{icon:'🏝',title:'SURVIVAL ISLAND',color:'#00e5ff',steps:['Зөв хариулт бүрт island дээр item гарна','🏕→🌿→🔧→🖥→💡→📡→🚀 дарааллаар','Бүх items цуглуулбал island бүрэн болно','Буруу хариулт → item гарахгүй'],tip:'HTML code ажиллуулж island-аа бүтээ'},
    jump:{icon:'🎨',title:'CSS PLATFORMS',color:'#bf5af2',steps:['Зөв хариулт бүрт platform нэмэгдэнэ','margin→padding→border→flex→media','Character platform дээр үсэрч дэвшинэ','Буруу хариулт → platform гарахгүй'],tip:'CSS properties нэг нэгнийхээ дээр суурилдаг'},
    enemy:{icon:'⚡',title:'BUG HUNTER',color:'#ff2d55',steps:['BUG/enemy-нууд character руу дайрна','Зөв хариулт → BUG устна + score нэмэгдэнэ','Буруу хариулт → BUG амилна','Бүх BUG устгавал VICTORY!'],tip:'JS bugs-г зөв мэдлэгээр устга'},
    city:{icon:'🏙',title:'CITY BUILDER',color:'#4488ff',steps:['Зөв хариулт бүрт барилга ургана','HTML→CSS→JS→DOM→REACT дарааллаар','Буруу хариулт → барилга хагардаг','Бүх барилга барьвал мега хот!'],tip:'React component бол бүтэц шиг'},
    castle:{icon:'🏰',title:'SERVER DEFENSE',color:'#aa44ff',steps:['Request/enemy-нууд castle руу дайрна','Зөв хариулт → castle хана өсдөг','Буруу хариулт → castle hit авна','Castle хамгаалж серверийг бүтээ!'],tip:'HTTP method-уудыг зөв ашигла'},
    kingdom:{icon:'👑',title:'DATA KINGDOM',color:'#4488ff',steps:['Зөв хариулт бүрт table unlock болно','USERS→POSTS→ORDERS→ITEMS→LOGS','SQL beam шинэ table-г scan хийнэ','Бүх tables unlock бол Data King!'],tip:'SQL query-г зөв бичиж data ол'},
    timemachine:{icon:'⏳',title:'TIME MACHINE',color:'#00e5ff',steps:['Зөв хариулт бүрт git commit нэмэгдэнэ','v1→v2→v3→v4 timeline ургана','Branch-нууд гарч ирнэ','Бүх commit хийвэл history бүрэн!'],tip:'Git command цаг хугацааг удирдана'},
    megacity:{icon:'🚀',title:'MEGA CITY',color:'#00ff41',steps:['Зөв хариулт бүрт system online болно','Frontend→Backend→DB→Auth→API→Deploy','Systems хоорондоо холбогдоно','Бүх systems online бол FULLSTACK!'],tip:'Fullstack = олон систем нэгдэнэ'},
  }
  const tipsMap:Record<string,{c:string;t:string}[]> = {
    evolution:[{c:'#3fb950',t:'<!DOCTYPE html> — browser-д HTML гэдгийг мэдэгдэнэ.'},{c:'#7ee787',t:'<html><head><body> — хуудасны гол 3 хэсэг.'},{c:'#ffa657',t:'<img src="..."> — зураг/character оруулах tag.'},{c:'#d2a8ff',t:'<button> <input> — хэрэглэгч дарах бичих элементүүд.'}],
    pixelworld:[{c:'#00ff41',t:'color: red — текстийн өнгийг өөрчилнэ.'},{c:'#3b82f6',t:'display: flex — хэвтээ/босоо байрлуулах хамгийн хялбар.'},{c:'#10b981',t:'position: absolute — элементийг яг хаана байхыг заана.'},{c:'#ec4899',t:'animation — CSS-ийн хамгийн хөгжилтэй хэсэг!'}],
    walk:[{c:'#00e5ff',t:'Интернет = дэлхий даяар холбогдсон компьютерийн сүлжээ.'},{c:'#ffe600',t:'Client = хүсэлт гаргагч (browser), Server = хариу өгөгч.'},{c:'#00ff41',t:'HTTP мэдээлэл солилцох дүрэм, HTTPS нь шифрлэгдсэн.'},{c:'#bf5af2',t:'DNS нь domain-г IP болгон хөрвүүлдэг.'}],
    island:[{c:'#00e5ff',t:'HTML = вэб хуудасны яс. CSS дизайн, JS харилцан үйлдэл.'},{c:'#ffe600',t:'h1=гарчиг, p=параграф, img=зураг, a=холбоос.'},{c:'#00ff41',t:'Button, input, form — хэрэглэгчтэй харилцах элементүүд.'},{c:'#ff9800',t:'div нь хайрцаг — элементүүдийг бүлэглэхэд.'}],
    jump:[{c:'#bf5af2',t:'Box model: margin→border→padding→content давхарга.'},{c:'#00e5ff',t:'Flexbox-оор элементийг хэвтээ/босоо голлуулах хялбар.'},{c:'#ffe600',t:'Media query ашиглан mobile/desktop дизайн тусад хий.'},{c:'#00ff41',t:':hover ашиглан хулгана дээр очихдоо өнгө солино.'}],
    enemy:[{c:'#ff2d55',t:'var, let, const — хувьсагч зарлах 3 арга.'},{c:'#ffe600',t:'Function = дахин дахин ажиллуулж болох кодын блок.'},{c:'#00ff41',t:'addEventListener ашиглан click, input event-д хариулна.'},{c:'#00e5ff',t:'for loop тоолж давтана, while нөхцөл үнэн байхад.'}],
    city:[{c:'#4488ff',t:'Component = дахин ашиглах UI хэсэг. Props гаднаас.'},{c:'#ffe600',t:'useState hook нь өөрчлөгдөх утгыг хадгална.'},{c:'#00ff41',t:'useEffect нь render дарааш ажиллана.'},{c:'#bf5af2',t:'Array.map() ашиглан жагсаалт динамикаар харуулна.'}],
    castle:[{c:'#aa44ff',t:'GET=унших, POST=нэмэх, PUT=шинэчлэх, DELETE=устгах.'},{c:'#ffe600',t:'Express: app.get("/path", handler) route тодорхойлно.'},{c:'#00ff41',t:'JSON формат ашиглан frontend/backend солилцоно.'},{c:'#00e5ff',t:'Status: 200=OK, 404=олдсонгүй, 500=серверийн алдаа.'}],
    kingdom:[{c:'#4488ff',t:'SELECT * FROM table — бүх мөрийг авна.'},{c:'#ffe600',t:'WHERE нөхцлөөр шүүнэ: WHERE age > 18.'},{c:'#00ff41',t:'JOIN ашиглан хоёр хүснэгтийг нэгтгэж харна.'},{c:'#bf5af2',t:'Primary key нь мөр бүрийн уникаль таних тэмдэг.'}],
    timemachine:[{c:'#00e5ff',t:'git add → git commit → git push дарааллаар.'},{c:'#ffe600',t:'Branch ашиглан тусдаа feature хийж merge-ээр нэгтгэнэ.'},{c:'#00ff41',t:'npm install package суулгана, npm run dev сервер.'},{c:'#bf5af2',t:'cd = folder солих, ls = файлуудыг жагсаах.'}],
    megacity:[{c:'#00ff41',t:'Fullstack = frontend + backend + database + auth нэгдсэн.'},{c:'#ffe600',t:'JWT token ашиглан хэрэглэгчийн нэвтрэлт хадгална.'},{c:'#00e5ff',t:'CRUD: Create, Read, Update, Delete — 4 үйлдэл.'},{c:'#bf5af2',t:'Алгоритм = асуудлыг шийдэх алхам алхмаар заавар.'}],
  }
  const g = guides[gameType] || guides.walk
  const tips = tipsMap[gameType] || tipsMap.walk
  return (
    <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:8,minWidth:240,overflowY:'auto'}}>
      <div style={{background:'#030c18',border:`1px solid ${g.color}22`,padding:'10px 12px',flexShrink:0}}>
        <div style={{fontFamily:'var(--fp)',fontSize:7,color:g.color,marginBottom:8}}>{g.icon} {g.title}</div>
        {g.steps.map((step,i)=>(
          <div key={i} style={{display:'flex',gap:6,marginBottom:5,alignItems:'flex-start'}}>
            <span style={{fontFamily:'var(--fp)',fontSize:5,color:g.color,flexShrink:0,width:14,height:14,background:`${g.color}18`,border:`1px solid ${g.color}44`,display:'flex',alignItems:'center',justifyContent:'center'}}>{i+1}</span>
            <span style={{fontFamily:'var(--fm)',fontSize:11,color:'#7a9ab5',lineHeight:1.7}}>{step}</span>
          </div>
        ))}
        <div style={{marginTop:8,padding:'5px 8px',background:`${g.color}0d`,borderLeft:`2px solid ${g.color}`,fontSize:10,color:g.color,fontFamily:'var(--fm)'}}>{g.tip}</div>
      </div>
      <div style={{background:'#030c18',border:'1px solid #0a1520',padding:'8px 10px',flexShrink:0}}>
        <div style={{fontFamily:'var(--fp)',fontSize:4,color:'#2a4a6a',marginBottom:5,letterSpacing:2}}>📊 ДЭВШИЛ</div>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
          <span style={{fontFamily:'var(--fp)',fontSize:5,color:'#4a6a8a'}}>{passedCount}/{tasks.length}</span>
          <span style={{fontFamily:'var(--fp)',fontSize:5,color:'#ffe600'}}>+{totalXP}XP</span>
        </div>
        <div style={{background:'#0a0f1a',height:4}}>
          <div style={{height:'100%',background:`linear-gradient(90deg,${g.color},#00ff41)`,width:`${tasks.length>0?passedCount/tasks.length*100:0}%`,transition:'width .4s'}}/>
        </div>
      </div>
      <div style={{background:'#030c18',border:'1px solid #0a1520',padding:'8px 10px',flexShrink:0}}>
        <div style={{fontFamily:'var(--fp)',fontSize:4,color:'#2a4a6a',marginBottom:6,letterSpacing:2}}>💬 ЗӨВЛӨМЖ</div>
        {tips.map((h,i)=>(
          <div key={i} style={{display:'flex',gap:6,marginBottom:5,alignItems:'flex-start'}}>
            <div style={{width:3,flexShrink:0,alignSelf:'stretch',background:h.c,opacity:.6,minHeight:12}}/>
            <div style={{fontFamily:'var(--fm)',fontSize:11,color:'#8aaabb',lineHeight:1.7}}>{h.t}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


/* ══ MAIN MODAL ══ */
interface Props{lessonId:string;onClose:()=>void;onDone?:(n?:string)=>void}
