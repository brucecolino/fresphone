import { app } from 'electron'
import { spawn, spawnSync } from 'node:child_process'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

// I driver Apple (Apple Mobile Device Support: driver USB + servizio usbmuxd) sono
// inclusi nell'installer e installati automaticamente al setup se assenti. Qui
// gestiamo il rilevamento a runtime e un fallback (installazione dal pacchetto
// incluso) per i casi in cui mancassero ancora.

function driversDir(): string {
  if (app.isPackaged) return join(process.resourcesPath, 'drivers')
  return join(app.getAppPath(), 'resources', 'drivers')
}

function msiPath(): string {
  return join(driversDir(), 'AppleMobileDeviceSupport64.msi')
}

/** True se l'Apple Mobile Device Service è installato (driver + usbmuxd presenti). */
export function driversPresent(): boolean {
  if (process.platform !== 'win32') return true
  try {
    const r = spawnSync('sc', ['query', 'Apple Mobile Device Service'], { encoding: 'utf8', windowsHide: true })
    return r.status === 0
  } catch {
    return false
  }
}

/** Installa i driver Apple dal pacchetto incluso, in modo silenzioso ed elevato (UAC). */
export function installAppleDrivers(): { ok: boolean; message: string } {
  if (process.platform !== 'win32') return { ok: false, message: 'Disponibile solo su Windows' }
  if (driversPresent()) return { ok: true, message: 'Driver Apple già presenti.' }

  const msi = msiPath()
  if (!existsSync(msi)) return { ok: false, message: 'Pacchetto driver non incluso in questa build.' }

  // Avvio elevato e silenzioso di Apple Mobile Device Support.
  const arg = msi.replace(/'/g, "''")
  const ps = `Start-Process msiexec -Verb RunAs -Wait -ArgumentList @('/i','${arg}','/qn','/norestart')`
  try {
    const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false,
    })
    child.unref()
    return { ok: true, message: 'Installazione driver Apple avviata: conferma il prompt di Windows.' }
  } catch (e) {
    return { ok: false, message: `Impossibile avviare l'installazione: ${String(e)}` }
  }
}
