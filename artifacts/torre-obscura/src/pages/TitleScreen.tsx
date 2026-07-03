import { useGame } from '../context/GameContext';

export function TitleScreen() {
  const { hasSave, startNewGame, continueGame } = useGame();

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      <div className="z-10 flex flex-col items-center text-center space-y-8 w-full max-w-sm">
        
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold tracking-[0.2em] text-primary drop-shadow-[0_0_10px_rgba(0,229,204,0.5)]">
            TORRE OBSCURA
          </h1>
          <p className="text-secondary-foreground text-sm tracking-widest bg-primary inline-block px-2 py-0.5">
            O OBSERVADOR AGUARDA
          </p>
        </div>

        <div className="text-muted-foreground text-xs leading-relaxed text-left border-l-2 border-border pl-4 my-8">
          <p>&gt; CONEXÃO ESTABELECIDA.</p>
          <p>&gt; SINAIS VITAIS DETECTADOS.</p>
          <p>&gt; ELES NÃO SABEM QUE VOCÊ OBSERVA.</p>
        </div>

        <div className="space-y-4 w-full">
          <button
            onClick={startNewGame}
            className="w-full bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-background transition-colors h-14 font-bold tracking-widest"
          >
            NOVO JOGO
          </button>
          
          <button
            onClick={continueGame}
            disabled={!hasSave}
            className={`w-full border-2 transition-colors h-14 font-bold tracking-widest ${
              hasSave 
                ? 'border-secondary text-secondary hover:bg-secondary hover:text-background' 
                : 'border-muted text-muted cursor-not-allowed opacity-50'
            }`}
          >
            CONTINUAR
          </button>
        </div>

      </div>
    </div>
  );
}
