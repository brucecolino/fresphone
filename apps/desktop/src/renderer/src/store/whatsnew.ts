import { create } from 'zustand'

// Stato del pannello "Novità" (mostrato dopo un aggiornamento o su richiesta).
interface WhatsNewState {
  open: boolean
  show: () => void
  close: () => void
}

export const useWhatsNew = create<WhatsNewState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  close: () => set({ open: false }),
}))
