import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import type { PlanId } from '@freshphone/shared'
import { getStripe } from '@/lib/stripe'
import { fulfillOrder } from '@/lib/fulfillment'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: 'webhook non configurato' }, { status: 503 })

  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'firma mancante' }, { status: 400 })

  const raw = await req.text()
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(raw, sig, secret)
  } catch {
    return NextResponse.json({ error: 'firma non valida' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session
        const plan = (s.metadata?.plan ?? '') as PlanId
        const email = s.customer_details?.email ?? s.customer_email ?? ''
        if (plan && email) {
          await fulfillOrder({
            provider: 'STRIPE',
            providerCheckoutId: s.id,
            providerSubscriptionId: typeof s.subscription === 'string' ? s.subscription : null,
            plan,
            email,
            userId: s.metadata?.userId || null,
            amountCents: s.amount_total ?? 0,
            cartId: s.metadata?.cartId || null,
            promoCodeId: s.metadata?.promoCodeId || null,
          })
        }
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const order = await prisma.order.findFirst({
          where: { providerSubscriptionId: sub.id },
          include: { license: true },
        })
        if (order?.license) {
          await prisma.license.update({
            where: { id: order.license.id },
            data: { status: 'EXPIRED', subscriptionStatus: 'CANCELED' },
          })
        }
        break
      }
      default:
        break
    }
  } catch (e) {
    console.error('stripe webhook handler error', e)
    return NextResponse.json({ error: 'handler error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
