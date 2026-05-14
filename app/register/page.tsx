'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const router = useRouter()
  const [form,    setForm]    = useState({ username:'', email:'', password:'', confirm:'' })
  const [loading, setLoading] = useState(false)
  const [gLoad,   setGLoad]   = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  const set = (k: string, v: string) => setForm(f => ({...f, [k]:v}))

  const handleSubmit = async () => {
    setError('')
    if (!form.username || !form.email || !form.password) { setError('Бүх талбарыг бөглөнө үү'); return }
    if (form.password !== form.confirm) { setError('Нууц үг таарахгүй байна'); return }
    if (form.password.length < 6) { setError('Нууц үг хамгийн багадаа 6 тэмдэгт'); return }
    setLoading(true)
    try {
      await register(form.username, form.email, form.password)
      setSuccess('Бүртгэл амжилттай!')
      setTimeout(() => router.push('/dashboard'), 1000)
    } catch (e: unknown) { setError((e as Error).message) }
    finally { setLoading(false) }
  }

  const handleGoogle = async () => {
    setGLoad(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  const S = {
    page:  { minHeight:'100vh', background:'#070d1a', display:'flex', alignItems:'center', justifyContent:'center', padding:20 } as React.CSSProperties,
    box:   { width:'100%', maxWidth:420, background:'#0b1225', border:'1px solid rgba(0,255,65,.15)', padding:36 } as React.CSSProperties,
    label: { display:'block', fontFamily:'var(--fp)', fontSize:7, color:'#3a4a6a', marginBottom:5, letterSpacing:1 } as React.CSSProperties,
    input: { width:'100%', background:'#070d1a', border:'1px solid #1a2a40', color:'#e0e8f4', fontFamily:'var(--fm)', fontSize:13, padding:'10px 13px', marginBottom:14, boxSizing:'border-box' as const },
  }

  return (
    <div style={S.page}>
      <div style={S.box}>
        <Link href="/" style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a4a6a',
          letterSpacing:1, marginBottom:20, display:'block' }}>◀ БУЦАХ</Link>

        <div style={{ fontFamily:'var(--fp)', fontSize:13, color:'#fff',
          letterSpacing:3, textAlign:'center', marginBottom:4 }}>ARENAHUB</div>
        <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a4a6a',
          textAlign:'center', letterSpacing:1, marginBottom:24 }}>ШИНЭ ТОГЛОГЧ</div>

        {/* Google */}
        <button onClick={handleGoogle} disabled={gLoad}
          style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center',
            gap:10, padding:'12px', background:'rgba(255,255,255,.05)',
            border:'1px solid rgba(255,255,255,.2)', color:'#fff', cursor:'pointer',
            marginBottom:16, fontFamily:'var(--fp)', fontSize:8, letterSpacing:1 }}>
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.3 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.6 0-14.2 4.3-17.7 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.5 35.5 27 36 24 36c-5.3 0-9.6-2.7-11.3-7L6 34c3.4 6.4 10.1 10 18 10z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.3-4.3 5.8l6.2 5.2C41 35.5 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          {gLoad ? 'ХОЛБОГДОЖ БАЙНА...' : 'GOOGLE-ОЭР БҮРТГҮҮЛЭХ'}
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:'#1a2a40' }}/>
          <span style={{ fontFamily:'var(--fp)', fontSize:6, color:'#2a3a54' }}>ЭСВЭЛ</span>
          <div style={{ flex:1, height:1, background:'#1a2a40' }}/>
        </div>

        {error   && <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#ff0040', marginBottom:14, padding:'9px 12px', border:'1px solid rgba(255,0,64,.3)', background:'rgba(255,0,64,.06)' }}>{error}</div>}
        {success && <div style={{ fontFamily:'var(--fp)', fontSize:7, color:'#00ff41', marginBottom:14, padding:'9px 12px', border:'1px solid rgba(0,255,65,.3)', background:'rgba(0,255,65,.06)' }}>{success}</div>}

        <label style={S.label}>ХЭРЭГЛЭГЧИЙН НЭР</label>
        <input value={form.username} onChange={e => set('username',e.target.value)}
          placeholder="pixel_warrior" style={S.input}/>

        <label style={S.label}>И-МЭЙЛ</label>
        <input type="email" value={form.email} onChange={e => set('email',e.target.value)}
          placeholder="user@email.com" style={S.input}/>

        <label style={S.label}>НУУЦ ҮГ</label>
        <input type="password" value={form.password} onChange={e => set('password',e.target.value)}
          placeholder="••••••••" style={S.input}/>

        <label style={S.label}>НУУЦ ҮГ ДАВТАХ</label>
        <input type="password" value={form.confirm} onChange={e => set('confirm',e.target.value)}
          placeholder="••••••••" onKeyDown={e => e.key==='Enter' && handleSubmit()}
          style={{...S.input, marginBottom:20}}/>

        <button onClick={handleSubmit} disabled={loading}
          style={{ width:'100%', fontFamily:'var(--fp)', fontSize:9, letterSpacing:2,
            padding:'13px', cursor: loading?'not-allowed':'pointer',
            border:'2px solid #00ff41', background:'rgba(0,255,65,.06)', color:'#00ff41',
            marginBottom:14, opacity: loading?.7:1 }}>
          {loading ? 'БҮРТГЭЖ БАЙНА...' : '+ БҮРТГҮҮЛЭХ'}
        </button>

        <div style={{ textAlign:'center', fontFamily:'var(--fp)', fontSize:7, color:'#3a4a6a' }}>
          Бүртгэлтэй юу?{' '}
          <Link href="/login" style={{ color:'#00e5ff' }}>НЭВТРЭХ</Link>
        </div>
      </div>
    </div>
  )
}
