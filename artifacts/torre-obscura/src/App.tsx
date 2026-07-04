import { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { AllianceProvider } from './context/AllianceContext';
import { WarProvider } from './context/WarContext';
import { BottomNav } from './components/layout/BottomNav';
import { TitleScreen } from './pages/TitleScreen';
import { Dashboard } from './pages/Dashboard';
import { Tower } from './pages/Tower';
import { Citadel } from './pages/Citadel';
import { People } from './pages/People';
import { Alliance } from './pages/Alliance';
import { War } from './pages/War';
import { LogScreen } from './pages/LogScreen';
import { GameOverScreen } from './pages/GameOver';
import { Onboarding } from './components/Onboarding';
import { ONBOARDING_KEY, ONBOARDING_PENDING } from './lib/onboarding-keys';
import { AnimatePresence, motion } from 'framer-motion';

function GuerraPendenteAlert({ onGoToWar }: { onGoToWar: () => void }) {
  const { state } = useGame();
  const gp = state?.guerraPendente;
  if (!gp) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-2 bg-destructive/15 border-b border-destructive/50 text-[11px] animate-pulse">
      <span className="text-destructive font-bold tracking-wide flex items-center gap-1.5 min-w-0">
        ⚔ INVASÃO: <span className="font-normal truncate">{gp.rival.nome}</span>
        <span className="text-destructive/70 font-normal shrink-0">— {gp.prazoResposta} dia{gp.prazoResposta !== 1 ? 's' : ''} para responder</span>
      </span>
      <button
        onClick={onGoToWar}
        className="shrink-0 px-2 py-1 bg-destructive text-destructive-foreground rounded-sm font-bold tracking-widest touch-manipulation text-[10px]"
      >
        DEFENDER
      </button>
    </div>
  );
}

function MainGameArea() {
  const { state } = useGame();
  const [tab, setTab] = useState('obs');
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Abre o onboarding quando o state passa de null → não-nulo (jogo recém-iniciado)
  // e há um sinal pendente de sessionStorage deixado pelo TitleScreen.
  useEffect(() => {
    if (state && sessionStorage.getItem(ONBOARDING_PENDING)) {
      sessionStorage.removeItem(ONBOARDING_PENDING);
      setOnboardingOpen(true);
    }
  }, [state]);

  if (!state) return <TitleScreen />;
  if (state.gameOver || state.vitoria) return <GameOverScreen />;

  return (
    <>
    <AllianceProvider>
    <WarProvider>
      <div
        className="relative w-full h-dvh max-w-md mx-auto bg-background border-x border-border shadow-2xl flex flex-col"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Alerta de invasão pendente */}
        <GuerraPendenteAlert onGoToWar={() => setTab('guerra')} />

        {/* Content area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {tab === 'obs'      && <Dashboard />}
              {tab === 'torre'    && <Tower />}
              {tab === 'cidadela' && <Citadel />}
              {tab === 'povo'     && <People />}
              {tab === 'alianca'  && <Alliance />}
              {tab === 'guerra'   && <War />}
              {tab === 'log'      && <LogScreen />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav always on top */}
        <div className="relative z-50 flex-shrink-0">
          <BottomNav currentTab={tab} onTabChange={setTab} />
        </div>
      </div>

    </WarProvider>
    </AllianceProvider>

    {/* Onboarding fora dos providers — não precisa de contexto de aliança/guerra */}
    <Onboarding
      open={onboardingOpen}
      onClose={() => {
        localStorage.setItem(ONBOARDING_KEY, '1');
        setOnboardingOpen(false);
      }}
    />
    </>
  );
}

function App() {
  return (
    <GameProvider>
      <div className="min-h-dvh bg-[#050508] flex justify-center text-foreground font-sans">
        <MainGameArea />
      </div>
    </GameProvider>
  );
}

export default App;
