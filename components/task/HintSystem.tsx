import React, { useState, useEffect } from 'react'

interface Props {
  description: string
  tcs: { input: unknown; expected: unknown; label?: string }[]
  disabled?: boolean
}

function getHints(desc: string, tcs: { input: unknown; expected: unknown }[]) {
  const expected0 = tcs[0]?.expected
  const ex = typeof expected0 === 'string' ? expected0 : JSON.stringify(expected0 ?? '')
  const isHTML = ex.trim().startsWith('<') || ex.trim().startsWith('<!')
  const isCSS = !isHTML && /^\s*[\w#.@*:[\-]/.test(ex) && ex.includes('{')
  const isSQL = /^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)/i.test(ex)

  if (isHTML) {
    const tag = ex.match(/<(\w+)/)?.[1] || 'html'
    const full = ex.length > 50 ? ex.slice(0,50)+'...' : ex
    return [
      `💡 HTML tag бич: <${tag}>`,
      `🔍 ${desc}`,
      `📋 ${full}`,
    ]
  }
  if (isCSS) {
    const sel = ex.match(/^([^{]+)/)?.[1]?.trim() || 'selector'
    const props = ex.match(/\{([^}]+)\}/)?.[1]?.trim() || 'property: value'
    return [
      `💡 CSS rule бич: selector { property: value }`,
      `🔍 "${sel}" selector ашигла`,
      `📋 ${sel} { ${props} }`,
    ]
  }
  if (isSQL) {
    const kw = ex.match(/^\s*(\w+)/i)?.[1]?.toUpperCase() || 'SQL'
    const tbl = ex.match(/(?:FROM|INTO|TABLE)\s+(\w+)/i)?.[1] || 'table'
    const short = ex.length > 50 ? ex.slice(0,50)+'...' : ex
    return [
      `💡 SQL бич: ${kw} keyword-ээр эхэл`,
      `🔍 "${tbl}" table ашигла`,
      `📋 ${short}`,
    ]
  }
  // JS
  const fnSig = ex.match(/function\s+\w+\s*\([^)]*\)/)?.[0] || 'function solution(input)'
  const firstReturn = ex.match(/return ([^;}\n]+)/)?.[1]?.trim() || '...'
  return [
    `💡 ${desc}`,
    `🔍 ${fnSig} { return ... }`,
    `📋 return ${firstReturn.slice(0,40)}`,
  ]
}

export default function HintSystem({ description, tcs, disabled }: Props) {
  const [level, setLevel] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => { setLevel(0); setVisible(false) }, [description])

  const hints = getHints(description, tcs)

  const handleHint = () => {
    const next = Math.min(level + 1, hints.length)
    setLevel(next)
    setVisible(true)
  }

  if (disabled) return null

  return (
    <div style={{ padding: '5px 12px', borderTop: '1px solid #0a1520', background: '#010407', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <button
          onClick={handleHint}
          disabled={level >= hints.length}
          style={{
            fontFamily: 'var(--fp)', fontSize: 6, padding: '4px 10px', whiteSpace: 'nowrap',
            border: `1px solid ${level >= hints.length ? '#1a1a1a' : '#ffe60055'}`,
            background: level >= hints.length ? 'transparent' : 'rgba(255,230,0,.06)',
            color: level >= hints.length ? '#2a2a2a' : '#ffe600',
            cursor: level >= hints.length ? 'default' : 'pointer',
          }}
        >
          💡 HINT {level > 0 && `${level}/${hints.length}`}
        </button>

        {visible && level > 0 && (
          <div style={{
            flex: 1, fontFamily: 'var(--fm)', fontSize: 11, lineHeight: 1.5,
            color: level === 3 ? '#ff9900' : level === 2 ? '#ffe600aa' : '#6a9aba',
            padding: '3px 8px',
            border: `1px solid ${level === 3 ? '#ff990033' : '#ffe60022'}`,
            background: level === 3 ? 'rgba(255,153,0,.05)' : 'rgba(255,230,0,.03)',
            animation: 'popIn .15s ease',
          }}>
            {hints[level - 1]}
          </div>
        )}

        {level > 0 && (
          <button onClick={() => { setLevel(0); setVisible(false) }}
            style={{ background: 'transparent', border: 'none', color: '#2a2a3a', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
