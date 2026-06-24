import { app } from 'electron'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import { agent } from '../device/agent'
import type { SourceKey } from '../device/engine'

const safe = (id: string) => id.replace(/[^a-zA-Z0-9._-]/g, '_')

export function viewerDir(): string {
  return join(app.getPath('userData'), 'viewer')
}

// Scarica il file (se non già in cache) e ritorna un URL fpmedia:// servito dal
// processo main, così il renderer può riprodurlo/visualizzarlo in-app (streaming).
export async function localMediaUrl(source: SourceKey, id: string): Promise<{ ok: boolean; url?: string; message?: string }> {
  await mkdir(viewerDir(), { recursive: true }).catch(() => undefined)
  const name = safe(id)
  const local = join(viewerDir(), name)
  if (!existsSync(local)) {
    const remote = source === 'photos' ? `/DCIM/${id}` : `/${id}`
    const r = await agent.tryCall<{ path?: string } | null>('pull', { remote, dest: local }, null, 300000)
    if (!r) return { ok: false, message: 'Impossibile scaricare il file dal dispositivo.' }
  }
  return { ok: true, url: `fpmedia://media/${encodeURIComponent(name)}` }
}
