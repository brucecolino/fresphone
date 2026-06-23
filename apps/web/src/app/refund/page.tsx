import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Rimborsi — FreshPhone' }

export default function RefundPage() {
  return (
    <section className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Politica di rimborso</h1>
        <p className="mt-4 text-ink2">
          Puoi richiedere il rimborso completo entro 14 giorni dall’acquisto se FreshPhone non fa al caso tuo. La
          versione gratuita ti permette di provare l’app prima di pagare. Per richiedere un rimborso scrivi a
          support@freshphone.app indicando l’email d’acquisto.
        </p>
      </div>
    </section>
  )
}
