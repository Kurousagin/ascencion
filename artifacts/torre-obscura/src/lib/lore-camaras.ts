// ─── CAMARAS_LORE — texto narrativo das câmaras secretas ─────────────────────
// Única fonte de verdade do texto (descricao, sucessoTexto, falhaTexto, loreGanho).
// A mecânica (requisito, dificuldade, custo, recompensas) vive em game-data.ts,
// que consome este objeto via spread em CAMARAS_SECRETAS.

export const CAMARAS_LORE: Record<string, {
  descricao: string;
  resultado: { sucessoTexto: string; falhaTexto: string; loreGanho?: { titulo: string; texto: string } };
}> = {
  '1_1': {
    descricao: 'Enquanto o Rastreador explorava a Mata Cinzenta, notou marcas diferentes — pegadas que ninguém havia registrado.',
    resultado: {
      sucessoTexto: 'Encontrou um abrigo escondido com suprimentos antigos.',
      falhaTexto: 'A trilha levava a uma armadilha — conseguiu sair, mas ferido.',
      loreGanho: { titulo: 'A Ordem Interceptada', texto: 'Uma ordem original, queimada: dizia para destruir o selo, não guardá-lo. Alguém trocou uma única palavra e mudou tudo.' },
    },
  },
  '2_1': {
    descricao: 'Enquanto o Erudito decifrava símbolos antigos, notou marcas diferentes na parede — uma câmara escondida.',
    resultado: {
      sucessoTexto: 'Decodificou uma tábua de conhecimento perdido.',
      falhaTexto: 'Os símbolos eram um código de proteção — recuou antes de ativar.',
      loreGanho: { titulo: 'A Língua Anterior', texto: 'Fragmentos de uma linguagem que precede qualquer idioma catalogado. Os padrões sugerem urgência.' },
    },
  },
  '3_1': {
    descricao: 'Enquanto moradores caíam e voltavam à Terra, você percebeu uma câmara que só aparecia entre as mortes.',
    resultado: {
      sucessoTexto: 'Venceu o eco da morte e encontrou o que ela guardava.',
      falhaTexto: 'O eco foi mais forte — você recuou antes de ser consumido.',
      loreGanho: { titulo: 'O Retorno à Terra', texto: 'A morte não é fim aqui — é retorno. A câmara mostra que cada corpo que cai alimenta algo abaixo.' },
    },
  },
  '4_1': {
    descricao: 'A Voz do Cristal sussurra uma verdade — há uma câmara que só quem ouve de verdade consegue encontrar.',
    resultado: {
      sucessoTexto: 'O cristal revelou o acesso. Dentro, fragmentos de verdades antigas.',
      falhaTexto: 'Sem a bênção da Voz, a câmara permanece fechada.',
      loreGanho: { titulo: 'A Memória do Cristal', texto: 'O cristal catalogou cada verdade que passou por aqui. Aqui estão gravadas as palavras que ninguém deveria ter dito.' },
    },
  },
  '4_2': {
    descricao: 'Entre os cacos do cristal, há um espaço onde a memória não consegue se formar direito.',
    resultado: {
      sucessoTexto: 'Com o ferro, restaurou o caminho. Encontrou registros intactos.',
      falhaTexto: 'Sem ferro, o caminho colapsa — você recuou.',
      loreGanho: { titulo: 'O Que Foi Esquecido', texto: 'Registros de expedições anteriores, apagadas dos arquivos oficiais. Ninguém deveria saber que passaram daqui.' },
    },
  },
  '5_1': {
    descricao: 'O Guardião mantém uma fresta fechada — mas quem compreender seu vigil consegue entrar.',
    resultado: {
      sucessoTexto: 'Passou pelo Limiar. Dentro, o que o Guardião vigila há eras.',
      falhaTexto: 'O Guardião bloqueou o caminho — não era hora.',
      loreGanho: { titulo: 'O Erro Guardado', texto: 'Uma fresta que não deveria existir. Um segredo que um único Guardião carrega. Ele vigia não por dever, mas por punição — a de saber.' },
    },
  },
  '6_1': {
    descricao: 'Enquanto um Batedor rastreava, encontrou marcas de quem construiu este andar — marcas que não eram humanas.',
    resultado: {
      sucessoTexto: 'Seguiu as marcas até uma câmara que documenta o processo.',
      falhaTexto: 'As marcas desapareceram — você perdeu o rastro.',
      loreGanho: { titulo: 'A Técnica Original', texto: 'O processo construtivo era diferente. Não era força — era intenção. Cada pedra era colocada com um propósito além do suporte estrutural.' },
    },
  },
  '7_1': {
    descricao: 'A Jardineira guarda uma câmara onde o que cresce não é madeira ou pedra, mas memória.',
    resultado: {
      sucessoTexto: 'Dentro, um jardim impossível. Tudo que cresce aqui alimenta-se de histórias.',
      falhaTexto: 'Sem permissão, as plantas recusam crescer — o caminho permanece bloqueado.',
      loreGanho: { titulo: 'O Cultivo da Torre', texto: 'A Torre não é só pedra — em algum nível, ela respira como uma planta. Cresce, adapta-se, alimenta-se.' },
    },
  },
  '7_2': {
    descricao: 'Entre as raízes do andar, há uma câmara que guarda o que germinou antes da Torre existir.',
    resultado: {
      sucessoTexto: 'Só olhos que a Torre marcou perceberam. Dentro, o primórdio preservado.',
      falhaTexto: 'Sem esses olhos, a câmara permanece invisível.',
      loreGanho: { titulo: 'O Que Veio Primeiro', texto: 'Antes da Torre, algo crescia aqui. A Torre foi construída SOBRE isso, não antes. Aquilo continua crescendo.' },
    },
  },
  '8_1': {
    descricao: 'O Estudioso guardou um arquivo secreto — documentação de tudo que aprendeu e que o fizeram esquecer.',
    resultado: {
      sucessoTexto: 'O arquivo abriu. Conhecimento que transcende o catalogado.',
      falhaTexto: 'Sem a experiência necessária, o arquivo permanece selado.',
      loreGanho: { titulo: 'O Esquecimento Imposto', texto: 'O Estudioso foi silenciado. Seu arquivo contém teorias que a Torre não quer que ninguém saiba. Ele documentou tudo, esperando que alguém encontrasse.' },
    },
  },
  '9_1': {
    descricao: 'O Ferreiro Espectral mantém uma forja que só quem sofreu o suficiente consegue ligar.',
    resultado: {
      sucessoTexto: 'A forja acendeu. Dentro, armas que o Ferreiro nunca terminou.',
      falhaTexto: 'A forja apagou — ela exige perdas que a sua cidadela ainda não conheceu.',
      loreGanho: { titulo: 'A Arma Inacabada', texto: 'O Ferreiro tentava forjar algo que pudesse ferir a própria Torre. Nunca terminou. Aqui estão seus rascunhos.' },
    },
  },
  '10_1': {
    descricao: 'A Memória da Construção guarda o segredo maior — o método que o Fundador usou.',
    resultado: {
      sucessoTexto: 'Encontrou o método. O Fundador repete: vencer é lembrar.',
      falhaTexto: 'Sem o conhecimento da Memória, o método permanece indecifrado.',
      loreGanho: { titulo: 'O Método do Fundador', texto: 'Não era força. Era lembrar. O Fundador repetiu o propósito original em voz alta por quarenta dias até que a Torre cedesse.' },
    },
  },
  '10_2': {
    descricao: 'Um segundo arquivo existe aqui — nomes que foram catalogados e depois apagados deliberadamente.',
    resultado: {
      sucessoTexto: 'Os nomes apareceram. Cada um, uma história riscada dos registros.',
      falhaTexto: 'Os nomes permaneceram invisíveis — você não tinha direito de ler.',
      loreGanho: { titulo: 'Os Esquecidos', texto: 'Expedições inteiras passaram aqui. A Torre catalogou cada uma. Depois apagou. Aqui estão seus nomes, como resistência contra o esquecimento.' },
    },
  },
  '11_1': {
    descricao: 'O Afogado Lúcido abriu uma fresta na realidade — uma câmara que existe entre a água e o ar.',
    resultado: {
      sucessoTexto: 'A fresta se abriu. Dentro, a confissão do Afogado em forma de ar.',
      falhaTexto: 'Sem sustento, você afogou-se antes de cruzar a fresta.',
      loreGanho: { titulo: 'A Respiração Dupla', texto: 'A Torre não mata — ela preenche. Aqui o Afogado documentou o processo exato de como deixou de ser gente e virou espaço vazio.' },
    },
  },
  '12_1': {
    descricao: 'O pulso da Torre bate mais fundo aqui. Um Combatente experiente consegue sincronizar-se com ele.',
    resultado: {
      sucessoTexto: 'Sincronizou. O pulso compartilhou suas memórias.',
      falhaTexto: 'Desincronizado, o pulso expulsou você com força.',
      loreGanho: { titulo: 'A Batida Original', texto: 'O pulso é a Torre. A Torre é um coração. E um coração bate por intenção, não por acaso.' },
    },
  },
  '13_1': {
    descricao: 'O Oráculo Invertido vê o futuro ao contrário. Uma câmara existe onde ontem e amanhã ocupam o mesmo espaço.',
    resultado: {
      sucessoTexto: 'O Oráculo revelou — você viu seu futuro ao contrário.',
      falhaTexto: 'A revelação era demais — você enlouqueceu temporariamente.',
      loreGanho: { titulo: 'A Visão Invertida', texto: 'Você viu onde termina. Agora sabe onde começar. O Oráculo não previne — apenas mostra a verdade de trás para frente.' },
    },
  },
  '14_1': {
    descricao: 'O Comandante guardou sua estratégia final — a câmara onde a vitória foi planejada e depois abandonada.',
    resultado: {
      sucessoTexto: 'Encontrou o plano. O Comandante sabia como vencer desde o começo.',
      falhaTexto: 'Sem a bênção do Comandante, a câmara permanece estratégica mas fechada.',
      loreGanho: { titulo: 'A Estratégia Abandonada', texto: 'Dizem que o Comandante viu como vencer — e escolheu não vencer. Aqui está registrado por quê. E a resposta é pior que qualquer derrota.' },
    },
  },
  '15_1': {
    descricao: 'Uma sala inteira de espelhos submersos. O Vigia da Pergunta guardou um reflexo que não mostra você.',
    resultado: {
      sucessoTexto: 'O reflexo desaparecido apareceu. Você viu a versão de si que parou antes.',
      falhaTexto: 'O espelho rejeitou sua visão — você viu apenas vazio.',
      loreGanho: { titulo: 'O Que Preenche a Torre', texto: 'Cada reflexo aqui foi alguém preenchido até deixar de ser gente. O vazio deixado ficou tão claro que se tornou visível.' },
    },
  },
  '15_2': {
    descricao: 'A pergunta que o Vigia recusou responder tem uma câmara própria — e ela continua fazendo perguntas.',
    resultado: {
      sucessoTexto: 'A pergunta abriu seus olhos. A resposta você já sabia.',
      falhaTexto: 'A pergunta só fala a ouvidos fora do comum — e permaneceu inaudível.',
      loreGanho: { titulo: 'A Imortalidade da Pergunta', texto: 'Uma pergunta bem feita nunca morre — apenas muda de quem a faz. O Vigia guardou-a aqui para que alguém mais a fizesse um dia.' },
    },
  },
  '16_1': {
    descricao: 'O Eco Faminto guarda uma câmara onde o vazio tem fome e ela documenta cada coisa que comeu.',
    resultado: {
      sucessoTexto: 'A fome compartilhou sua memória. Você sente cada coisa que comeu.',
      falhaTexto: 'A fome pediu mais — você recuou faminto.',
      loreGanho: { titulo: 'O Apetite da Torre', texto: 'Não é fome física. É fome de espaço vazio. A Torre come realidade — a realidade que pessoas trazem quando sobem.' },
    },
  },
  '17_1': {
    descricao: 'O Paradoxo Ambulante documenta os caminhos que poderiam ter sido. Uma câmara para cada vida não vivida.',
    resultado: {
      sucessoTexto: 'As câmaras abriram. Cada uma mostra uma escolha que nunca fez.',
      falhaTexto: 'Os paradoxos se cancelaram mutuamente — a câmara não abriu.',
      loreGanho: { titulo: 'As Vidas Não Vividas', texto: 'Para cada escolha, uma vida é apagada. O Paradoxo guardou-as aqui como prova de que você matou versões de si mesmo ao subir.' },
    },
  },
  '18_1': {
    descricao: 'O Último Defensor construiu uma câmara para guardar aquilo que a Torre tentou apagar.',
    resultado: {
      sucessoTexto: 'O bastião abriu. Dentro, as evidências que ele não conseguiu destruir.',
      falhaTexto: 'Sem a bênção do Defensor, o bastião permanece intransponível.',
      loreGanho: { titulo: 'O Que a Torre Tentou Apagar', texto: 'O Defensor não caiu em combate — foi apagado da própria pedra. Sua câmara é o último registro de que ele existiu.' },
    },
  },
  '19_1': {
    descricao: 'O Susurro do Limiar vem de uma câmara que existe na respiração entre você e o que vem a seguir.',
    resultado: {
      sucessoTexto: 'Rastreou o sussurro. Dentro, um aviso que não é para você — é para depois.',
      falhaTexto: 'O sussurro desapareceu — você perdeu a pista.',
      loreGanho: { titulo: 'O Aviso para Depois', texto: 'Alguém deixou um recado nesta câmara. Não é para você — é para quem vier depois de você. Ainda assim, você consegue ler.' },
    },
  },
  '20_1': {
    descricao: 'A entidade do Andar 20 guarda uma câmara onde ela dorme enquanto não está observando ninguém.',
    resultado: {
      sucessoTexto: 'Entraram enquanto ela dormia. Ali repousam os registros de séculos de vigília.',
      falhaTexto: 'Ela acordou — vocês recuaram antes de ser vistos.',
      loreGanho: { titulo: 'O Que Ela Observa', texto: 'A entidade documentou cada pessoa que chegou ao Andar 20. Seus apontamentos são precisos — ela sabe exatamente quem você é.' },
    },
  },
  '20_2': {
    descricao: 'Antes de tudo, havia uma verdade. A entidade guardou-a em uma câmara que só existe para quem vence o Andar 20.',
    resultado: {
      sucessoTexto: 'A verdade revelou-se. Não era o que você esperava.',
      falhaTexto: 'A verdade permaneceu oculta — você não estava pronto.',
      loreGanho: { titulo: 'A Verdade Antes de Tudo', texto: 'Antes de qualquer Construtor, qualquer Torre, qualquer morte — havia uma verdade. A entidade nunca a nomeou. Apenas observou enquanto você a descobria.' },
    },
  },
};
