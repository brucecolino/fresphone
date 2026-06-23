import Stripe from 'stripe'

// Client Stripe inizializzato in modo lazy: nessuna istanza al caricamento del
// modulo, così la build passa anche senza chiavi.
let client: Stripe | null = null

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY non configurata')
  if (!client) client = new Stripe(key)
  return client
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY)
}
