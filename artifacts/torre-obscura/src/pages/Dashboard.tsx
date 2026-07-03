import { useGame } from '../context/GameContext';
import { FastForward, ShieldAlert } from 'lucide-react';

export function Dashboard() {
  const { state, setSpeed, advanceDay } = useGame();

  const getMoralColor = (m: number) => {
    if (m > 60) return 'text-success';
    if (m < 40) return 'text-destructive';
    return 'text-warning';
  };

  const vivos = state.npcs.filter(n => n.vivo).length;

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">OBSERVATÓRIO</h2>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-4 flex flex-col justify-between rounded shadow-lg relative overflow-hidden">
          <span className="text-[10px] text-secondary tracking-widest mb-1 relative z-10">DIA</span>
          <span className="text-4xl text-primary font-bold font-cinzel relative z-10">{state.dia}</span>
          <div className="absolute -right-4 -bottom-4 text-primary/5 font-cinzel text-6xl pointer-events-none select-none">
            {state.dia}
          </div>
        </div>
        
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-4 flex flex-col justify-between rounded shadow-lg">
          <span className="text-[10px] text-secondary tracking-widest mb-2">ANDARES</span>
          <div className="flex flex-col gap-1">
            <span className="text-xl text-foreground font-bold font-cinzel">{state.andarAtual - 1} / 20</span>
            <div className="flex gap-0.5 mt-1">
              {Array.from({length: 20}).map((_, i) => (
                <div key={i} className={`flex-1 h-1.5 ${i < state.andarAtual - 1 ? 'bg-primary' : 'bg-background border border-primary/20'}`} />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-4 flex flex-col justify-between rounded shadow-lg col-span-2">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] text-secondary tracking-widest">MORAL GLOBAL</span>
            <span className={`text-xl font-bold font-cinzel ${getMoralColor(state.moral)}`}>{Math.round(state.moral)}%</span>
          </div>
          <div className="w-full bg-background h-1.5 rounded overflow-hidden border border-white/5">
            <div 
              className={`h-full transition-all duration-500 ${
                state.moral > 60 ? 'bg-success' : state.moral < 40 ? 'bg-destructive' : 'bg-warning'
              }`}
              style={{ width: `${state.moral}%` }}
            />
          </div>
        </div>
        
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-4 flex flex-col justify-between rounded shadow-lg col-span-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] text-secondary tracking-widest">POPULAÇÃO VIVA</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-bold font-cinzel ${vivos <= 3 ? 'text-destructive animate-pulse' : 'text-foreground'}`}>
              {vivos}
            </span>
            <span className="text-muted-foreground text-sm font-cinzel mb-1">/ {state.npcs.length}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[10px] text-secondary tracking-widest border-b border-primary/20 pb-1 block w-max">VELOCIDADE DO TEMPO</span>
        <div className="flex gap-2">
          {[1, 2, 5].map(spd => (
            <button
              key={spd}
              onClick={() => setSpeed(spd as any)}
              className={`flex-1 h-12 flex items-center justify-center rounded font-cinzel font-bold tracking-widest transition-all touch-manipulation ${
                state.velocidade === spd
                  ? 'border border-primary text-primary-foreground bg-primary glow-gold'
                  : 'border border-card-border text-secondary bg-[#161B22] hover:border-primary/50'
              }`}
            >
              {spd}X
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={advanceDay}
        className="w-full h-[60px] bg-primary text-primary-foreground font-cinzel font-bold tracking-[0.2em] text-lg flex items-center justify-center gap-3 mt-4 hover:bg-opacity-90 active:scale-[0.98] transition-transform shadow-[0_0_15px_rgba(212,175,55,0.2)] rounded-sm touch-manipulation"
      >
        <FastForward size={20} />
        AVANÇAR DIA
      </button>

      <div className="mt-8 space-y-3">
        <h3 className="text-xs font-cinzel text-primary tracking-widest flex items-center gap-2 border-b border-primary/20 pb-2">
          <ShieldAlert size={14} /> INTEL FEED
        </h3>
        <div className="space-y-3">
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).slice(0, 3).map(l => {
            const isMorte = l.tipo === 'morte';
            return (
              <div key={l.id} className="flex gap-3 text-sm items-start">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${isMorte ? 'bg-destructive shadow-[0_0_8px_rgba(248,81,73,0.6)]' : 'bg-warning shadow-[0_0_8px_rgba(227,179,65,0.6)]'}`} />
                <div className={`${isMorte ? 'text-destructive/90' : 'text-warning/90'} font-medium`}>
                  <span className="opacity-50 text-xs mr-2 font-mono">D{l.dia}</span> 
                  {l.mensagem}
                </div>
              </div>
            );
          })}
          {state.log.filter(l => ['alerta', 'morte', 'traicao'].includes(l.tipo)).length === 0 && (
            <div className="text-xs text-muted-foreground italic pl-5">Nenhum evento crítico detectado.</div>
          )}
        </div>
      </div>
    </div>
  );
}
