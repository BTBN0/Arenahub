'use client'
import { useEffect, useState, useCallback } from 'react'
import { adminFetch } from '@/lib/admin-fetch'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

type Course  = { id:string; title:string; description:string; category:string; difficulty:string; isActive:boolean; xpReward:number; orderIndex:number; _count:{ lessons:number; enrollments:number } }
type Lesson  = { id:string; title:string; content:string; xpReward:number; orderIndex:number; _count:{ tasks:number } }
type Task    = { id:string; title:string; titleEn:string; description:string; descriptionEn:string; taskType:string; xpReward:number; options:unknown; answer:number|null; orderIndex:number; _count:{ submissions:number } }

const DIFFICULTIES = ['BEGINNER','INTERMEDIATE','ADVANCED']

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

  // Task modal
  const [taskModal,   setTaskModal]  = useState<'none'|'create'|'edit'>('none')
  const [editTask,    setEditTask]   = useState<Task|null>(null)
  const [taskForm,    setTaskForm]   = useState(emptyTask())
  const [taskLesson,  setTaskLesson] = useState<string>('')
  const [savingT,     setSavingT]    = useState(false)

  const notify = (msg:string, col='var(--cyan)') => { setFlash(msg); setFlashCol(col); setTimeout(()=>setFlash(''),3500) }

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
        notify(editLesson?'Шинэчлэгдлээ':'Хичээл үүсгэгдлээ')
        setLessonModal('none')
        await fetchLessons(lessonCourse) // force reload → real-time
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
                  <Btn label='+ ХИЧЭЭЛ НЭМЭХ' col='var(--cyan)' onClick={()=>{ setLessonCourse(c.id); setEditLesson(null); setLessonForm(emptyLesson()); setLessonModal('create') }} />
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
                      <span style={{ ...fp, fontSize:5, color:'var(--yellow)' }}>+{l.xpReward}XP</span>
                      <Btn label='ЗАСАХ' col='var(--cyan)' onClick={()=>{ setLessonCourse(c.id); setEditLesson(l); setLessonForm({ title:l.title, content:l.content??'', xpReward:String(l.xpReward), orderIndex:String(l.orderIndex) }); setLessonModal('edit') }} />
                      <Btn label='+ TASK' col='var(--purple)' onClick={()=>{ setTaskLesson(l.id); setEditTask(null); setTaskForm(emptyTask()); setTaskModal('create') }} />
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
        <Modal onClose={()=>setLessonModal('none')}>
          <div style={{ ...fp, fontSize:8, color:'var(--cyan)', marginBottom:16 }}>{lessonModal==='edit'?'ХИЧЭЭЛ ЗАСАХ':'ШИНЭ ХИЧЭЭЛ'}</div>
          <Field label='ГАРЧИГ'     value={lessonForm.title}      onChange={v=>setLessonForm(f=>({...f,title:v}))}      placeholder='Хичээлийн нэр' />
          <Field label='АГУУЛГА'    value={lessonForm.content}    onChange={v=>setLessonForm(f=>({...f,content:v}))}    type='textarea' placeholder='Хичээлийн агуулга...' rows={4} />
          <Field label='XP REWARD'  value={lessonForm.xpReward}   onChange={v=>setLessonForm(f=>({...f,xpReward:v}))}   type='number' />
          <Field label='ДАРААЛАЛ'   value={lessonForm.orderIndex} onChange={v=>setLessonForm(f=>({...f,orderIndex:v}))} type='number' />
          <Row><Btn label={savingL?'...':'ХАДГАЛАХ'} col='var(--cyan)' size='md' onClick={saveLesson} disabled={savingL}/><Btn label='БОЛИХ' col='var(--dim2)' size='md' onClick={()=>setLessonModal('none')}/></Row>
        </Modal>
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