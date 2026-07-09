import { useGame } from '../context/GameContext';
import { LogEntry } from '../lib/game-data';

export function LogScreen() {
  const { state } = useGame();

  const getColorClasses = (tipo: LogEntry['tipo']) => {
    switch(tipo) {
      case 'morte': 
      case 'traicao': return { text: 'text-destructive', dot: 'bg-destructive shadow-[0_0_8px_rgba(248,81,73,0.8)]', border: 'border-destructive' };
      case 'descoberta': return { text: 'text-[#4A9EFF]', dot: 'bg-[#4A9EFF] shadow-[0_0_8px_rgba(74,158,255,0.8)]', border: 'border-[#4A9EFF]' };
      case 'vitoria': return { text: 'text-success', dot: 'bg-success shadow-[0_0_8px_rgba(63,185,80,0.8)]', border: 'border-success' };
      case 'alerta': return { text: 'text-warning', dot: 'bg-warning shadow-[0_0_8px_rgba(227,179,65,0.8)]', border: 'border-warning' };
      case 'evento': return { text: 'text-[#9B5DE5]', dot: 'bg-[#9B5DE5] shadow-[0_0_8px_rgba(155,93,229,0.8)]', border: 'border-[#9B5DE5]' };
      default: return { text: 'text-foreground', dot: 'bg-secondary', border: 'border-card-border' };
    }
  };

  return (
    <div className="p-4 space-y-4 pb-24 h-full flex flex-col">
      <header className="pb-3 border-b border-primary/30 relative shrink-0">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">REGISTROS</h2>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar pl-2 relative">
        <div className="absolute left-[13px] top-4 bottom-4 w-px bg-card-border" />
        <div className="space-y-6 pt-4 pb-4">
          {state.log.map((l, index) => {
            const styles = getColorClasses(l.tipo);
            return (
              <div key={l.id} className="relative pl-8">
                <div className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ${styles.dot} z-10 outline outline-4 outline-[#0D1117]`} />
                <div className="text-[12px] font-mono text-muted-foreground mb-1 tracking-wider bg-[#161B22] w-max px-1.5 py-0.5 rounded-sm border border-white/5">
                  [DIA {l.dia.toString().padStart(3, '0')}]
                </div>
                <div className={`text-sm font-inter leading-relaxed ${styles.text}`}>
                  {l.mensagem}
                </div>
              </div>
            );
          })}
          {state.log.length === 0 && (
            <div className="text-secondary text-sm font-inter italic text-center mt-10">O vazio do silêncio.</div>
          )}
        </div>
      </div>
    </div>
  );
}
