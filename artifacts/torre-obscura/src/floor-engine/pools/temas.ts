// ─── Pools de TEMAS para geração procedural de câmaras ───────────────────────
// A geração NÃO inventa texto: compõe cada câmara a partir de POOLS curados —
// garantindo qualidade — mas SORTEIA por seed a colocação (qual tema em qual
// andar). Assim cada torre é única.
//
// Temas de T1 são reaproveitados do conteúdo já escrito (CAMARAS_SECRETAS vira
// catálogo de temas, não mais colocações fixas). Temas de T2 ("O Intervalo",
// andares 21–40) são novos, seguindo o LORE_BIBLE.

import { CAMARAS_SECRETAS, capituloDoAndar, type ProfissaoId } from '../../lib/game-data';

export interface TemaCamara {
  titulo: string;
  icone: string;
  descricao: string;
  loreGanho?: { titulo: string; texto: string };
  sucessoTexto: string;
  falhaTexto: string;
  // Profissão temática (afinidade de grupo). undefined = sem tema.
  profissao?: ProfissaoId;
}

// Temas de T1 derivados do conteúdo curado existente (capítulos 1–4, andares 1–20).
const TEMAS_T1: Record<number, TemaCamara[]> = (() => {
  const porCap: Record<number, TemaCamara[]> = {};
  for (const cam of Object.values(CAMARAS_SECRETAS)) {
    const cap = capituloDoAndar(cam.floor);
    const prof = cam.requisito.tipo === 'class_farms' ? cam.requisito.profissao : undefined;
    (porCap[cap] ??= []).push({
      titulo: cam.titulo,
      icone: cam.icone,
      descricao: cam.descricao,
      loreGanho: cam.resultado.loreGanho,
      sucessoTexto: cam.resultado.sucessoTexto,
      falhaTexto: cam.resultado.falhaTexto,
      profissao: prof,
    });
  }
  return porCap;
})();

// Temas de T2 (capítulos 5–8, andares 21–40). "O Intervalo": memória, estranheza,
// rumores de que a Torre tem história antes do Andar 1. (Regra de lore: nunca dizer
// "100 andares"; usar "a centena", "algo além".)
const TEMAS_T2: Record<number, TemaCamara[]> = {
  5: [
    { titulo: 'Sala dos Nomes Riscados', icone: '📜', profissao: 'erudito',
      descricao: 'Uma parede coberta de nomes — todos rasurados por uma mesma mão, muito antes de você chegar.',
      loreGanho: { titulo: 'Antes do Primeiro', texto: 'Os nomes riscados são de quem subiu antes do Andar 1 existir. A Torre lembra deles como quem lembra de um sonho alheio.' },
      sucessoTexto: 'Sob os nomes, um compartimento com provisões esquecidas.',
      falhaTexto: 'A parede rangeu e cedeu — recuaram cobertos de poeira antiga.' },
    { titulo: 'Depósito do Intervalo', icone: '🕯️', profissao: 'sentinela',
      descricao: 'Um cômodo onde o tempo parece hesitar; as velas não queimam, apenas esperam.',
      loreGanho: { titulo: 'O Tempo que Hesita', texto: 'Há um espaço entre os andares onde nada envelhece. Algo — ou alguém — ficou preso ali de propósito.' },
      sucessoTexto: 'As velas cederam um óleo raro, ainda utilizável.',
      falhaTexto: 'A chama fria drenou o vigor do grupo por um instante longo demais.' },
  ],
  6: [
    { titulo: 'Arquivo Submerso', icone: '🌊', profissao: 'erudito',
      descricao: 'Prateleiras afundadas em água parada guardam registros que a Torre tentou apagar.',
      loreGanho: { titulo: 'O que a Água Preservou', texto: 'A memória que a Torre apaga, a água guarda. Fragmentos de um idioma morto insistem em não ser esquecidos.' },
      sucessoTexto: 'Recuperaram tábuas seladas em cera — intactas.',
      falhaTexto: 'O piso alagado cedeu; salvaram-se, mas perderam o fôlego.' },
    { titulo: 'Câmara do Eco Duplo', icone: '🔉', profissao: 'batedor',
      descricao: 'Cada som volta duas vezes: uma sua, outra de alguém que não está ali.',
      loreGanho: { titulo: 'A Segunda Voz', texto: 'O eco extra não é eco. É outro fragmento do mesmo ser respondendo do outro lado da parede fina entre os ecos.' },
      sucessoTexto: 'Seguindo o eco falso, acharam um nicho com metais raros.',
      falhaTexto: 'Perseguir a segunda voz quase os perdeu no escuro.' },
  ],
  7: [
    { titulo: 'Oficina do Construtor', icone: '⚒️', profissao: 'combatente',
      descricao: 'Ferramentas grandes demais para mãos humanas, largadas no meio de um trabalho.',
      loreGanho: { titulo: 'Mãos que Ergueram', texto: 'Alguém construiu a Torre. As ferramentas ainda guardam o calor de um ofício interrompido — não abandonado.' },
      sucessoTexto: 'Entre as ferramentas, um estoque de ferro trabalhado.',
      falhaTexto: 'Um mecanismo antigo disparou; recuaram por pouco.' },
    { titulo: 'Jardim Petrificado', icone: '🪨', profissao: 'sentinela',
      descricao: 'Plantas viraram pedra no exato instante em que floresciam.',
      loreGanho: { titulo: 'O Instante Congelado', texto: 'Algo parou o tempo aqui num só gesto. O mesmo gesto que fragmentou o ser central — testado antes, em silêncio.' },
      sucessoTexto: 'As flores de pedra guardavam sementes reais no cerne.',
      falhaTexto: 'O ar denso pesou sobre o grupo como séculos.' },
  ],
  8: [
    { titulo: 'Câmara da Pergunta Antiga', icone: '❓', profissao: 'erudito',
      descricao: 'No centro, uma inscrição que faz a mesma pergunta em línguas que ninguém mais fala.',
      loreGanho: { titulo: 'A Pergunta sem Fim', texto: 'A pergunta é sempre a mesma, em todos os idiomas apagados: "quem restou para lembrar?". A centena é parte da resposta — e a palavra ao lado dela foi arrancada.' },
      sucessoTexto: 'Decifrar parte da inscrição revelou um cofre de suprimentos.',
      falhaTexto: 'A pergunta ecoou fundo demais; abalou a sanidade do grupo.' },
    { titulo: 'Limiar do que Vem Depois', icone: '🚪', profissao: 'batedor',
      descricao: 'Uma porta que não abre para lugar nenhum conhecido — só para o que está além do vigésimo.',
      loreGanho: { titulo: 'Algo Além', texto: 'A porta não leva a um andar. Leva à ideia de que há mais — muito mais — e de que alguém do outro lado sabe o seu nome.' },
      sucessoTexto: 'A soleira guardava relíquias de quem tentou passar antes.',
      falhaTexto: 'O vão soprou um frio que veio de um lugar sem nome.' },
  ],
};

// Retorna os temas disponíveis para um capítulo (tier). Fallback: capítulo anterior.
export function temasDoCapitulo(capitulo: number): TemaCamara[] {
  const t1 = TEMAS_T1[capitulo];
  if (t1 && t1.length) return t1;
  const t2 = TEMAS_T2[capitulo];
  if (t2 && t2.length) return t2;
  // 41–100 ainda sem conteúdo: reaproveita o último capítulo conhecido (stub extensível).
  const conhecidos = [...Object.keys(TEMAS_T1), ...Object.keys(TEMAS_T2)].map(Number);
  const maior = Math.max(...conhecidos);
  return TEMAS_T1[maior] ?? TEMAS_T2[maior] ?? [];
}
