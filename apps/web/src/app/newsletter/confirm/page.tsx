import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function NewsletterConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams
  let ok = false

  if (token) {
    const sub = await prisma.newsletterSubscriber.findUnique({ where: { confirmToken: token } }).catch(() => null)
    if (sub) {
      await prisma.newsletterSubscriber.update({
        where: { id: sub.id },
        data: { status: 'CONFIRMED', consentAt: new Date(), confirmToken: null },
      })
      ok = true
    }
  }

  return (
    <section className="container-x py-20 text-center">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">{ok ? 'Iscrizione confermata' : 'Link non valido'}</h1>
        <p className="mt-3 text-ink2">
          {ok
            ? 'Grazie. Riceverai offerte e codici sconto FreshPhone. Puoi disiscriverti quando vuoi.'
            : 'Il link di conferma non è valido o è già stato usato.'}
        </p>
      </div>
    </section>
  )
}
