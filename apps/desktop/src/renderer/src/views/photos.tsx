import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'
import { cn } from '../lib/cn'
import { useDevice } from '../store/device'
import type { MediaItem } from '../types'

// ===== cache anteprime (evita refetch quando i tile rientrano in vista) =====
const thumbCache = new Map<string, string>()
const inflight = new Map<string, Promise<string | null>>()
function loadThumb(id: string): Promise<string | null> {
  if (thumbCache.has(id)) return Promise.resolve(thumbCache.get(id) ?? null)
  const existing = inflight.get(id)
  if (existing) return existing
  const p = window.fp.media
    .thumb('photos', id, 384)
    .then((s) => {
      inflight.delete(id)
      if (s) thumbCache.set(id, s as string)
      return (s as string | null) ?? null
    })
    .catch(() => {
      inflight.delete(id)
      return null
    })
  inflight.set(id, p)
  return p
}

const fmtSize = (b: number) =>
  b >= 1e9 ? `${(b / 1e9).toFixed(2)} GB` : b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`
const fmtDate = (s: string) => {
  const d = new Date(s)
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('it-IT', { dateStyle: 'medium', timeStyle: 'short' })
}
function monthInfo(iso: string): { key: string; label: string } {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return { key: 'zzz', label: 'Senza data' }
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const raw = d.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })
  return { key, label: raw.charAt(0).toUpperCase() + raw.slice(1) }
}

const SORTS: { v: string; label: string }[] = [
  { v: 'date_desc', label: 'Data (più recenti)' },
  { v: 'date_asc', label: 'Data (meno recenti)' },
  { v: 'name_asc', label: 'Nome (A → Z)' },
  { v: 'name_desc', label: 'Nome (Z → A)' },
  { v: 'size_desc', label: 'Dimensione (più grandi)' },
  { v: 'size_asc', label: 'Dimensione (più piccole)' },
]
const CELL = [92, 124, 168, 230] // piccolissime → grandi

type Filter = 'all' | 'photo' | 'video'
const chips: { k: Filter; label: string }[] = [
  { k: 'all', label: 'Tutti' },
  { k: 'photo', label: 'Foto' },
  { k: 'video', label: 'Video' },
]

function Tile({
  item,
  selected,
  onClick,
  onContextMenu,
  onDoubleClick,
  onDragStart,
}: {
  item: MediaItem
  selected: boolean
  onClick: (e: React.MouseEvent) => void
  onContextMenu: (e: React.MouseEvent) => void
  onDoubleClick: () => void
  onDragStart: () => void
}) {
  const [src, setSrc] = useState<string | null>(() => thumbCache.get(item.id) ?? null)
  useEffect(() => {
    if (src) return
    let alive = true
    loadThumb(item.id).then((s) => {
      if (alive) setSrc(s)
    })
    return () => {
      alive = false
    }
  }, [item.id, src])

  return (
    <button
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDoubleClick={onDoubleClick}
      draggable
      onDragStart={(e) => {
        e.preventDefault()
        onDragStart()
      }}
      title={`${item.name} · ${fmtSize(item.sizeBytes)} · ${fmtDate(item.date)}`}
      className={cn(
        'relative block aspect-square w-full overflow-hidden rounded-md bg-line/60',
        selected && 'ring-2 ring-brand ring-offset-2 ring-offset-bg',
      )}
    >
      {src ? (
        <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        <span className="block h-full w-full animate-pulse bg-line/50" />
      )}
      {item.type === 'video' && (
        <span className="absolute bottom-1 right-1 rounded bg-black/55 px-1 text-[10px] font-medium text-white">video</span>
      )}
      {selected && <span className="absolute left-1 top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand" />}
    </button>
  )
}

function Viewer({
  items,
  index,
  onIndex,
  onClose,
}: {
  items: MediaItem[]
  index: number
  onIndex: (i: number) => void
  onClose: () => void
}) {
  const item = items[index]
  const isVideo = item?.type === 'video'
  const [img, setImg] = useState<string | null>(null)
  const [video, setVideo] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    if (!item) return
    let alive = true
    setImg(null)
    setVideo(null)
    setErr(null)
    if (isVideo) {
      window.fp.media.localFile('photos', item.id).then((r) => {
        if (!alive) return
        if (r.ok && r.url) setVideo(r.url)
        else setErr(r.message ?? 'Impossibile caricare il video')
      })
    } else {
      window.fp.media.thumb('photos', item.id, 1600).then((s) => {
        if (!alive) return
        if (s) setImg(s as string)
        else setErr('Impossibile caricare l’immagine')
      })
    }
    return () => {
      alive = false
    }
  }, [item, isVideo])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') onIndex(Math.min(items.length - 1, index + 1))
      else if (e.key === 'ArrowLeft') onIndex(Math.max(0, index - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, items.length, onClose, onIndex])

  if (!item) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/90" onClick={onClose}>
      <div className="flex items-center justify-between gap-3 px-4 py-2 text-white" onClick={(e) => e.stopPropagation()}>
        <span className="truncate text-sm">
          {item.name} · {fmtDate(item.date)} · {index + 1}/{items.length}
        </span>
        <div className="flex items-center gap-2">
          <button onClick={() => window.fp.media.open('photos', item.id)} className="rounded border border-white/30 px-3 py-1 text-xs hover:bg-white/10">
            Apri in Windows
          </button>
          <button onClick={onClose} className="rounded border border-white/30 px-3 py-1 text-xs hover:bg-white/10">
            Chiudi (Esc)
          </button>
        </div>
      </div>
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-4" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onIndex(Math.max(0, index - 1))}
          disabled={index === 0}
          className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-3 py-3 text-lg text-white hover:bg-white/20 disabled:opacity-30"
        >
          ‹
        </button>
        {isVideo ? (
          video ? (
            <video src={video} controls autoPlay className="max-h-full max-w-full" />
          ) : (
            <span className="text-sm text-white/70">{err ?? 'Caricamento video…'}</span>
          )
        ) : img ? (
          <img src={img} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-sm text-white/70">{err ?? 'Caricamento…'}</span>
        )}
        <button
          onClick={() => onIndex(Math.min(items.length - 1, index + 1))}
          disabled={index === items.length - 1}
          className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 px-3 py-3 text-lg text-white hover:bg-white/20 disabled:opacity-30"
        >
          ›
        </button>
      </div>
    </div>
  )
}

type IndexedItem = { item: MediaItem; index: number }
type Row = { type: 'header'; key: string; label: string } | { type: 'tiles'; key: string; cells: IndexedItem[] }

export function Photos() {
  const status = useDevice((s) => s.status)
  const ready = status?.mode === 'demo' || (status?.connected === true && status?.trusted === true)

  const [items, setItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(false)
  const [sort, setSort] = useState('date_desc')
  const [filter, setFilter] = useState<Filter>('all')
  const [byMonth, setByMonth] = useState(false)
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [lastIndex, setLastIndex] = useState<number | null>(null)
  const [zoom, setZoom] = useState(1)
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [propsItem, setPropsItem] = useState<MediaItem | null>(null)
  const [viewerIdx, setViewerIdx] = useState<number | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)

  const loadItems = useCallback(() => {
    if (!ready) {
      setItems([])
      return
    }
    setLoading(true)
    window.fp.device
      .list('photos')
      .then((x) => setItems(x as MediaItem[]))
      .finally(() => setLoading(false))
  }, [ready])
  useEffect(() => {
    loadItems()
  }, [loadItems])

  // larghezza della griglia -> numero di colonne
  useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setWidth(e.contentRect.width)
    })
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // Ctrl + rotellina = ridimensiona anteprime (blocca lo zoom della pagina)
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      setZoom((z) => Math.min(CELL.length - 1, Math.max(0, z + (e.deltaY < 0 ? 1 : -1))))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const columns = Math.max(1, Math.min(16, Math.floor((width - 24 + 8) / (CELL[zoom] + 8))))

  const view = useMemo(() => {
    const filtered = items.filter((it) => (filter === 'all' ? true : filter === 'video' ? it.type === 'video' : it.type === 'photo'))
    const [key, dir] = sort.split('_')
    const sorted = [...filtered].sort((a, b) => {
      let c = 0
      if (key === 'date') c = (a.date || '').localeCompare(b.date || '')
      else if (key === 'size') c = a.sizeBytes - b.sizeBytes
      else c = a.name.localeCompare(b.name)
      return dir === 'asc' ? c : -c
    })
    return sorted
  }, [items, filter, sort])

  const rows = useMemo<Row[]>(() => {
    const indexed: IndexedItem[] = view.map((item, index) => ({ item, index }))
    const chunk = (arr: IndexedItem[], prefix: string): Row[] => {
      const out: Row[] = []
      for (let i = 0; i < arr.length; i += columns) out.push({ type: 'tiles', key: `${prefix}-${i}`, cells: arr.slice(i, i + columns) })
      return out
    }
    if (!byMonth) return chunk(indexed, 'r')
    const out: Row[] = []
    let bucket: IndexedItem[] = []
    let curKey = ''
    let curLabel = ''
    const flush = () => {
      if (!bucket.length) return
      out.push({ type: 'header', key: `h-${curKey}`, label: curLabel })
      out.push(...chunk(bucket, `t-${curKey}`))
      bucket = []
    }
    for (const it of indexed) {
      const m = monthInfo(it.item.date)
      if (m.key !== curKey) {
        flush()
        curKey = m.key
        curLabel = m.label
      }
      bucket.push(it)
    }
    flush()
    return out
  }, [view, columns, byMonth])

  function clickTile(e: React.MouseEvent, index: number, id: string) {
    if (e.shiftKey && lastIndex != null) {
      const [a, b] = [Math.min(lastIndex, index), Math.max(lastIndex, index)]
      const range = view.slice(a, b + 1).map((it) => it.id)
      setSel((s) => new Set([...s, ...range]))
    } else {
      setSel((s) => {
        const n = new Set(s)
        if (n.has(id)) n.delete(id)
        else n.add(id)
        return n
      })
      setLastIndex(index)
    }
  }
  function contextTile(e: React.MouseEvent, index: number, id: string) {
    e.preventDefault()
    if (!sel.has(id)) {
      setSel(new Set([id]))
      setLastIndex(index)
    }
    setMenu({ x: e.clientX, y: e.clientY })
  }

  const selIds = () => Array.from(sel)
  const selectAll = () => setSel(new Set(view.map((it) => it.id)))
  const clearSel = () => setSel(new Set())

  async function doExport(ids: string[]) {
    setBusy(true)
    setMsg(null)
    try {
      const r = await window.fp.transfer.export('photos', ids)
      setMsg(r.ok ? `Esportati ${r.copied}/${r.total} in ${r.dir}` : r.message ?? 'Errore')
    } finally {
      setBusy(false)
    }
  }
  async function doMove(ids: string[]) {
    setBusy(true)
    setMsg(null)
    try {
      const r = await window.fp.transfer.move('photos', ids)
      if (r.ok) {
        setMsg(`Spostati ${r.moved}/${r.total} in ${r.dir}`)
        clearSel()
        loadItems()
      } else setMsg(r.message ?? 'Errore')
    } finally {
      setBusy(false)
    }
  }
  async function doRemove(ids: string[]) {
    setBusy(true)
    setMsg(null)
    try {
      const r = await window.fp.transfer.remove('photos', ids)
      if (r.ok) {
        setMsg(`Eliminati ${r.deleted}/${r.total} dall'iPhone`)
        clearSel()
        loadItems()
      } else setMsg(r.message ?? 'Errore')
    } finally {
      setBusy(false)
    }
  }

  const menuItems = (() => {
    const ids = selIds()
    const one = ids.length === 1 ? ids[0] : null
    const oneIdx = one ? view.findIndex((it) => it.id === one) : -1
    return [
      { label: 'Apri', disabled: oneIdx < 0, run: () => oneIdx >= 0 && setViewerIdx(oneIdx) },
      { label: 'Proprietà', disabled: !one, run: () => one && setPropsItem(view.find((it) => it.id === one) ?? null) },
      { sep: true },
      { label: `Esporta in cartella… (${ids.length})`, run: () => doExport(ids) },
      { label: `Sposta nel PC… (${ids.length})`, run: () => doMove(ids) },
      { sep: true },
      { label: `Elimina dall'iPhone (${ids.length})`, danger: true, run: () => doRemove(ids) },
    ] as { label?: string; sep?: boolean; danger?: boolean; disabled?: boolean; run?: () => void }[]
  })()

  return (
    <div ref={wrapRef} className="flex h-full flex-col">
      <div className="border-b border-line p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-semibold">Foto e video</h1>
            <p className="text-sm text-ink2">
              {loading ? 'Caricamento libreria…' : `${view.length} elementi`}
              {sel.size > 0 ? ` · ${sel.size} selezionati` : ''}
            </p>
          </div>
          <label className="flex items-center gap-2 text-xs text-ink2">
            <input type="checkbox" checked={byMonth} onChange={(e) => setByMonth(e.target.checked)} />
            Dividi per mese
          </label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-lg border border-line bg-surface px-3 py-1.5 text-sm outline-none focus:border-brand"
          >
            {SORTS.map((s) => (
              <option key={s.v} value={s.v}>
                {s.label}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1 rounded-lg border border-line p-0.5">
            <button onClick={() => setZoom((z) => Math.max(0, z - 1))} className="rounded px-2 py-1 text-sm hover:bg-bg" title="Più piccole">
              −
            </button>
            <button onClick={() => setZoom((z) => Math.min(CELL.length - 1, z + 1))} className="rounded px-2 py-1 text-sm hover:bg-bg" title="Più grandi (anche Ctrl+rotellina)">
              +
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((c) => (
            <button
              key={c.k}
              onClick={() => setFilter(c.k)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                filter === c.k ? 'border-transparent bg-brand text-white' : 'border-line text-ink2',
              )}
            >
              {c.label}
            </button>
          ))}
          <div className="ml-auto flex flex-wrap items-center gap-2">
            {sel.size > 0 ? (
              <>
                <button onClick={() => doExport(selIds())} disabled={busy} className="bg-grad rounded-full px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60">
                  Esporta
                </button>
                <button onClick={() => doMove(selIds())} disabled={busy} className="rounded-full border border-line px-3 py-1.5 text-xs hover:bg-bg disabled:opacity-60">
                  Sposta
                </button>
                <button onClick={() => doRemove(selIds())} disabled={busy} className="rounded-full border border-line px-3 py-1.5 text-xs hover:bg-bg disabled:opacity-60">
                  Elimina
                </button>
                <button onClick={clearSel} className="rounded-full border border-line px-3 py-1.5 text-xs">
                  Deseleziona
                </button>
              </>
            ) : (
              <button onClick={selectAll} disabled={view.length === 0} className="rounded-full border border-line px-3 py-1.5 text-xs hover:bg-bg disabled:opacity-50">
                Seleziona tutto
              </button>
            )}
          </div>
        </div>
        {msg && <p className="mt-2 text-xs text-ink2">{msg}</p>}
      </div>

      <div ref={gridRef} className="min-h-0 flex-1">
        {!ready ? (
          <p className="p-6 text-sm text-ink2">Collega e autorizza l’iPhone per vedere foto e video.</p>
        ) : view.length === 0 && !loading ? (
          <p className="p-6 text-sm text-ink2">Nessun elemento.</p>
        ) : (
          <Virtuoso
            data={rows}
            itemContent={(_, row) =>
              row.type === 'header' ? (
                <div className="px-3 pb-1 pt-4 text-sm font-semibold text-ink">{row.label}</div>
              ) : (
                <div className="grid gap-2 px-3 py-1" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}>
                  {row.cells.map(({ item, index }) => (
                    <Tile
                      key={item.id}
                      item={item}
                      selected={sel.has(item.id)}
                      onClick={(e) => clickTile(e, index, item.id)}
                      onContextMenu={(e) => contextTile(e, index, item.id)}
                      onDoubleClick={() => setViewerIdx(index)}
                      onDragStart={() => window.fp.transfer.startDrag('photos', sel.has(item.id) ? selIds() : [item.id])}
                    />
                  ))}
                </div>
              )
            }
            style={{ height: '100%' }}
          />
        )}
      </div>

      {menu && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} onContextMenu={(e) => { e.preventDefault(); setMenu(null) }} />
          <div
            className="fixed z-50 min-w-52 overflow-hidden rounded-lg border border-line bg-surface py-1 shadow-lg"
            style={{ left: Math.min(menu.x, window.innerWidth - 230), top: Math.min(menu.y, window.innerHeight - 250) }}
          >
            {menuItems.map((m, i) =>
              m.sep ? (
                <div key={i} className="my-1 border-t border-line" />
              ) : (
                <button
                  key={i}
                  disabled={m.disabled}
                  onClick={() => {
                    setMenu(null)
                    m.run?.()
                  }}
                  className={cn('block w-full px-3 py-1.5 text-left text-sm hover:bg-bg disabled:opacity-40', m.danger && 'text-red-500')}
                >
                  {m.label}
                </button>
              ),
            )}
          </div>
        </>
      )}

      {propsItem && <PropertiesModal item={propsItem} onOpen={() => window.fp.media.open('photos', propsItem.id)} onClose={() => setPropsItem(null)} />}
      {viewerIdx != null && view[viewerIdx] && (
        <Viewer items={view} index={viewerIdx} onIndex={setViewerIdx} onClose={() => setViewerIdx(null)} />
      )}
    </div>
  )
}

function PropertiesModal({ item, onOpen, onClose }: { item: MediaItem; onOpen: () => void; onClose: () => void }) {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    window.fp.media.thumb('photos', item.id, 1024).then((s) => {
      if (alive) setSrc(s as string | null)
    })
    return () => {
      alive = false
    }
  }, [item.id])
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6" onClick={onClose}>
      <div className="max-h-full w-full max-w-3xl overflow-auto rounded-xl2 border border-line bg-surface p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-display text-lg font-semibold">{item.name}</h2>
          <button onClick={onClose} className="rounded-lg border border-line px-3 py-1 text-sm hover:bg-bg">
            Chiudi
          </button>
        </div>
        <div className="mt-4 flex min-h-[200px] items-center justify-center rounded-lg bg-bg p-2">
          {src ? <img src={src} alt="" className="max-h-[60vh] w-auto rounded" /> : <span className="text-sm text-ink2">Anteprima in caricamento…</span>}
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <dt className="text-ink2">Tipo</dt>
          <dd>
            {item.type === 'video' ? 'Video' : 'Foto'} · {item.kind}
          </dd>
          <dt className="text-ink2">Dimensione</dt>
          <dd>{fmtSize(item.sizeBytes)}</dd>
          <dt className="text-ink2">Data</dt>
          <dd>{fmtDate(item.date)}</dd>
          <dt className="text-ink2">Nome file</dt>
          <dd className="truncate">{item.name}</dd>
        </dl>
        <div className="mt-4">
          <button onClick={onOpen} className="bg-grad rounded-full px-5 py-2 text-sm font-semibold text-white">
            Apri in Windows
          </button>
        </div>
      </div>
    </div>
  )
}
