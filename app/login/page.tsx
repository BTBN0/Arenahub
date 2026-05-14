'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { useAuth } from '@/context/AuthContext'

function LoginInner() {
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const sp     = useSearchParams()
  const [gLoad, setGLoad] = useState(false)
  const [hLoad, setHLoad] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && isAuthenticated) router.push('/dashboard')
    const err = sp.get('error')
    if (err === 'OAuthAccountNotLinked') setError('Энэ и-мэйл аль хэдийн бүртгэлтэй.')
    else if (err) setError('Нэвтрэлт амжилтгүй боллоо. Дахин оролдоно уу.')
  }, [loading, isAuthenticated, sp])

  const handleGoogle = async () => {
    setGLoad(true)
    await signIn('google', { callbackUrl: '/dashboard', prompt: 'select_account' })
  }
  const handleGitHub = async () => {
    setHLoad(true)
    await signIn('github', { callbackUrl: '/dashboard' })
  }

  return (
    <div style={{ minHeight:'100vh', background:'#070d1a',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:20, flexDirection:'column' }}>

      {/* BG dots */}
      <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
        {Array.from({length:14}).map((_,i) => (
          <div key={i} style={{
            position:'absolute', width:2, height:2,
            background: i%2===0 ? '#00e5ff18' : '#00ff4118',
            left:`${(i*19+5)%100}%`, top:`${(i*27+3)%100}%`,
            animation:`float ${3+i%3}s ease-in-out infinite`,
            animationDelay:`${i*0.4}s`
          }}/>
        ))}
      </div>

      <div style={{ width:'100%', maxWidth:380, position:'relative', zIndex:1 }}>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:'var(--fp)', fontSize:24, color:'#00e5ff',
            letterSpacing:6, marginBottom:8, textShadow:'0 0 20px rgba(0,229,255,.4)' }}>
            ARENA<span style={{ color:'#ffe600' }}>HUB</span>
          </div>
          <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a4a6a', letterSpacing:3 }}>
            IT СУРГАЛТЫН ТОГЛООМ
          </div>
        </div>

        {/* Card */}
        <div style={{ background:'#0b1225', border:'1px solid rgba(0,229,255,.15)', padding:'36px 32px' }}>

          <div style={{ fontFamily:'var(--fp)', fontSize:9, color:'#e0e8f4',
            letterSpacing:2, marginBottom:6, textAlign:'center' }}>НЭВТРЭХ</div>
          <div style={{ fontFamily:'var(--fm)', fontSize:12, color:'#4a6a8a',
            marginBottom:28, lineHeight:1.6, textAlign:'center' }}>
            OAuth аккаунтаараа нэвтэрнэ үү
          </div>

          {error && (
            <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#ff0040',
              marginBottom:16, padding:'10px 12px',
              border:'1px solid rgba(255,0,64,.3)', background:'rgba(255,0,64,.06)' }}>
              {error}
            </div>
          )}

          {/* Google */}
          <button onClick={handleGoogle} disabled={gLoad || hLoad}
            style={{ width:'100%', display:'flex', alignItems:'center',
              justifyContent:'center', gap:12, padding:'14px 20px',
              background: gLoad ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)',
              border:'1px solid rgba(255,255,255,.15)', color:'#fff',
              cursor: gLoad ? 'not-allowed' : 'pointer', marginBottom:10,
              transition:'all .2s', fontFamily:'var(--fp)', fontSize:9, letterSpacing:1 }}
            onMouseEnter={e => !gLoad && !hLoad && (e.currentTarget.style.background = 'rgba(255,255,255,.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = gLoad ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.06)')}>
            {gLoad ? (
              <span style={{ animation:'pulse 1s ease-in-out infinite' }}>⏳</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 27 36 24 36c-5.3 0-9.6-2.7-11.3-7L6 34c3.4 6.4 10.1 10 18 10z"/>
                <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C41 35.5 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
              </svg>
            )}
            {gLoad ? 'ХОЛБОГДОЖ БАЙНА...' : 'GOOGLE-ОЭР НЭВТРЭХ'}
          </button>

          {/* GitHub */}
          <button onClick={handleGitHub} disabled={gLoad || hLoad}
            style={{ width:'100%', display:'flex', alignItems:'center',
              justifyContent:'center', gap:12, padding:'14px 20px',
              background: hLoad ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.04)',
              border:'1px solid rgba(255,255,255,.12)', color:'#fff',
              cursor: hLoad ? 'not-allowed' : 'pointer',
              transition:'all .2s', fontFamily:'var(--fp)', fontSize:9, letterSpacing:1 }}
            onMouseEnter={e => !gLoad && !hLoad && (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
            onMouseLeave={e => (e.currentTarget.style.background = hLoad ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.04)')}>
            {hLoad ? (
              <span style={{ animation:'pulse 1s ease-in-out infinite' }}>⏳</span>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )}
            {hLoad ? 'ХОЛБОГДОЖ БАЙНА...' : 'GITHUB-АЭР НЭВТРЭХ'}
          </button>

          {/* Info */}
          <div style={{ marginTop:22, padding:'12px 16px',
            background:'rgba(0,229,255,.04)', border:'1px solid rgba(0,229,255,.1)' }}>
            <div style={{ fontFamily:'var(--fp)', fontSize:6, color:'#3a4a6a', letterSpacing:1, marginBottom:6 }}>
              АНХНЫ НЭВТРЭЛТ
            </div>
            <div style={{ fontFamily:'var(--fm)', fontSize:11, color:'#4a6a8a', lineHeight:1.6 }}>
              Нэвтэрвэл автоматаар бүртгэл үүснэ. Нэмэлт мэдээлэл оруулах хуудас нэмэгдэнэ.
            </div>
          </div>
        </div>

        {/* Features */}
        <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:24 }}>
          {[
            { icon:'⚔', label:'TASKS' },
            { icon:'🏆', label:'XP' },
            { icon:'🤖', label:'AI' },
            { icon:'🎯', label:'LEVEL' },
          ].map(f => (
            <div key={f.label} style={{ textAlign:'center' }}>
              <div style={{ fontSize:16, marginBottom:4 }}>{f.icon}</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:6, color:'#2a3a54' }}>{f.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%,100% { transform: translateY(0) }
          50% { transform: translateY(-15px) }
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return <Suspense><LoginInner /></Suspense>
}