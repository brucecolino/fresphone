import type { Metadata } from 'next'
import Link from 'next/link'
import { Download, Monitor, ShieldCheck, Cpu } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Download — FreshPhone',
  description: 'Scarica FreshPhone per Windows 10 e 11. Gratis, con export fino a 50 file.',
}

const reqs = [
  { icon: Monitor, label: 'Windows 10 o 11 (64-bit)' },
  { icon: Cpu, label: 'iPhone con cavo USB · nessun jailbreak' },
  { icon: ShieldCheck, label: 'Driver installati in automatico al primo avvio' },
]

export default function DownloadPage() {
  return (
    <section className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold sm:text-5xl">Scarica FreshPhone</h1>
        <p className="mt-4 text-ink2">
          Gratis per Windows. Sfoglia tutto, ordina e filtra, ed esporta fino a 50 file senza pagare.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link
            href="https://github.com/brucecolino/fresphone/releases"
            className="bg-grad inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
          >
            <Download size={18} /> Scarica per Windows (.exe)
          </Link>
          <span className="text-xs text-ink2">L’installer sarà disponibile alla prima release · ~120 MB</span>
        </div>
      </div>

      <div className="mx-auto mt-14 max-w-xl rounded-xl2 border border-line bg-surface p-6">
        <h2 className="font-display text-lg font-semibold">Requisiti</h2>
        <ul className="mt-4 space-y-3">
          {reqs.map((r) => (
            <li key={r.label} className="flex items-center gap-3 text-sm text-ink2">
              <r.icon size={18} className="shrink-0 text-brand" />
              {r.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
