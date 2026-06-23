import type { Metadata } from 'next'
import Link from 'next/link'
import { PLANS, formatEur, isPaidPlan, type PlanId } from '@freshphone/shared'
import { CheckoutButtons } from '@/components/checkout-buttons'

export const metadata: Metadata = {
  title: 'Checkout — FreshPhone',
}

const intervalLabel: Record<string, string> = {
  month: 'al mese',
  '6month': 'ogni 6 mesi',
  year: 'all’anno',
  once: 'una tantum',
}

function resolvePlan(raw?: string): PlanId {
  if (raw && raw in PLANS && isPaidPlan(raw as PlanId)) return raw as PlanId
  return 'yearly'
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: rawPlan } = await searchParams
  const planId = resolvePlan(rawPlan)
  const plan = PLANS[planId]

  return (
    <section className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Completa l’acquisto</h1>

        <div className="mt-6 rounded-xl2 border border-line bg-surface p-6">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-display text-lg font-semibold">Piano {plan.name}</p>
              <p className="text-sm text-ink2">{plan.tagline}</p>
            </div>
            <div className="text-right">
              <p className="font-display text-2xl font-bold">{formatEur(plan.priceEur)}</p>
              <p className="text-xs text-ink2">{intervalLabel[plan.interval ?? 'once']}</p>
            </div>
          </div>

          <CheckoutButtons plan={planId} />

          <p className="mt-5 text-xs text-ink2">
            Pagamento sicuro. Dopo l’acquisto ricevi subito la licenza via email e nell’area personale.
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-ink2">
          Cambia piano dalla{' '}
          <Link href="/pricing" className="text-brand hover:underline">
            pagina prezzi
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
