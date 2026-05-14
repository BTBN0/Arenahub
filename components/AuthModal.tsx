'use client'
import { useState, FormEvent } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'

interface Props { mode?: 'login'|'register'; onClose?: () => void }

export default function AuthModal({ mode='login', onClose }: Props) {
  const [gLoad,   setGLoad]   = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const { login } = useAuth()
  const router = useRouter()

  // Google OAuth — primary login method
  const handleGoogle = async () => {
    setGLoad(true)
    onClose?.()
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const fp = { fontFamily:'var(--fp)' } as const
  const fm = { fontFamily:'var(--fm)' } as const

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000,
      background:'rgba(0,0,0,.8)', display:'flex',
      alignItems:'center', justifyContent:'center', padding:20,
      backdropFilter:'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose?.()}>

      <div style={{ width:'100%', maxWidth:400, background:'#0b1225',
        border:'1px solid rgba(0,229,255,.2)', padding:'40px 32px',
        position:'relative', animation:'popIn .2s ease' }}>

        {/* Close */}
        <button onClick={onClose}
          style={{ position:'absolute', top:14, right:16, background:'transparent',
            border:'none', color:'#3a4a6a', fontSize:20, cursor:'pointer', lineHeight:1 }}>
          ✕
        </button>

        {/* Logo */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ ...fp, fontSize:13, color:'#fff', letterSpacing:3, marginBottom:6 }}>
            ArenaHub
          </div>
          <div style={{ ...fp, fontSize:7, color:'#3a4a6a', letterSpacing:2 }}>
            НЭВТРЭХ
          </div>
        </div>

        {error && (
          <div style={{ ...fp, fontSize:7, color:'#ff0040', marginBottom:16,
            padding:'10px 12px', border:'1px solid rgba(255,0,64,.3)',
            background:'rgba(255,0,64,.06)' }}>{error}
          </div>
        )}

        {/* Google — main button */}
        <button onClick={handleGoogle} disabled={gLoad}
          style={{ width:'100%', display:'flex', alignItems:'center',
            justifyContent:'center', gap:12, padding:'15px 20px',
            background:'rgba(255,255,255,.06)', border:'1px solid rgba(255,255,255,.18)',
            color:'#fff', cursor: gLoad ? 'wait' : 'pointer',
            ...fp, fontSize:9, letterSpacing:1, marginBottom:20,
            transition:'all .2s' }}
          onMouseEnter={e => !gLoad && ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.14)')}
          onMouseLeave={e => !gLoad && ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,.06)')}>
          {gLoad ? <span>⏳</span> : (
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 27 36 24 36c-5.3 0-9.6-2.7-11.3-7L6 34c3.4 6.4 10.1 10 18 10z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C41 35.5 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
          )}
          {gLoad ? 'ХОЛБОГДОЖ БАЙНА...' : 'GOOGLE-ОЭР НЭВТРЭХ'}
        </button>

        {/* Info */}
        <div style={{ padding:'12px 16px', background:'rgba(0,229,255,.04)',
          border:'1px solid rgba(0,229,255,.1)', textAlign:'center' }}>
          <div style={{ ...fp, fontSize:6, color:'#3a4a6a', letterSpacing:1, marginBottom:5 }}>
            АНХНЫ НЭВТРЭЛТ
          </div>
          <div style={{ ...fm, fontSize:11, color:'#4a6a8a', lineHeight:1.7 }}>
            Google аккаунтаараа нэвтэрвэл<br/>автоматаар бүртгэл үүснэ
          </div>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity:0; transform:scale(.95) translateY(8px) }
          to   { opacity:1; transform:scale(1)  translateY(0) }
        }
      `}</style>
    </div>
  )
}
