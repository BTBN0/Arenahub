import type { Metadata } from 'next'
import { Press_Start_2P, Share_Tech_Mono } from 'next/font/google'
import '../styles/globals.css'
import { NextAuthProvider } from '@/context/NextAuthProvider'
import { AuthProvider } from '@/context/AuthContext'
import { LanguageProvider } from '@/context/LanguageContext'
import AchievementPopup from '@/components/ui/AchievementPopup'
import NotifToast from '@/components/ui/NotifToast'

const pixelFont = Press_Start_2P({
  weight:  '400',
  subsets: ['latin'],
  variable: '--fp',
  display: 'swap',
  preload: true,
})

const monoFont = Share_Tech_Mono({
  weight:  '400',
  subsets: ['latin'],
  variable: '--fm',
  display: 'swap',
  preload: false, // secondary font — load after
})

export const metadata: Metadata = {
  title: 'ArenaHub',
  description: 'Pixel coding learning platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn" className={`${pixelFont.variable} ${monoFont.variable}`}>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body>
        <NextAuthProvider>
          <AuthProvider>
            <LanguageProvider>
              {children}
              <AchievementPopup />
              <NotifToast />
            </LanguageProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}
