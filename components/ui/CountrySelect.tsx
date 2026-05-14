'use client'
import { useEffect, useRef, useState } from 'react'
import CountryFlag from './CountryFlag'

const COUNTRIES = [
  'Монгол','Солонгос','Япон','Хятад','Орос','АНУ','Их Британи',
  'Герман','Франц','Австрали','Канад','Энэтхэг','Индонез','Тайланд',
  'Вьетнам','Сингапур','Малайз','Филиппин','Бразил','Аргентин','Бусад',
]

interface Props {
  value: string
  onChange: (v: string) => void
  accentColor?: string
}

export default function CountrySelect({ value, onChange, accentColor = '#00e5ff' }: Props) {
  const [open,   setOpen]   = useState(false)
  const [query,  setQuery]  = useState('')
  const ref      = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = COUNTRIES.filter(c =>
    c.toLowerCase().includes(query.toLowerCase())
  )

  // close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // focus search input when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50)
    else      setQuery('')
  }, [open])

  return (
    <div ref={ref} style={{ position:'relative', flex:1 }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:10,
          padding:'11px 14px', cursor:'pointer',
          background:'rgba(255,255,255,.04)',
          border:`1px solid ${open ? accentColor + '66' : 'rgba(255,255,255,.1)'}`,
          transition:'border-color .2s', userSelect:'none',
        }}
      >
        {value
          ? <>
              <CountryFlag country={value} size={24}/>
              <span style={{ fontFamily:'var(--fm)', fontSize:14, color:'#e0e8f4', flex:1 }}>{value}</span>
            </>
          : <span style={{ fontFamily:'var(--fm)', fontSize:14, color:'#4a6a8a', flex:1 }}>Улсаа сонгоно уу...</span>
        }
        <span style={{ fontFamily:'var(--fp)', fontSize:8, color:'#3a5a7a', transform: open ? 'rotate(180deg)' : 'none', transition:'transform .2s' }}>▾</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position:'absolute', top:'100%', left:0, right:0, zIndex:999,
          background:'#0b1225', border:`1px solid ${accentColor}33`,
          borderTop:'none', maxHeight:220, overflowY:'auto',
          boxShadow:`0 8px 32px rgba(0,0,0,.6)`,
        }}>
          {/* Search input */}
          <div style={{ padding:'8px 10px', borderBottom:'1px solid rgba(255,255,255,.06)', position:'sticky', top:0, background:'#0b1225', zIndex:1 }}>
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Хайх..."
              style={{
                width:'100%', padding:'7px 10px', boxSizing:'border-box',
                background:'rgba(255,255,255,.06)', border:`1px solid rgba(255,255,255,.1)`,
                color:'#e0e8f4', fontFamily:'var(--fm)', fontSize:13, outline:'none',
              }}
            />
          </div>

          {filtered.length === 0 && (
            <div style={{ padding:'16px', fontFamily:'var(--fm)', fontSize:12, color:'#4a6a8a', textAlign:'center' }}>Олдсонгүй</div>
          )}

          {filtered.map(c => (
            <div
              key={c}
              onClick={() => { onChange(c); setOpen(false) }}
              style={{
                display:'flex', alignItems:'center', gap:10,
                padding:'9px 14px', cursor:'pointer',
                background: value === c ? `${accentColor}14` : 'transparent',
                borderLeft: value === c ? `2px solid ${accentColor}` : '2px solid transparent',
                transition:'background .1s',
              }}
              onMouseEnter={e => { if (value !== c) (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,.04)' }}
              onMouseLeave={e => { if (value !== c) (e.currentTarget as HTMLDivElement).style.background = 'transparent' }}
            >
              <CountryFlag country={c} size={22}/>
              <span style={{ fontFamily:'var(--fm)', fontSize:13, color: value === c ? accentColor : '#c0d0e0' }}>{c}</span>
              {value === c && <span style={{ fontFamily:'var(--fp)', fontSize:6, color: accentColor, marginLeft:'auto' }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}