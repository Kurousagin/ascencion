import { useState } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { BottomNav } from './components/layout/BottomNav';
import { TitleScreen } from './pages/TitleScreen';
import { Dashboard } from './pages/Dashboard';
import { Tower } from './pages/Tower';
import { Citadel } from './pages/Citadel';
import { People } from './pages/People';
import { LogScreen } from './pages/LogScreen';
import { GameOverScreen } from './pages/GameOver';
import { AnimatePresence, motion } from 'framer-motion';

function MainGameArea() {
  const { state } = useGame();
  const [tab, setTab] = useState('obs');

  if (!state) {
    return <TitleScreen />;
  }

  if (state.gameOver || state.vitoria) {
    return <GameOverScreen />;
  }

  return (
    <div className="relative w-full h-[100dvh] max-w-md mx-auto bg-background border-x border-border shadow-2xl flex flex-col overflow-hidden">
      <div className="flex-1 overflow-hidden relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={tab} 
            initial={{ opacity: 0, y: 6 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0 }} 
            transition={{ duration: 0.18 }}
            className="h-full"
          >
            {tab === 'obs' && <Dashboard />}
            {tab === 'torre' && <Tower />}
            {tab === 'cidadela' && <Citadel />}
            {tab === 'povo' && <People />}
            {tab === 'log' && <LogScreen />}
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomNav currentTab={tab} onTabChange={setTab} />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <div className="min-h-[100dvh] bg-[#050508] flex justify-center text-foreground font-sans">
        <MainGameArea />
      </div>
    </GameProvider>
  );
}

export default App;
