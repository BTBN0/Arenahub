'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { mn, en, TranslationKey } from '@/lib/i18n'

type Lang = 'mn' | 'en'

interface LangCtx {
  lang:   Lang
  setLang: (l: Lang) => void
  t:      (key: TranslationKey) => string
}

const Ctx = createContext<LangCtx | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('mn')

  useEffect(() => {
    const saved = localStorage.getItem('ah_lang') as Lang | null
    if (saved === 'mn' || saved === 'en') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('ah_lang', l)
  }

  const t = (key: TranslationKey): string =>
    (lang === 'mn' ? mn : en)[key] ?? key

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>
}

export function useLang() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useLang must be inside LanguageProvider')
  return ctx
}