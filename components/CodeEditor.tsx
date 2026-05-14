'use client'
import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

// Monaco is browser-only
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then(m => m.default),
  { ssr: false, loading: () => (
    <div style={{ height:'100%', background:'#1e1e1e', display:'flex',
      alignItems:'center', justifyContent:'center',
      fontFamily:'var(--fm)', fontSize:12, color:'#4a6a8a' }}>
      EDITOR АЧААЛЛАЖ БАЙНА...
    </div>
  )}
)

interface Props {
  value:    string
  onChange: (v: string) => void
  language?: string
  height?:  string | number
}

export default function CodeEditor({
  value, onChange, language = 'javascript', height = '100%'
}: Props) {
  return (
    <MonacoEditor
      height={height}
      language={language}
      value={value}
      theme="vs-dark"
      onChange={v => onChange(v ?? '')}
      options={{
        fontSize:           14,
        fontFamily:         "'Share Tech Mono', 'Courier New', monospace",
        minimap:            { enabled: false },
        lineNumbers:        'on',
        scrollBeyondLastLine: false,
        automaticLayout:    true,
        tabSize:            2,
        wordWrap:           'on',
        padding:            { top: 12 },
        renderLineHighlight:'all',
        cursorBlinking:     'blink',
        smoothScrolling:    true,
        bracketPairColorization: { enabled: true },
      }}
    />
  )
}
