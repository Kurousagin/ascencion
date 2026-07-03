import { useGame } from '../context/GameContext';
import { EDIFICIOS_CUSTOS } from '../lib/game-data';

export function Citadel() {
  const { state, buildEdificio } = useGame();
  
  const getProgressColor = (current: number, max: number) => {
    const p = current / max;
    if (p > 0.9) return 'bg-destructive';
    if (p > 0.7) return 'bg-orange';
    if (p > 0.5) return 'bg-warning';
    return 'bg-success';
  };

  const ResourceBar = ({ label, current, max }: { label: string, current: number, max: number }) => (
    <div className="space-y-1 mb-3">
      <div className="flex justify-between text-xs font-bold">
        <span>{label}</span>
        <span className="text-secondary">{Math.floor(current)} / {max}</span>
      </div>
      <div className="w-full bg-background h-2 border border-card-border p-px">
        <div 
          className={`h-full transition-all ${getProgressColor(current, max)}`}
          style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
        />
      </div>
    </div>
  );

  const renderEdificio = (tipo: string, name: string, desc: string) => {
    const exists = state.edificios.find(e => e.tipo === tipo);
    const nivelAtual = exists?.nivel || 0;
    
    // special logic for Armazem
    const isArmazem = tipo === 'Armazem';
    if (isArmazem && nivelAtual >= 3) {
      return null; // hide if maxed
    }
    if (!isArmazem && exists) {
      return (
        <div className="bg-card/50 border border-card-border p-3 opacity-60">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-bold text-muted-foreground">{name.toUpperCase()}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{desc}</div>
            </div>
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5">ATIVO</span>
          </div>
        </div>
      );
    }

    const nextLevel = isArmazem ? nivelAtual + 1 : 1;
    const costKey = nextLevel > 1 ? `${tipo}_${nextLevel}` : tipo;
    const custo = EDIFICIOS_CUSTOS[costKey];
    
    const canAfford = 
      (state.recursos.madeira >= (custo.madeira || 0)) &&
      (state.recursos.pedra >= (custo.pedra || 0)) &&
      (state.recursos.ferro >= (custo.ferro || 0));

    return (
      <div className="bg-card border border-card-border p-3 space-y-3">
        <div>
          <div className="font-bold text-foreground">
            {name.toUpperCase()} {isArmazem && `Nvl ${nextLevel}`}
          </div>
          <div className="text-[10px] text-secondary mt-1 leading-tight">{desc}</div>
        </div>
        
        <div className="flex gap-2 text-[10px] font-bold">
          {custo.madeira && <span className={state.recursos.madeira < custo.madeira ? 'text-destructive' : 'text-secondary'}>{custo.madeira} MAD</span>}
          {custo.pedra && <span className={state.recursos.pedra < custo.pedra ? 'text-destructive' : 'text-secondary'}>{custo.pedra} PED</span>}
          {custo.ferro && <span className={state.recursos.ferro < custo.ferro ? 'text-destructive' : 'text-secondary'}>{custo.ferro} FER</span>}
        </div>

        <button
          disabled={!canAfford}
          onClick={() => buildEdificio(tipo, nextLevel)}
          className="w-full h-10 border border-primary text-primary hover:bg-primary hover:text-background font-bold text-xs tracking-widest disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-primary transition-colors"
        >
          CONSTRUIR
        </button>
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto">
      <header className="border-b border-border pb-4">
        <h2 className="text-xl font-bold tracking-widest text-foreground">CIDADELA</h2>
      </header>

      <section>
        <h3 className="text-xs text-secondary tracking-widest mb-4">RECURSOS E ARMAZENAMENTO</h3>
        <div className="bg-card border border-card-border p-4">
          <ResourceBar label="COMIDA" current={state.recursos.comida} max={state.recursos.capacidadeArmazem} />
          <ResourceBar label="MADEIRA" current={state.recursos.madeira} max={state.recursos.capacidadeArmazem} />
          <ResourceBar label="PEDRA" current={state.recursos.pedra} max={state.recursos.capacidadeArmazem} />
          <ResourceBar label="FERRO" current={state.recursos.ferro} max={state.recursos.capacidadeArmazem} />
        </div>
      </section>

      <section>
        <h3 className="text-xs text-secondary tracking-widest mb-4">EDIFÍCIOS DISPONÍVEIS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderEdificio('Fogueira', 'Fogueira', '+1 moral base por dia')}
          {renderEdificio('Fazenda', 'Fazenda', '+5 comida por dia')}
          {renderEdificio('Enfermaria', 'Enfermaria', 'Habitantes recuperam +5 fadiga por dia')}
          {renderEdificio('Templo', 'Templo', '+2 moral/dia e +0.5 sanidade/dia para todos')}
          {renderEdificio('Armazem', 'Armazém', 'Aumenta limite de recursos')}
          {renderEdificio('Quartel', 'Quartel', 'Ponto de encontro (Desbloqueio futuro)')}
        </div>
      </section>
    </div>
  );
}
