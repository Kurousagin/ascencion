// ─── CamaraDescobertaModal — janela dourada de descoberta de câmara secreta ──
// Dispara APÓS uma expedição/farm bem-sucedido em que o grupo, na volta, percebeu
// ter atingido o requisito para encontrar a câmara (fila state.camarasNovasDescobertas,
// consumida uma por vez). Estilo "revelação" (manhwa): conta a lore do andar/câmara
// e COMO ela foi encontrada, e então oferece explorar AGORA (mesmo grupo cansado da
// volta — mais arriscado) ou DEPOIS (montar uma incursão dedicada pela Torre). Só a
// câmara descoberta passa a ficar visível na Torre.

import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { DoorOpen, Clock, Sparkles, KeyRound } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { CAMARAS_SECRETAS } from '../lib/game-data';

export function CamaraDescobertaModal() {
  const { state, explorarCamaraSecreta, reconhecerCamaraDescoberta } = useGame();
  const camId = state?.camarasNovasDescobertas?.[0] ?? null;
  const cam = camId ? CAMARAS_SECRETAS[camId] : undefined;
  const open = !!cam;

  // Grupo do "explorar agora": os moradores da última expedição que ainda estão
  // aptos (vivos e não mobilizados). Se ninguém restou, só resta explorar depois.
  const grupoAgora = (state?.ultimaExpedicaoGrupo ?? []).filter(id => {
    const n = state?.npcs.find(x => x.id === id);
    return n && n.vivo && !n.emExpedicao && !n.emGuerra;
  });

  const explorarAgora = () => {
    if (!camId) return;
    explorarCamaraSecreta(camId, grupoAgora);
    reconhecerCamaraDescoberta();
  };

  return (
    <Dialog.Root open={open} onOpenChange={o => { if (!o) reconhecerCamaraDescoberta(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/92 backdrop-blur-md z-[80]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm z-[80] outline-none">
          {cam && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="relative bg-gradient-to-b from-[#1E1a10] to-[#141109] border border-primary/60 rounded-sm shadow-[0_0_50px_rgba(212,175,55,0.28)] overflow-hidden"
            >
              {/* Moldura dourada */}
              <div className="absolute inset-0 pointer-events-none rounded-sm ring-1 ring-inset ring-primary/25" />
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

              <div className="relative px-5 pt-6 pb-4 text-center">
                <motion.div
                  initial={{ rotate: -12, scale: 0.6, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 12 }}
                >
                  <KeyRound size={30} className="text-primary mx-auto mb-2 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                </motion.div>
                <div className="text-[9px] text-primary/70 tracking-[0.35em] mb-1">CÂMARA SECRETA DESCOBERTA</div>
                <Dialog.Title className="font-cinzel font-bold text-primary tracking-[0.15em] text-base leading-tight drop-shadow-[0_0_6px_rgba(212,175,55,0.4)]">
                  {cam.titulo}
                </Dialog.Title>
                <div className="text-[9px] text-primary/50 tracking-[0.25em] mt-1">
                  {cam.icone} ANDAR {cam.floor}
                </div>
              </div>

              <div className="p-5 pt-1 space-y-4">
                {/* Lore do andar / o que aconteceu */}
                <p className="text-[12px] text-white/75 italic leading-relaxed border-l-2 border-primary/40 pl-3">
                  "{cam.descricao}"
                </p>

                {/* Como foi encontrada (requisito narrado) */}
                <div className="flex items-start gap-2 bg-primary/5 border border-primary/20 rounded-sm px-3 py-2">
                  <Sparkles size={12} className="text-primary/80 mt-0.5 shrink-0" />
                  <div>
                    <div className="text-[8px] text-primary/60 tracking-[0.25em] mb-0.5">COMO FOI ENCONTRADA</div>
                    <div className="text-[10px] text-white/60 leading-relaxed">{cam.requisito.textoRequisito}</div>
                  </div>
                </div>

                {grupoAgora.length > 0 ? (
                  <>
                    <p className="text-[10px] text-primary/60 text-center leading-relaxed">
                      Explorar agora leva o mesmo grupo da volta — cansado, com mais risco.
                      Ou prepare uma incursão dedicada depois, pela Torre.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={explorarAgora}
                        className="w-full h-11 flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:brightness-110 font-cinzel font-bold tracking-[0.15em] rounded-sm text-sm touch-manipulation transition-all shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                      >
                        <DoorOpen size={16} /> EXPLORAR AGORA
                      </button>
                      <button
                        onClick={() => reconhecerCamaraDescoberta()}
                        className="w-full h-10 flex items-center justify-center gap-2 border border-primary/30 text-primary/70 hover:text-primary hover:border-primary/50 font-cinzel tracking-[0.15em] rounded-sm text-xs touch-manipulation transition-colors"
                      >
                        <Clock size={14} /> EXPLORAR DEPOIS
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-primary/60 text-center leading-relaxed">
                      A câmara agora aparece na Torre — prepare uma incursão dedicada para explorá-la.
                    </p>
                    <button
                      onClick={() => reconhecerCamaraDescoberta()}
                      className="w-full h-11 bg-primary text-primary-foreground hover:brightness-110 font-cinzel font-bold tracking-[0.2em] rounded-sm text-sm touch-manipulation transition-all shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                    >
                      ENTENDIDO
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
