import { useGame } from '../context/GameContext';

export function GameOverScreen() {
  const { state, startNewGame } = useGame();

  if (state.vitoria) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-[#0A0E14] text-center relative overflow-hidden z-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="z-10 flex flex-col items-center">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent glow-gold mb-8 max-w-xs" />
          
          <h1 className="text-4xl md:text-6xl font-cinzel font-bold tracking-[0.2em] text-primary drop-shadow-[0_0_20px_rgba(212,175,55,0.6)] mb-6">
            ÁPICE ALCANÇADO
          </h1>
          
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent glow-gold mt-2 mb-10 max-w-xs" />

          <div className="bg-black/30 border border-primary/20 p-6 rounded-sm mb-12 min-w-[280px] shadow-lg shadow-primary/5">
            <p className="text-foreground font-cinzel text-lg mb-4 tracking-widest">CICLO CONCLUÍDO</p>
            <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
              <span className="text-secondary text-xs tracking-widest font-inter">DIAS SOBREVIVIDOS</span>
              <span className="text-primary font-bold font-cinzel text-lg">{state.dia}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <span className="text-secondary text-xs tracking-widest font-inter">ALMAS RESGATADAS</span>
              <span className="text-primary font-bold font-cinzel text-lg">{state.npcs.filter(n => n.vivo).length}</span>
            </div>
          </div>
          
          <button
            onClick={() => startNewGame()}
            className="w-full max-w-sm h-[60px] bg-primary text-primary-foreground font-cinzel font-bold tracking-[0.2em] text-lg rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:bg-primary/90 transition-all active:scale-95"
          >
            NOVO CICLO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-[#050508] text-center relative overflow-hidden z-50">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(248,81,73,0.15)_0%,transparent_70%)] pointer-events-none" />
      
      <div className="z-10 flex flex-col items-center">
        <h1 className="text-3xl md:text-5xl font-cinzel font-bold tracking-[0.2em] text-destructive drop-shadow-[0_0_20px_rgba(248,81,73,0.6)] mb-8">
          TRANSMISSÃO ENCERRADA
        </h1>
        
        <p className="text-muted-foreground font-inter text-sm mb-2 tracking-wide max-w-[280px] leading-relaxed">
          Todos os sobreviventes pereceram na escuridão no Dia {state.dia}.
        </p>
        <p className="text-secondary/50 font-inter text-xs tracking-widest mb-16 uppercase">
          O Observador aguarda o próximo sacrifício.
        </p>
        
        <div className="w-full max-w-sm space-y-4">
          <button
            onClick={() => startNewGame()}
            className="w-full h-[60px] border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-cinzel font-bold tracking-[0.2em] text-lg transition-all rounded-sm hover:shadow-[0_0_15px_rgba(248,81,73,0.4)]"
          >
            NOVO JOGO
          </button>
        </div>
      </div>
    </div>
  );
}
