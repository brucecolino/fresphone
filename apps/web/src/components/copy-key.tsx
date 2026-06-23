'use client'

import { useState } from 'react'

export function CopyKey({ value }: { value: string }) {
  const [done, setDone] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setDone(true)
      setTimeout(() => setDone(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={copy}
      className="rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-ink2 transition-colors hover:bg-bg hover:text-ink"
    >
      {done ? 'Copiata' : 'Copia'}
    </button>
  )
}
