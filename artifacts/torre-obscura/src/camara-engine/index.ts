// ─── camara-engine — motor de câmaras secretas ───────────────────────────────
// Façade única do domínio de câmaras (regras, tipos, dados). Espelha o padrão do
// npc-engine: por ora RE-EXPORTA de game-data; na fase procedural (PR seguinte)
// os corpos das regras e a geração por seed passam a viver aqui, mantendo a mesma
// superfície de import. Direção de dependência: GameContext → camara-engine →
// game-data (nunca o contrário — evita ciclos).

// Regras puras — permanecem em game-data (re-exportadas aqui). A geração
// procedural por seed é o que o motor adiciona.
export {
  dificuldadeCamara,
  calcAfinidadeCamara,
  calcExploracaoCamara,
  sortearRecompensaCamara,
  verificarRequisitoCamara,
  idFragmentoCamara,
} from '../lib/game-data';

export type {
  CamaraSecreta,
  RequisitoCamara,
  ResultadoCamara,
  RecompensaCamaraBonus,
} from '../lib/game-data';

// Geração procedural (novo)
export { camarasDaTorre, gerarCamarasDoAndar, novaCamaraSeed } from './generate';
export { mulberry32, rngPara } from './rng';
