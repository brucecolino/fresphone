import { NextResponse } from 'next/server'
import { PLANS, isPaidPlan, type PlanId } from '@freshphone/shared'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { getStripe, isStripeConfigured } from '@/lib/stripe'
import { createPayPalOrder, isPayPalConfigured } from '@/lib/paypal'
import { sharedPlanToPrisma } from '@/lib/licensing'
import { validatePromo, discountedEur, type ValidPromo } from '@/lib/promo'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { plan?: string; provider?: string; promoCode?: string }
  const plan = body.plan
  const provider = body.provider === 'paypal' ? 'paypal' : 'stripe'

  if (!plan || !(plan in PLANS) || !isPaidPlan(plan as PlanId)) {
    return NextResponse.json({ error: 'Piano non valido' }, { status: 400 })
  }

  const p = PLANS[plan as PlanId]
  const session = await auth()
  const email = session?.user?.email ?? undefined
  const userId = session?.user?.id
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin

  // Promo validata lato server (mai fidarsi del client)
  let promo: ValidPromo | null = null
  if (body.promoCode) {
    const res = await validatePromo(body.promoCode, plan as PlanId)
    if (!res.ok) return NextResponse.json({ error: res.error }, { status: 400 })
    promo = res.promo
  }

  const cart = await prisma.cart
    .create({
      data: {
        plan: sharedPlanToPrisma(plan as PlanId),
        email,
        userId: userId ?? undefined,
        promoCodeId: promo?.id ?? undefined,
      },
    })
    .catch(() => null)

  if (provider === 'paypal') {
    if (!isPayPalConfigured()) return NextResponse.json({ error: 'PayPal non ancora configurato.' }, { status: 503 })
    try {
      const amount = promo ? discountedEur(p.priceEur, promo) : p.priceEur
      const order = await createPayPalOrder({
        amountEur: amount,
        customId: `${plan}|${cart?.id ?? ''}|${userId ?? ''}|${promo?.id ?? ''}`,
        description: `FreshPhone — piano ${p.name}`,
        returnUrl: `${site}/api/paypal/capture`,
        cancelUrl: `${site}/checkout?plan=${plan}&canceled=1`,
      })
      return NextResponse.json({ url: order.approveUrl })
    } catch (e) {
      console.error('paypal create error', e)
      return NextResponse.json({ error: 'Errore nella creazione del pagamento PayPal' }, { status: 500 })
    }
  }

  // Stripe
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Pagamenti non ancora configurati. Riprova più tardi.' }, { status: 503 })
  }
  const isSub = p.interval !== 'once'
  const priceId = p.stripePriceEnv ? process.env[p.stripePriceEnv] : undefined
  if (isSub && !priceId) {
    return NextResponse.json({ error: `Prezzo Stripe mancante: configura ${p.stripePriceEnv}` }, { status: 503 })
  }

  try {
    const stripe = getStripe()
    let discounts: { coupon: string }[] | undefined
    if (promo) {
      const coupon = await stripe.coupons.create(
        promo.type === 'PERCENT'
          ? { percent_off: promo.value, duration: 'once' }
          : { amount_off: promo.value, currency: 'eur', duration: 'once' },
      )
      discounts = [{ coupon: coupon.id }]
    }
    const checkout = await stripe.checkout.sessions.create({
      mode: isSub ? 'subscription' : 'payment',
      line_items: priceId
        ? [{ price: priceId, quantity: 1 }]
        : [
            {
              price_data: {
                currency: 'eur',
                product_data: { name: `FreshPhone — piano ${p.name}` },
                unit_amount: Math.round(p.priceEur * 100),
              },
              quantity: 1,
            },
          ],
      customer_email: email,
      success_url: `${site}/account?purchase=success`,
      cancel_url: `${site}/checkout?plan=${plan}&canceled=1`,
      metadata: { plan, cartId: cart?.id ?? '', userId: userId ?? '', promoCodeId: promo?.id ?? '' },
      ...(discounts ? { discounts } : {}),
      ...(isSub ? { subscription_data: { metadata: { plan } } } : {}),
    })
    return NextResponse.json({ url: checkout.url })
  } catch (e) {
    console.error('checkout error', e)
    return NextResponse.json({ error: 'Errore nella creazione del pagamento' }, { status: 500 })
  }
}
