import type { PaymentProvider } from '@prisma/client'
import { PLANS, type PlanId } from '@freshphone/shared'
import { prisma } from '@/lib/db'
import { issueLicense, sharedPlanToPrisma } from '@/lib/licensing'
import { sendMail, licenseEmailHtml } from '@/lib/mail'

// Evade pagamento -> ordine PAID + licenza + email. Idempotente sul providerCheckoutId
// (i webhook possono essere ritentati: niente doppie licenze).
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
  const order = await prisma.order.upsert({
    where: { providerCheckoutId: params.providerCheckoutId },
    update: {
      status: 'PAID',
      providerSubscriptionId: params.providerSubscriptionId ?? undefined,
    },
    create: {
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
      subject: 'La tua licenza FreshPhone',
      html: licenseEmailHtml({ key: license.key, planName: PLANS[params.plan].name }),
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
