// Definizione piani e prezzi di FreshPhone (EUR). Unica fonte di verità, usata da
// sito (prezzi/checkout) e app desktop (limiti/attivazione).

export type PlanId = 'free' | 'monthly' | 'sixmonth' | 'yearly' | 'lifetime'

export type BillingInterval = 'month' | '6month' | 'year' | 'once' | null

export interface Plan {
  id: PlanId
  /** Nome mostrato all'utente */
  name: string
  /** Prezzo in EUR (0 = gratuito) */
  priceEur: number
  /** Prezzo di lancio opzionale (es. lifetime intro) */
  introPriceEur?: number
  /** Periodicità di fatturazione */
  interval: BillingInterval
  /** Durata della licenza in giorni; null = illimitata (lifetime/free) */
  durationDays: number | null
  /** Limite di file esportabili (free trial); null = illimitato */
  exportLimit: number | null
  /** Evidenziato come "più popolare" */
  popular?: boolean
  /** Sottotitolo marketing */
  tagline: string
  /** Nome della variabile env con lo Stripe Price ID (lato server) */
  stripePriceEnv?: string
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    priceEur: 0,
    interval: null,
    durationDays: null,
    exportLimit: 50,
    tagline: 'Provalo senza limiti di tempo',
  },
  monthly: {
    id: 'monthly',
    name: 'Mensile',
    priceEur: 6.99,
    interval: 'month',
    durationDays: 30,
    exportLimit: null,
    tagline: 'Per una pulizia veloce',
    stripePriceEnv: 'STRIPE_PRICE_MONTHLY',
  },
  sixmonth: {
    id: 'sixmonth',
    name: '6 mesi',
    priceEur: 26.99,
    interval: '6month',
    durationDays: 182,
    exportLimit: null,
    tagline: 'Risparmia il 36%',
    stripePriceEnv: 'STRIPE_PRICE_SIXMONTH',
  },
  yearly: {
    id: 'yearly',
    name: 'Annuale',
    priceEur: 39.99,
    interval: 'year',
    durationDays: 365,
    exportLimit: null,
    popular: true,
    tagline: 'Il migliore per la maggior parte',
    stripePriceEnv: 'STRIPE_PRICE_YEARLY',
  },
  lifetime: {
    id: 'lifetime',
    name: 'A vita',
    priceEur: 89.99,
    introPriceEur: 49.99,
    interval: 'once',
    durationDays: null,
    exportLimit: null,
    tagline: 'Paga una volta, per sempre',
    stripePriceEnv: 'STRIPE_PRICE_LIFETIME',
  },
}

export const PAID_PLANS: PlanId[] = ['monthly', 'sixmonth', 'yearly', 'lifetime']

export function isPaidPlan(id: PlanId): boolean {
  return id !== 'free'
}

export function formatEur(value: number): string {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value)
}

/** Calcola la scadenza di una licenza a partire da una data di acquisto. */
export function computeExpiry(plan: PlanId, from: Date = new Date()): Date | null {
  const days = PLANS[plan].durationDays
  if (days == null) return null
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000)
}
