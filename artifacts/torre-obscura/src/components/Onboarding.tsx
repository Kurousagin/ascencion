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
      'Você controla uma cidadela de sobreviventes no sopé de uma Torre sem fim. Eles vivem, trabalham e morrem — você observa e decide.',
      'Seu objetivo: conquistar os 20 andares da Torre e desvendar os segredos que dormem lá dentro.',
    ],
  },
  {
    icone: '🗼',
    titulo: 'A Torre',
    subtitulo: 'Cada andar é um desafio.',
    corpo: [
      'Envie grupos de moradores em expedições. Poder de combate, fadiga e moral determinam a chance de vitória.',
      'Cada 5 andares tem um Chefe que guarda um Eco do Capítulo — fragmento de lore e bônus de loot permanente.',
    ],
    dica: 'Comece devagar: não arrisque todos os seus melhores moradores de uma vez.',
  },
  {
    icone: '🏰',
    titulo: 'A Cidadela',
    subtitulo: 'Construa para sobreviver.',
    corpo: [
      'Construa edifícios para produzir comida, recuperar fadiga, elevar moral e aumentar o limite de população.',
      'Sem comida, moradores morrem. Sem moral, trairão. Gerencie os dois.',
      'Ter mais moradores do que o Alojamento suporta gera superlotação: consumo extra de comida, decaimento de sanidade e lealdade, e fadiga que nunca recupera.',
    ],
    dica: 'Fazenda e Fogueira primeiro. Alojamento quando quiser recrutar mais moradores.',
  },
  {
    icone: '⚔️',
    titulo: 'Os Moradores',
    subtitulo: 'Cada um é único.',
    corpo: [
      'Recrute sobreviventes via Ritual em Trindade (3 por ritual). Raridades: Comum → Incomum → Raro → Épico. Primordiais de temporada são Lendários — acima de qualquer gacha.',
      'Cada morador tem atributos, habilidade especial e status de lealdade e fadiga. Atribua postos em edifícios para bônus passivos.',
    ],
    dica: 'Lealdade baixa gera traição. Fadiga alta reduz poder de combate.',
  },
  {
    icone: '✦',
    titulo: 'Os Habitantes',
    subtitulo: 'Espíritos dos andares conquistados.',
    corpo: [
      'Cada andar não-chefe abriga um Habitante — uma entidade que propõe uma quest.',
      'Conclua a quest para ativar um Eco permanente de loot naquele andar e desbloquear um fragmento no Codex.',
    ],
    dica: 'Na aba Torre, toque o ícone de habitante em cada andar já conquistado.',
  },
  {
    icone: '📖',
    titulo: 'Codex Obscuro',
    subtitulo: '41 fragmentos de lore para colecionar.',
    corpo: [
      'Desbloqueie fragmentos conquistando andares, completando quests de Habitantes e durante expedições (15% de chance por vitória).',
      'Complete todos os 16 Habitantes para revelar a Verdade da Temporada — o segredo mais profundo da Torre.',
    ],
    dica: 'O ícone 📖 no topo da Torre pisca em dourado quando há fragmento novo.',
  },
  {
    icone: '⚡',
    titulo: 'Alianças e Guerra',
    subtitulo: 'Você não está sozinho.',
    corpo: [
      'Forme alianças com até 3 outras cidadelas. Troque moradores emprestados e envie reforços para expedições.',
      'Cidadelas rivais podem declarar guerra. Mobilize seus melhores combatentes antes do prazo acabar.',
    ],
    dica: 'Alianças aparecem na aba ⚔ do menu inferior.',
  },
  {
    icone: '✦',
    titulo: 'Pronto, Observador.',
    subtitulo: 'A Torre aguarda o seu olhar.',
    corpo: [
      'Você tem tudo que precisa para começar. Tome decisões difíceis — cada morador importa.',
      'A Torre não perdoa despreparados.',
    ],
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

            {/* Conteúdo */}
            <div className="p-6 pt-5 min-h-[310px] flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -18 }}
                  transition={{ duration: 0.18 }}
                  className="flex-1 flex flex-col"
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
