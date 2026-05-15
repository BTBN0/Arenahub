'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/context/LanguageContext'

const NAV = [
  {
    href: '/dashboard', label: { mn: 'ДАШ', en: 'DASH' },
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  },
  {
    href: '/lessons', label: { mn: 'ХИЧЭЭЛ', en: 'LEARN' },
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M2 3h20v13H2z"/><path d="M8 21h8M12 16v5"/></svg>,
  },
  {
    href: '/contest', label: { mn: 'ТЭМЦ', en: 'FIGHT' },
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><path d="M6 9H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M6 5h12v14H6z"/><path d="M10 9v6M14 9v6"/></svg>,
  },
  {
    href: '/ai', label: { mn: 'AI', en: 'AI' },
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>,
  },
  {
    href: '/profile', label: { mn: 'ПРОФАЙЛ', en: 'ME' },
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
]

export default function BottomNav() {
  const pathname  = usePathname()
  const { lang }  = useLang()
  const isMn      = lang === 'mn'

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`bottom-nav-item${active ? ' active' : ''}`}
              style={{ color: active ? 'var(--cyan)' : undefined }}>
              {item.icon}
              <span>{isMn ? item.label.mn : item.label.en}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}