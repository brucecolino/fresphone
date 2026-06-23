// Genera una coppia di chiavi Ed25519 per firmare i token di attivazione licenza.
// Uso: node scripts/gen-keys.mjs
// La privata va in LICENSE_PRIVATE_KEY (solo server). La pubblica in
// NEXT_PUBLIC_LICENSE_PUBLIC_KEY e va inclusa anche nell'app desktop.

import { generateKeyPairSync } from 'node:crypto'

const { publicKey, privateKey } = generateKeyPairSync('ed25519')
const priv = privateKey.export({ type: 'pkcs8', format: 'pem' }).toString().trim()
const pub = publicKey.export({ type: 'spki', format: 'pem' }).toString().trim()

const oneLine = (s) => s.replace(/\r?\n/g, '\\n')

console.log('# Incolla negli env (Vercel / .env.local):\n')
console.log(`LICENSE_PRIVATE_KEY="${oneLine(priv)}"`)
console.log(`NEXT_PUBLIC_LICENSE_PUBLIC_KEY="${oneLine(pub)}"`)
console.log("\n# Chiave pubblica (multilinea) da includere nell'app desktop:\n")
console.log(pub)
