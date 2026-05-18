'use client'
import dynamic from 'next/dynamic'
const PixelModel3D = dynamic(() => import('@/components/ui/Model3D'), { ssr:false, loading:()=><div style={{width:200,height:200}}/> })
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import TaskModal from '@/components/TaskModal'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { coursesApi, lessonsApi, Course, Lesson } from '@/lib/api-client'

const DIFF_COLOR: Record<string,string> = { BEGINNER:'#00ff41', INTERMEDIATE:'#ffe600', ADVANCED:'#ff2d55' }
const DIFF_LABEL_KEY: Record<string,string> = { BEGINNER:'ls_beginner', INTERMEDIATE:'ls_intermediate', ADVANCED:'ls_advanced' }
const COURSE_META: Record<number,{px:string;col:string;game:string}> = {
  1:{px:'HTML', col:'#00e5ff', game:'EVOLUTION'},
  2:{px:'CSS',  col:'#bf5af2', game:'PLATFORM'},
  3:{px:'JS',   col:'#ff2244', game:'CODE QUEST'},
  4:{px:'ADV',  col:'#ff6600', game:'BATTLE'},
  5:{px:'RCT',  col:'#00ff41', game:'RUNNER'},
  6:{px:'SRV',  col:'#ff9900', game:'FACTORY'},
  7:{px:'DB',   col:'#4488ff', game:'NETWORK'},
  8:{px:'DEP',  col:'#ffd700', game:'DEPLOY'},
}

const kf = `
@keyframes ls-in  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes ls-spin { to{transform:rotate(360deg)} }
@keyframes ls-glow { 0%,100%{opacity:.5} 50%{opacity:1} }
`

export default function LessonsPage() {
  const { isAuthenticated, loading, user } = useAuth()
  const { t } = useLang()
  const router = useRouter()
  const [courses,     setCourses]     = useState<Course[]>([])
  const [lessons,     setLessons]     = useState<Record<string,Lesson[]>>({})
  const [expanded,    setExpanded]    = useState<string|null>(null)
  const [fetching,    setFetching]    = useState(true)
  const [activeLesson,setActiveLesson]= useState<string|null>(null)
  const [lessonHov,   setLessonHov]  = useState<string|null>(null)

  useEffect(() => { if (!loading && !isAuthenticated) router.push('/') }, [loading,isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated) return
    coursesApi.list('?limit=50&page=1').then(async d => {
      setCourses(d.courses)
      if (d.courses.length > 0) setExpanded(d.courses[0].id)
      const results = await Promise.allSettled(d.courses.map(c => lessonsApi.byCourse(c.id)))
      const merged: Record<string, Lesson[]> = {}
      results.forEach((r, i) => { if (r.status === 'fulfilled') merged[d.courses[i].id] = r.value.lessons })
      setLessons(merged)
    }).finally(() => setFetching(false))
  }, [isAuthenticated])

  const toggleCourse = async (id: string) => {
    setExpanded(p => p === id ? null : id)
    if (!lessons[id]) {
      try { const d = await lessonsApi.byCourse(id); setLessons(p=>({...p,[id]:d.lessons})) } catch {}
    }
  }

  const reloadLesson = async (courseId: string) => {
    const d = await lessonsApi.byCourse(courseId)
    setLessons(p => ({...p,[courseId]:d.lessons}))
  }

  const getCourseId = (lessonId: string) =>
    Object.entries(lessons).find(([,ls]) => ls.some(l => l.id === lessonId))?.[0] || ''

  const openLesson = (lesson: Lesson) => {
    // mark lesson for full task refresh so user gets rotated variants on every re-entry
    localStorage.setItem(`arenahub_reset_${lesson.id}`, '1')
    setActiveLesson(lesson.id)
  }

  if (loading && !user) return null

  const allLessons  = Object.values(lessons).flat()
  const totalDone   = allLessons.filter(l => l.completed).length
  const totalCount  = allLessons.length
  const globalPct   = totalCount > 0 ? Math.round(totalDone / totalCount * 100) : 0

  return (
    <>
      <style>{kf}</style>
      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', minHeight:'100vh' }}>

        {/* ── HEADER ── */}
        <div style={{ background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', borderBottom:'1px solid #0d1a28', flexShrink:0, position:'relative', overflow:'hidden' }}>
          {/* top glow */}
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#00e5ff33,transparent)' }}/>

          <div style={{ padding:'28px 32px', display:'flex', alignItems:'center', gap:24 }}>
            {/* title block */}
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:5, marginBottom:8 }}>ARENAHUB · FULLSTACK ROADMAP</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:16, color:'#fff', letterSpacing:3, marginBottom:16 }}>{t('ls_title')}</div>

              {/* progress row */}
              {totalCount > 0 && (
                <div style={{ maxWidth:480 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--fp)', fontSize:5, color:'#2a4060', marginBottom:6 }}>
                    <span>{t('ls_progress')}</span>
                    <span style={{ color:'#00ff41' }}>{totalDone}/{totalCount} · {globalPct}%</span>
                  </div>
                  <div style={{ height:6, background:'rgba(12,18,34,.62)',  backdropFilter:'blur(16px)', border:'1px solid #0d1a28', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${globalPct}%`, background:'linear-gradient(90deg,#00ff41,#00e5ff)', transition:'width 1s ease', boxShadow:'0 0 8px rgba(0,255,65,.5)' }}/>
                  </div>
                </div>
              )}
            </div>

            {/* stat pills */}
            <div style={{ display:'flex', gap:10, flexShrink:0 }}>
              {[
                { k: t('ls_course_count'), v:courses.length, col:'#00e5ff' },
                { k: t('ls_lessons'), v:totalCount, col:'#bf5af2' },
                { k: t('ls_complete'), v:totalDone, col:'#00ff41' },
              ].map(s => (
                <div key={s.k} style={{ padding:'12px 18px', background:`${s.col}08`, border:`1px solid ${s.col}22`, textAlign:'center' }}>
                  <div style={{ fontFamily:'var(--fp)', fontSize:4, color:s.col, letterSpacing:2, marginBottom:5, opacity:.7 }}>{s.k}</div>
                  <div style={{ fontFamily:'var(--fp)', fontSize:14, color:s.col }}>{s.v}</div>
                </div>
              ))}
            </div>

            {/* 3D sword */}
            <div style={{ flexShrink:0, position:'relative' }}>
              <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center,rgba(255,34,68,.06) 0%,transparent 65%)', pointerEvents:'none' }}/>
              <PixelModel3D model="sword" theme="lava" size={96} />
            </div>
          </div>
        </div>

        {/* ── COURSE LIST ── */}
        <div style={{ flex:1, padding:'20px 24px 40px' }}>
          {fetching ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 0', gap:16 }}>
              <div style={{ width:36, height:36, border:'2px solid #0a1520', borderTop:'2px solid #00e5ff', borderRadius:'50%', animation:'ls-spin 1s linear infinite' }}/>
              <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#1a3a5a', letterSpacing:3 }}>{t('common_loading')}</div>
            </div>
          ) : courses.length === 0 ? (
            <div style={{ textAlign:'center', padding:'80px 0' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>⚠️</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:10, color:'#ff6600', marginBottom:12 }}>DATABASE ХООСОН</div>
              <code style={{ fontFamily:'var(--fp)', fontSize:7, color:'#2a3a54', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', padding:'12px 20px', display:'inline-block' }}>npm run db:roadmap</code>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              {courses.map((course, ci) => {
                const isOpen  = expanded === course.id
                const cls     = lessons[course.id] || []
                const done    = cls.filter(l => l.completed).length
                const dCol    = DIFF_COLOR[course.difficulty] || '#00e5ff'
                const meta    = COURSE_META[ci+1] || { px:'??', col:'#00e5ff', game:'GAME' }
                const pct     = cls.length > 0 ? done / cls.length : 0
                const isLocked = (course as any).locked === true

                return (
                  <div key={course.id} style={{ animation:`ls-in .3s ease ${ci * 0.05}s both`, position:'relative' }}>

                    {/* ── LOCK OVERLAY for paid courses ── */}
                    {isLocked && (
                      <div style={{ position:'absolute', inset:0, zIndex:10, background:'rgba(4,8,14,.85)', display:'flex', alignItems:'center', justifyContent:'center', gap:16, backdropFilter:'blur(2px)', cursor:'default' }}
                        onClick={e => e.stopPropagation()}>
                        <div style={{ fontFamily:'var(--fp)', fontSize:8, color:'#ffd700', letterSpacing:2 }}>🔒 PRO / VIP</div>
                        <a href="/pricing" style={{ fontFamily:'var(--fp)', fontSize:7, color:'#060e1a', background:'#ffd700', padding:'6px 16px', textDecoration:'none', letterSpacing:1 }}>
                          UPGRADE →
                        </a>
                      </div>
                    )}

                    {/* ── COURSE ROW ── */}
                    <div
                      onClick={() => !isLocked && toggleCourse(course.id)}
                      style={{
                        display:'flex', alignItems:'center', gap:0,
                        cursor: isLocked ? 'default' : 'pointer', overflow:'hidden',
                        background: isLocked ? 'rgba(8,12,22,.5)' : isOpen ? `${meta.col}0c` : 'rgba(8,12,22,.96)',
                        border:`1px solid ${isLocked ? '#0d1a28' : isOpen ? meta.col+'44' : '#0d1a28'}`,
                        borderBottom: isOpen ? 'none' : `1px solid ${isLocked ? '#0d1a28' : isOpen ? meta.col+'44' : '#0d1a28'}`,
                        opacity: isLocked ? 0.65 : 1,
                        transition:'all .2s',
                      }}
                    >
                      {/* color slab */}
                      <div style={{ width:6, alignSelf:'stretch', background:`linear-gradient(180deg,${meta.col},${meta.col}44)`, flexShrink:0 }}/>

                      {/* badge */}
                      <div style={{ width:64, flexShrink:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'18px 0', gap:3, background:`${meta.col}08` }}>
                        <div style={{ fontFamily:'var(--fp)', fontSize:5, color:meta.col, letterSpacing:1 }}>{meta.px}</div>
                        <div style={{ fontFamily:'var(--fp)', fontSize:12, color:meta.col, textShadow:`0 0 10px ${meta.col}55` }}>{String(ci+1).padStart(2,'0')}</div>
                      </div>

                      {/* divider */}
                      <div style={{ width:1, alignSelf:'stretch', background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)' }}/>

                      {/* info */}
                      <div style={{ flex:1, padding:'16px 20px', minWidth:0 }}>
                        <div style={{ fontFamily:'var(--fp)', fontSize:9, color:'#d0e0f0', letterSpacing:1, marginBottom:8 }}>{course.title}</div>
                        <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom: cls.length > 0 ? 8 : 0 }}>
                          <span style={{ fontFamily:'var(--fp)', fontSize:5, color:dCol, border:`1px solid ${dCol}33`, padding:'2px 8px' }}>{t((DIFF_LABEL_KEY[course.difficulty] ?? 'ls_beginner') as any)}</span>
                          <span style={{ fontFamily:'var(--fp)', fontSize:5, color:'#2a4a6a' }}>{cls.length || course._count?.lessons || 0} {t('ls_lessons')}</span>
                          <span style={{ fontFamily:'var(--fp)', fontSize:5, color:'#ffe60077' }}>+{course.xpReward}XP</span>
                          <span style={{ fontFamily:'var(--fp)', fontSize:5, color:`${meta.col}88`, border:`1px solid ${meta.col}22`, padding:'2px 8px' }}>🎮 {meta.game}</span>
                          {done > 0 && <span style={{ fontFamily:'var(--fp)', fontSize:5, color:'#00ff4188' }}>✓ {done}/{cls.length}</span>}
                        </div>
                        {cls.length > 0 && (
                          <div style={{ height:2, background:'rgba(12,18,34,.62)',  backdropFilter:'blur(16px)', maxWidth:320, overflow:'hidden' }}>
                            <div style={{ height:'100%', width:`${pct*100}%`, background: pct===1?'#00ff41':meta.col, transition:'width .6s', boxShadow:`0 0 4px ${meta.col}66` }}/>
                          </div>
                        )}
                      </div>

                      {/* arrow */}
                      <div style={{ padding:'0 20px', fontFamily:'var(--fp)', fontSize:9, color:isOpen?meta.col:'#1a2840', transform:isOpen?'rotate(90deg)':'none', transition:'all .22s', flexShrink:0 }}>▶</div>
                    </div>

                    {/* ── LESSONS ── */}
                    {isOpen && (
                      <div style={{ background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', border:`1px solid ${meta.col}33`, borderTop:'none' }}>
                        {cls.length === 0 ? (
                          <div style={{ padding:24, textAlign:'center', fontFamily:'var(--fp)', fontSize:7, color:'#1a2840' }}>{t('ls_no_courses')}</div>
                        ) : cls.map((lesson, li) => {
                          const unlocked = li === 0 || cls[li-1]?.completed === true
                          const isDone   = lesson.completed
                          const isLH     = lessonHov === lesson.id

                          return (
                            <div
                              key={lesson.id}
                              onClick={() => unlocked && openLesson(lesson)}
                              onMouseEnter={() => setLessonHov(lesson.id)}
                              onMouseLeave={() => setLessonHov(null)}
                              style={{
                                display:'flex', alignItems:'center', gap:0,
                                borderBottom:'1px solid #0a1220',
                                cursor: unlocked ? 'pointer' : 'default',
                                opacity: unlocked ? 1 : 0.35,
                                background: isLH && unlocked ? isDone ? 'rgba(0,255,65,.05)' : 'rgba(255,255,255,.02)' : isDone ? 'rgba(0,255,65,.03)' : 'transparent',
                                transition:'background .15s',
                              }}
                            >
                              {/* indent line */}
                              <div style={{ width:6, alignSelf:'stretch', background: isDone ? 'rgba(0,255,65,.25)' : 'transparent', flexShrink:0 }}/>

                              {/* number */}
                              <div style={{
                                width:44, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center',
                                padding:'14px 0',
                              }}>
                                <div style={{
                                  width:32, height:32,
                                  display:'flex', alignItems:'center', justifyContent:'center',
                                  border:`1px solid ${isDone?'#00ff4144':unlocked?meta.col+'44':'#0d1a28'}`,
                                  background: isDone ? 'rgba(0,255,65,.08)' : 'transparent',
                                  fontFamily:'var(--fp)', fontSize:7,
                                  color: isDone ? '#00ff41' : unlocked ? meta.col : '#1a2840',
                                }}>
                                  {isDone ? '✓' : unlocked ? String(li+1).padStart(2,'0') : '🔒'}
                                </div>
                              </div>

                              {/* lesson info */}
                              <div style={{ flex:1, padding:'14px 16px', minWidth:0 }}>
                                <div style={{ fontFamily:'var(--fp)', fontSize:7, color: isDone ? (isLH?'#00ff4199':'#00ff4166') : unlocked&&isLH?'#e0f0ff':unlocked?'#8090a8':'#2a3a54', marginBottom:4, transition:'color .15s' }}>
                                  {lesson.title}
                                </div>
                                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                                  <span style={{ fontFamily:'var(--fp)', fontSize:5, color: isDone ? '#00ff4133' : '#ffe60055' }}>{isDone ? '' : `+${lesson.xpReward}XP`}</span>
                                  {isDone && <span style={{ fontFamily:'var(--fp)', fontSize:5, color:'#00ff4155' }}>✓ {t('ls_complete')}</span>}
                                  {!unlocked && <span style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a2840' }}>{t('ls_locked')}</span>}
                                </div>
                              </div>

                              {/* action button */}
                              {unlocked && (
                                <div style={{ padding:'0 20px', flexShrink:0 }}>
                                  {isDone ? (
                                    <button
                                      onClick={e => { e.stopPropagation(); openLesson(lesson) }}
                                      style={{
                                        fontFamily:'var(--fp)', fontSize:6, letterSpacing:1,
                                        padding:'8px 16px', cursor:'pointer',
                                        border:'1px solid #00ff4133',
                                        background: isLH ? 'rgba(0,255,65,.12)' : 'rgba(0,255,65,.04)',
                                        color:'#00ff4188', transition:'all .15s',
                                      }}
                                    >↺ {t('ls_continue')}</button>
                                  ) : (
                                    <button
                                      onClick={e => { e.stopPropagation(); openLesson(lesson) }}
                                      style={{
                                        fontFamily:'var(--fp)', fontSize:6, letterSpacing:1,
                                        padding:'8px 18px', cursor:'pointer',
                                        border:`1px solid ${meta.col}55`,
                                        background: isLH ? `${meta.col}20` : `${meta.col}0a`,
                                        color:meta.col, transition:'all .15s',
                                      }}
                                    >► {t('ls_start')}</button>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <style>{`
          main::-webkit-scrollbar { width:4px }
          main::-webkit-scrollbar-track { background:#020609 }
          main::-webkit-scrollbar-thumb { background:#0d1a28 }
        `}</style>
      </main>

      {activeLesson && (
        <TaskModal
          lessonId={activeLesson}
          onClose={() => setActiveLesson(null)}
          onDone={(nextId?: string | null) => {
            const cid = getCourseId(activeLesson)
            setActiveLesson(null)
            if (cid) reloadLesson(cid)
            if (nextId) setTimeout(() => setActiveLesson(nextId), 400)
          }}
        />
      )}
    </>
  )
}