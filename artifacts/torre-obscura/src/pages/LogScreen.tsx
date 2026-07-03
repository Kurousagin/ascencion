import { useGame } from '../context/GameContext';
import { LogEntry } from '../lib/game-data';

export function LogScreen() {
  const { state } = useGame();

  const getColor = (tipo: LogEntry['tipo']) => {
    switch(tipo) {
      case 'morte': 
      case 'traicao': return 'text-destructive border-destructive bg-destructive/5';
      case 'descoberta': return 'text-primary border-primary bg-primary/5';
      case 'vitoria': return 'text-success border-success bg-success/5';
      case 'alerta': return 'text-warning border-warning bg-warning/5';
      case 'evento': return 'text-orange border-orange bg-orange/5';
      default: return 'text-secondary border-secondary bg-background';
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 h-full flex flex-col">
      <header className="border-b border-border pb-4 shrink-0">
        <h2 className="text-xl font-bold tracking-widest text-foreground">REGISTROS</h2>
      </header>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {state.log.map(l => (
          <div key={l.id} className={`p-3 border-l-2 text-xs font-mono leading-relaxed ${getColor(l.tipo)}`}>
            <span className="opacity-50 mr-2">[DIA {l.dia.toString().padStart(3, '0')}]</span>
            {l.mensagem}
          </div>
        ))}
        {state.log.length === 0 && (
          <div className="text-secondary text-sm italic text-center mt-10">O registro está vazio.</div>
        )}
      </div>
    </div>
  );
}
