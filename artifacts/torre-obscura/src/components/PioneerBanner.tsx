// ─── PioneerBanner — notificações do sistema Pioneer ─────────────────────────
// Dois componentes:
//   <PioneerPessoal>   — para quem foi um dos primeiros a chegar ao Andar 20
//   <T2GlobalBanner>   — banner global quando T2 desbloqueia (10 pioneers)

import { motion, AnimatePresence } from 'framer-motion';
import type { PioneerState } from '../hooks/usePioneer';

interface PessoalProps {
  posicao: number;
  visible: boolean;
  onDismiss: () => void;
}

// Notificação pessoal: aparece apenas para quem está entre os top 10 pioneers.
export function PioneerPessoal({ posicao, visible, onDismiss }: PessoalProps) {
  const ePrimeiro = posicao === 1;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="pioneer-pessoal"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4 }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[90] w-full max-w-sm px-4"
        >
          <div className="rounded-sm border border-primary/60 bg-gradient-to-b from-[#2A2010] to-[#0E0D0B] shadow-[0_0_40px_rgba(212,175,55,0.25)] overflow-hidden">
            <div className="relative px-5 py-4">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-primary/60 tracking-[0.25em] font-cinzel mb-1">
                    {ePrimeiro ? '✦ PRIMEIRO PIONEER ✦' : `✦ PIONEER Nº ${posicao} ✦`}
                  </div>
                  <p className="text-[12px] text-white/80 leading-relaxed">
                    {ePrimeiro
                      ? 'Você é o primeiro a alcançar este ponto. A Torre percebe. Algo na estrutura muda — levemente — ao reconhecer sua presença aqui.'
                      : `Você está entre os ${posicao === 10 ? 'últimos do primeiro grupo' : `primeiros ${posicao}`} a alcançar o vigésimo andar. A Torre registra sua chegada.`}
                  </p>
                </div>
                <button
                  onClick={onDismiss}
                  className="shrink-0 text-white/30 hover:text-white/60 transition-colors text-lg leading-none mt-0.5"
                  aria-label="Fechar"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface GlobalProps {
  nomes: string[];
  visible: boolean;
  onDismiss: () => void;
}

// Banner global: aparece para TODOS quando T2 é desbloqueado.
export function T2GlobalBanner({ nomes, visible, onDismiss }: GlobalProps) {
  // Formatar lista de nomes: "X, Y e Z alcançaram..."
  const formatarNomes = (ns: string[]): string => {
    if (ns.length === 0) return 'Os Pioneers';
    if (ns.length === 1) return ns[0];
    if (ns.length === 2) return `${ns[0]} e ${ns[1]}`;
    const ultimos = ns.slice(-2);
    const resto = ns.slice(0, -2);
    return `${resto.join(', ')}, ${ultimos[0]} e ${ultimos[1]}`;
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="t2-banner"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
        >
          <div className="w-full max-w-sm rounded-sm border border-[#5090D0]/60 bg-gradient-to-b from-[#0E1420] via-[#0A1018] to-[#070A10] shadow-[0_0_80px_rgba(80,144,208,0.2)] overflow-hidden">
            <div className="relative px-6 pt-8 pb-6 text-center">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#5090D0]/70 to-transparent" />

              <div className="text-[11px] text-[#5090D0]/70 tracking-[0.3em] font-cinzel mb-3">
                ◆ EVENTO GLOBAL ◆
              </div>

              <h2 className="font-cinzel font-bold text-[#7DB0E8] text-lg tracking-[0.1em] leading-tight mb-2">
                OS PIONEERS CHEGARAM
              </h2>

              <div className="text-[12px] text-[#5090D0]/50 tracking-widest mb-5">
                TEMPORADA II — O INTERVALO
              </div>

              <p className="text-[12px] text-white/50 leading-relaxed mb-3 italic">
                {formatarNomes(nomes.slice(0, 3))}{nomes.length > 3 ? ` e outros ${nomes.length - 3}` : ''} alcançaram os requisitos para despertar os mistérios além do vigésimo andar.
              </p>

              <p className="text-[12px] text-[#7DB0E8]/70 leading-relaxed mb-6">
                Novos ecos liberados. O Intervalo começa. A Torre revela o que sempre esteve antes de si.
              </p>

              {nomes.length > 0 && (
                <div className="border border-[#3A5080]/30 rounded-sm p-3 mb-5 text-left">
                  <div className="text-[10px] text-[#5090D0]/50 tracking-widest mb-2">PIONEERS</div>
                  <div className="flex flex-wrap gap-1.5">
                    {nomes.map((n, i) => (
                      <span key={i} className="text-[11px] text-[#7DB0E8]/70 bg-[#1A2840] px-2 py-0.5 rounded-sm border border-[#3A5080]/30">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={onDismiss}
                className="w-full h-11 border border-[#3A5080]/60 text-[#7DB0E8] font-cinzel text-[12px] tracking-[0.2em] hover:bg-[#1A2840] transition-all touch-manipulation"
              >
                CONTINUAR
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
