import { revalidatePath, revalidateTag } from 'next/cache'
import { getPromoBanner, setPromoBanner, getRecoveryPromo, setRecoveryPromo } from '@/lib/settings'
import { requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const [banner, recovery] = await Promise.all([getPromoBanner(), getRecoveryPromo()])

  async function saveBanner(formData: FormData) {
    'use server'
    await requireAdmin()
    await setPromoBanner({
      enabled: formData.get('enabled') === 'on',
      text: String(formData.get('text') ?? '').trim(),
      href: String(formData.get('href') ?? '').trim() || undefined,
    })
    revalidateTag('site-settings')
    revalidatePath('/admin/settings')
  }

  async function saveRecovery(formData: FormData) {
    'use server'
    await requireAdmin()
    await setRecoveryPromo({
      enabled: formData.get('enabled') === 'on',
      code: String(formData.get('code') ?? '').trim().toUpperCase(),
      text: String(formData.get('text') ?? '').trim(),
    })
    revalidateTag('site-settings')
    revalidatePath('/admin/settings')
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold">Impostazioni sito</h1>

      <form action={saveBanner} className="space-y-4 rounded-xl2 border border-line bg-surface p-5">
        <h2 className="font-display font-semibold">Banner promozionale</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="enabled" defaultChecked={banner.enabled} />
          Mostra il banner in cima al sito
        </label>
        <div>
          <label className="text-sm text-ink2">Testo</label>
          <input
            name="text"
            defaultValue={banner.text}
            placeholder="Es. -20% sul piano annuale con il codice ESTATE"
            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-sm text-ink2">Link (opzionale)</label>
          <input
            name="href"
            defaultValue={banner.href ?? ''}
            placeholder="/pricing"
            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <button className="bg-grad rounded-full px-5 py-2.5 text-sm font-semibold text-white">Salva banner</button>
      </form>

      <form action={saveRecovery} className="space-y-4 rounded-xl2 border border-line bg-surface p-5">
        <h2 className="font-display font-semibold">Recupero carrello (offerta all’uscita)</h2>
        <p className="text-sm text-ink2">
          Mostra un’offerta con codice sconto a chi sta per lasciare il checkout senza pagare.
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="enabled" defaultChecked={recovery.enabled} />
          Attiva l’offerta di recupero
        </label>
        <div>
          <label className="text-sm text-ink2">Codice da proporre</label>
          <input
            name="code"
            defaultValue={recovery.code}
            placeholder="RESTA10"
            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm uppercase outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-sm text-ink2">Testo dell’offerta</label>
          <input
            name="text"
            defaultValue={recovery.text}
            placeholder="Aspetta! Usa RESTA10 per il 10% di sconto."
            className="mt-1 w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <button className="bg-grad rounded-full px-5 py-2.5 text-sm font-semibold text-white">Salva recupero</button>
      </form>
    </div>
  )
}
