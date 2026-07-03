import { useGame } from '../context/GameContext';
import { EDIFICIOS_CUSTOS } from '../lib/game-data';
import { Wheat, Trees, Mountain, Zap } from 'lucide-react';

export function Citadel() {
  const { state, buildEdificio } = useGame();
  
  const getProgressColor = (current: number, max: number) => {
    const p = current / max;
    if (p > 0.9) return 'bg-destructive';
    if (p > 0.7) return 'bg-warning';
    if (p > 0.5) return 'bg-[#4A9EFF]'; // blue
    return 'bg-success';
  };

  const ResourceCard = ({ label, current, max, icon: Icon }: { label: string, current: number, max: number, icon: any }) => (
    <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 p-3 rounded-sm relative overflow-hidden flex flex-col justify-between h-[90px] shadow-md">
      <Icon className="absolute -right-2 -bottom-2 w-12 h-12 text-primary/10" />
      <div className="flex justify-between items-start z-10">
        <span className="text-[10px] text-secondary tracking-widest uppercase">{label}</span>
        <Icon size={14} className="text-primary/70" />
      </div>
      <div className="z-10">
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="text-xl font-bold font-cinzel text-foreground">{Math.floor(current)}</span>
          <span className="text-[10px] text-muted-foreground font-cinzel">/{max}</span>
        </div>
        <div className="w-full bg-background h-1.5 rounded-sm overflow-hidden border border-white/5">
          <div 
            className={`h-full transition-all ${getProgressColor(current, max)}`}
            style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );

  const renderEdificio = (tipo: string, name: string, desc: string) => {
    const exists = state.edificios.find(e => e.tipo === tipo);
    const nivelAtual = exists?.nivel || 0;
    
    const isArmazem = tipo === 'Armazem';
    if (isArmazem && nivelAtual >= 3) {
      return null;
    }
    
    if (!isArmazem && exists) {
      return (
        <div className="bg-[#0D1117] border border-card-border p-4 opacity-70 rounded-sm relative overflow-hidden h-full">
          <div className="absolute top-0 right-0 bg-primary/20 border-l border-b border-primary/30 text-[9px] text-primary font-bold tracking-widest px-2 py-1 rounded-bl-sm">ATIVO</div>
          <div className="font-bold text-muted-foreground font-cinzel text-lg">{name.toUpperCase()}</div>
          <div className="text-[10px] text-muted-foreground mt-1 tracking-wide">{desc}</div>
        </div>
      );
    }

    const nextLevel = isArmazem ? nivelAtual + 1 : 1;
    const costKey = isArmazem ? `${tipo}_${nextLevel}` : tipo;
    const custo = EDIFICIOS_CUSTOS[costKey];

    if (!custo) return null;

    const canAfford =
      (state.recursos.madeira >= (custo.madeira || 0)) &&
      (state.recursos.pedra >= (custo.pedra || 0)) &&
      (state.recursos.ferro >= (custo.ferro || 0));

    return (
      <div className={`bg-gradient-to-b from-[#1C2333] to-[#161B22] border ${canAfford ? 'border-primary/50 shadow-[0_0_10px_rgba(212,175,55,0.1)]' : 'border-card-border'} p-4 flex flex-col justify-between rounded-sm h-full`}>
        <div className="mb-4">
          <div className="font-bold text-foreground font-cinzel text-lg">
            {name.toUpperCase()} {isArmazem && <span className="text-primary text-sm tracking-widest ml-1">NVL {nextLevel}</span>}
          </div>
          <div className="text-[10px] text-secondary mt-1.5 leading-relaxed tracking-wide">{desc}</div>
        </div>
        
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap text-[10px] font-bold font-inter">
            {custo.madeira && (
              <span className={`px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${state.recursos.madeira < custo.madeira ? 'bg-destructive/10 text-destructive border border-destructive/30' : 'bg-background text-secondary border border-card-border'}`}>
                <Trees size={10}/> {custo.madeira}
              </span>
            )}
            {custo.pedra && (
              <span className={`px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${state.recursos.pedra < custo.pedra ? 'bg-destructive/10 text-destructive border border-destructive/30' : 'bg-background text-secondary border border-card-border'}`}>
                <Mountain size={10}/> {custo.pedra}
              </span>
            )}
            {custo.ferro && (
              <span className={`px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${state.recursos.ferro < custo.ferro ? 'bg-destructive/10 text-destructive border border-destructive/30' : 'bg-background text-secondary border border-card-border'}`}>
                <Zap size={10}/> {custo.ferro}
              </span>
            )}
          </div>

          <button
            disabled={!canAfford}
            onClick={() => buildEdificio(tipo, nextLevel)}
            className={`w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold transition-all rounded-sm touch-manipulation ${
              canAfford 
                ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]' 
                : 'border-card-border text-muted-foreground opacity-50 cursor-not-allowed bg-black/20'
            }`}
          >
            CONSTRUIR
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-8 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">CIDADELA</h2>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2">
          ARMAZÉM DE RECURSOS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ResourceCard label="Comida" current={state.recursos.comida} max={state.recursos.capacidadeArmazem} icon={Wheat} />
          <ResourceCard label="Madeira" current={state.recursos.madeira} max={state.recursos.capacidadeArmazem} icon={Trees} />
          <ResourceCard label="Pedra" current={state.recursos.pedra} max={state.recursos.capacidadeArmazem} icon={Mountain} />
          <ResourceCard label="Ferro" current={state.recursos.ferro} max={state.recursos.capacidadeArmazem} icon={Zap} />
        </div>
      </section>

      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
          INFRAESTRUTURA
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-2 gap-4">
            {renderEdificio('Fogueira', 'Fogueira', '+1 moral base/dia. Aquece a alma.')}
            {renderEdificio('Fazenda', 'Fazenda', '+5 comida diária. Sustento.')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderEdificio('Enfermaria', 'Enfermaria', '+5 fadiga recuperada para todos.')}
            {renderEdificio('Templo', 'Templo', '+2 moral e +0.5 sanidade/dia.')}
          </div>
          <div className="grid grid-cols-2 gap-4">
            {renderEdificio('Armazem', 'Armazém', 'Expande a capacidade de estocagem.')}
            {renderEdificio('Quartel', 'Quartel', 'Preparação para o combate.')}
          </div>
        </div>
      </section>
    </div>
  );
}
