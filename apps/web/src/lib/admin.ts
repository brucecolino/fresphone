import { auth } from '@/auth'

/** Garantisce che chi esegue l'azione sia un admin. Da usare in OGNI server action admin. */
export async function requireAdmin() {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    throw new Error('Non autorizzato')
  }
  return session.user
}
