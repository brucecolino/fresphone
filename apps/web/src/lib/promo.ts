import type { PromoType } from '@prisma/client'
import type { PlanId } from '@freshphone/shared'
import { prisma } from '@/lib/db'
import { sharedPlanToPrisma } from '@/lib/licensing'

export interface ValidPromo {
  id: string
  code: string
  type: PromoType
  value: number
}

export async function validatePromo(
  code: string,
  plan: PlanId,
): Promise<{ ok: true; promo: ValidPromo } | { ok: false; error: string }> {
  const c = (code ?? '').trim().toUpperCase()
  if (!c) return { ok: false, error: 'Inserisci un codice' }

  const promo = await prisma.promoCode.findUnique({ where: { code: c } })
  if (!promo || !promo.active) return { ok: false, error: 'Codice non valido' }

  const now = new Date()
  if (promo.startsAt && promo.startsAt > now) return { ok: false, error: 'Codice non ancora attivo' }
  if (promo.expiresAt && promo.expiresAt < now) return { ok: false, error: 'Codice scaduto' }
  if (promo.maxRedemptions != null && promo.redeemedCount >= promo.maxRedemptions) {
    return { ok: false, error: 'Codice esaurito' }
  }
  if (promo.appliesToPlans.length > 0 && !promo.appliesToPlans.includes(sharedPlanToPrisma(plan))) {
    return { ok: false, error: 'Codice non valido per questo piano' }
  }
  return { ok: true, promo: { id: promo.id, code: promo.code, type: promo.type, value: promo.value } }
}

export function discountedEur(priceEur: number, promo: { type: PromoType; value: number }): number {
  const v = promo.type === 'PERCENT' ? priceEur * (1 - promo.value / 100) : priceEur - promo.value / 100
  return Math.max(0, Math.round(v * 100) / 100)
}

export function discountLabel(promo: { type: PromoType; value: number }): string {
  return promo.type === 'PERCENT' ? `-${promo.value}%` : `-${(promo.value / 100).toFixed(2)} €`
}
