import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import prisma from '@/lib/db'

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  secret:  process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,

  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID     || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: { prompt: 'select_account', access_type: 'offline', response_type: 'code' }
      }
    }),
    GitHubProvider({
      clientId:     process.env.GITHUB_CLIENT_ID     || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    }),
  ],

  callbacks: {
    async signIn({ user, account }) {
      const provider = account?.provider
      if (provider !== 'google' && provider !== 'github') return true

      try {
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
        const isAdmin = adminEmails.includes(user.email!.toLowerCase())

        const existing = await prisma.user.findUnique({ where: { email: user.email! } })

        if (existing) {
          // Promote to admin if configured
          if (isAdmin && existing.role !== 'ADMIN') {
            await prisma.user.update({ where: { email: user.email! }, data: { role: 'ADMIN' } })
          }
          // Link provider ID if not yet saved
          if (provider === 'google' && !existing.googleId)
            await prisma.user.update({ where: { email: user.email! }, data: { googleId: String(user.id) } })
          if (provider === 'github' && !existing.githubId)
            await prisma.user.update({ where: { email: user.email! }, data: { githubId: String(user.id) } })
        } else {
          const base     = user.email!.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_')
          const username = (base + Math.floor(Math.random() * 1000)).slice(0, 20)
          await prisma.user.create({
            data: {
              email:             user.email!,
              username,
              passwordHash:      '',
              isEmailVerified:   true,
              googleId:          provider === 'google' ? String(user.id) : undefined,
              githubId:          provider === 'github' ? String(user.id) : undefined,
              avatarUrl:         user.image ?? undefined,
              role:              isAdmin ? 'ADMIN' : 'STUDENT',
              onboardingComplete: isAdmin, // admins skip onboarding
            }
          })
        }
      } catch (e) {
        console.error('OAuth signIn error:', e)
        return false
      }
      return true
    },

    async jwt({ token, user, account, trigger }) {
      if (account || user || trigger === 'update' || !token.id) {
        const email = token.email || user?.email
        if (email) {
          const dbUser = await prisma.user.findUnique({ where: { email } })
          if (dbUser) {
            token.id               = dbUser.id
            token.role             = dbUser.role
            token.username         = dbUser.username
            token.xp               = dbUser.xp
            token.level            = dbUser.level
            token.onboardingComplete = dbUser.onboardingComplete
          }
        }
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id               = token.id               as string
        session.user.role             = token.role             as string
        session.user.username         = token.username         as string
        session.user.xp               = token.xp               as number
        session.user.level            = token.level            as number
        session.user.onboardingComplete = token.onboardingComplete as boolean
      }
      return session
    },
  },

  pages: {
    signIn:  '/login',
    error:   '/login',
    newUser: '/onboarding',
  },
}