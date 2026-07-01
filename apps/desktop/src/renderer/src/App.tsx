import { useEffect, useState } from 'react'
import { useTheme } from './store/theme'
import { useDevice } from './store/device'
import { Header } from './components/header'
import { Sidebar, type NavKey } from './components/sidebar'
import { Home } from './views/home'
import { Photos } from './views/photos'
import { Wizard } from './views/wizard'
import { Spazio } from './views/spazio'
import { Settings } from './views/settings'
import { UpdateBanner } from './components/UpdateBanner'
import { WhatsNew } from './components/WhatsNew'
import { useWhatsNew } from './store/whatsnew'

export default function App() {
  const init = useTheme((s) => s.init)
  const [active, setActive] = useState<NavKey>('home')

  useEffect(() => {
    void init()
    const dev = useDevice.getState()
    dev.start() // polling continuo del dispositivo per tutta la vita dell'app
    return () => dev.stop()
  }, [init])

  useEffect(() => {
    // "Novità" dopo un aggiornamento: se la versione è cambiata rispetto all'ultima
    // vista, mostra il pannello una volta e memorizza la versione corrente.
    Promise.all([window.fp.updates.version(), window.fp.settings.get()])
      .then(([v, s]) => {
        const seen = (s as { whatsNewSeenVersion?: string }).whatsNewSeenVersion
        if (v && v !== seen) {
          useWhatsNew.getState().show()
          void window.fp.settings.set({ whatsNewSeenVersion: v })
        }
      })
      .catch(() => undefined)
  }, [])

  return (
    <div className="flex h-full flex-col bg-bg text-ink">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar active={active} onSelect={setActive} />
        <main className="min-w-0 flex-1 overflow-auto">
          {active === 'home' && <Home onNavigate={setActive} />}
          {active === 'photos' && <Photos />}
          {active === 'wizard' && <Wizard />}
          {active === 'spazio' && <Spazio />}
          {active === 'settings' && <Settings />}
        </main>
      </div>
      <UpdateBanner />
      <WhatsNew />
    </div>
  )
}
