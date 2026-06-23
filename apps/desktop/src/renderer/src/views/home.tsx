import { useEffect, useState } from 'react'
import type { DeviceStatus } from '../types'
import type { NavKey } from '../components/sidebar'

const gb = (b?: number) => `${((b ?? 0) / 1_000_000_000).toFixed(1)} GB`

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl2 border border-line bg-surface p-5">
      <p className="text-xs text-ink2">{label}</p>
      <p className="mt-1 font-display text-2xl font-bold">{value}</p>
    </div>
  )
}

export function Home({ onNavigate }: { onNavigate: (k: NavKey) => void }) {
  const [status, setStatus] = useState<DeviceStatus | null>(null)
  useEffect(() => {
    window.fp.device.status().then((s) => setStatus(s as DeviceStatus))
  }, [])

  const free = status?.usedBytes && status?.totalBytes ? status.totalBytes - status.usedBytes : undefined

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="mt-1 text-sm text-ink2">{status?.connected ? `${status.name} collegato` : 'Nessun iPhone collegato'}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card label="Spazio usato" value={gb(status?.usedBytes)} />
        <Card label="Spazio libero" value={gb(free)} />
        <Card label="Capacità" value={gb(status?.totalBytes)} />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={() => onNavigate('photos')} className="bg-grad rounded-full px-5 py-2.5 text-sm font-semibold text-white">
          Sfoglia foto e video
        </button>
        <button onClick={() => onNavigate('files')} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-surface">
          Sfoglia file
        </button>
        <button onClick={() => onNavigate('spazio')} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:bg-surface">
          Libera spazio
        </button>
      </div>

      <p className="mt-6 text-xs text-ink2">
        Modalità demo: i contenuti mostrati sono di esempio. L’integrazione con l’iPhone reale arriva nel passo
        successivo.
      </p>
    </div>
  )
}
