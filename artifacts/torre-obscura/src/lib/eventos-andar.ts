// ─── EVENTOS DE ANDAR — acontecimentos que atravessam a Torre ─────────────────
// No máximo um evento por dia (~25% dos dias), determinístico por (camaraSeed,
// dia) — a torre de cada jogador tem os próprios acontecimentos. Mecânica leve:
// modificadores de saque/custo por um dia. Textos em EVENTOS_ANDAR_LORE.

import { mulberry32 } from '../floor-engine/rng';
import { EVENTOS_ANDAR_LORE } from './lore-content';
import { FLOORS, type BiomaTipo } from './game-data';

export type EventoTipo = 'migracao' | 'escadas' | 'eco_errante';

export interface EventoDia {
  tipo: EventoTipo;
  nome: string;
  icone: string;
  texto: string;       // já com nomes de andares interpolados
  origem?: number;     // migracao: andar que rende menos hoje (−15%)
  destino?: number;    // migracao: andar que rende mais hoje (+15%)
  andar?: number;      // eco_errante: andar que rende mais hoje (+15%)
}

const BIOMAS: BiomaTipo[] = ['floresta', 'caverna', 'ruinas', 'fortaleza', 'abismo'];

export function eventoDoDia(seed: number, dia: number): EventoDia | null {
  // Constante diferente da do clima: os dois sorteios não andam juntos.
  const rng = mulberry32(((seed >>> 0) ^ Math.imul(dia, 0x9e3779b1)) >>> 0);
  if (rng() >= 0.25) return null;

  const tipo: EventoTipo = (['migracao', 'eco_errante', 'escadas'] as const)[Math.floor(rng() * 3)];
  const lore = EVENTOS_ANDAR_LORE[tipo];

  if (tipo === 'escadas') return { tipo, ...lore };

  if (tipo === 'eco_errante') {
    const f = FLOORS[Math.floor(rng() * FLOORS.length)];
    return { tipo, ...lore, texto: lore.texto.replaceAll('{andar}', f.nome), andar: f.floor };
  }

  // migracao: dois andares distintos do mesmo bioma
  const bioma = BIOMAS[Math.floor(rng() * BIOMAS.length)];
  const doBioma = FLOORS.filter(f => f.bioma === bioma);
  if (doBioma.length < 2) return null;
  const a = Math.floor(rng() * doBioma.length);
  let b = Math.floor(rng() * (doBioma.length - 1));
  if (b >= a) b++;
  const origem = doBioma[a];
  const destino = doBioma[b];
  return {
    tipo,
    ...lore,
    texto: lore.texto.replaceAll('{origem}', origem.nome).replaceAll('{destino}', destino.nome),
    origem: origem.floor,
    destino: destino.floor,
  };
}

// O evento de hoje é visível para o jogador? (não anunciar andares que ele
// ainda nem alcançou — nomes de andares futuros são descoberta, não boletim)
export function eventoVisivel(ev: EventoDia | null, andarAtual: number): boolean {
  if (!ev) return false;
  if (ev.tipo === 'escadas') return true;
  if (ev.tipo === 'eco_errante') return (ev.andar ?? 99) <= andarAtual;
  return Math.min(ev.origem ?? 99, ev.destino ?? 99) <= andarAtual;
}

export function multEventoParaAndar(ev: EventoDia | null, floor: number): number {
  if (!ev) return 1.0;
  if (ev.tipo === 'migracao') {
    if (ev.origem === floor) return 0.85;
    if (ev.destino === floor) return 1.15;
  }
  if (ev.tipo === 'eco_errante' && ev.andar === floor) return 1.15;
  return 1.0;
}

// Escadas Erradias: mantimentos rendem mais no caminho (custo de expedição −25%).
export function multCustoEvento(ev: EventoDia | null): number {
  return ev?.tipo === 'escadas' ? 0.75 : 1.0;
}
