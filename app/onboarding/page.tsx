'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import CountrySelect from '@/components/ui/CountrySelect'


const FP = (sz:number, col='#c0d8f0', ls=0): React.CSSProperties => ({ fontFamily:'var(--fp)', fontSize:sz, color:col, letterSpacing:ls })
const FM = (sz:number, col='#8aa0b8'): React.CSSProperties => ({ fontFamily:'var(--fm)', fontSize:sz, color:col })

type Check = 'idle'|'checking'|'ok'|'taken'|'invalid'

// Compress image to ≤256×256 JPEG via canvas
function compressImage(file: File): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = ev => {
      const img = new Image()
      img.onload = () => {
        const MAX = 256
        let w = img.width, h = img.height
        if (w > h) { h = Math.round(h * MAX / w); w = MAX }
        else       { w = Math.round(w * MAX / h); h = MAX }
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = ev.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

export default function OnboardingPage() {
  const { data: session, status } = useSession()
  const router    = useRouter()
  const fileRef   = useRef<HTMLInputElement>(null)

  const [username,  setUsername]  = useState('')
  const [age,       setAge]       = useState('')
  const [country,   setCountry]   = useState('')
  const [avatar,    setAvatar]    = useState<string>('')   // preview or compressed data URL
  const [usrCheck,  setUsrCheck]  = useState<Check>('idle')
  const [busy,      setBusy]      = useState(false)
  const [error,     setError]     = useState('')
  const [step,      setStep]      = useState(0)

  const checkTimer = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated') { router.replace('/login'); return }
    if (session?.user?.onboardingComplete) { router.replace('/dashboard'); return }
    if (session?.user?.username) setUsername(session.user.username)
    if (session?.user?.image)   setAvatar(session.user.image)
    setStep(1)
  }, [status, session])

  // Debounced username check
  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current)
    if (!username || username.length < 3) { setUsrCheck('idle'); return }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) { setUsrCheck('invalid'); return }
    setUsrCheck('checking')
    checkTimer.current = setTimeout(async () => {
      const r = await fetch(`/api/onboarding?username=${encodeURIComponent(username)}`)
      const d = await r.json()
      if (d.reason === 'invalid') setUsrCheck('invalid')
      else setUsrCheck(d.available ? 'ok' : 'taken')
    }, 500)
  }, [username])

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) { setError('Зураг 10MB-аас бага байна'); return }
    setError('')
    const compressed = await compressImage(file)
    setAvatar(compressed)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (usrCheck !== 'ok') { setError('Хэрэглэгчийн нэрийг шалгана уу'); return }
    if (!age || parseInt(age) < 13 || parseInt(age) > 100) { setError('Нас 13-100 хооронд байна'); return }
    if (!country) { setError('Улсаа сонгоно уу'); return }
    setBusy(true)
    try {
      const res  = await fetch('/api/onboarding', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          username,
          age:      parseInt(age),
          country,
          avatarUrl: avatar || undefined,
        }),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (!res.ok) { setError(data.error || `Алдаа гарлаа (${res.status})`); setBusy(false); return }
      setStep(2)
      setTimeout(() => { window.location.href = '/dashboard' }, 1200)
    } catch (err) {
      console.error('onboarding submit error:', err)
      setError('Серверт холбогдоход алдаа гарлаа. Дахин оролдоно уу.')
      setBusy(false)
    }
  }

  const usrColor = usrCheck === 'ok' ? '#00ff41' : usrCheck === 'taken' || usrCheck === 'invalid' ? '#ff2d55' : '#4a6a8a'
  const usrHint  = { idle:'', checking:'Шалгаж байна...', ok:'✓ Боломжтой', taken:'✗ Аль хэдийн бүртгэлтэй', invalid:'✗ 3-20 тэмдэгт (a-z 0-9 _)' }

  if (step === 0) return (
    <div style={{ minHeight:'100vh', background:'#070d1a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={FP(10,'#00e5ff',3)}>АЧААЛЛАЖ БАЙНА...</div>
    </div>
  )

  if (step === 2) return (
    <div style={{ minHeight:'100vh', background:'#070d1a', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:20 }}>
      <div style={{ fontSize:64 }}>🎉</div>
      <div style={FP(18,'#00ff41',2)}>ТАВТАЙ МОРИЛ!</div>
      <div style={FM(14,'#5a7a9a')}>Dashboard руу шилжиж байна...</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#070d1a',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>

      <div style={{ position:'fixed', inset:0, backgroundImage:'linear-gradient(rgba(0,229,255,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.03) 1px,transparent 1px)', backgroundSize:'40px 40px', pointerEvents:'none', zIndex:0 }}/>

      <div style={{ width:'100%', maxWidth:440, position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontFamily:'var(--fp)', fontSize:22, color:'#00e5ff', letterSpacing:6, marginBottom:8, textShadow:'0 0 20px rgba(0,229,255,.4)' }}>
            ARENA<span style={{ color:'#ffe600' }}>HUB</span>
          </div>
          <div style={FP(9,'#e0e8f4',2)}>АНХНЫ ТОХИРГОО</div>
          <div style={{ ...FM(12,'#4a6a8a'), marginTop:8 }}>
            Тавтай морил{session?.user?.name ? `, ${session.user.name}` : ''}! Бүртгэлийг дуусгана уу.
          </div>
        </div>

        {/* ── Avatar picker ── */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:28 }}>
          <div style={{ position:'relative', cursor:'pointer' }} onClick={() => fileRef.current?.click()}>
            {/* Avatar image */}
            <div style={{ width:88, height:88, border:'2px solid #00e5ff44', overflow:'hidden', background:'#0b1225', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {avatar ? (
                <img src={avatar} alt="avatar" width={88} height={88} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
              ) : (
                <div style={FP(28,'#2a4a6a')}>?</div>
              )}
            </div>

            {/* Edit overlay */}
            <div style={{ position:'absolute', inset:0, background:'rgba(0,229,255,.12)', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity .2s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity='1')}
              onMouseLeave={e => (e.currentTarget.style.opacity='0')}>
              <div style={FP(8,'#00e5ff')}>✎</div>
            </div>

            {/* Badge */}
            <div style={{ position:'absolute', bottom:-10, left:'50%', transform:'translateX(-50%)', background:'#00e5ff', padding:'3px 10px', whiteSpace:'nowrap', ...FP(5,'#070d1a') }}>
              ЗУРАГ СОЛИХ
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display:'none' }}
          onChange={onFileChange}
        />

        {/* Form */}
        <form onSubmit={handleSubmit}
          style={{ background:'#0b1225', border:'1px solid rgba(0,229,255,.15)', padding:'36px 32px' }}>

          {/* Username */}
          <div style={{ marginBottom:22 }}>
            <label style={{ ...FP(7,'#7a9ab8',2), display:'block', marginBottom:8 }}>ХЭРЭГЛЭГЧИЙН НЭР *</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g,'').slice(0,20))}
              placeholder="gamer_123"
              style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,.04)',
                border:`1px solid ${usrCheck==='ok'?'#00ff41':usrCheck==='taken'||usrCheck==='invalid'?'#ff2d55':'rgba(255,255,255,.1)'}`,
                color:'#e0e8f4', ...FM(14,'#e0e8f4'), outline:'none', boxSizing:'border-box', transition:'border-color .2s' }}
            />
            {username.length >= 3 && (
              <div style={{ ...FM(11,usrColor), marginTop:6 }}>{usrHint[usrCheck]}</div>
            )}
            <div style={{ ...FM(11,'#3a4a6a'), marginTop:4 }}>3-20 тэмдэгт · a-z 0-9 _ зөвшөөрнө</div>
          </div>

          {/* Age */}
          <div style={{ marginBottom:22 }}>
            <label style={{ ...FP(7,'#7a9ab8',2), display:'block', marginBottom:8 }}>НАС *</label>
            <input
              type="number" min="13" max="100"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="18"
              style={{ width:'100%', padding:'12px 14px', background:'rgba(255,255,255,.04)',
                border:'1px solid rgba(255,255,255,.1)', color:'#e0e8f4',
                ...FM(14,'#e0e8f4'), outline:'none', boxSizing:'border-box' }}
            />
          </div>

          {/* Country */}
          <div style={{ marginBottom:28 }}>
            <label style={{ ...FP(7,'#7a9ab8',2), display:'block', marginBottom:8 }}>УЛС *</label>
            <CountrySelect value={country} onChange={setCountry} accentColor="#00e5ff"/>
          </div>

          {error && (
            <div style={{ ...FP(7,'#ff2d55'), padding:'10px 14px',
              border:'1px solid rgba(255,45,85,.3)', background:'rgba(255,45,85,.06)', marginBottom:16 }}>
              ⚠ {error}
            </div>
          )}

          <button type="submit" disabled={busy || usrCheck !== 'ok'}
            style={{ width:'100%', padding:'15px',
              ...FP(10, busy||usrCheck!=='ok'?'#4a5a6a':'#070d1a', 2),
              background: busy||usrCheck!=='ok' ? '#1a2035' : '#00e5ff',
              border:'none', cursor:busy||usrCheck!=='ok'?'not-allowed':'pointer',
              transition:'all .2s', opacity:busy?.7:1 }}
            onMouseEnter={e => !busy && usrCheck==='ok' && (e.currentTarget.style.background='#00c4d9')}
            onMouseLeave={e => !busy && usrCheck==='ok' && (e.currentTarget.style.background='#00e5ff')}>
            {busy ? 'ХАДГАЛАЖ БАЙНА...' : '✓ ДУУСГАХ'}
          </button>
        </form>
      </div>
    </div>
  )
}