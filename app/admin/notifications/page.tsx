'use client'
import { useState } from 'react'

const fp = { fontFamily: 'var(--fp)' } as const
const fm = { fontFamily: 'var(--fm)' } as const

const tok = () => typeof window !== 'undefined' ? localStorage.getItem('arenahub_token') || '' : ''
const authH = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${tok()}` })

const TARGETS = [
  { val: 'ALL',    label: 'БҮГД',        desc: 'Бүх хэрэглэгч' },
  { val: 'PRO',    label: 'PRO / VIP',   desc: 'Төлбөртэй эрхтэй' },
  { val: 'ACTIVE', label: 'ИДЭВХТЭЙ',   desc: 'Сүүлийн 7 хоногт нэвтэрсэн' },
  { val: 'NEW',    label: 'ШИНЭ',        desc: 'Сүүлийн 7 хоногт бүртгэлтэй' },
]

const TYPES = ['info', 'success', 'warning', 'error']

function Flash({ msg, col = 'var(--cyan)' }: { msg: string; col?: string }) {
  if (!msg) return null
  return <div style={{ padding: '10px 16px', background: `${col}11`, border: `1px solid ${col}33`, ...fp, fontSize: 7, color: col, marginBottom: 16 }}>{msg}</div>
}

function Btn({ label, col = 'var(--cyan)', onClick, size = 'sm', disabled = false }:
  { label: string; col?: string; onClick?: () => void; size?: 'sm' | 'md'; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ ...fp, fontSize: 6, letterSpacing: 1, padding: size === 'sm' ? '5px 10px' : '9px 22px', cursor: disabled ? 'not-allowed' : 'pointer', background: 'transparent', color: disabled ? 'var(--dim)' : col, border: `1px solid ${disabled ? 'var(--dim)' : col + '55'}`, transition: 'all .15s', opacity: disabled ? 0.45 : 1, whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = `${col}18`; (e.currentTarget as HTMLButtonElement).style.borderColor = col } }}
      onMouseLeave={e => { if (!disabled) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.borderColor = `${col}55` } }}>
      {label}
    </button>
  )
}

function Field({ label, value, onChange, placeholder, type = 'text', col = 'var(--cyan)' }:
  { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; col?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 5, letterSpacing: 1 }}>{label}</div>
      {type === 'textarea' ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={4}
          style={{ width: '100%', padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = col}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{ width: '100%', padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--dim)', color: 'var(--text)', ...fm, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.currentTarget.style.borderColor = col}
          onBlur={e => e.currentTarget.style.borderColor = 'var(--dim)'} />
      )}
    </div>
  )
}

export default function AdminNotificationsPage() {
  const [title, setTitle]     = useState('')
  const [message, setMessage] = useState('')
  const [target, setTarget]   = useState('ALL')
  const [type, setType]       = useState('info')
  const [sending, setSending] = useState(false)
  const [flash, setFlash]     = useState('')
  const [flashCol, setFlashCol] = useState('var(--cyan)')
  const [history, setHistory] = useState<{ title: string; target: string; sent: number; time: string }[]>([])

  const notify = (msg: string, col = 'var(--cyan)') => {
    setFlash(msg); setFlashCol(col)
    setTimeout(() => setFlash(''), 4000)
  }

  const typeCol = (t: string) =>
    t === 'success' ? 'var(--green)' : t === 'warning' ? 'var(--yellow)' : t === 'error' ? 'var(--red)' : 'var(--cyan)'

  const send = async () => {
    if (!title.trim() || !message.trim()) { notify('Title болон message шаардлагатай', 'var(--red)'); return }
    setSending(true)
    try {
      const r = await fetch('/api/admin/announce', {
        method: 'POST', headers: authH(),
        body: JSON.stringify({ title, message, target, type }),
      })
      const d = await r.json()
      if (r.ok) {
        notify(`✓ ${d.sent} хэрэглэгчид илгээгдлээ`, 'var(--green)')
        setHistory(h => [{ title, target, sent: d.sent, time: new Date().toLocaleTimeString('mn-MN') }, ...h.slice(0, 9)])
        setTitle(''); setMessage('')
      } else {
        notify(d.error ?? 'Алдаа гарлаа', 'var(--red)')
      }
    } finally { setSending(false) }
  }

  return (
    <div style={{ padding: '32px 40px', minHeight: '100%' }}>
      <div style={{ marginBottom: 26 }}>
        <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', letterSpacing: 4, marginBottom: 6 }}>ADMIN · NOTIFICATIONS</div>
        <h1 style={{ ...fp, fontSize: 13, color: 'var(--text)', letterSpacing: 2, margin: 0 }}>
          BULK NOTIFICATIONS <span style={{ fontSize: 8, color: 'var(--red)' }}>◉</span>
        </h1>
      </div>

      <div style={{ display: 'flex', gap: 28 }}>
        {/* Compose */}
        <div style={{ flex: 1.4, background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '24px 26px' }}>
          <div style={{ ...fp, fontSize: 7, color: 'var(--cyan)', letterSpacing: 2, marginBottom: 20 }}>МЭДЭГДЭЛ БИЧИХ</div>

          <Flash msg={flash} col={flashCol} />

          <Field label='ГАРЧИГ' value={title} onChange={setTitle} placeholder='Мэдэгдлийн гарчиг...' col='var(--cyan)' />
          <Field label='АГУУЛГА' value={message} onChange={setMessage} placeholder='Дэлгэрэнгүй мессеж...' type='textarea' col='var(--cyan)' />

          {/* Target */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 8, letterSpacing: 1 }}>ХҮЛЭЭН АВАГЧ</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {TARGETS.map(t => (
                <button key={t.val} onClick={() => setTarget(t.val)}
                  style={{ ...fp, fontSize: 6, padding: '7px 14px', cursor: 'pointer', background: target === t.val ? 'var(--cyan)18' : 'transparent', color: target === t.val ? 'var(--cyan)' : 'var(--dim2)', border: `1px solid ${target === t.val ? 'var(--cyan)' : 'var(--dim)'}`, transition: 'all .15s' }}>
                  {t.label}
                  <span style={{ display: 'block', fontSize: 5, color: 'var(--dim2)', marginTop: 2 }}>{t.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginBottom: 8, letterSpacing: 1 }}>ТӨРӨЛ</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {TYPES.map(t => (
                <button key={t} onClick={() => setType(t)}
                  style={{ ...fp, fontSize: 6, padding: '6px 12px', cursor: 'pointer', background: type === t ? `${typeCol(t)}18` : 'transparent', color: type === t ? typeCol(t) : 'var(--dim2)', border: `1px solid ${type === t ? typeCol(t) : 'var(--dim)'}`, transition: 'all .15s' }}>
                  {t.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <Btn
            label={sending ? 'ИЛГЭЭЖ БАЙНА...' : '▶ ИЛГЭЭХ'}
            col='var(--cyan)'
            onClick={send}
            disabled={sending}
            size='md'
          />
        </div>

        {/* History */}
        <div style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--dim)', padding: '24px 26px' }}>
          <div style={{ ...fp, fontSize: 7, color: 'var(--dim2)', letterSpacing: 2, marginBottom: 20 }}>ИЛГЭЭСЭН ТҮҮХ</div>
          {history.length === 0 ? (
            <div style={{ ...fm, fontSize: 12, color: 'var(--dim2)' }}>Энэ session-д илгээгдээгүй</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {history.map((h, i) => (
                <div key={i} style={{ padding: '10px 14px', background: 'var(--bg)', border: '1px solid var(--dim)' }}>
                  <div style={{ ...fp, fontSize: 7, color: 'var(--text)', marginBottom: 4 }}>{h.title}</div>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ ...fp, fontSize: 5, color: 'var(--cyan)', border: '1px solid var(--cyan)44', padding: '1px 6px' }}>{h.target}</span>
                    <span style={{ ...fp, fontSize: 5, color: 'var(--green)' }}>✓ {h.sent} хүн</span>
                    <span style={{ ...fp, fontSize: 5, color: 'var(--dim2)', marginLeft: 'auto' }}>{h.time}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Info panel */}
          <div style={{ marginTop: 24, padding: '14px', background: 'var(--bg)', border: '1px solid var(--dim)' }}>
            <div style={{ ...fp, fontSize: 6, color: 'var(--yellow)', marginBottom: 10 }}>TARGET ТАЙЛБАР</div>
            {TARGETS.map(t => (
              <div key={t.val} style={{ display: 'flex', gap: 10, marginBottom: 7 }}>
                <span style={{ ...fp, fontSize: 5, color: 'var(--cyan)', minWidth: 60 }}>{t.label}</span>
                <span style={{ ...fm, fontSize: 11, color: 'var(--dim2)' }}>{t.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
