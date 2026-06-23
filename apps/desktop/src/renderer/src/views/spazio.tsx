import { useEffect, useState } from 'react'
import type { DeviceStatus } from '../types'

const gb = (b: number) => `${(b / 1_000_000_000).toFixed(1)} GB`

export function Spazio() {
  const [status, setStatus] = useState<DeviceStatus | null>(null)
  useEffect(() => {
    window.fp.device.status().then((s) => setStatus(s as DeviceStatus))
  }, [])

  const used = status?.usedBytes ?? 0
  const total = status?.totalBytes ?? 0
  const free = Math.max(0, total - used)
  const pct = total ? (used / total) * 100 : 0

  return (
    <div className="max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Spazio</h1>
      <p className="mt-1 text-sm text-ink2">Libera spazio spostando foto e file sul PC.</p>

      <div className="mt-6 rounded-xl2 border border-line bg-surface p-6">
        <div className="flex justify-between text-sm">
          <span>{gb(used)} usati</span>
          <span className="text-ink2">{gb(free)} liberi</span>
        </div>
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-line">
          <div className="bg-grad h-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-xs text-ink2">Capacità totale {gb(total)}</p>
      </div>

      <p className="mt-6 text-xs text-ink2">
        Suggerimenti di pulizia e rimozione sicura arriveranno con l’integrazione del dispositivo.
      </p>
    </div>
  )
}
