'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
const PixelModel3D = dynamic(() => import('@/components/ui/Model3D'), { ssr:false, loading:()=><div style={{width:200,height:200}}/> })
import { useAuth } from '@/context/AuthContext'
import PixelIcon from '@/components/ui/PixelIcon'
import CountryFlag from '@/components/ui/CountryFlag'
import CountrySelect from '@/components/ui/CountrySelect'
import { useLang } from '@/context/LanguageContext'

const MnFlag = () => <svg width="18" height="11" viewBox="0 0 30 18" style={{imageRendering:'pixelated',display:'block'}}><rect x="0" y="0" width="10" height="18" fill="#C4272F"/><rect x="10" y="0" width="10" height="18" fill="#015197"/><rect x="20" y="0" width="10" height="18" fill="#C4272F"/><rect x="3" y="1" width="4" height="1" fill="#F9CF02"/><rect x="2" y="2" width="6" height="3" fill="#F9CF02"/><rect x="1" y="6" width="8" height="1" fill="#F9CF02"/><rect x="1" y="8" width="8" height="1" fill="#F9CF02"/><rect x="3" y="9" width="4" height="3" fill="#F9CF02"/><rect x="1" y="13" width="8" height="1" fill="#F9CF02"/><rect x="1" y="15" width="8" height="2" fill="#F9CF02"/></svg>
const EnFlag = () => <svg width="18" height="11" viewBox="0 0 30 18" style={{imageRendering:'pixelated',display:'block'}}><rect x="0" y="0" width="30" height="18" fill="#B22234"/><rect x="0" y="2" width="30" height="2" fill="#fff"/><rect x="0" y="6" width="30" height="2" fill="#fff"/><rect x="0" y="10" width="30" height="2" fill="#fff"/><rect x="0" y="14" width="30" height="2" fill="#fff"/><rect x="0" y="0" width="12" height="10" fill="#3C3B6E"/><rect x="1" y="1" width="2" height="1" fill="#fff"/><rect x="5" y="1" width="2" height="1" fill="#fff"/><rect x="9" y="1" width="2" height="1" fill="#fff"/><rect x="3" y="4" width="2" height="1" fill="#fff"/><rect x="7" y="4" width="2" height="1" fill="#fff"/></svg>

const kf = `
@keyframes pf-in   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes pf-scan { 0%{top:-80px} 100%{top:100%} }
@keyframes pf-ping { 0%{transform:scale(1);opacity:1} 100%{transform:scale(2.2);opacity:0} }
`

const PLAN_CFG = {
  PRO: { col:'#00e5ff', glow:'rgba(0,229,255,0.25)', icon:'pricing' as const },
  VIP: { col:'#ffd700', glow:'rgba(255,215,0,0.25)',  icon:'crown'   as const },
}

export default function ProfilePage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuth()
  const { t, lang, setLang } = useLang()
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [editing,       setEditing]       = useState(false)
  const [username,      setUsername]      = useState('')
  const [bio,           setBio]           = useState('')
  const [avatarUrl,     setAvatarUrl]     = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [country,       setCountry]       = useState('')
  const [saving,        setSaving]        = useState(false)
  const [msg,           setMsg]           = useState('')

  useEffect(() => { if (!loading && !isAuthenticated) router.push('/') }, [loading, isAuthenticated])
  useEffect(() => {
    if (user) {
      setUsername(user.username || '')
      setBio((user as any).bio || '')
      setAvatarUrl(user.avatarUrl || '')
      setAvatarPreview(user.avatarUrl || '')
      setCountry(user.country || '')
    }
  }, [user])

  const plan    = ((user?.subscription?.plan ?? 'FREE') as 'FREE'|'PRO'|'VIP')
  const endDate = user?.subscription?.endDate ? new Date(user.subscription.endDate) : null
  const planCfg = plan !== 'FREE' ? PLAN_CFG[plan] : null

  if (loading && !user) return null

  const level  = user?.level || 1
  const xp     = user?.xp || 0
  const xpNext = level * 200
  const pct    = Math.min(100, Math.round((xp % xpNext) / xpNext * 100))
  const avatar = avatarPreview || user?.avatarUrl

  const daysLeft = endDate ? Math.ceil((endDate.getTime() - Date.now()) / 86400000) : null
  const expired  = daysLeft !== null && daysLeft <= 0
  const urgCol   = daysLeft !== null && daysLeft <= 7 ? '#ff2d55' : planCfg?.col ?? '#2a3a54'

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setMsg('2MB-аас бага файл оруулна уу'); return }
    const reader = new FileReader()
    reader.onload = () => { const url = reader.result as string; setAvatarPreview(url); setAvatarUrl(url) }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    setSaving(true); setMsg('')
    try {
      const token = localStorage.getItem('arenahub_token')
      const res = await fetch('/api/profile', { method:'PATCH', headers:{'Content-Type':'application/json', Authorization:`Bearer ${token}`}, body:JSON.stringify({ username, bio, avatarUrl, country }) })
      const data = await res.json()
      if (data.ok) { setMsg('✓ Хадгалагдлаа'); setEditing(false); await refreshUser() }
      else setMsg(data.error || 'Алдаа гарлаа')
    } catch { setMsg('Сүлжээний алдаа') }
    finally { setSaving(false) }
  }

  const planCol = plan === 'VIP' ? '#ffd700' : plan === 'PRO' ? '#00e5ff' : '#2a3a54'
  const subDesc = plan === 'FREE' ? 'FREE'
    : expired    ? '⚠ Дууссан'
    : daysLeft !== null && daysLeft <= 7 ? `⚠ ${daysLeft} өдөр үлдсэн`
    : endDate    ? `${endDate.toLocaleDateString('mn-MN')} хүртэл`
    : plan

  return (
    <>
      <style>{kf}</style>
      <main style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', position:'relative' }}>

        {/* scan line */}
        <div style={{ position:'fixed', left:0, right:0, height:80, pointerEvents:'none', zIndex:0,
          background:'linear-gradient(180deg,transparent,rgba(191,90,242,.01),transparent)',
          animation:'pf-scan 9s linear infinite' }}/>

        {/* HUD TOP BAR */}
        <div style={{ display:'flex', alignItems:'stretch', borderBottom:'2px solid #0d1a28', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', flexShrink:0, position:'relative', zIndex:2, boxShadow:'0 2px 20px rgba(0,0,0,.5)' }}>
          <div style={{ position:'absolute', top:0, left:0, right:0, height:1, background:'linear-gradient(90deg,transparent,#bf5af244,transparent)' }}/>

          <div style={{ padding:'16px 28px', borderRight:'1px solid #0d1a28', flexShrink:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:6 }}>
            <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:4 }}>ARENAHUB</div>
            <div style={{ fontFamily:'var(--fp)', fontSize:10, color:'#bf5af2', letterSpacing:3, textShadow:'0 0 12px rgba(191,90,242,.4)' }}>PLAYER</div>
          </div>

          <div style={{ flex:1, padding:'0 28px', display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ fontFamily:'var(--fp)', fontSize:8, color:'#1a3050' }}>▸</span>
              <span style={{ fontFamily:'var(--fp)', fontSize:10, color:'#bf5af2', letterSpacing:3, textShadow:'0 0 10px rgba(191,90,242,.3)' }}>PROFILE</span>
            </div>
            <div style={{ width:1, height:24, background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)' }}/>
            <span style={{ fontFamily:'var(--fp)', fontSize:7, color:'#3a5070', letterSpacing:1 }}>{user?.username?.toUpperCase()}</span>
            {planCfg && (
              <span style={{ fontFamily:'var(--fp)', fontSize:6, color: expired ? '#ff2d55' : planCfg.col, border:`1px solid ${expired ? '#ff2d5544' : planCfg.col + '44'}`, padding:'3px 10px', letterSpacing:2, background:`${expired ? '#ff2d55' : planCfg.col}10` }}>
                <PixelIcon name={planCfg.icon} size={10} col={expired ? '#ff2d55' : planCfg.col}/> {expired ? 'ДУУССАН' : plan}
              </span>
            )}
          </div>

          {/* MN/EN switcher */}
          <div style={{ padding:'0 12px', borderLeft:'1px solid #0d1a28', display:'flex', alignItems:'center', gap:4, flexShrink:0 }}>
            {(['mn','en'] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 8px', border:`1px solid ${lang===l?'rgba(191,90,242,.5)':'rgba(255,255,255,.07)'}`, background: lang===l?'rgba(191,90,242,.12)':'transparent', cursor:'pointer', transition:'all .18s', borderRadius:1 }}>
                {l==='mn' ? <MnFlag/> : <EnFlag/>}
                <span style={{ fontFamily:'var(--fp)', fontSize:5, color: lang===l?'#bf5af2':'#2a4060', letterSpacing:1 }}>{l==='mn'?'МОН':'ENG'}</span>
              </button>
            ))}
          </div>

          <div style={{ padding:'16px 28px', borderLeft:'1px solid #0d1a28', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} style={{ fontFamily:'var(--fp)', fontSize:6, letterSpacing:2, padding:'8px 20px', cursor:'pointer', background:'transparent', color:'#00ff41', border:'1px solid #00ff4155', transition:'all .2s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,255,65,.1)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00ff41' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#00ff4155' }}>
                  {saving ? t('prof_saving') : t('prof_save')}
                </button>
                <button onClick={() => { setEditing(false); setMsg(''); setAvatarPreview(user?.avatarUrl || '') }} style={{ fontFamily:'var(--fp)', fontSize:6, letterSpacing:2, padding:'8px 16px', cursor:'pointer', background:'transparent', color:'#3a5070', border:'1px solid #0d1a28', transition:'all .2s' }}>
                  {t('prof_cancel')}
                </button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} style={{ fontFamily:'var(--fp)', fontSize:6, letterSpacing:2, padding:'8px 20px', cursor:'pointer', background:'transparent', color:'#bf5af2', border:'1px solid #bf5af233', transition:'all .2s' }} title={t('prof_edit')}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(191,90,242,.08)'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#bf5af2' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = '#bf5af233' }}>
                {t('prof_edit')}
              </button>
            )}
            {msg && <span style={{ fontFamily:'var(--fp)', fontSize:5, color: msg.startsWith('✓') ? '#00ff41' : '#ff2d55' }}>{msg}</span>}
          </div>
        </div>

        {/* HERO PANEL */}
        <div className="pf-hero" style={{ display:'flex', minHeight:320, position:'relative', overflow:'hidden', flexShrink:0, zIndex:2 }}>
          <div style={{ position:'absolute', inset:0, background:'linear-gradient(135deg,#020609 55%,#070514 100%)' }}/>
          <div style={{ position:'absolute', right:0, top:0, width:'45%', height:'100%', background:'radial-gradient(ellipse at 75% 50%,rgba(191,90,242,.06) 0%,transparent 65%)' }}/>

          {/* LEFT — avatar + info */}
          <div className="pf-hero-left" style={{ flex:1, padding:'36px 40px', display:'flex', flexDirection:'column', justifyContent:'center', gap:16, position:'relative', zIndex:2, animation:'pf-in .35s ease' }}>

            {/* Avatar + username */}
            <div className="pf-avatar-row" style={{ display:'flex', alignItems:'center', gap:20 }}>
              <div style={{ position:'relative', flexShrink:0, paddingBottom: editing ? 20 : 0 }}>
                <div style={{ width:80, height:80, border:`2px solid ${avatar ? '#bf5af2' : '#0d1a28'}`, overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', boxShadow: avatar ? '0 0 20px rgba(191,90,242,.2)' : 'none' }}>
                  {avatar
                    ? <img src={avatar} alt="avatar" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
                    : <div style={{ fontFamily:'var(--fp)', fontSize:20, color:'#bf5af2' }}>{user?.username?.slice(0,2).toUpperCase()}</div>
                  }
                </div>
                {editing && (
                  <button onClick={() => fileRef.current?.click()}
                    style={{ position:'absolute', bottom:-14, left:'50%', transform:'translateX(-50%)', whiteSpace:'nowrap', padding:'5px 12px', background:'#bf5af2', border:'none', cursor:'pointer', fontFamily:'var(--fp)', fontSize:5, color:'#020609', letterSpacing:1, boxShadow:'0 0 12px rgba(191,90,242,.5)', transition:'all .15s' }}
                    onMouseEnter={e=>(e.currentTarget.style.background='#d070ff')}
                    onMouseLeave={e=>(e.currentTarget.style.background='#bf5af2')}>
                    ✎ ЗУРАГ СОЛИХ
                  </button>
                )}
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile}/>
                {/* online indicator */}
                <div style={{ position:'relative', bottom:-2, right:-2 }}>
                  <div style={{ position:'absolute', bottom:6, right:-10, width:8, height:8, background:'#00ff41', borderRadius:'50%', border:'2px solid #020609' }}/>
                  <div style={{ position:'absolute', bottom:6, right:-10, width:8, height:8, background:'#00ff41', borderRadius:'50%', animation:'pf-ping 1.4s ease-out infinite' }}/>
                </div>
              </div>

              <div>
                <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:4, marginBottom:6 }}>ARENAHUB · PLAYER CARD</div>
                {editing
                  ? <input value={username} onChange={e => setUsername(e.target.value)} maxLength={20} style={{ fontFamily:'var(--fp)', fontSize:20, color:'#c0d0e0', background:'transparent', border:'none', borderBottom:'1px solid #bf5af2', outline:'none', letterSpacing:2, width:220, padding:'2px 0' }}/>
                  : (
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ fontFamily:'var(--fp)', fontSize:20, color:'#c0d0e0', letterSpacing:2, lineHeight:1 }}>{user?.username}</div>
                      {country && <CountryFlag country={country} size={32}/>}
                    </div>
                  )
                }
                {/* Country selector in edit mode */}
                {editing && (
                  <div style={{ marginTop:10, maxWidth:320 }}>
                    <CountrySelect value={country} onChange={setCountry} accentColor="#bf5af2"/>
                  </div>
                )}
                <div style={{ display:'flex', gap:6, marginTop:10, flexWrap:'wrap', alignItems:'center' }}>
                  {[
                    { t:`⚡ LVL ${level}`, col:'#ffd700' },
                    { t: user?.role || 'STUDENT', col:'#00e5ff' },
                    { t:'PIXEL CODER', col:'#bf5af2' },
                  ].map(({ t, col }) => (
                    <span key={t} style={{ fontFamily:'var(--fp)', fontSize:5, color:col, border:`1px solid ${col}33`, padding:'2px 8px' }}>{t}</span>
                  ))}
                  {user?.id && (
                    <button
                      title="Copy ID"
                      onClick={() => { navigator.clipboard.writeText(user.id); setMsg('✓ ID хуулагдлаа') }}
                      style={{ fontFamily:'var(--fm)', fontSize:10, color:'#1a3050', border:'1px solid #0d1a28', padding:'2px 8px', background:'transparent', cursor:'pointer', letterSpacing:.5, transition:'all .15s' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color='#3a5070'; (e.currentTarget as HTMLButtonElement).style.borderColor='#1a3050' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#1a3050'; (e.currentTarget as HTMLButtonElement).style.borderColor='#0d1a28' }}>
                      ID: {user.id.slice(0,8)}…
                    </button>
                  )}
                  {planCfg && (
                    <div style={{ padding:'4px 12px', background:`${planCfg.col}10`, border:`1px solid ${expired ? '#ff2d5566' : planCfg.col + '55'}`, boxShadow:`0 0 12px ${expired ? 'rgba(255,45,85,.15)' : planCfg.glow}` }}>
                      <div style={{ fontFamily:'var(--fp)', fontSize:4, color:planCfg.col, letterSpacing:2, opacity:.7, marginBottom:2 }}>SUBSCRIPTION</div>
                      <div style={{ fontFamily:'var(--fp)', fontSize:8, color: expired ? '#ff2d55' : planCfg.col, letterSpacing:2 }}>{expired ? 'ДУУССАН' : plan}</div>
                      {endDate && <div style={{ fontFamily:'var(--fp)', fontSize:4, color:urgCol, marginTop:3, letterSpacing:1 }}>{expired ? `⚠ ${endDate.toLocaleDateString('mn-MN')} дууссан` : daysLeft !== null && daysLeft <= 7 ? `⚠ ${daysLeft} өдөр үлдсэн` : `${endDate.toLocaleDateString('mn-MN')} хүртэл`}</div>}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bio */}
            {editing
              ? <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={200} placeholder="Өөрийгөө танилцуулна уу..." style={{ fontFamily:'var(--fm)', fontSize:12, color:'#5a7a9a', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', border:'1px solid #0d1a28', outline:'none', padding:'10px 12px', resize:'none', height:60, lineHeight:1.7, maxWidth:440 }}/>
              : <p style={{ fontFamily:'var(--fm)', fontSize:12, color:'#3a5a78', lineHeight:1.9, maxWidth:440, margin:0 }}>{(user as any)?.bio || 'ArenaHub-д кодын ур чадварыг суралцаж байгаа тоглогч.'}</p>
            }

            {/* XP bar */}
            <div style={{ maxWidth:380 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', marginBottom:8 }}>
                <span style={{ color:'#00ff4155' }}>XP PROGRESS → LVL {level + 1}</span>
                <span style={{ color:'#00ff41' }}>{(xp % xpNext).toLocaleString()} / {xpNext.toLocaleString()}</span>
              </div>
              <div style={{ height:6, background:'rgba(12,18,34,.62)',  backdropFilter:'blur(16px)', border:'1px solid #0d1a28', overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#00ff41,#00e5ff)', boxShadow:'0 0 10px rgba(0,255,65,.7)', transition:'width 1.2s ease', position:'relative' }}>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 60%,rgba(255,255,255,.15) 80%,transparent 100%)' }}/>
                </div>
              </div>
              <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', marginTop:5 }}>{(xpNext - xp % xpNext).toLocaleString()} XP → LVL {level + 1}</div>
            </div>
          </div>

          {/* RIGHT — 3D model */}
          <div className="pf-model-panel" style={{ width:320, flexShrink:0, display:'flex', alignItems:'flex-end', justifyContent:'center', position:'relative', zIndex:2 }}>
            <PixelModel3D model="hero" theme="golden" size={320} />
          </div>
        </div>

        {/* STAT STRIP */}
        <div className="pf-stat-strip" style={{ borderTop:'1px solid #0d1a28', borderBottom:'1px solid #0d1a28', flexShrink:0, background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', position:'relative', zIndex:2 }}>
          {([
            [t('prof_level'), String(level),           '#00e5ff', t('prof_current_lvl')],
            [t('prof_xp'),    xp.toLocaleString(),     '#00ff41', t('prof_total_xp')],
            [t('prof_coins'), String(user?.coins ?? 0),'#ffd700', t('prof_balance')],
            [t('prof_role'),  user?.role ?? '–',       '#bf5af2', t('prof_access')],
            [t('prof_plan'),  plan === 'FREE' ? t('prof_sub_free') : expired ? t('prof_sub_expired') : plan, planCol, subDesc],
          ] as const).map(([l, v, c, s]) => (
            <div key={l} style={{ padding:'18px 24px', borderRight:'1px solid #0d1a28', position:'relative', background: l === 'ПЛАН' && plan !== 'FREE' ? `${planCol}08` : 'transparent' }}>
              <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${c}44,transparent)` }}/>
              <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:3, marginBottom:8 }}>{l}</div>
              <div style={{ fontFamily:'var(--fp)', fontSize:13, color: l === 'ПЛАН' && expired ? '#ff2d55' : c, textShadow:`0 0 10px ${c}55`, marginBottom:4 }}>{v}</div>
              <div style={{ fontFamily:'var(--fm)', fontSize:10, color: l === 'ПЛАН' && daysLeft !== null && daysLeft <= 7 ? '#ff2d55' : '#2a3a54' }}>{s}</div>
            </div>
          ))}
          {/* Country flag cell */}
          <div style={{ padding:'18px 24px', position:'relative' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,#3a5a7a44,transparent)' }}/>
            <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#1a3050', letterSpacing:3, marginBottom:10 }}>{t('prof_country')}</div>
            {country
              ? <CountryFlag country={country} size={36} style={{ marginBottom:4 }}/>
              : <div style={{ fontFamily:'var(--fp)', fontSize:8, color:'#1a3050' }}>—</div>
            }
            <div style={{ fontFamily:'var(--fm)', fontSize:10, color:'#2a3a54', marginTop:4 }}>{country || '—'}</div>
          </div>
        </div>

        {/* BOTTOM PANELS */}
        <div style={{ display:'flex', gap:16, padding:'24px 40px 36px', position:'relative', zIndex:2 }}>

          {/* Recent Activity */}
          <div style={{ flex:1, border:'1px solid #0d1a28', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #0d1a28', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:3, height:16, background:'#00ff41', boxShadow:'0 0 6px #00ff41' }}/>
              <div style={{ fontFamily:'var(--fp)', fontSize:6, color:'#2a4060', letterSpacing:3 }}>RECENT ACTIVITY</div>
            </div>
            {['HTML суурь бүтэц', 'CSS game area', 'JS Variables', 'JS Functions'].map((t, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 20px', borderBottom:'1px solid #060e1a', background: i === 0 ? 'rgba(0,255,65,.02)' : 'transparent' }}>
                <div style={{ width:4, flexShrink:0, height:4, background:'#00ff41', boxShadow:'0 0 4px #00ff41' }}/>
                <div style={{ fontFamily:'var(--fm)', fontSize:12, color:'#3a5a78', flex:1 }}>{t}</div>
                <div style={{ fontFamily:'var(--fp)', fontSize:5, color:'#00ff41' }}>✓ DONE</div>
              </div>
            ))}
          </div>

          {/* Achievements */}
          <div style={{ flex:1, border:'1px solid #0d1a28', background:'rgba(8,12,22,.96)', backdropFilter:'blur(20px)', overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', borderBottom:'1px solid #0d1a28', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:3, height:16, background:'#ffd700', boxShadow:'0 0 6px #ffd700' }}/>
              <div style={{ fontFamily:'var(--fp)', fontSize:6, color:'#2a4060', letterSpacing:3 }}>ACHIEVEMENTS</div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1, background:'rgba(13,20,38,.65)', backdropFilter:'blur(16px)' }}>
              {([
                ['trophy',  'First Task',  true,  '#00ff41'],
                ['sword',   'Code Quest',  true,  '#00e5ff'],
                ['crown',   'Top 10',      false, '#ffd700'],
                ['star',    'Deployed',    false, '#bf5af2'],
              ] as [string,string,boolean,string][]).map(([ico, label, done, col], i) => (
                <div key={i} style={{ padding:'16px 18px', background: done ? `${col}05` : 'rgba(8,12,22,.96)', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:36, height:36, flexShrink:0, background:`${col}${done ? '14' : '08'}`, border:`1px solid ${col}${done ? '33' : '14'}`, display:'flex', alignItems:'center', justifyContent:'center', opacity: done ? 1 : 0.3 }}>
                    <PixelIcon name={ico as any} size={20} col={String(col)}/>
                  </div>
                  <div>
                    <div style={{ fontFamily:'var(--fp)', fontSize:5, color: done ? String(col) : '#1a3050', letterSpacing:1 }}>{String(label)}</div>
                    <div style={{ fontFamily:'var(--fp)', fontSize:4, color: done ? `${col}66` : '#0d1a28', marginTop:3 }}>{done ? '✓ UNLOCKED' : '· LOCKED'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>
    </>
  )
}