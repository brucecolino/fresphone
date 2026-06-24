import type { PaymentProvider } from '@prisma/client'
import { PLANS, type PlanId } from '@freshphone/shared'
import { prisma } from '@/lib/db'
import { issueLicense, sharedPlanToPrisma } from '@/lib/licensing'
import { sendMail, orderEmailHtml } from '@/lib/mail'

const fmtDate = (d: Date) => new Intl.DateTimeFormat('it-IT', { dateStyle: 'long' }).format(d)

// Numero d'ordine leggibile FP-AAAA-NNNN tramite sequenza Postgres (atomica).
// La sequenza viene creata una volta sul DB; in caso eccezionale di assenza,
// fallback su un valore basato su timestamp (comunque univoco).
async function nextOrderNumber(): Promise<string> {
  const year = new Date().getFullYear()
  try {
    const rows = await prisma.$queryRawUnsafe<{ n: bigint }[]>("SELECT nextval('fp_order_seq') AS n")
    return `FP-${year}-${Number(rows[0].n)}`
  } catch {
    return `FP-${year}-${Date.now().toString().slice(-7)}`
  }
}

// Evade pagamento -> ordine PAID + licenza + email. Idempotente sul providerCheckoutId
// (i webhook possono essere ritentati: niente doppie licenze, niente doppi numeri).
export async function fulfillOrder(params: {
  provider: PaymentProvider
  providerCheckoutId: string
  providerSubscriptionId?: string | null
  plan: PlanId
  email: string
  userId?: string | null
  amountCents: number
  cartId?: string | null
  promoCodeId?: string | null
}) {
  const existing = await prisma.order.findUnique({ where: { providerCheckoutId: params.providerCheckoutId } })
  const orderNumber = existing?.orderNumber ?? (await nextOrderNumber())

  const order = await prisma.order.upsert({
    where: { providerCheckoutId: params.providerCheckoutId },
    update: {
      status: 'PAID',
      providerSubscriptionId: params.providerSubscriptionId ?? undefined,
    },
    create: {
      orderNumber,
      email: params.email,
      userId: params.userId ?? undefined,
      plan: sharedPlanToPrisma(params.plan),
      provider: params.provider,
      providerCheckoutId: params.providerCheckoutId,
      providerSubscriptionId: params.providerSubscriptionId ?? undefined,
      amountCents: params.amountCents,
      status: 'PAID',
      promoCodeId: params.promoCodeId ?? undefined,
    },
  })

  let license = await prisma.license.findUnique({ where: { orderId: order.id } })
  if (!license) {
    license = await issueLicense({ plan: params.plan, userId: params.userId ?? null, orderId: order.id })
    await sendMail({
      to: params.email,
      subject: `Ordine ${order.orderNumber ?? ''} confermato — FreshPhone`,
      html: orderEmailHtml({
        orderNumber: order.orderNumber ?? order.id.slice(0, 8),
        planName: PLANS[params.plan].name,
        key: license.key,
        amountEur: order.amountCents / 100,
        dateStr: fmtDate(order.createdAt),
        provider: order.provider,
      }),
    })
    if (params.promoCodeId) {
      await prisma.promoCode
        .update({ where: { id: params.promoCodeId }, data: { redeemedCount: { increment: 1 } } })
        .catch(() => undefined)
      await prisma.promoRedemption
        .create({ data: { promoCodeId: params.promoCodeId, email: params.email, orderId: order.id } })
        .catch(() => undefined)
    }
  }

  if (params.cartId) {
    await prisma.cart
      .update({ where: { id: params.cartId }, data: { status: 'COMPLETED', recoveredAt: new Date() } })
      .catch(() => undefined)
  }

  return { order, license }
}
