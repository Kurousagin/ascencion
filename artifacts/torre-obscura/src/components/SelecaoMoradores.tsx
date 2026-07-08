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
            className={`flex items-center gap-3 p-3 border cursor-pointer rounded-sm transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-card-border bg-[#0D1117] hover:border-primary/40'}`}
          >
            <Checkbox.Root
              checked={isSelected}
              className={`w-5 h-5 border flex items-center justify-center shrink-0 rounded-sm ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-secondary bg-transparent'}`}
            >
              <Checkbox.Indicator><Check size={14} strokeWidth={3} /></Checkbox.Indicator>
            </Checkbox.Root>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-1">
                <span className="font-bold text-sm text-foreground truncate">{n.nome}</span>
                <span className="text-primary font-bold text-sm font-cinzel shrink-0">{p.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[9px] px-1.5 py-[1px] bg-secondary/20 text-secondary border border-secondary/30 rounded-sm tracking-wider uppercase">
                  {n.habilidade}
                </span>
                <span className="flex items-center gap-2">
                  <span className={`text-[9px] ${n.sanidade < 50 ? 'text-destructive' : 'text-white/40'}`}>Sanidade {Math.round(n.sanidade)}</span>
                  <span className="text-[9px] text-white/40">Fadiga {Math.round(n.fadiga)}</span>
                </span>
              </div>
              <div className="flex gap-1">
                <div className="flex-1 bg-background h-1.5 flex rounded-sm overflow-hidden border border-white/5" title="Sanidade">
                  <div className={`h-full ${n.sanidade < 30 ? 'bg-destructive' : n.sanidade < 50 ? 'bg-warning' : 'bg-[#4A9EFF]'}`} style={{ width: `${n.sanidade}%` }} />
                </div>
                <div className="flex-1 bg-background h-1.5 flex rounded-sm overflow-hidden border border-white/5" title="Vigor (100 − fadiga)">
                  <div className={`h-full ${n.fadiga > 60 ? 'bg-destructive' : 'bg-success'}`} style={{ width: `${100 - n.fadiga}%` }} />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
