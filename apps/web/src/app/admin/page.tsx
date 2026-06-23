import { formatEur } from '@freshphone/shared'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function AdminDashboard() {
  const now = new Date()
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const abandonedCutoff = new Date(now.getTime() - 30 * 60 * 1000)

  const [revenue, ordersCount, activeLicenses, abandonedCarts, subscribers] = await Promise.all([
    prisma.order.aggregate({ _sum: { amountCents: true }, where: { status: 'PAID', createdAt: { gte: startMonth } } }),
    prisma.order.count(),
    prisma.license.count({ where: { status: 'ACTIVE' } }),
    prisma.cart.count({
      where: { OR: [{ status: 'ABANDONED' }, { status: 'OPEN', updatedAt: { lt: abandonedCutoff } }] },
    }),
    prisma.newsletterSubscriber.count({ where: { status: 'CONFIRMED' } }),
  ])

  const cards: { label: string; value: string }[] = [
    { label: 'Ricavi (mese)', value: formatEur((revenue._sum.amountCents ?? 0) / 100) },
    { label: 'Ordini totali', value: String(ordersCount) },
    { label: 'Licenze attive', value: String(activeLicenses) },
    { label: 'Carrelli abbandonati', value: String(abandonedCarts) },
    { label: 'Iscritti newsletter', value: String(subscribers) },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-ink2">Panoramica del negozio.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl2 border border-line bg-surface p-5">
            <p className="text-xs text-ink2">{c.label}</p>
            <p className="mt-1 font-display text-2xl font-bold">{c.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
