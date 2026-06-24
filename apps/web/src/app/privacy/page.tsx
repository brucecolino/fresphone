import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Privacy Policy — FreshPhone' }

export default function PrivacyPage() {
  return (
    <section className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-4 text-ink2">
          FreshPhone elabora i file tra il tuo iPhone e il tuo PC in locale: nessun contenuto multimediale viene
          caricato sui nostri server. Per gli acquisti e l’area personale trattiamo solo i dati necessari (email,
          ordini, licenze) tramite i nostri fornitori di pagamento e autenticazione.
        </p>
        <p className="mt-4 text-sm text-ink2">
          Documento completo in preparazione, conforme al GDPR. Per richieste sui tuoi dati: support@freshphone.it.
        </p>
      </div>
    </section>
  )
}
