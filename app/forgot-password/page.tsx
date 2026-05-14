'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async () => {
    if (!email.trim()) return
    setLoading(true); setError('')
    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      setSent(true)
    } catch (e: unknown) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight:'100vh', background:'#070d1a', display:'flex',
      alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:380, background:'#0b1225',
        border:'1px solid rgba(255,230,0,.15)', padding:36 }}>
        <div style={{ fontFamily:'var(--fp)', fontSize:12, color:'#fff',
          letterSpacing:3, textAlign:'center', marginBottom:4 }}>ARENAHUB</div>
        <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a4a6a',
          textAlign:'center', marginBottom:28, letterSpacing:1 }}>НУУЦ ҮГ СЭРГЭЭХ</div>

        {sent ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:16 }}>📧</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:8, color:'#00ff41', marginBottom:8 }}>
              И-МЭЙЛ ИЛГЭЭГДЛЭЭ
            </div>
            <div style={{ fontFamily:'var(--fm)', fontSize:12, color:'#6a8aaa', marginBottom:20 }}>
              {email} хаягт нууц үг сэргээх холбоос илгээгдлээ.
            </div>
            <Link href="/login" style={{ fontFamily:'var(--fp)', fontSize:7,
              color:'#00e5ff', border:'1px solid #00e5ff', padding:'8px 16px' }}>
              ◀ НЭВТРЭХ ХУУДАС
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#ff0040', marginBottom:14,
                padding:'10px', border:'1px solid rgba(255,0,64,.3)' }}>{error}</div>
            )}
            <div style={{ fontFamily:'var(--fm)', fontSize:12, color:'#6a8aaa', marginBottom:20, lineHeight:1.7 }}>
              Бүртгэлтэй и-мэйл хаягаа оруулна уу. Нууц үг сэргээх холбоос илгээнэ.
            </div>
            <label style={{ display:'block', fontFamily:'var(--fp)', fontSize:7,
              color:'#3a4a6a', marginBottom:6 }}>И-МЭЙЛ</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="user@email.com"
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              style={{ width:'100%', background:'#070d1a', border:'1px solid #1a2a40',
                color:'#e0e8f4', fontFamily:'var(--fm)', fontSize:13,
                padding:'11px 14px', marginBottom:16, boxSizing:'border-box' }}/>
            <button onClick={handleSubmit} disabled={loading || !email.trim()}
              style={{ width:'100%', fontFamily:'var(--fp)', fontSize:9, letterSpacing:2,
                padding:'13px', cursor:'pointer', border:'2px solid #ffe600',
                background:'rgba(255,230,0,.06)', color:'#ffe600', marginBottom:12 }}>
              {loading ? 'ИЛГЭЭЖ БАЙНА...' : '🔑 ХОЛБООС ИЛГЭЭХ'}
            </button>
            <div style={{ textAlign:'center' }}>
              <Link href="/login" style={{ fontFamily:'var(--fp)', fontSize:6,
                color:'#3a4a6a', letterSpacing:1 }}>◀ БУЦАХ</Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
