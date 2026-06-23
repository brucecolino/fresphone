import { NextResponse } from 'next/server'
import { PLANS, isPaidPlan, type PlanId } from '@freshphone/shared'
import { validatePromo, discountedEur, discountLabel } from '@/lib/promo'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  const { code, plan } = (await req.json().catch(() => ({}))) as { code?: string; plan?: string }
  if (!plan || !(plan in PLANS) || !isPaidPlan(plan as PlanId)) {
    return NextResponse.json({ ok: false, error: 'Piano non valido' }, { status: 400 })
  }
  const res = await validatePromo(code ?? '', plan as PlanId)
  if (!res.ok) return NextResponse.json({ ok: false, error: res.error })

  const price = PLANS[plan as PlanId].priceEur
  return NextResponse.json({
    ok: true,
    code: res.promo.code,
    label: discountLabel(res.promo),
    discountedEur: discountedEur(price, res.promo),
  })
}
