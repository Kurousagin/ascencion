import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, BookOpen } from 'lucide-react';

interface Slide {
  icone: string;
  titulo: string;
  subtitulo?: string;
  corpo: string[];
  dica?: string;
}

const SLIDES: Slide[] = [
  {
    icone: '👁',
    titulo: 'Bem-vindo, Observador',
    subtitulo: 'Eles não sabem que você existe.',
    corpo: [
      'Você não é um herói nem um prefeito. É uma presença. Uma cidadela de sobreviventes vive à sombra de uma Torre que não deveria existir — eles vivem, trabalham e morrem; você observa e decide.',
      'Seu objetivo: conquistar os 20 andares da Torre, um a um, e entender o que dorme lá dentro.',
    ],
    dica: 'Você pode rever este guia a qualquer momento pelo botão COMO JOGAR, na tela inicial.',
  },
  {
    icone: '⏳',
    titulo: 'O Tempo da Torre',
    subtitulo: 'A cidadela vive — com ou sem você.',
    corpo: [
      'Os dias correm sozinhos: a cada dia os moradores comem, trabalham, se recuperam — e às vezes morrem. Ajuste a velocidade (1x, 2x, 5x) na aba OBS.',
      'Fechar o jogo não pausa o mundo. Ao voltar, a Torre lembra os dias que se passaram na sua ausência. Deixe estoques de comida antes de sair.',
    ],
    dica: 'Ative as notificações quando o jogo oferecer: você será avisado de invasões e de comida acabando mesmo com o app fechado.',
  },
  {
    icone: '🏰',
    titulo: 'A Cidadela',
    subtitulo: 'Construa para sobreviver.',
    corpo: [
      'Edifícios produzem comida, recuperam fadiga, elevam a moral e ampliam a população. Sem comida, moradores morrem de fome; com moral baixa, alguns traem — roubam ou sabotam.',
      'Moradores além do limite do Alojamento geram superlotação: consumo extra de comida, sanidade e lealdade em queda, e fadiga que nunca recupera.',
      'Atribua postos: um morador destacado em um edifício concede bônus passivo enquanto servir nele.',
    ],
    dica: 'Fazenda e Fogueira primeiro. Suba o Alojamento antes de cada leva nova de recrutas.',
  },
  {
    icone: '🎲',
    titulo: 'Os Moradores',
    subtitulo: 'Cada um é único — e finito.',
    corpo: [
      'Recrute pelo Ritual em Trindade: três sobreviventes chegam por vez, pagos em recursos — e o custo cresce junto com a população.',
      'Raridades: Comum, Incomum, Raro, Épico. Primordiais de temporada são Lendários e únicos no mundo inteiro: apenas um jogador possui cada um.',
      'A profissão — Combatente, Batedor, Erudito ou Sentinela — nasce do maior atributo. Treine corpo no Quartel e mente no Arquivo para evoluí-los.',
    ],
    dica: 'Fadiga alta corta o poder em expedição; lealdade baixa termina em traição. Deixe-os descansar.',
  },
  {
    icone: '🗼',
    titulo: 'A Torre',
    subtitulo: 'Cada andar é um teste.',
    corpo: [
      'Monte grupos e envie expedições. Poder de combate, fadiga, moral e o bioma do andar decidem o resultado — vitórias rendem recursos; derrotas podem custar vidas.',
      'A cada 5 andares, um Chefe guarda a passagem. Vencê-lo revela um Eco do Capítulo: um pedaço da história e bônus permanente de saque.',
      'Andares conquistados continuam úteis: explore-os de novo para extrair recursos.',
    ],
    dica: 'Não arrisque seus melhores moradores de uma vez. A Torre pune a pressa.',
  },
  {
    icone: '✦',
    titulo: 'Os Habitantes',
    subtitulo: 'Os andares têm voz.',
    corpo: [
      'Dezenove entidades habitam os andares 1 a 19. Cada uma propõe uma quest — recursos, tempo, provas de força ou sacrifícios.',
      'Concluir a quest ativa um Eco permanente de saque no andar e revela um fragmento da história. Algumas terminam num dilema: duas escolhas, duas recompensas, nenhuma resposta errada — mas a Torre lembra o que você escolheu.',
    ],
    dica: 'Na aba TORRE, toque no ícone do Habitante em cada andar conquistado.',
  },
  {
    icone: '🚪',
    titulo: 'Câmaras Secretas',
    subtitulo: 'A sua Torre não é igual a nenhuma outra.',
    corpo: [
      'Câmaras escondidas podem se revelar nos andares conquistados. Explorá-las custa comida e as tentativas são limitadas — mas o que há dentro só existe ali: relíquias, recursos e segredos.',
      'As câmaras da sua torre são geradas apenas para você. O caminho que outro jogador encontrou não abre as suas portas.',
    ],
    dica: 'Quando uma câmara se revelar, o jogo avisa. Leve um grupo descansado.',
  },
  {
    icone: '📖',
    titulo: 'Codex & O Livro',
    subtitulo: 'A Torre se conta em fragmentos.',
    corpo: [
      'Conquistas, quests e expedições revelam fragmentos: falas de Habitantes, Sussurros da Torre, Ecos de Chefes.',
      'Conclua todos os 19 Habitantes para desbloquear a Verdade da Temporada. E, com todos os fragmentos principais reunidos, abre-se o Livro — a história inteira costurada em capítulos, para ler de uma vez.',
    ],
    dica: 'O ícone 📖 no topo da aba TORRE pisca em dourado quando há fragmento novo.',
  },
  {
    icone: '🤝',
    titulo: 'Aliança & Guerra',
    subtitulo: 'Você não está sozinho.',
    corpo: [
      'Alie-se a até 3 cidadelas reais trocando um código de pareamento. Envie recursos (a Torre cobra 15% de taxa), empreste moradores por alguns dias ou mande reforços para expedições e guerras.',
      'Cidadelas rivais podem invadir: você terá um prazo em dias para mobilizar a defesa — ou ser saqueado. Também pode declarar guerra e tomar o espólio.',
    ],
    dica: 'GUERRA vive dentro da aba ALIANÇA. Quando uma invasão chegar, o alerta vermelho no topo leva você direto para lá.',
  },
  {
    icone: '🎁',
    titulo: 'Metas & Crônicas',
    subtitulo: 'O ritmo de cada dia.',
    corpo: [
      'Todo dia real, a Torre propõe 3 metas na aba OBS. Cumpra as três e reivindique o Presente da Torre.',
      'Ali também vive o Mural — os momentos marcantes da cidadela — e, na sub-aba CRÔNICAS, o registro completo de tudo: mortes, descobertas, traições, vitórias.',
    ],
    dica: 'As metas resetam à meia-noite do mundo real, não do jogo.',
  },
  {
    icone: '✦',
    titulo: 'Pronto, Observador.',
    subtitulo: 'A Torre aguarda o seu olhar.',
    corpo: [
      'Comece pequeno: comida, teto, um primeiro grupo forte. Suba com cuidado e leia o que a Torre deixar escapar.',
      'Cada morador importa. Cada escolha fica. A Torre não perdoa despreparados — mas recompensa quem presta atenção.',
    ],
    dica: 'Ao tocar em COMEÇAR, eu percorro as telas com você — apontando onde cada coisa vive.',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export function Onboarding({ open, onClose }: Props) {
  const [slide, setSlide] = useState(0);
  const isFirst = slide === 0;
  const isLast  = slide === SLIDES.length - 1;
  const current = SLIDES[slide];

  const handleClose = () => { setSlide(0); onClose(); };
  const next = () => isLast ? handleClose() : setSlide(s => s + 1);
  const prev = () => setSlide(s => Math.max(0, s - 1));

  return (
    <Dialog.Root open={open} onOpenChange={o => { if (!o) handleClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/95 backdrop-blur-md z-[60]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md z-[60] outline-none">
          <div className="relative bg-gradient-to-b from-[#1A1F2E] to-[#111520] border border-primary/30 rounded-sm shadow-[0_0_60px_rgba(0,0,0,0.98)] overflow-hidden">

            {/* Barra de progresso por slide */}
            <div className="flex gap-1 p-4 pb-0">
              {SLIDES.map((_, i) => (
                <div key={i} className="flex-1 h-[2px] rounded-full overflow-hidden bg-white/10">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: i <= slide ? '100%' : '0%' }}
                  />
                </div>
              ))}
            </div>

            {/* Fechar */}
            <Dialog.Close asChild>
              <button className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors touch-manipulation z-10">
                <X size={16} />
              </button>
            </Dialog.Close>

            {/* Conteúdo — arrastável: swipe esquerda/direita troca de passo */}
            <div className="p-6 pt-5 min-h-[340px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.18 }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={(_, info) => {
                    // No último passo o swipe não fecha o guia — só o botão COMEÇAR.
                    if (info.offset.x < -60 && !isLast) next();
                    else if (info.offset.x > 60) prev();
                  }}
                  className="flex-1 flex flex-col touch-pan-y"
                >
                  <div className="text-3xl mb-4 leading-none">{current.icone}</div>

                  <Dialog.Title className="font-cinzel font-bold text-primary tracking-widest text-lg leading-tight mb-1">
                    {current.titulo}
                  </Dialog.Title>
                  {current.subtitulo && (
                    <p className="text-[12px] text-secondary tracking-[0.2em] uppercase mb-4">
                      {current.subtitulo}
                    </p>
                  )}

                  <div className="space-y-2 flex-1">
                    {current.corpo.map((p, i) => (
                      <p key={i} className="text-[12px] text-white/65 leading-relaxed">{p}</p>
                    ))}
                  </div>

                  {current.dica && (
                    <div className="mt-4 flex gap-2 p-3 bg-black/30 border border-primary/15 rounded-sm">
                      <BookOpen size={12} className="text-primary/60 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-primary/60 italic leading-relaxed">{current.dica}</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between gap-3 px-6 pb-5">
              <button
                onClick={prev}
                disabled={isFirst}
                className="flex items-center gap-1 text-[12px] text-white/40 hover:text-white/70 disabled:opacity-0 transition-colors font-cinzel tracking-wider touch-manipulation"
              >
                <ChevronLeft size={13} /> VOLTAR
              </button>

              <div className="text-xs text-white/25 tracking-widest">
                {slide + 1} / {SLIDES.length}
              </div>

              <button
                onClick={next}
                className="flex items-center gap-1 text-[12px] text-primary hover:text-primary/80 transition-colors font-cinzel font-bold tracking-wider touch-manipulation"
              >
                {isLast ? 'COMEÇAR' : 'AVANÇAR'} <ChevronRight size={13} />
              </button>
            </div>

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
