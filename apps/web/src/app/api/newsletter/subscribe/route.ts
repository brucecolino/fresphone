import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { sendMail, newsletterConfirmHtml } from '@/lib/mail'

export const runtime = 'nodejs'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string }
  const email = (body.email ?? '').trim().toLowerCase()

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
  if (existing?.status === 'CONFIRMED') {
    return NextResponse.json({ ok: true, already: true })
  }

  const confirmToken = crypto.randomUUID()
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { confirmToken, status: 'PENDING' },
    create: { email, confirmToken, status: 'PENDING', source: 'site' },
  })

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin
  const confirmUrl = `${site}/newsletter/confirm?token=${confirmToken}`
  await sendMail({
    to: email,
    subject: 'Conferma la tua iscrizione a FreshPhone',
    html: newsletterConfirmHtml({ confirmUrl }),
  })

  return NextResponse.json({ ok: true })
}
