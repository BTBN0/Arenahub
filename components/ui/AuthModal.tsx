'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'

interface Props { mode?: string; onClose?: () => void }

export default function AuthModal({ onClose }: Props) {
  const [gLoad, setGLoad] = useState(false)
  const [hLoad, setHLoad] = useState(false)
  const busy = gLoad || hLoad

  const handleGoogle = async () => {
    setGLoad(true); onClose?.()
    await signIn('google', { callbackUrl: '/dashboard' })
  }
  const handleGitHub = async () => {
    setHLoad(true); onClose?.()
    await signIn('github', { callbackUrl: '/dashboard' })
  }

  const btnBase: React.CSSProperties = {
    width:'100%', display:'flex', alignItems:'center', justifyContent:'center',
    gap:14, padding:'15px', border:'1px solid var(--dim)', color:'var(--text)',
    cursor: busy ? 'wait' : 'pointer', fontFamily:'var(--fp)', fontSize:8,
    letterSpacing:2, transition:'all .25s',
  }

  return (
    <div style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,.9)',
      display:'flex', alignItems:'center', justifyContent:'center', padding:16, backdropFilter:'blur(8px)' }}
      onClick={e => e.target===e.currentTarget && onClose?.()}>
      <div style={{ width:'100%', maxWidth:380, background:'var(--bg2)', border:'1px solid var(--dim)', overflow:'hidden', position:'relative' }}>
        <div style={{ height:3, background:'linear-gradient(90deg,var(--cyan),var(--green),var(--yellow))' }}/>
        <div style={{ padding:'36px 28px 32px' }}>
          <button onClick={onClose} style={{ position:'absolute', top:12, right:14, background:'none', border:'none', color:'var(--dim2)', fontSize:18, cursor:'pointer' }}>✕</button>

          <div style={{ textAlign:'center', marginBottom:28 }}>
            <img src="/logo.svg" width="36" height="36" style={{ display:'inline-block', marginBottom:14 }}/>
            <div style={{ fontFamily:'var(--fp)', fontSize:12, color:'var(--text)', letterSpacing:3, marginBottom:6 }}>ARENAHUB</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'var(--dim2)', letterSpacing:3 }}>IT СУРГАЛТЫН ПЛАТФОРМ</div>
          </div>

          {/* Google */}
          <button onClick={handleGoogle} disabled={busy}
            style={{ ...btnBase, background: gLoad ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.05)', marginBottom:10 }}
            onMouseEnter={e=>{ if(!busy)(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,.12)' }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background= gLoad?'rgba(255,255,255,.03)':'rgba(255,255,255,.05)' }}>
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

          {/* GitHub */}
          <button onClick={handleGitHub} disabled={busy}
            style={{ ...btnBase, background: hLoad ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.04)', marginBottom:20 }}
            onMouseEnter={e=>{ if(!busy)(e.currentTarget as HTMLButtonElement).style.background='rgba(255,255,255,.12)' }}
            onMouseLeave={e=>{ (e.currentTarget as HTMLButtonElement).style.background= hLoad?'rgba(255,255,255,.03)':'rgba(255,255,255,.04)' }}>
            {hLoad ? <span>⏳</span> : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            )}
            {hLoad ? 'ХОЛБОГДОЖ БАЙНА...' : 'GITHUB-АЭР НЭВТРЭХ'}
          </button>

          <div style={{ padding:'12px 14px', background:'rgba(0,229,255,.04)', border:'1px solid rgba(0,229,255,.1)', textAlign:'center' }}>
            <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'var(--dim2)', letterSpacing:1, marginBottom:5 }}>АНХНЫ НЭВТРЭЛТ</div>
            <div style={{ fontFamily:'var(--fm)', fontSize:11, color:'var(--dim2)', lineHeight:1.8 }}>
              Google эсвэл GitHub аккаунтаараа нэвтэрвэл<br/>автоматаар бүртгэл үүснэ
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
