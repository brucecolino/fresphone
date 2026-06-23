import { useEffect, useMemo, useState } from 'react'
import type { MediaItem } from '../types'

type SortKey = 'date' | 'size' | 'name'

const fmtSize = (b: number) =>
  b >= 1e9 ? `${(b / 1e9).toFixed(1)} GB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${(b / 1e3).toFixed(0)} KB`
const fmtDate = (s: string) => new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium' }).format(new Date(s))

export function Files() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [sortKey, setSortKey] = useState<SortKey>('date')
  const [dir, setDir] = useState<'asc' | 'desc'>('desc')

  useEffect(() => {
    window.fp.device.list('files').then((x) => setItems(x as MediaItem[]))
  }, [])

  const view = useMemo(() => {
    return [...items].sort((a, b) => {
      let c = 0
      if (sortKey === 'date') c = a.date.localeCompare(b.date)
      else if (sortKey === 'size') c = a.sizeBytes - b.sizeBytes
      else c = a.name.localeCompare(b.name)
      return dir === 'asc' ? c : -c
    })
  }, [items, sortKey, dir])

  return (
    <div className="p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">File</h1>
          <p className="text-sm text-ink2">{view.length} elementi</p>
        </div>
        <select
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value as SortKey)}
          className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm"
        >
          <option value="date">Data</option>
          <option value="size">Dimensione</option>
          <option value="name">Nome</option>
        </select>
        <button onClick={() => setDir((d) => (d === 'asc' ? 'desc' : 'asc'))} className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm">
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
        {view.map((it) => (
          <div key={it.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-2 border-b border-line px-4 py-2.5 text-sm last:border-0">
            <span className="truncate">{it.name}</span>
            <span className="text-ink2">{it.kind}</span>
            <span className="text-ink2">{fmtSize(it.sizeBytes)}</span>
            <span className="text-ink2">{fmtDate(it.date)}</span>
          </div>
        ))}
      </div>
      {view.length === 0 && <p className="mt-3 text-sm text-ink2">Nessun file.</p>}
    </div>
  )
}
