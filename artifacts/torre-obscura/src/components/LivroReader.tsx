// ─── LivroReader — leitor do Livro da temporada (narrativa contínua) ─────────
// Apresenta a história principal como um LIVRO: um capítulo por vez, com os textos
// canônicos dos fragmentos principais (Verdades + Habitantes) fluindo como prosa
// contínua — não passagens isoladas. Reusa o conteúdo (capitulosDoLivro), sem
// inventar lore. Aberto só quando o volume está completo.

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { TEMPORADAS } from '../lib/game-data';
import { livroDaTemporada } from '../lib/livros-content';

export function LivroReader({ temporada, open, onClose }: { temporada: number; open: boolean; onClose: () => void }) {
  const capitulos = livroDaTemporada(temporada);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const temp = TEMPORADAS[temporada];
  const cap = capitulos[Math.min(idx, capitulos.length - 1)];
  const virar = (delta: number) => {
    const alvo = idx + delta;
    if (alvo < 0 || alvo >= capitulos.length) return;
    setDir(delta);
    setIdx(alvo);
  };

  return (
    <Dialog.Root open={open} onOpenChange={o => { if (!o) { onClose(); setIdx(0); } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/95 backdrop-blur-md z-[70]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-md max-h-[88vh] z-[70] outline-none">
          <div className="relative bg-gradient-to-b from-[#1E1B12] to-[#141109] border border-primary/40 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden max-h-[88vh]">
            {/* Header — volume */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-primary/20 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <BookOpen size={15} className="text-primary shrink-0" />
                <div className="min-w-0">
                  <Dialog.Title className="font-cinzel font-bold text-primary tracking-[0.15em] text-sm leading-tight truncate">
                    {temp ? temp.nome.toUpperCase() : `VOLUME ${temporada}`}
                  </Dialog.Title>
                  <div className="text-[10px] text-primary/50 tracking-[0.25em]">O LIVRO · VOL. {temporada}</div>
                </div>
              </div>
              <Dialog.Close asChild>
                <button className="w-8 h-8 flex items-center justify-center border border-card-border text-secondary hover:text-foreground rounded-sm touch-manipulation shrink-0">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>

            {/* Capítulo — prosa contínua, rolável */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-6 min-h-[320px]">
              <AnimatePresence mode="wait" custom={dir}>
                {cap && (
                  <motion.div
                    key={cap.capitulo}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: dir * -40 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <div className="text-center mb-5">
                      <div className="text-[10px] text-secondary/60 tracking-[0.35em] mb-1">CAPÍTULO {cap.capitulo}</div>
                      <h3 className="font-cinzel text-primary/90 text-lg leading-tight">{cap.nome}</h3>
                      <div className="mx-auto mt-3 w-16 h-px bg-primary/30" />
                    </div>
                    <div className="space-y-3">
                      {cap.paragrafos.map((p, i) => (
                        <p
                          key={i}
                          className={`text-[13px] text-white/80 leading-[1.7] text-justify ${
                            i === 0 ? 'first-letter:text-3xl first-letter:font-cinzel first-letter:text-primary first-letter:mr-1 first-letter:float-left first-letter:leading-[0.9]' : ''
                          }`}
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navegação — capítulo a capítulo */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-primary/20 shrink-0">
              <button
                onClick={() => virar(-1)}
                disabled={idx === 0}
                className="w-10 h-10 flex items-center justify-center rounded-sm border border-primary/30 text-primary/70 disabled:opacity-25 disabled:cursor-not-allowed hover:border-primary/50 touch-manipulation"
                aria-label="Capítulo anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-xs text-secondary/70 tracking-[0.2em] font-cinzel">
                CAP. {idx + 1} / {capitulos.length}
              </span>
              <button
                onClick={() => virar(1)}
                disabled={idx >= capitulos.length - 1}
                className="w-10 h-10 flex items-center justify-center rounded-sm border border-primary/30 text-primary/70 disabled:opacity-25 disabled:cursor-not-allowed hover:border-primary/50 touch-manipulation"
                aria-label="Próximo capítulo"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
