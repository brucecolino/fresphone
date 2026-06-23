import type { Metadata } from 'next'
import Link from 'next/link'
import { PLANS, isPaidPlan, type PlanId } from '@freshphone/shared'
import { CheckoutPanel } from '@/components/checkout-panel'
import { getRecoveryPromo } from '@/lib/settings'

export const metadata: Metadata = {
  title: 'Checkout — FreshPhone',
}

export const dynamic = 'force-dynamic'

function resolvePlan(raw?: string): PlanId {
  if (raw && raw in PLANS && isPaidPlan(raw as PlanId)) return raw as PlanId
  return 'yearly'
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ plan?: string }> }) {
  const { plan: rawPlan } = await searchParams
  const planId = resolvePlan(rawPlan)
  const plan = PLANS[planId]
  const recovery = await getRecoveryPromo()

  return (
    <section className="container-x py-16 md:py-24">
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-bold">Completa l’acquisto</h1>

        <div className="mt-6 rounded-xl2 border border-line bg-surface p-6">
          <div>
            <p className="font-display text-lg font-semibold">Piano {plan.name}</p>
            <p className="text-sm text-ink2">{plan.tagline}</p>
          </div>

          <div className="mt-4">
            <CheckoutPanel plan={planId} basePriceEur={plan.priceEur} recovery={recovery} />
          </div>

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
