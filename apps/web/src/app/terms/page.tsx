import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Termini di servizio — FreshPhone' }

export default function TermsPage() {
  return (
    <section className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Termini di servizio</h1>
        <p className="mt-4 text-ink2">
          Acquistando una licenza di FreshPhone ottieni il diritto d’uso del software secondo il piano scelto. Le
          licenze a tempo (mensile, 6 mesi, annuale) hanno una scadenza; la licenza a vita non scade ed è valida per la
          major line corrente. Una licenza è valida per 1 PC.
        </p>
        <p className="mt-4 text-sm text-ink2">
          FreshPhone non è affiliato ad Apple Inc. iPhone è un marchio di Apple Inc. Documento completo in preparazione.
        </p>
      </div>
    </section>
  )
}
