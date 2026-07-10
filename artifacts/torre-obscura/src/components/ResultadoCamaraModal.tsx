// ─── ResultadoCamaraModal — desfecho de uma exploração de câmara secreta ─────
// Global: aparece sempre que ultimoResultadoCamara != null, seja a exploração
// disparada pelo "explorar agora" (modal de descoberta) ou pelo "explorar depois"
// (modal da câmara no Tower). A narrativa vem de CAMARAS_SECRETAS (lore da câmara).

import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import { Sparkles, Skull, BookOpen } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { camarasDaTorre } from '../floor-engine';

export function ResultadoCamaraModal() {
  const { state, ultimoResultadoCamara, limparResultadoCamara } = useGame();
  const res = ultimoResultadoCamara;
  const cam = res && state ? camarasDaTorre(state)[res.camaraId] : undefined;
  const open = !!(res && cam);

  return (
    <Dialog.Root open={open} onOpenChange={o => { if (!o) limparResultadoCamara(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-[85]" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm z-[85] outline-none">
          {res && cam && (() => {
            const r = cam.resultado;
            const recompStr = res.recompensas.join(' · ');
            const cor = res.sucesso ? 'primary' : 'destructive';
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`bg-gradient-to-b from-[#1A1F2E] to-[#161B22] border rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden ${res.sucesso ? 'border-primary/50' : 'border-destructive/50'}`}
              >
                <div className={`relative px-5 pt-6 pb-4 text-center border-b ${res.sucesso ? 'border-primary/20' : 'border-destructive/20'}`}>
                  <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent ${res.sucesso ? 'via-primary/80' : 'via-destructive/80'}`} />
                  <div className="text-3xl mb-2">{res.sucesso ? cam.icone : '☠'}</div>
                  <Dialog.Title className={`font-cinzel font-bold tracking-[0.2em] text-sm text-${cor}`}>
                    {res.sucesso ? cam.titulo.toUpperCase() : 'A CÂMARA RESISTIU'}
                  </Dialog.Title>
                  <div className="text-xs text-secondary/60 tracking-[0.25em] mt-1">
                    ANDAR {cam.floor} · PODER {res.poder.toFixed(1)} / {res.dificuldade}
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  <p className="text-[12px] text-white/70 italic leading-relaxed">
                    "{res.sucesso ? r.sucessoTexto : r.falhaTexto}"
                  </p>

                  {res.sucesso && r.loreGanho && (
                    <div className="rounded-sm p-4 border border-primary/30 bg-primary/5">
                      <div className="text-xs text-primary/60 tracking-widest mb-2 flex items-center gap-1">
                        <BookOpen size={9} /> PÁGINA RECUPERADA
                      </div>
                      <div className="text-[12px] text-primary/50 mb-1 font-cinzel">{r.loreGanho.titulo}</div>
                      <p className="text-[12px] text-white/60 italic leading-relaxed">{r.loreGanho.texto}</p>
                    </div>
                  )}

                  {res.sucesso && recompStr && (
                    <div className="rounded-sm p-3 border border-success/30 bg-success/5">
                      <div className="text-xs text-success/70 tracking-widest mb-1 flex items-center gap-1">
                        <Sparkles size={9} /> RECOMPENSAS
                      </div>
                      <p className="text-[12px] text-success/80 leading-relaxed">{recompStr}</p>
                    </div>
                  )}

                  {!res.sucesso && res.mortos.length > 0 && (
                    <div className="rounded-sm p-3 border border-destructive/30 bg-destructive/5 flex items-start gap-2">
                      <Skull size={12} className="text-destructive mt-0.5 shrink-0" />
                      <p className="text-[12px] text-destructive/80 leading-relaxed">
                        Perdidos: {res.mortos.join(', ')}.
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => limparResultadoCamara()}
                    className={`w-full h-11 font-cinzel font-bold tracking-[0.2em] rounded-sm text-sm touch-manipulation transition-colors ${res.sucesso ? 'bg-primary text-primary-foreground' : 'bg-destructive/20 border border-destructive/50 text-destructive hover:bg-destructive/30'}`}
                  >
                    FECHAR
                  </button>
                </div>
              </motion.div>
            );
          })()}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
