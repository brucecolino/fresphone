import type { Metadata } from 'next'
import { KeyRound } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Area personale — FreshPhone',
}

export default function AccountPage() {
  return (
    <section className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="bg-grad-soft mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl text-brand">
          <KeyRound size={26} />
        </div>
        <h1 className="mt-5 text-3xl font-bold">Area personale</h1>
        <p className="mt-3 text-ink2">
          Accedi per vedere i tuoi ordini, le licenze e attivare FreshPhone con un clic.
        </p>

        <div className="mt-8 rounded-xl2 border border-line bg-surface p-6">
          <button
            disabled
            className="flex w-full items-center justify-center gap-3 rounded-full border border-line px-4 py-3 text-sm font-semibold opacity-60"
          >
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-grad-soft text-xs font-bold text-brand">
              G
            </span>
            Continua con Google
          </button>
          <p className="mt-4 text-xs text-ink2">Accesso con Google in arrivo. Apple e Facebook seguiranno.</p>
        </div>
      </div>
    </section>
  )
}
