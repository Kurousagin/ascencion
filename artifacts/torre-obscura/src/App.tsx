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
      <div className="scanlines" />
      <div className="flex-1 overflow-hidden relative z-10">
        {tab === 'obs' && <Dashboard />}
        {tab === 'torre' && <Tower />}
        {tab === 'cidadela' && <Citadel />}
        {tab === 'povo' && <People />}
        {tab === 'log' && <LogScreen />}
      </div>
      <BottomNav currentTab={tab} onTabChange={setTab} />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <div className="min-h-[100dvh] bg-[#05080a] flex justify-center text-foreground font-mono">
        <MainGameArea />
      </div>
    </GameProvider>
  );
}

export default App;
