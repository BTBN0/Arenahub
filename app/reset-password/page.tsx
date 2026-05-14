'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetInner() {
  const sp       = useSearchParams()
  const router   = useRouter()
  const token    = sp.get('token') || ''
  const [pw,     setPw]      = useState('')
  const [pw2,    setPw2]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [done,    setDone]    = useState(false)

  const handleSubmit = async () => {
    if (pw !== pw2) { setError('Нууц үг тохирохгүй байна'); return }
    if (pw.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт байна'); return }
    setLoading(true); setError('')
    try {
      const r = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pw }),
      })
      const d = await r.json()
      if (!r.ok) { setError(d.error || 'Алдаа гарлаа'); return }
      setDone(true)
      setTimeout(() => router.push('/login'), 2000)
    } catch (e: unknown) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  if (!token) return (
    <div style={{ minHeight:'100vh', background:'#070d1a', display:'flex',
      alignItems:'center', justifyContent:'center' }}>
      <div style={{ fontFamily:'var(--fp)', fontSize:8, color:'#ff0040' }}>
        Token байхгүй байна
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#070d1a', display:'flex',
      alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ width:'100%', maxWidth:380, background:'#0b1225',
        border:'1px solid rgba(255,230,0,.15)', padding:36 }}>
        <div style={{ fontFamily:'var(--fp)', fontSize:12, color:'#fff',
          letterSpacing:3, textAlign:'center', marginBottom:4 }}>ARENAHUB</div>
        <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a4a6a',
          textAlign:'center', marginBottom:28, letterSpacing:1 }}>ШИНЭ НУУЦ ҮГ</div>

        {done ? (
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>✓</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:8, color:'#00ff41' }}>
              АМЖИЛТТАЙ СОЛИГДЛОО
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#ff0040', marginBottom:14,
                padding:'10px', border:'1px solid rgba(255,0,64,.3)' }}>{error}</div>
            )}
            {['ШИНЭ НУУЦ ҮГ', 'НУУЦ ҮГ ДАВТАХ'].map((lbl, i) => (
              <div key={i}>
                <label style={{ display:'block', fontFamily:'var(--fp)', fontSize:7,
                  color:'#3a4a6a', marginBottom:6 }}>{lbl}</label>
                <input type="password" value={i===0?pw:pw2}
                  onChange={e => i===0?setPw(e.target.value):setPw2(e.target.value)}
                  placeholder="••••••••"
                  style={{ width:'100%', background:'#070d1a', border:'1px solid #1a2a40',
                    color:'#e0e8f4', fontFamily:'var(--fm)', fontSize:13,
                    padding:'11px 14px', marginBottom:14, boxSizing:'border-box' as const }}/>
              </div>
            ))}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width:'100%', fontFamily:'var(--fp)', fontSize:9, letterSpacing:2,
                padding:'13px', cursor:'pointer', border:'2px solid #00ff41',
                background:'rgba(0,255,65,.06)', color:'#00ff41', marginBottom:12 }}>
              {loading ? '...' : '✓ НУУЦ ҮГ СОЛИХ'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetInner /></Suspense>
}
