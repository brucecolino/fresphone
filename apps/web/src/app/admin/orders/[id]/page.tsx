import Link from 'next/link'
import { notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { PLANS, formatEur } from '@freshphone/shared'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/admin'
import { prismaPlanToShared } from '@/lib/licensing'
import { sendMail, orderEmailHtml } from '@/lib/mail'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const fmt = (d: Date) => new Intl.DateTimeFormat('it-IT', { dateStyle: 'medium', timeStyle: 'short' }).format(d)

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id }, include: { license: true } })
  if (!order) notFound()

  async function resendLicense() {
    'use server'
    const admin = await requireAdmin()
    const o = await prisma.order.findUnique({ where: { id }, include: { license: true } })
    if (!o?.license) return
    await sendMail({
      to: o.email,
      subject: `Ordine ${o.orderNumber ?? ''} confermato — FreshPhone`,
      html: orderEmailHtml({
        orderNumber: o.orderNumber ?? o.id.slice(0, 8),
        planName: PLANS[prismaPlanToShared(o.plan)].name,
        key: o.license.key,
        amountEur: o.amountCents / 100,
        dateStr: fmt(o.createdAt),
        provider: o.provider,
      }),
    })
    await prisma.license.update({ where: { id: o.license.id }, data: { lastResentAt: new Date() } })
    await prisma.auditLog.create({
      data: { actorEmail: admin.email ?? 'admin', action: 'license.resend', targetType: 'order', targetId: id, details: { email: o.email } },
    })
    revalidatePath(`/admin/orders/${id}`)
  }

  async function updateEmail(formData: FormData) {
    'use server'
    const admin = await requireAdmin()
    const newEmail = String(formData.get('email') ?? '').trim().toLowerCase()
    if (!EMAIL_RE.test(newEmail)) return
    const o = await prisma.order.findUnique({ where: { id } })
    if (!o || o.email === newEmail) return
    await prisma.order.update({ where: { id }, data: { email: newEmail } })
    await prisma.auditLog.create({
      data: {
        actorEmail: admin.email ?? 'admin',
        action: 'order.email.update',
        targetType: 'order',
        targetId: id,
        details: { from: o.email, to: newEmail },
      },
    })
    revalidatePath(`/admin/orders/${id}`)
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/orders" className="text-sm text-ink2 hover:text-ink">
        ← Ordini
      </Link>
      <h1 className="mt-2 text-2xl font-bold">Ordine {order.orderNumber ?? order.id.slice(0, 8)}</h1>
      <p className="mt-1 text-sm text-ink2">
        {PLANS[prismaPlanToShared(order.plan)].name} · {formatEur(order.amountCents / 100)} · {order.provider} · {order.status} ·{' '}
        {fmt(order.createdAt)}
      </p>
      <p className="mt-0.5 text-xs text-ink2">Rif. interno: {order.id}</p>

      <div className="mt-6 rounded-xl2 border border-line bg-surface p-5">
        <h2 className="font-display font-semibold">Email cliente</h2>
        <form action={updateEmail} className="mt-3 flex flex-wrap gap-2">
          <input
            name="email"
            type="email"
            defaultValue={order.email}
            className="w-full max-w-xs rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
          />
          <button className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-bg">Salva</button>
        </form>
        <p className="mt-2 text-xs text-ink2">La modifica viene registrata nell'audit log.</p>
      </div>

      <div className="mt-5 rounded-xl2 border border-line bg-surface p-5">
        <h2 className="font-display font-semibold">Licenza</h2>
        {order.license ? (
          <>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <code className="rounded-lg border border-line bg-bg px-3 py-1.5 text-sm tracking-wide">{order.license.key}</code>
              <span className="text-xs text-ink2">
                {order.license.status}
                {order.license.expiresAt ? ` · scade ${fmt(order.license.expiresAt)}` : ' · a vita'}
              </span>
            </div>
            {order.license.lastResentAt && (
              <p className="mt-2 text-xs text-ink2">Ultimo reinvio: {fmt(order.license.lastResentAt)}</p>
            )}
            <form action={resendLicense} className="mt-4">
              <button className="bg-grad rounded-full px-5 py-2.5 text-sm font-semibold text-white">Reinvia licenza via email</button>
            </form>
          </>
        ) : (
          <p className="mt-3 text-sm text-ink2">Nessuna licenza associata (ordine non ancora pagato).</p>
        )}
      </div>
    </div>
  )
}
