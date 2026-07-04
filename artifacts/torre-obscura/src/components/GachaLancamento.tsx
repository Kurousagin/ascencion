import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as Dialog from '@radix-ui/react-dialog';
import type { NpcLancamento, LancamentoTemporada } from '../lib/lancamento';
import { useGame } from '../context/GameContext';
import { GACHA_LANCAMENTO_DONE, GACHA_LANCAMENTO_RESULT } from '../lib/onboarding-keys';
import { getDeviceId } from '../lib/alliance-identity';
import { checkPrimordialDisponivel, claimPrimordial } from '../lib/primordial-api';
import { PASSIVAS, type PassivaId } from '../lib/game-data';

interface Props {
  open: boolean;
  lancamento: LancamentoTemporada;
  onClose: () => void;
}

type Fase = 'ritual' | 'revelando' | 'lore' | 'stats';

function sortearNpc(lancamento: LancamentoTemporada, primordialDisponivel = true): NpcLancamento {
  if (primordialDisponivel && Math.random() < lancamento.chanceValdris) return lancamento.primordial;
  if (lancamento.vestigios?.length && lancamento.chanceVestigio && Math.random() < lancamento.chanceVestigio) {
    const pool = lancamento.vestigios;
    return pool[Math.floor(Math.random() * pool.length)];
  }
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
  const [primordialDisponivel, setPrimordialDisponivel] = useState(true);
  const [confirmando, setConfirmando] = useState(false);

  // Ao abrir: recupera resultado salvo (refresh mid-gacha) ou verifica disponibilidade
  // global do primordial antes de sortear — evita oferecer Valdris se já foi reivindicado.
  useEffect(() => {
    if (!open) return;

    const saved = localStorage.getItem(GACHA_LANCAMENTO_RESULT);
    if (saved) {
      try {
        const recuperado = JSON.parse(saved) as NpcLancamento;
        setNpcResultado(recuperado);
        setCartasViradas([true, true, true]);
        setFase('lore');
        return;
      } catch {
        localStorage.removeItem(GACHA_LANCAMENTO_RESULT);
      }
    }

    setFase('ritual');
    setCartasViradas([false, false, false]);
    setCartaEscolhida(null);
    setNpcResultado(null);

    // Verificar disponibilidade global do primordial antes de sortear.
    // Guard de unmount evita setState após o modal fechar.
    let mounted = true;
    const tipo = `primordial_t${lancamento.temporada}`;
    checkPrimordialDisponivel(tipo, getDeviceId()).then(disponivel => {
      if (!mounted) return;
      setPrimordialDisponivel(disponivel);
      const npc = sortearNpc(lancamento, disponivel);
      setNpcResultado(npc);
      localStorage.setItem(GACHA_LANCAMENTO_RESULT, JSON.stringify(npc));
    });
    return () => { mounted = false; };
  }, [open]);

  // Bloqueia clique enquanto o sorteio ainda não foi resolvido
  const escolherCarta = (idx: number) => {
    if (fase !== 'ritual' || cartaEscolhida !== null || !npcResultado) return;
    setCartaEscolhida(idx);
    setFase('revelando');
    const parcial = [false, false, false];
    parcial[idx] = true;
    setCartasViradas(parcial);
    setTimeout(() => setCartasViradas([true, true, true]), 500);
    setTimeout(() => setFase('lore'), 1400);
  };

  const confirmarLore = () => setFase('stats');

  const confirmarStats = async () => {
    if (!npcResultado || confirmando) return;
    setConfirmando(true);

    if (npcResultado.primordial) {
      // Tenta reivindicar atomicamente no servidor.
      const claimed = await claimPrimordial(`primordial_t${lancamento.temporada}`, getDeviceId());
      if (!claimed) {
        // Corrida: outro jogador reivindicou entre o check e o confirm.
        // Re-sorteia sem o primordial e mostra o novo resultado ao jogador.
        localStorage.removeItem(GACHA_LANCAMENTO_RESULT);
        const npc = sortearNpc(lancamento, false); // força pool sem primordial
        setNpcResultado(npc);
        localStorage.setItem(GACHA_LANCAMENTO_RESULT, JSON.stringify(npc));
        setFase('lore');
        setConfirmando(false);
        return;
      }
    }

    adicionarNpcLancamento(npcResultado);
    localStorage.setItem(GACHA_LANCAMENTO_DONE, '1');
    localStorage.removeItem(GACHA_LANCAMENTO_RESULT);
    onClose();
  };

  const isPrimordial = npcResultado?.primordial ?? false;
  const isVestigio   = npcResultado?.vestigio   ?? false;

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/97 backdrop-blur-xl z-[80]" />
        <Dialog.Content className="fixed inset-0 flex items-center justify-center z-[80] p-4 outline-none">
          <AnimatePresence mode="wait">

            {/* ── FASE: Ritual ─────────────────────────────────────────── */}
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
                    {fase === 'ritual' ? 'Três cartas. Escolha uma — só ela responderá.' : 'A Torre revela sua escolha…'}
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

            {/* ── FASE: Card de lore ───────────────────────────────────── */}
            {fase === 'lore' && npcResultado && (
              <motion.div key="lore"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm"
              >
                <div className={`rounded-sm border overflow-hidden ${
                  isPrimordial
                    ? 'border-primary shadow-[0_0_80px_rgba(212,175,55,0.25)] bg-gradient-to-b from-[#2A2010] via-[#1A1508] to-[#0E0D0B]'
                    : isVestigio
                    ? 'border-[#7A3D00]/60 shadow-[0_0_50px_rgba(255,140,0,0.18)] bg-gradient-to-b from-[#1E1008] via-[#140A04] to-[#0C0804]'
                    : 'border-[#3A5080] shadow-[0_0_40px_rgba(80,140,220,0.15)] bg-gradient-to-b from-[#0E1420] via-[#0C1118] to-[#080C12]'
                }`}>
                  <div className={`relative px-6 pt-8 pb-5 text-center border-b ${
                    isPrimordial ? 'border-primary/20' : isVestigio ? 'border-[#7A3D00]/30' : 'border-[#3A5080]/30'
                  }`}>
                    <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent to-transparent ${
                      isPrimordial ? 'via-primary/80' : isVestigio ? 'via-[#FF8C00]/60' : 'via-[#5090D0]/60'
                    }`} />

                    {/* Badge de raridade */}
                    {isPrimordial ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-[9px] text-primary/70 tracking-[0.3em] font-cinzel mb-2">
                        ✦ ÚNICO · PRIMORDIAL ✦
                      </motion.div>
                    ) : isVestigio ? (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-[9px] text-[#FF8C00]/70 tracking-[0.3em] font-cinzel mb-2">
                        ◈ VESTÍGIO · SOBREVIVENTE EXCEPCIONAL ◈
                      </motion.div>
                    ) : (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-[9px] text-[#5090D0]/70 tracking-[0.3em] font-cinzel mb-2">
                        ◆ RARO · SOBREVIVENTE MARCADO ◆
                      </motion.div>
                    )}

                    <h2 className={`font-cinzel font-bold tracking-[0.15em] leading-tight mb-1 ${
                      isPrimordial ? 'text-xl text-primary' : isVestigio ? 'text-lg text-[#FF8C00]' : 'text-base text-[#7DB0E8]'
                    }`}>
                      {npcResultado.nome}
                    </h2>
                    <p className={`text-[9px] tracking-widest ${
                      isPrimordial ? 'text-secondary/50' : isVestigio ? 'text-[#FF8C00]/50' : 'text-[#5090D0]/50'
                    }`}>
                      {npcResultado.titulo}
                    </p>
                  </div>

                  <div className="px-6 py-6 space-y-4">
                    {npcResultado.cardLore.map((p, i) => (
                      <motion.p key={i}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.15 }}
                        className={`text-[11px] leading-relaxed italic ${isPrimordial ? 'text-white/60' : 'text-white/50'}`}
                      >
                        {p}
                      </motion.p>
                    ))}
                    {npcResultado.cardLoreFinal && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 + npcResultado.cardLore.length * 0.15 + 0.3 }}
                        className={`text-[11px] font-cinzel tracking-wide text-center pt-2 border-t ${
                          isPrimordial
                            ? 'text-primary border-primary/20'
                            : isVestigio
                            ? 'text-[#FF8C00]/80 border-[#7A3D00]/30'
                            : 'text-[#7DB0E8]/70 border-[#3A5080]/30'
                        }`}
                      >
                        {npcResultado.cardLoreFinal}
                      </motion.p>
                    )}
                  </div>

                  <div className="px-6 pb-6">
                    <button
                      onClick={confirmarLore}
                      className={`w-full h-11 border font-cinzel text-[11px] tracking-[0.2em] transition-all touch-manipulation ${
                        isPrimordial
                          ? 'border-primary/50 text-primary hover:bg-primary/10'
                          : isVestigio
                          ? 'border-[#7A3D00]/50 text-[#FF8C00] hover:bg-[#7A3D00]/20'
                          : 'border-[#3A5080]/60 text-[#7DB0E8] hover:bg-[#1A2840]'
                      }`}
                    >
                      VER ATRIBUTOS
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── FASE: Stats + confirmar ──────────────────────────────── */}
            {fase === 'stats' && npcResultado && (
              <motion.div key="stats"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="w-full max-w-sm"
              >
                <div className={`rounded-sm border overflow-hidden ${
                  isPrimordial
                    ? 'border-primary shadow-[0_0_60px_rgba(212,175,55,0.15)] bg-gradient-to-b from-[#1C1808] to-[#0E0D0B]'
                    : isVestigio
                    ? 'border-[#7A3D00]/60 shadow-[0_0_40px_rgba(255,140,0,0.14)] bg-gradient-to-b from-[#1E1008] to-[#0C0804]'
                    : 'border-[#3A5080] shadow-[0_0_30px_rgba(80,140,220,0.1)] bg-gradient-to-b from-[#0E1420] to-[#080C12]'
                }`}>

                  {/* Header */}
                  <div className={`px-5 py-4 border-b flex items-center justify-between gap-2 ${
                    isPrimordial ? 'border-primary/20' : isVestigio ? 'border-[#7A3D00]/30' : 'border-[#3A5080]/30'
                  }`}>
                    <div className="min-w-0">
                      <div className={`font-cinzel font-bold text-sm truncate ${
                        isPrimordial ? 'text-primary' : isVestigio ? 'text-[#FF8C00]' : 'text-[#7DB0E8]'
                      }`}>
                        {npcResultado.nome}
                      </div>
                      <div className={`text-[9px] tracking-widest mt-0.5 ${
                        isPrimordial ? 'text-secondary/50' : isVestigio ? 'text-[#FF8C00]/50' : 'text-[#5090D0]/50'
                      }`}>
                        {npcResultado.titulo}
                      </div>
                    </div>

                    {/* Badge de raridade */}
                    {isPrimordial ? (
                      <div className="shrink-0 px-2 py-0.5 rounded-sm text-[9px] font-bold font-cinzel tracking-widest border bg-primary/20 border-primary/60 text-primary">
                        ÚNICO
                      </div>
                    ) : isVestigio ? (
                      <div className="shrink-0 px-2 py-0.5 rounded-sm text-[9px] font-bold font-cinzel tracking-widest border bg-[#7A3D00]/40 border-[#CC6B00]/60 text-[#FF8C00]">
                        VESTÍGIO
                      </div>
                    ) : (
                      <div className="shrink-0 px-2 py-0.5 rounded-sm text-[9px] font-bold font-cinzel tracking-widest border bg-[#1A2840] border-[#3A5080]/60 text-[#7DB0E8]">
                        RARO
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-4 divide-x divide-white/5 border-b border-white/5">
                    {[
                      { label: 'FOR', val: npcResultado.forca },
                      { label: 'AGI', val: npcResultado.agilidade },
                      { label: 'INT', val: npcResultado.inteligencia },
                      { label: 'RES', val: npcResultado.resistencia },
                    ].map(s => (
                      <div key={s.label} className="flex flex-col items-center py-3">
                        <div className="text-[8px] text-white/30 tracking-widest mb-0.5">{s.label}</div>
                        <div className={`text-base font-bold font-cinzel ${
                          isPrimordial ? 'text-primary' : isVestigio ? 'text-[#FF8C00]' : 'text-[#7DB0E8]'
                        }`}>
                          {s.val}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Habilidade + flags */}
                  <div className="px-5 py-3 flex flex-wrap gap-2 border-b border-white/5">
                    <div className={`flex items-center gap-1.5 text-[9px] ${
                      isPrimordial ? 'text-secondary/60' : isVestigio ? 'text-[#FF8C00]/60' : 'text-[#5090D0]/60'
                    }`}>
                      <div className={`w-[5px] h-[5px] rotate-45 shrink-0 ${
                        isPrimordial ? 'bg-primary/40' : isVestigio ? 'bg-[#FF8C00]/40' : 'bg-[#5090D0]/40'
                      }`} />
                      {npcResultado.habilidade.toUpperCase()}
                    </div>
                    {isPrimordial && (
                      <div className="flex items-center gap-1.5 text-[9px] text-primary/60">
                        <div className="w-[5px] h-[5px] rotate-45 bg-primary/40 shrink-0" />
                        IMORTAL — resistência à morte elevada
                      </div>
                    )}
                  </div>

                  {/* Passiva do vestígio */}
                  {isVestigio && npcResultado.passivaId && PASSIVAS[npcResultado.passivaId as PassivaId] && (() => {
                    const p = PASSIVAS[npcResultado.passivaId as PassivaId];
                    return (
                      <div className="px-5 py-3 border-b border-[#7A3D00]/20 bg-[#7A3D00]/5">
                        <div className="text-[9px] text-[#FF8C00]/60 tracking-widest mb-1 font-bold">
                          ◈ PASSIVA — {p.nome.toUpperCase()}
                        </div>
                        <div className="text-[10px] text-white/50 leading-relaxed">{p.descricao}</div>
                      </div>
                    );
                  })()}

                  {/* Nota de unicidade */}
                  <div className={`px-5 py-2.5 border-b text-[9px] leading-relaxed ${
                    isPrimordial
                      ? 'border-primary/10 text-primary/40 bg-primary/5'
                      : isVestigio
                      ? 'border-[#7A3D00]/15 text-[#FF8C00]/40 bg-[#7A3D00]/5'
                      : 'border-[#3A5080]/20 text-[#5090D0]/40 bg-[#0A1020]'
                  }`}>
                    {isPrimordial
                      ? '✦ Apenas um jogador no mundo pode receber este primordial por temporada.'
                      : isVestigio
                      ? '◈ Apenas alguns jogadores por temporada recebem um Vestígio.'
                      : '◆ Outros jogadores também podem ter recebido este sobrevivente.'}
                  </div>

                  {/* Ação */}
                  <div className="px-5 py-5">
                    <button
                      onClick={confirmarStats}
                      disabled={confirmando}
                      className={`w-full h-12 font-cinzel font-bold tracking-[0.2em] text-sm transition-all touch-manipulation disabled:opacity-60 ${
                        isPrimordial
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(212,175,55,0.3)]'
                          : isVestigio
                          ? 'bg-[#7A3D00]/70 hover:bg-[#7A3D00]/90 text-[#FF8C00] border border-[#CC6B00]/40 shadow-[0_0_20px_rgba(255,140,0,0.1)]'
                          : 'bg-[#1A3060] hover:bg-[#1F3870] text-[#7DB0E8] border border-[#3A5080]/60 shadow-[0_0_20px_rgba(80,140,220,0.1)]'
                      }`}
                    >
                      {confirmando ? 'REGISTRANDO…' : 'ACEITAR E INICIAR'}
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
