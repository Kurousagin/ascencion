// ─── Host de toasts do feed de vida ──────────────────────────────────────────
// Drena state.toastsPendentes (eventos de alta importância: perda, traição,
// vitória, invasão, câmara) e os exibe como toasts SUTIS, um sobre o outro, com
// auto-dismiss. Dedupe por id (evita repetir em re-render). Estilo alinhado aos
// modais do jogo (framer-motion, acento por tipo). Montado uma vez no App.

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { visualDe } from './acontecimento-visual';
import type { Acontecimento } from '../lib/game-data';

const DURACAO_MS = 5000;

export function FeedToastHost() {
  const { state, reconhecerToasts } = useGame();
  const [visiveis, setVisiveis] = useState<Acontecimento[]>([]);
  const jaMostrados = useRef<Set<string>>(new Set());

  const pendentes = state?.toastsPendentes;

  useEffect(() => {
    if (!pendentes || pendentes.length === 0) return;
    const novos = pendentes.filter(a => !jaMostrados.current.has(a.id));
    if (novos.length > 0) {
      novos.forEach(a => jaMostrados.current.add(a.id));
      setVisiveis(v => [...v, ...novos].slice(-3)); // no máx. 3 visíveis
      novos.forEach(a => {
        setTimeout(() => setVisiveis(v => v.filter(x => x.id !== a.id)), DURACAO_MS);
      });
    }
    reconhecerToasts(); // esvazia a fila no estado (já ingerimos)
  }, [pendentes, reconhecerToasts]);

  const fechar = (id: string) => setVisiveis(v => v.filter(x => x.id !== id));

  return (
    <div className="fixed inset-x-0 bottom-24 z-[90] flex flex-col items-center gap-2 px-4 pointer-events-none">
      <AnimatePresence initial={false}>
        {visiveis.map(ac => {
          const v = visualDe(ac.tipo);
          return (
            <motion.div
              key={ac.id}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className={`pointer-events-auto w-full max-w-sm bg-[#141109]/95 backdrop-blur-sm border ${v.borda} rounded-sm shadow-lg shadow-black/40 px-3 py-2.5 flex items-start gap-2.5`}
            >
              <v.Icon size={16} className={`${v.cor} mt-0.5 shrink-0`} />
              <div className="min-w-0 flex-1">
                <div className={`text-[10px] tracking-[0.2em] ${v.cor} mb-0.5`}>{v.rotulo.toUpperCase()}</div>
                <div className="text-[12px] text-white/80 leading-snug">{ac.mensagem}</div>
              </div>
              <button
                onClick={() => fechar(ac.id)}
                className="text-white/30 hover:text-white/70 shrink-0 touch-manipulation"
                aria-label="Fechar"
              >
                <X size={13} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
