import Link from 'next/link'
import { Prisma } from '@prisma/client'
import { PLANS, formatEur } from '@freshphone/shared'
import { prisma } from '@/lib/db'
import { prismaPlanToShared } from '@/lib/licensing'

export const dynamic = 'force-dynamic'

const fmt = (d: Date) => new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(d)

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const where: Prisma.OrderWhereInput = q ? { email: { contains: q, mode: 'insensitive' } } : {}
  const orders = await prisma.order.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 })

  return (
    <div>
      <h1 className="text-2xl font-bold">Ordini</h1>

      <form action="/admin/orders" method="get" className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ''}
          placeholder="Cerca per email"
          className="w-full max-w-xs rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
        />
        <button className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-bg">Cerca</button>
      </form>

      <div className="mt-5 overflow-hidden rounded-xl2 border border-line bg-surface">
        <div className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_1fr] gap-2 border-b border-line px-4 py-2.5 text-xs font-medium text-ink2">
          <span>Email</span>
          <span>Piano</span>
          <span>Importo</span>
          <span>Stato</span>
          <span>Data</span>
        </div>
        {orders.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink2">Nessun ordine.</p>
        ) : (
          orders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="grid grid-cols-[1.6fr_1fr_0.8fr_0.8fr_1fr] gap-2 border-b border-line px-4 py-3 text-sm transition-colors last:border-0 hover:bg-bg"
            >
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
