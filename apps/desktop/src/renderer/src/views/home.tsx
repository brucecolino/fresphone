import { useCallback, useEffect, useState, type ReactNode } from 'react'
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

function Banner({ children }: { children: ReactNode }) {
  return <div className="mt-4 rounded-xl2 border border-line bg-grad-soft p-4 text-sm">{children}</div>
}

export function Home({ onNavigate }: { onNavigate: (k: NavKey) => void }) {
  const [status, setStatus] = useState<DeviceStatus | null>(null)
  const [pairing, setPairing] = useState(false)

  const load = useCallback(() => {
    window.fp.device.status().then((s) => setStatus(s as DeviceStatus))
  }, [])
  useEffect(() => {
    load()
  }, [load])

  async function authorize() {
    setPairing(true)
    try {
      await window.fp.device.pair()
    } finally {
      setPairing(false)
      load()
    }
  }

  const free = status?.usedBytes && status?.totalBytes ? status.totalBytes - status.usedBytes : undefined
  const ready = status?.mode === 'demo' || (status?.connected === true && status?.trusted === true)

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Home</h1>
      <p className="mt-1 text-sm text-ink2">
        {status?.mode === 'demo'
          ? 'Modalità demo'
          : status?.connected
            ? `${status.name ?? 'iPhone'} collegato`
            : 'Nessun iPhone collegato'}
      </p>

      {status?.mode === 'none' && status.toolsOk === false && (
        <Banner>
          Strumenti dispositivo non trovati. Inserisci i binari libimobiledevice in <code>resources/bin</code> (vedi il
          README) e installa l’Apple Mobile Device Driver. In alternativa attiva la modalità demo in Impostazioni.
        </Banner>
      )}
      {status?.mode === 'none' && status.toolsOk !== false && (
        <Banner>Collega il tuo iPhone al PC con un cavo USB.</Banner>
      )}
      {status?.connected && !status.trusted && (
        <Banner>
          <span>iPhone collegato. Sblocca il telefono e tocca “Autorizza”, poi premi qui.</span>
          <button
            onClick={authorize}
            disabled={pairing}
            className="bg-grad ml-3 rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
          >
            {pairing ? 'Attendo…' : 'Autorizza'}
          </button>
        </Banner>
      )}

      {ready && (
        <>
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
        </>
      )}
    </div>
  )
}
