'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      /* ignore */
    }
  }

  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink2 transition-colors hover:bg-bg"
    >
      {dark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
