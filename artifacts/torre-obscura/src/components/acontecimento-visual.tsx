// ─── Visual compartilhado dos Acontecimentos (feed + toasts) ─────────────────
// Fonte única de ícone/cor/rótulo por tipo de evento — usado pelo Mural e pelo
// host de toasts (DRY). Estilo alinhado ao restante da UI (lucide + cores do tema).

import { Skull, Swords, Trophy, DoorOpen, Sparkles, AlertTriangle, Info, type LucideIcon } from 'lucide-react';
import type { LogTipo } from '../lib/game-data';

export interface AcontecimentoVisual {
  Icon: LucideIcon;
  cor: string;        // classe de cor do texto/ícone
  borda: string;      // classe de cor da borda (acento)
  rotulo: string;
}

const MAP: Record<LogTipo, AcontecimentoVisual> = {
  morte:      { Icon: Skull,         cor: 'text-destructive', borda: 'border-destructive/50', rotulo: 'Perda' },
  traicao:    { Icon: Swords,        cor: 'text-destructive', borda: 'border-destructive/50', rotulo: 'Traição' },
  vitoria:    { Icon: Trophy,        cor: 'text-primary',     borda: 'border-primary/50',     rotulo: 'Vitória' },
  descoberta: { Icon: DoorOpen,      cor: 'text-secondary',   borda: 'border-secondary/50',   rotulo: 'Descoberta' },
  evento:     { Icon: Sparkles,      cor: 'text-secondary',   borda: 'border-secondary/40',   rotulo: 'Evento' },
  alerta:     { Icon: AlertTriangle, cor: 'text-warning',     borda: 'border-warning/50',     rotulo: 'Alerta' },
  info:       { Icon: Info,          cor: 'text-muted-foreground', borda: 'border-card-border', rotulo: 'Aviso' },
};

export const visualDe = (tipo: LogTipo): AcontecimentoVisual => MAP[tipo] ?? MAP.info;
