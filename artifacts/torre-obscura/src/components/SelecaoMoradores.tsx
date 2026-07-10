// ─── SelecaoMoradores — lista reutilizável de moradores selecionáveis ────────
// Usada para montar grupos (expedições, câmaras secretas, etc.). Cada linha mostra
// poder de combate (calcNpcPower) e fadiga. Componente puro de apresentação: recebe
// os NPCs já filtrados e reporta os toggles ao pai.

import * as Checkbox from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { NPC, calcNpcPower } from '../lib/game-data';

interface Props {
  npcs: NPC[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  emptyLabel?: string;
}

export function SelecaoMoradores({ npcs, selectedIds, onToggle, emptyLabel = 'Nenhum morador disponível.' }: Props) {
  if (npcs.length === 0) {
    return <div className="text-center text-muted-foreground py-6 text-sm font-inter">{emptyLabel}</div>;
  }
  return (
    <div className="space-y-2">
      {npcs.map(n => {
        const p = calcNpcPower(n);
        const isSelected = selectedIds.includes(n.id);
        return (
          <div
            key={n.id}
            onClick={() => onToggle(n.id)}
            className={`flex items-center gap-3 p-3.5 border cursor-pointer rounded-sm transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-card-border bg-[#0D1117] hover:border-primary/40'}`}
          >
            <Checkbox.Root
              checked={isSelected}
              className={`w-6 h-6 border flex items-center justify-center shrink-0 rounded-sm ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-secondary bg-transparent'}`}
            >
              <Checkbox.Indicator><Check size={16} strokeWidth={3} /></Checkbox.Indicator>
            </Checkbox.Root>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center gap-2 mb-1.5">
                <span className="font-bold text-base text-foreground truncate">{n.nome}</span>
                <span className="flex items-baseline gap-1 shrink-0">
                  <span className="text-[11px] text-secondary tracking-wider">PODER</span>
                  <span className="text-primary font-bold text-base font-cinzel">{p.toFixed(1)}</span>
                </span>
              </div>
              <div className="mb-2">
                <span className="text-[12px] px-2 py-0.5 bg-secondary/20 text-secondary border border-secondary/30 rounded-sm tracking-wider uppercase">
                  {n.habilidade}
                </span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-[#4A9EFF] w-8 shrink-0 tracking-wider font-bold">SAN</span>
                  <div className="flex-1 bg-background h-2 flex rounded-sm overflow-hidden border border-white/5">
                    <div className={`h-full ${n.sanidade < 30 ? 'bg-destructive' : n.sanidade < 50 ? 'bg-warning' : 'bg-[#4A9EFF]'}`} style={{ width: `${n.sanidade}%` }} />
                  </div>
                  <span className={`text-[12px] w-7 text-right ${n.sanidade < 50 ? 'text-destructive font-bold' : 'text-white/60'}`}>{Math.round(n.sanidade)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-success w-8 shrink-0 tracking-wider font-bold">VIG</span>
                  <div className="flex-1 bg-background h-2 flex rounded-sm overflow-hidden border border-white/5">
                    <div className={`h-full ${n.fadiga > 60 ? 'bg-destructive' : 'bg-success'}`} style={{ width: `${100 - n.fadiga}%` }} />
                  </div>
                  <span className="text-[12px] w-7 text-right text-white/60">{100 - Math.round(n.fadiga)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
