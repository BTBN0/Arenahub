'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useLang } from '@/context/LanguageContext'
import { lessonsApi, Lesson } from '@/lib/api-client'

export default function LessonDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { isAuthenticated, loading } = useAuth()
  const { t } = useLang()
  const [lessons,  setLessons]  = useState<Lesson[]>([])
  const [fetching, setFetching] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/')
  }, [loading, isAuthenticated])

  useEffect(() => {
    if (!isAuthenticated || !id) return
    setFetching(true)
    lessonsApi.byCourse(id)
      .then(d => setLessons(d.lessons))
      .finally(() => setFetching(false))
  }, [isAuthenticated, id])

  const done  = lessons.filter(l => l.completed).length
  const total = lessons.length
  const pct   = total ? Math.round(done / total * 100) : 0

  const diffColor = (d?: string) =>
    d === 'BEGINNER' ? '#00ff41' : d === 'INTERMEDIATE' ? '#00e5ff' : '#ffe600'

  return (
    <main style={{ flex:1, padding:'24px 32px', background:'#070d1a', overflowY:'auto' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between',
          marginBottom:28, paddingBottom:16, borderBottom:'1px solid rgba(0,229,255,.1)' }}>
          <div>
            <Link href="/lessons"
              style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a4a6a',
                letterSpacing:1, display:'block', marginBottom:8 }}>
              ◀ {t('ls_back')}
            </Link>
            <h1 style={{ fontFamily:'var(--fp)', fontSize:13, color:'#fff', letterSpacing:2 }}>
              {t('ls_title')}
            </h1>
          </div>
          {/* Progress */}
          <div style={{ textAlign:'right', minWidth:180 }}>
            <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a4a6a',
              marginBottom:6, letterSpacing:1 }}>
              {done}/{total} {t('ls_complete')}
            </div>
            <div style={{ height:8, background:'#0e1428', border:'1px solid #1a2a40',
              overflow:'hidden', marginBottom:4 }}>
              <div style={{ width:`${pct}%`, height:'100%', background:'#00ff41',
                transition:'width .6s' }}/>
            </div>
            <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#00ff41' }}>{pct}%</div>
          </div>
        </div>

        {fetching ? (
          <div style={{ textAlign:'center', padding:60,
            fontFamily:'var(--fp)', fontSize:10, color:'#3a4a6a' }}>
            {t('common_loading')}
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:10, maxWidth:820 }}>
            {lessons.map((l, idx) => (
              // Click lesson → go to /tasks?lessonId=...
              <Link key={l.id} href={`/tasks?lessonId=${l.id}`}
                style={{ textDecoration:'none' }}>
                <div style={{
                  background: l.completed ? 'rgba(0,255,65,.04)' : '#0b1225',
                  border: `1px solid ${l.completed ? 'rgba(0,255,65,.3)' : 'rgba(0,229,255,.12)'}`,
                  padding:'18px 22px',
                  display:'flex', alignItems:'center', justifyContent:'space-between', gap:20,
                  cursor:'pointer', transition:'transform .15s, border-color .15s',
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateX(4px)'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor =
                      l.completed ? 'rgba(0,255,65,.6)' : 'rgba(0,229,255,.35)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.transform = ''
                    ;(e.currentTarget as HTMLDivElement).style.borderColor =
                      l.completed ? 'rgba(0,255,65,.3)' : 'rgba(0,229,255,.12)'
                  }}>

                  {/* Left: number + info */}
                  <div style={{ display:'flex', alignItems:'center', gap:18, flex:1 }}>
                    {/* Step number circle */}
                    <div style={{
                      width:44, height:44, borderRadius:'50%',
                      background: l.completed ? 'rgba(0,255,65,.15)' : '#0e1428',
                      border: `2px solid ${l.completed ? '#00ff41' : '#1a2a40'}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      flexShrink:0,
                    }}>
                      {l.completed
                        ? <span style={{ fontSize:18, color:'#00ff41' }}>✓</span>
                        : <span style={{ fontFamily:'var(--fp)', fontSize:9,
                            color:'#3a4a6a' }}>{String(idx+1).padStart(2,'0')}</span>
                      }
                    </div>

                    {/* Title + content */}
                    <div>
                      <div style={{ fontFamily:'var(--fp)', fontSize:9, color:'#e0e8f4',
                        marginBottom:5, letterSpacing:.5 }}>
                        {l.title}
                      </div>
                      {l.content && (
                        <div style={{ fontFamily:'var(--fm)', fontSize:11, color:'#4a6070',
                          lineHeight:1.6, maxWidth:480 }}>
                          {l.content.slice(0, 90)}{l.content.length > 90 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: xp + status + arrow */}
                  <div style={{ display:'flex', alignItems:'center', gap:14, flexShrink:0 }}>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontFamily:'var(--fp)', fontSize:8,
                        color:'#ffe600', marginBottom:4 }}>
                        +{l.xpReward} XP
                      </div>
                      <div style={{ fontFamily:'var(--fp)', fontSize:6,
                        color: l.completed ? '#00ff41' : '#3a4a6a', letterSpacing:.5 }}>
                        {l.completed ? t('ls_complete') : `${l.taskCount || 0} ${t('ls_tasks')}`}
                      </div>
                    </div>
                    {/* Arrow */}
                    <div style={{ fontFamily:'var(--fp)', fontSize:12,
                      color: l.completed ? '#00ff41' : '#00e5ff' }}>
                      ▶
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
  )
}
