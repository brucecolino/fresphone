import { NextResponse } from 'next/server'
import { isLicenseKeyShape } from '@freshphone/shared'
import { prisma } from '@/lib/db'
import { mintActivationToken } from '@/lib/licensing'

export const runtime = 'nodejs'

// Chiamato dall'app desktop (deep link freshphone://activate o inserimento manuale).
// Verifica la licenza, registra la postazione (limite posti) e restituisce un token
// di attivazione firmato, verificabile offline dall'app.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    key?: string
    machineId?: string
    machineName?: string
  }
  const key = (body.key ?? '').trim().toUpperCase()
  const machineId = (body.machineId ?? '').trim()

  if (!isLicenseKeyShape(key)) return NextResponse.json({ error: 'Key non valida' }, { status: 400 })
  if (!machineId) return NextResponse.json({ error: 'Identificativo dispositivo mancante' }, { status: 400 })

  const lic = await prisma.license.findUnique({ where: { key }, include: { activations: true } })
  if (!lic) return NextResponse.json({ error: 'Licenza non trovata' }, { status: 404 })

  if (lic.expiresAt && lic.expiresAt.getTime() < Date.now()) {
    if (lic.status !== 'EXPIRED') await prisma.license.update({ where: { id: lic.id }, data: { status: 'EXPIRED' } })
    return NextResponse.json({ error: 'Licenza scaduta' }, { status: 403 })
  }
  if (lic.status !== 'ACTIVE') return NextResponse.json({ error: 'Licenza non attiva' }, { status: 403 })

  const already = lic.activations.find((a) => a.machineId === machineId && !a.revoked)
  const activeCount = lic.activations.filter((a) => !a.revoked).length
  if (!already && activeCount >= lic.seatLimit) {
    return NextResponse.json({ error: 'Limite di postazioni raggiunto per questa licenza' }, { status: 403 })
  }

  await prisma.licenseActivation.upsert({
    where: { licenseId_machineId: { licenseId: lic.id, machineId } },
    update: { lastSeenAt: new Date(), revoked: false, machineName: body.machineName ?? undefined },
    create: { licenseId: lic.id, machineId, machineName: body.machineName ?? undefined },
  })

  try {
    const token = await mintActivationToken(key, machineId)
    return NextResponse.json({ token, plan: lic.plan.toLowerCase(), expiresAt: lic.expiresAt })
  } catch (e) {
    console.error('activation sign error', e)
    return NextResponse.json({ error: 'Impossibile firmare l’attivazione' }, { status: 500 })
  }
}
