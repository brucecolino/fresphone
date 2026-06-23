import type { Plan as PrismaPlan } from '@prisma/client'
import { generateLicenseKey, signActivationToken, computeExpiry, type PlanId } from '@freshphone/shared'
import { prisma } from '@/lib/db'

// Mapping tra enum Prisma (MAIUSCOLO) e PlanId condiviso (minuscolo).
export function prismaPlanToShared(p: PrismaPlan): PlanId {
  return p.toLowerCase() as PlanId
}

export function sharedPlanToPrisma(p: PlanId): PrismaPlan {
  return p.toUpperCase() as PrismaPlan
}

function privateKeyPem(): string {
  const raw = process.env.LICENSE_PRIVATE_KEY
  if (!raw) throw new Error('LICENSE_PRIVATE_KEY non configurata')
  return raw.replace(/\\n/g, '\n')
}

/** Crea e salva una nuova licenza per un piano (con scadenza in base al piano). */
export async function issueLicense(params: {
  plan: PlanId
  userId?: string | null
  orderId?: string | null
}) {
  const expiresAt = computeExpiry(params.plan)

  let key = generateLicenseKey()
  for (let i = 0; i < 5; i++) {
    const existing = await prisma.license.findUnique({ where: { key } })
    if (!existing) break
    key = generateLicenseKey()
  }

  return prisma.license.create({
    data: {
      key,
      plan: sharedPlanToPrisma(params.plan),
      userId: params.userId ?? undefined,
      orderId: params.orderId ?? undefined,
      expiresAt: expiresAt ?? undefined,
    },
  })
}

/** Firma un token di attivazione (verificabile offline dall'app desktop). */
export async function mintActivationToken(licenseKey: string, machineId?: string): Promise<string> {
  const lic = await prisma.license.findUnique({ where: { key: licenseKey } })
  if (!lic) throw new Error('Licenza non trovata')
  if (lic.status !== 'ACTIVE') throw new Error('Licenza non attiva')
  return signActivationToken(
    privateKeyPem(),
    { key: lic.key, plan: prismaPlanToShared(lic.plan), mid: machineId },
    lic.expiresAt ?? null,
  )
}
