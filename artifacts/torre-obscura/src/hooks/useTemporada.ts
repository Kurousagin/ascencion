// ─── useTemporada — fonte única da temporada ativa para as telas ─────────────
// Centraliza a leitura da temporada: dado o gatilho global `t2Desbloqueado` (10
// pioneiros no Andar 20), devolve a temporada ativa, seus dados (nome/corTema/
// andares) e o andar máximo. Toda tela deriva daqui em vez de recalcular
// TEMPORADAS[...]/limites "20/40" à mão. T3–T5 plugam só estendendo TEMPORADAS.

import { TEMPORADAS, temporadaAtiva, andarMaxTemporada, type TemporadaData } from '../lib/game-data';

const ROMANO = ['', 'I', 'II', 'III', 'IV', 'V'];

export interface TemporadaInfo {
  numero: number;       // temporada ativa (1, 2, …)
  data: TemporadaData;  // nome, descrição, corTema, andares
  andarMax: number;     // último andar liberado (20, 40, …)
  romano: string;       // rótulo romano ('I', 'II', …)
}

export function useTemporada(t2Desbloqueado: boolean): TemporadaInfo {
  const numero = temporadaAtiva(t2Desbloqueado);
  return {
    numero,
    data: TEMPORADAS[numero],
    andarMax: andarMaxTemporada(t2Desbloqueado),
    romano: ROMANO[numero] ?? String(numero),
  };
}
