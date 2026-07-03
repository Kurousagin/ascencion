import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { ShieldAlert } from 'lucide-react';
import { NPC } from '../lib/game-data';

export function People() {
  const { state } = useGame();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const vivos = state.npcs.filter(n => n.vivo).length;

  const getFadigaLabel = (f: number) => {
    if (f >= 90) return { label: 'INCAPACITADO', color: 'text-destructive' };
    if (f >= 70) return { label: 'EXAUSTO', color: 'text-orange' };
    if (f >= 50) return { label: 'CANSADO', color: 'text-warning' };
    return { label: 'NORMAL', color: 'text-success' };
  };

  const Bar = ({ value, label, inverted = false }: { value: number, label: string, inverted?: boolean }) => {
    let colorClass = 'bg-success';
    if (inverted) {
      if (value > 70) colorClass = 'bg-destructive';
      else if (value > 40) colorClass = 'bg-warning';
    } else {
      if (value < 30) colorClass = 'bg-destructive';
      else if (value < 60) colorClass = 'bg-warning';
    }

    return (
      <div className="flex-1">
        <div className="text-[10px] text-secondary mb-1 flex justify-between">
          <span>{label}</span>
        </div>
        <div className="h-1 bg-background w-full">
          <div className={`h-full ${colorClass}`} style={{ width: `${value}%` }} />
        </div>
      </div>
    );
  };

  const renderCard = (npc: NPC) => {
    const isExpanded = expandedId === npc.id;
    const fStatus = getFadigaLabel(npc.fadiga);

    if (!npc.vivo) {
      return (
        <div key={npc.id} className="bg-background border border-destructive/30 p-3 opacity-50 grayscale flex justify-between items-center">
          <span className="font-bold line-through text-destructive">{npc.nome}</span>
          <span className="text-[10px] text-destructive tracking-widest border border-destructive px-2 py-0.5">FALECIDO</span>
        </div>
      );
    }

    return (
      <div 
        key={npc.id} 
        className="bg-card border border-card-border p-3 cursor-pointer hover:border-primary transition-colors"
        onClick={() => setExpandedId(isExpanded ? null : npc.id)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground text-lg">{npc.nome}</span>
            {npc.obscuro && (
              <span className="text-[8px] bg-orange/10 border border-orange text-orange px-1 flex items-center gap-1">
                <ShieldAlert size={10}/> ORIGEM OBSCURA
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold ${fStatus.color}`}>{fStatus.label}</span>
        </div>

        <div className="flex gap-4 mb-3">
          <Bar value={npc.sanidade} label="SANIDADE" />
          <Bar value={npc.lealdade} label="LEALDADE" />
          <Bar value={npc.fadiga} label="FADIGA" inverted />
        </div>

        {npc.lealdade < 30 && (
          <div className="text-[10px] text-destructive bg-destructive/10 border-l-2 border-destructive pl-2 mb-2 animate-pulse">
            RISCO ALTO DE TRAIÇÃO
          </div>
        )}

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-card-border grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-background py-2 border border-border">
              <div className="text-secondary mb-1">FOR</div>
              <div className="font-bold text-foreground">{npc.forca}</div>
            </div>
            <div className="bg-background py-2 border border-border">
              <div className="text-secondary mb-1">AGI</div>
              <div className="font-bold text-foreground">{npc.agilidade}</div>
            </div>
            <div className="bg-background py-2 border border-border">
              <div className="text-secondary mb-1">INT</div>
              <div className="font-bold text-foreground">{npc.inteligencia}</div>
            </div>
            <div className="bg-background py-2 border border-border">
              <div className="text-secondary mb-1">RES</div>
              <div className="font-bold text-foreground">{npc.resistencia}</div>
            </div>
            <div className="col-span-4 flex gap-4 text-[10px] text-secondary mt-2">
              <div>SAN: {Math.floor(npc.sanidade)}/100</div>
              <div>LEA: {Math.floor(npc.lealdade)}/100</div>
              <div>FAD: {Math.floor(npc.fadiga)}/100</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto">
      <header className="border-b border-border pb-4 flex justify-between items-end">
        <h2 className="text-xl font-bold tracking-widest text-foreground">HABITANTES</h2>
        <span className="text-xs text-secondary font-bold">
          {vivos} VIVOS / {state.npcs.length} TOTAL
        </span>
      </header>

      <div className="space-y-3">
        {state.npcs.sort((a,b) => (b.vivo ? 1 : 0) - (a.vivo ? 1 : 0)).map(renderCard)}
      </div>
    </div>
  );
}
