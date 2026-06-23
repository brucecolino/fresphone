import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export default async function NewsletterUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  let ok = false

  if (token) {
    const sub = await prisma.newsletterSubscriber.findUnique({ where: { unsubToken: token } }).catch(() => null)
    if (sub) {
      await prisma.newsletterSubscriber.update({ where: { id: sub.id }, data: { status: 'UNSUBSCRIBED' } })
      ok = true
    }
  }

  return (
    <section className="container-x py-20 text-center">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">{ok ? 'Disiscrizione completata' : 'Link non valido'}</h1>
        <p className="mt-3 text-ink2">
          {ok ? 'Non riceverai più email di marketing da FreshPhone.' : 'Il link non è valido.'}
        </p>
      </div>
    </section>
  )
}
