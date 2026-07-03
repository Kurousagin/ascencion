import { useGame } from '../context/GameContext';

export function TitleScreen() {
  const { hasSave, startNewGame, continueGame } = useGame();
  
  let saveDay = 0;
  let saveVivos = 0;
  if (hasSave) {
    try {
      const saved = localStorage.getItem('torre_obscura_save');
      if (saved) {
        const parsed = JSON.parse(saved);
        saveDay = parsed.dia;
        saveVivos = parsed.npcs.filter((n: any) => n.vivo).length;
      }
    } catch(e) {}
  }

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="z-10 flex flex-col items-center text-center space-y-12 w-full max-w-sm">
        
        <div className="w-full flex flex-col items-center">
          <div className="flex items-center gap-2 mb-4 w-3/4">
            <div className="h-[1px] bg-gradient-to-r from-transparent to-primary/50 flex-1" />
            <div className="w-1.5 h-1.5 rotate-45 bg-primary/80" />
            <div className="h-[1px] bg-gradient-to-l from-transparent to-primary/50 flex-1" />
          </div>
          
          <h1 className="text-5xl md:text-6xl font-cinzel font-bold tracking-[0.2em] text-primary drop-shadow-[0_2px_12px_rgba(212,175,55,0.4)] mb-6">
            TORRE OBSCURA
          </h1>
          
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent glow-gold mb-6" />
          
          <p className="text-secondary font-inter text-sm tracking-[0.3em] uppercase">
            O OBSERVADOR AGUARDA
          </p>
        </div>

        <div className="text-muted text-xs leading-loose text-left border-l border-primary/30 pl-4 my-8 space-y-1 w-full max-w-[280px]">
          <p>• Conexão estabelecida.</p>
          <p>• Sinais vitais detectados.</p>
          <p>• Eles não sabem que você observa.</p>
        </div>

        <div className="space-y-4 w-full mt-auto">
          <button
            onClick={startNewGame}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 font-cinzel font-bold text-lg tracking-[0.2em] transition-all"
          >
            NOVO JOGO
          </button>
          
          <div className="relative w-full flex flex-col items-center">
            {hasSave && (
              <div className="absolute -top-7 px-3 py-1 bg-card border border-primary/30 rounded-full text-[10px] text-primary tracking-wider z-10 shadow-lg">
                DIA {saveDay} • {saveVivos} SOBREVIVENTES
              </div>
            )}
            <button
              onClick={continueGame}
              disabled={!hasSave}
              className={`w-full border h-14 font-cinzel font-bold text-lg tracking-[0.2em] transition-all mt-3 ${
                hasSave 
                  ? 'border-primary text-primary hover:bg-primary/10' 
                  : 'border-muted text-muted cursor-not-allowed opacity-50'
              }`}
            >
              CONTINUAR
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
