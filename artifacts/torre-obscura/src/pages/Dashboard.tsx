import { useGame } from '../context/GameContext';
import { FastForward, UserCheck, AlertTriangle } from 'lucide-react';

export function Dashboard() {
  const { state, setSpeed, advanceDay } = useGame();

  const getMoralColor = (m: number) => {
    if (m > 60) return 'text-success';
    if (m < 40) return 'text-destructive';
    return 'text-warning';
  };

  const vivos = state.npcs.filter(n => n.vivo).length;

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto">
      <header className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-widest text-foreground">OBSERVATÓRIO</h2>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-card-border p-4 flex flex-col justify-between">
          <span className="text-xs text-secondary mb-2">DIA ATUAL</span>
          <span className="text-3xl text-foreground font-bold">{state.dia}</span>
        </div>
        
        <div className="bg-card border border-card-border p-4 flex flex-col justify-between">
          <span className="text-xs text-secondary mb-2">ANDARES</span>
          <span className="text-3xl text-primary font-bold">{state.andarAtual - 1} / 20</span>
        </div>

        <div className="bg-card border border-card-border p-4 flex flex-col justify-between col-span-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-secondary flex items-center gap-2"><UserCheck size={14}/> MORAL GLOBAL</span>
            <span className={`text-xl font-bold ${getMoralColor(state.moral)}`}>{Math.round(state.moral)}%</span>
          </div>
          <div className="w-full bg-background h-2 rounded overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                state.moral > 60 ? 'bg-success' : state.moral < 40 ? 'bg-destructive' : 'bg-warning'
              }`}
              style={{ width: `${state.moral}%` }}
            />
          </div>
        </div>
        
        <div className="bg-card border border-card-border p-4 flex flex-col justify-between col-span-2">
          <span className="text-xs text-secondary mb-2">POPULAÇÃO VIVA</span>
          <div className="flex items-end gap-2">
            <span className={`text-3xl font-bold ${vivos <= 3 ? 'text-destructive' : 'text-foreground'}`}>
              {vivos}
            </span>
            <span className="text-muted-foreground mb-1">/ {state.npcs.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <span className="text-xs text-secondary tracking-widest">VELOCIDADE DO TEMPO</span>
        <div className="flex gap-2">
          {[1, 2, 5].map(spd => (
            <button
              key={spd}
              onClick={() => setSpeed(spd as any)}
              className={`flex-1 h-12 flex items-center justify-center border font-bold ${
                state.velocidade === spd
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-card-border text-secondary hover:border-secondary'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={advanceDay}
        className="w-full h-16 bg-primary text-background font-bold tracking-widest text-lg flex items-center justify-center gap-2 mt-4 hover:bg-opacity-90 active:scale-[0.98] transition-transform"
      >
        <FastForward />
        AVANÇAR DIA
      </button>

      <div className="mt-8 space-y-3">
        <h3 className="text-xs text-secondary tracking-widest flex items-center gap-2">
          <AlertTriangle size={14} /> ALERTAS RECENTES
        </h3>
        <div className="space-y-2">
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).slice(0, 3).map(l => (
            <div key={l.id} className="text-xs border-l-2 border-destructive pl-3 py-1 bg-destructive/5 text-destructive/90">
              <span className="opacity-50">D{l.dia}:</span> {l.mensagem}
            </div>
          ))}
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).length === 0 && (
            <div className="text-xs text-muted-foreground italic">Nenhum alerta crítico recente.</div>
          )}
        </div>
      </div>
    </div>
  );
}
