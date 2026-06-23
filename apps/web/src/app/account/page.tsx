import type { Metadata } from 'next'
import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { PLANS, formatEur } from '@freshphone/shared'
import { auth, signIn, signOut } from '@/auth'
import { prisma } from '@/lib/db'
import { prismaPlanToShared } from '@/lib/licensing'
import { CopyKey } from '@/components/copy-key'

export const metadata: Metadata = {
  title: 'Area personale — FreshPhone',
}

export const dynamic = 'force-dynamic'

const fmtDate = (d: Date) => new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(d)

const licenseStatusLabel: Record<string, string> = { ACTIVE: 'Attiva', EXPIRED: 'Scaduta', REVOKED: 'Revocata' }
const orderStatusLabel: Record<string, string> = {
  PAID: 'Pagato',
  PENDING: 'In attesa',
  REFUNDED: 'Rimborsato',
  CANCELED: 'Annullato',
  FAILED: 'Fallito',
}

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

  const me = session.user
  const firstName = me.name ? me.name.split(' ')[0] : null

  const licWhere: Prisma.LicenseWhereInput[] = [{ userId: me.id }]
  if (me.email) licWhere.push({ order: { email: me.email } })
  const ordWhere: Prisma.OrderWhereInput[] = [{ userId: me.id }]
  if (me.email) ordWhere.push({ email: me.email })

  const [licenses, orders] = await Promise.all([
    prisma.license.findMany({ where: { OR: licWhere }, orderBy: { createdAt: 'desc' } }),
    prisma.order.findMany({ where: { OR: ordWhere }, orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <section className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Ciao{firstName ? `, ${firstName}` : ''}</h1>
            <p className="mt-1 text-sm text-ink2">{me.email}</p>
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

        {me.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="mt-6 inline-block rounded-lg border border-line px-3 py-2 text-sm font-medium transition-colors hover:bg-bg"
          >
            Vai all'area admin
          </Link>
        )}

        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold">Le tue licenze</h2>
          {licenses.length === 0 ? (
            <div className="mt-3 rounded-xl2 border border-line bg-surface p-6">
              <p className="text-sm text-ink2">Non hai ancora una licenza. Scegli un piano per iniziare.</p>
              <Link href="/pricing" className="bg-grad mt-4 inline-block rounded-full px-5 py-2.5 text-sm font-semibold text-white">
                Vedi i prezzi
              </Link>
            </div>
          ) : (
            <div className="mt-3 space-y-4">
              {licenses.map((lic) => (
                <div key={lic.id} className="rounded-xl2 border border-line bg-surface p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-display font-semibold">Piano {PLANS[prismaPlanToShared(lic.plan)].name}</p>
                    <span className="text-xs text-ink2">{licenseStatusLabel[lic.status] ?? lic.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-ink2">
                    {lic.expiresAt ? `Scade il ${fmtDate(lic.expiresAt)}` : 'Licenza a vita'}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <code className="rounded-lg border border-line bg-bg px-3 py-1.5 text-sm tracking-wide">{lic.key}</code>
                    <CopyKey value={lic.key} />
                    <a
                      href={`freshphone://activate?key=${encodeURIComponent(lic.key)}`}
                      className="bg-grad rounded-lg px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Attiva nell'app
                    </a>
                  </div>
                  <p className="mt-2 text-xs text-ink2">
                    Oppure apri FreshPhone, vai su Impostazioni e incolla la key.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="font-display text-lg font-semibold">Ordini</h2>
          {orders.length === 0 ? (
            <p className="mt-3 text-sm text-ink2">Nessun ordine ancora.</p>
          ) : (
            <div className="mt-3 divide-y divide-line rounded-xl2 border border-line bg-surface">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium">Piano {PLANS[prismaPlanToShared(o.plan)].name}</p>
                    <p className="text-xs text-ink2">{fmtDate(o.createdAt)} · {o.provider}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatEur(o.amountCents / 100)}</p>
                    <p className="text-xs text-ink2">{orderStatusLabel[o.status] ?? o.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
