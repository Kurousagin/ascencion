import { useGame } from '../context/GameContext';

export function GameOverScreen() {
  const { state, startNewGame } = useGame();

  if (state.vitoria) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-background text-center relative overflow-hidden z-50">
        <div className="absolute inset-0 bg-primary/10 animate-pulse pointer-events-none" />
        <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] text-primary drop-shadow-[0_0_15px_rgba(0,229,204,0.8)] mb-6">
          ÁPICE ALCANÇADO
        </h1>
        <p className="text-foreground text-lg mb-2">A Torre foi conquistada no Dia {state.dia}.</p>
        <p className="text-secondary mb-12">{state.npcs.filter(n => n.vivo).length} sobreviventes testemunharam a luz.</p>
        
        <button
          onClick={startNewGame}
          className="w-full max-w-sm h-14 bg-primary text-background font-bold tracking-widest text-lg"
        >
          NOVO CICLO
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-background text-center relative overflow-hidden z-50">
      <div className="absolute inset-0 bg-destructive/10 animate-pulse pointer-events-none" />
      <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] text-destructive drop-shadow-[0_0_15px_rgba(255,68,102,0.8)] mb-6">
        TRANSMISSÃO ENCERRADA
      </h1>
      <p className="text-foreground text-lg mb-2">Todos os sobreviventes pereceram no Dia {state.dia}.</p>
      <p className="text-secondary mb-12">O Observador aguarda o próximo ciclo...</p>
      
      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={startNewGame}
          className="w-full h-14 border-2 border-destructive text-destructive hover:bg-destructive hover:text-background font-bold tracking-widest text-lg transition-colors"
        >
          NOVO JOGO
        </button>
      </div>
    </div>
  );
}
