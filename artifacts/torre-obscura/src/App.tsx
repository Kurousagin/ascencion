import { useState } from 'react';
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
import { AnimatePresence, motion } from 'framer-motion';

function MainGameArea() {
  const { state } = useGame();
  const [tab, setTab] = useState('obs');

  if (!state) return <TitleScreen />;
  if (state.gameOver || state.vitoria) return <GameOverScreen />;

  return (
    <AllianceProvider>
    <WarProvider>
      <div
        className="relative w-full h-dvh max-w-md mx-auto bg-background border-x border-border shadow-2xl flex flex-col"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        {/* Content area — no z-index so it never buries the nav */}
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

        {/* Nav always on top, z-50 beats framer-motion exit layers */}
        <div className="relative z-50 flex-shrink-0">
          <BottomNav currentTab={tab} onTabChange={setTab} />
        </div>
      </div>
    </WarProvider>
    </AllianceProvider>
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
