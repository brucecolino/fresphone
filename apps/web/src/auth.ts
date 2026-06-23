import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db'

const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email?: string | null): boolean {
  return !!email && adminEmails.includes(email.toLowerCase())
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  session: { strategy: 'database' },
  trustHost: true,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        const stored = (user as { role?: 'USER' | 'ADMIN' }).role ?? 'USER'
        session.user.role = isAdminEmail(user.email) ? 'ADMIN' : stored
      }
      return session
    },
  },
})
