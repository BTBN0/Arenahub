'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import { adminFetch } from '@/lib/admin-fetch'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

type Course  = { id:string; title:string; description:string; category:string; difficulty:string; isActive:boolean; xpReward:number; orderIndex:number; _count:{ lessons:number; enrollments:number } }
type Lesson  = { id:string; title:string; content:string; xpReward:number; orderIndex:number; _count:{ tasks:number } }
type Task    = { id:string; title:string; titleEn:string; description:string; descriptionEn:string; taskType:string; xpReward:number; options:unknown; answer:number|null; orderIndex:number; _count:{ submissions:number } }
type GameInfo= { id:string; name:string; slug:string; gameType:string; description:string|null; hpMax:number; xpReward:number; isActive:boolean; _count:{ gameTasks:number; lessonGames:number } }
type LessonGameEntry = { lessonGameId:string; orderIndex:number; game:GameInfo }

const DIFFICULTIES = ['BEGINNER','INTERMEDIATE','ADVANCED']

// 16 canvas-registered game types — source of truth
const GAME_META: Record<string,{icon:string;label:string;col:string}> = {
  evolution:          {icon:'🌱',label:'EVOLUTION',       col:'#00ff88'},
  jump:               {icon:'🏃',label:'JUMP QUEST',      col:'#00ff41'},
  enemy:              {icon:'👾',label:'ENEMY RAID',      col:'#ff3333'},
  city:               {icon:'🏙',label:'CITY BUILD',      col:'#ffe600'},
  island:             {icon:'🏝',label:'ISLAND',          col:'#00e5ff'},
  castle:             {icon:'🏰',label:'SERVER CASTLE',   col:'#aa44ff'},
  kingdom:            {icon:'👑',label:'DATA KINGDOM',    col:'#4488ff'},
  timemachine:        {icon:'⏱',label:'TIME MACHINE',    col:'#ffe600'},
  megacity:           {icon:'🌆',label:'MEGA CITY',       col:'#00ff41'},
  cssplatform:        {icon:'🎨',label:'CSS PLATFORM',    col:'#ff00dd'},
  codequestbattle:    {icon:'⚔',label:'CODE QUEST',      col:'#ff6b35'},
  autocoderunner:     {icon:'🤖',label:'AUTO RUNNER',     col:'#00e5ff'},
  onlinecodefactory:  {icon:'🏭',label:'ONLINE FACTORY',  col:'#ffe600'},
  taskbattlesurvival: {icon:'🛡',label:'BATTLE SURVIVAL', col:'#ff4444'},
  multiplayerarena:   {icon:'🏟',label:'MULTIPLAYER',     col:'#aa44ff'},
  codefactory:        {icon:'⚙',label:'CODE FACTORY',    col:'#aaaaff'},
}
const gm = (t:string) => GAME_META[t] ?? {icon:'🎮',label:t.toUpperCase(),col:'var(--dim2)'}

/* ── Small reusable components ─────────────── */
function Flash({ msg, col='var(--cyan)' }: { msg:string; col?:string }) {
  if (!msg) return null
  return <div style={{ padding:'9px 14px', background:`${col}11`, border:`1px solid ${col}33`, ...fp, fontSize:7, color:col, marginBottom:12 }}>{msg}</div>
}

function Btn({ label, col='var(--cyan)', onClick, size='sm', disabled=false }:
  { label:string; col?:string; onClick?:()=>void; size?:'sm'|'md'; disabled?:boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...fp, fontSize:6, letterSpacing:1, padding:size==='sm'?'5px 10px':'8px 18px', cursor:disabled?'not-allowed':'pointer', background:'transparent', color:disabled?'var(--dim)':col, border:`1px solid ${disabled?'var(--dim)':col+'55'}`, transition:'all .15s', opacity:disabled?0.45:1, whiteSpace:'nowrap' }}
      onMouseEnter={e=>{if(!disabled){(e.currentTarget as HTMLButtonElement).style.background=`${col}18`;(e.currentTarget as HTMLButtonElement).style.borderColor=col}}}
      onMouseLeave={e=>{if(!disabled){(e.currentTarget as HTMLButtonElement).style.background='transparent';(e.currentTarget as HTMLButtonElement).style.borderColor=`${col}55`}}}>
      {label}
    </button>
  )
}

function Field({ label, value, onChange, placeholder, type='text', options, rows=3 }:
  { label:string; value:string; onChange:(v:string)=>void; placeholder?:string; type?:string; options?:string[]; rows?:number }) {
  const base: React.CSSProperties = { width:'100%', padding:'8px 10px', background:'var(--bg)', border:'1px solid var(--dim)', color:'var(--text)', ...fm, fontSize:12, outline:'none', boxSizing:'border-box' }
  return (
    <div style={{ marginBottom:10 }}>
      <div style={{ ...fp, fontSize:5, color:'var(--dim2)', marginBottom:4 }}>{label}</div>
      {type==='select' ? (
        <select value={value} onChange={e=>onChange(e.target.value)} style={base}>
          {(options??[]).map(o=><option key={o} value={o}>{o}</option>)}
        </select>
      ) : type==='textarea' ? (
        <textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{ ...base, resize:'vertical' }}
          onFocus={e=>e.currentTarget.style.borderColor='var(--cyan)'} onBlur={e=>e.currentTarget.style.borderColor='var(--dim)'} />
      ) : (
        <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type} style={base}
          onFocus={e=>e.currentTarget.style.borderColor='var(--cyan)'} onBlur={e=>e.currentTarget.style.borderColor='var(--dim)'} />
      )}
    </div>
  )
}

/* ── Default forms ─────────────────────────── */
const emptyCourse  = (nextOrder = 0) => ({ title:'', description:'', category:'', difficulty:'BEGINNER', xpReward:'100', orderIndex: String(nextOrder) })
const emptyLesson  = () => ({ title:'', content:'', xpReward:'50', orderIndex:'0' })
const emptyTask    = () => ({ title:'', titleEn:'', description:'', descriptionEn:'', taskType:'quiz', xpReward:'20', orderIndex:'0', options:['','','',''], answer:'0', options2:['','','',''], answer2:'0', useVariant2:false, starterCode:'', testCases:'[]' })

/* ══ MAIN PAGE ════════════════════════════════ */
export default function AdminCoursesPage() {
  const [courses,     setCourses]    = useState<Course[]>([])
  const [loading,     setLoading]    = useState(true)
  const [flash,       setFlash]      = useState('')
  const [flashCol,    setFlashCol]   = useState('var(--cyan)')

  // Expanded course → lessons
  const [expanded,    setExpanded]   = useState<string|null>(null)
  const [lessons,     setLessons]    = useState<Record<string,Lesson[]>>({})
  const [loadingLes,  setLoadingLes] = useState(false)

  // Expanded lesson → tasks
  const [expandedLes, setExpandedLes]= useState<string|null>(null)
  const [tasks,       setTasks]      = useState<Record<string,Task[]>>({})
  const [loadingTasks,setLoadingTasks]=useState(false)

  // Course modal
  const [courseModal, setCourseModal]= useState<'none'|'create'|'edit'>('none')
  const [editCourse,  setEditCourse] = useState<Course|null>(null)
  const [courseForm,  setCourseForm] = useState(emptyCourse())
  const [savingC,     setSavingC]    = useState(false)

  // Lesson modal
  const [lessonModal, setLessonModal]= useState<'none'|'create'|'edit'>('none')
  const [editLesson,  setEditLesson] = useState<Lesson|null>(null)
  const [lessonForm,  setLessonForm] = useState(emptyLesson())
  const [lessonCourse,setLessonCourse]=useState<string>('')
  const [savingL,     setSavingL]    = useState(false)
  // game selection in lesson modal
  const [availGames,  setAvailGames]  = useState<GameInfo[]>([])
  const [gamesLoading,setGamesLoading]= useState(false)
  const [selectedGameId, setSelectedGameId] = useState<string>('')

  // Task modal
  const [taskModal,   setTaskModal]  = useState<'none'|'create'|'edit'>('none')
  const [editTask,    setEditTask]   = useState<Task|null>(null)
  const [taskForm,    setTaskForm]   = useState(emptyTask())
  const [taskLesson,  setTaskLesson] = useState<string>('')
  const [savingT,     setSavingT]    = useState(false)

  // Game management
  const [lessonGames,   setLessonGames]   = useState<Record<string, LessonGameEntry[]>>({})
  const [gameMgrLesson, setGameMgrLesson] = useState<{id:string;title:string}|null>(null)

  const notify = (msg:string, col='var(--cyan)') => { setFlash(msg); setFlashCol(col); setTimeout(()=>setFlash(''),3500) }

  const loadLessonGames = useCallback(async (lessonId:string) => {
    const r = await adminFetch(`/api/admin/lessons/${lessonId}/games`)
    const d = await r.json()
    setLessonGames(prev => ({...prev, [lessonId]: d.games ?? []}))
  }, [])

  const loadAvailGames = useCallback(async () => {
    if (availGames.length > 0) return
    setGamesLoading(true)
    try {
      const r = await adminFetch('/api/admin/games?active=true')
      const d = await r.json()
      setAvailGames(d.games ?? [])
    } finally { setGamesLoading(false) }
  }, [availGames.length])

  /* ── Load courses ── */
  const load = useCallback(async () => {
    setLoading(true)
    try {
      const d = await adminFetch('/api/courses?admin=true&limit=100').then(r=>r.json())
      setCourses(d.courses??[])
    } finally { setLoading(false) }
  }, [])
  useEffect(()=>{load()},[load])

  /* ── Load lessons for a course ── */
  // Force fetch — ignores cache
  const fetchLessons = async (courseId:string) => {
    const d = await adminFetch(`/api/lessons?courseId=${courseId}`).then(r=>r.json())
    setLessons(prev=>({...prev,[courseId]:d.lessons??[]}))
    return d.lessons??[]
  }
  const loadLessons = async (courseId:string) => {
    if (lessons[courseId]) return
    setLoadingLes(true)
    try { await fetchLessons(courseId) } finally { setLoadingLes(false) }
  }

  const toggleCourse = async (id:string) => {
    if (expanded===id) { setExpanded(null); setExpandedLes(null); return }
    setExpanded(id); setExpandedLes(null)
    await loadLessons(id)
  }

  // Force fetch — ignores cache
  const fetchTasks = async (lessonId:string) => {
    const d = await adminFetch(`/api/tasks?lessonId=${lessonId}`).then(r=>r.json())
    setTasks(prev=>({...prev,[lessonId]:d.tasks??[]}))
    return d.tasks??[]
  }
  const loadTasks = async (lessonId:string) => {
    if (tasks[lessonId]) return
    setLoadingTasks(true)
    try { await fetchTasks(lessonId) } finally { setLoadingTasks(false) }
  }

  const toggleLesson = async (id:string) => {
    if (expandedLes===id) { setExpandedLes(null); return }
    setExpandedLes(id)
    await loadTasks(id)
    loadLessonGames(id)
  }

  /* ── Course CRUD ── */
  const saveCourse = async () => {
    if (!courseForm.title||!courseForm.category) { notify('Title, category шаардлагатай','var(--red)'); return }
    setSavingC(true)
    const body = { ...courseForm, xpReward:parseInt(courseForm.xpReward)||100, orderIndex:parseInt((courseForm as any).orderIndex||'0') }
    try {
      const r = editCourse
        ? await adminFetch(`/api/courses/${editCourse.id}`, {method:'PUT',body:JSON.stringify(body)})
        : await adminFetch('/api/courses', {method:'POST',body:JSON.stringify(body)})
      if (r.ok) { notify(editCourse?'Шинэчлэгдлээ':'Үүсгэгдлээ'); setCourseModal('none'); load() }
      else { const d=await r.json(); notify(d.error??'Алдаа','var(--red)') }
    } finally { setSavingC(false) }
  }

  const deleteCourse = async (c:Course) => {
    if (!confirm(`"${c.title}" бүрэн устгах уу? Хичээл, даалгаврууд БҮГД устана.`)) return
    const r = await adminFetch(`/api/courses/${c.id}?hard=true`, {method:'DELETE'})
    if (r.ok) { notify('Устгагдлаа','var(--red)'); load() }
    else { const d=await r.json().catch(()=>({})); notify(d.error||`Алдаа (${r.status})`,'var(--red)') }
  }

  const togglePublish = async (c:Course) => {
    const r = await adminFetch(`/api/courses/${c.id}`, {method:'PUT',body:JSON.stringify({isActive:!c.isActive})})
    if (r.ok) { notify(c.isActive?'Draft болгосон':'Нийтлэгдлээ'); load() } else notify('Алдаа','var(--red)')
  }

  /* ── Lesson CRUD ── */
  const saveLesson = async () => {
    if (!lessonForm.title) { notify('Title шаардлагатай','var(--red)'); return }
    setSavingL(true)
    const body = { courseId:lessonCourse, ...lessonForm, xpReward:parseInt(lessonForm.xpReward)||50, orderIndex:parseInt(lessonForm.orderIndex)||0 }
    try {
      const r = editLesson
        ? await adminFetch(`/api/lessons/${editLesson.id}`, {method:'PUT',body:JSON.stringify(body)})
        : await adminFetch('/api/lessons', {method:'POST',body:JSON.stringify(body)})
      if (r.ok) {
        const ld = await r.json()
        const lessonId = editLesson ? editLesson.id : ld.lesson?.id
        // auto-attach selected game if new lesson + game chosen
        if (!editLesson && selectedGameId && lessonId) {
          await adminFetch(`/api/admin/lessons/${lessonId}/games`, {
            method: 'POST', body: JSON.stringify({ gameId: selectedGameId })
          })
          loadLessonGames(lessonId)
        }
        notify(editLesson?'Шинэчлэгдлээ':'Хичээл үүсгэгдлээ')
        setLessonModal('none')
        setSelectedGameId('')
        await fetchLessons(lessonCourse)
      } else { const d=await r.json(); notify(d.error??'Алдаа','var(--red)') }
    } finally { setSavingL(false) }
  }

  const deleteLesson = async (courseId:string, l:Lesson) => {
    if (!confirm(`"${l.title}" устгах уу?`)) return
    // Optimistic: instantly remove from UI
    setLessons(prev=>({...prev,[courseId]:(prev[courseId]??[]).filter(x=>x.id!==l.id)}))
    const r = await adminFetch(`/api/lessons/${l.id}`, {method:'DELETE'})
    if (r.ok) { notify('Устгагдлаа','var(--red)') }
    else {
      notify('Алдаа','var(--red)')
      await fetchLessons(courseId) // rollback on error
    }
  }

  /* ── Task CRUD ── */
  const saveTask = async () => {
    if (!taskForm.title) { notify('Title шаардлагатай','var(--red)'); return }
    setSavingT(true)
    const body: Record<string,unknown> = { lessonId:taskLesson, title:taskForm.title, titleEn:taskForm.titleEn, description:taskForm.description, descriptionEn:taskForm.descriptionEn, taskType:taskForm.taskType, xpReward:parseInt(taskForm.xpReward)||20, orderIndex:parseInt(taskForm.orderIndex)||0 }
    if (taskForm.taskType==='quiz') {
      const opts1 = taskForm.options.filter(o=>o.trim())
      const opts2 = taskForm.options2.filter(o=>o.trim())
      // if variant 2 is enabled and has options, save as [[...],[...]] multi-variant
      body.options = taskForm.useVariant2 && opts2.length >= 2 ? [opts1, opts2] : opts1
      body.answer  = parseInt(taskForm.answer)
    } else {
      body.starterCode = taskForm.starterCode
      try { body.testCases = JSON.parse(taskForm.testCases) } catch { body.testCases = [] }
    }
    try {
      const r = editTask
        ? await adminFetch(`/api/tasks/${editTask.id}`, {method:'PUT',body:JSON.stringify(body)})
        : await adminFetch('/api/tasks', {method:'POST',body:JSON.stringify(body)})
      if (r.ok) {
        notify(editTask?'Шинэчлэгдлээ':'Даалгавар үүсгэгдлээ')
        setTaskModal('none')
        await fetchTasks(taskLesson) // force reload → real-time
      } else { const d=await r.json(); notify(d.error??'Алдаа','var(--red)') }
    } finally { setSavingT(false) }
  }

  const deleteTask = async (lessonId:string, t:Task) => {
    if (!confirm(`"${t.title}" устгах уу?`)) return
    // Optimistic: instantly remove from UI
    setTasks(prev=>({...prev,[lessonId]:(prev[lessonId]??[]).filter(x=>x.id!==t.id)}))
    const r = await adminFetch(`/api/tasks/${t.id}`, {method:'DELETE'})
    if (r.ok) { notify('Устгагдлаа','var(--red)') }
    else {
      notify('Алдаа','var(--red)')
      await fetchTasks(lessonId) // rollback on error
    }
  }

  const diffCol = (d:string) => d==='BEGINNER'?'var(--green)':d==='INTERMEDIATE'?'var(--yellow)':'var(--red)'

  return (
    <div style={{ padding:'28px 36px', minHeight:'100%' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom:20, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ ...fp, fontSize:5, color:'var(--dim2)', letterSpacing:4, marginBottom:5 }}>ADMIN · COURSES</div>
          <h1 style={{ ...fp, fontSize:12, color:'var(--text)', letterSpacing:2, margin:0 }}>COURSE MANAGEMENT <span style={{ fontSize:8, color:'var(--green)' }}>◫</span></h1>
        </div>
        <Btn label='+ ШИНЭ COURSE' col='var(--green)' size='md' onClick={()=>{ setEditCourse(null); setCourseForm(emptyCourse(courses.length)); setCourseModal('create') }} />
      </div>

      <Flash msg={flash} col={flashCol}/>

      {/* ── Course list ── */}
      <div style={{ border:'1px solid var(--dim)', overflow:'hidden' }}>
        {/* header */}
        <div style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 1fr 0.6fr 0.6fr 0.6fr 1.8fr', background:'var(--bg2)', borderBottom:'1px solid var(--dim)', padding:'8px 14px', gap:8 }}>
          {['TITLE','CATEGORY','DIFFICULTY','LESSONS','ENROLLS','STATUS','ҮЙЛДЭЛ'].map(h=>(
            <span key={h} style={{ ...fp, fontSize:5, color:'var(--dim2)', letterSpacing:2 }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding:32, ...fm, fontSize:12, color:'var(--dim2)', textAlign:'center' }}>Уншиж байна...</div>
        ) : courses.length===0 ? (
          <div style={{ padding:32, ...fm, fontSize:12, color:'var(--dim2)', textAlign:'center' }}>Course алга</div>
        ) : courses.map(c=>(
          <div key={c.id}>
            {/* Course row */}
            <div style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr 1fr 0.6fr 0.6fr 0.6fr 1.8fr', padding:'10px 14px', gap:8, borderBottom:'1px solid var(--dim)', alignItems:'center', background: expanded===c.id?'rgba(0,229,255,.03)':'transparent' }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <button onClick={()=>toggleCourse(c.id)} style={{ background:'transparent', border:'none', color: expanded===c.id?'var(--cyan)':'var(--dim2)', cursor:'pointer', ...fp, fontSize:8, lineHeight:1 }}>
                  {expanded===c.id?'▾':'▸'}
                </button>
                <span style={{ ...fp, fontSize:7, color:'var(--text)' }}>{c.title}</span>
              </div>
              <span style={{ ...fp, fontSize:6, color:'var(--dim2)' }}>{c.category}</span>
              <span style={{ ...fp, fontSize:5, color:diffCol(c.difficulty) }}>{c.difficulty}</span>
              <span style={{ ...fp, fontSize:6, color:'var(--dim2)' }}>{c._count.lessons}</span>
              <span style={{ ...fp, fontSize:6, color:'var(--dim2)' }}>{c._count.enrollments}</span>
              <span style={{ ...fp, fontSize:5, color:c.isActive?'var(--green)':'var(--dim2)' }}>{c.isActive?'LIVE':'DRAFT'}</span>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                <Btn label='ЗАСАХ'  col='var(--cyan)'  onClick={()=>{ setEditCourse(c); setCourseForm({ title:c.title, description:c.description??'', category:c.category, difficulty:c.difficulty, xpReward:String(c.xpReward), orderIndex:String(c.orderIndex??0) }); setCourseModal('edit') }} />
                <Btn label={c.isActive?'DRAFT':'PUB'} col={c.isActive?'var(--dim2)':'var(--green)'} onClick={()=>togglePublish(c)} />
                <Btn label='DEL'   col='var(--red)'   onClick={()=>deleteCourse(c)} />
              </div>
            </div>

            {/* ── Lessons (expanded) ── */}
            {expanded===c.id && (
              <div style={{ background:'rgba(0,0,0,.25)', borderBottom:'1px solid var(--dim)' }}>
                {/* Lesson header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'8px 20px 6px 36px', borderBottom:'1px solid rgba(255,255,255,.04)' }}>
                  <span style={{ ...fp, fontSize:5, color:'var(--cyan)', letterSpacing:3 }}>ХИЧЭЭЛҮҮД</span>
                  <Btn label='+ ХИЧЭЭЛ НЭМЭХ' col='var(--cyan)' onClick={()=>{ setLessonCourse(c.id); setEditLesson(null); setLessonForm(emptyLesson()); setSelectedGameId(''); setLessonModal('create'); loadAvailGames() }} />
                </div>

                {loadingLes && !lessons[c.id] ? (
                  <div style={{ padding:'12px 36px', ...fm, fontSize:11, color:'var(--dim2)' }}>Уншиж байна...</div>
                ) : (lessons[c.id]??[]).length===0 ? (
                  <div style={{ padding:'12px 36px', ...fm, fontSize:11, color:'var(--dim2)' }}>Хичээл алга</div>
                ) : (lessons[c.id]??[]).map(l=>(
                  <div key={l.id}>
                    {/* Lesson row */}
                    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 20px 8px 36px', borderBottom:'1px solid rgba(255,255,255,.03)', background: expandedLes===l.id?'rgba(0,255,65,.03)':'transparent' }}>
                      <button onClick={()=>toggleLesson(l.id)} style={{ background:'transparent', border:'none', color: expandedLes===l.id?'var(--green)':'var(--dim2)', cursor:'pointer', ...fp, fontSize:7, lineHeight:1 }}>
                        {expandedLes===l.id?'▾':'▸'}
                      </button>
                      <span style={{ ...fp, fontSize:6, color:'var(--text)', flex:1 }}>{l.title}</span>
                      <span style={{ ...fp, fontSize:5, color:'var(--dim2)' }}>{l._count?.tasks??0} task</span>
                      <span style={{ ...fp, fontSize:5, color:'var(--green)' }}>🎮{lessonGames[l.id]?.length ?? '·'}</span>
                      <span style={{ ...fp, fontSize:5, color:'var(--yellow)' }}>+{l.xpReward}XP</span>
                      <Btn label='ЗАСАХ' col='var(--cyan)' onClick={()=>{ setLessonCourse(c.id); setEditLesson(l); setLessonForm({ title:l.title, content:l.content??'', xpReward:String(l.xpReward), orderIndex:String(l.orderIndex) }); setSelectedGameId(''); setLessonModal('edit'); loadAvailGames() }} />
                      <Btn label='+ TASK' col='var(--purple)' onClick={()=>{ setTaskLesson(l.id); setEditTask(null); setTaskForm(emptyTask()); setTaskModal('create') }} />
                      <Btn label='🎮 GAME' col='var(--green)' onClick={()=>{ setGameMgrLesson({id:l.id,title:l.title}); if(!lessonGames[l.id]) loadLessonGames(l.id) }} />
                      <Btn label='DEL' col='var(--red)' onClick={()=>deleteLesson(c.id,l)} />
                    </div>

                    {/* ── Tasks (expanded lesson) ── */}
                    {expandedLes===l.id && (
                      <div style={{ background:'rgba(0,0,0,.2)', paddingLeft:52, paddingRight:20, paddingBottom:8 }}>
                        {loadingTasks && !tasks[l.id] ? (
                          <div style={{ padding:'8px 0', ...fm, fontSize:10, color:'var(--dim2)' }}>Уншиж байна...</div>
                        ) : (tasks[l.id]??[]).length===0 ? (
                          <div style={{ padding:'8px 0', ...fm, fontSize:10, color:'var(--dim2)' }}>Task алга</div>
                        ) : (tasks[l.id]??[]).map((t,ti)=>(
                          <div key={t.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0', borderBottom:'1px solid rgba(255,255,255,.03)' }}>
                            <span style={{ ...fp, fontSize:4, color:'var(--dim)', width:20 }}>#{ti+1}</span>
                            <span style={{ ...fp, fontSize:5, color: t.taskType==='quiz'?'var(--cyan)':'var(--purple)', border:`1px solid ${t.taskType==='quiz'?'var(--cyan)':'var(--purple)'}33`, padding:'1px 5px' }}>{t.taskType.toUpperCase()}</span>
                            <span style={{ ...fm, fontSize:11, color:'var(--text)', flex:1 }}>{t.title}</span>
                            {t.titleEn && <span style={{ ...fm, fontSize:9, color:'var(--dim2)', fontStyle:'italic' }}>{t.titleEn}</span>}
                            <span style={{ ...fp, fontSize:4, color:'var(--yellow)' }}>+{t.xpReward}XP</span>
                            <Btn label='ЗАСАХ' col='var(--cyan)' onClick={()=>{
                              setTaskLesson(l.id); setEditTask(t)
                              const raw = t.options
                              const parsed = raw ? (typeof raw==='string'?JSON.parse(raw as string):raw) : null
                              const isMulti = Array.isArray(parsed?.[0])
                              const opts1 = isMulti ? (parsed as string[][])[0] : (Array.isArray(parsed)?parsed as string[]:[])
                              const opts2 = isMulti ? ((parsed as string[][])[1]??['','','','']) : ['','','','']
                              setTaskForm({ title:t.title, titleEn:t.titleEn??'', description:t.description, descriptionEn:(t as any).descriptionEn??'', taskType:t.taskType, xpReward:String(t.xpReward), orderIndex:String(t.orderIndex), options:[...opts1,'','','',''].slice(0,4) as string[], answer:String(t.answer??'0'), options2:[...opts2,'','','',''].slice(0,4) as string[], answer2:'0', useVariant2:isMulti, starterCode:'', testCases:'[]' })
                              setTaskModal('edit')
                            }} />
                            <Btn label='DEL' col='var(--red)' onClick={()=>deleteTask(l.id,t)} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ══ COURSE MODAL ══ */}
      {courseModal!=='none' && (
        <Modal onClose={()=>setCourseModal('none')}>
          <div style={{ ...fp, fontSize:8, color:'var(--green)', marginBottom:16 }}>{courseModal==='edit'?'COURSE ЗАСАХ':'ШИНЭ COURSE'}</div>
          <Field label='TITLE'       value={courseForm.title}       onChange={v=>setCourseForm(f=>({...f,title:v}))}       placeholder='Course нэр' />
          <Field label='CATEGORY'    value={courseForm.category}    onChange={v=>setCourseForm(f=>({...f,category:v}))}    placeholder='frontend, backend...' />
          <Field label='DIFFICULTY'  value={courseForm.difficulty}  onChange={v=>setCourseForm(f=>({...f,difficulty:v}))}  type='select' options={DIFFICULTIES} />
          <Field label='DESCRIPTION' value={courseForm.description} onChange={v=>setCourseForm(f=>({...f,description:v}))} type='textarea' placeholder='Тайлбар...' />
          <Field label='XP REWARD'   value={courseForm.xpReward}    onChange={v=>setCourseForm(f=>({...f,xpReward:v}))}    type='number' />
          <Field label='ДАРААЛАЛ (0=эхэнд, том тоо=сүүлд)' value={(courseForm as any).orderIndex??'0'} onChange={v=>setCourseForm(f=>({...f,orderIndex:v} as any))} type='number' />
          <Row><Btn label={savingC?'...':'ХАДГАЛАХ'} col='var(--green)' size='md' onClick={saveCourse} disabled={savingC}/><Btn label='БОЛИХ' col='var(--dim2)' size='md' onClick={()=>setCourseModal('none')}/></Row>
        </Modal>
      )}

      {/* ══ LESSON MODAL ══ */}
      {lessonModal!=='none' && (
        <Modal onClose={()=>{setLessonModal('none');setSelectedGameId('')}}>
          <div style={{ ...fp, fontSize:8, color:'var(--cyan)', marginBottom:16 }}>{lessonModal==='edit'?'ХИЧЭЭЛ ЗАСАХ':'ШИНЭ ХИЧЭЭЛ'}</div>
          <Field label='ГАРЧИГ'     value={lessonForm.title}      onChange={v=>setLessonForm(f=>({...f,title:v}))}      placeholder='Хичээлийн нэр' />
          <Field label='АГУУЛГА'    value={lessonForm.content}    onChange={v=>setLessonForm(f=>({...f,content:v}))}    type='textarea' placeholder='Хичээлийн агуулга...' rows={4} />
          <Field label='XP REWARD'  value={lessonForm.xpReward}   onChange={v=>setLessonForm(f=>({...f,xpReward:v}))}   type='number' />
          <Field label='ДАРААЛАЛ'   value={lessonForm.orderIndex} onChange={v=>setLessonForm(f=>({...f,orderIndex:v}))} type='number' />

          {/* ── Game selection ── */}
          {lessonModal==='create' && (
            <div style={{ marginBottom:12 }}>
              <div style={{ ...fp, fontSize:5, color:'var(--green)', marginBottom:6, letterSpacing:1 }}>🎮 ТОГЛООМ ОНООХ (OPTIONAL)</div>
              {gamesLoading ? (
                <div style={{ ...fp, fontSize:6, color:'var(--dim2)' }}>Уншиж байна...</div>
              ) : (
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  <button onClick={()=>setSelectedGameId('')}
                    style={{ ...fp, fontSize:5, padding:'5px 9px', cursor:'pointer', background:!selectedGameId?'var(--dim)22':'transparent', color:!selectedGameId?'var(--text)':'var(--dim2)', border:`1px solid ${!selectedGameId?'var(--dim2)':'var(--dim)'}` }}>
                    БАЙХГҮЙ
                  </button>
                  {availGames.map(g=>{
                    const m = gm(g.gameType)
                    const sel = selectedGameId===g.id
                    return (
                      <button key={g.id} onClick={()=>setSelectedGameId(sel?'':g.id)}
                        style={{ ...fp, fontSize:5, padding:'5px 9px', cursor:'pointer', background:sel?`${m.col}22`:'transparent', color:sel?m.col:'var(--dim2)', border:`1px solid ${sel?m.col+'66':'var(--dim)'}`, display:'flex', alignItems:'center', gap:4 }}>
                        <span>{m.icon}</span>
                        <span>{g.name}</span>
                        {sel && <span style={{ color:m.col }}>✓</span>}
                      </button>
                    )
                  })}
                </div>
              )}
              {selectedGameId && (
                <div style={{ ...fm, fontSize:10, color:'var(--green)', marginTop:6 }}>
                  ✓ {availGames.find(g=>g.id===selectedGameId)?.name} хичээлд оноогдоно
                </div>
              )}
            </div>
          )}

          <Row><Btn label={savingL?'...':'ХАДГАЛАХ'} col='var(--cyan)' size='md' onClick={saveLesson} disabled={savingL}/><Btn label='БОЛИХ' col='var(--dim2)' size='md' onClick={()=>{setLessonModal('none');setSelectedGameId('')}}/></Row>
        </Modal>
      )}

      {/* ══ GAME MANAGER MODAL ══ */}
      {gameMgrLesson && (
        <GameManagerModal
          lesson={gameMgrLesson}
          initialGames={lessonGames[gameMgrLesson.id] ?? []}
          onClose={()=>setGameMgrLesson(null)}
          onChanged={()=>loadLessonGames(gameMgrLesson.id)}
          notify={notify}
        />
      )}

      {/* ══ TASK MODAL ══ */}
      {taskModal!=='none' && (
        <Modal onClose={()=>setTaskModal('none')} wide>
          <div style={{ ...fp, fontSize:8, color:'var(--purple)', marginBottom:16 }}>{taskModal==='edit'?'TASK ЗАСАХ':'ШИНЭ TASK'}</div>

          {/* Type selector */}
          <div style={{ marginBottom:12 }}>
            <div style={{ ...fp, fontSize:5, color:'var(--dim2)', marginBottom:6 }}>TASK ТӨРӨЛ</div>
            <div style={{ display:'flex', gap:8 }}>
              {['quiz','code'].map(tp=>(
                <button key={tp} onClick={()=>setTaskForm(f=>({...f,taskType:tp}))}
                  style={{ ...fp, fontSize:6, padding:'6px 18px', cursor:'pointer', background:taskForm.taskType===tp?'var(--purple)18':'transparent', color:taskForm.taskType===tp?'var(--purple)':'var(--dim2)', border:`1px solid ${taskForm.taskType===tp?'var(--purple)':'var(--dim)'}` }}>
                  {tp.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Bilingual fields */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:4 }}>
            <div>
              <div style={{ ...fp, fontSize:5, color:'var(--dim2)', marginBottom:6, letterSpacing:2 }}>🇲🇳 МОНГОЛ</div>
              <Field label='ГАРЧИГ'   value={taskForm.title}       onChange={v=>setTaskForm(f=>({...f,title:v}))}       placeholder='Даалгаврын нэр' />
              <Field label='ТАЙЛБАР'  value={taskForm.description} onChange={v=>setTaskForm(f=>({...f,description:v}))} type='textarea' placeholder='Монгол тайлбар...' rows={3} />
            </div>
            <div>
              <div style={{ ...fp, fontSize:5, color:'var(--dim2)', marginBottom:6, letterSpacing:2 }}>🇺🇸 ENGLISH</div>
              <Field label='TITLE EN'  value={taskForm.titleEn}        onChange={v=>setTaskForm(f=>({...f,titleEn:v}))}        placeholder='Task title in English' />
              <Field label='DESC EN'   value={taskForm.descriptionEn}  onChange={v=>setTaskForm(f=>({...f,descriptionEn:v}))}  type='textarea' placeholder='English description...' rows={3} />
            </div>
          </div>

          {/* Quiz options */}
          {taskForm.taskType==='quiz' && (
            <div style={{ marginBottom:10 }}>
              <div style={{ ...fp, fontSize:5, color:'var(--dim2)', marginBottom:8 }}>VARIANT 1 — ХАРИУЛТУУД (зөв хариултыг радиогоор сонгоно)</div>
              {taskForm.options.map((opt,i)=>(
                <div key={i} style={{ display:'flex', gap:8, marginBottom:7, alignItems:'center' }}>
                  <input type='radio' name='answer' checked={taskForm.answer===String(i)} onChange={()=>setTaskForm(f=>({...f,answer:String(i)}))} style={{ accentColor:'var(--green)' }}/>
                  <input value={opt} onChange={e=>{ const o=[...taskForm.options]; o[i]=e.target.value; setTaskForm(f=>({...f,options:o})) }}
                    placeholder={`Сонголт ${i+1}`}
                    style={{ flex:1, padding:'7px 10px', background:'var(--bg)', border:`1px solid ${taskForm.answer===String(i)?'var(--green)':'var(--dim)'}`, color:'var(--text)', ...fm, fontSize:12, outline:'none' }}/>
                </div>
              ))}
              {/* Variant 2 toggle */}
              <div style={{ display:'flex', alignItems:'center', gap:10, margin:'10px 0 8px' }}>
                <input type='checkbox' id='v2toggle' checked={taskForm.useVariant2} onChange={e=>setTaskForm(f=>({...f,useVariant2:e.target.checked}))} style={{ accentColor:'var(--cyan)' }}/>
                <label htmlFor='v2toggle' style={{ ...fp, fontSize:5, color:'var(--cyan)', cursor:'pointer' }}>🔄 VARIANT 2 НЭМЭХ (Change Task товч дарахад харагдана)</label>
              </div>
              {taskForm.useVariant2 && (
                <div style={{ borderLeft:'2px solid var(--cyan)22', paddingLeft:12, marginTop:4 }}>
                  <div style={{ ...fp, fontSize:5, color:'var(--cyan)', marginBottom:8 }}>VARIANT 2 — ӨӨР АСУУЛТ/ХАРИУЛТУУД</div>
                  {taskForm.options2.map((opt,i)=>(
                    <div key={i} style={{ display:'flex', gap:8, marginBottom:7, alignItems:'center' }}>
                      <input type='radio' name='answer2' checked={taskForm.answer2===String(i)} onChange={()=>setTaskForm(f=>({...f,answer2:String(i)}))} style={{ accentColor:'var(--cyan)' }}/>
                      <input value={opt} onChange={e=>{ const o=[...taskForm.options2]; o[i]=e.target.value; setTaskForm(f=>({...f,options2:o})) }}
                        placeholder={`V2 сонголт ${i+1}`}
                        style={{ flex:1, padding:'7px 10px', background:'var(--bg)', border:`1px solid ${taskForm.answer2===String(i)?'var(--cyan)':'var(--dim)'}`, color:'var(--text)', ...fm, fontSize:12, outline:'none' }}/>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Code fields */}
          {taskForm.taskType==='code' && (
            <>
              <Field label='STARTER CODE' value={taskForm.starterCode} onChange={v=>setTaskForm(f=>({...f,starterCode:v}))} type='textarea' placeholder='function solution() { }' rows={3} />
              <Field label='TEST CASES (JSON)' value={taskForm.testCases} onChange={v=>setTaskForm(f=>({...f,testCases:v}))} type='textarea' placeholder='[{"input":1,"expected":2}]' rows={3} />
            </>
          )}

          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Field label='XP REWARD' value={taskForm.xpReward}   onChange={v=>setTaskForm(f=>({...f,xpReward:v}))}   type='number' />
            <Field label='ДАРААЛАЛ'  value={taskForm.orderIndex} onChange={v=>setTaskForm(f=>({...f,orderIndex:v}))} type='number' />
          </div>

          <Row><Btn label={savingT?'...':'ХАДГАЛАХ'} col='var(--purple)' size='md' onClick={saveTask} disabled={savingT}/><Btn label='БОЛИХ' col='var(--dim2)' size='md' onClick={()=>setTaskModal('none')}/></Row>
        </Modal>
      )}
    </div>
  )
}

/* ── GameManagerModal ──────────────────────────────────────────────── */
function GameManagerModal({ lesson, initialGames, onClose, onChanged, notify }: {
  lesson: {id:string;title:string}
  initialGames: LessonGameEntry[]
  onClose: ()=>void
  onChanged: ()=>void
  notify: (msg:string,col?:string)=>void
}) {
  const [assigned,   setAssigned]   = useState<LessonGameEntry[]>(initialGames)
  const [allGames,   setAllGames]   = useState<GameInfo[]>([])
  const [loadingAll, setLoadingAll] = useState(true)
  const [search,     setSearch]     = useState('')
  const [typeF,      setTypeF]      = useState('')
  const [assigning,  setAssigning]  = useState<string|null>(null)
  const [removing,   setRemoving]   = useState<string|null>(null)
  const [reordering, setReordering] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Load current lesson games + all available games
  useEffect(()=>{
    adminFetch(`/api/admin/lessons/${lesson.id}/games`).then(r=>r.json()).then(d=>{
      setAssigned(d.games ?? [])
    })
    adminFetch('/api/admin/games?active=true').then(r=>r.json()).then(d=>{
      setAllGames(d.games ?? [])
      setLoadingAll(false)
    })
    setTimeout(()=>searchRef.current?.focus(), 80)
  },[lesson.id])

  const assignedIds = new Set(assigned.map(a=>a.game.id))

  const filtered = allGames.filter(g=>{
    const matchS = !search || g.name.toLowerCase().includes(search.toLowerCase())
    const matchT = !typeF  || g.gameType===typeF
    return matchS && matchT
  })

  // Assign game to lesson
  const handleAssign = async (game:GameInfo) => {
    if (assigning) return
    setAssigning(game.id)
    const r = await adminFetch(`/api/admin/lessons/${lesson.id}/games`,{method:'POST',body:JSON.stringify({gameId:game.id})})
    setAssigning(null)
    if (!r.ok) { const d=await r.json(); notify(d.error??'Алдаа','var(--red)'); return }
    const newEntry:LessonGameEntry = { lessonGameId:'', orderIndex:assigned.length, game }
    setAssigned(prev=>[...prev,newEntry])
    onChanged()
    notify('Тоглоом нэмэгдлээ','var(--green)')
  }

  // Detach game from lesson
  const handleRemove = async (gameId:string) => {
    setRemoving(gameId)
    const r = await adminFetch(`/api/admin/lessons/${lesson.id}/games/${gameId}`,{method:'DELETE'})
    setRemoving(null)
    if (!r.ok) { notify('Алдаа','var(--red)'); return }
    setAssigned(prev=>prev.filter(a=>a.game.id!==gameId))
    onChanged()
    notify('Хасагдлаа','var(--yellow)')
  }

  // Reorder
  const move = async (idx:number, dir:-1|1) => {
    const next = [...assigned]
    const swap = idx+dir
    if (swap<0||swap>=next.length) return;
    [next[idx],next[swap]]=[next[swap],next[idx]]
    setAssigned(next)
    setReordering(true)
    const order = next.map((e,i)=>({gameId:e.game.id, orderIndex:i}))
    await adminFetch(`/api/admin/lessons/${lesson.id}/games`,{method:'PATCH',body:JSON.stringify({order})})
    setReordering(false)
    onChanged()
  }

  const allTypes = Array.from(new Set(allGames.map(g=>g.gameType)))

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:300,padding:20}}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{background:'var(--bg)',border:'1px solid var(--green)',width:860,maxHeight:'90vh',display:'flex',flexDirection:'column'}}>

        {/* Header */}
        <div style={{padding:'14px 20px',borderBottom:'1px solid var(--dim)',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{...fp,fontSize:8,color:'var(--green)',letterSpacing:2}}>🎮 GAME MANAGER</div>
            <div style={{...fm,fontSize:10,color:'var(--dim2)',marginTop:3}}>{lesson.title}</div>
          </div>
          <button onClick={onClose} style={{...fp,fontSize:10,color:'var(--dim2)',background:'transparent',border:'none',cursor:'pointer'}}>✕</button>
        </div>

        <div style={{display:'flex',flex:1,overflow:'hidden'}}>

          {/* LEFT — Assigned games */}
          <div style={{width:340,borderRight:'1px solid var(--dim)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{...fp,fontSize:5,color:'var(--green)',letterSpacing:2,padding:'10px 16px 8px',borderBottom:'1px solid var(--dim)',flexShrink:0}}>
              ОНООГДСОН ТОГЛООМУУД ({assigned.length})
            </div>
            <div style={{flex:1,overflowY:'auto',padding:'10px 14px',scrollbarWidth:'none'}}>
              {assigned.length===0 ? (
                <div style={{...fp,fontSize:7,color:'var(--dim2)',textAlign:'center',padding:'30px 0'}}>
                  Тоглоом оноогдоогүй байна
                  <div style={{...fm,fontSize:9,color:'var(--dim2)',marginTop:8}}>Баруун талаас нэмнэ үү →</div>
                </div>
              ) : assigned.map((a,i)=>{
                const meta=gm(a.game.gameType)
                return (
                  <div key={a.game.id} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:`${meta.col}08`,border:`1px solid ${meta.col}33`,marginBottom:6,transition:'all .15s',opacity:a.game.isActive?1:0.55}}>
                    {/* Order controls */}
                    <div style={{display:'flex',flexDirection:'column',gap:2,flexShrink:0}}>
                      <button onClick={()=>move(i,-1)} disabled={i===0||reordering}
                        style={{...fp,fontSize:6,padding:'1px 4px',background:'transparent',border:'1px solid var(--dim)',color:i===0?'var(--dim)':'var(--dim2)',cursor:i===0?'not-allowed':'pointer'}}>▲</button>
                      <div style={{...fp,fontSize:5,color:meta.col,textAlign:'center'}}>{i+1}</div>
                      <button onClick={()=>move(i,1)} disabled={i===assigned.length-1||reordering}
                        style={{...fp,fontSize:6,padding:'1px 4px',background:'transparent',border:'1px solid var(--dim)',color:i===assigned.length-1?'var(--dim)':'var(--dim2)',cursor:i===assigned.length-1?'not-allowed':'pointer'}}>▼</button>
                    </div>
                    {/* Icon */}
                    <div style={{fontSize:20,flexShrink:0}}>{meta.icon}</div>
                    {/* Info */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{...fp,fontSize:7,color:meta.col,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{a.game.name}</div>
                      <div style={{...fp,fontSize:5,color:'var(--dim2)',marginTop:2}}>❤{a.game.hpMax} ⚡{a.game.xpReward} 📋{a.game._count.gameTasks}</div>
                    </div>
                    {/* Remove */}
                    <button onClick={()=>handleRemove(a.game.id)} disabled={removing===a.game.id}
                      style={{...fp,fontSize:6,padding:'3px 7px',cursor:'pointer',background:'transparent',color:'var(--red)',border:'1px solid var(--red)44',flexShrink:0,opacity:removing===a.game.id?0.5:1}}>
                      {removing===a.game.id?'...':'✕'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* RIGHT — Game picker */}
          <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            {/* Search + filter */}
            <div style={{padding:'10px 16px',borderBottom:'1px solid var(--dim)',flexShrink:0}}>
              <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Тоглоом хайх..."
                style={{...fm,fontSize:11,padding:'7px 10px',background:'var(--bg)',border:'1px solid var(--dim)',color:'var(--text)',outline:'none',width:'100%',boxSizing:'border-box',marginBottom:8}}
                onFocus={e=>e.currentTarget.style.borderColor='var(--green)'}
                onBlur={e=>e.currentTarget.style.borderColor='var(--dim)'}/>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                <button onClick={()=>setTypeF('')}
                  style={{...fp,fontSize:5,padding:'3px 7px',cursor:'pointer',background:!typeF?'var(--dim)22':'transparent',color:!typeF?'var(--text)':'var(--dim2)',border:`1px solid ${!typeF?'var(--dim2)':'var(--dim)'}`}}>ALL</button>
                {allTypes.map(t=>{const m=gm(t); return (
                  <button key={t} onClick={()=>setTypeF(typeF===t?'':t)}
                    style={{...fp,fontSize:5,padding:'3px 7px',cursor:'pointer',background:typeF===t?`${m.col}22`:'transparent',color:typeF===t?m.col:'var(--dim2)',border:`1px solid ${typeF===t?m.col+'66':'var(--dim)'}`}}>
                    {m.icon} {m.label}
                  </button>
                )})}
              </div>
            </div>

            {/* Game list */}
            <div style={{flex:1,overflowY:'auto',padding:'10px 16px',scrollbarWidth:'none'}}>
              {loadingAll ? (
                <div style={{...fp,fontSize:8,color:'var(--dim2)',textAlign:'center',padding:30}}>УНШИЖ БАЙНА...</div>
              ) : filtered.length===0 ? (
                <div style={{...fp,fontSize:8,color:'var(--dim2)',textAlign:'center',padding:30}}>Тоглоом олдсонгүй</div>
              ) : filtered.map(game=>{
                const meta=gm(game.gameType)
                const already=assignedIds.has(game.id)
                return (
                  <div key={game.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',background:already?'var(--green)06':'transparent',border:`1px solid ${already?'var(--green)33':'var(--dim)'}`,marginBottom:4,opacity:already?0.65:1,transition:'all .15s'}}>
                    <div style={{fontSize:20,flexShrink:0}}>{meta.icon}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                        <span style={{...fp,fontSize:7,color:meta.col,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{game.name}</span>
                        <span style={{...fp,fontSize:5,color:meta.col,background:`${meta.col}18`,border:`1px solid ${meta.col}44`,padding:'1px 5px',flexShrink:0}}>{meta.label}</span>
                      </div>
                      {game.description && <div style={{...fm,fontSize:9,color:'var(--dim2)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{game.description}</div>}
                    </div>
                    <span style={{...fp,fontSize:6,color:'var(--dim2)',flexShrink:0}}>❤{game.hpMax} ⚡{game.xpReward} 📋{game._count.gameTasks}</span>
                    {already ? (
                      <span style={{...fp,fontSize:6,color:'var(--green)',border:'1px solid var(--green)44',padding:'3px 8px',flexShrink:0}}>✓ ОНООГДСОН</span>
                    ) : (
                      <button onClick={()=>handleAssign(game)} disabled={!!assigning}
                        style={{...fp,fontSize:6,padding:'4px 10px',cursor:assigning?'not-allowed':'pointer',background:'transparent',color:'var(--cyan)',border:'1px solid var(--cyan)55',flexShrink:0,transition:'all .15s',opacity:assigning===game.id?0.5:1}}
                        onMouseEnter={e=>{if(!assigning){e.currentTarget.style.background='var(--cyan)18';e.currentTarget.style.borderColor='var(--cyan)'}}}
                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.borderColor='var(--cyan)55'}}>
                        {assigning===game.id?'...':'+ ОНООХ'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div style={{padding:'10px 16px',borderTop:'1px solid var(--dim)',display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
              <span style={{...fm,fontSize:9,color:'var(--dim2)'}}>
                {filtered.filter(g=>!assignedIds.has(g.id)).length} тоглоом нэмэх боломжтой
              </span>
              <button onClick={onClose}
                style={{...fp,fontSize:6,padding:'5px 12px',cursor:'pointer',background:'transparent',color:'var(--dim2)',border:'1px solid var(--dim)55'}}>
                ХААХ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Helper components ── */
function Modal({ children, onClose, wide=false }: { children:React.ReactNode; onClose:()=>void; wide?:boolean }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.8)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:20 }}
      onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
      <div style={{ background:'var(--bg)', border:'1px solid var(--dim)', padding:'24px 28px', width:wide?760:480, maxHeight:'90vh', overflowY:'auto', position:'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:10, right:14, background:'transparent', border:'none', color:'var(--dim2)', cursor:'pointer', fontSize:16 }}>✕</button>
        {children}
      </div>
    </div>
  )
}
function Row({ children }: { children:React.ReactNode }) {
  return <div style={{ display:'flex', gap:8, marginTop:12 }}>{children}</div>
}