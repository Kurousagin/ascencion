// ─── CamaraDescobertaModal — evento ao revelar uma câmara secreta ────────────
// Aparece quando o processDay descobre uma câmara (requisito atingido), chamando
// a atenção do jogador. Oferece explorar AGORA (com o mesmo grupo que acabou de
// conquistar — cansado, mais arriscado) ou DEPOIS (montar um grupo dedicado no
// Tower). A narrativa vem de CAMARAS_SECRETAS (lore da câmara). A fila
// state.camarasNovasDescobertas é consumida uma câmara por vez.

import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { DoorClosed, DoorOpen, Clock } from 'lucide-react';
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
        <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-[80]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm z-[80] outline-none">
          {cam && (
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="bg-gradient-to-b from-[#1A1F2E] to-[#161B22] border border-secondary/50 rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              <div className="relative px-5 pt-6 pb-4 text-center border-b border-secondary/20">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-secondary/80 to-transparent" />
                <DoorClosed size={30} className="text-secondary mx-auto mb-2" />
                <Dialog.Title className="font-cinzel font-bold text-secondary tracking-[0.2em] text-sm">
                  CÂMARA SECRETA REVELADA
                </Dialog.Title>
                <div className="text-[9px] text-secondary/60 tracking-[0.25em] mt-1">
                  {cam.titulo.toUpperCase()} · ANDAR {cam.floor}
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-[12px] text-white/70 italic leading-relaxed">"{cam.descricao}"</p>

                {grupoAgora.length > 0 ? (
                  <>
                    <p className="text-[10px] text-secondary/70 text-center leading-relaxed">
                      Explorar agora leva o mesmo grupo da conquista — cansado, com mais risco.
                      Ou prepare uma incursão dedicada depois, pela Torre.
                    </p>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={explorarAgora}
                        className="w-full h-11 flex items-center justify-center gap-2 bg-secondary/20 border border-secondary/50 text-secondary hover:bg-secondary/30 font-cinzel font-bold tracking-[0.15em] rounded-sm text-sm touch-manipulation transition-colors"
                      >
                        <DoorOpen size={16} /> EXPLORAR AGORA
                      </button>
                      <button
                        onClick={() => reconhecerCamaraDescoberta()}
                        className="w-full h-10 flex items-center justify-center gap-2 border border-card-border text-white/50 hover:text-white/80 font-cinzel tracking-[0.15em] rounded-sm text-xs touch-manipulation transition-colors"
                      >
                        <Clock size={14} /> EXPLORAR DEPOIS
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] text-secondary/70 text-center leading-relaxed">
                      Prepare uma incursão dedicada pela Torre para explorar esta câmara.
                    </p>
                    <button
                      onClick={() => reconhecerCamaraDescoberta()}
                      className="w-full h-11 bg-secondary/20 border border-secondary/50 text-secondary hover:bg-secondary/30 font-cinzel font-bold tracking-[0.2em] rounded-sm text-sm touch-manipulation transition-colors"
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
