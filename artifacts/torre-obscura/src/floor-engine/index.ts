// ─── floor-engine — motor de andar ───────────────────────────────────────────
// Façade única do domínio de ANDAR. Câmaras e Pistas são os primeiros submódulos;
// o ecossistema (FloorEcosystem) está preparado para receber encounters/eventos.
// Direção de dependência: GameContext / pages → floor-engine → game-data (nunca o
// contrário — os corpos das regras vivem em rules.ts e importam game-data numa só
// direção, sem ciclo).

// Regras (stat gating, dificuldade, afinidade, rolagem de dados).
export {
  verificarRequisitoCamara,
  dificuldadeCamara,
  calcAfinidadeCamara,
  chanceAbrirCamara,
} from './rules';

// Recompensa por desempenho + tipos permanecem em game-data (re-exportados aqui).
export { sortearRecompensaCamara, idFragmentoCamara } from '../lib/game-data';
export type {
  CamaraSecreta,
  RequisitoCamara,
  ResultadoCamara,
  RecompensaCamaraBonus,
} from '../lib/game-data';

// Geração procedural + ecossistema do andar.
export {
  camarasDaTorre,
  gerarCamarasDoAndar,
  ecossistemaDoAndar,
  novaCamaraSeed,
  type FloorEcosystem,
} from './generate';
export { mulberry32, rngPara } from './rng';
