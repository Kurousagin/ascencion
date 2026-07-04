import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import type { LancamentoTemporada } from '../lib/lancamento';

interface Props {
  open: boolean;
  lancamento: LancamentoTemporada;
  onReceberBonus: () => void;
  onClose: () => void;
}

const RARIDADE_LABEL: Record<string, string> = {
  'Épico':   'ÉPICO',
  'Raro':    'RARO',
  'Incomum': 'INCOMUM',
  'Comum':   'COMUM',
};

export function LancamentoModal({ open, lancamento, onReceberBonus, onClose }: Props) {
  const { npcEspecial: npc, bonusRecursos, bonusMoral } = lancamento;

  const handleReceber = () => {
    onReceberBonus();
    onClose();
  };

  const recursos: { label: string; valor: number; emoji: string }[] = [
    ...(bonusRecursos.comida  ? [{ label: 'Comida',  valor: bonusRecursos.comida,  emoji: '🌾' }] : []),
    ...(bonusRecursos.madeira ? [{ label: 'Madeira', valor: bonusRecursos.madeira, emoji: '🪵' }] : []),
    ...(bonusRecursos.pedra   ? [{ label: 'Pedra',   valor: bonusRecursos.pedra,   emoji: '🪨' }] : []),
    ...(bonusRecursos.ferro   ? [{ label: 'Ferro',   valor: bonusRecursos.ferro,   emoji: '⚙️' }] : []),
    ...(bonusMoral            ? [{ label: 'Moral',   valor: bonusMoral,            emoji: '✦'  }] : []),
  ];

  return (
    <Dialog.Root open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/97 backdrop-blur-lg z-[70]" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[70] p-4 outline-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="w-full max-w-sm bg-gradient-to-b from-[#1C1808] via-[#14120A] to-[#0E0D0B] border border-primary/50 rounded-sm shadow-[0_0_80px_rgba(212,175,55,0.15)] overflow-hidden"
          >
            {/* Banner de temporada */}
            <div className="relative px-6 pt-8 pb-5 text-center border-b border-primary/20">
              {/* Linhas decorativas */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent" />
              <div className="w-1.5 h-1.5 rotate-45 bg-primary mx-auto mb-3 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <Dialog.Title className="font-cinzel font-bold text-primary tracking-[0.2em] text-sm leading-tight mb-1">
                {lancamento.titulo}
              </Dialog.Title>
              <p className="text-[10px] text-secondary/70 tracking-[0.2em] italic">
                {lancamento.subtitulo}
              </p>
            </div>

            {/* Descrição */}
            <div className="px-6 pt-5 space-y-2">
              {lancamento.descricao.map((p, i) => (
                <p key={i} className="text-[11px] text-white/55 leading-relaxed text-center">{p}</p>
              ))}
            </div>

            {/* Card do NPC especial */}
            <div className="mx-5 mt-5 rounded-sm border border-primary/50 bg-black/50 overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.08)]">
              {/* Header do NPC */}
              <div className="px-4 py-3 border-b border-primary/20 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-cinzel font-bold text-primary text-sm truncate">{npc.nome}</div>
                  <div className="text-[9px] text-secondary/60 tracking-widest mt-0.5">{npc.titulo}</div>
                </div>
                <div className="shrink-0 px-2 py-0.5 bg-primary/10 border border-primary/40 rounded-sm text-[9px] text-primary font-bold font-cinzel tracking-widest">
                  {RARIDADE_LABEL['Épico']}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5">
                {[
                  { label: 'FOR', val: npc.forca },
                  { label: 'AGI', val: npc.agilidade },
                  { label: 'INT', val: npc.inteligencia },
                  { label: 'RES', val: npc.resistencia },
                ].map(s => (
                  <div key={s.label} className="flex flex-col items-center py-2">
                    <div className="text-[8px] text-white/30 tracking-widest mb-0.5">{s.label}</div>
                    <div className="text-sm font-bold text-primary font-cinzel">{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Lore */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-[6px] h-[6px] rotate-45 bg-primary/50 shrink-0" />
                  <div className="text-[9px] text-primary/50 tracking-widest font-cinzel">IMORTAL — resistência a morte drasticamente elevada</div>
                </div>
                <p className="text-[10px] text-white/45 italic leading-relaxed border-l border-primary/20 pl-3">
                  {npc.descricao}
                </p>
              </div>
            </div>

            {/* Bônus de recursos */}
            <div className="mx-5 mt-3 mb-5">
              <div className="text-[9px] text-secondary/50 tracking-[0.2em] mb-2 text-center">BÔNUS DE LANÇAMENTO</div>
              <div className="flex flex-wrap justify-center gap-2">
                {recursos.map(r => (
                  <div key={r.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 border border-white/10 rounded-sm">
                    <span className="text-[12px] leading-none">{r.emoji}</span>
                    <div>
                      <div className="text-[8px] text-white/30 tracking-widest">{r.label.toUpperCase()}</div>
                      <div className="text-[12px] font-bold text-white/80 font-cinzel leading-none">+{r.valor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ação */}
            <div className="px-5 pb-6">
              <button
                onClick={handleReceber}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-cinzel font-bold tracking-[0.2em] text-sm transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] touch-manipulation"
              >
                RECEBER BÔNUS E INICIAR
              </button>
            </div>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
