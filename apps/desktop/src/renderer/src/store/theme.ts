import { create } from 'zustand'

type Source = 'system' | 'light' | 'dark'
type Resolved = 'light' | 'dark'

interface ThemeState {
  source: Source
  resolved: Resolved
  init: () => Promise<void>
  setSource: (s: Source) => Promise<void>
}

function apply(resolved: Resolved): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

export const useTheme = create<ThemeState>((set) => ({
  source: 'system',
  resolved: 'light',
  init: async () => {
    const t = await window.fp.theme.get()
    apply(t.resolved)
    set({ source: t.source, resolved: t.resolved })
    window.fp.theme.onChanged((next) => {
      apply(next.resolved)
      set({ source: next.source, resolved: next.resolved })
    })
  },
  setSource: async (s) => {
    const t = await window.fp.theme.set(s)
    apply(t.resolved)
    set({ source: t.source, resolved: t.resolved })
  },
}))
