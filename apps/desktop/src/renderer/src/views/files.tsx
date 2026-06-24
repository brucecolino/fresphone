import { useEffect, useMemo, useState } from 'react'
import { useDevice } from '../store/device'
import type { MediaItem } from '../types'

type SortKey = 'name' | 'date' | 'size'

const fmtSize = (b: number) =>
  b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b > 0 ? `${Math.round(b / 1e3)} KB` : '—'
const fmtDate = (s: string) => {
  const d = new Date(s)
  return isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(d)
}

export function Files() {
  const status = useDevice((s) => s.status)
  const ready = status?.mode === 'demo' || (status?.connected === true && status?.trusted === true)
  const [path, setPath] = useState('') // relativo alla root AFC; '' = radice
  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [dir, setDir] = useState<'asc' | 'desc'>('asc')
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    if (!ready) {
      setItems([])
      return
    }
    setLoading(true)
    window.fp.device
      .browse(path)
      .then((x) => setItems(x as MediaItem[]))
      .finally(() => setLoading(false))
  }, [ready, path])

  const segments = path ? path.split('/').filter(Boolean) : []
  const view = useMemo(() => {
    return [...items].sort((a, b) => {
      const af = a.type === 'folder'
      const bf = b.type === 'folder'
      if (af !== bf) return af ? -1 : 1
      let c = 0
      if (sortKey === 'date') c = (a.date || '').localeCompare(b.date || '')
      else if (sortKey === 'size') c = a.sizeBytes - b.sizeBytes
      else c = a.name.localeCompare(b.name)
      return dir === 'asc' ? c : -c
    })
  }, [items, sortKey, dir])

  function enter(it: MediaItem) {
    if (it.type === 'folder') setPath(it.id)
  }
  async function open(it: MediaItem) {
    const r = await window.fp.media.open('files', it.id)
    if (!r.ok) setMsg(r.message ?? 'Impossibile aprire il file')
  }

  return (
    <div className="p-4">
      <div className="flex items-end gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold leading-tight">File</h1>
          <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-ink2">
            <button onClick={() => setPath('')} className="hover:text-ink">
              iPhone
            </button>
            {segments.map((seg, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="text-line">/</span>
                <button onClick={() => setPath(segments.slice(0, i + 1).join('/'))} className="hover:text-ink">
                  {seg}
                </button>
              </span>
            ))}
          </div>
        </div>
        {path && (
          <button
            onClick={() => setPath(segments.slice(0, -1).join('/'))}
            className="h-8 rounded-lg border border-line px-3 text-xs hover:bg-bg"
          >
            Indietro
          </button>
        )}
        <select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="h-8 rounded-lg border border-line bg-surface px-2 text-xs">
          <option value="name">Nome</option>
          <option value="date">Data</option>
          <option value="size">Dimensione</option>
        </select>
        <button onClick={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))} className="h-8 rounded-lg border border-line px-3 text-xs hover:bg-bg">
          {dir === 'asc' ? 'Crescente' : 'Decrescente'}
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl2 border border-line bg-surface">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 border-b border-line px-4 py-2.5 text-xs font-medium text-ink2">
          <span>Nome</span>
          <span>Tipo</span>
          <span>Dimensione</span>
          <span>Data</span>
        </div>
        {loading ? (
          <p className="px-4 py-6 text-sm text-ink2">Caricamento…</p>
        ) : (
          view.map((it) => (
            <div
              key={it.id}
              onDoubleClick={() => (it.type === 'folder' ? enter(it) : open(it))}
              className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center gap-2 border-b border-line px-4 py-2.5 text-sm last:border-0 hover:bg-bg"
            >
              <button
                onClick={() => it.type === 'folder' && enter(it)}
                className={it.type === 'folder' ? 'truncate text-left font-medium hover:text-brand' : 'truncate text-left'}
                title={it.name}
              >
                {it.name}
              </button>
              <span className="text-ink2">{it.type === 'folder' ? 'Cartella' : it.kind || 'File'}</span>
              <span className="text-ink2">{it.type === 'folder' ? '—' : fmtSize(it.sizeBytes)}</span>
              <span className="text-ink2">{fmtDate(it.date)}</span>
            </div>
          ))
        )}
      </div>
      {ready && !loading && view.length === 0 && <p className="mt-3 text-sm text-ink2">Cartella vuota.</p>}
      {!ready && <p className="mt-3 text-sm text-ink2">Collega e autorizza l’iPhone.</p>}
      {msg && <p className="mt-2 text-xs text-ink2">{msg}</p>}
      <p className="mt-3 text-xs text-ink2">Doppio clic: entra nella cartella o apri il file. Selezione multipla, copia/sposta e tag arrivano nel prossimo passo.</p>
    </div>
  )
}
