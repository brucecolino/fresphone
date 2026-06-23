import { execFile } from 'node:child_process'

export interface RunResult {
  /** 0 = ok; 127 = binario non trovato (ENOENT); altro = errore del tool */
  code: number
  stdout: string
  stderr: string
}

// Wrapper attorno a execFile: niente shell, timeout, non lancia mai (ritorna il codice).
export function run(bin: string, args: string[], timeoutMs = 15000): Promise<RunResult> {
  return new Promise((resolve) => {
    execFile(bin, args, { timeout: timeoutMs, windowsHide: true, maxBuffer: 64 * 1024 * 1024 }, (err, stdout, stderr) => {
      let code = 0
      if (err) {
        const e = err as NodeJS.ErrnoException & { code?: string | number }
        if (e.code === 'ENOENT') code = 127
        else if (typeof e.code === 'number') code = e.code
        else code = 1
      }
      resolve({ code, stdout: stdout?.toString() ?? '', stderr: stderr?.toString() ?? '' })
    })
  })
}
