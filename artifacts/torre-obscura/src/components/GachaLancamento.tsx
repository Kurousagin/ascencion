import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import type { NpcLancamento, LancamentoTemporada } from '../lib/lancamento';
import { useGame } from '../context/GameContext';
import { GACHA_LANCAMENTO_DONE, GACHA_LANCAMENTO_RESULT } from '../lib/onboarding-keys';

interface Props {
  open: boolean;
  lancamento: LancamentoTemporada;
  onClose: () => void;
}

type Fase = 'ritual' | 'revelando' | 'lore' | 'stats';

function sortearNpc(lancamento: LancamentoTemporada): NpcLancamento {
  if (Math.random() < lancamento.chanceValdris) return lancamento.primordial;
  const pool = lancamento.marcados;
  return pool[Math.floor(Math.random() * pool.length)];
}

// Card giratório com flip CSS 3D
function CardRitual({ virado, delay = 0, onClick, ativo }: {
  virado: boolean; delay?: number; onClick?: () => void; ativo: boolean;
}) {
  return (
    <motion.div
      className="relative w-[88px] h-[128px] cursor-pointer select-none"
      style={{ perspective: 800 }}
      onClick={ativo ? onClick : undefined}
      whileTap={ativo ? { scale: 0.96 } : {}}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: virado ? 180 : 0 }}
        transition={{ duration: 0.7, delay, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Verso (fechado) */}
        <div
          className="absolute inset-0 rounded-sm border border-primary/40 bg-gradient-to-b from-[#1C1808] to-[#0E0D0B] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.1)]"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="w-6 h-6 rotate-45 border border-primary/50" />
        </div>
        {/* Frente (aberto) */}
        <div
          className="absolute inset-0 rounded-sm border border-primary/70 bg-gradient-to-b from-[#2A2010] to-[#0E0D0B] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="text-primary/80 text-2xl">✦</div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function GachaLancamento({ open, lancamento, onClose }: Props) {
  const { adicionarNpcLancamento } = useGame();
  const [fase, setFase] = useState<Fase>('ritual');
  const [cartasViradas, setCartasViradas] = useState([false, false, false]);
  const [npcResultado, setNpcResultado] = useState<NpcLancamento | null>(null);
  const [cartaEscolhida, setCartaEscolhida] = useState<number | null>(null);

  // Ao abrir: tenta recuperar resultado de um ritual incompleto (refresh mid-gacha).
  // Se não houver resultado salvo, sorteia agora e persiste para suportar refreshes.
  useEffect(() => {
    if (!open) return;

    const saved = localStorage.getItem(GACHA_LANCAMENTO_RESULT);
    if (saved) {
      try {
        const recuperado = JSON.parse(saved) as NpcLancamento;
        setNpcResultado(recuperado);
        setCartasViradas([true, true, true]);
        setFase('lore'); // Pula o ritual — resultado já conhecido
        return;
      } catch {
        localStorage.removeItem(GACHA_LANCAMENTO_RESULT);
      }
    }

    // Sorteio fresco: persiste antes de qualquer interação para garantir recovery
    const npc = sortearNpc(lancamento);
    setNpcResultado(npc);
    localStorage.setItem(GACHA_LANCAMENTO_RESULT, JSON.stringify(npc));
    setFase('ritual');
    setCartasViradas([false, false, false]);
    setCartaEscolhida(null);
  }, [open]);

  const escolherCarta = (idx: number) => {
    if (fase !== 'ritual' || cartaEscolhida !== null) return;
    setCartaEscolhida(idx);
    setFase('revelando');

    // Carta escolhida vira imediatamente; as outras após pequeno delay
    const parcial = [false, false, false];
    parcial[idx] = true;
    setCartasViradas(parcial);
    setTimeout(() => setCartasViradas([true, true, true]), 500);
    setTimeout(() => setFase('lore'), 1400);
  };

  const confirmarLore = () => setFase('stats');

  // Ordem correta: NPC adicionado → DONE gravado → RESULT limpo → fechar
  const confirmarStats = () => {
    if (!npcResultado) return;
    adicionarNpcLancamento(npcResultado);
    localStorage.setItem(GACHA_LANCAMENTO_DONE, '1');
    localStorage.removeItem(GACHA_LANCAMENTO_RESULT);
    onClose();
  };

  const isPrimordial = npcResultado?.primordial ?? false;

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/97 backdrop-blur-xl z-[80]" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[80] p-4 outline-none">
          <AnimatePresence mode="wait">

            {/* ── FASE: Ritual (escolha uma carta) ─────────────────────── */}
            {(fase === 'ritual' || fase === 'revelando') && (
              <motion.div key="ritual"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="w-full max-w-sm flex flex-col items-center gap-8"
              >
                <div className="text-center space-y-2">
                  <div className="w-1.5 h-1.5 rotate-45 bg-primary mx-auto mb-3 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
                  <Dialog.Title className="font-cinzel font-bold text-primary tracking-[0.2em] text-sm">
                    RITUAL EM TRINDADE
                  </Dialog.Title>
                  <p className="text-[10px] text-secondary/60 tracking-widest italic">
                    {fase === 'ritual' ? 'Escolha uma carta. A Torre decide.' : 'A Torre revela sua escolha…'}
                  </p>
                </div>

                <div className="flex gap-5 justify-center">
                  {[0, 1, 2].map(i => (
                    <CardRitual
                      key={i}
                      virado={cartasViradas[i]}
                      delay={cartaEscolhida !== null && i !== cartaEscolhida ? 0.3 : 0}
                      onClick={() => escolherCarta(i)}
                      ativo={fase === 'ritual'}
                    />
                  ))}
                </div>

                {fase === 'ritual' && (
                  <p className="text-[9px] text-white/20 tracking-widest text-center">
                    TOQUE EM UMA CARTA
                  </p>
                )}
              </motion.div>
            )}

            {/* ── FASE: Card de lore ────────────────────────────────────── */}
            {fase === 'lore' && npcResultado && (
              <motion.div key="lore"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm"
              >
                <div className={`rounded-sm border overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.2)] ${
                  isPrimordial
                    ? 'border-primary bg-gradient-to-b from-[#2A2010] via-[#1A1508] to-[#0E0D0B]'
                    : 'border-primary/40 bg-gradient-to-b from-[#1C1808] to-[#0E0D0B]'
                }`}>
                  <div className="relative px-6 pt-8 pb-5 text-center border-b border-primary/20">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
                    {isPrimordial && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-[9px] text-primary/60 tracking-[0.3em] font-cinzel mb-2"
                      >
                        ✦ PRIMORDIAL ✦
                      </motion.div>
                    )}
                    <h2 className={`font-cinzel font-bold tracking-[0.15em] leading-tight mb-1 ${
                      isPrimordial ? 'text-xl text-primary' : 'text-base text-primary/90'
                    }`}>
                      {npcResultado.nome}
                    </h2>
                    <p className="text-[9px] text-secondary/50 tracking-widest">
                      {npcResultado.titulo}
                    </p>
                  </div>

                  <div className="px-6 py-6 space-y-4">
                    {npcResultado.cardLore.map((p, i) => (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.15 }}
                        className="text-[11px] text-white/60 leading-relaxed italic"
                      >
                        {p}
                      </motion.p>
                    ))}
                    {npcResultado.cardLoreFinal && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + npcResultado.cardLore.length * 0.15 + 0.3 }}
                        className="text-[11px] text-primary font-cinzel tracking-wide text-center pt-2 border-t border-primary/20"
                      >
                        {npcResultado.cardLoreFinal}
                      </motion.p>
                    )}
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      onClick={confirmarLore}
                      className="w-full h-11 border border-primary/50 text-primary font-cinzel text-[11px] tracking-[0.2em] hover:bg-primary/10 transition-all touch-manipulation"
                    >
                      VER ATRIBUTOS
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── FASE: Stats + confirmar ───────────────────────────────── */}
            {fase === 'stats' && npcResultado && (
              <motion.div key="stats"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-sm"
              >
                <div className={`rounded-sm border overflow-hidden shadow-[0_0_60px_rgba(212,175,55,0.15)] ${
                  isPrimordial ? 'border-primary' : 'border-primary/40'
                } bg-gradient-to-b from-[#1C1808] to-[#0E0D0B]`}>
                  <div className="px-5 py-4 border-b border-primary/20 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-cinzel font-bold text-primary text-sm truncate">{npcResultado.nome}</div>
                      <div className="text-[9px] text-secondary/50 tracking-widest mt-0.5">{npcResultado.titulo}</div>
                    </div>
                    <div className={`shrink-0 px-2 py-0.5 rounded-sm text-[9px] font-bold font-cinzel tracking-widest border ${
                      isPrimordial
                        ? 'bg-primary/20 border-primary/60 text-primary'
                        : 'bg-white/5 border-white/20 text-white/60'
                    }`}>
                      ÉPICO
                    </div>
                  </div>

                  <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5">
                    {[
                      { label: 'FOR', val: npcResultado.forca },
                      { label: 'AGI', val: npcResultado.agilidade },
                      { label: 'INT', val: npcResultado.inteligencia },
                      { label: 'RES', val: npcResultado.resistencia },
                    ].map(s => (
                      <div key={s.label} className="flex flex-col items-center py-3">
                        <div className="text-[8px] text-white/30 tracking-widest mb-0.5">{s.label}</div>
                        <div className="text-base font-bold text-primary font-cinzel">{s.val}</div>
                      </div>
                    ))}
                  </div>

                  <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-white/5">
                    <div className="flex items-center gap-1.5 text-[9px] text-secondary/60">
                      <div className="w-[5px] h-[5px] rotate-45 bg-primary/40 shrink-0" />
                      {npcResultado.habilidade.toUpperCase()}
                    </div>
                    {isPrimordial && (
                      <div className="flex items-center gap-1.5 text-[9px] text-primary/60">
                        <div className="w-[5px] h-[5px] rotate-45 bg-primary/40 shrink-0" />
                        IMORTAL — resistência à morte elevada
                      </div>
                    )}
                  </div>

                  <div className="px-5 py-5">
                    <button
                      onClick={confirmarStats}
                      className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-cinzel font-bold tracking-[0.2em] text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] touch-manipulation"
                    >
                      ACEITAR E INICIAR
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
