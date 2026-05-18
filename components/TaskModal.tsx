'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import HintSystem from './task/HintSystem'
import GameTaskCanvas from './game/GameCanvas'
import GuidePanel from './task/GuidePanel'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { tasksApi, lessonsApi, Task, Lesson } from '@/lib/api-client'
import PixelIcon from '@/components/ui/PixelIcon'

// Use CDN loader for faster Monaco loading
import { loader } from '@monaco-editor/react'
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.52.0/min/vs' },
  'vs/nls': { availableLanguages: {} },
})

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.default),
  { ssr: false, loading: () => (
    <div style={{flex:1,background:'#0d1117',display:'flex',alignItems:'center',justifyContent:'center',
      fontFamily:"'Press Start 2P',monospace",fontSize:8,color:'#2a4060',letterSpacing:2}}>
      ⚡ EDITOR АЧААЛЛАЖ БАЙНА...
    </div>
  )}
)

type ExtTask   = Task & { starterCode?:string; testCases?:TestCase[] }
interface TestCase    { input:unknown; expected:unknown; label?:string }
interface RunResult   { label:string; input:unknown; expected:unknown; actual:unknown; passed:boolean; error?:string; runtime?:number; logs?:string[] }
interface ConsoleLine { text:string; col:string }
type GameState = 'idle'|'running'|'correct'|'wrong'
interface Props { lessonId:string; onClose:()=>void; onDone?:(nextId?:string|null)=>void }

const fp = { fontFamily:"'Press Start 2P',monospace" } as const
const fm = { fontFamily:"'Share Tech Mono',monospace" }  as const

const kf = `
@keyframes popIn       { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }
@keyframes tm-in       { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
@keyframes tm-scan     { 0%{top:-40px} 100%{top:100%} }
@keyframes tm-glitch   {
  0%{transform:translate(0);filter:none}
  15%{transform:translate(-4px,2px);filter:hue-rotate(90deg) brightness(1.6)}
  30%{transform:translate(4px,-2px);filter:hue-rotate(-90deg)}
  50%{transform:translate(-3px,3px);filter:brightness(1.8) saturate(2)}
  70%{transform:translate(3px,-1px);filter:hue-rotate(180deg)}
  85%{transform:translate(-1px,2px);filter:brightness(.5)}
  100%{transform:translate(0);filter:none}
}
@keyframes tm-shake    { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 50%{transform:translateX(8px)} 80%{transform:translateX(-4px)} }
@keyframes tm-critical { 0%{opacity:0;transform:translateY(4px) scale(.5)} 25%{opacity:1;transform:translateY(-20px) scale(1.5)} 65%{opacity:1;transform:translateY(-34px) scale(1.1)} 100%{opacity:0;transform:translateY(-56px) scale(.8)} }
@keyframes tm-combo    { 0%{transform:scale(1)} 35%{transform:scale(1.6)} 100%{transform:scale(1)} }
@keyframes tm-log      { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
@keyframes tm-pulse    { 0%,100%{opacity:1} 50%{opacity:.35} }
@keyframes tm-correct  { 0%,100%{background:transparent} 50%{background:rgba(0,255,65,.07)} }
@keyframes tm-wrong    { 0%,100%{background:transparent} 30%,70%{background:rgba(255,0,64,.07)} }
@keyframes tm-rank     { from{opacity:0;transform:scale(.6) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
@keyframes tm-hp       { 0%{transform:scale(1)} 50%{transform:scale(1.5);filter:brightness(3)} 100%{transform:scale(0);opacity:0} }
@keyframes tm-xp       { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes tm-dead     { 0%{opacity:0;transform:scale(.9)} 15%{opacity:1;transform:scale(1.02)} 75%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(.97)} }
@keyframes tm-deadpulse{ 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.65;transform:scale(1.08)} }
@keyframes tm-countdown{ from{width:100%} to{width:0%} }
`

export default function TaskModal({ lessonId, onClose, onDone }: Props) {
  const { refreshUser } = useAuth()
  const { lang, setLang } = useLang()
  const isMn = lang === 'mn'
  const tx = {
    missionBrief:  isMn ? 'ДААЛГАВРЫН ТАЙЛБАР' : 'MISSION BRIEF',
    testCases:     isMn ? 'ТЕСТ КЕЙСҮҮД'       : 'TEST CASES',
    expected:      isMn ? 'ЗӨВ ХАРИУЛТ'        : 'EXPECTED',
    enterBelow:    isMn ? '⬇ Доорх хэсэгт кодоо бичнэ үү' : '⬇ Enter your solution below',
    targetOutput:  isMn ? '↩ Буцаах утга:'      : '↩ Should return:',
    codeEditor:    isMn ? 'КОД БИЧИХ'           : 'CODE EDITOR',
    termOutput:    isMn ? 'TERMINAL ГАРАЛТ'     : 'TERMINAL OUTPUT',
    correct:       isMn ? '✓ ЗӨВ!'              : '✓ CORRECT!',
    wrong:         isMn ? '✗ БУРУУ ХАРИУЛТ'     : '✗ WRONG ANSWER',
    correctWas:    isMn ? '✓ Зөв хариулт:'      : '✓ Correct answer:',
    comboBrk:      isMn ? 'COMBO ТАСАРЛАА · HP –1' : 'COMBO BREAK · HP –1',
    retry:         isMn ? '↺ ДАХИН'             : '↺ RETRY',
    skip:          isMn ? 'АЛГАСАХ →'           : 'SKIP →',
    nextMission:   isMn ? 'ДАРААГИЙН ДААЛГАВАР →' : 'NEXT MISSION →',
    completeMission: isMn ? '✓ ДААЛГАВАР ДУУСГАХ →' : '✓ COMPLETE MISSION →',
    missionComplete: isMn ? 'ДААЛГАВАР ДУУСГАВ'   : 'MISSION COMPLETE',
    nextLesson:    isMn ? 'ДАРААГИЙН ХИЧЭЭЛ →'  : 'NEXT LESSON →',
    finish:        isMn ? 'ДУУСГАХ →'           : 'FINISH →',
    close:         isMn ? 'ХААХ'                : 'CLOSE',
    score:         isMn ? 'ОНООи'               : 'SCORE',
    maxCombo:      isMn ? 'ДЭД COMBO'           : 'MAX COMBO',
    passed:        isMn ? '✓ ДАВСАН'            : '✓ PASSED',
    loading:       isMn ? 'АЧААЛЛАЖ БАЙНА...'   : 'LOADING...',
    mission:       isMn ? 'ДААЛГАВАР'           : 'MISSION',
    run:           isMn ? '▷ АЖИЛЛУУЛАХ'        : '▷ RUN',
    submit:        isMn ? '⚡ ИЛГЭЭХ'           : '⚡ SUBMIT',
    done:          isMn ? '✓ ДУУССАН'           : '✓ DONE',
    next:          isMn ? 'ДАРААГИЙН →'         : 'NEXT →',
    term:          isMn ? 'ТЕРМ'                : 'TERM',
    finish2:       isMn ? '✓ ДУУСГАХ'           : '✓ FINISH',
    quiz:          isMn ? 'АСУУЛТ'              : 'QUIZ',
    acc:           isMn ? 'НАРИЙВЧ'             : 'ACC%',
  }

  /* ── Core state ─────────────────────────────────────────── */
  const [lesson,      setLesson]     = useState<Lesson|null>(null)
  const [nextLessonId,setNextLessonId]= useState<string|null>(null)
  const [tasks,       setTasks]      = useState<ExtTask[]>([])
  const [fetching,    setFetching]   = useState(true)
  const [activeId,    setActiveId]   = useState<string|null>(null)
  const [code,        setCode]       = useState('')
  const [passed,      setPassed]     = useState<Record<string,boolean|null>>({})
  const [xpMap,       setXpMap]      = useState<Record<string,number>>({})
  const [running,     setRunning]    = useState(false)
  const [submitting,  setSubmitting] = useState(false)
  const [runResults,  setRunResults] = useState<RunResult[]|null>(null)
  const [completing,  setCompleting] = useState(false)
  const [lessonDone,  setLessonDone] = useState(false)
  const [variantMap,  setVariantMap] = useState<Record<string,number>>({})
  const [shuffleMap,  setShuffleMap] = useState<Record<string,number[]>>({})
  const [gameState,   setGameState]  = useState<GameState>('idle')
  const [showGuide,   setShowGuide]  = useState(false)
  const [wrongCount,  setWrongCount] = useState(0)
  const [, setSubmitCount]= useState<Record<string,number>>({})
  const [correctIdx,  setCorrectIdx] = useState<Record<string,number>>({})

  /* ── Game mechanics state ────────────────────────────────── */
  const [combo,      setCombo]      = useState(0)
  const [maxCombo,   setMaxCombo]   = useState(0)
  const [hp,         setHp]         = useState(3)
  const [streak,     setStreak]     = useState(0)
  const [critHit,    setCritHit]    = useState(false)
  const [critXP,     setCritXP]     = useState(0)
  const [glitching,  setGlitching]  = useState(false)
  const [hpDead,     setHpDead]     = useState(false)
  const [wpm,        setWpm]        = useState(0)
  const [keyCount,   setKeyCount]   = useState(0)
  const [codeStart,  setCodeStart]  = useState<number|null>(null)
  const [consoleLogs,setConsoleLogs]= useState<ConsoleLine[]>([])
  const [showConsole,setShowConsole]= useState(false)
  const consoleRef   = useRef<HTMLDivElement>(null)
  const autoCloseRef = useRef<ReturnType<typeof setTimeout>|null>(null)

  /* ── Derived ─────────────────────────────────────────────── */
  const lt3 = (lesson?.title||'').toLowerCase()
  const gt3 = lt3.includes('вэб')?'walk':lt3.includes('html')?'island':lt3.includes('css')?'jump':lt3.includes('javascript')||lt3.includes('js')?'enemy':lt3.includes('frontend')||lt3.includes('react')?'city':lt3.includes('backend')||lt3.includes('node')?'castle':lt3.includes('mongodb')||lt3.includes('database')?'kingdom':lt3.includes('auth')?'megacity':lt3.includes('sql')||lt3.includes('mysql')?'kingdom':lt3.includes('git')||lt3.includes('terminal')?'timemachine':'walk'

  const activeTask  = tasks.find(t => t.id === activeId) as ExtTask|undefined
  const isCode      = activeTask?.taskType === 'code'
  const tcsRaw      = activeTask?.testCases
  const tcs: TestCase[] = tcsRaw ? (typeof tcsRaw==='string' ? JSON.parse(tcsRaw) : Array.isArray(tcsRaw) ? tcsRaw : []) : []
  // Use English options when in EN mode and optionsEn is available
  const optsRaw     = (lang === 'en' && activeTask?.optionsEn?.length) ? activeTask.optionsEn : activeTask?.options
  const parsed0     = optsRaw ? (typeof optsRaw==='string' ? JSON.parse(optsRaw) : optsRaw) : null
  const isMulti     = Array.isArray(parsed0?.[0])
  const varIdx      = activeId ? (variantMap[activeId]??0) : 0
  const rawOpts: string[]|undefined = parsed0 ? (isMulti ? (parsed0 as string[][])[varIdx] : parsed0 as string[]) : undefined
  const shuffle     = activeId ? shuffleMap[activeId] : null
  const opts: string[]|undefined = rawOpts && shuffle ? shuffle.map(i => rawOpts[i]) : rawOpts
  // Use English description when in EN mode and descriptionEn is available
  const rawDesc     = (lang === 'en' && activeTask?.descriptionEn) ? activeTask.descriptionEn : activeTask?.description
  const descParts   = rawDesc?.split('|||') ?? []
  const activeDesc  = descParts.length>1 ? (descParts[varIdx]??descParts[0]) : rawDesc
  // Also use English title when available
  const activeTitle = (lang === 'en' && activeTask?.titleEn) ? activeTask.titleEn : activeTask?.title
  const activeDone  = activeId!==null && passed[activeId]===true
  const passedCount = tasks.filter(t => passed[t.id]===true).length
  const totalXP     = Object.values(xpMap).reduce((a,b)=>a+b,0)
  const allPassed   = tasks.length>0 && passedCount===tasks.length
  const qPassed     = activeId!==null ? passed[activeId] : undefined
  const qXp         = activeId!==null ? (xpMap[activeId]??0) : 0
  const activeIdx   = tasks.findIndex(t => t.id===activeId)
  const accuracy    = streak+wrongCount>0 ? Math.round(streak/(streak+wrongCount)*100) : 100
  const comboColor  = combo>=7?'#ff6b35':combo>=5?'#ff9900':combo>=3?'#ffd700':'#ffe600'

  const codeLanguage = code.trim().startsWith('<')||code.trim().startsWith('<!') ? 'html'
    : code.trim().startsWith('/*')||code.trim().startsWith('.')||code.trim().startsWith('#')||(code.includes('{')&&code.includes('}')&&!code.includes('function')&&!code.includes('=>')) ? 'css'
    : code.trim().match(/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|--)/i) ? 'sql'
    : 'javascript'

  /* ── Load ────────────────────────────────────────────────── */
  useEffect(() => {
    setFetching(true)
    const resetKey  = `arenahub_reset_${lessonId}`
    const variantKey= `arenahub_v_${lessonId}`
    const wasReset  = localStorage.getItem(resetKey) === '1'
    if (wasReset) localStorage.removeItem(resetKey)

    let savedVm: Record<string,number> = {}
    try { savedVm = JSON.parse(localStorage.getItem(variantKey) || '{}') } catch {}

    Promise.all([lessonsApi.get(lessonId), tasksApi.byLesson(lessonId)])
      .then(([ld, td]) => {
        setLesson(ld.lesson)
        let list = td.tasks as ExtTask[]

        if (wasReset) {
          // shuffle task ORDER so user sees different sequence on re-entry
          const orderKey = `arenahub_order_${lessonId}`
          list = [...list].sort(() => Math.random() - 0.5)
          localStorage.setItem(orderKey, JSON.stringify(list.map(t=>t.id)))
          setPassed({}); setXpMap({})
        } else {
          // restore prior submission state (checkpoint resume)
          const initPassed: Record<string,boolean|null> = {}
          const initXp: Record<string,number> = {}
          list.forEach(t => {
            if (t.submitted?.status === 'PASSED') { initPassed[t.id] = true; initXp[t.id] = t.submitted.xpEarned ?? 0 }
          })
          setPassed(initPassed); setXpMap(initXp)
        }
        setTasks(list)

        // build variant map — advance all indices on reset
        const vm: Record<string,number> = {}
        list.forEach(t => {
          const raw=t.options; const parsed=raw?(typeof raw==='string'?JSON.parse(raw):raw):null
          const count=Array.isArray(parsed?.[0])?(parsed as unknown[][]).length:1
          const prev = savedVm[t.id] ?? 0
          vm[t.id] = count > 1 ? (wasReset ? (prev + 1) % count : prev) : 0
        })
        localStorage.setItem(variantKey, JSON.stringify(vm))
        setVariantMap(vm)

        const start = wasReset
          ? list[0]
          : (list.find(t => t.submitted?.status !== 'PASSED') ?? list[0])
        if (start) { setActiveId(start.id); if(start.taskType==='code') setCode('') }
      }).finally(() => setFetching(false))
  }, [lessonId])

  useEffect(() => {
    if (!activeId||!rawOpts) return
    if (shuffleMap[activeId]) return
    const idx=[...Array(rawOpts.length).keys()]
    for (let i=idx.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[idx[i],idx[j]]=[idx[j],idx[i]]}
    setShuffleMap(m=>({...m,[activeId]:idx}))
  }, [activeId, rawOpts?.join(',')])

  useEffect(() => {
    if (!codeStart||keyCount<10) return
    const mins=(Date.now()-codeStart)/60000
    if (mins>0) setWpm(Math.min(Math.round((keyCount/5)/mins),999))
  }, [keyCount, codeStart])

  useEffect(() => {
    if (consoleRef.current) consoleRef.current.scrollTop=consoleRef.current.scrollHeight
  }, [consoleLogs])

  /* ── HP=0 → dead screen 3s → auto-close ───────────────────── */
  useEffect(() => {
    if (hp !== 0 || lessonDone) return
    setHpDead(true)
    localStorage.setItem(`arenahub_reset_${lessonId}`, '1')
    autoCloseRef.current = setTimeout(() => {
      setHpDead(false)
      if (onDone) onDone(null); else onClose()
    }, 3000)
    return () => { if (autoCloseRef.current) clearTimeout(autoCloseRef.current) }
  }, [hp]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Game mechanics ──────────────────────────────────────── */
  const triggerGlitch = useCallback(() => {
    setGlitching(true); setTimeout(()=>setGlitching(false), 680)
  }, [])

  const onCorrectAnswer = useCallback((xp: number) => {
    const nc = combo+1
    setCombo(nc); setMaxCombo(m=>Math.max(m,nc)); setStreak(s=>s+1)
    const crit = Math.random() < (0.18+Math.min(nc*0.04,0.25))
    if (crit) { setCritXP(Math.round(xp*.5)); setCritHit(true); setTimeout(()=>setCritHit(false),1500) }
  }, [combo])

  const onWrongAnswer = useCallback(() => {
    setCombo(0); setHp(h=>Math.max(0,h-1)); triggerGlitch()
  }, [triggerGlitch])

  const simulateConsole = useCallback((results: RunResult[], allPass: boolean) => {
    setConsoleLogs([]); setShowConsole(true)
    const lines: {text:string;col:string;delay:number}[] = [
      {text:'> INITIALIZING SANDBOX...', col:'#2a5070', delay:0},
      {text:'> COMPILING SOURCE...',     col:'#3a6080', delay:110},
    ]
    let d=240
    results.forEach((r,i) => {
      lines.push({text:`> RUN TEST ${i+1}/${results.length}  [${r.label}]`, col:'#ffe60055', delay:d}); d+=130
      if (r.passed)     lines.push({text:`  ✓ PASS  ${r.runtime!==undefined?r.runtime+'ms':'OK'}`,        col:'#00ff41', delay:d})
      else if (r.error) lines.push({text:`  ✗ ERR   ${r.error.slice(0,55)}`,                               col:'#ff0040', delay:d})
      else              lines.push({text:`  ✗ FAIL  got: ${JSON.stringify(r.actual)?.slice(0,35)}`,         col:'#ff0040', delay:d})
      d+=110
    })
    lines.push({text:allPass?'> ✓ ALL TESTS PASSED':'> ✗ TESTS FAILED', col:allPass?'#00ff41':'#ff0040', delay:d+60})
    if (allPass) lines.push({text:'> XP AWARDED. MISSION COMPLETE.', col:'#ffd700', delay:d+280})
    lines.forEach(({text,col,delay}) => setTimeout(()=>setConsoleLogs(ls=>[...ls,{text,col}]), delay))
  }, [])

  /* ── Actions ─────────────────────────────────────────────── */
  const doActivate = useCallback((t: ExtTask) => {
    if (autoCloseRef.current) { clearTimeout(autoCloseRef.current); autoCloseRef.current = null }
    setHpDead(false); setHp(3); setCombo(0)
    setActiveId(t.id); setRunResults(null); setGameState('idle')
    setConsoleLogs([]); setShowConsole(false); setKeyCount(0); setCodeStart(null); setWpm(0)
    if (t.taskType==='code') setCode('')
  }, [])

  // cycle to next variant of current task; if single-variant, swap with a random non-passed task
  const handleChangeTask = useCallback(() => {
    if (!activeTask || activeDone) return
    const tid = activeTask.id
    const raw = activeTask.options
    const parsed = raw ? (typeof raw==='string' ? JSON.parse(raw) : raw) : null
    const count = Array.isArray(parsed?.[0]) ? (parsed as unknown[][]).length : 1
    if (count > 1) {
      // cycle to next variant
      setVariantMap(vm => {
        const cur = vm[tid] ?? 0
        return { ...vm, [tid]: (cur + 1) % count }
      })
      setShuffleMap(m => { const n={...m}; delete n[tid]; return n })
      setPassed(p => { const n={...p}; delete n[tid]; return n })
      setRunResults(null); setGameState('idle')
    } else {
      // no variants — move current task to end, activate next incomplete
      setTasks(ts => {
        const rest = ts.filter(t => t.id !== tid)
        return [...rest, activeTask]
      })
      const next = tasks.find(t => t.id !== tid && passed[t.id] !== true)
      if (next) doActivate(next)
    }
  }, [activeTask, activeDone, tasks, passed, doActivate])

  const handleRetry = useCallback(() => {
    const vm: Record<string,number>={}
    tasks.forEach(t => {
      const raw=t.options; const parsed=raw?(typeof raw==='string'?JSON.parse(raw):raw):null
      const count=Array.isArray(parsed?.[0])?(parsed as unknown[][]).length:1
      const cur=variantMap[t.id]??0
      vm[t.id]=count>1?(cur+1+Math.floor(Math.random()*(count-1)))%count:0
    })
    setVariantMap(vm); setShuffleMap({}); setPassed({}); setWrongCount(0); setSubmitCount({})
    setRunResults(null); setShowConsole(false); setConsoleLogs([])
    setGameState('idle'); setCombo(0); setMaxCombo(0); setHp(3); setStreak(0); setCritHit(false)
    setLessonDone(false); setXpMap({}); setNextLessonId(null)
    setTasks(ts=>ts.map(t=>({...t,submitted:undefined})))
    const first=tasks[0]; if(first){setActiveId(first.id);if(first.taskType==='code')setCode('')}
  }, [tasks, variantMap])

  const handleRetryTask = useCallback(() => {
    if (!activeTask) return
    const tid = activeTask.id
    setPassed(p => { const n={...p}; delete n[tid]; return n })
    setTasks(ts => ts.map(t => t.id===tid ? {...t,submitted:undefined} : t))
    setRunResults(null); setGameState('idle')
    setConsoleLogs([]); setShowConsole(false)
  }, [activeTask])

  const completeLessonAndFindNext = useCallback(async () => {
    try {
      await lessonsApi.complete(lessonId); await refreshUser()
      if (lesson?.courseId) {
        const d = await lessonsApi.byCourse(lesson.courseId)
        const all = d.lessons as Lesson[]
        const idx = all.findIndex(l => l.id === lessonId)
        setNextLessonId(all[idx + 1]?.id ?? null)
      }
    } catch {}
    setLessonDone(true)
  }, [lessonId, lesson, refreshUser])

  const handleQuiz = async (displayedSel: number) => {
    if (!activeTask||activeDone||submitting) return
    setSubmitting(true)
    const sel=shuffle?shuffle[displayedSel]:displayedSel
    try {
      const r=await tasksApi.submitQuiz(activeTask.id,sel)
      setPassed(p=>({...p,[activeTask.id]:r.isCorrect}))
      setXpMap(x=>({...x,[activeTask.id]:r.xpEarned}))
      setTasks(ts=>ts.map(t=>t.id===activeTask.id?{...t,submitted:{id:'_',status:r.isCorrect?'PASSED':'FAILED',selected:displayedSel,xpEarned:r.xpEarned}}:t))
      setGameState(r.isCorrect?'correct':'wrong')
      if (r.isCorrect) {
        onCorrectAnswer(r.xpEarned)
        const updatedPassed = {...passed, [activeTask.id]: true}
        const allNowPassed = tasks.every(t => updatedPassed[t.id] === true || t.id === activeTask.id)
        if (allNowPassed) await completeLessonAndFindNext()
      } else {
        setWrongCount(w=>w+1); onWrongAnswer()
        if (r.correctAnswer !== undefined) setCorrectIdx(ci=>({...ci,[activeTask.id]: r.correctAnswer}))
      }
    } catch(e:unknown){alert((e as Error).message)}
    finally{setSubmitting(false)}
  }

  const goNext = () => {
    const next=tasks[activeIdx+1] as ExtTask|undefined; if(!next) return
    if (qPassed===false){const tid=activeTask!.id;setPassed(p=>{const n={...p};delete n[tid];return n});setTasks(ts=>ts.map(t=>t.id===tid?{...t,submitted:undefined}:t))}
    doActivate(next)
  }

  const handleRun = async () => {
    if (!activeTask||!code.trim()||tcs.length===0) return
    setRunning(true);setRunResults(null);setGameState('running')
    try {
      const token=localStorage.getItem('arenahub_token')
      const res=await fetch('/api/execute',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({code,testCases:tcs})})
      const d=await res.json(); const results:RunResult[]=d.results??[]
      setRunResults(results); setGameState(d.allPass?'correct':'wrong'); simulateConsole(results,d.allPass)
    } catch(e:unknown){alert((e as Error).message)}
    finally{setRunning(false)}
  }

  const handleSubmitCode = async () => {
    if (!activeTask||!code.trim()||activeDone) return
    setSubmitting(true);setRunResults(null);setGameState('running')
    setConsoleLogs([{text:'> INITIALIZING SANDBOX...',col:'#2a5070'}]);setShowConsole(true)
    setTimeout(()=>setConsoleLogs(ls=>[...ls,{text:'> COMPILING SOURCE...',col:'#3a6080'}]),110)
    try {
      const token=localStorage.getItem('arenahub_token')
      const execRes=await fetch('/api/execute',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({code,testCases:tcs})})
      const execData=await execRes.json(); const results:RunResult[]=execData.results??[]
      setRunResults(results); setGameState(execData.allPass?'correct':'wrong'); simulateConsole(results,execData.allPass)
      const saveRes=await fetch(`/api/tasks/${activeTask.id}`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({code,allPass:execData.allPass})})
      const saveData=await saveRes.json()
      const xpEarned = saveData.alreadyPassed ? 0 : (saveData.xpEarned??0)
      setPassed(p=>({...p,[activeTask.id]:execData.allPass}))
      setXpMap(x=>({...x,[activeTask.id]:xpEarned}))
      setTasks(ts=>ts.map(t=>t.id===activeTask.id?{...t,submitted:{id:'_',status:execData.allPass?'PASSED':'FAILED',xpEarned}}:t))
      if (execData.allPass) {
        onCorrectAnswer(xpEarned); await refreshUser()
        const updatedPassed = {...passed, [activeTask.id]: true}
        const allNowPassed = tasks.every(t => updatedPassed[t.id] === true || t.id === activeTask.id)
        if (allNowPassed) await completeLessonAndFindNext()
      } else {
        setWrongCount(w=>w+1); onWrongAnswer()
        setSubmitCount(sc=>{const tid=activeTask.id,nc=(sc[tid]??0)+1;return{...sc,[tid]:nc}})
      }
    } catch(e:unknown){alert((e as Error).message)}
    finally{setSubmitting(false)}
  }

  const handleComplete = async () => {
    setCompleting(true)
    try { await completeLessonAndFindNext() }
    catch(e:unknown){alert((e as Error).message)}
    finally{setCompleting(false)}
  }

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div
      style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.95)',
        display:'flex',alignItems:'center',justifyContent:'center',
        backdropFilter:'blur(12px)',padding:8,
        animation:glitching?'tm-glitch .68s ease':'none'}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <style>{kf}</style>

      <div style={{width:'100%',height:'100%',maxWidth:1440,maxHeight:'96vh',
        background:'#04080f',border:'1px solid #0d1a28',
        display:'flex',flexDirection:'column',overflow:'hidden',
        boxShadow:'0 0 80px rgba(0,0,0,.9)',animation:'popIn .18s ease',position:'relative'}}>

        {/* top glow */}
        <div style={{position:'absolute',top:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#00e5ff33,transparent)',zIndex:10,pointerEvents:'none'}}/>
        {/* scan line */}
        <div style={{position:'absolute',left:0,right:0,height:60,pointerEvents:'none',zIndex:1,background:'linear-gradient(180deg,transparent,rgba(0,229,255,.008),transparent)',animation:'tm-scan 9s linear infinite'}}/>

        {/* CRITICAL HIT popup */}
        {critHit && (
          <div style={{position:'absolute',top:'18%',left:'50%',transform:'translateX(-50%)',zIndex:60,pointerEvents:'none',textAlign:'center',animation:'tm-critical 1.5s ease forwards'}}>
            <div style={{...fp,fontSize:9,color:'#ff6b35',textShadow:'0 0 24px #ff6b35',letterSpacing:2}}>CRITICAL HIT!</div>
            <div style={{...fp,fontSize:8,color:'#ffd700',marginTop:6}}>+{critXP} BONUS XP</div>
          </div>
        )}

        {/* ══ HP DEAD SCREEN ══ */}
        {hpDead && (
          <div style={{position:'absolute',inset:0,zIndex:90,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(8,0,4,.96)',animation:'tm-dead 3s ease forwards',pointerEvents:'all'}}>
            <div style={{fontSize:64,marginBottom:14,filter:'drop-shadow(0 0 32px #ff2d55)',animation:'tm-deadpulse .7s ease infinite'}}>💀</div>
            <div style={{...fp,fontSize:14,color:'#ff2d55',letterSpacing:5,textShadow:'0 0 36px #ff2d55,0 0 60px #ff005540',marginBottom:12,animation:'tm-deadpulse .5s ease infinite'}}>HP ДУУССАН!</div>
            <div style={{...fp,fontSize:7,color:'#ff6b35',letterSpacing:3,marginBottom:24}}>3 УДАА БУРУУ ХАРИУЛТ</div>
            <div style={{display:'flex',gap:10,marginBottom:24}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{width:22,height:22,background:'#1a0810',border:'1px solid #ff2d5533',boxShadow:'inset 0 0 10px #ff2d5522'}}/>
              ))}
            </div>
            <div style={{...fp,fontSize:7,color:'#ffe600',letterSpacing:2,marginBottom:16,animation:'tm-pulse .9s ease infinite'}}>
              {isMn?'← ХИЧЭЭЛ РҮҮ БУЦАЖ БАЙНА...':'← RETURNING TO LESSONS...'}
            </div>
            <div style={{width:200,height:4,background:'#200010',overflow:'hidden',borderRadius:2}}>
              <div style={{height:'100%',background:'linear-gradient(90deg,#ff2d55,#ff6b35)',animation:'tm-countdown 3s linear forwards'}}/>
            </div>
          </div>
        )}

        {/* ══ HUD HEADER ══ */}
        <div style={{display:'flex',alignItems:'stretch',borderBottom:'2px solid #0d1a28',background:'#010508',flexShrink:0,position:'relative',zIndex:5}}>

          {/* mission title */}
          <div style={{padding:'10px 20px',borderRight:'1px solid #0d1a28',display:'flex',flexDirection:'column',justifyContent:'center',gap:5,flexShrink:0,maxWidth:260}}>
            <div style={{...fp,fontSize:9,color:'#1a3050',letterSpacing:3}}>{tx.mission}</div>
            <div style={{...fp,fontSize:7,color:'#00e5ff',letterSpacing:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{lesson?.title||'...'}</div>
          </div>

          {/* task dots */}
          <div style={{padding:'10px 16px',borderRight:'1px solid #0d1a28',display:'flex',flexDirection:'column',justifyContent:'center',gap:5}}>
            <div style={{...fp,fontSize:9,color:'#1a3050',letterSpacing:2}}>{passedCount}/{tasks.length}</div>
            <div style={{display:'flex',gap:4,alignItems:'center'}}>
              {tasks.map((tk,i)=>{
                const isP=passed[tk.id]===true,isF=passed[tk.id]===false,isA=tk.id===activeId
                return <div key={i} onClick={()=>doActivate(tasks[i])} style={{width:isA?14:8,height:8,cursor:'pointer',background:isP?'#00ff41':isF?'#ff0040':isA?'#ffe600':'#1a2840',boxShadow:isA?'0 0 8px #ffe60088':'none',transition:'all .2s'}}/>
              })}
            </div>
          </div>

          {/* COMBO */}
          <div style={{padding:'10px 18px',borderRight:'1px solid #0d1a28',display:'flex',flexDirection:'column',justifyContent:'center',gap:4,minWidth:80}}>
            <div style={{...fp,fontSize:9,color:'#2a3a54',letterSpacing:2}}>COMBO</div>
            <div style={{...fp,fontSize:9,color:comboColor,textShadow:combo>0?`0 0 12px ${comboColor}66`:'none',animation:combo>0?'tm-combo .4s ease':'none'}}>
              {combo>0?`×${combo}`:'×–'}
            </div>
          </div>

          {/* HP */}
          <div style={{padding:'10px 16px',borderRight:'1px solid #0d1a28',display:'flex',flexDirection:'column',justifyContent:'center',gap:5}}>
            <div style={{...fp,fontSize:9,color:hp===0?'#ff2d55':'#2a3a54',letterSpacing:2,transition:'color .3s'}}>HP</div>
            <div style={{display:'flex',gap:5}}>
              {[0,1,2].map(i=>(
                <div key={i} style={{
                  width:16,height:16,
                  background:i<hp?'#ff2d55':'#1a0810',
                  border:`1px solid ${i<hp?'#ff2d5566':'#ff2d5511'}`,
                  boxShadow:i<hp?'0 0 10px rgba(255,45,85,.6)':'inset 0 0 6px rgba(255,45,85,.15)',
                  transition:'all .35s',
                  animation:hp===1&&i===0?'tm-deadpulse .5s ease infinite':'none',
                }}/>
              ))}
            </div>
          </div>

          {/* STREAK */}
          <div style={{padding:'10px 14px',borderRight:'1px solid #0d1a28',display:'flex',flexDirection:'column',justifyContent:'center',gap:4,minWidth:70}}>
            <div style={{...fp,fontSize:9,color:'#2a3a54',letterSpacing:2}}>STREAK</div>
            <div style={{...fp,fontSize:7,color:streak>=5?'#ff6b35':streak>=3?'#ffd700':'#ffe600'}}>{streak}</div>
          </div>

          {/* XP */}
          <div style={{padding:'10px 14px',borderRight:'1px solid #0d1a28',display:'flex',flexDirection:'column',justifyContent:'center',gap:4,minWidth:70}}>
            <div style={{...fp,fontSize:9,color:'#2a3a54',letterSpacing:2}}>XP</div>
            <div style={{...fp,fontSize:7,color:'#00ff41'}}>+{totalXP}</div>
          </div>

          {/* WPM (code only) */}
          {isCode && (
            <div style={{padding:'10px 14px',borderRight:'1px solid #0d1a28',display:'flex',flexDirection:'column',justifyContent:'center',gap:4,minWidth:60}}>
              <div style={{...fp,fontSize:9,color:'#2a3a54',letterSpacing:2}}>WPM</div>
              <div style={{...fp,fontSize:7,color:wpm>60?'#00ff41':wpm>30?'#ffd700':'#5a8aaa'}}>{wpm||'–'}</div>
            </div>
          )}

          <div style={{flex:1}}/>

          {/* CHANGE TASK */}
          {!activeDone && !lessonDone && (
            <div style={{padding:'6px 12px',borderLeft:'1px solid #0d1a28',display:'flex',alignItems:'center'}}>
              <button onClick={handleChangeTask}
                title={isMn?'Өөр даалгавар харах':'Change task'}
                style={{...fp,fontSize:6,padding:'5px 10px',cursor:'pointer',background:'rgba(0,229,255,.06)',border:'1px solid #00e5ff33',color:'#00e5ff',letterSpacing:1,transition:'all .15s'}}
                onMouseEnter={e=>(e.currentTarget.style.background='rgba(0,229,255,.14)')}
                onMouseLeave={e=>(e.currentTarget.style.background='rgba(0,229,255,.06)')}>
                🔄 {isMn?'ӨӨР TASK':'CHANGE'}
              </button>
            </div>
          )}

          {/* ACCURACY */}
          <div style={{padding:'10px 14px',borderLeft:'1px solid #0d1a28',display:'flex',flexDirection:'column',justifyContent:'center',gap:4,minWidth:70}}>
            <div style={{...fp,fontSize:9,color:'#2a3a54',letterSpacing:2}}>ACC%</div>
            <div style={{...fp,fontSize:7,color:accuracy===100?'#00ff41':accuracy>=80?'#ffd700':'#ff0040'}}>{accuracy}%</div>
          </div>

          {allPassed&&!lessonDone&&(
            <button disabled={completing} onClick={handleComplete}
              style={{padding:'0 16px',background:'rgba(0,255,65,.06)',border:'none',borderLeft:'2px solid #00ff4133',cursor:'pointer',flexShrink:0}}>
              <div style={{...fp,fontSize:7,color:'#00ff41',letterSpacing:2}}>{completing?'...':tx.finish2}</div>
            </button>
          )}
          {lessonDone&&(
            <div style={{padding:'0 14px',borderLeft:'1px solid #0d1a28',display:'flex',alignItems:'center'}}>
              <span style={{...fp,fontSize:7,color:'#00ff41',padding:'3px 8px',border:'1px solid #00ff4133'}}>✓ DONE</span>
            </div>
          )}

          {/* Language switcher */}
          <div style={{display:'flex',alignItems:'center',gap:3,padding:'0 8px',borderLeft:'1px solid #0d1a28',flexShrink:0}}>
            {(['mn','en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)} title={l==='mn'?'Монгол':'English'} style={{
                display:'flex', alignItems:'center', justifyContent:'center', gap:4,
                padding:'5px 7px', border:`1px solid ${lang===l?'rgba(0,229,255,.45)':'rgba(255,255,255,.07)'}`,
                background: lang===l ? 'rgba(0,229,255,.12)' : 'transparent',
                cursor:'pointer', transition:'all .18s', borderRadius:1,
              }}>
                <svg width="16" height="10" viewBox="0 0 30 18" style={{imageRendering:'pixelated',display:'block',flexShrink:0}}>
                  {l==='mn'?(
                    <><rect x="0" y="0" width="10" height="18" fill="#C4272F"/><rect x="10" y="0" width="10" height="18" fill="#015197"/><rect x="20" y="0" width="10" height="18" fill="#C4272F"/><rect x="3" y="1" width="4" height="1" fill="#F9CF02"/><rect x="2" y="2" width="6" height="3" fill="#F9CF02"/><rect x="1" y="6" width="8" height="1" fill="#F9CF02"/><rect x="1" y="8" width="8" height="1" fill="#F9CF02"/><rect x="3" y="9" width="4" height="3" fill="#F9CF02"/><rect x="1" y="13" width="8" height="1" fill="#F9CF02"/><rect x="1" y="15" width="8" height="2" fill="#F9CF02"/></>
                  ):(
                    <><rect x="0" y="0" width="30" height="18" fill="#B22234"/><rect x="0" y="2" width="30" height="2" fill="#fff"/><rect x="0" y="6" width="30" height="2" fill="#fff"/><rect x="0" y="10" width="30" height="2" fill="#fff"/><rect x="0" y="14" width="30" height="2" fill="#fff"/><rect x="0" y="0" width="12" height="10" fill="#3C3B6E"/><rect x="1" y="1" width="2" height="1" fill="#fff"/><rect x="5" y="1" width="2" height="1" fill="#fff"/><rect x="9" y="1" width="2" height="1" fill="#fff"/><rect x="3" y="4" width="2" height="1" fill="#fff"/><rect x="7" y="4" width="2" height="1" fill="#fff"/></>
                  )}
                </svg>
                <span style={{...fp, fontSize:7, color: lang===l ? '#00e5ff' : '#3a5070', letterSpacing:1}}>
                  {l==='mn' ? 'МОН' : 'ENG'}
                </span>
              </button>
            ))}
          </div>

          <button onClick={onClose}
            style={{width:48,background:'transparent',border:'none',borderLeft:'1px solid #0d1a28',color:'#2a4060',cursor:'pointer',fontSize:16,flexShrink:0,transition:'all .15s'}}
            onMouseEnter={e=>{(e.currentTarget as HTMLButtonElement).style.background='rgba(255,0,64,.08)';(e.currentTarget as HTMLButtonElement).style.color='#ff2d55'}}
            onMouseLeave={e=>{(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.color='#2a4060'}}>
            ✕
          </button>
        </div>

        {/* progress bar */}
        <div style={{height:4,background:'#060e1a',flexShrink:0,position:'relative',zIndex:5}}>
          <div style={{height:'100%',background:`linear-gradient(90deg,${combo>=3?'#ff9900':'#ffe600'},#00ff41)`,width:`${tasks.length>0?passedCount/tasks.length*100:0}%`,transition:'width .6s ease',position:'relative'}}>
            <div style={{position:'absolute',right:0,top:0,bottom:0,width:4,background:'rgba(255,255,255,.4)',boxShadow:'0 0 8px rgba(255,255,255,.3)'}}/>
          </div>
        </div>

        {/* ══ MAIN CONTENT ══ */}
        {fetching?(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16}}>
            <div style={{...fp,fontSize:8,color:'#00e5ff',letterSpacing:3,animation:'tm-pulse 1s ease infinite'}}>LOADING...</div>
            <div style={{display:'flex',gap:6}}>
              {[0,1,2,3,4].map(i=><div key={i} style={{width:8,height:8,background:'#0d2040',animation:`tm-pulse .8s ease ${i*.12}s infinite`}}/>)}
            </div>
          </div>
        ):(
          <div style={{flex:1,display:'flex',overflow:'hidden',position:'relative'}}>

            {isCode ? (
              /* ══ CODE LAYOUT ══ */
              <>
                {/* LEFT: brief */}
                <div style={{flex:'0 0 26%',display:'flex',flexDirection:'column',overflow:'hidden',borderRight:'2px solid #0d1a28',background:'#020609'}}>
                  <div style={{padding:'8px 14px',background:'#010508',borderBottom:'1px solid #0d1a28',flexShrink:0,display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:3,height:14,background:'#00e5ff',boxShadow:'0 0 6px #00e5ff'}}/>
                    <span style={{...fp,fontSize:8,color:'#2a4a6a',letterSpacing:3}}>{tx.missionBrief}</span>
                    {activeDone&&<span style={{...fp,fontSize:9,color:'#00ff41',border:'1px solid #00ff4133',padding:'2px 6px',marginLeft:'auto'}}>{tx.passed}</span>}
                  </div>
                  <div style={{flex:1,overflowY:'auto',padding:'12px'}}>
                    {activeTask&&<>
                      <div style={{...fp,fontSize:8,color:'#ffe600',marginBottom:10,lineHeight:1.6}}>{activeIdx+1}/{tasks.length} — {activeTitle}</div>
                      <div style={{...fm,fontSize:11,color:'#7a8aba',lineHeight:2,marginBottom:12,background:'#010508',border:'1px solid #0d1a28',padding:'10px 12px',borderLeft:'3px solid #00e5ff22',whiteSpace:'pre-wrap'}}>
                        {(activeDesc||activeTask.description).replace(/^function solution\([^)]*\) нь /,'')}
                      </div>
                      {tcs.length>0&&(
                        <div>
                          <div style={{...fp,fontSize:9,color:'#2a4a6a',letterSpacing:2,marginBottom:8}}>{tx.testCases}</div>
                          {tcs.slice(0,4).map((tc,i)=>{
                            const fv=(v:unknown):string=>{if(v===null||v===undefined)return '–';if(typeof v==='string')return v;if(Array.isArray(v))return v.map(fv).join(', ');return JSON.stringify(v)}
                            const res=runResults?.[i]
                            return(
                              <div key={i} style={{marginBottom:8,padding:'8px 10px',background:'#010407',border:`1px solid ${res?(res.passed?'#00ff4133':'#ff004033'):'#0d1a28'}`,borderLeft:`3px solid ${res?(res.passed?'#00ff41':'#ff0040'):'#1a3a5a'}`}}>
                                <div style={{...fp,fontSize:8,color:'#2a4a6a',marginBottom:6,letterSpacing:2}}>#{i+1} — {tc.label||'TEST'}</div>
                                {tc.input!==undefined&&tc.input!==''&&tc.input!==null&&(
                                  <div style={{...fm,fontSize:9,color:'#5a8aba',marginBottom:6,wordBreak:'break-all'}}>input: {fv(tc.input)}</div>
                                )}
                                {/* Prominent expected output */}
                                <div style={{background:'rgba(0,255,65,.06)',border:'1px solid #00ff4133',padding:'6px 8px',borderRadius:0}}>
                                  <div style={{...fp,fontSize:7,color:'#00ff4188',marginBottom:3,letterSpacing:2}}>{tx.expected}</div>
                                  <div style={{...fm,fontSize:11,color:'#00ff41',fontWeight:'bold',wordBreak:'break-all'}}>{fv(tc.expected)}</div>
                                  {i===0&&!res&&(
                                    <div style={{...fp,fontSize:6,color:'#00ff4155',marginTop:4,letterSpacing:1}}>{tx.targetOutput} {fv(tc.expected)}</div>
                                  )}
                                </div>
                                {res&&!res.passed&&<div style={{...fp,fontSize:6,color:'#ff0040',marginTop:4}}>got: {JSON.stringify(res.actual)?.slice(0,30)}</div>}
                              </div>
                            )
                          })}
                          {!activeDone&&tcs.length>0&&(
                            <div style={{...fp,fontSize:8,color:'#1a4a6a',letterSpacing:1,marginTop:8,textAlign:'center'}}>{tx.enterBelow}</div>
                          )}
                        </div>
                      )}
                    </>}
                  </div>
                </div>

                {/* CENTER: editor + console */}
                <div style={{flex:'0 0 44%',display:'flex',flexDirection:'column',overflow:'hidden',borderRight:'2px solid #0d1a28'}}>
                  <div style={{padding:'8px 14px',background:'#010508',borderBottom:'1px solid #0d1a28',flexShrink:0,display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:3,height:14,background:'#3a6080',boxShadow:'0 0 6px #3a608055'}}/>
                    <span style={{...fp,fontSize:8,color:'#3a5a7a',letterSpacing:3}}>{tx.codeEditor}</span>
                    <div style={{marginLeft:'auto',display:'flex',gap:10,alignItems:'center'}}>
                      {wpm>0&&<span style={{...fp,fontSize:9,color:'#2a4060'}}>WPM {wpm}</span>}
                      {code.trim()&&<span style={{...fp,fontSize:9,color:'#2a4060'}}>{code.split('\n').length}L</span>}
                    </div>
                  </div>
                  <div style={{flex:1,overflow:'hidden',minHeight:0}}>
                    <MonacoEditor height="100%" language={codeLanguage} theme="vs-dark" value={code}
                      onChange={v=>{setCode(v??'');if(!codeStart)setCodeStart(Date.now());setKeyCount(k=>k+1)}}
                      options={{fontSize:14,minimap:{enabled:false},scrollBeyondLastLine:false,readOnly:activeDone,fontFamily:"'Share Tech Mono','Courier New',monospace",lineNumbers:'on',tabSize:2,wordWrap:'on',quickSuggestions:true,cursorStyle:'block',cursorBlinking:'phase'}}/>
                  </div>
                  {/* buttons */}
                  <div style={{display:'flex',gap:8,padding:'8px 12px',background:'#010508',borderTop:'1px solid #0d1a28',flexShrink:0}}>
                    <button disabled={running||activeDone} onClick={handleRun}
                      style={{...fp,fontSize:8,padding:'8px 16px',cursor:'pointer',border:'1px solid #00e5ff44',background:'rgba(0,229,255,.06)',color:'#00e5ff',transition:'all .15s'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(0,229,255,.14)'}
                      onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(0,229,255,.06)'}>
                      {running?'...':tx.run}
                    </button>
                    <button disabled={submitting||activeDone} onClick={handleSubmitCode}
                      style={{...fp,fontSize:8,padding:'8px 16px',cursor:activeDone?'default':'pointer',border:`2px solid ${activeDone?'#00ff4133':runResults&&!runResults.every(r=>r.passed)?'#ff6680':'#00ff41'}`,background:runResults&&!activeDone&&!runResults.every(r=>r.passed)?'rgba(255,0,64,.08)':'rgba(0,255,65,.08)',color:activeDone?'#00ff41':runResults&&!runResults.every(r=>r.passed)?'#ff6680':'#00ff41',transition:'all .15s'}}
                      onMouseEnter={e=>!activeDone&&((e.currentTarget as HTMLButtonElement).style.opacity='0.8')}
                      onMouseLeave={e=>!activeDone&&((e.currentTarget as HTMLButtonElement).style.opacity='1')}>
                      {submitting?'...':activeDone?tx.done:runResults&&!runResults.every(r=>r.passed)?tx.retry:tx.submit}
                    </button>
                    {activeDone&&(
                      <button onClick={()=>{const n=tasks[activeIdx+1] as ExtTask|undefined;if(n)doActivate(n);else handleComplete()}}
                        style={{...fp,fontSize:8,padding:'8px 14px',cursor:'pointer',border:'1px solid #ffe60033',background:'rgba(255,230,0,.06)',color:'#ffe600',marginLeft:'auto'}}>
                        {tx.next}
                      </button>
                    )}
                    <button onClick={()=>setShowConsole(v=>!v)}
                      style={{...fp,fontSize:7,padding:'6px 10px',cursor:'pointer',border:`1px solid ${showConsole?'#ffe60033':'#0d1a28'}`,background:'transparent',color:showConsole?'#ffe600':'#2a4060',marginLeft:activeDone?0:'auto'}}>
                      TERM
                    </button>
                  </div>
                  <HintSystem description={activeDesc||activeTask?.description||''} tcs={tcs} disabled={activeDone}/>
                  {/* terminal */}
                  {showConsole&&(
                    <div ref={consoleRef} style={{maxHeight:150,overflowY:'auto',background:'#010407',borderTop:'1px solid #0d1a28',padding:'8px 12px',flexShrink:0}}>
                      <div style={{...fp,fontSize:9,color:'#2a4a6a',letterSpacing:2,marginBottom:6}}>{tx.termOutput}</div>
                      {consoleLogs.map((line,i)=>(
                        <div key={i} style={{...fm,fontSize:10,color:line.col,marginBottom:3,animation:'tm-log .18s ease',letterSpacing:.5}}>{line.text}</div>
                      ))}
                      {(running||submitting)&&consoleLogs.length>0&&(
                        <div style={{...fp,fontSize:8,color:'#ffe600',animation:'tm-pulse .5s ease infinite'}}>_</div>
                      )}
                    </div>
                  )}
                </div>

                {/* RIGHT: game */}
                <div style={{flex:1,overflow:'hidden',background:'#020609'}}>
                  <GameTaskCanvas state={gameState} lessonTitle={lesson?.title||''} passedCount={passedCount} totalTasks={tasks.length} taskTitle={activeTask?.title||''}/>
                </div>
              </>
            ) : (
              /* ══ QUIZ LAYOUT ══ */
              <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden'}}>

                {/* game top */}
                <div style={{flex:'0 0 45%',overflow:'hidden',borderBottom:'2px solid #0d1a28',position:'relative'}}>
                  <GameTaskCanvas state={gameState} lessonTitle={lesson?.title||''} passedCount={passedCount} totalTasks={tasks.length} taskTitle={activeTask?.title||''}/>
                  {gameState==='correct'&&qPassed&&(
                    <div style={{position:'absolute',top:12,right:12,...fp,fontSize:9,color:'#00ff41',background:'rgba(0,255,65,.1)',border:'1px solid #00ff4133',padding:'6px 14px',animation:'tm-in .2s ease'}}>
                      ✓ +{qXp} XP
                    </div>
                  )}
                  {gameState==='wrong'&&qPassed===false&&(
                    <div style={{position:'absolute',top:12,right:12,...fp,fontSize:9,color:'#ff0040',background:'rgba(255,0,64,.1)',border:'1px solid #ff004033',padding:'6px 14px',animation:'tm-shake .4s ease'}}>
                      COMBO BREAK
                    </div>
                  )}
                </div>

                {/* bottom */}
                <div style={{flex:1,display:'flex',overflow:'hidden',animation:glitching?'tm-shake .45s ease':'none'}}>

                  {/* guide */}
                  <div style={{width:showGuide?240:0,flexShrink:0,borderRight:showGuide?'1px solid #0d1a28':'none',overflowX:'hidden',overflowY:'auto',background:'#020609',transition:'width .3s ease'}}>
                    {showGuide&&<GuidePanel gameType={gt3} passedCount={passedCount} tasks={tasks} totalXP={totalXP}/>}
                  </div>
                  <button onClick={()=>setShowGuide(v=>!v)}
                    style={{flexShrink:0,width:18,alignSelf:'stretch',background:'#0a1020',border:'none',borderRight:'1px solid #1a2840',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:8,color:showGuide?'#00e5ff':'#2a4060'}}>
                    {showGuide?'◀':'▶'}
                  </button>

                  {/* quiz content */}
                  <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',background:'#030810',position:'relative',animation:qPassed===true?'tm-correct .6s ease':qPassed===false?'tm-wrong .6s ease':'none'}}>
                    <div style={{flex:1,overflowY:'auto',padding:'16px'}}>
                      {activeTask&&<>
                        {/* task header */}
                        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12,animation:'tm-in .25s ease'}}>
                          <div style={{width:32,height:32,flexShrink:0,background:'rgba(0,229,255,.06)',border:'1px solid #00e5ff22',display:'flex',alignItems:'center',justifyContent:'center'}}>
                            <PixelIcon name="star" size={18} col="#00e5ff"/>
                          </div>
                          <div style={{flex:1}}>
                            <div style={{...fp,fontSize:9,color:'#ffe600',letterSpacing:1,marginBottom:4}}>{activeIdx+1}/{tasks.length} — {activeTitle}</div>
                            <div style={{display:'flex',gap:6}}>
                              <span style={{...fp,fontSize:9,color:'#00e5ff',border:'1px solid #00e5ff22',padding:'2px 6px'}}>QUIZ</span>
                              <span style={{...fp,fontSize:9,color:'#00ff41',border:'1px solid #00ff4122',padding:'2px 6px'}}>+{activeTask.xpReward} XP</span>
                            </div>
                          </div>
                          {activeDone&&<div style={{...fp,fontSize:8,color:'#00ff41',border:'1px solid #00ff4133',padding:'4px 8px'}}>✓</div>}
                        </div>

                        {/* description */}
                        <div style={{...fm,fontSize:9,color:'#8090b0',lineHeight:2,marginBottom:14,background:'#020609',border:'1px solid #0d1a28',padding:'12px 14px',borderLeft:'3px solid #00e5ff22',animation:'tm-in .3s ease .05s both'}}>
                          {(activeDesc||activeTask.description).replace(/^function solution\([^)]*\) нь /,'')}
                        </div>

                        {/* options */}
                        {opts&&(
                          <div style={{display:'flex',flexDirection:'column',gap:8,animation:'tm-in .3s ease .1s both'}}>
                            {opts.map((opt,i)=>{
                              const answered=qPassed!==undefined
                              const isSelected=answered&&activeTask?.submitted?.selected===i
                              const isCorrectSel=answered&&qPassed&&isSelected
                              const isWrongSel=answered&&!qPassed&&isSelected
                              // show correct option in green when wrong answer submitted
                              const corrOrig = activeId ? correctIdx[activeId] : undefined
                              const corrDisp = corrOrig !== undefined
                                ? (shuffle ? shuffle.findIndex(si=>si===corrOrig) : corrOrig)
                                : undefined
                              const isCorrectOpt = !qPassed && answered && corrDisp !== undefined && i===corrDisp
                              return(
                                <button key={i} disabled={answered||submitting} onClick={()=>handleQuiz(i)}
                                  style={{display:'flex',alignItems:'center',gap:12,padding:'12px 16px',width:'100%',textAlign:'left',cursor:answered?'default':'pointer',
                                    border:`1px solid ${isCorrectSel||isCorrectOpt?'#00ff41':isWrongSel?'#ff0040':'#1a2840'}`,
                                    background:isCorrectSel||isCorrectOpt?'rgba(0,255,65,.10)':isWrongSel?'rgba(255,0,64,.08)':'transparent',
                                    transition:'all .15s',position:'relative',overflow:'hidden',
                                    animation:isWrongSel?'tm-shake .45s ease':isCorrectSel?'tm-in .2s ease':'none'}}
                                  onMouseEnter={e=>!answered&&((e.currentTarget as HTMLButtonElement).style.borderColor='rgba(0,229,255,.5)',(e.currentTarget as HTMLButtonElement).style.background='rgba(0,229,255,.04)')}
                                  onMouseLeave={e=>!answered&&((e.currentTarget as HTMLButtonElement).style.borderColor='#1a2840',(e.currentTarget as HTMLButtonElement).style.background='transparent')}>
                                  {/* letter badge */}
                                  <div style={{width:28,height:28,flexShrink:0,
                                    background:isCorrectSel||isCorrectOpt?'#00ff41':isWrongSel?'#ff0040':'#0d1830',
                                    border:`1px solid ${isCorrectSel||isCorrectOpt?'#00ff41':isWrongSel?'#ff0040':'#1a2840'}`,
                                    display:'flex',alignItems:'center',justifyContent:'center',
                                    ...fp,fontSize:7,color:isCorrectSel||isCorrectOpt?'#020609':isWrongSel?'#fff':'#4a6a8a',transition:'all .15s'}}>
                                    {isCorrectSel||isCorrectOpt?'✓':isWrongSel?'✗':String.fromCharCode(65+i)}
                                  </div>
                                  <span style={{...fm,fontSize:9,lineHeight:1.5,color:isCorrectSel||isCorrectOpt?'#00ff41':isWrongSel?'#ff6680':answered?'#3a5070':'#c0d0e0'}}>{opt}</span>
                                  {isCorrectOpt&&<span style={{...fp,fontSize:9,color:'#00ff41',marginLeft:'auto',border:'1px solid #00ff4133',padding:'2px 6px'}}>{tx.correctWas}</span>}
                                  {!answered&&<div style={{marginLeft:'auto',...fp,fontSize:9,color:'#1a2840'}}>›</div>}
                                </button>
                              )
                            })}

                            {/* feedback */}
                            {qPassed!==undefined&&(
                              <div style={{marginTop:8,display:'flex',flexDirection:'column',gap:8,animation:'tm-in .25s ease'}}>
                                <div style={{padding:'10px 14px',display:'flex',alignItems:'center',gap:12,border:`1px solid ${qPassed?'#00ff4133':'#ff004033'}`,background:`rgba(${qPassed?'0,255,65':'255,0,64'},.06)`}}>
                                  <div style={{width:26,height:26,flexShrink:0,background:qPassed?'#00ff41':'#ff0040',display:'flex',alignItems:'center',justifyContent:'center',...fp,fontSize:7,color:'#020609'}}>
                                    {qPassed?'✓':'✗'}
                                  </div>
                                  <div>
                                    <div style={{...fp,fontSize:9,color:qPassed?'#00ff41':'#ff0040',letterSpacing:1}}>
                                      {qPassed ? tx.correct : tx.wrong}
                                    </div>
                                    <div style={{...fp,fontSize:7,color:qPassed?'#00ff4166':'#ff004055',marginTop:3}}>
                                      {qPassed?`+${qXp} XP${combo>=3?` · COMBO ×${combo}`:''}`:tx.comboBrk}
                                    </div>
                                  </div>
                                </div>
                                {qPassed===false&&(
                                  <div style={{display:'flex',gap:8}}>
                                    <button onClick={handleRetryTask}
                                      style={{flex:1,...fp,fontSize:9,letterSpacing:1,padding:'11px',cursor:'pointer',border:'2px solid #ff6680',background:'rgba(255,0,64,.08)',color:'#ff6680'}}>
                                      {tx.retry}
                                    </button>
                                    {activeIdx<tasks.length-1&&(
                                      <button onClick={goNext}
                                        style={{flex:1,...fp,fontSize:9,letterSpacing:1,padding:'11px',cursor:'pointer',border:'1px solid #ff004433',background:'rgba(255,0,64,.04)',color:'#ff6680aa'}}>
                                        {tx.skip}
                                      </button>
                                    )}
                                  </div>
                                )}
                                {qPassed===true&&activeIdx<tasks.length-1&&(
                                  <button onClick={goNext}
                                    style={{width:'100%',...fp,fontSize:9,letterSpacing:1,padding:'12px',cursor:'pointer',border:'2px solid #00ff41',background:'rgba(0,255,65,.08)',color:'#00ff41'}}>
                                    {tx.nextMission}
                                  </button>
                                )}
                                {activeIdx===tasks.length-1&&qPassed===true&&!lessonDone&&(
                                  <button disabled={completing} onClick={handleComplete}
                                    style={{width:'100%',...fp,fontSize:7,letterSpacing:1,padding:'14px',cursor:'pointer',border:'2px solid #ffe600',background:'rgba(255,230,0,.1)',color:'#ffe600',boxShadow:'0 0 20px rgba(255,230,0,.15)'}}>
                                    {completing?'...':tx.completeMission}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </>}
                    </div>

                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── COMPLETION POPUP (top-level, covers full modal) ── */}
        {lessonDone&&(
          <div style={{position:'absolute',inset:0,zIndex:50,background:'rgba(0,0,0,.75)',backdropFilter:'blur(10px)',display:'flex',alignItems:'center',justifyContent:'center',animation:'tm-in .2s ease'}}>
            <div style={{background:'#04080f',border:'2px solid #ffd70044',boxShadow:'0 0 80px rgba(255,215,0,.12),0 0 0 1px #0d1a28',padding:'44px 48px',display:'flex',flexDirection:'column',alignItems:'center',gap:10,minWidth:340,position:'relative',animation:'popIn .22s ease'}}>
              {/* accent lines */}
              <div style={{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,#ffd700,transparent)'}}/>
              <div style={{position:'absolute',bottom:0,left:0,right:0,height:1,background:'linear-gradient(90deg,transparent,#ffd70033,transparent)'}}/>

              <div style={{animation:'tm-rank .5s ease'}}><PixelIcon name="crown" size={56} col="#ffd700"/></div>
              <div style={{...fp,fontSize:9,color:'#ffd700',letterSpacing:4,marginTop:4,animation:'tm-rank .5s ease .08s both'}}>{tx.missionComplete}</div>

              {/* score row */}
              <div style={{display:'flex',gap:24,marginTop:8,animation:'tm-xp .4s ease .15s both'}}>
                <div style={{textAlign:'center'}}>
                  <div style={{...fp,fontSize:9,color:'#2a4060',letterSpacing:2,marginBottom:4}}>SCORE</div>
                  <div style={{...fp,fontSize:14,color:'#00ff41'}}>{passedCount}/{tasks.length}</div>
                </div>
                <div style={{width:1,background:'#0d1a28'}}/>
                <div style={{textAlign:'center'}}>
                  <div style={{...fp,fontSize:9,color:'#2a4060',letterSpacing:2,marginBottom:4}}>XP</div>
                  <div style={{...fp,fontSize:14,color:'#ffd700'}}>+{totalXP}</div>
                </div>
                <div style={{width:1,background:'#0d1a28'}}/>
                <div style={{textAlign:'center'}}>
                  <div style={{...fp,fontSize:9,color:'#2a4060',letterSpacing:2,marginBottom:4}}>ACC</div>
                  <div style={{...fp,fontSize:14,color:accuracy===100?'#00ff41':accuracy>=80?'#ffd700':'#ff6680'}}>{accuracy}%</div>
                </div>
              </div>

              {maxCombo>1&&(
                <div style={{...fp,fontSize:8,color:comboColor,border:`1px solid ${comboColor}33`,padding:'4px 12px',animation:'tm-combo .3s ease .3s both'}}>
                  MAX COMBO ×{maxCombo}
                </div>
              )}

              {/* buttons */}
              <div style={{display:'flex',gap:12,marginTop:16,animation:'tm-in .35s ease .3s both'}}>
                <button onClick={handleRetry}
                  style={{...fp,fontSize:8,letterSpacing:1,padding:'13px 20px',cursor:'pointer',border:'1px solid #ffe60044',background:'rgba(255,230,0,.05)',color:'#ffe600',transition:'all .15s'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(255,230,0,.12)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(255,230,0,.05)'}>
                  {tx.retry}
                </button>
                {nextLessonId&&(
                  <button onClick={()=>onDone?.(nextLessonId??undefined)}
                    style={{...fp,fontSize:8,letterSpacing:1,padding:'13px 22px',cursor:'pointer',border:'2px solid #ffd700',background:'rgba(255,215,0,.08)',color:'#ffd700',boxShadow:'0 0 20px rgba(255,215,0,.1)',transition:'all .15s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(255,215,0,.18)'}
                    onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(255,215,0,.08)'}>
                    {tx.nextLesson}
                  </button>
                )}
                <button onClick={()=>onDone ? onDone(null) : onClose()}
                  style={{...fp,fontSize:8,letterSpacing:1,padding:'13px 22px',cursor:'pointer',border:`2px solid ${nextLessonId?'#00e5ff44':'#00e5ff'}`,background:'rgba(0,229,255,.07)',color:nextLessonId?'#00e5ff88':'#00e5ff',boxShadow:nextLessonId?'none':'0 0 20px rgba(0,229,255,.12)',transition:'all .15s'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(0,229,255,.15)'}
                  onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='rgba(0,229,255,.07)'}>
                  {nextLessonId ? tx.close : tx.finish}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}