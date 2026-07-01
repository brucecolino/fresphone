import { useEffect, useState } from 'react'
import { useWhatsNew } from '../store/whatsnew'
import { changelogFor, type ChangelogEntry } from '../changelog'

// Pannello "Novità": elenca cosa è cambiato nella versione attuale.
export function WhatsNew() {
  const open = useWhatsNew((s) => s.open)
  const close = useWhatsNew((s) => s.close)
  const [ver, setVer] = useState('')
  const [entry, setEntry] = useState<ChangelogEntry | undefined>(undefined)

  useEffect(() => {
    if (!open) return
    window.fp.updates
      .version()
      .then((v) => {
        setVer(v)
        setEntry(changelogFor(v))
      })
      .catch(() => setEntry(changelogFor('')))
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={close}>
      <div
        className="w-full max-w-md rounded-xl2 border border-line bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-lg font-semibold">Novità di FreshPhone{ver ? ` ${ver}` : ''}</h2>
            {entry?.date && <p className="mt-0.5 text-xs text-ink2">{entry.date}</p>}
          </div>
          <button onClick={close} className="text-ink2 hover:text-ink" title="Chiudi">
            ✕
          </button>
        </div>
        <ul className="mt-4 space-y-2 text-sm text-ink2">
          {(entry?.items ?? ['Miglioramenti e correzioni.']).map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className="bg-grad mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6 flex justify-end">
          <button onClick={close} className="bg-grad rounded-lg px-4 py-2 text-sm font-semibold text-white">
            Ho capito
          </button>
        </div>
      </div>
    </div>
  )
}
