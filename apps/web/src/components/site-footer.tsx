import Link from 'next/link'
import { Logo } from './logo'

const cols: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: 'Prodotto',
    links: [
      { href: '/#funzioni', label: 'Funzioni' },
      { href: '/pricing', label: 'Prezzi' },
      { href: '/download', label: 'Download' },
      { href: '/account', label: 'Area personale' },
    ],
  },
  {
    title: 'Risorse',
    links: [
      { href: '/#faq', label: 'FAQ' },
      { href: '/#come-funziona', label: 'Come funziona' },
      { href: 'mailto:support@freshphone.app', label: 'Supporto' },
    ],
  },
  {
    title: 'Legale',
    links: [
      { href: '/privacy', label: 'Privacy Policy' },
      { href: '/terms', label: 'Termini' },
      { href: '/refund', label: 'Rimborsi' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-ink2">
            Il modo più semplice per organizzare il tuo iPhone e fare spazio, su Windows. Senza iTunes.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="font-display text-sm font-semibold text-ink">{c.title}</h3>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink2 transition-colors hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-ink2 sm:flex-row">
          <span>© {new Date().getFullYear()} FreshPhone. Tutti i diritti riservati.</span>
          <span>Non affiliato ad Apple Inc. · iPhone è un marchio di Apple Inc.</span>
        </div>
      </div>
    </footer>
  )
}
