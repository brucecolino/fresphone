import type { Metadata } from 'next'
import Link from 'next/link'
import { auth, signIn, signOut } from '@/auth'

export const metadata: Metadata = {
  title: 'Area personale — FreshPhone',
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const session = await auth()

  if (!session?.user) {
    return (
      <section className="container-x py-16 md:py-24">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold">Area personale</h1>
          <p className="mt-3 text-ink2">Accedi per vedere i tuoi ordini, le licenze e attivare FreshPhone con un clic.</p>
          <div className="mt-8 rounded-xl2 border border-line bg-surface p-6">
            <form
              action={async () => {
                'use server'
                await signIn('google', { redirectTo: '/account' })
              }}
            >
              <button type="submit" className="bg-grad w-full rounded-full px-4 py-3 text-sm font-semibold text-white">
                Continua con Google
              </button>
            </form>
            <p className="mt-4 text-xs text-ink2">Apple e Facebook in arrivo.</p>
          </div>
        </div>
      </section>
    )
  }

  const u = session.user
  const firstName = u.name ? u.name.split(' ')[0] : null

  return (
    <section className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ciao{firstName ? `, ${firstName}` : ''}</h1>
            <p className="mt-1 text-sm text-ink2">{u.email}</p>
          </div>
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/' })
            }}
          >
            <button className="rounded-full border border-line px-4 py-2 text-sm font-medium text-ink2 transition-colors hover:bg-bg hover:text-ink">
              Esci
            </button>
          </form>
        </div>

        {u.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="mt-6 inline-block rounded-lg border border-line px-3 py-2 text-sm font-medium transition-colors hover:bg-bg"
          >
            Vai all'area admin
          </Link>
        )}

        <div className="mt-8 rounded-xl2 border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Le tue licenze</h2>
          <p className="mt-2 text-sm text-ink2">Non hai ancora una licenza attiva. Scegli un piano per iniziare.</p>
          <Link href="/pricing" className="bg-grad mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white">
            Vedi i prezzi
          </Link>
        </div>

        <div className="mt-6 rounded-xl2 border border-line bg-surface p-6">
          <h2 className="font-display text-lg font-semibold">Ordini</h2>
          <p className="mt-2 text-sm text-ink2">Nessun ordine ancora.</p>
        </div>
      </div>
    </section>
  )
}
