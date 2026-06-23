import { PLANS } from '@freshphone/shared'
import { prisma } from '@/lib/db'
import { prismaPlanToShared } from '@/lib/licensing'

export const dynamic = 'force-dynamic'

const fmt = (d: Date) => new Intl.DateTimeFormat('it-IT', { dateStyle: 'short', timeStyle: 'short' }).format(d)
const statusLabel: Record<string, string> = {
  OPEN: 'Aperto',
  ABANDONED: 'Abbandonato',
  RECOVERED: 'Recuperato',
  COMPLETED: 'Completato',
}

export default async function AdminCartsPage() {
  const carts = await prisma.cart.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })

  return (
    <div>
      <h1 className="text-2xl font-bold">Carrelli</h1>
      <p className="mt-2 text-sm text-ink2">Sessioni di acquisto avviate. Quelli abbandonati sono candidati al recupero.</p>

      <div className="mt-5 overflow-hidden rounded-xl2 border border-line bg-surface">
        <div className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 border-b border-line px-4 py-2.5 text-xs font-medium text-ink2">
          <span>Email</span>
          <span>Piano</span>
          <span>Stato</span>
          <span>Data</span>
        </div>
        {carts.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink2">Nessun carrello.</p>
        ) : (
          carts.map((c) => (
            <div key={c.id} className="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-2 border-b border-line px-4 py-3 text-sm last:border-0">
              <span className="truncate">{c.email ?? '—'}</span>
              <span>{PLANS[prismaPlanToShared(c.plan)].name}</span>
              <span className="text-ink2">{statusLabel[c.status] ?? c.status}</span>
              <span className="text-ink2">{fmt(c.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
