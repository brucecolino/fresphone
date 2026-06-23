# FreshPhone — Smart iPhone File Manager

Gestore file iPhone per Windows: visualizza, ordina, filtra, sposta e fai spazio — conservando tutti i metadati. Più sito di vendita con licenze.

## Monorepo (pnpm workspaces)

```
apps/
  web/        # Sito Next.js (marketing, prezzi, area personale, acquisto, licenze) → Vercel
  desktop/    # App Electron (gestore file iPhone) → installer Windows
packages/
  shared/     # Formato licenza + firma/verifica condivisi tra web e desktop
```

## Comandi

```bash
pnpm install
pnpm web:dev        # sito su http://localhost:3000
pnpm desktop:dev    # app desktop (quando presente)
```

## Stato

- [x] Sito marketing + prezzi
- [ ] Auth (Google), DB, Stripe/PayPal, generazione licenze, area personale
- [ ] App desktop (scaffold F0 → F5)

Vedi il piano in `.claude/plans/` per i dettagli dell'app desktop.
