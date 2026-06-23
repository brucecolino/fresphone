'use client'

import { useEffect, useState } from 'react'
import { formatEur } from '@freshphone/shared'

interface Applied {
  code: string
  label: string
  discountedEur: number
}

interface Recovery {
  enabled: boolean
  code: string
  text: string
}

export function CheckoutPanel({
  plan,
  basePriceEur,
  recovery,
}: {
  plan: string
  basePriceEur: number
  recovery: Recovery
}) {
  const [promoInput, setPromoInput] = useState('')
  const [applied, setApplied] = useState<Applied | null>(null)
  const [promoError, setPromoError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [payError, setPayError] = useState<string | null>(null)
  const [exit, setExit] = useState(false)

  useEffect(() => {
    if (!recovery.enabled || !recovery.code) return
    function onLeave(e: MouseEvent) {
      if (e.clientY <= 0 && !e.relatedTarget) setExit(true)
    }
    document.addEventListener('mouseout', onLeave)
    return () => document.removeEventListener('mouseout', onLeave)
  }, [recovery.enabled, recovery.code])

  async function applyCode(code: string) {
    setPromoError(null)
    setChecking(true)
    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, plan }),
      })
      const data = (await res.json()) as { ok?: boolean; code?: string; label?: string; discountedEur?: number; error?: string }
      if (!data.ok || data.discountedEur == null) {
        setApplied(null)
        setPromoError(data.error ?? 'Codice non valido')
        return
      }
      setApplied({ code: data.code ?? code, label: data.label ?? '', discountedEur: data.discountedEur })
      setExit(false)
    } catch {
      setPromoError('Errore di rete')
    } finally {
      setChecking(false)
    }
  }

  async function buy(provider: 'stripe' | 'paypal') {
    setPayError(null)
    setLoading(provider)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, provider, promoCode: applied?.code }),
      })
      const data = (await res.json()) as { url?: string; error?: string }
      if (!res.ok || !data.url) {
        setPayError(data.error ?? 'Si è verificato un errore.')
        setLoading(null)
        return
      }
      window.location.href = data.url
    } catch {
      setPayError('Errore di rete. Riprova.')
      setLoading(null)
    }
  }

  const price = applied ? applied.discountedEur : basePriceEur

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold">{formatEur(price)}</span>
        {applied && <span className="text-sm text-ink2 line-through">{formatEur(basePriceEur)}</span>}
        {applied && <span className="text-sm font-medium text-brand">{applied.label}</span>}
      </div>

      {exit && !applied && (
        <div className="mt-4 rounded-xl2 border border-brand bg-grad-soft p-4">
          <p className="text-sm font-medium">{recovery.text || 'Aspetta! Ecco uno sconto per te.'}</p>
          <button
            onClick={() => {
              setPromoInput(recovery.code)
              applyCode(recovery.code)
            }}
            className="bg-grad mt-3 rounded-full px-4 py-2 text-sm font-semibold text-white"
          >
            Applica il codice {recovery.code}
          </button>
        </div>
      )}

      <div className="mt-5">
        {applied ? (
          <div className="flex items-center justify-between rounded-lg border border-line bg-bg px-3 py-2 text-sm">
            <span>
              Codice <span className="font-medium">{applied.code}</span> applicato
            </span>
            <button onClick={() => setApplied(null)} className="text-ink2 hover:text-ink">
              Rimuovi
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value)}
              placeholder="Codice sconto"
              className="flex-1 rounded-lg border border-line bg-bg px-3 py-2 text-sm uppercase outline-none focus:border-brand"
            />
            <button
              onClick={() => applyCode(promoInput)}
              disabled={checking || !promoInput}
              className="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:bg-bg disabled:opacity-60"
            >
              {checking ? '…' : 'Applica'}
            </button>
          </div>
        )}
        {promoError && <p className="mt-2 text-sm text-ink2">{promoError}</p>}
      </div>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => buy('stripe')}
          disabled={loading !== null}
          className="bg-grad w-full rounded-full px-4 py-3 text-sm font-semibold text-white transition-[filter] hover:brightness-110 disabled:opacity-60"
        >
          {loading === 'stripe' ? 'Attendi…' : 'Paga con carta (Stripe)'}
        </button>
        <button
          onClick={() => buy('paypal')}
          disabled={loading !== null}
          className="w-full rounded-full border border-line px-4 py-3 text-sm font-semibold text-ink transition-colors hover:bg-bg disabled:opacity-60"
        >
          {loading === 'paypal' ? 'Attendi…' : 'Paga con PayPal'}
        </button>
        {payError && <p className="text-sm text-ink2">{payError}</p>}
      </div>
    </div>
  )
}
