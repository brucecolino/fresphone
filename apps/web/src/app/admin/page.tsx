export const dynamic = 'force-dynamic'

const cards: { label: string; value: string }[] = [
  { label: 'Ricavi (mese)', value: '—' },
  { label: 'Ordini', value: '0' },
  { label: 'Licenze attive', value: '0' },
  { label: 'Carrelli abbandonati', value: '0' },
]

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2 text-sm text-ink2">Panoramica del negozio. I dati si popoleranno con i primi ordini.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
