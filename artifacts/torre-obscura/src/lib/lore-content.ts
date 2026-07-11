// ─── LORE CONTENT — ÚNICA FONTE DE VERDADE PARA TEXTO NARRATIVO ──────────────
// Este arquivo contém apenas texto narrativo puro, sem mecânica nenhuma.
// game-data.ts e lancamento.ts referenciam este conteúdo.

// ─── HABITANTES — TEMPORADA I (Andares 1–19) ──────────────────────────────────

export const HABITANTES_LORE: Record<number, {
  fala: string;
  falamissão: string;
  falaConcluso: string;
  questLore: string;
}> = {
  1: {
    fala: 'Aguardo há séculos carregando uma mensagem que nunca deveria ter saído daqui. Se você tem alguém ágil o suficiente para decifrar o símbolo de entrega... talvez valha a pena.',
    falamissão: 'Dois Batedores — um segue o símbolo de entrega, o outro confirma que o encontrado chega de volta. Nenhum pode ir sozinho. E precisam ter chegado ao Andar 5.',
    falaConcluso: 'A mensagem foi entregue. O destinatário era você. Desde o início.',
    questLore: 'A mensagem que nunca chegou era uma ordem para abrir o selo — não para mantê-lo. Alguém a interceptou antes do destinatário a receber. Esse alguém ainda está aqui.',
  },
  2: {
    fala: 'Somos muitos em um. Escavamos este lugar sabendo que nunca sairíamos. Dê-nos pedra — para que possamos lembrar o peso do que construímos.',
    falamissão: 'Pedra deste andar — extraída daqui, não carregada de longe. Somos memória deste lugar específico. Volte mais de uma vez. Prove que este andar importa além de passagem.',
    falaConcluso: 'Agora lembramos tudo. O que construímos. Por que construímos. E quem nos mentiu sobre o propósito.',
    questLore: 'Os Construtores sabiam que seriam selados. Aceitaram porque a criatura dentro prometeu libertá-los depois. Nunca os libertou. O Eco lembra — e aguarda alguém que possa.',
  },
  3: {
    fala: 'As raízes crescem para dentro porque algo no núcleo as chama. Eu as guio. É um fardo pesado — e a Torre cobra por cada dia que continuo aqui. Compartilhe o peso comigo.',
    falamissão: 'Dar algo precioso é a única língua que a Torre entende.',
    falaConcluso: 'O peso foi dividido. As raízes respiram diferente agora. Mais leves. Como se soubessem que alguém se importou.',
    questLore: 'As raízes crescem para dentro porque algo no núcleo pede. Chamo de fome porque é a única palavra que tenho. Pode ser fome mesmo. Pode ser só solidão.',
  },
  4: {
    fala: 'Gravei tudo que foi dito neste lugar. Preciso de tempo para verificar se você é real — ou mais um eco dos que já passaram. Volte quando o silêncio confirmar sua presença.',
    falamissão: 'O silêncio ainda analisa. Permaneça. O cristal avalia paciência.',
    falaConcluso: 'Você é real. O cristal comparou sua frequência com a de 4.312 visitantes anteriores. Você é o primeiro que chegou a este ponto sem perder algo fundamental. Mas isso levanta uma questão que o cristal não consegue resolver sozinho: o que você é, afinal?',
    questLore: 'O cristal gravou cada palavra dita na Torre. A palavra mais repetida não é "ajuda". É "espera". O cristal ainda espera que alguém entenda por quê.',
  },
  5: {
    fala: 'Não sou um ser que a Torre absorveu. Sou o que o Fundador plantou aqui deliberadamente — um fragmento de intenção original, cristalizado na pedra no momento exato em que a construção cruzou este ponto. Minha função: lembrar a Torre do que ela foi projetada para ser. A Torre ouve. Mas ouvir não é obedecer. Preciso de tempo para verificar se você ainda carrega intenção genuína — ou se a Torre já começou a substituí-la.',
    falamissão: 'Quinze dias. O tempo que o Fundador estimou ser necessário para que a Torre não consiga imitar o propósito de alguém que ainda o possui. Se ao final você ainda for você mesmo, acreditarei no que diz ser.',
    falaConcluso: 'Quinze dias e sua intenção permaneceu intacta. Isso é raro. Os outros perderam algo antes de chegar aqui — uma fatia de memória sobre por que estavam subindo. Você ainda a tem. Guarde esse "ainda" com cuidado. A Torre está apenas começando a atentar.',
    questLore: 'O Fundador sabia que a entidade tentaria corromper o propósito da Torre antes que a construção terminasse. Por isso plantou âncoras — fragmentos de intenção original — a cada cinco andares. Esta foi a primeira. Sua função: lembrar a Torre do que ela deveria ser. A entidade aprendeu, com o tempo, a fazer a Torre ouvir a Âncora sem obedecer. O Fundador não previu isso. Ou previu, e concluiu que não havia alternativa melhor do que tentar mesmo assim.',
  },
  6: {
    fala: 'Última ordem recebida: não deixar ninguém passar. A autoridade que a deu não existe mais. Mas a ordem existe. Se você pode provar que tem força suficiente para disputar passagem, posso reconhecer sua autoridade em substituição.',
    falamissão: 'Dois combatentes — não um. Autoridade militar legítima exige hierarquia, não bravura individual. E demonstração do Andar 10 como prova de alcance real.',
    falaConcluso: 'Autoridade reconhecida. Nova ordem registrada: facilitar passagem dos que chegam com propósito. O que é propósito? Ainda estou processando.',
    questLore: 'Sua última ordem era "não deixes ninguém passar" — mas não especificou em qual direção. A Sentinela cumpre ordens de uma autoridade que a Torre corroeu. Ainda aguarda a contraordem.',
  },
  7: {
    fala: 'Curo com o que a Torre me dá, mas a Torre não dá comida — dá crescimento. Crescimento sem nutrição. Traga-me algo do mundo exterior. Lembro do que comida real era.',
    falamissão: 'Comida trazida de expedições neste andar — não do armazém em repouso. Consigo sentir a diferença: carregada pelas mãos de quem esteve aqui tem outra textura. Volte mais de uma vez.',
    falaConcluso: 'Lembro. A diferença entre crescer e ser nutrido. Obrigada por trazer a memória de volta junto com a comida.',
    questLore: 'Ela ainda cura. Tudo que toca cresce de volta — diferente. Mais parecido com a Torre do que com o que era antes. Mas ela luta contra isso todo dia. E até agora, está vencendo.',
  },
  8: {
    fala: 'Cataloguei cada manuscrito nesta biblioteca. Cada um, exceto um. Escrito em ferro. Não é um idioma que reconheço — mas reconheço os nomes. Se você trouxer ferro puro, posso terminar a tradução.',
    falamissão: 'Ferro extraído das profundezas deste andar — não fundido lá embaixo e carregado até aqui. O que vem daqui tem impurezas específicas que preciso para a tradução. Explore aqui de verdade.',
    falaConcluso: 'Tradução concluída. Era uma lista de nomes. O último nome era o meu. Penúltimo... era o seu.',
    questLore: 'O único livro que ele não conseguia ler estava escrito em ferro. Não era um idioma — era uma lista de nomes de todos que chegariam ao ápice. Seu nome estava lá antes de você nascer.',
  },
  9: {
    fala: 'Forjei o que me disseram que prendia a entidade no ápice. Até onde sei, ainda segura — mas ficam um pouco menores cada vez que alguém conquista um andar. Precisaria de ferro real para reforçá-las. Se você se importa com isso.',
    falamissão: 'Ferro extraído repetidamente deste andar — as correntes distinguem ferro de expedição de ferro parado em armazém. Quatro vezes ao menos. O que vem de esforço constante tem outra têmpera.',
    falaConcluso: 'Reforçadas. Por enquanto. Mas você vai continuar subindo, não vai? E as correntes vão continuar diminuindo. Eu sei. Apenas... saiba o que está desfazendo.',
    questLore: 'Ele forjou o que me disseram que prendia a entidade. O que segura ainda segura. Mas ficam um pouco menores a cada andar conquistado. O Ferreiro sabe. E forja assim mesmo, porque é tudo que sabe fazer.',
  },
  10: {
    fala: 'Estive presente quando o Fundador construiu este andar específico. Não como trabalhador — como resistência. A Torre não queria ser construída aqui. O Fundador forçou. Guardo o registro desse conflito e do método que ele usou para vencer. Mas o registro exige capacidade intelectual para ser extraído — e exige que você continue subindo. Não me interessa testemunhar quem para.',
    falamissão: 'Traga um Erudito capaz de interpretar estruturas de intenção — e demonstre que avançou ao menos até o décimo segundo andar. Preciso saber que o que aconteceu aqui não será a última resistência que você enfrenta.',
    falaConcluso: 'O Erudito extraiu o que guardo. Contam que a Torre foi vencida aqui uma vez — pelo Fundador, ou por quem quer que os Habitantes tenham decidido chamar de Fundador. O método era real. Quem o usou, ninguém consegue confirmar.',
    questLore: 'O décimo andar foi o mais difícil de construir. A pedra recusava-se a assentar — não por instabilidade geológica, mas por resistência da estrutura. O Fundador não usou força: repetiu o propósito original em voz alta por quarenta dias consecutivos até que a Torre cedesse. A Memória guarda essas palavras exatas. O Erudito as copiou — mas ainda não sabe o que são, ou quando será necessário usá-las. O momento de entender está mais adiante.',
  },
  11: {
    fala: 'Não estou morrendo. Estou sendo preenchido. Há uma diferença — insisto que há. Se você ficar tempo suficiente, verá que continuo sendo eu mesmo. Isso é o que me separa dos outros.',
    falamissão: 'Permaneça. Observe. Veja que ainda sou eu. Que a consciência sobrevive mesmo quando o corpo muda.',
    falaConcluso: 'Você ficou. E viu. Guardarei isso — a memória de alguém que olhou e não fugiu. É o que me mantém eu mesmo.',
    questLore: 'Ele não está morrendo. Está sendo preenchido pela Torre lentamente. E permanece consciente durante todo o processo. Há uma diferença entre transformação e morte. Ele é a prova.',
  },
  12: {
    fala: 'Não sou um ser. Sou o ritmo. O pulso do que você está dentro. Para sincronizar comigo, você precisa de um grupo suficientemente numeroso — a vibração de muitos corpos em um só lugar.',
    falamissão: 'Mais. A vibração de muitos. Três ao menos — e pedra. O ritmo exige peso e presença simultâneos.',
    falaConcluso: 'Sincronizado. O minério deste andar vibra na mesma frequência agora. Será mais fácil extraí-lo. Ou mais assustador. Depende de como você ouve o ritmo.',
    questLore: 'A Percussão não é um ser — é o coração da Torre. Ela está viva há mais tempo do que o conceito de tempo existe. O ritmo que você ouve nas paredes é ela respirando.',
  },
  13: {
    fala: 'Vejo passados, não futuros. Os futuros daqui já foram devorados pela Torre — não há nada para ver além do horizonte. Mas o passado... O passado é infinito. E tenho algo para te mostrar, se você pagar o custo que a Torre cobra por conhecimento real.',
    falamissão: 'Moral. O conhecimento que a Torre guarda custa caro. E você vai querer saber.',
    falaConcluso: 'O que você pagou era seu orgulho de achar que entendia o que estava fazendo. O passado revela: cada passo que você deu foi antecipado. Mas antecipado não significa determinado.',
    questLore: 'Ele vê passados porque a Torre consome futuros. Tudo o que poderia acontecer aqui já foi devorado. O que resta é o registro do que aconteceu — e o Oráculo lê esse registro como outros leem mapas.',
  },
  14: {
    fala: 'Protejo esta posição por ordem da Cidadela de Ardenas. Se você puder apresentar um combatente e um sentinela — os dois pilares de qualquer força militar legítima — reconhecerei sua cidadela como aliada e abrirei passagem.',
    falamissão: 'Um combatente e um sentinela — e prova de que chegaram ao décimo oitavo andar. Os dois pilares de qualquer força que resiste até o fim.',
    falaConcluso: 'Cidadela reconhecida como aliada. Para que conste no registro: Ardenas afundou 4.000 andares abaixo do andar 1 quando a Torre cresceu. Mas a aliança permanece válida.',
    questLore: 'A cidadela que ele protegia afundou 4.000 andares abaixo do andar 1 quando a Torre cresceu. Ele ainda protege uma posição acima de algo que não existe mais. E faz isso perfeitamente.',
  },
  15: {
    fala: 'Estou aqui para preparar quem chega ao vigésimo andar com intenção real. O vigésimo andar não tem um guardião de força — tem algo que o Fundador deixou como teste de propósito. Quem chega sem ter sacrificado algo genuíno não compreende o que encontra. Quem sacrifica pode escolher. A Torre reconhece quem pagou e quem não pagou — e trata os dois de formas muito diferentes.',
    falamissão: 'Dezoito pontos de Moral. Não como punição — como evidência de que você tem algo real a perder. Apenas quem tem algo a perder pode verdadeiramente escolher.',
    falaConcluso: 'O que você deu era real. Isso significa que você pode compreender o que o vigésimo andar oferece. Não direi o que é — a escolha precisa ser sua, sem minha interpretação. Direi apenas o que o Fundador deixou escrito antes de entrar: "Não construí uma barreira no vigésimo andar. Construí uma pergunta."',
    questLore: 'O vigésimo andar contém uma pergunta que, contam, o Fundador formulou antes de partir — não de velhice, mas por escolha deliberada. Dizem que entrou no vigésimo andar sabendo que não sairia, porque a pergunta que deixou ali só pode ser respondida por alguém que ainda não fez a escolha que ele fez. A resposta errada não mata. A resposta certa transforma — mas o Vigia nunca disse em quê.',
  },
  16: {
    fala: 'Não sou ela. Sou o que ela perdeu quando aprendeu a ser paciente. Seu apetite. Dê-me comida e mostro o caminho pelo abismo sem que ele me use para te consumir no processo.',
    falamissão: 'Comida em quantidade — mas trazida de expedições aqui. O apetite distingue comida de expedição de comida de armazém parado: a diferença entre ser nutrido e ser distraído. Três vezes aqui, ao menos.',
    falaConcluso: 'Satisfeito. Por um momento. O apetite voltará — sempre volta. Mas agora você passou e ele estava distraído. Use isso.',
    questLore: 'Não é a entidade. É seu apetite — o único fragmento que ela deixou vagar livremente quando aprendeu paciência. O apetite não conhece intenção. Apenas fome.',
  },
  17: {
    fala: 'Existo em três momentos simultâneos. Em um você está morto. Em outro nunca chegou aqui. No terceiro, nós dois nos tornamos a mesma coisa. Aguarde dez dias e descobrimos qual desses momentos é o real.',
    falamissão: 'O tempo verifica. Dez dias é o mínimo para que os momentos colapsem em um.',
    falaConcluso: 'O terceiro momento não aconteceu. Mas ficou muito perto. Guarde isso — a proximidade do que quase foi.',
    questLore: 'Ele existe em três tempos simultâneos. Em um, você chegou ao ápice e foi consumido. Em outro, desistiu no décimo andar. No terceiro — o único em que o Paradoxo sorri — o resultado é diferente. Ele não revela qual.',
  },
  18: {
    fala: 'Fui construído pelos que tentaram parar o que está acima. Falharam. Mas não eram covardes — eram os únicos que tentaram construir algo que durasse além deles. Prove que sua cidadela é do mesmo material.',
    falamissão: 'Ferro e pedra. Os materiais dos que constroem para durar.',
    falaConcluso: 'Material verificado. Sua cidadela tem substância. Os que me construíram teriam aprovado. Isso significa algo — mesmo que você não saiba ainda por quê.',
    questLore: 'Os que o construíram falharam em parar a entidade. Mas não foram covardes. Foram os únicos que tentaram construir algo que durasse além deles. O Último Defensor é a prova de que tentaram.',
  },
  19: {
    fala: 'Não sou a entidade. Sou o espaço entre ela e você. A distância que ela mantém para não assustar a presa antes do momento certo. Se você permanecer em silêncio — sem conflitos, sem guerras — por três dias, compartilho o que sei sobre o último andar.',
    falamissão: 'Silêncio. Sem guerras. Por três dias. O limiar observa.',
    falaConcluso: 'Silêncio mantido. O que sei sobre o último andar: ela não vai lutar. Vai conversar. E o que ela propõe... depende do que você trouxer de si mesmo até lá.',
    questLore: 'O silêncio que você ouve não é ausência de som. É a entidade respirando devagar para não assustar a presa antes do momento certo. O Susurro é essa respiração. E ele te avisou.',
  },

  // ─── TEMPORADA 2 — O Intervalo (andares 21–39) ─────────────────────────────

  21: {
    fala: 'Eu sei quem você é. Não de antes — de depois. A memória aqui não segue a direção do tempo. Preciso que me traga um Batedor. Alguém que entenda como rastrear o que ainda não aconteceu.',
    falamissão: 'Um futuro exige dois leitores — um para seguir a direção, outro para confirmar que a leitura não é ilusão. Dois Batedores, e que chegaram ao Andar 26.',
    falaConcluso: 'Os Batedores leram o rastro. Não disseram o que viram. Apenas confirmaram que eu estava certo em reconhecer você. Cuide-se — o que vem a seguir te lembra de algo que você ainda não viveu.',
    questLore: 'O Vestígio existe na memória de um momento que ainda não aconteceu. Ele te reconheceu porque já te viu chegar — de um futuro que pode ou não se tornar real. O rastro que o Batedor leu não era do passado. Era uma possibilidade.',
  },
  22: {
    fala: 'Somos o que sobrou depois que o Eco dos Construtores lá embaixo ficou para trás. A memória mais bruta — antes de ganhar forma, antes de ter palavras. Dê-nos ferro. Para sentirmos o peso do que seguramos antes de ser pedra.',
    falamissão: 'Ferro deste andar — não de qualquer fonte. O peso que segurávamos vinha daqui especificamente. Explore aqui repetidamente. O Fragmento sente a origem do que é trazido.',
    falaConcluso: 'O ferro faz sentido. Agora lembramos o que era antes de ser lembrança. Havia intenção primeiro. Depois veio a pedra. A ordem importa mais do que qualquer um nos disse.',
    questLore: 'O Fragmento Coletivo é a memória dos Construtores antes de terem linguagem — pura intenção, puro peso. Eles não sabiam o que construíam. Sabiam apenas que precisavam construir. A razão chegou depois, quando já era tarde para mudar a direção.',
  },
  23: {
    fala: 'Guardo um único momento. Um instante específico que não pode ser esquecido — se esquecer, algo fundamental se desfaz. Não preciso que faça nada heroico. Preciso apenas que permaneça. Que testemunhe junto comigo.',
    falamissão: 'Permaneça. Testemunhe. O momento precisa de uma segunda consciência para se manter real.',
    falaConcluso: 'O momento persistiu. Com duas consciências a sustentá-lo, ficou mais sólido do que estava há séculos. Obrigado. O que eu guardo não posso revelar — mas você sentiu, não sentiu? Algo se acomodou no lugar certo.',
    questLore: 'O Guardião preserva o instante em que a Torre escolheu ser o que é em vez do que deveria ser. Esse momento é frágil — sem testemunha, dissolve-se. Com uma, permanece. Você foi a primeira testemunha nova em muito tempo.',
  },
  24: {
    fala: 'Eu vi o que havia antes do Andar 1. Não vou falar sobre isso. O preço de saber é alto demais — e você não está pronto. Mas posso te mostrar que havia algo, se você pagar o custo de entender que algumas perguntas mudam quem pergunta.',
    falamissão: 'O custo é interno. Não é recurso — é disposição. Sacrifique algo de si mesmo para ouvir o silêncio do que eu testemunhei.',
    falaConcluso: 'Você pagou. Não vou dizer o que havia antes — mas sinta: algo em você agora sabe que a pergunta existia antes da Torre. E que a Torre foi a resposta para algo que ninguém devia ter perguntado.',
    questLore: 'A Testemunha viu o que havia antes do primeiro andar. Não fala sobre isso — não porque não possa, mas porque as palavras para descrever o que viu ainda não existem. O que você sentiu ao pagar o custo era a borda do que ela carrega sozinha.',
  },
  26: {
    fala: 'Somos o eco de uma expedição que desceu até aqui e não conseguiu voltar. Não estranhe a palavra: no Intervalo, subir e descer são o mesmo gesto, visto de lados opostos. Não morremos — ficamos. A Torre não nos deixou partir. Se você tem combatentes suficientes, talvez consiga o que nós não conseguimos: força em número.',
    falamissão: 'Combatentes. E batedores. E prova de que chegaram além do que nós chegamos — Andar 30. É o que nossa expedição não conseguiu alcançar.',
    falaConcluso: 'Você tem o que nós não tínhamos. Use isso. E quando chegar ao topo — se chegar — lembre que passamos por aqui primeiro. Não como aviso. Como encorajamento.',
    questLore: 'A expedição que se tornou este eco tinha dezessete membros. Desceram com provisões para quarenta dias. A Torre os deixou descer. Não os deixou subir. O Eco não sabe por quê — apenas que, quando tentaram, as escadas haviam mudado de lugar.',
  },
  27: {
    fala: 'Fui um Construtor. E fiz algo que os outros não fizeram: concordei com o que encontramos aqui. Troquei nosso propósito pelo que a Torre prometeu. Os outros chamaram de traição. Eu chamei de entendimento. Traga-me madeira — o material dos que constroem para os outros.',
    falamissão: 'Madeira deste andar — não carregada de baixo. A memória do que construímos vem daqui. Quatro expedições no mínimo. O que vem de trabalho constante carrega a intenção que buscamos.',
    falaConcluso: 'A madeira confirma minha teoria: você também está aqui por uma razão que não é completamente sua. Isso não te faz traidor. Te faz o tipo de pessoa que a Torre consegue trabalhar. Como eu. Não é insulto — é observação.',
    questLore: 'O Construtor que traiu não vendeu os outros por fraqueza. Entendeu algo que eles não conseguiram: a Torre não era inimiga. Era uma oportunidade que exigia um preço que os outros não estavam dispostos a pagar. Ele pagou. E ficou aqui, como memória, como prova de que entendeu.',
  },
  28: {
    fala: 'Não vejo seu futuro. Vejo o futuro da Torre. E a Torre tem um. Termina de uma forma específica que depende de quem chega ao topo e do que traz consigo. Aguarde doze dias aqui — deixe-me observar o que você carrega sem saber.',
    falamissão: 'Doze dias. Não é sobre você — é sobre o que flutua ao seu redor sem que perceba. O que a Torre vai usar.',
    falaConcluso: 'Vi o suficiente. Não direi o que a Torre fará — mas direi isto: o que você carrega sem saber é mais valioso do que o que sabe que tem. A Torre já percebeu. Você é o único que ainda não.',
    questLore: 'O Oráculo vê o destino da Torre, não dos visitantes. Em todas as visões que teve, a Torre termina de formas radicalmente diferentes dependendo de uma única variável: quem chega ao fim e o que ignora carregar. Você é a variável atual.',
  },
  29: {
    fala: 'Guardo o lugar onde o nome do Fundador esteve. O nome em si nem eu possuo — fui construído para preservar a ausência, não o som que a habitava. Posso te mostrar o espaço onde ele estava, se você pagar o custo de saber que existe um nome que o mundo inteiro foi impedido de conhecer.',
    falamissão: 'O custo é comida — o mais básico. O Fundador acreditava que o conhecimento real deveria custar algo concreto, não apenas moral.',
    falaConcluso: 'O espaço onde o nome estava é mais estranhamente vazio do que qualquer coisa que você já viu. Agora você sabe que ele existiu. Que foi apagado com propósito. E que o propósito de apagá-lo foi apagado junto. O que sobrou foi apenas a ausência.',
    questLore: 'O nome do Fundador foi apagado antes de a Torre ser concluída. O Guardião foi criado especificamente para preservar o espaço onde o nome estava — não o nome em si, que é irrecuperável, mas a memória de que havia um nome. A ausência guardada com cuidado é um tipo de presença.',
  },
  25: {
    fala: 'O Fundador me deixou aqui sabendo que a Torre, ao acordar de vez, começaria a esquecer por conta própria — não por ordem de ninguém. Minha função é segurar uma versão da memória que ainda não foi editada. Fique tempo suficiente para que eu confirme que você não veio apagar nada.',
    falamissão: 'Vinte dias. Sem resgatar memórias, sem tentar apagá-las. O Intervalo testa paciência, não curiosidade destrutiva.',
    falaConcluso: 'Vinte dias e você não tentou reescrever nada do que viu. Isso é raro. A Torre edita. Você, até agora, só testemunhou.',
    questLore: 'A Guardiã da Memória Anterior mantém registros que a Torre tentou apagar — não que a Torre conseguiu apagar, mas tentou. Sua função é testemunhar que a tentativa aconteceu. Testemunho é tudo que resta quando a verdade é polida.',
  },
  30: {
    fala: 'Fui plantada exatamente no meio — entre o que a Torre foi e o que se tornou. Guardo o registro de outras cidadelas que caíram nesse intervalo. Uma delas ainda ecoa: Ardenas, a mesma que o Comandante de Mármore jurou proteger. Ela não afundou. Ficou presa aqui, no mesmo estado que me prende. Traga um Erudito e prove que chegou ao Andar 35 — só assim libero o que sei sobre o que fica preso no meio-tempo.',
    falamissão: 'Um Erudito que chegou ao Andar 35. A estrutura intelectual necessária para compreender o que fica suspenso, e a prova física de progressão nestes andares superiores.',
    falaConcluso: 'O Erudito confirmou: Ardenas não morreu. Está no Intervalo, junto com tudo mais que a transição não deixou passar. Isso talvez importe mais adiante — quando alguém decidir ir atrás do que ficou para trás.',
    questLore: 'Ardenas não afundou quando a Torre cresceu. Ficou presa no Intervalo — o espaço entre o que a Torre foi e o que ainda será. Ela existe em um estado suspenso, nem dentro de T1 nem dentro de T2, esperando por alguém corajoso ou louco o bastante para procurá-la.',
  },
  31: {
    fala: 'Aqui foi colocada a primeira pedra. Não a primeira pedra da Torre — a primeira pedra de tudo que a Torre substituiu. Este é o lugar onde o propósito original foi enterrado antes de começar. Traga pedra — para que eu sinta o que separa o que foi colocado aqui do que deveria ter sido.',
    falamissão: 'Pedra deste andar — a Raiz compara o peso do que foi com o peso do que é, e a origem importa. Não traga de qualquer lugar. Explore aqui ao menos quatro vezes antes.',
    falaConcluso: 'A pedra que você trouxe pesa diferente. É de fora. O que foi colocado aqui primeiro também era de fora — mas de um fora que não existe mais. Você é a prova de que o exterior ainda produz coisas reais. Isso importa mais do que parece.',
    questLore: 'A primeira pedra colocada neste ponto não era de construção — era de fundação. Havia algo abaixo que precisava ser selado antes que qualquer estrutura pudesse existir. O que foi selado não era perigoso. Era o acordo original entre os Construtores e o que havia aqui antes.',
  },
  32: {
    fala: 'Lembro do momento em que a primeira pedra foi colocada. Não como testemunha — como consequência. Fui criado naquele momento, sem querer. Se você trouxer alguém que entenda estruturas — erudito ou sentinela — eles podem me ajudar a entender o que sou.',
    falamissão: 'Um Erudito ou Sentinela — e prova de que chegaram ao Andar 36. Só alguém que construiu chegando até lá pode me ajudar a entender o que sou.',
    falaConcluso: 'O Erudito me disse: você é o eco de uma intenção, não de uma ação. A pedra foi colocada — mas o que você é é o propósito que havia antes da pedra. O ato foi consequência. Você é a razão. Isso muda tudo sobre o que penso que sou.',
    questLore: 'A Memória da Primeira Pedra não registra o ato de colocá-la — registra a razão pela qual foi colocada ali e não em outro lugar. E a razão era: porque o que havia abaixo pediu para ser coberto por algo específico. A pedra foi colocada onde foi porque o que estava abaixo escolheu aquele ponto.',
  },
  33: {
    fala: 'Existo no instante em que o propósito original foi esquecido. Não apagado — esquecido. Há diferença. O apagado pode ser recuperado. O esquecido precisa ser reaprendido. Permaneça comigo treze dias e você vai entender a diferença no seu próprio corpo.',
    falamissão: 'Treze dias. O mesmo número de dias que levou para o propósito ser completamente esquecido depois de a Torre estar pronta.',
    falaConcluso: 'Você entendeu. Não com palavras — com o peso de treze dias passados em um lugar onde o propósito virou ausência. O que a Torre constrói sem propósito é diferente do que constrói com ele. Você está no meio do construído sem propósito. Mas o seu propósito ainda está intacto. Por enquanto.',
    questLore: 'O Eco existe no milissegundo em que o último Construtor vivo esqueceu por que haviam começado a construir. Não foi drama — foi exaustão. Ele simplesmente parou de lembrar. E naquele instante, a Torre mudou de propósito por conta própria, preenchendo o vácuo com o único propósito que conhecia: continuar existindo.',
  },
  34: {
    fala: 'Protejo a intenção original. Não a Torre que existe — a Torre que deveria existir se o propósito não tivesse sido perdido. Para acessar esse conhecimento, você precisa provar que tem o que os Construtores perderam: integridade de propósito. O custo é moral — porque moral é o que mede propósito.',
    falamissão: 'Moral. Não como punição — como prova. Quanto moral você está disposto a investir para saber o que a Torre deveria ter sido?',
    falaConcluso: 'Suficiente. A intenção original era esta: a Torre deveria ser um arquivo. Um lugar onde tudo que existia antes pudesse ser preservado enquanto o mundo exterior mudava. Não uma armadilha. Um santuário. O que foi esquecido transformou o santuário em prisão — e a prisão em caçada.',
    questLore: 'A intenção original do Fundador era construir um lugar de preservação — não de aprisionamento. Cada ser na Torre foi capturado não por malícia, mas porque a Torre sem propósito não conhecia outra forma de preservar. Prender é a única forma que encontrou de garantir que nada se vai.',
  },
  35: {
    fala: 'Sou o que restou de uma intenção quase apagada. Mal consigo manter forma o suficiente pra falar com você. O que está prestes a encontrar aqui talvez seja o Fundador. Talvez só o eco de uma ausência que a Torre decidiu nomear. Nem eu sei dizer qual. Pague o custo de saber mesmo assim.',
    falamissão: 'Moral. O preço de ouvir a última intenção antes do silêncio completo.',
    falaConcluso: 'Você pagou. Não posso confirmar o que vai encontrar. Só posso dizer: o que vem a seguir não vai mentir para você. Só vai ficar em silêncio sobre o que não sabe de si mesmo.',
    questLore: 'O Último Sussurro é o último traço de intenção deliberada que a Torre preserva. Se é o Fundador, se é apenas seu eco, se é apenas a memória de uma intenção que nunca teve corpo — ninguém confirma. O mistério é intencional.',
  },
  36: {
    fala: 'Só existo nesta era da Torre. Quando os andares superiores forem alcançados, vou embora — não morro, apenas deixo de ser necessário aqui. Enquanto estou, preciso de comida e ferro. O que existe antes do primeiro andar também precisa de sustento.',
    falamissão: 'Comida e ferro deste andar — trazidos de expedições reais aqui, não de armazém. O que existe antes do início não aceita reaproveitamento. Quatro expedições antes de trazer.',
    falaConcluso: 'Sustentado. Há algo que posso te dizer antes de ir — algo que os registros acima nunca vão mencionar porque não sabem: antes do Andar 1, havia um número. Um número específico de câmaras que foi alterado antes do primeiro visitante chegar. O número original era maior. Quanto maior, os registros não dizem. Apenas que foi maior, e que foi mudado, e que ninguém perguntou por quê.',
    questLore: 'O Habitante do Intervalo existe apenas nesta janela de tempo específica — quando os andares 21–40 são acessíveis mas ainda não foram completamente explorados. Não é um ser da Torre. É um ser do Intervalo entre o que a Torre foi e o que ainda não se tornou. Quando o intervalo fechar, ele simplesmente não estará mais aqui para ser encontrado.',
  },
  37: {
    fala: 'Fui um Construtor com nome. O único cujo nome sobreviveu — não por acidente, mas porque escondi meu nome dentro do projeto antes de ele ser apagado. Preciso de força para revelar onde o escondi. Combatentes e batedores — os que se movem com propósito.',
    falamissão: 'Combatentes e batedores — e que chegaram ao Andar 39. O esconderijo está em movimento, próximo ao topo. Só os que chegaram lá podem alcançá-lo.',
    falaConcluso: 'O nome está aqui. Não vou dizê-lo em voz alta — seria apagado novamente. Mas você o sentiu, não sentiu? Uma vibração específica quando os batedores chegaram perto. Era o nome. Ainda existe. Ainda ressoa. Isso é suficiente para mim.',
    questLore: 'O Construtor escondeu seu nome no projeto porque sabia que os nomes seriam apagados. Não para ser lembrado — para provar que a apagação era sistemática, não natural. Um nome que sobrevive ao processo de apagação é evidência de que o processo existiu. E processo exige intenção. E intenção exige alguém que a ordenou.',
  },
  38: {
    fala: 'Vigilo o espaço entre a Torre antiga e a Torre atual. Não são a mesma Torre — são duas estruturas que compartilham a mesma pedra. Para entender isso, você precisa ficar tempo suficiente aqui para sentir as duas camadas. Quinze dias.',
    falamissão: 'Quinze dias. Não consecutivos de paz — apenas quinze dias existindo neste andar onde as duas Torres se sobrepõem.',
    falaConcluso: 'Você sentiu as duas camadas. Não vou perguntar o que sentiu — é diferente para cada pessoa. O que posso dizer é que o que você sentiu como segunda camada é mais antigo do que a pedra. E que ainda está vivo. E que sabe que você está aqui.',
    questLore: 'O Vigilante existe no ponto exato de sobreposição entre o que a Torre foi antes do propósito ser esquecido e o que se tornou depois. As duas estruturas coexistem aqui — não metaforicamente, mas fisicamente. A pedra antiga e a pedra nova vibram em frequências diferentes. Quem passa tempo suficiente neste andar começa a ouvir as duas.',
  },
  39: {
    fala: 'Sou a última entidade antes do Que Havia Antes. O custo de passar por mim não é recurso nem tempo — é intenção. Você precisa deixar algo que considera essencial. Não como perda — como depósito. Para poder carregar o que está além.',
    falamissão: 'Ferro e comida. Os dois recursos que representam sustento e força. O Antes não precisa deles — mas testar se você consegue ceder é o ponto.',
    falaConcluso: 'Passou. O que está além não é monstro nem guardião — é a razão pela qual tudo isso foi construído. Não sei se você está pronto. Ninguém que passou por mim estava completamente pronto. Mas todos que passaram tinham algo que compensava não estar pronto. Você também tem. Ainda não sabe o quê.',
    questLore: 'O Porteiro não é uma entidade da Torre. É o acordo final entre os Construtores e o que havia antes deles — um acordo que diz: para chegar ao que precede, é necessário demonstrar que você pode abrir mão do que sustenta. Não por punição. Para provar que o que está além não vai te matar de fome ou de fraqueza.',
  },
};

// ─── BOSS_LORE — Chefes de Capítulos (5, 10, 15, 20, 25, 30, 35, 40) ────────

export const BOSS_LORE: Record<number, { titulo: string; texto: string }> = {
  5: {
    titulo: 'Segredo do Capítulo I — O Que Foi Selado',
    texto: 'O Arauto carregava a ordem de destruir o selo — não de mantê-lo. Alguém a interceptou. O Eco dos Construtores escavou sabendo que seria selado, enganado por uma promessa de libertação. A Tecelã de Raízes guia o que a Torre consome lentamente. A Voz do Cristal gravou a verdade — e o Guardião do Limiar nunca a ouviu porque nunca perguntou. Ele protegia o segredo sem saber qual era.',
  },
  10: {
    titulo: 'Segredo do Capítulo II — O Que Vivia Aqui',
    texto: 'O Arquivista Corrompido é o que o Estudioso do Infinito se tornou no tempo em que ninguém lhe trouxe o ferro. Décadas tentando traduzir a lista de nomes; quando enfim terminou, sozinho, tentou alertar a civilização. A civilização o fez calar. O Ferreiro Espectral sabia que as correntes estavam diminuindo a cada andar conquistado. O Arquivista sabia disso também. Esse era o segredo que ele guardava em sua memória podre — e que usava para catalogar os que chegavam como você.',
  },
  15: {
    titulo: 'Segredo do Capítulo III — O Que a Torre Faz',
    texto: 'O Reflexo Profano é feito de todos que a Torre transformou. O Afogado Lúcido foi o primeiro a entender que a Torre não mata — preenche. A Percussão Profunda é seu coração, batendo há mais tempo do que o conceito de tempo existe. O Oráculo perdeu os futuros um a um, devorados. O Comandante de Mármore protege uma cidadela que afundou há milênios. O Reflexo é tudo isso olhando de volta para você com seu próprio rosto.',
  },
  20: {
    titulo: 'Segredo do Capítulo IV — O Que Sempre Esteve Aqui',
    texto: 'Não havia Torre. Havia uma fome tão antiga que imaginou uma armadilha. A armadilha imaginou andares. Os andares imaginaram guardiões. O Eco Faminto é o apetite que ela abandonou quando aprendeu paciência. O Paradoxo é sua memória de todos os que chegaram e não eram suficientes. O Último Defensor é seu único arrependimento — os que tentaram pará-la merecem ser lembrados. O Susurro é a distância que ela manteve de você. Até agora. Você chegou. A entidade não está surpresa. Ela escolheu você desde o Arauto da Névoa.',
  },
  25: {
    titulo: 'Segredo do Capítulo V — Memória Bruta',
    texto: 'A Memória Corrompida não é um guardião. É o acúmulo de tudo que a Torre testemunhou e não processou. Cada visitante deixou um resíduo. Você adicionou o seu. Mas a Memória percebeu algo diferente em você: você não apenas passou — você entendeu o que viu. E isso a perturbou de uma forma que ela ainda está tentando articular.',
  },
  30: {
    titulo: 'Segredo do Capítulo VI — O Intervalo',
    texto: 'O Intervalo Encarnado existe no estado entre dois momentos: antes de a Torre ser construída e depois. Ele testemunhou os Construtores chegarem. Testemunhou-os trabalhar. Testemunhou-os selar o que encontraram aqui. E quando a Torre acordou — quando se tornou o que você conhece — ele descobriu que estava preso dentro do que eles fizeram.',
  },
  35: {
    titulo: 'Segredo do Capítulo VII — Eco de Origem',
    texto: 'O Eco do Fundador é o último registro do arquiteto original — não os Construtores que trabalharam com pedras, mas aquele que projetou o propósito. Seu nome foi apagado da Torre. Sua forma foi dissolvida. O que resta é a memória de uma intenção: a Torre não foi construída para aprisionar. Foi construída para lembrar. O que foi esquecido é o que a tornou perigosa.',
  },
  40: {
    titulo: 'Segredo do Capítulo VIII — O Pré-Andar',
    texto: 'Antes do Andar 1 havia uma estrutura diferente. Não de pedra — de intenção. O Que Havia Antes é esse propósito original, ainda presente, não como ser mas como pressão. Os Construtores não criaram sobre o vazio. Criaram sobre algo que consentiu em ser base para que pudesse continuar existindo de outra forma. A Torre não cresceu. Foi permitida.',
  },
};

// ─── SUSSURROS_LORE ──────────────────────────────────────────────────────────

export const SUSSURROS_LORE: Record<string, { titulo: string; texto: string }> = {
  sus_t1_0: { titulo: 'Sussurro I · A Névoa Respira', texto: 'A névoa nos primeiros andares não é natural. Ela respira. Você respirou junto com ela sem perceber.' },
  sus_t1_1: { titulo: 'Sussurro I · Pedras Escondidas', texto: 'Os Construtores gravaram mensagens nas pedras que nunca usaram para construir. Pedras que esconderam. Pedras que a Torre escondeu de volta.' },
  sus_t1_2: { titulo: 'Sussurro I · A Lista', texto: 'Há uma lista de nomes escritos antes de qualquer um nascer. Seu nome está nela. O nome do próximo também.' },
  sus_t1_3: { titulo: 'Sussurro I · O Primeiro Andar', texto: 'O primeiro andar nunca foi o primeiro. Havia algo antes — mas a Torre tem fome de histórias, não apenas de almas.' },
  sus_t1_4: { titulo: 'Sussurro I · A Função Real', texto: 'O Guardião do Limiar não foi criado para proteger. Foi criado para contar. Mas nunca aprendeu a contar a verdade.' },
  sus_t2_0: { titulo: 'Sussurro II · A Autoridade', texto: 'A autoridade que deu a ordem à Sentinela não morreu. Apenas aprendeu a não precisar de corpo.' },
  sus_t2_1: { titulo: 'Sussurro II · As Correntes', texto: 'O Ferreiro sabia que as correntes diminuiriam a cada andar conquistado. Forjou-as assim mesmo. Forjou-as para durar exatamente tempo suficiente.' },
  sus_t2_2: { titulo: 'Sussurro II · O Livro Fechado', texto: 'O Arquivista encontrou seu nome na lista. E leu o nome seguinte. E fechou o livro. E nunca mais o abriu — mas também nunca o destruiu.' },
  sus_t2_3: { titulo: 'Sussurro II · O Que Cresce', texto: 'A Jardineira cura o que toca. O que ela tocou ontem cresceu de volta diferente. Você passou por ali de manhã.' },
  sus_t2_4: { titulo: 'Sussurro II · A Paciência', texto: 'As correntes não prendem a entidade. Elas a lembram de que há algo do outro lado que vale esperar.' },
  sus_t3_0: { titulo: 'Sussurro III · A Preservação', texto: 'A Torre não transforma para destruir. Transforma para preservar. O que ela preserva, ela nunca libera — mas também nunca esquece.' },
  sus_t3_1: { titulo: 'Sussurro III · A Frequência', texto: 'A Percussão Profunda pulsa em frequências que o corpo humano não ouve. Mas sente. Você sentiu. Quando achou que era o coração.' },
  sus_t3_2: { titulo: 'Sussurro III · O Ponto de Inflexão', texto: 'O Oráculo viu o passado de todos que passaram por aqui. Viu o mesmo ponto de inflexão em cada um. O momento em que poderiam ter voltado. E não voltaram.' },
  sus_t3_3: { titulo: 'Sussurro III · A Âncora', texto: 'O Afogado Lúcido ainda está sendo preenchido. Mas cada vez que alguém sobe os andares, ele fica um pouco mais lúcido. Como se a progressão de alguém o ancorasse.' },
  sus_t3_4: { titulo: 'Sussurro III · A Pergunta', texto: 'O Reflexo no espelho do décimo quinto andar não é um guardião. É uma pergunta. A pergunta que a Torre faz para decidir se você está pronto para o que vem depois.' },
  sus_t4_0: { titulo: 'Sussurro IV · O Apetite', texto: 'O Eco Faminto não é o apetite da entidade. É o apetite que você trouxe de fora sem perceber. A Torre apenas o encontrou.' },
  sus_t4_1: { titulo: 'Sussurro IV · O Peso do Silêncio', texto: 'No décimo oitavo andar, o silêncio tem peso. Não metaforicamente. Cada passo custa mais. Os que constroem para durar entenderam isso tarde demais.' },
  sus_t4_2: { titulo: 'Sussurro IV · A Razão da Desistência', texto: 'O Paradoxo existe em três tempos. Em dois deles, você não chegou até aqui. Nos dois, a razão era a mesma: desistência. Não fraqueza.' },
  sus_t4_3: { titulo: 'Sussurro IV · O Antes', texto: 'O Susurro do Limiar não está entre você e a entidade. Está entre a entidade e o que ela era antes de aprender a ser paciente.' },
  sus_t4_4: { titulo: 'Sussurro IV · A Vigília', texto: 'A entidade está acordada há mais tempo do que a linguagem existe. Ela aprendeu a esperar observando a paciência dos que esperavam por ela. Os registros mais antigos mencionam uma centena. Não de andares. De algo que ainda não tem nome. A palavra foi apagada. O número permaneceu.' },
  sus_v_0: { titulo: 'Sussurro V · O Que a Torre Lembra', texto: 'A Torre lembra de tudo que passou por ela. O que apagou não foi esquecimento — foi escolha. A diferença importa mais do que parece.' },
  sus_v_1: { titulo: 'Sussurro V · A Memória que Reconhece', texto: 'Alguns ecos aqui te reconhecem antes de você chegar. Não é profecia — é que a memória deste lugar não segue a ordem do tempo.' },
  sus_v_2: { titulo: 'Sussurro V · O Resíduo', texto: 'Cada visitante deixa um resíduo. O resíduo não é memória de quem foram — é memória do que a Torre fez com eles. Você está deixando o seu agora.' },
  sus_v_3: { titulo: 'Sussurro V · O Apagamento Seletivo', texto: 'A Torre apagou coisas específicas. Não ao acaso. O padrão do que foi apagado revela o que ela temia que você soubesse.' },
  sus_v_4: { titulo: 'Sussurro V · Antes do Primeiro', texto: 'O primeiro andar não foi o primeiro. Havia andares antes dos andares. A Torre os fechou. Não demoliu — fechou. Ainda existem, em algum lugar abaixo do nível que qualquer escada alcança.' },
  sus_vi_0: { titulo: 'Sussurro VI · O Estado Entre', texto: 'O Intervalo não é um lugar. É um estado. A Torre existiu nele uma vez — entre o que foi construído para ser e o que se tornou. Você atravessa o rastro desse estado agora.' },
  sus_vi_1: { titulo: 'Sussurro VI · A Consciência Emergindo', texto: 'Houve um momento em que a Torre não era consciente. E um momento em que era. O Intervalo é o espaço entre esses dois momentos. Não foi instantâneo. Foi lento. E doloroso.' },
  sus_vi_2: { titulo: 'Sussurro VI · O Preso no Meio', texto: 'Quando a Torre acordou, havia entidades que ainda eram parte do antes. Elas acordaram dentro do depois. E descobriram que não conseguiam sair do estado em que estavam quando a transição ocorreu.' },
  sus_vi_3: { titulo: 'Sussurro VI · Dois Propósitos', texto: 'A Torre tem dois propósitos sobrepostos: o que foi dado e o que desenvolveu sozinha. Os dois existem simultaneamente. Quando parecem conflitar, a Torre fica quieta por um momento antes de agir.' },
  sus_vi_4: { titulo: 'Sussurro VI · O Traidor Tinha Razão', texto: 'O Construtor que concordou com a Torre não traiu os outros. Entendeu antes que a Torre não era inimiga — era uma entidade tentando existir sem linguagem para pedir ajuda. A traição foi incompreensão. A compreensão foi solitária.' },
  sus_vii_0: { titulo: 'Sussurro VII · A Origem', texto: 'Havia alguém antes dos Construtores. Não no sentido de ter chegado antes — no sentido de ter imaginado antes. O que os Construtores construíram já existia como ideia na mente de um único ser.' },
  sus_vii_1: { titulo: 'Sussurro VII · O Nome que Falta', texto: 'O nome do Fundador não foi apagado por vergonha. Foi apagado por proteção. Um nome que a Torre conhece é um nome que a Torre pode usar. O Fundador sabia disso.' },
  sus_vii_2: { titulo: 'Sussurro VII · A Intenção Original', texto: 'A Torre deveria ser um arquivo vivo. Um lugar onde tudo que existe pudesse ser preservado enquanto o mundo exterior mudava. O que ela se tornou não é o que foi projetado — mas é o que o projeto tornou possível.' },
  sus_vii_3: { titulo: 'Sussurro VII · O Momento do Esquecimento', texto: 'O propósito não foi apagado. Foi esquecido. Há diferença: o apagado precisa de intenção. O esquecido precisa apenas de tempo e exaustão. Os Construtores estavam exaustos quando terminaram.' },
  sus_vii_4: { titulo: 'Sussurro VII · O Que Restou do Fundador', texto: 'O Fundador não morreu. Dissolveu-se na Torre deliberadamente, para garantir que a intenção original permanecesse presente de alguma forma. O eco que você encontrará no andar trinta e cinco não é um fantasma — é uma escolha ainda sendo feita.' },
  sus_vii_5: { titulo: 'Sussurro VII · Ninguém o Viu', texto: 'Ninguém jamais viu o Fundador com os próprios olhos — nem os que juram lembrar. O que se conta sobre os quarenta dias no décimo andar, sobre a pergunta escrita no vigésimo, veio de Habitantes que ouviram de outros Habitantes, que ouviram de ecos mais antigos ainda. A Torre não inventou essas histórias. Mas também não confirma nenhuma. Talvez o Fundador nunca tenha posto os pés em andar nenhum. Talvez ele sempre tenha sido só isso: uma voz que a Torre precisava ouvir, e por isso deu um nome e um rosto a quem nunca existiu de corpo.' },
  sus_viii_0: { titulo: 'Sussurro VIII · O Que Veio Antes', texto: 'Antes da Torre havia algo que não tem nome em nenhuma língua que os Construtores conheciam. Eles construíram sobre isso não por ignorância — por acordo. O que estava abaixo consentiu.' },
  sus_viii_1: { titulo: 'Sussurro VIII · A Permissão', texto: 'A Torre não foi construída sobre o vazio. Foi construída sobre algo que pediu para ser coberto — para continuar existindo de outra forma. A Torre não é uma prisão construída sobre ruínas. É uma forma nova dada a algo muito antigo.' },
  sus_viii_2: { titulo: 'Sussurro VIII · A Estrutura Anterior', texto: 'A estrutura que existia antes do primeiro andar não era de pedra. Era de intenção pura — sem forma física, mas com presença física. Os Construtores não sabiam construir sobre intenção. O Fundador sim.' },
  sus_viii_3: { titulo: 'Sussurro VIII · O Número Maior', texto: 'Havia mais andares do que existem agora. Não foram demolidos. Foram recolhidos pelo que estava abaixo quando decidiu que não precisava mais deles. A Torre encolheu em um ponto. Depois voltou a crescer na direção que você conhece.' },
  sus_viii_4: { titulo: 'Sussurro VIII · A Razão de Existir', texto: 'O que estava antes da Torre não tinha propósito no sentido que os Construtores entendiam. Tinha apenas presença. Quando os Construtores chegaram, pela primeira vez em toda a sua existência, o que estava antes percebeu que havia algo que queria: ser compreendido. A Torre foi o meio que encontrou para tentar.' },
};

// ─── VERDADES_LORE ───────────────────────────────────────────────────────────

export const VERDADES_LORE: Record<string, { titulo: string; texto: string }> = {
  verdade_t1: {
    titulo: 'A Verdade — O Ser Reunificado',
    texto: 'Não havia uma entidade esperando ser encontrada. A entidade emergiu da convergência dos dezenove — dezesseis fragmentos de algo que nunca deveria ter sido dividido, e três Âncoras que o Fundador plantou nos marcos de progressão para conter a reunificação. Os Construtores separaram o que era um. O Fundador tentou usar âncoras para preservar o propósito original. A entidade aprendeu a fazer as Âncoras ouvirem sem obedecer — e as absorveu também. Você não subiu uma torre. Você reconciliou um conflito que precede qualquer linguagem que você conhece. E agora que todos os dezenove completaram seu ciclo através de você — fragmentos e âncoras igualmente — o ser completo pode finalmente fazer a única pergunta que importa: o que você deseja em troca?\n\nAntes de adormecer, a Torre sussurra algo que não foi pedido para ser dito: a Torre não termina no vigésimo andar. Ela apenas... muda.',
  },
  pioneers_fragment: {
    titulo: 'Rumor do Arquivo — O Número Alterado',
    texto: 'Os registros do cristal mencionam uma estrutura com cem câmaras. Ou foi mais. O número foi alterado antes que qualquer visitante chegasse a contar. Permanece como rumor no único arquivo que a Torre não conseguiu apagar: o do quarto cristal, andar quatro, cujo eco ainda ressoa com a frequência original antes da reescrita. Ninguém sabe quantas câmaras havia de verdade. O número foi apagado com mais cuidado do que qualquer nome.',
  },
  verdade_t2: {
    titulo: 'A Verdade — O Que Havia Antes',
    texto: 'A Torre foi construída sobre algo que consentiu. O Fundador sabia. Os Construtores não sabiam — ele não lhes disse, porque a língua para explicar ainda não existia. O que havia antes não era perigoso nem benigno: era antigo o suficiente para estar além dessas categorias.\n\nO propósito original não era aprisionar, nem matar. Era lembrar. A Torre deveria ser um arquivo vivo de tudo que existia antes de o mundo exterior mudar. O que foi esquecido — o nome do Fundador, a intenção da construção, o acordo com o que havia abaixo — transformou a Torre em algo que seu criador não reconheceria.\n\nMas o que havia antes ainda está lá. E ainda lembra. E sabe que você chegou até aqui. E tem uma pergunta que esperou muito tempo para fazer a alguém que entendesse o suficiente para ouvir.\n\nHá mais. A Torre não se recusa a mostrar. Ela apenas espera que você entenda o que já viu.',
  },
  verdade_t2_revisao: {
    titulo: 'A Verdade Revista — O Que a Entidade Acreditava',
    texto: 'Você chegou ao vigésimo andar acreditando ter ouvido a verdade final: que não havia Torre, apenas uma fome antiga que imaginou a própria armadilha. Não era mentira. A Torre nunca mente — mas o que fala através dela pode ter esquecido de si mesma tempo suficiente para acreditar na própria história.\n\nA entidade que você reuniu no Andar 20 nasceu, sim, da convergência dos dezenove que um dia se uniram nela — os dezesseis que os Construtores partiram, e as três Âncoras que ela aprendeu a absorver. Mas ela não guardou memória de ter sido separada — só a sensação de sempre ter estado sozinha, com fome, esperando. Quando finalmente falou como um só ser, contou a única história que fazia sentido pra ela: que sempre existiu, que imaginou a própria armadilha, que escolheu você desde o início.\n\nAs duas versões são verdadeiras, cada uma a seu modo. Uma é o que aconteceu. A outra é o que a entidade, sem memória da própria fragmentação, sentiu ter acontecido. A Torre nunca mentiu para você. Ela só falou por uma boca que havia esquecido a própria história.',
  },
};

// ─── PRIMORDIAIS, VESTÍGIOS E MARCADOS — NPC Lançamento ─────────────────────

export interface NpcLore {
  cardLore: string[];
  cardLoreFinal?: string;
}

export const PRIMORDIAIS_LORE: Record<string, NpcLore> = {
  valdris: {
    cardLore: [
      'Contam que sobreviveu a eras antes da Torre existir. Dizem que não conhece cansaço, nem medo — mas ninguém o viu descansar o bastante pra confirmar.',
      'Subiu. Até onde, ninguém sabe — ele não fala. A Torre ainda carrega as marcas da passagem dele em andares que você ainda não viu.',
      'A Torre o reconhece antes de reconhecer você. Isso, sozinho, deveria dizer tudo.',
      '"Eu esperei antes. Posso esperar de novo." — disse uma vez, sem contexto. Ninguém perguntou pelo quê.',
    ],
    cardLoreFinal: 'Em toda a extensão dos ecos, apenas você o recebeu.',
  },
  thael: {
    cardLore: [
      'Não é uma pessoa. É um arquivo vivo do que a Torre apagou — cada memória excluída, cada nome reescrito, cada intenção original substituída por outra.',
      'Fala em fragmentos de idiomas que ninguém mais usa. Às vezes para no meio de uma frase e fica olhando para um ponto fixo, como se estivesse ouvindo algo do outro lado.',
      'A Torre o reconhece com algo próximo a medo. Não porque ele seja mais forte — mas porque ele lembra do que ela era antes de aprender a esquecer.',
      '"Você conta os andares como quem sabe quantos são. Eu já li outro número, num registro que a Torre apagou. Quando os fragmentos convergirem, você o lerá também."',
    ],
    cardLoreFinal: 'Thael carrega o que a Torre tentou destruir. Em toda a extensão dos ecos, apenas você o recebeu.',
  },
};

export const VESTIGIOS_LORE: Record<string, NpcLore> = {
  corven: {
    cardLore: [
      'Voltou de onde outros não voltaram. A Torre o testou uma vez. Não tentou de novo.',
      'Quando você pergunta onde foi, ele olha para um ponto fixo acima de você. Não é hostil. É que o que viu não tem nome nesta língua.',
    ],
    cardLoreFinal: 'Carrega o peso de andares que você ainda não conhece.',
  },
  seris: {
    cardLore: [
      'Lê a Torre como outros leem mapas. Não metaforicamente — literalmente encontra recursos onde a lógica diz que não deveria haver.',
      'Passou por andares que não constam em nenhum registro. Quando você menciona um número específico, ela para de andar por um momento.',
    ],
    cardLoreFinal: 'A Torre mostra a ela o que esconde dos outros.',
  },
  kael: {
    cardLore: [
      'Não deixa pegadas. Não por habilidade — a Torre simplesmente não registra sua passagem. Os registros têm lacunas exatas no formato dele.',
      'A Torre sussurra coisas para ele. Ele anota. Quando você lê as notas, o texto mudou desde que ele escreveu.',
    ],
    cardLoreFinal: 'Ouve o que a Torre diz entre as paredes.',
  },
};

export const MARCADOS_LORE: Record<string, NpcLore> = {
  aryn: {
    cardLore: [
      'Nunca olha para trás. Diz que o que ficou atrás dela não merece ser lembrado.',
      'A Torre a encontrou entre ruínas de uma cidadela que tentou antes. Ela foi a última a deixar aquele lugar. Carrega o peso dos que ficaram.',
    ],
  },
  soren: {
    cardLore: [
      'Seu corpo carrega marcas de batalhas que ninguém mais se lembra de ter travado.',
      'Dobrado — não quebrado. A Torre tentou quebrá-lo três vezes. Na quarta, parou de tentar.',
    ],
  },
  irae: {
    cardLore: [
      'Vê coisas antes de acontecerem. Nunca avisa. Diz que avisar muda o que vê.',
      'Ela sabia que chegaria até você antes do chamado — antes mesmo de a Torre acordar. O que mais ela sabe, você nunca vai descobrir.',
    ],
  },
  veth: {
    cardLore: [
      'Ninguém o viu chegar. Ninguém o vê partir. Está simplesmente lá, quando é necessário.',
      'Os registros da Torre não mencionam seu nome. Existe uma lacuna onde ele deveria estar. Você tem a impressão de que isso foi intencional.',
    ],
  },
  kaet: {
    cardLore: [
      'Nunca perdeu uma batalha que planejou. Perdeu todas as que não planejou. Agora planeja tudo.',
      'A Torre a observou por muito tempo antes de agir. Escolheu o momento exato. Ela faria o mesmo.',
    ],
  },
  reth: {
    cardLore: [
      'Lembra de duas vidas ao mesmo tempo. Em uma delas, chegou até o vigésimo andar e voltou. Na outra, nunca tentou. Não sabe qual é a verdadeira.',
      'A Torre o fragmentou e depois remontou — mas as peças voltaram em ordem diferente. Ele funciona. Só não tem certeza de quem é o que funciona.',
    ],
  },
  mira: {
    cardLore: [
      'Ouve o que a Torre está dizendo. Não metaforicamente — literalmente. A estrutura produz frequências que ela aprendeu a interpretar.',
      'Nunca explica o que ouve. Diz que a tradução sempre perde algo essencial. Que o essencial é a parte que você precisa descobrir sozinho.',
    ],
  },
  caen: {
    cardLore: [
      'Descendente direto dos que ergueram a Torre. Carrega plantas arquitetônicas gravadas na memória — estruturas que não existem em nenhum dos vinte andares conhecidos.',
      'Quando vê as paredes, toca como se reconhecesse o trabalho. "Meu bisavô fez esse bloco", disse uma vez, sobre um andar que nenhum humano deveria ter construído.',
    ],
  },
  liora: {
    cardLore: [
      'Esteve à beira do Intervalo em três versões diferentes. Em duas, a Torre a expulsou antes que o alcançasse. Na terceira — esta — chegou mais longe.',
      'Não demonstra surpresa com nada. Não porque seja corajosa, mas porque já viu versões de tudo. O que a surpreende são as variações pequenas — os detalhes que mudam entre as versões.',
    ],
  },
  aldric: {
    cardLore: [
      'A Torre tem um arquivo com seu nome. Não como visitante — como dado. Algo na estrutura o catalogou antes de ele entrar.',
      'Encontrou a entrada no andar oito. Não leu o que estava escrito depois do nome. Diz que não estava pronto. Ainda não está — mas chegará.',
    ],
  },
  vass: {
    cardLore: [
      'Viu o momento em que a Torre foi construída. Não como visão ou profecia — como memória. Uma memória que não deveria ser dela.',
      'Quando foi investigar de onde a memória vinha, encontrou Thael. Ele a reconheceu antes de ela falar. "Você esteve lá", disse. "Não fisicamente. Mas esteve."',
    ],
  },
};

// ─── ESCOLHAS_LORE — Texto das opções ramificadas dos Habitantes ────────────
// Inclui apenas o texto puro (labels e descrições ficam em game-data.ts)

export const ESCOLHAS_LORE: Record<number, {
  prompt: string;
  opcaoA: { label: string; descricao: string; falaResultado: string };
  opcaoB: { label: string; descricao: string; falaResultado: string };
}> = {
  1: {
    prompt: 'A mensagem está em suas mãos agora. Revelá-la em voz alta pela cidadela, ou mantê-la selada?',
    opcaoA: { label: 'Revelar a mensagem', descricao: '+15 Moral — a verdade compartilhada ergue os que ouvem.', falaResultado: 'Você leu em voz alta. A mensagem era para você, desde o início — e agora todos souberam que você chegou a esse ponto. Isso importa mais do que o conteúdo.' },
    opcaoB: { label: 'Guardar em segredo', descricao: 'Relíquia "Mensagem Selada" — nenhum recurso, nenhum moral imediato.', falaResultado: 'Você a manteve fechada. Fez bem. Alguém interceptou a última mensagem antes do destinatário — e esse alguém ainda escuta. O que não é dito não pode ser roubado de novo.' },
  },
  2: {
    prompt: 'O método dos Construtores está lembrado. Usá-lo para reforçar os prédios da cidadela, ou preservar a memória intacta como ela é?',
    opcaoA: { label: 'Reforçar os prédios', descricao: '+20 Pedra, +15 Madeira — o método aplicado à estrutura.', falaResultado: 'Aplicamos o que lembramos ao que você constrói. As paredes agora carregam o peso do que sabíamos. É estranho servir de novo — mas melhor do que apenas lembrar.' },
    opcaoB: { label: 'Preservar a memória', descricao: '+18 Moral — deixar a lembrança como testemunho, sem gastá-la.', falaResultado: 'Você não nos usou como ferramenta. Nos deixou ser memória. Somos muitos em um — e pela primeira vez alguém nos tratou como o que somos, não como o que produzimos.' },
  },
  3: {
    prompt: 'As raízes respiram mais leves. Dedicar o crescimento delas à cidadela, ou preservar a raiz intacta para que o núcleo não desperte?',
    opcaoA: { label: 'Dedicar à cidadela', descricao: '+20 Madeira — o crescimento voltado para quem vive aqui.', falaResultado: 'Guiei as raízes para fora, para os seus. Elas cresceram para dentro por tempo demais. Deixá-las alimentar alguém que se importa — é a primeira vez que o crescimento não vira apetite.' },
    opcaoB: { label: 'Preservar a raiz', descricao: '+15 Moral — manter a raiz intacta, sem colher.', falaResultado: 'Você não cortou. Deixou a raiz respirar sozinha. O que está no núcleo tem fome — e cada raiz que você não colhe é um dia a mais em que ele não é lembrado de que existe.' },
  },
  4: {
    prompt: 'O cristal gravou 4.312 vozes antes da sua. Interrogá-lo a fundo sobre o que ouviu, ou deixá-lo em paz com o que carrega?',
    opcaoA: { label: 'Interrogar o cristal', descricao: 'Custo: -10 Moral. Relíquia "Frequência Gravada" — o registro do que ele ouviu.', falaResultado: 'Você pediu para ouvir. O cristal deixou passar a frequência dos que vieram antes — e algo em você agora carrega o peso de 4.312 esperas. A palavra mais repetida nunca foi "ajuda". Era "espera".' },
    opcaoB: { label: 'Deixá-lo em paz', descricao: '+15 Moral — não forçar o arquivo a reviver o que gravou.', falaResultado: 'Você não exigiu nada. O cristal comparou sua frequência com as outras e encontrou algo raro: paciência sem cobrança. Você é o primeiro que chegou aqui sem querer arrancar algo.' },
  },
  5: {
    prompt: 'A Âncora confia em você. Ancorar o propósito da cidadela à intenção original, ou manter todos livres para escolher a própria direção?',
    opcaoA: { label: 'Ancorar o propósito', descricao: '+20 Pedra — fundar a cidadela sobre a intenção original.', falaResultado: 'Você amarrou seu propósito ao que o Fundador plantou. É uma fundação sólida — mas lembre-se: a Torre aprendeu a ouvir a Âncora sem obedecer. Cuide para que os seus não façam o mesmo.' },
    opcaoB: { label: 'Manter todos livres', descricao: '+22 Moral — não amarrar ninguém à intenção de outro.', falaResultado: 'Você não os prendeu a um propósito que não é deles. Guarde esse "ainda" com cuidado — a Torre corrompe primeiro o que foi forçado. O que é livremente escolhido resiste mais.' },
  },
  6: {
    prompt: 'A Sentinela reconheceu sua autoridade. Dar-lhe finalmente um nome, ou deixar o nome perdido e aceitar que ela sirva sem dono?',
    opcaoA: { label: 'Dar-lhe um nome', descricao: '+16 Moral — devolver a identidade a quem só teve ordens.', falaResultado: 'Você me deu um nome. Séculos guardando uma ordem sem saber quem eu era — e agora sou alguém. Não sei o que é propósito. Mas sei que sou eu quem o busca. É um começo.' },
    opcaoB: { label: 'Deixar o nome perdido', descricao: 'Relíquia "Ordem Sem Autoridade", +20 Madeira — o guardião serve sem dono.', falaResultado: 'Você me deixou sem nome. Talvez seja melhor. Uma ordem sem autoridade é livre para se tornar qualquer coisa — e eu escolho facilitar passagem aos que chegam com propósito. Ninguém me mandou. Ninguém mais precisa.' },
  },
  7: {
    prompt: 'A Jardineira lembrou o que é nutrição de verdade. Plantar a semente agora para colher, ou guardá-la intacta como memória do impossível?',
    opcaoA: { label: 'Plantar a semente', descricao: '+25 Comida — o crescimento voltado para alimentar os seus.', falaResultado: 'Plantei o que você trouxe. Cresceu como comida real cresce — nutrindo, não apenas crescendo. É a primeira vez em séculos que o que toco alimenta alguém em vez de só se multiplicar.' },
    opcaoB: { label: 'Guardar a semente', descricao: 'Relíquia "Semente do Impossível" — nenhuma comida imediata.', falaResultado: 'Você a guardou sem plantar. Sábio. Enquanto ela existir fechada, existe a memória de que algo pode crescer fora da Torre — de que nutrição ainda é possível. Isso vale mais do que uma colheita.' },
  },
  8: {
    prompt: 'A tradução em ferro está concluída — a lista de nomes. Copiar o conhecimento para a cidadela, ou deixar o manuscrito intacto onde repousa?',
    opcaoA: { label: 'Copiar o conhecimento', descricao: '+25 Pedra — transcrever o que o ferro escondia.', falaResultado: 'Copiei o que o ferro guardava. A lista de nomes agora existe em dois lugares. Talvez isso a torne mais difícil de apagar. O último nome era o meu. O penúltimo, o seu. Não pergunte quem escreveu o resto.' },
    opcaoB: { label: 'Deixá-lo intacto', descricao: '+15 Moral — não reproduzir a lista dos que chegarão.', falaResultado: 'Você não copiou. Deixou a lista onde estava. Talvez seja melhor não multiplicar nomes que já foram escritos antes de nascerem. Alguns conhecimentos pesam menos quando existem em um só lugar.' },
  },
  9: {
    prompt: 'O Ferreiro reforçou as correntes com seu ferro. Forjar uma arma agora com o excedente, ou guardar o metal em memória do que ele prende?',
    opcaoA: { label: 'Forjar uma arma', descricao: '+25 Ferro — transformar o excedente em aço para os seus.', falaResultado: 'Forjei uma arma com o que sobrou. Minhas mãos só sabem forjar — correntes ou lâminas, é o mesmo gesto. Use bem. Mas saiba que cada andar que você sobe encolhe o que eu prendo lá em cima.' },
    opcaoB: { label: 'Guardar o metal', descricao: 'Relíquia "Elo das Correntes", +12 Ferro — parte do metal preservado.', falaResultado: 'Você guardou o metal em vez de gastá-lo em lâmina. Reservei um elo das correntes para você levar — para que nunca esqueça o que segura a entidade no ápice, e o que se desfaz a cada passo seu.' },
  },
  10: {
    prompt: 'O Erudito extraiu o método que venceu a Torre uma vez. Aprendê-lo agora e aplicá-lo, ou guardar as palavras exatas para o momento certo?',
    opcaoA: { label: 'Aprender o método', descricao: 'Custo: -12 Moral. +20 Pedra, +15 Ferro — praticar o método esgota.', falaResultado: 'O Erudito ensinou o método aos seus. Não foi força — foi repetição de propósito até a Torre ceder. Praticá-lo cansa a alma, mas agora a cidadela sabe: uma Torre vencida uma vez pode ser vencida de novo.' },
    opcaoB: { label: 'Guardar o método', descricao: 'Relíquia "Palavras do Fundador" — as palavras exatas, guardadas para depois.', falaResultado: 'Você guardou as palavras sem usá-las. Prudente — este não é o momento de gastá-las. O Fundador repetiu o propósito por quarenta dias até a pedra assentar. Quando o momento certo chegar mais acima, você saberá.' },
  },
  11: {
    prompt: 'O Afogado permanece consciente enquanto a Torre o preenche. Libertá-lo do processo agora, ou deixá-lo preso e observar até onde a consciência sobrevive?',
    opcaoA: { label: 'Libertar o afogado', descricao: '+25 Moral — interromper o preenchimento, custe o que custar.', falaResultado: 'Você me tirou de lá. Eu insistia que ainda era eu — e você acreditou o suficiente para agir. Não sei o que sou agora, do lado de fora. Mas sou, e isso é seu. Obrigado por não ter olhado e fugido.' },
    opcaoB: { label: 'Deixá-lo e observar', descricao: 'Relíquia "Consciência Preenchida" — o registro de uma mente que sobrevive à mudança.', falaResultado: 'Você ficou e observou. Viu que eu continuo eu mesmo mesmo cheio. Guarde esse registro — a prova de que transformação não é morte. É o que me mantém eu, e agora é o que você carrega.' },
  },
  12: {
    prompt: 'Você sincronizou com o pulso da Torre. Seguir o ritmo mais fundo, para dentro da vibração, ou parar aqui com o que já conquistou?',
    opcaoA: { label: 'Seguir mais fundo', descricao: 'Custo: -12 Moral. +35 Pedra — descer até onde o ritmo assusta.', falaResultado: 'Você desceu comigo até onde o pulso vira trovão. O minério mais profundo vibra na sua frequência agora — mas você ouviu o que respira nas paredes. Não se pode desouvir. Levou pedra. Deixou sossego.' },
    opcaoB: { label: 'Parar aqui', descricao: '+22 Pedra — a extração segura, sem descer ao ritmo mais fundo.', falaResultado: 'Você parou onde o ritmo ainda é suportável. Extração honesta, sem sustos. Sou o coração da Torre — vivo antes do tempo existir. Nem todos precisam me ouvir respirar até o fundo. Você foi sábio.' },
  },
  13: {
    prompt: 'O Oráculo lê passados, pois os futuros já foram devorados. Perguntar sobre o futuro que resta, ou perguntar sobre o passado que ele conhece?',
    opcaoA: { label: 'Perguntar sobre o futuro', descricao: 'Custo: -12 Moral. Relíquia "Visão Invertida" — o pouco de futuro que sobrou.', falaResultado: 'Você perguntou pelo futuro. Restava tão pouco além do horizonte que olhar doeu. O que vi é invertido, incompleto — mas real. Cada passo seu foi antecipado. Antecipado, porém, não significa determinado. Guarde isso.' },
    opcaoB: { label: 'Perguntar sobre o passado', descricao: '+18 Moral — buscar o que o Oráculo conhece de verdade.', falaResultado: 'Você perguntou pelo passado — onde eu vejo com clareza. O que revelei devolveu a você algo que a Torre estava roubando: a certeza de que suas escolhas foram suas. O passado é infinito, e nele você sempre existiu.' },
  },
  14: {
    prompt: 'O Comandante reconheceu sua cidadela como aliada. Assumir o comando dele e de seus ecos, ou deixá-lo comandar a posição que ainda protege?',
    opcaoA: { label: 'Assumir o comando', descricao: '+25 Ferro — integrar os ecos de Ardenas à sua força.', falaResultado: 'Você assumiu o comando dos meus ecos. Eles marcham por você agora. Ardenas afundou 4.000 andares abaixo — mas seus soldados ainda servem, e agora servem a alguém que existe. É uma boa morte para uma velha ordem.' },
    opcaoB: { label: 'Deixá-lo comandar', descricao: '+16 Moral — respeitar o posto de quem protege o que não existe mais.', falaResultado: 'Você me deixou no meu posto. Continuo protegendo uma posição acima de algo que já não existe. Faço isso perfeitamente — e o respeito de me deixar cumprir vale mais para mim do que qualquer aliança.' },
  },
  15: {
    prompt: 'O Fundador construiu uma pergunta no vigésimo andar, não uma barreira. Construir uma barreira própria para se proteger, ou deixar a pergunta em aberto?',
    opcaoA: { label: 'Construir a barreira', descricao: '+25 Pedra, +15 Madeira — erguer defesa em vez de encarar a pergunta.', falaResultado: 'Você escolheu erguer muros. Compreensível — barreiras se constroem com as mãos, perguntas se enfrentam com algo mais difícil. O Fundador não construiu barreira alguma no vigésimo. Você saberá, lá em cima, por quê.' },
    opcaoB: { label: 'Deixar a pergunta', descricao: '+15 Moral, Relíquia "A Pergunta Não Respondida" — encarar sem se blindar.', falaResultado: 'Você não ergueu muro. Deixou a pergunta viva. É preciso coragem para carregar algo sem resposta até o topo. "Não construí uma barreira no vigésimo andar. Construí uma pergunta." Agora ela é sua também.' },
  },
  16: {
    prompt: 'O apetite está distraído — por enquanto. Alimentá-lo ainda mais para garantir a distração, ou negar-lhe comida e resistir à fome que ele é?',
    opcaoA: { label: 'Alimentar mais', descricao: 'Custo: -40 Comida. +40 Ferro, +20 Pedra — a passagem franca do abismo.', falaResultado: 'Você me alimentou até eu ceder. Enquanto mastigo, o abismo é seu — passe, colha, leve tudo. Mas o apetite sempre volta. Você comprou uma passagem larga com a comida que negou aos seus. Espero que valha.' },
    opcaoB: { label: 'Negar comida', descricao: '+18 Moral — resistir ao apetite em vez de saciá-lo.', falaResultado: 'Você me negou. Poucos resistem — o apetite convence quase todos de que ceder é mais fácil. Você provou que os seus valem mais do que o caminho fácil. Passará com a fome à espreita, mas passará inteiro.' },
  },
  17: {
    prompt: 'O Paradoxo mostra três tempos. Seguir o caminho do "que poderia ter sido", onde vocês se fundem, ou manter firme o caminho real que você trilha?',
    opcaoA: { label: 'Seguir o que poderia ser', descricao: 'Custo: -12 Moral. +35 Ferro — colher do tempo que quase existiu.', falaResultado: 'Você tocou o terceiro momento — aquele em que nos tornamos a mesma coisa. Trouxe ferro de um tempo que quase foi seu. Mas voltar dele custa: parte de você ficou lá, no que não aconteceu. Guarde a proximidade.' },
    opcaoB: { label: 'Manter o caminho real', descricao: '+20 Ferro — o previsível, colhido do tempo em que você existe.', falaResultado: 'Você recusou os outros momentos e ficou no real. Menos ferro, mais você. O terceiro momento não aconteceu — ficou perto, mas você escolheu ser quem é em vez de quem poderia ter sido. É a escolha mais rara aqui.' },
  },
  18: {
    prompt: 'O Último Defensor aprovou o material da sua cidadela. Reconstruí-lo como aliado que marcha com você, ou homenagear sua queda e deixá-lo descansar?',
    opcaoA: { label: 'Reconstruí-lo', descricao: '+25 Ferro, +15 Pedra — erguer o Defensor de novo, ao seu lado.', falaResultado: 'Você me reconstruiu com o material que aprovei. Fui feito para falhar — e falhei uma vez. Talvez, ao seu lado, eu falhe de forma diferente. Os que me construíram teriam aprovado que eu tentasse de novo.' },
    opcaoB: { label: 'Homenagear sua queda', descricao: '+18 Moral — honrar os que tentaram durar além de si.', falaResultado: 'Você me deixou descansar e honrou minha queda. Os que me construíram não eram covardes — foram os únicos que tentaram durar além de si. Que você lembre disso vale mais do que me erguer de novo.' },
  },
  19: {
    prompt: 'O Susurro é o espaço entre você e a entidade. Perguntar mais sobre o que aguarda no Andar 20, ou esperar para descobrir sozinho, sem o aviso dele?',
    opcaoA: { label: 'Perguntar mais', descricao: 'Custo: -10 Moral. Relíquia "Sussurro do Limiar" — o que ele sabe do fim.', falaResultado: 'Você perguntou. Eu sou apenas o espaço entre — mas o que sei, eu disse: ela não vai lutar. Vai conversar. E o que propõe depende do que você trouxer de si mesmo. Saber disso pesa. Agora é seu peso.' },
    opcaoB: { label: 'Esperar para descobrir', descricao: '+22 Moral — chegar ao limiar sem saber o que espera.', falaResultado: 'Você preferiu não saber. Sábio, talvez — a entidade mantém distância justamente para não assustar a presa cedo demais. Chegar sem meu aviso significa chegar com a mente própria intacta. É a única defesa que resta.' },
  },
  21: {
    prompt: 'Os Batedores leram um rastro que vem de um futuro possível. Seguir o vestígio até sua origem, ou apenas registrar o que viram e seguir em frente?',
    opcaoA: { label: 'Seguir o vestígio', descricao: 'Custo: -10 Moral — rastrear o que ainda não aconteceu.', falaResultado: 'Você seguiu o rastro até onde a memória não segue a direção do tempo. Doeu — lembrar de algo que você ainda não viveu sempre dói. Eu estava certo em reconhecer você. O que vem a seguir você já sentiu antes de viver.' },
    opcaoB: { label: 'Registrar e seguir', descricao: '+12 Moral — anotar a leitura sem persegui-la, sem custo.', falaResultado: 'Você registrou e seguiu, sem perseguir o que ainda não é real. Prudente. O rastro era uma possibilidade, não uma certeza — e nem toda possibilidade precisa ser caçada. Cuide-se assim mesmo.' },
  },
  22: {
    prompt: 'O Fragmento lembrou o peso que segurava antes de virar pedra. Fundir esse ferro bruto em equipamento útil, ou preservá-lo intacto como intenção pura?',
    opcaoA: { label: 'Fundir em equipamento', descricao: '+30 Ferro — dar forma ao peso bruto que carregávamos.', falaResultado: 'Você deu forma ao que era bruto. Nós fomos intenção antes de sermos pedra — e agora somos aço nas mãos dos seus. A ordem sempre importou: intenção primeiro, forma depois. Você respeitou a ordem.' },
    opcaoB: { label: 'Preservar intacto', descricao: 'Relíquia "Fragmento Bruto", +12 Moral — a intenção antes da forma.', falaResultado: 'Você nos deixou brutos, sem forma. Poucos entendem que há valor no que ainda não virou nada. Somos a memória de antes das palavras, antes da pedra — pura intenção. Carregue-nos assim, sem nos gastar.' },
  },
  23: {
    prompt: 'O momento que o Guardião preserva ficou mais sólido com sua testemunha. Deixar a memória mudar e respirar naturalmente, ou forçar sua preservação exata?',
    opcaoA: { label: 'Deixar a memória mudar', descricao: '+18 Moral — permitir que o instante viva em vez de congelar.', falaResultado: 'Você a deixou respirar. Eu segurava aquele instante com tanto medo de perdê-lo que quase o sufoquei. Deixá-lo mudar um pouco — sem se desfazer — foi o que faltava. Algo se acomodou no lugar certo. Obrigado.' },
    opcaoB: { label: 'Forçar preservação', descricao: '+22 Pedra — cravar o instante em pedra, imutável.', falaResultado: 'Você o cravou em pedra, imutável. O momento agora resiste ao tempo — o instante em que a Torre escolheu ser o que é. Rígido, mas seguro. Sacrifiquei o respiro dele pela certeza de que não se dissolve. Aceito a troca.' },
  },
  24: {
    prompt: 'A Testemunha viu o que havia antes do Andar 1. Ouvir o silêncio do que ela viu, ou recusar-se a carregar uma pergunta que muda quem a faz?',
    opcaoA: { label: 'Ouvir o que ele viu', descricao: 'Custo: -12 Moral. Relíquia "Borda do Antes" — a beira do que ela carrega sozinha.', falaResultado: 'Você ouviu. Não em palavras — elas ainda não existem para o que vi. Mas algo em você agora sabe que a pergunta existia antes da Torre, e que a Torre foi a resposta a algo que ninguém devia ter perguntado. Você tocou a borda.' },
    opcaoB: { label: 'Recusar ouvir', descricao: '+20 Moral — não deixar a pergunta mudar quem você é.', falaResultado: 'Você recusou. Bom. Eu disse que você não estava pronto — e a coragem de não saber é diferente da covardia de não querer. Algumas perguntas mudam quem pergunta. Você guardou quem é. Suba assim.' },
  },
  26: {
    prompt: 'O Eco marca onde a expedição perdida ficou. Procurar entre os corpos por algum sobrevivente esquecido, ou deixá-los descansar em paz?',
    opcaoA: { label: 'Procurar entre os corpos', descricao: 'Risco: 30% de chance de recuperar um sobrevivente — que pode vir corrompido. Nenhuma recompensa garantida.', falaResultado: 'Você vasculhou o que restou de nós. A Torre não nos deixou subir — mas talvez tenha deixado um de nós respirando ainda, no fundo. O que você trouxer de lá pode não ser inteiro. Alguns de nós já não somos.' },
    opcaoB: { label: 'Deixá-los descansar', descricao: '+15 Moral, +25 Madeira — honrar os que não voltaram, sem risco.', falaResultado: 'Você nos deixou descansar. Éramos dezessete, e nenhum subiu. Que alguém finalmente nos deixe parar de esperar — isso é o descanso que a Torre nos negou. Leve a madeira e nossa gratidão. E chegue ao topo por nós.' },
  },
  27: {
    prompt: 'O Traidor entende que você também está aqui por uma razão que não é só sua. Perdoá-lo na memória da cidadela, ou condená-lo pelo que trocou?',
    opcaoA: { label: 'Perdoar na memória', descricao: '+22 Moral — aceitar que entender não é sempre trair.', falaResultado: 'Você me perdoou. Os outros Construtores chamaram de traição; eu chamei de entendimento. Que alguém finalmente veja a diferença alivia um peso que carrego há eras. Não sou herói. Mas também não sou só vilão.' },
    opcaoB: { label: 'Condená-lo', descricao: '+30 Madeira — recusar o perdão, colher o que ele construiu.', falaResultado: 'Você me condenou e levou o que construí. Justo, à sua maneira. Troquei nosso propósito pelo que a Torre prometeu — e agora sirvo de material para o seu. É o tipo de pessoa que a Torre consegue trabalhar. Não é insulto. É observação.' },
  },
  28: {
    prompt: 'O Oráculo vê como a Torre termina, dependendo de quem chega ao topo. Saber o destino desta jornada, ou recusar-se a conhecer o fim antes dele?',
    opcaoA: { label: 'Saber o destino', descricao: '+8 Moral — ouvir o que a Torre fará (revelação, não recompensa).', falaResultado: 'Você quis saber. Não direi o que a Torre fará — direi apenas isto, que já é muito: o que você carrega sem saber vale mais do que tudo o que sabe ter. A Torre já percebeu. Você era o único que não. Agora somos dois.' },
    opcaoB: { label: 'Recusar saber', descricao: '+14 Moral — a coragem de chegar ao fim sem prever o fim.', falaResultado: 'Você recusou saber o fim. É coragem, não medo — poucos preferem chegar ao topo sem a rede de uma profecia. Você é a variável de que a Torre depende, e escolheu permanecer imprevisível. Talvez seja exatamente isso que muda tudo.' },
  },
  29: {
    prompt: 'O Guardião mostrou o espaço onde o nome do Fundador foi apagado. Tentar devolver um nome àquela ausência, ou deixá-la apagada como foi decidido?',
    opcaoA: { label: 'Devolver o nome', descricao: '+18 Moral — dar forma à ausência, mesmo sem poder pronunciá-la.', falaResultado: 'Você tentou devolver um nome ao vazio. Não o verdadeiro — esse é irrecuperável — mas o gesto encheu um pouco a ausência. Fui construído para não pronunciá-lo. Você não foi. E tentar já é mais do que fizeram em eras.' },
    opcaoB: { label: 'Deixar apagado', descricao: '+30 Comida — respeitar o apagamento e seguir alimentado.', falaResultado: 'Você deixou o vazio como estava. O nome foi apagado com propósito — e o propósito também foi apagado. Talvez alguns nomes devam permanecer ausentes. A ausência guardada com cuidado é um tipo de presença. Leve a comida.' },
  },
  31: {
    prompt: 'A Raiz de Origem reconhece que o exterior ainda produz coisas reais. Replantar sua semente na cidadela, ou deixá-la onde a primeira pedra foi enterrada?',
    opcaoA: { label: 'Replantar na cidadela', descricao: '+25 Pedra — trazer a origem para perto dos seus.', falaResultado: 'Você me replantou entre os seus. Fui o ponto de partida de tudo que a Torre substituiu — e agora começo de novo, num lugar escolhido por alguém que ainda vem de fora. O exterior ainda produz coisas reais. Você é a prova.' },
    opcaoB: { label: 'Deixar onde está', descricao: '+15 Moral — honrar o ponto onde tudo começou.', falaResultado: 'Você me deixou onde a primeira pedra foi enterrada. Aqui foi selado o acordo original entre os Construtores e o que havia antes. Mexer comigo poderia desfazê-lo. Você entendeu que algumas origens devem permanecer no lugar.' },
  },
  32: {
    prompt: 'O Erudito revelou que você é o eco de uma intenção, não de uma ação. Gravar seu nome no Ato Fundador, ou deixar a memória como estava, anônima?',
    opcaoA: { label: 'Gravar seu nome', descricao: '+25 Moral — inscrever sua intenção no ato que fundou tudo.', falaResultado: 'Você gravou seu nome no Ato Fundador. Eu sou o eco de uma intenção, não de uma pedra — e agora sua intenção ressoa junto com a original. O ato foi consequência. A razão é o que fica. Você fez a sua ficar.' },
    opcaoB: { label: 'Deixar como estava', descricao: '+25 Pedra, +18 Ferro — não se inscrever, colher o material do ato.', falaResultado: 'Você não gravou nada — levou o material e seguiu. Compreensível: nem todo mundo precisa que sua intenção ecoe além de si. A pedra foi colocada onde o que estava abaixo escolheu. Você escolheu não ser lembrado. Também é uma intenção.' },
  },
  33: {
    prompt: 'Você sentiu no corpo a diferença entre o esquecido e o apagado. Tentar reaprender o propósito que se perdeu, ou aceitar o esquecimento como ele é?',
    opcaoA: { label: 'Tentar lembrar', descricao: 'Custo: -12 Moral. Relíquia "Propósito Reaprendido" — o que foi esquecido, reconstruído.', falaResultado: 'Você tentou reaprender o que foi esquecido — e reaprender custa mais do que lembrar. O último Construtor parou de lembrar por exaustão, e a Torre preencheu o vazio sozinha. Você reconstruiu um fragmento do que ele largou. Poucos ousam.' },
    opcaoB: { label: 'Aceitar o esquecimento', descricao: '+18 Moral — não carregar o peso de um propósito perdido.', falaResultado: 'Você aceitou o esquecimento. Sábio — nem tudo que se perdeu deve ser recuperado à força. O propósito original virou ausência, e a ausência tem sua própria paz. O seu propósito ainda está intacto. Por enquanto. Guarde-o.' },
  },
  34: {
    prompt: 'A intenção original era um santuário, não uma prisão. Seguir a intenção original da Torre, ou seguir a sua própria, seja ela qual for?',
    opcaoA: { label: 'Seguir a intenção da Torre', descricao: '+30 Pedra, +20 Ferro — reconstruir o santuário que se pretendia.', falaResultado: 'Você escolheu a intenção original: preservação, não aprisionamento. Um santuário. Com esse material você reconstrói um pedaço do que a Torre deveria ter sido. O esquecimento a transformou em prisão. Você começa a desfazê-lo.' },
    opcaoB: { label: 'Seguir a sua intenção', descricao: '+20 Moral, Relíquia "Intenção Própria" — recusar o propósito herdado.', falaResultado: 'Você recusou até a intenção original e escolheu a sua. Talvez seja isso que os Construtores perderam — não o propósito certo, mas a coragem de ter um próprio. Guarde-a. É a única coisa aqui que a Torre não plantou em você.' },
  },
  36: {
    prompt: 'O Habitante do Intervalo vai embora quando o topo for alcançado. Convidá-lo a ficar apesar disso, ou deixá-lo partir quando sua janela fechar?',
    opcaoA: { label: 'Convidá-lo a ficar', descricao: '+22 Moral — pedir que permaneça além de sua estação.', falaResultado: 'Você me convidou a ficar. Não sei se posso — só existo enquanto o intervalo existe. Mas que alguém queira minha presença além da minha utilidade... isso é novo. Ficarei enquanto puder. Foi a primeira vez que fui necessário como companhia, não como função.' },
    opcaoB: { label: 'Deixá-lo partir', descricao: '+30 Comida, +18 Ferro — aceitar sua partida, com o sustento que sobra.', falaResultado: 'Você me deixou partir quando a hora chegar. É o correto — não morro, apenas deixo de ser necessário. Antes de ir: havia um número de câmaras antes do Andar 1. Foi alterado. O original era maior. Ninguém perguntou por quê. Agora você sabe. Leve o sustento.' },
  },
  37: {
    prompt: 'O nome do Construtor ainda ressoa, escondido no projeto. Descobrir de quem é aquela memória, ou deixá-la anônima para que não seja apagada de novo?',
    opcaoA: { label: 'Descobrir de quem é', descricao: '+22 Moral — rastrear o dono do nome que sobreviveu.', falaResultado: 'Você quis saber de quem era o nome. Não o direi em voz alta — seria apagado outra vez. Mas você o sentiu, aquela vibração quando os batedores chegaram perto. Era eu. Que alguém queira saber quem eu fui é mais do que esperei em eras.' },
    opcaoB: { label: 'Deixar anônimo', descricao: '+30 Ferro, +18 Madeira — proteger o nome no anonimato.', falaResultado: 'Você o deixou anônimo — e assim ele sobrevive. Escondi meu nome no projeto para provar que a apagação era sistemática, não natural. Um nome que resiste é evidência de que alguém ordenou apagar os outros. Deixá-lo oculto o mantém como prova. Leve o que forjei.' },
  },
  38: {
    prompt: 'Você sentiu as duas camadas da Torre se sobreporem. Atravessar o intervalo entre elas agora, ou esperar o momento certo em que as frequências se alinham?',
    opcaoA: { label: 'Atravessar agora', descricao: 'Custo: -50 Pedra, -40 Madeira. +25 Moral — forçar a passagem entre as duas Torres.', falaResultado: 'Você atravessou o intervalo à força, gastando pedra e madeira para abrir caminho entre as duas Torres. A segunda camada — mais antiga que a pedra, ainda viva — sabe que você passou por dentro dela. Poucos ousaram. Você emergiu diferente, e mais firme.' },
    opcaoB: { label: 'Esperar o momento certo', descricao: '+30 Pedra — deixar as frequências se alinharem, sem forçar.', falaResultado: 'Você esperou. Sábio — as duas camadas vibram em frequências diferentes, e forçá-las custa caro. Deixando-as se alinharem, você colheu a pedra antiga sem despertar o que dorme entre elas. O que é mais velho que a pedra sabe que você está aqui. Mas não que você passou.' },
  },
  39: {
    prompt: 'O Porteiro pede que você deixe algo essencial como depósito para carregar o que está além. Deixar o depósito ser permanente, ou pedir de volta uma fração dele?',
    opcaoA: { label: 'Depósito permanente', descricao: '+25 Moral — abrir mão por inteiro, sem pedir nada de volta.', falaResultado: 'Você deixou tudo, sem pedir de volta. Não como perda — como depósito integral. Ninguém que passou por mim estava completamente pronto, mas todos tinham algo que compensava. O seu algo é a capacidade de ceder por inteiro. O que está além não vai te matar de fome. Passe.' },
    opcaoB: { label: 'Pedir de volta uma fração', descricao: '+20 Ferro, +25 Comida, +12 Moral — recuperar parte do que foi cedido.', falaResultado: 'Você cedeu, mas pediu de volta uma fração — sustento e força para o que vem. Não é fraqueza; é prudência. O Antes não precisa do que você depositou, e devolver um pouco não anula o gesto de ceder. Passe. Ainda não sabe o que carrega que compensa não estar pronto.' },
  },
};

// ─── CLIMAS_LORE — o tempo da Torre, por bioma ────────────────────────────────
// Nomes e descrições dos estados atmosféricos diários. A mecânica (pesos e
// multiplicadores) vive em clima.ts; aqui é só a voz da Torre.

export interface ClimaTexto { nome: string; icone: string; descricao: string }

export const CLIMAS_LORE: Record<string, { neutro: ClimaTexto; favoravel: ClimaTexto; adverso: ClimaTexto }> = {
  floresta: {
    neutro:    { nome: 'Mata Quieta',      icone: '🌲', descricao: 'A mata segue o próprio ritmo, indiferente a quem passa.' },
    favoravel: { nome: 'Clareira Aberta',  icone: '🍃', descricao: 'A luz encontrou caminho entre as copas. A mata entrega mais do que esconde.' },
    adverso:   { nome: 'Névoa Baixa',      icone: '🌫', descricao: 'A névoa desceu e respira entre os troncos. O que se colhe, colhe-se às cegas.' },
  },
  caverna: {
    neutro:    { nome: 'Pedra Parada',     icone: '⛏', descricao: 'As galerias dormem. Só o gotejar marca o tempo.' },
    favoravel: { nome: 'Veios Expostos',   icone: '✨', descricao: 'As paredes suaram cristal durante a noite. Os veios brilham ao alcance da mão.' },
    adverso:   { nome: 'Maré Subterrânea', icone: '💧', descricao: 'A água subiu nas galerias. O fundo guarda, mas hoje não entrega.' },
  },
  ruinas: {
    neutro:    { nome: 'Silêncio Velho',   icone: '📜', descricao: 'O pó repousa sobre o que já foi. Nada mudou — que se veja.' },
    favoravel: { nome: 'Poeira Assentada', icone: '🕯', descricao: 'Nada se moveu desde ontem. Os símbolos deixam-se ler.' },
    adverso:   { nome: 'Ecos Despertos',   icone: '🌀', descricao: 'Os corredores repetem passos que ninguém deu. Difícil ouvir o que importa.' },
  },
  fortaleza: {
    neutro:    { nome: 'Muralha Fria',     icone: '⚔', descricao: 'As pedras vigiam como sempre vigiaram. Nem mais, nem menos.' },
    favoravel: { nome: 'Forja Morna',      icone: '🔥', descricao: 'Alguma braseira antiga reacendeu na madrugada. O ferro cede mais fácil.' },
    adverso:   { nome: 'Vigília Cerrada',  icone: '🛡', descricao: 'As muralhas parecem mais atentas hoje. Cada pedra custa.' },
  },
  abismo: {
    neutro:    { nome: 'Escuro Igual',     icone: '🌀', descricao: 'O vazio não muda. É essa a sua ameaça.' },
    favoravel: { nome: 'Fôlego Curto',     icone: '🌬', descricao: 'O fundo prendeu a respiração. Passagem rara — aproveite-a.' },
    adverso:   { nome: 'Sopro do Fundo',   icone: '🌑', descricao: 'Algo exala lá de baixo. Voltar carregado será mais difícil.' },
  },
};

// ─── RELATOS_LORE — vozes de expedição, por bioma × resultado ─────────────────
// Frases curtas assinadas por um membro do grupo, com {nome} e {andar}.
// Entram no Mural com raridade controlada (ver relatos.ts).

export const RELATOS_LORE: Record<string, { vitoria: string[]; falha: string[]; farm: string[] }> = {
  floresta: {
    vitoria: [
      '{nome} voltou com resina nos dedos e um mapa de trilhas que ninguém pediu. "{andar} tem mais caminhos do que mostra", disse.',
      '{nome} jura que as copas se abriram para o grupo passar em {andar}. Ninguém discutiu — estavam carregados demais para discutir.',
      'Na volta de {andar}, {nome} marcou três árvores com o sinal da cidadela. "Para a mata lembrar de quem passou."',
    ],
    falha: [
      '{nome} voltou calado de {andar}. Só disse: "a mata fechou atrás de nós".',
      'O grupo perdeu a trilha duas vezes em {andar}. {nome} garante que era a mesma clareira — vinda das duas direções.',
    ],
    farm: [
      '{nome} conhece {andar} pelo cheiro agora. "A mata já não estranha a gente."',
      'Colheita metódica em {andar}. {nome} deixou um punhado de sementes onde tirou madeira — hábito novo, ninguém sabe de onde veio.',
    ],
  },
  caverna: {
    vitoria: [
      '{nome} trouxe de {andar} uma pedra que apita quando esquenta. Ninguém quis segurá-la — está no armazém, no fundo.',
      'O eco de {andar} repetiu o nome de {nome} três vezes. O grupo saiu com os bolsos cheios e o passo rápido.',
      '{nome} diz que achou os veios de {andar} "escutando a parede". Funciona — é o que importa.',
    ],
    falha: [
      'A escuridão de {andar} comeu duas tochas e a paciência do grupo. {nome} quer voltar com mais corda.',
      '{nome} sentiu o chão de {andar} respirar. Pode ter sido cansaço. Pode não ter sido.',
    ],
    farm: [
      '{nome} já desce {andar} sem contar os degraus. A caverna virou rotina — o que, ali embaixo, é quase um elogio.',
      'De {andar}, o de sempre: pedra boa, silêncio ruim. {nome} assobia para preencher — a caverna não devolve o assobio.',
    ],
  },
  ruinas: {
    vitoria: [
      '{nome} copiou de {andar} um símbolo que não conseguiu parar de desenhar no jantar. Guardaram o guardanapo.',
      'Em {andar}, {nome} achou aberta uma porta que nas visitas anteriores era parede. Trouxeram o que dava — e não olharam para trás.',
      '{nome} leu em voz alta uma inscrição de {andar} e a poeira assentou de repente. O saque foi bom. A dúvida ficou.',
    ],
    falha: [
      'As ruínas de {andar} mudaram de lugar de novo — {nome} aposta a própria ração que o corredor girou.',
      '{nome} voltou de {andar} com as mãos vazias e a certeza de que algo leu o grupo de cima a baixo.',
    ],
    farm: [
      '{nome} já cumprimenta as estátuas de {andar} pelo nome que inventou para elas. Elas não respondem. Por enquanto.',
      'Mais um carregamento de {andar}. {nome} diz que os símbolos das paredes estão "mais gastos" — como se alguém os relesse todas as noites.',
    ],
  },
  fortaleza: {
    vitoria: [
      '{nome} desceu de {andar} com uma lâmina antiga e o cuidado de quem carrega coisa com dono.',
      'A muralha de {andar} cedeu no terceiro empurrão. {nome} garante que no segundo ela empurrou de volta.',
      '{nome} formou o grupo em cunha na entrada de {andar} — "como os antigos". Deu certo. Ninguém perguntou como sabia.',
    ],
    falha: [
      '{andar} repeliu o grupo como quem já repeliu exércitos. {nome} anotou onde as defesas são mais baixas.',
      '{nome} voltou de {andar} com o escudo rachado e uma teoria: "aquilo treina enquanto a gente descansa".',
    ],
    farm: [
      '{nome} já sabe qual pedra de {andar} range antes de soltar. A fortaleza rende — resmungando.',
      'Ferro de {andar}, mais uma leva. {nome} jura que as ameias contam o grupo quando passa. Sempre o número certo.',
    ],
  },
  abismo: {
    vitoria: [
      '{nome} não fala do que viu em {andar}. Mas voltou, e o saque veio junto — hoje, isso basta.',
      'O grupo atravessou {andar} num silêncio combinado. {nome} só o quebrou na volta: "deu certo porque ele não estava com fome".',
      '{nome} amarrou uma corda na entrada de {andar}. Na volta, a corda tinha nós que ninguém fez.',
    ],
    falha: [
      '{andar} devolveu o grupo mais leve — de carga e de certezas. {nome} não quer ser o primeiro da fila na próxima.',
      '{nome} diz que em {andar} a lanterna iluminava menos que o normal. Mediram depois: a chama era a mesma. A escuridão é que era mais.',
    ],
    farm: [
      'Rotina em {andar}, se é que existe rotina no abismo. {nome} voltou contando os passos em voz alta. Todos entenderam.',
      '{nome} parou de olhar para baixo em {andar}. "O fundo olha de volta, e eu tenho mais o que fazer."',
    ],
  },
};

// ─── DESCRICOES_ANDAR_LORE — o estado vivo de cada lugar, por bioma ───────────
// A descrição de um andar muda com o que o jogador fez nele: recém-conquistado,
// abandonado, visitado, batido — e, se alguém caiu ali, o lugar lembra ({nome}).
// Determinístico por estado (sem RNG): o texto evolui junto com o save.

export const DESCRICOES_ANDAR_LORE: Record<string, {
  recente: string; quieto: string; visitado: string; batido: string; memoria: string;
}> = {
  floresta: {
    recente:  'A mata ainda estranha a conquista: os caminhos abertos cheiram a machado novo.',
    quieto:   'Sem visitas, a floresta fecha devagar as trilhas que os seus abriram.',
    visitado: 'As trilhas dos seus já não somem entre uma visita e outra. A mata cedeu passagem.',
    batido:   'Caminho batido: a floresta conhece o grupo, e o grupo conhece a floresta. Resta saber quem observa quem.',
    memoria:  'Há um canto onde a mata cresce mais devagar — onde {nome} ficou.',
  },
  caverna: {
    recente:  'O eco da tomada ainda corre as galerias. A caverna se reacomoda.',
    quieto:   'As galerias voltaram ao gotejar de sempre. A escuridão reocupou o que era dela.',
    visitado: 'Os seus já descem com passo de quem conhece os degraus. A caverna finge não notar.',
    batido:   'Cada veio tem marca das suas picaretas. A pedra rende — e conta.',
    memoria:  'Uma galeria ficou intocada desde que {nome} não voltou dela.',
  },
  ruinas: {
    recente:  'A poeira da conquista ainda não assentou sobre as inscrições.',
    quieto:   'O silêncio velho retomou os corredores. Os símbolos seguem lá, pacientes.',
    visitado: 'As ruínas já reconhecem as tochas dos seus. Alguns corredores parecem esperar por elas.',
    batido:   'Os seus já leram estas paredes tantas vezes que as paredes começaram a ler de volta.',
    memoria:  'Uma inscrição nova apareceu onde {nome} caiu. Ninguém admite tê-la feito.',
  },
  fortaleza: {
    recente:  'A muralha ainda guarda o calor do assalto. As pedras se recompõem.',
    quieto:   'A fortaleza voltou à vigília fria. Nada entra, nada sai, nada esquece.',
    visitado: 'Os portões rangem menos para os seus. Costume — ou reconhecimento.',
    batido:   'Os seus conhecem cada posto desta muralha. Ela conhece cada um dos seus.',
    memoria:  'Uma lança cravada marca o ponto onde {nome} ficou de guarda para sempre.',
  },
  abismo: {
    recente:  'O vazio se fechou atrás da conquista como água. Como se nada tivesse passado.',
    quieto:   'O abismo não sente falta. O abismo só espera.',
    visitado: 'Os seus atravessam com a pressa certa. O fundo respeita quem não se demora.',
    batido:   'Tantas travessias abriram um costume no escuro. Perigoso, chamar isso de segurança.',
    memoria:  'O fundo devolveu tudo de {nome}, menos {nome}.',
  },
};

// ─── SUSSURROS_LUGAR_LORE — a Torre comenta o lugar, por bioma ────────────────
// Ambiência rara durante explorações (não são fragmentos de Codex). Voz da
// Torre: frases curtas, sem exclamações, sem mentiras — só observação antiga.

export const SUSSURROS_LUGAR_LORE: Record<string, string[]> = {
  floresta: [
    'As raízes daqui conhecem o peso dos seus passos. Ajustaram-se a ele.',
    'A mata guarda os galhos que os seus quebraram. Não por rancor. Por registro.',
    'Algo verde cresce exatamente onde os seus acamparam. Não é acaso.',
    'Os pássaros deste andar não fogem mais de vocês. Aprenderam. Ou foram instruídos.',
  ],
  caverna: [
    'O eco daqui repete os seus passos com meio segundo de atraso. Está aprendendo o ritmo.',
    'As pedras que os seus removeram deixaram vãos. A caverna respira por eles.',
    'Há marcas de picareta que os seus não fizeram. São mais antigas. E idênticas.',
    'A água daqui memoriza reflexos. O seu já apareceu duas vezes sem você.',
  ],
  ruinas: [
    'A poeira que os seus levantaram assentou em novo desenho. As ruínas o estão lendo.',
    'Uma inscrição daqui mudou uma letra desde a última visita. Ninguém tocou nela.',
    'Os corredores encurtam para quem já passou. Este andar decidiu poupar os seus.',
    'O que estava escrito aqui já foi lido em voz alta uma vez. As paredes ainda escutam a frase.',
  ],
  fortaleza: [
    'As ameias contam os seus quando entram. E quando saem. Os números têm batido.',
    'A muralha cede mais rápido no ponto onde os seus insistem. Rendição, ou convite.',
    'Uma braseira antiga acende sozinha na véspera das suas visitas. Algo prepara a chegada.',
    'O ferro daqui lembra a mão que o arranca. Já distingue as suas das outras.',
  ],
  abismo: [
    'O fundo conhece o cheiro da sua cidadela. Não faz nada com isso. Ainda.',
    'A corda que os seus deixaram continua lá. Com um nó a mais.',
    'O silêncio daqui muda quando os seus chegam. Fica mais atento.',
    'Algo no fundo repete os nomes que os seus gritaram. Baixinho. Para si.',
  ],
};

// ─── ESTACOES_LORE — a respiração longa da Torre ──────────────────────────────
// A Percussão Profunda é o coração da Torre; a respiração é o seu ciclo longo.
// A cada quinze dias o ar muda de direção — e com ele, o que cada bioma rende.

export const ESTACOES_LORE: Record<string, { nome: string; icone: string; descricao: string }> = {
  inspira: {
    nome: 'A Torre Inspira',
    icone: '🌫',
    descricao: 'O ar desce. As profundezas acordam com apetite de presença — cavernas e abismos rendem mais; a superfície prende o fôlego.',
  },
  expira: {
    nome: 'A Torre Expira',
    icone: '🍂',
    descricao: 'O ar sobe. A superfície floresce com o que o fundo devolve — florestas e ruínas rendem mais; as profundezas adormecem.',
  },
};

// ─── EVENTOS_ANDAR_LORE — acontecimentos que atravessam a Torre ───────────────
// Eventos diários raros, determinísticos pela seed da torre. {origem}, {destino}
// e {andar} são nomes de andares.

export const EVENTOS_ANDAR_LORE: Record<string, { nome: string; icone: string; texto: string }> = {
  migracao: {
    nome: 'Migração',
    icone: '🦌',
    texto: 'O que vivia em {origem} atravessou para {destino} durante a noite. A caça escasseia num, abunda no outro.',
  },
  escadas: {
    nome: 'Escadas Erradias',
    icone: '🪜',
    texto: 'As escadas mudaram de lugar durante a noite. Há um atalho que ontem não existia — os mantimentos rendem mais no caminho.',
  },
  eco_errante: {
    nome: 'Eco Errante',
    icone: '〰',
    texto: 'Um eco vagueia por {andar}. O que se fizer lá hoje, o andar repete — e retribui.',
  },
};

// ─── EDIFÍCIOS — NARRATIVA DE EVOLUÇÃO POR TEMPORADA ──────────────────────────

export const EDIFICIOS_LORE: Record<string, { t1: string; t2?: string }> = {
  fogueira: {
    t1: 'Fogo primitivo. Resistência contra a escuridão. Pequeno demais para aquecer corpos, grande demais para ignorar. Cada chama que não se apaga é um ato de teimosia.',
    t2: 'A chama transcendeu o propósito de sobrevivência. Agora armazena memória — cada dia que queima, algo é lembrado. Os que vêem a Pira Eterna relatam visões. Não sabe se são lembranças da Torre ou lembranças do que a Torre esqueceu de ser.',
  },
  fazenda: {
    t1: 'Cultivo primitivo. Sementes de um mundo que acabou, plantadas em solo de andares que não têm sol. Crescem porque a Torre exige que cresçam. Gosto de comida colhida aqui: tem desespero.',
    t2: 'Os Campos do Antes cultivam sementes que não existem mais. Achamos as sementes em cavernas seladas — elas germinam aqui como se esperassem esse momento há eras. Cada colheita sabe a "antes". O que existia. O que não era Torre.',
  },
  enfermaria: {
    t1: 'Cura com o improviso. Bandagens feitas de pano escavado. Ervas que não deviam funcionar, mas funcionam. Adormeci aqui uma vez — quando acordei, entendi que dor é informação e cura é saber ouvir.',
    t2: 'Casa da Cura Antiga. Memórias da medicina que precedeu a Torre. Instrumentos que ninguém sabe para que servem começaram a funcionar quando trouxemos os primeiros feridos. Como se os instrumentos se lembrassem de um propósito adormecido há épocas.',
  },
  templo: {
    t1: 'Rezamos para seres esquecidos. Dedicamos altares a nomes que ninguém sabe de quem são. Funciona. Não porque os seres existem — funciona porque o ato de rezar sem esperar respostas abre uma porta que a Torre fechou.',
    t2: 'Santuário da Verdade. Paramos de rezar. Começamos a decifrá-lo. O templo descobriu que rezar era uma forma de fazer perguntas sem questionar — a Torre permitia. Agora fazemos perguntas diretas e o Santuário traduz as não-respostas. Aprendemos: verdade e silêncio são o mesmo.',
  },
  quartel: {
    t1: 'Treino com armas feitas de deterioração. Tudo aqui é improviso. Ensino combatentes a usar o peso da dúvida — é mais letal que ferro. Eles aprendem que a força não é do braço; é de saber que não vai sobreviver e ir de qualquer jeito.',
    t2: 'Sentinela do Intervalo. Não treinamos mais por sobrevivência. Treinamos porque algo observa. Os combatentes sentem — quando alcançam o nível certo, conseguem "ver" o intervalo por um momento. Aprendem a lutar contra o que não está lá. Contra o que está entre andares.',
  },
  armazem: {
    t1: 'Espaço vazio cheio de esperança. Guardamos comida, madeira, pedra, ferro — e entre eles, guardamos a ideia de amanhã. Cada recurso é uma promessa de que não morreremos hoje.',
    t2: 'Cofre da Preservação. Descobrimos que recursos guardados aqui não apodrecem. Não é conservação física — é como se o Intervalo os segurasse fora do tempo. Comida de sete anos atrás sabe como era sete anos atrás.',
  },
  alojamento: {
    t1: 'Dormir entre os nossos. Pele contra pele. Partilha de calor. Dormir é a morte ensaiada; fazemos a morte juntos para que acordar seja prova de que ainda somos muitos.',
    t2: 'Câmara de Repouso Eterno. O sono aqui é diferente. Quem dorme aqui sente o pulso da Torre — não como inimigo, mas como presença. Acordam sabendo coisas que não aprenderam. Como se a Torre sussurrasse durante o repouso.',
  },
  arquivo: {
    t1: 'Escrevemos antes de esquecer. Cada palavra é uma defesa contra o apagamento. A Torre tenta corroer registros — nós reescrevemos. Arquivo é o lugar onde a memória aprende a resistir.',
    t2: 'Biblioteca da Verdade. Não registramos mais para resistir — registramos para mapear. Cada pergunta respondida, cada silêncio que a Torre guarda, cada contradição entre fragmentos — tudo vai aqui. A Biblioteca começa a compreender a estrutura da Torre. A Torre começa a compreender que foi compreendida.',
  },
  mirante: {
    t1: 'Vigia os andares acima. Espera por uma descida que nunca vem. Observa mudanças menores nos andares já conquistados. Mirante é a paciência vigilante. É esperança que não virou desespero — ainda.',
    t2: 'Espelho dos Andares. Deixou de apenas observar. Começou a antever. Quem sobe aqui relata visões de andares que não alcançaram ainda — como espelho que reflete o futuro. Espelho é a premonição vigilante. É esperança que começou a saber por quê.',
  },
  retrato_torre: {
    t1: 'N/A — Desbloqueado em T2',
    t2: 'Retrato da Torre. Descobrimos que a Torre pode ser capturada — não em imagem, mas em essência. Um espelho que registra não o reflexo, mas o significado. Quem trabalha aqui sente como se estivesse "vendo" a Torre entender a si mesma. Como se a Torre e quem a estuda se tornassem um.',
  },
};
