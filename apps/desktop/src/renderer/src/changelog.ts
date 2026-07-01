export interface ChangelogEntry {
  version: string
  date?: string
  items: string[]
}

// Novità per versione (più recente in cima). Mostrate dopo un aggiornamento
// e richiamabili da Impostazioni → Aggiornamenti → "Novità di questa versione".
export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.1.1',
    date: '1 luglio 2026',
    items: [
      'Nuova sezione "Aggiornamenti" nelle Impostazioni: versione attuale, ricerca aggiornamenti, download e riavvio con un clic.',
      'Questa schermata "Novità" compare dopo ogni aggiornamento.',
      'Versione gratuita: fino a 50 file esportabili senza licenza.',
      'Le Live Photo (foto + video) vengono sempre spostate o esportate in coppia, senza mai separarle.',
      'Trasferimenti più affidabili e messaggi più chiari.',
    ],
  },
]

// Ritorna le novità della versione indicata (fallback: la più recente disponibile).
export function changelogFor(version: string): ChangelogEntry | undefined {
  return CHANGELOG.find((e) => e.version === version) ?? CHANGELOG[0]
}
