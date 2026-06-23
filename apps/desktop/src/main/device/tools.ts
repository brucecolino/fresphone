import { app } from 'electron'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

const isWin = process.platform === 'win32'
const exe = (name: string) => (isWin ? `${name}.exe` : name)

// I binari (libimobiledevice + pymobiledevice3) vanno in resources/bin.
// In dev: <progetto>/resources/bin; in pacchetto: <resources>/bin.
function binDir(): string {
  if (app.isPackaged) return join(process.resourcesPath, 'bin')
  return join(app.getAppPath(), 'resources', 'bin')
}

// Override via env (utile per puntare a un'installazione di sistema).
function envOverride(name: string): string | undefined {
  const key = `FRESHPHONE_${name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`
  return process.env[key]
}

/** Percorso del tool: env override -> binario incluso -> nome su PATH. */
export function toolPath(name: string): string {
  const ov = envOverride(name)
  if (ov) return ov
  const bundled = join(binDir(), exe(name))
  if (existsSync(bundled)) return bundled
  return exe(name)
}
