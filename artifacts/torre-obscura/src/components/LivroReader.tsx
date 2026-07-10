// ─── LivroReader — leitor página-a-página do Livro da temporada ──────────────
// Costura os fragmentos PRINCIPAIS (Verdades + Habitantes) da temporada em um
// livro lido uma página por vez. Reusa os textos canônicos (paginasDoLivro) — não
// inventa lore. Aberto só quando o volume está completo (livroDaTemporadaDisponivel).

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { paginasDoLivro, CAPITULO_NOMES, TEMPORADAS } from '../lib/game-data';

export function LivroReader({ temporada, open, onClose }: { temporada: number; open: boolean; onClose: () => void }) {
  const paginas = paginasDoLivro(temporada);
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);

  const temp = TEMPORADAS[temporada];
  const pagina = paginas[Math.min(idx, paginas.length - 1)];
  const virar = (delta: number) => {
    const alvo = idx + delta;
    if (alvo < 0 || alvo >= paginas.length) return;
    setDir(delta);
    setIdx(alvo);
  };

  return (
    <Dialog.Root open={open} onOpenChange={o => { if (!o) { onClose(); setIdx(0); } }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/95 backdrop-blur-md z-[70]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-md max-h-[86vh] z-[70] outline-none">
          <div className="relative bg-gradient-to-b from-[#1E1B12] to-[#141109] border border-primary/40 rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden">
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

            {/* Página */}
            <div className="flex-1 overflow-hidden px-6 py-6 min-h-[340px] flex items-center">
              <AnimatePresence mode="wait" custom={dir}>
                {pagina && (
                  <motion.div
                    key={pagina.id}
                    custom={dir}
                    initial={{ opacity: 0, x: dir * 40, rotateY: dir * 8 }}
                    animate={{ opacity: 1, x: 0, rotateY: 0 }}
                    exit={{ opacity: 0, x: dir * -40, rotateY: dir * -8 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="w-full"
                  >
                    <div className="text-[10px] text-secondary/60 tracking-[0.3em] mb-1">
                      CAP. {pagina.capitulo} — {(CAPITULO_NOMES[pagina.capitulo] ?? '').toUpperCase()}
                    </div>
                    <h3 className="font-cinzel text-primary/90 text-base leading-tight mb-4">{pagina.titulo}</h3>
                    <p className="text-[13px] text-white/75 leading-relaxed italic first-letter:text-2xl first-letter:font-cinzel first-letter:text-primary first-letter:mr-1">
                      {pagina.texto}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Navegação */}
            <div className="flex items-center justify-between px-5 py-4 border-t border-primary/20 shrink-0">
              <button
                onClick={() => virar(-1)}
                disabled={idx === 0}
                className="w-10 h-10 flex items-center justify-center rounded-sm border border-primary/30 text-primary/70 disabled:opacity-25 disabled:cursor-not-allowed hover:border-primary/50 touch-manipulation"
                aria-label="Página anterior"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="text-[11px] text-secondary/70 tracking-[0.2em] font-cinzel">
                {idx + 1} / {paginas.length}
              </span>
              <button
                onClick={() => virar(1)}
                disabled={idx >= paginas.length - 1}
                className="w-10 h-10 flex items-center justify-center rounded-sm border border-primary/30 text-primary/70 disabled:opacity-25 disabled:cursor-not-allowed hover:border-primary/50 touch-manipulation"
                aria-label="Próxima página"
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
