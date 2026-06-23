import { useTheme } from '../store/theme'
import { cn } from '../lib/cn'

const modes = [
  { k: 'system', label: 'Sistema' },
  { k: 'light', label: 'Chiaro' },
  { k: 'dark', label: 'Scuro' },
] as const

export function Settings() {
  const source = useTheme((s) => s.source)
  const setSource = useTheme((s) => s.setSource)

  return (
    <div className="max-w-2xl p-6">
      <h1 className="text-2xl font-bold">Impostazioni</h1>

      <div className="mt-6 rounded-xl2 border border-line bg-surface p-5">
        <h2 className="font-display font-semibold">Tema</h2>
        <div className="mt-3 flex gap-2">
          {modes.map((m) => (
            <button
              key={m.k}
              onClick={() => void setSource(m.k)}
              className={cn(
                'rounded-lg border px-4 py-2 text-sm transition-colors',
                source === m.k ? 'border-transparent bg-pill font-medium text-pillt' : 'border-line text-ink2 hover:text-ink',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl2 border border-line bg-surface p-5">
        <h2 className="font-display font-semibold">Licenza</h2>
        <p className="mt-2 text-sm text-ink2">
          Attivazione licenza (deep link e inserimento manuale della key) in arrivo, collegata al tuo account sul sito.
        </p>
      </div>

      <p className="mt-6 text-xs text-ink2">FreshPhone · versione 0.1.0</p>
    </div>
  )
}
