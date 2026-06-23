import { app } from 'electron'
import { join } from 'node:path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'

export type ThemeSource = 'system' | 'light' | 'dark'

export interface Settings {
  theme: ThemeSource
  exportDir?: string
  language?: string
}

const defaults: Settings = { theme: 'system', language: 'it' }

function file(): string {
  return join(app.getPath('userData'), 'settings.json')
}

export function readSettings(): Settings {
  try {
    const p = file()
    if (!existsSync(p)) return { ...defaults }
    return { ...defaults, ...(JSON.parse(readFileSync(p, 'utf-8')) as Partial<Settings>) }
  } catch {
    return { ...defaults }
  }
}

export function writeSettings(s: Settings): void {
  try {
    const dir = app.getPath('userData')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(file(), JSON.stringify(s, null, 2), 'utf-8')
  } catch (e) {
    console.error('settings write failed', e)
  }
}
