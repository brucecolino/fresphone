import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const dir = dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@freshphone/shared'],
  // Il monorepo è due livelli sopra apps/web: fissa il root per il file tracing (Vercel).
  outputFileTracingRoot: join(dir, '..', '..'),
}

export default nextConfig
