import { useTheme } from '../store/theme'
import { cn } from '../lib/cn'
import { Logo } from './logo'

const modes: { k: 'system' | 'light' | 'dark'; label: string }[] = [
  { k: 'system', label: 'Sistema' },
  { k: 'light', label: 'Chiaro' },
  { k: 'dark', label: 'Scuro' },
]

export function Header() {
  const source = useTheme((s) => s.source)
  const setSource = useTheme((s) => s.setSource)

  return (
    <header className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2.5">
      <Logo />
      <span className="text-sm text-ink2">Smart iPhone File Manager</span>
      <div className="ml-auto flex rounded-lg border border-line p-0.5 text-xs">
        {modes.map((m) => (
          <button
            key={m.k}
            onClick={() => void setSource(m.k)}
            className={cn(
              'rounded-md px-2.5 py-1 transition-colors',
              source === m.k ? 'bg-pill font-medium text-pillt' : 'text-ink2 hover:text-ink',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </header>
  )
}
