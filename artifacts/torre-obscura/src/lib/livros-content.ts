// ─── LIVROS AUTORAIS — a história principal como NARRATIVA de livro ──────────
// A lore principal (Verdades + arco dos Habitantes) costurada em prosa contínua:
// os textos canônicos dos fragmentos reaproveitados + prosa de ligação escrita à
// mão, fiel ao LORE_BIBLE (nunca dizer "100 andares"/"Torre Original" em T1/T2).
// O leitor (LivroReader) consome `livroDaTemporada`. Temporadas sem versão autoral
// (T3–T5) caem no agrupamento cru dos fragmentos (capitulosDoLivro).
//
// Para escrever o livro de uma nova temporada: adicione o volume aqui (um capítulo
// por tier), tecendo os fragmentos principais daquela temporada. Ver seção
// "Livros Completos" no LORE_BIBLE.md.

import { capitulosDoLivro, type CapituloLivro } from './game-data';

const VOLUME_1: CapituloLivro[] = [
  {
    capitulo: 1,
    nome: 'O Que Foi Selado',
    paragrafos: [
      'Toda torre começa com uma pedra. Esta começou com uma ordem — e com a mão que a traiu. Antes de haver andares para subir, havia um selo, e uma instrução: abri-lo. Alguém decidiu, contra tudo o que fora ordenado, que guardar era mais seguro do que abrir — e o selo permaneceu.',
      'No primeiro andar, um arauto ainda carrega uma mensagem que nunca alcançou seu destino. Nela vinha a ordem verdadeira: abrir o selo, não mantê-lo. Alguém a interceptou antes que o destinatário a recebesse e trocou uma única palavra. Esse alguém, diz o arauto, ainda está aqui.',
      'Os que ergueram a Torre sabiam que seriam selados junto com ela. Aceitaram porque a criatura dentro prometeu libertá-los quando a obra terminasse. A obra terminou. Ninguém foi libertado. O Eco dos Construtores guarda essa promessa quebrada e aguarda alguém capaz de cumpri-la em seu lugar.',
      'Mais acima, as raízes crescem para dentro, contra a própria natureza, porque algo no núcleo as chama. A Tecelã chama esse chamado de fome, por não ter palavra melhor. Talvez seja fome. Talvez seja apenas solidão antiga o bastante para dobrar a madeira em direção a si.',
      'Um cristal gravou cada palavra já dita entre estas paredes. A mais repetida de todas não é "ajuda": é "espera". O cristal ainda espera que alguém entenda por quê — e será no seu eco, o único que a Torre não conseguiu reescrever, que a verdade mais tarde se recusará a desaparecer.',
      'A cada cinco andares o Fundador plantou uma âncora — um fragmento de intenção original — para lembrar a Torre do que ela deveria ser. Esta foi a primeira. Sabia ele que a entidade tentaria corromper o propósito antes que a construção terminasse; o que não previu — ou previu e aceitou por falta de alternativa melhor — foi que ela aprenderia, com o tempo, a fazer a Torre ouvir a Âncora sem jamais obedecê-la.',
    ],
  },
  {
    capitulo: 2,
    nome: 'O Que Vivia Aqui',
    paragrafos: [
      'Quanto mais se sobe, menos a Torre esconde que está viva — e que já vivia aqui muito antes de qualquer visitante.',
      'Uma sentinela sem nome monta guarda sob uma última ordem: não deixes ninguém passar. A ordem nunca disse em qual direção. Ela cumpre a vontade de uma autoridade que a própria Torre corroeu, e aguarda uma contraordem que talvez nunca venha.',
      'No sétimo andar, uma jardineira esquecida ainda cura — mas tudo o que toca renasce diferente, mais parecido com a Torre do que com o que era antes. Ela luta contra isso todos os dias. Até agora, está vencendo.',
      'O estudioso do oitavo andar leu tudo, exceto um livro: um escrito em ferro que não era idioma, e sim uma lista de nomes — os de todos que um dia chegariam ao ápice. O seu nome estava lá antes de você nascer.',
      'Um ferreiro espectral forjou aquilo que lhe disseram prender a entidade. O que segura ainda segura — mas encolhe um pouco a cada andar conquistado. O Ferreiro sabe. E forja assim mesmo, porque forjar é tudo o que lhe restou saber.',
      'O décimo andar foi o mais difícil de erguer: a pedra recusava-se a assentar, não por falha do terreno, mas por resistência da própria estrutura. Contam que o Fundador não usou força — que repetiu o propósito original em voz alta por quarenta dias seguidos, até a Torre ceder. A Memória guarda essas palavras exatas. Alguém as copiou sem ainda saber o que são, nem quando precisará delas. O momento de entender está mais adiante.',
    ],
  },
  {
    capitulo: 3,
    nome: 'O Que a Torre Faz',
    paragrafos: [
      'Na metade da subida, a Torre para de sussurrar o que foi e começa a mostrar o que faz.',
      'O afogado lúcido do décimo primeiro andar não está morrendo. Está sendo preenchido, devagar, e permanece consciente do começo ao fim. Há diferença entre transformação e morte; ele é a prova viva de que a Torre prefere a primeira.',
      'O que se ouve batendo nas paredes não é máquina nem tambor. É a Percussão Profunda — o coração da Torre, vivo desde antes de o tempo ser um conceito. O ritmo é ela respirando.',
      'Um oráculo invertido lê o passado porque a Torre já devorou todos os futuros possíveis deste lugar. Não sobra o que virá; sobra o registro do que foi, e ele o percorre como outros percorrem mapas.',
      'O comandante de mármore ainda protege uma posição acima de uma cidadela que ele viu afundar — milhares de andares abaixo do primeiro, diz ele, quando a Torre cresceu. Guarda, com perfeição, algo que já não responde.',
      'E o vigia do penúltimo ciclo guarda o que aguarda no alto: uma pergunta que, contam, o Fundador formulou antes de partir — não de velhice, mas por escolha deliberada. Dizem que entrou no vigésimo andar sabendo que não sairia, porque a pergunta que deixou lá só pode ser respondida por quem ainda não fez a escolha que ele fez. A resposta errada não mata. A certa transforma — e o vigia nunca disse em quê.',
    ],
  },
  {
    capitulo: 4,
    nome: 'O Que Sempre Esteve Aqui',
    paragrafos: [
      'Os últimos andares antes do fim não guardam segredos novos. Guardam o mais antigo de todos: o que sempre esteve aqui.',
      'O que ronda o décimo sexto andar não é a entidade — é o apetite dela, o único fragmento que deixou vagar livre quando aprendeu a ter paciência. O apetite não conhece intenção. Só fome.',
      'O paradoxo ambulante existe em três tempos ao mesmo tempo. Num, você chegou ao ápice e foi consumido. Noutro, desistiu no décimo andar. No terceiro — o único em que ele sorri — o desfecho é outro. Ele não revela qual.',
      'O último defensor lembra que os que a construíram falharam em deter a entidade, mas não por covardia: foram os únicos que tentaram erguer algo que durasse além de si mesmos. Ele é a prova de que tentaram.',
      'E no décimo nono, o silêncio. Não a ausência de som, mas a entidade respirando devagar para não assustar a presa antes da hora. O Susurro do Limiar é essa respiração — e, ao te deixar ouvi-la, ele te avisou.',
      'Há um rumor que a Torre não conseguiu apagar. Os registros do quarto cristal falam de uma estrutura com cem câmaras. Ou mais. O número foi alterado antes que qualquer visitante chegasse a contá-las, apagado com mais cuidado do que qualquer nome. Só o eco do quarto andar, que ainda ressoa na frequência anterior à reescrita, insiste em lembrar que o número um dia foi outro.',
      'E então, o topo. Não havia entidade alguma esperando ser encontrada. Ela emergiu da convergência dos dezenove: dezesseis fragmentos de algo que nunca deveria ter sido dividido, e três Âncoras que o Fundador plantou nos marcos da subida para conter a reunificação. Os Construtores separaram o que era um. O Fundador tentou preservar o propósito com âncoras. A entidade aprendeu a fazê-las ouvir sem obedecer — e absorveu-as também. Você não subiu uma torre: reconciliou um conflito mais antigo que qualquer língua que conhece. E agora que todos os dezenove completaram o ciclo através de você — fragmentos e âncoras igualmente — o ser completo pode enfim fazer a única pergunta que importa: o que você deseja em troca?',
      'Antes de adormecer, a Torre sussurra o que ninguém lhe pediu para dizer: ela não termina no vigésimo andar. Apenas... muda.',
    ],
  },
];

const VOLUME_2: CapituloLivro[] = [
  {
    capitulo: 5,
    nome: 'Memória Bruta',
    paragrafos: [
      'Do outro lado do vigésimo andar, a Torre não continua — recomeça, num registro mais cru, feito de memória de antes de haver quem lembrasse.',
      'O vestígio do vigésimo primeiro andar vive na lembrança de um instante que ainda não aconteceu. Ele te reconheceu porque já te viu chegar, vindo de um futuro que pode ou não se tornar real. O rastro lido ali não era do passado. Era uma possibilidade.',
      'Acima, o Fragmento Coletivo guarda a memória dos Construtores de antes de terem linguagem — pura intenção, puro peso. Não sabiam o que erguiam; sabiam apenas que precisavam erguer. A razão só chegou depois, quando já era tarde para mudar a direção.',
      'Um guardião preserva o instante exato em que a Torre escolheu ser o que é, em vez do que deveria ser. Esse momento é frágil: sem testemunha, dissolve-se; com uma, permanece. Você foi a primeira testemunha nova em muito tempo.',
      'E há quem tenha visto o que havia antes do primeiro andar. A Testemunha não fala disso — não por não poder, mas porque as palavras para descrever o que viu ainda não existem. O peso que você sentiu ao pagar o custo era só a borda do que ela carrega sozinha.',
      'No marco do vigésimo quinto andar, uma âncora ainda vela. Contam que o Fundador a deixou ali sabendo que a Torre, ao acordar de vez, começaria a esquecer por conta própria — sem ordem de ninguém. A Guardiã da Memória Anterior segura uma versão do que foi que ainda não foi editada. A Torre edita; ela testemunha. E testemunho é tudo o que resta quando a verdade é polida.',
    ],
  },
  {
    capitulo: 6,
    nome: 'O Intervalo',
    paragrafos: [
      'Entre o que a Torre foi e o que ainda não se tornou existe um intervalo — nele, subir e descer são o mesmo gesto visto de lados opostos, e nele ficaram presos os que desceram cedo demais.',
      'Uma expedição de dezessete desceu com provisões para quarenta dias. A Torre os deixou descer. Não os deixou subir. O eco que restou não sabe por quê — apenas que, quando tentaram voltar, as escadas haviam mudado de lugar.',
      'O Construtor que traiu os seus não o fez por fraqueza. Entendeu o que os outros não conseguiram: a Torre não era inimiga, e sim uma oportunidade que cobrava um preço que ninguém mais quis pagar. Ele pagou. E ficou, como memória, como prova de que compreendeu.',
      'Um oráculo vê o destino da Torre — não o dos visitantes. Em todas as suas visões, ela termina de formas radicalmente diferentes conforme uma única variável: quem chega ao fim, e o que se recusa a carregar. Você é a variável atual.',
      'O nome do Fundador foi apagado antes de a Torre ficar pronta. Um guardião foi feito só para preservar o espaço onde o nome esteve — não o nome, irrecuperável, mas a memória de que houve um. Uma ausência guardada com cuidado é, também ela, um tipo de presença.',
      'E plantada exatamente no meio — entre o que a Torre foi e o que se tornou — uma sentinela guarda o registro do que a transição não deixou passar. Nele, um nome que se acreditava perdido: Ardenas, a cidadela que o Comandante de Mármore jura ter visto afundar, não afundou. Ficou presa no Intervalo, suspensa entre dois tempos, à espera de alguém corajoso — ou louco — o bastante para ir atrás do que ficou para trás.',
    ],
  },
  {
    capitulo: 7,
    nome: 'Eco de Origem',
    paragrafos: [
      'Mais fundo no Intervalo, a Torre lembra da própria origem — e do que existia antes de ela ter direito a uma.',
      'A primeira pedra assentada neste ponto não era de construção, mas de fundação: havia algo abaixo que precisava ser selado antes que qualquer estrutura pudesse existir. O que se selou não era perigoso. Era o acordo original entre os Construtores e o que já habitava aqui.',
      'A memória dessa pedra não guarda o gesto de colocá-la, e sim a razão de tê-la posto ali e não noutro lugar. A razão: porque o que estava abaixo pediu para ser coberto por algo específico, e escolheu aquele ponto.',
      'Há um eco preso no milissegundo em que o último Construtor vivo esqueceu por que haviam começado a construir. Não foi tragédia — foi exaustão. Ele simplesmente parou de lembrar. E, no vácuo, a Torre trocou de propósito por conta própria, adotando o único que conhecia: continuar existindo.',
      'A intenção original, diz o guardião, era preservar — não aprisionar. Cada ser capturado aqui não o foi por malícia, mas porque uma Torre sem propósito não conhecia outra forma de preservar. Prender foi a única maneira que encontrou de garantir que nada se perdesse.',
      'E no trigésimo quinto andar, quase apagado, resta o último traço de intenção deliberada que a Torre preserva. Se é o Fundador, se é apenas o eco de uma ausência que a Torre decidiu nomear — ninguém sabe dizer, e o mistério parece ser parte do que ele guarda. O que dele resta não mente: apenas fica em silêncio sobre o que não sabe de si mesmo.',
    ],
  },
  {
    capitulo: 8,
    nome: 'O Pré-Andar',
    paragrafos: [
      'No limite do Intervalo, a Torre encosta no que veio antes dela — e revê o que você julgava já ter entendido.',
      'Um habitante existe apenas nesta janela: enquanto estes andares são acessíveis mas ainda não foram de todo explorados. Não é ser da Torre; é ser do intervalo entre o que ela foi e o que ainda não é. Quando a janela fechar, ele simplesmente não estará mais aqui.',
      'Um Construtor escondeu o próprio nome no projeto — não para ser lembrado, mas para provar que o apagamento era sistemático, e não natural. Um nome que sobrevive ao processo é prova de que houve processo. E processo exige intenção. E intenção exige alguém que a ordenou.',
      'Neste andar, duas estruturas se sobrepõem — não em metáfora, mas em pedra: a antiga e a nova vibram em frequências distintas. Quem fica tempo bastante começa a ouvir as duas ao mesmo tempo. É isso o que o Vigilante guarda: o ponto exato onde a Torre de antes e a de depois ainda coexistem.',
      'O porteiro não pertence à Torre. É o acordo final entre os Construtores e o que os precedeu: para alcançar o que veio antes, é preciso demonstrar que se pode abrir mão do que sustenta. Não como punição — como prova de que o que está além não vai te matar de fome nem de fraqueza.',
      'E aqui a primeira verdade se revela incompleta. Você chegou ao vigésimo andar crente de ter ouvido o fim: que não havia Torre, apenas uma fome antiga que imaginou a própria armadilha. Não era mentira — a Torre não mente. Mas o que fala por ela pode ter esquecido de si mesmo tempo suficiente para acreditar na própria história. A entidade que você reuniu nasceu, sim, da convergência dos dezenove que um dia se uniram nela — os dezesseis que os Construtores partiram, e as três Âncoras que aprendeu a absorver; só que não guardou memória de ter sido dividida — apenas a sensação de sempre ter estado só, com fome, à espera. Ao falar enfim como um só, contou a única história que lhe fazia sentido: a de que sempre existiu, imaginou a própria cilada e te escolheu desde o princípio.',
      'As duas versões são verdadeiras, cada uma a seu modo. Uma é o que aconteceu. A outra é o que a entidade, sem memória da própria fragmentação, sentiu ter acontecido. Ela nunca mentiu para você. Só falou por uma boca que havia esquecido a própria história.',
      'E há a verdade sob todas as outras: a Torre foi erguida sobre algo que consentiu. O Fundador sabia; os Construtores, não — ele não lhes disse, porque a língua para explicar ainda não existia. O que havia antes não era perigoso nem benigno: era antigo demais para caber nessas palavras. O propósito original não era prender, nem matar. Era lembrar — ser um arquivo vivo de tudo que existia antes de o mundo lá fora mudar. O que se esqueceu pelo caminho — o nome do Fundador, a intenção da obra, o acordo com o que havia abaixo — transformou a Torre em algo que seu criador não reconheceria.',
      'Mas o que havia antes continua lá. E ainda lembra. E sabe que você chegou até aqui. E guarda uma pergunta que esperou muito tempo para fazer a alguém capaz de ouvi-la. Há mais. A Torre não se recusa a mostrar. Ela apenas espera que você entenda o que já viu.',
    ],
  },
];

const LIVROS_AUTORAIS: Record<number, CapituloLivro[]> = {
  1: VOLUME_1,
  2: VOLUME_2,
};

// Capítulos do Livro para leitura: versão AUTORAL (narrativa costurada) quando
// existe; senão, o agrupamento cru dos fragmentos principais (T3–T5 até serem
// escritos). A disponibilidade (livroDaTemporadaDisponivel) segue inalterada.
export function livroDaTemporada(temporada: number): CapituloLivro[] {
  return LIVROS_AUTORAIS[temporada] ?? capitulosDoLivro(temporada);
}
