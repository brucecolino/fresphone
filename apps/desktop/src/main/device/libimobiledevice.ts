import { toolPath } from './tools'
import { run } from './runner'
import type { MediaItem } from './engine'

export interface DeviceProbe {
  toolsOk: boolean
  connected: boolean
  trusted: boolean
  udid?: string
  name?: string
  usedBytes?: number
  totalBytes?: number
}

async function listUdids(): Promise<{ ok: boolean; udids: string[] }> {
  const r = await run(toolPath('idevice_id'), ['-l'])
  if (r.code === 127) return { ok: false, udids: [] } // binario non trovato
  return { ok: true, udids: r.stdout.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) }
}

async function infoKey(udid: string, key: string, domain?: string): Promise<string | undefined> {
  const args = ['-u', udid, ...(domain ? ['-q', domain] : []), '-k', key]
  const r = await run(toolPath('ideviceinfo'), args)
  if (r.code !== 0) return undefined
  return r.stdout.trim() || undefined
}

async function isTrusted(udid: string): Promise<boolean> {
  const r = await run(toolPath('idevicepair'), ['-u', udid, 'validate'])
  return r.code === 0
}

export async function pairDevice(udid: string): Promise<{ ok: boolean; message: string }> {
  const r = await run(toolPath('idevicepair'), ['-u', udid, 'pair'], 30000)
  const out = (r.stdout + r.stderr).trim()
  return { ok: r.code === 0, message: out || (r.code === 0 ? 'Dispositivo autorizzato' : 'Autorizzazione non riuscita') }
}

export async function probe(): Promise<DeviceProbe> {
  const { ok, udids } = await listUdids()
  if (!ok) return { toolsOk: false, connected: false, trusted: false }
  if (udids.length === 0) return { toolsOk: true, connected: false, trusted: false }

  const udid = udids[0]
  const trusted = await isTrusted(udid)
  if (!trusted) return { toolsOk: true, connected: true, trusted: false, udid }

  const name = await infoKey(udid, 'DeviceName')
  const total = Number(await infoKey(udid, 'TotalDiskCapacity', 'com.apple.disk_usage'))
  const avail = Number(await infoKey(udid, 'TotalDataAvailable', 'com.apple.disk_usage'))
  const totalBytes = Number.isFinite(total) && total > 0 ? total : undefined
  const usedBytes = totalBytes != null && Number.isFinite(avail) ? totalBytes - avail : undefined
  return { toolsOk: true, connected: true, trusted: true, udid, name, usedBytes, totalBytes }
}

// ===== Lettura contenuti via AFC (pymobiledevice3) — best-effort, da validare on-device =====

const PHOTO_EXT = new Set(['heic', 'heif', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'dng', 'tiff'])
const VIDEO_EXT = new Set(['mov', 'mp4', 'm4v', 'avi'])

function typeForName(name: string): MediaItem['type'] {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (PHOTO_EXT.has(ext)) return 'photo'
  if (VIDEO_EXT.has(ext)) return 'video'
  return 'file'
}

async function afcLs(udid: string, path: string): Promise<string[] | null> {
  const r = await run(toolPath('pymobiledevice3'), ['afc', 'ls', path, '--udid', udid], 20000)
  if (r.code === 127) return null // pymobiledevice3 non installato
  if (r.code !== 0) return []
  return r.stdout
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter((s) => s && s !== '.' && s !== '..')
}

// Ritorna null se lo strumento AFC non è disponibile (la UI mostra una guida).
export async function afcList(udid: string, source: 'photos' | 'files'): Promise<MediaItem[] | null> {
  if (source === 'photos') {
    const dcim = await afcLs(udid, '/DCIM')
    if (dcim === null) return null
    const items: MediaItem[] = []
    for (const dir of dcim.filter((d) => !d.includes('.'))) {
      const files = await afcLs(udid, `/DCIM/${dir}`)
      if (!files) continue
      for (const f of files) {
        const type = typeForName(f)
        if (type === 'file') continue
        items.push({ id: `${dir}/${f}`, name: f, type, sizeBytes: 0, date: '', kind: type === 'video' ? 'video' : 'HEIC' })
      }
    }
    return items
  }

  const root = await afcLs(udid, '/')
  if (root === null) return null
  return root
    .filter((n) => n.includes('.'))
    .map((n) => ({
      id: n,
      name: n,
      type: 'file' as const,
      sizeBytes: 0,
      date: '',
      kind: n.split('.').pop()?.toUpperCase(),
    }))
}
