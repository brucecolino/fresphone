// Generazione license key e firma/verifica del token di attivazione.
//
// Modello:
//  - "license key" (FP-XXXX-XXXX-XXXX-XXXX): codice pubblico mostrato all'utente,
//    salvato nel DB con piano/scadenza/stato. Usato per attivare.
//  - "activation token": JWT firmato EdDSA dal server (chiave privata) e verificato
//    offline dall'app desktop (chiave pubblica inclusa nel bundle). Contiene il piano
//    e la scadenza, così l'app può validare senza essere sempre online.

import { SignJWT, jwtVerify, importPKCS8, importSPKI } from 'jose'
import type { PlanId } from './plans'

const ALG = 'EdDSA'
const ISSUER = 'freshphone'
// Alfabeto base32 senza caratteri ambigui (0/O, 1/I/L). 32 simboli → nessun bias su byte.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function randomGroup(len: number): string {
  const bytes = new Uint8Array(len)
  crypto.getRandomValues(bytes)
  let out = ''
  for (const b of bytes) out += ALPHABET[b % ALPHABET.length]
  return out
}

/** Genera una license key tipo FP-AB3K-9XQ2-MN7P-T4VW. */
export function generateLicenseKey(): string {
  return `FP-${randomGroup(4)}-${randomGroup(4)}-${randomGroup(4)}-${randomGroup(4)}`
}

/** Validazione di forma (non verifica l'esistenza nel DB). */
export function isLicenseKeyShape(key: string): boolean {
  return /^FP-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(key.trim().toUpperCase())
}

export interface ActivationClaims {
  /** license key associata */
  key: string
  plan: PlanId
  /** identificatore macchina (per limite di postazioni) */
  mid?: string | null
}

export interface VerifiedActivation extends ActivationClaims {
  iss: string
  iat: number
  exp?: number
}

/**
 * Firma un token di attivazione. `privatePem` è una chiave Ed25519 in formato PKCS#8 PEM
 * (lato server, da env). `expiresAt` = null per licenze a vita.
 */
export async function signActivationToken(
  privatePem: string,
  claims: ActivationClaims,
  expiresAt: Date | null,
): Promise<string> {
  const pk = await importPKCS8(privatePem, ALG)
  const jwt = new SignJWT({ key: claims.key, plan: claims.plan, mid: claims.mid ?? null })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setIssuer(ISSUER)
  if (expiresAt) jwt.setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
  return jwt.sign(pk)
}

/**
 * Verifica un token di attivazione con la chiave pubblica Ed25519 (SPKI PEM).
 * Lancia se la firma non è valida o il token è scaduto.
 */
export async function verifyActivationToken(
  publicPem: string,
  token: string,
): Promise<VerifiedActivation> {
  const pub = await importSPKI(publicPem, ALG)
  const { payload } = await jwtVerify(token, pub, { issuer: ISSUER })
  return payload as unknown as VerifiedActivation
}
