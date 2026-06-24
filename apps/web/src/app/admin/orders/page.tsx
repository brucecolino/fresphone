import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { PLANS, formatEur } from '@freshphone/shared'
import { prisma } from '@/lib/db'
import { prismaPlanToShared } from '@/lib/licensing'

export const dynamic = 'force-dynamic'

const fmt = (d: Date) => new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(d)
const cols = 'grid-cols-[1fr_1.5fr_0.9fr_0.8fr_0.7fr_1fr]'

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const term = q?.trim()
  const where: Prisma.OrderWhereInput = term
    ? {
        OR: [
          { orderNumber: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
          { license: { key: { contains: term, mode: 'insensitive' } } },
        ],
      }
    : {}
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100, include: { license: true } })

  return (
    <div>
      <h1 className="text-2xl font-bold">Ordini</h1>

      <form action="/admin/orders" method="get" className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Cerca per numero ordine, email o codice licenza"
          className="w-full max-w-md rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-bg">Cerca</button>
      </form>

      <div className="mt-5 overflow-hidden rounded-xl2 border border-line bg-surface">
        <div className={`grid ${cols} gap-2 border-b border-line px-4 py-2.5 text-xs font-medium text-ink2`}>
          <span>Ordine</span>
          <span>Email</span>
          <span>Piano</span>
          <span>Importo</span>
          <span>Stato</span>
          <span>Data</span>
        </div>
        {orders.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink2">Nessun ordine trovato.</p>
        ) : (
          orders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className={`grid ${cols} gap-2 border-b border-line px-4 py-3 text-sm transition-colors last:border-0 hover:bg-bg`}
            >
              <span className="font-medium">{o.orderNumber ?? '—'}</span>
              <span className="truncate">{o.email}</span>
              <span>{PLANS[prismaPlanToShared(o.plan)].name}</span>
              <span>{formatEur(o.amountCents / 100)}</span>
              <span className="text-ink2">{o.status}</span>
              <span className="text-ink2">{fmt(o.createdAt)}</span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
