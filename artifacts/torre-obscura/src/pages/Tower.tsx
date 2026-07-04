import { useState, useEffect } from 'react';
import { useGame, ExpeditionResult } from '../context/GameContext';
import { FLOORS, BIOMA_META, CAPITULO_NOMES, calcNpcPower, calcBiomaMultiplier, getEfeitos, calcRecompensaAndar, calcCustoExpedicao, getProfissao, HABITANTES, BOSS_ECO_LORE, verificarQuestAndar, CODEX_FRAGMENTOS, TEMPORADAS, SUSSURROS_POR_CAPITULO, totalFragmentosTemporada, FragmentoCodex, capituloDoAndar } from '../lib/game-data';
import { Skull, ChevronUp, Swords, Wheat, Check, X, Trees, Mountain, Zap, Shield, RotateCcw, Sparkles, UserPlus, BookOpen } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';

interface TowerProps {
  t2Desbloqueado: boolean;
  pioneerPosicao: number | null;
  pioneersTotal: number;
}

export function Tower({ t2Desbloqueado, pioneerPosicao, pioneersTotal }: TowerProps) {
  const { state, sendExpedition, lastExpeditionResult, clearExpeditionResult, interagirHabitante, abrirCodex } = useGame();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNpcs, setSelectedNpcs] = useState<string[]>([]);
  // null = modo avançar (andar atual); número = modo exploração (farm de andar passado)
  const [farmAndar, setFarmAndar] = useState<number | null>(null);
  // Modal do habitante — qual andar está aberto
  const [habitanteModalFloor, setHabitanteModalFloor] = useState<number | null>(null);
  // Modal do Codex Obscuro
  const [codexOpen, setCodexOpen] = useState(false);
  // Capítulo expandido no Codex (1-4); null = todos colapsados
  const [codexCapExpanded, setCodexCapExpanded] = useState<number | null>(1);

  // Quando o andar avança, sai do modo farm automaticamente.
  useEffect(() => { setFarmAndar(null); }, [state.andarAtual]);

  // Auto-selecionar reforços ao abrir o modal.
  useEffect(() => {
    if (modalOpen) {
      const reforcoIds = state.npcs
        .filter(n => n.vivo && !n.emExpedicao && n.fadiga < 90 && n.reforco && !n.reforcoConcluido)
        .map(n => n.id);
      if (reforcoIds.length > 0) {
        setSelectedNpcs(prev => Array.from(new Set([...prev, ...reforcoIds])));
      }
    }
  }, [modalOpen]);

  const isFarming = farmAndar !== null;
  // Trava de T2: enquanto T2 não desbloqueado globalmente e não está em modo farm, mostra tela de espera.
  const aguardandoT2 = !isFarming && state.andarAtual > 20 && !t2Desbloqueado;
  const targetAndar = isFarming ? farmAndar! : state.andarAtual;
  const floorData = FLOORS[targetAndar - 1];
  const isBoss = floorData?.isBoss;

  const ef = getEfeitos(state.edificios);
  const recompensa = floorData ? calcRecompensaAndar(floorData.floor, floorData.bioma) : null;
  const biomaInfo = floorData ? BIOMA_META[floorData.bioma] : null;

  const eligibles = state.npcs.filter(n => n.vivo && !n.emExpedicao && !n.emGuerra && n.fadiga < 90);

  const cost = calcCustoExpedicao(selectedNpcs.length, floorData?.tier || 1);
  const canAfford = state.recursos.comida >= cost;

  const group = state.npcs.filter(n => selectedNpcs.includes(n.id));
  const basePower = group.reduce((sum, n) => sum + calcNpcPower(n), 0);
  const biomaMultiplier = floorData ? calcBiomaMultiplier(group, floorData.bioma) : 1;
  const groupPower = basePower * (1 + ef.poderBonus) * biomaMultiplier;

  // Stat primário do bioma atual — guia a escolha de NPCs no modal
  const statPrimario = biomaInfo?.statPrimario ?? 'forca';
  const statLabel: Record<string, string> = {
    forca: 'FOR', agilidade: 'AGI', resistencia: 'RES', inteligencia: 'INT',
  };
  const profissaoIdeal = biomaInfo ? BIOMA_META[floorData!.bioma].profissaoIdeal : null;

  // Ordenar por stat primário descendente — melhor fit aparece primeiro
  const eligiblesSorted = [...state.npcs.filter(n => n.vivo && !n.emExpedicao && !n.emGuerra && n.fadiga < 90)]
    .sort((a, b) => (b[statPrimario as keyof typeof b] as number) - (a[statPrimario as keyof typeof a] as number));

  const handleToggle = (id: string) => {
    if (selectedNpcs.includes(id)) setSelectedNpcs(selectedNpcs.filter(i => i !== id));
    else setSelectedNpcs([...selectedNpcs, id]);
  };

  const handleConfirm = () => {
    if (!canAfford || selectedNpcs.length === 0) return;
    sendExpedition(selectedNpcs, isFarming ? farmAndar! : undefined);
    setSelectedNpcs([]);
    setModalOpen(false);
  };

  if (state.andarAtual > 40) {
    return <div className="p-6 text-center text-primary mt-20 font-cinzel text-xl drop-shadow-[0_0_10px_rgba(212,175,55,0.5)] tracking-widest">ÁPICE ALCANÇADO</div>;
  }

  const getTierBg = (tier: number, boss: boolean) => {
    if (boss) return 'from-[#2A0E0E] to-[#180808] border-destructive';
    switch (tier) {
      case 1: return 'from-[#2A1F0E] to-[#1A1408] border-[#8B5E3C]';
      case 2: return 'from-[#0E1A2A] to-[#0A1018] border-[#566C8B]';
      case 3: return 'from-[#1A0E2A] to-[#100818] border-[#7B4EA8]';
      case 4: return 'from-[#2A0E0E] to-[#180808] border-[#C0392B]';
      default: return 'from-[#1C2333] to-[#161B22] border-card-border';
    }
  };

  const getRarityColorHex = (r: string) => {
    switch(r) {
      case 'Comum': return 'var(--rarity-comum)';
      case 'Incomum': return 'var(--rarity-incomum)';
      case 'Raro': return 'var(--rarity-raro)';
      case 'Épico': return 'var(--rarity-epico)';
      default: return 'var(--rarity-comum)';
    }
  };

  const getRarityStars = (r: string) => {
    switch(r) {
      case 'Comum': return '★';
      case 'Incomum': return '★★';
      case 'Raro': return '★★★';
      case 'Épico': return '★★★★';
      default: return '★';
    }
  };

  // Andares já conquistados (para farm)
  const conquistados = FLOORS.slice(0, state.andarAtual - 1).reverse();
  const [mostrarTodosAndares, setMostrarTodosAndares] = useState(false);
  const ANDARES_VISIVEIS = 8;
  const conquistadosMostrados = mostrarTodosAndares ? conquistados : conquistados.slice(0, ANDARES_VISIVEIS);

  return (
    <>
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">TORRE OBSCURA</h2>
          <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
        </div>
        {/* Botão do Codex Obscuro */}
        <button
          onClick={() => { setCodexOpen(true); abrirCodex(); }}
          title="Codex Obscuro — fragmentos de lore"
          className="relative mb-0.5 w-9 h-9 flex items-center justify-center rounded-sm border border-primary/30 text-primary/70 hover:text-primary hover:border-primary/60 transition-all touch-manipulation shrink-0"
        >
          <BookOpen size={16} />
          {state.codexNovoFragmento && (
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse border border-background" />
          )}
        </button>
      </header>

      {/* Banner de modo exploração */}
      {isFarming && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-sm bg-secondary/10 border border-secondary/40 text-[11px] text-secondary tracking-wider">
          <span className="flex items-center gap-1.5">
            <RotateCcw size={12} /> MODO EXPLORAÇÃO — Andar {farmAndar} (70% de loot · sem avanço)
          </span>
          <button
            onClick={() => setFarmAndar(null)}
            className="text-primary hover:text-foreground touch-manipulation flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {aguardandoT2 ? (
        /* ── TEMPORADA I COMPLETA — aguardando desbloqueio global de T2 ── */
        <div className="bg-gradient-to-b from-[#1A1808] to-[#0E0D0B] border border-primary/40 rounded-sm overflow-hidden">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
          <div className="p-6 space-y-5 text-center">
            <div className="flex justify-center">
              <div className="w-3 h-3 rotate-45 border border-primary shadow-[0_0_8px_rgba(212,175,55,0.6)] bg-primary/20" />
            </div>
            <div>
              <div className="text-[9px] text-secondary tracking-[0.3em] mb-1">TEMPORADA I — A ASCENSÃO</div>
              <h2 className="font-cinzel font-bold text-primary tracking-[0.15em] text-lg">ASCENSÃO COMPLETA</h2>
            </div>
            <p className="text-[11px] text-white/55 leading-relaxed italic border-l border-primary/30 pl-3 text-left">
              {pioneerPosicao === 1
                ? '"Você foi o primeiro a transcender o Vigésimo Andar. A Torre registrou sua presença entre as ruínas do que havia antes. Aguarde — quando dez exploradores alcançarem este patamar, o véu entre as temporadas será rasgado."'
                : '"Você alcançou o limite do que a Torre revela por agora. Outros ainda percorrem os andares que você pisou. Quando dez ascenderem, o silêncio entre as temporadas será quebrado e o próximo capítulo se abrirá."'}
            </p>
            <div className="border border-primary/20 bg-black/40 rounded-sm px-4 py-4 space-y-3">
              <div className="text-[9px] text-secondary tracking-[0.2em]">EXPLORADORES ASCENDIDOS</div>
              <div className="flex gap-1.5 justify-center flex-wrap">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-4 h-4 rotate-45 border transition-all ${
                      i < pioneersTotal
                        ? 'border-primary bg-primary/30 shadow-[0_0_6px_rgba(212,175,55,0.5)]'
                        : 'border-primary/20'
                    }`}
                  />
                ))}
              </div>
              <div className="font-cinzel font-bold text-primary text-xl">
                {pioneersTotal} <span className="text-sm text-white/40">/ 10</span>
              </div>
              {pioneersTotal < 10 && (
                <div className="text-[9px] text-secondary/50 tracking-wider">
                  {10 - pioneersTotal} explorador{10 - pioneersTotal !== 1 ? 'es' : ''} restante{10 - pioneersTotal !== 1 ? 's' : ''} para a Temporada 2
                </div>
              )}
            </div>
            <p className="text-[9px] text-secondary/40 tracking-widest">
              Os andares conquistados permanecem acessíveis para exploração enquanto aguarda.
            </p>
          </div>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      ) : (
        <div className={`bg-gradient-to-b border p-6 relative rounded-sm shadow-2xl overflow-hidden ${getTierBg(floorData.tier, isBoss)} ${isBoss && !isFarming ? 'shadow-[0_0_20px_rgba(248,81,73,0.3)]' : ''}`}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[50px] pointer-events-none rounded-full" />

          {isBoss && !isFarming && (
            <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground px-4 py-1.5 text-[10px] font-bold flex items-center gap-1 tracking-[0.2em] rounded-bl-sm z-10">
              <Skull size={12} /> CHEFE
            </div>
          )}
          {isFarming && (
            <div className="absolute top-0 right-0 bg-secondary/80 text-background px-4 py-1.5 text-[10px] font-bold flex items-center gap-1 tracking-[0.2em] rounded-bl-sm z-10">
              <RotateCcw size={12} /> EXPLORAÇÃO
            </div>
          )}

          {/* Capítulo */}
          <div className="text-[9px] text-white/35 tracking-[0.25em] mb-0.5 font-inter uppercase relative z-10">
            {isFarming ? 'MODO EXPLORAÇÃO' : `CAPÍTULO ${floorData.tier} · ${CAPITULO_NOMES[floorData.tier]}`}
          </div>

          <div className="text-5xl font-bold text-white font-cinzel flex items-baseline gap-2 mb-1 drop-shadow-md relative z-10">
            {floorData.floor} <span className="text-xl text-white/70">ANDAR</span>
          </div>
          <div className="text-sm text-primary tracking-[0.2em] font-cinzel glow-gold block w-max relative z-10">{floorData.tierName.toUpperCase()}</div>

          {/* Biome badge */}
          {biomaInfo && (
            <div className="mt-1 flex items-center gap-1.5 relative z-10">
              <span className="text-base leading-none">{biomaInfo.icone}</span>
              <span className="text-[10px] text-white/60 tracking-wider">{biomaInfo.label.toUpperCase()}</span>
              <span className="text-[9px] text-white/35 mx-1">·</span>
              <span className="text-[9px] text-white/50 italic">{biomaInfo.dica}</span>
            </div>
          )}

          {/* Texto narrativo do andar */}
          {floorData.descricao && (
            <p className="mt-3 mb-1 text-[11px] text-white/50 italic leading-relaxed relative z-10 border-l border-white/10 pl-3">
              {floorData.descricao}
            </p>
          )}

          {/* Banner do Boss */}
          {floorData.boss && !isFarming && (
            <div className="mt-3 mb-0 px-3 py-2 rounded-sm bg-destructive/15 border border-destructive/50 relative z-10">
              <div className="text-[9px] text-destructive/80 tracking-[0.3em] mb-0.5 font-cinzel">GUARDIÃO DO ANDAR</div>
              <div className="text-sm font-cinzel font-bold text-destructive tracking-widest">{floorData.boss.nome}</div>
              <div className="text-[9px] text-white/40 italic mt-0.5">{floorData.boss.epiteto}</div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4 bg-black/30 p-4 rounded-sm border border-white/5 relative z-10">
            <div>
              <div className="text-[10px] text-white/50 mb-1 tracking-widest">DIFICULDADE</div>
              <div className="text-lg font-bold text-white/90 flex items-center gap-2"><Swords size={14} className="text-primary"/> {floorData.difficulty} PWR</div>
            </div>
            <div>
              <div className="text-[10px] text-white/50 mb-1 tracking-widest">RISCO BASE</div>
              <div className="text-lg font-bold text-warning">{floorData.mortality}% MORT.</div>
            </div>
          </div>

          {recompensa && (
            <div className="mb-8 bg-black/30 p-4 rounded-sm border border-primary/20 relative z-10">
              <div className="text-[10px] text-primary/80 mb-2 tracking-widest flex items-center gap-1">
                <Check size={12} /> {isFarming ? 'RECOMPENSAS (×70% no modo exploração)' : 'RECOMPENSAS AO CONQUISTAR'}
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-bold">
                <span className="flex items-center gap-1 text-white/90"><Wheat size={14} className="text-warning" /> +{isFarming ? Math.round(recompensa.comida * 0.7) : recompensa.comida}</span>
                <span className="flex items-center gap-1 text-white/90"><Trees size={14} className="text-success" /> +{isFarming ? Math.round(recompensa.madeira * 0.7) : recompensa.madeira}</span>
                <span className="flex items-center gap-1 text-white/90"><Mountain size={14} className="text-secondary" /> +{isFarming ? Math.round(recompensa.pedra * 0.7) : recompensa.pedra}</span>
                {recompensa.ferro > 0 && (
                  <span className="flex items-center gap-1 text-white/90"><Zap size={14} className="text-primary" /> +{isFarming ? Math.round(recompensa.ferro * 0.7) : recompensa.ferro}</span>
                )}
              </div>
              {!isFarming && (
                <div className="text-[9px] text-white/40 mt-2 tracking-wide">Em caso de falha: ~30% dos recursos são recuperados de qualquer forma.</div>
              )}
            </div>
          )}

          <button
            onClick={() => setModalOpen(true)}
            className={`w-full h-14 font-cinzel font-bold tracking-[0.2em] text-sm flex items-center justify-center gap-2 transition-transform active:scale-95 touch-manipulation ${
              isFarming
                ? 'bg-secondary/80 text-background shadow-none'
                : isBoss
                  ? 'bg-destructive text-destructive-foreground shadow-[0_0_15px_rgba(248,81,73,0.4)]'
                  : 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(212,175,55,0.4)]'
            } rounded-sm`}
          >
            <ChevronUp /> {isFarming ? 'EXPLORAR ANDAR' : 'PREPARAR EXPEDIÇÃO'}
          </button>
        </div>
      )}

      {/* Histórico / andares conquistados (clicáveis para farm) */}
      <div className="space-y-3 mt-10">
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-b border-primary/20 pb-2">
          HISTÓRICO DA ESCALADA
          {conquistados.length > 0 && (
            <span className="text-[9px] text-secondary normal-case tracking-normal ml-auto font-inter">toque para explorar</span>
          )}
        </h3>
        <div className="space-y-2">
          {conquistadosMostrados.map(f => {
            const isSelected = farmAndar === f.floor;
            const habEst = state.habitantesEstado[f.floor];
            const habData = HABITANTES[f.floor];
            const isBossFloor = f.isBoss;
            const bossEcoAtivo = isBossFloor && state.ecosCapitulo.includes(f.tier);
            // ecos podem existir em boss floors (andares 5/10/15 com habitants)
            const ecoAtivo = state.ecos.includes(f.floor);
            const habCompletavel = habData && verificarQuestAndar(state, f.floor);
            const habEstIcon = habEst === 'descoberto' ? '👁' : habEst === 'quest_ativa' ? '⚡' : habEst === 'concluido' ? '✦' : null;
            return (
              <div key={f.floor} className="flex gap-1 items-stretch">
                <button
                  onClick={() => setFarmAndar(isSelected ? null : f.floor)}
                  className={`flex-1 flex justify-between items-center p-3 rounded-sm border-l-2 text-sm transition-all touch-manipulation text-left ${
                    isSelected
                      ? 'bg-secondary/10 border-secondary text-foreground'
                      : habCompletavel
                        ? 'bg-gradient-to-r from-[#161B22] to-transparent border-success animate-pulse hover:border-success'
                        : 'bg-gradient-to-r from-[#161B22] to-transparent border-card-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold font-cinzel text-foreground flex items-center gap-1.5">
                      <span>{isBossFloor ? '💀' : BIOMA_META[f.bioma].icone}</span>
                      <span>{f.nome}</span>
                      {bossEcoAtivo && <span className="text-[9px] text-primary ml-0.5" title="Eco do Capítulo desbloqueado">✦</span>}
                      {ecoAtivo && <span className="text-[9px] text-success ml-0.5" title={`Eco +${HABITANTES[f.floor]?.quest.ecoBonus}% loot`}>⚡</span>}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] text-secondary tracking-widest">ANDAR {f.floor} · {f.tierName.toUpperCase()}</span>
                      {ecoAtivo && (
                        <span className="text-[9px] text-success/80 font-bold">+{HABITANTES[f.floor]?.quest.ecoBonus}% LOOT</span>
                      )}
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold tracking-widest flex items-center gap-1 ${isSelected ? 'text-secondary' : 'text-primary'}`}>
                    {isSelected ? <><RotateCcw size={12} /> SELECIONADO</> : <><Check size={12} /> CONQUISTADO</>}
                  </span>
                </button>
                {/* Botão do habitante (andares não-boss com habitante descoberto) */}
                {habData && habEst && habEst !== 'oculto' && (
                  <button
                    onClick={() => setHabitanteModalFloor(f.floor)}
                    title={`${habData.nome} — ${habEst === 'concluido' ? 'Concluído' : habEst === 'quest_ativa' ? 'Quest Ativa' : 'Descoberto'}`}
                    className={`w-10 flex items-center justify-center rounded-sm border text-base transition-all touch-manipulation flex-shrink-0 ${
                      habCompletavel
                        ? 'bg-success/10 border-success text-success animate-pulse'
                        : habEst === 'concluido'
                          ? 'bg-primary/10 border-primary/40 text-primary'
                          : habEst === 'quest_ativa'
                            ? 'bg-warning/10 border-warning/40 text-warning'
                            : 'bg-card-border/20 border-card-border text-white/50'
                    }`}
                  >
                    {habEstIcon}
                  </button>
                )}
              </div>
            );
          })}
          {/* Botão "ver mais / recolher" quando há andares ocultos */}
          {conquistados.length > ANDARES_VISIVEIS && (
            <button
              onClick={() => setMostrarTodosAndares(m => !m)}
              className="w-full mt-1 text-[10px] font-cinzel tracking-widest text-secondary border border-card-border hover:border-primary/40 py-2 rounded-sm transition-all touch-manipulation"
            >
              {mostrarTodosAndares
                ? `▴ RECOLHER`
                : `▾ VER MAIS (${conquistados.length - ANDARES_VISIVEIS} andares ocultos)`}
            </button>
          )}
        </div>
      </div>

      {/* ── Modal Codex Obscuro ─────────────────────────────────────────────── */}
      <Dialog.Root open={codexOpen} onOpenChange={open => { if (!open) { setCodexOpen(false); abrirCodex(); } }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-50" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-lg max-h-[88vh] bg-gradient-to-b from-[#1A1F2E] to-[#161B22] border border-primary/30 flex flex-col z-50 rounded-sm shadow-[0_0_40px_rgba(0,0,0,0.95)] overflow-hidden">
            {/* Header fixo */}
            <div className="flex items-center justify-between p-5 border-b border-primary/20 shrink-0">
              <div>
                <Dialog.Title className="font-cinzel font-bold text-primary tracking-[0.2em] text-base leading-tight flex items-center gap-2">
                  <BookOpen size={14} /> CODEX OBSCURO
                </Dialog.Title>
                {Object.values(TEMPORADAS).map(t => {
                  const total = totalFragmentosTemporada(t.numero);
                  const desbloqueados = state.codexFragmentos.filter(id => CODEX_FRAGMENTOS[id]?.temporada === t.numero).length;
                  return (
                    <div key={t.numero} className="text-[9px] text-secondary/70 tracking-widest mt-0.5">
                      TEMPORADA {t.numero} · {t.nome.toUpperCase()} · {desbloqueados}/{total} FRAGMENTOS
                    </div>
                  );
                })}
              </div>
              <Dialog.Close asChild>
                <button className="w-8 h-8 flex items-center justify-center border border-card-border text-secondary hover:text-foreground rounded-sm touch-manipulation shrink-0">
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>

            {/* Conteúdo rolável */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {Object.values(TEMPORADAS).map(temporada => {
                const totalTemp = totalFragmentosTemporada(temporada.numero);
                const desbTemp = state.codexFragmentos.filter(id => CODEX_FRAGMENTOS[id]?.temporada === temporada.numero).length;
                // capítulos 1-4
                const capitulos = [1, 2, 3, 4];
                const nomesCap: Record<number, string> = {
                  1: CAPITULO_NOMES[1], 2: CAPITULO_NOMES[2],
                  3: CAPITULO_NOMES[3], 4: CAPITULO_NOMES[4],
                };
                return (
                  <div key={temporada.numero}>
                    {/* Barra de progresso da temporada */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] text-primary/60 tracking-widest font-cinzel">
                        TEMPORADA {temporada.numero} — {temporada.nome.toUpperCase()}
                      </div>
                      <div className="text-[9px] text-secondary/60">{desbTemp}/{totalTemp}</div>
                    </div>
                    <div className="w-full h-1 bg-background rounded-sm overflow-hidden border border-white/5 mb-4">
                      <div className="h-full bg-primary/60 transition-all" style={{ width: `${Math.round((desbTemp / totalTemp) * 100)}%` }} />
                    </div>

                    {/* Capítulos */}
                    {capitulos.map(cap => {
                      const fragsCapitulo = Object.values(CODEX_FRAGMENTOS)
                        .filter(f => f.temporada === temporada.numero && f.capitulo === cap)
                        .sort((a, b) => a.ordem - b.ordem);
                      if (fragsCapitulo.length === 0) return null;
                      const desbCap = fragsCapitulo.filter(f => state.codexFragmentos.includes(f.id)).length;
                      const isExpanded = codexCapExpanded === cap;
                      const tipoIcon: Record<string, string> = {
                        habitante: '👁', eco_capitulo: '✦', sussurro: '🌀', verdade: '📜'
                      };
                      return (
                        <div key={cap} className="mb-3">
                          {/* Cabeçalho do capítulo */}
                          <button
                            onClick={() => setCodexCapExpanded(isExpanded ? null : cap)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-sm bg-black/30 border border-white/5 hover:border-primary/20 transition-colors touch-manipulation"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-secondary tracking-[0.2em] font-cinzel">
                                CAP. {cap} — {(nomesCap[cap] ?? '').toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] text-primary/50">{desbCap}/{fragsCapitulo.length}</span>
                              <span className="text-[10px] text-secondary/50">{isExpanded ? '▲' : '▼'}</span>
                            </div>
                          </button>

                          {/* Fragmentos (colapsável) */}
                          {isExpanded && (
                            <div className="mt-1 space-y-1.5 pl-1">
                              {fragsCapitulo.map(frag => {
                                const desbloqueado = state.codexFragmentos.includes(frag.id);
                                const isVerdade = frag.tipo === 'verdade';
                                return (
                                  <div key={frag.id} className={`rounded-sm border p-3 transition-all ${
                                    isVerdade && desbloqueado
                                      ? 'border-primary/60 bg-primary/5 shadow-[0_0_10px_rgba(212,175,55,0.1)]'
                                      : desbloqueado
                                        ? 'border-white/10 bg-black/20'
                                        : 'border-white/5 bg-black/10 opacity-50'
                                  }`}>
                                    <div className="flex items-center gap-1.5 mb-1">
                                      <span className="text-[11px] leading-none">{tipoIcon[frag.tipo] ?? '·'}</span>
                                      <span className={`text-[9px] tracking-wider font-cinzel ${desbloqueado ? 'text-primary/70' : 'text-white/30'}`}>
                                        {frag.titulo}
                                      </span>
                                      {!desbloqueado && (
                                        <span className="ml-auto text-[8px] text-white/20 tracking-widest">BLOQUEADO</span>
                                      )}
                                    </div>
                                    <p className={`text-[10px] leading-relaxed ${desbloqueado ? (isVerdade ? 'text-primary/80 italic' : 'text-white/55 italic') : 'text-white/15 select-none'}`}>
                                      {desbloqueado
                                        ? frag.texto
                                        : '████ ████ ████ ████ ████ ████ ████ ████ ████ ████ ████'}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-primary/10 shrink-0">
              <p className="text-[9px] text-white/25 text-center tracking-wider italic">
                Fragmentos desbloqueados ao conquistar andares, completar quests e durante expedições.
              </p>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ── Modal de diálogo com o Habitante ────────────────────────────────── */}
      <Dialog.Root
        open={habitanteModalFloor !== null}
        onOpenChange={open => { if (!open) setHabitanteModalFloor(null); }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 transition-opacity" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md max-h-[85vh] bg-gradient-to-b from-[#1A1F2E] to-[#161B22] border border-primary/30 p-5 flex flex-col gap-4 z-50 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-y-auto custom-scrollbar">
            {habitanteModalFloor !== null && (() => {
              const hf = habitanteModalFloor;
              const hab = HABITANTES[hf];
              if (!hab) return null;
              const est = state.habitantesEstado[hf] ?? 'oculto';
              const completavel = verificarQuestAndar(state, hf);
              const q = hab.quest;
              const diaDesc = state.habitantesDiaDescoberta[hf];
              const diasRestantes = q.tipo === 'temporal' && q.dias && diaDesc
                ? Math.max(0, q.dias - (state.dia - diaDesc))
                : 0;
              const falaAtual = est === 'concluido' ? hab.falaConcluso
                : est === 'quest_ativa' ? hab.falamissão
                : hab.fala;
              const loreItem = est === 'concluido' ? state.lores.find(l => l.floor === hf) : null;

              return (
                <>
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl leading-none">{hab.icone}</div>
                      <div>
                        <Dialog.Title className="font-cinzel font-bold text-primary tracking-widest text-base leading-tight">
                          {hab.nome}
                        </Dialog.Title>
                        <div className="text-[9px] text-secondary tracking-[0.2em] mt-0.5">{hab.papel.toUpperCase()} · ANDAR {hf}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-sm border ${
                        est === 'concluido' ? 'border-primary/40 text-primary bg-primary/10'
                          : est === 'quest_ativa' ? 'border-warning/40 text-warning bg-warning/10'
                          : 'border-card-border text-white/40'
                      }`}>
                        {est === 'concluido' ? '✦ ECO ATIVO' : est === 'quest_ativa' ? '⚡ QUEST ATIVA' : '👁 DESCOBERTO'}
                      </span>
                      <Dialog.Close asChild>
                        <button className="w-8 h-8 flex items-center justify-center border border-card-border text-secondary hover:text-foreground rounded-sm touch-manipulation">
                          <X size={16} />
                        </button>
                      </Dialog.Close>
                    </div>
                  </div>

                  {/* Fala do habitante */}
                  <div className="bg-black/30 rounded-sm p-4 border-l-2 border-primary/40 relative">
                    <div className="text-[9px] text-primary/50 tracking-widest mb-1">{hab.nome.toUpperCase()}</div>
                    <p className="text-[12px] text-white/70 italic leading-relaxed">"{falaAtual}"</p>
                  </div>

                  {/* Quest info */}
                  {est !== 'concluido' && (
                    <div className={`rounded-sm p-4 border ${completavel && est === 'quest_ativa' ? 'border-success/50 bg-success/5' : 'border-white/10 bg-black/20'}`}>
                      <div className="text-[9px] text-secondary tracking-widest mb-2 flex items-center gap-1">
                        <Swords size={9} /> MISSÃO
                        {completavel && est === 'quest_ativa' && (
                          <span className="ml-auto text-success font-bold animate-pulse">✓ PRONTO PARA CONCLUIR</span>
                        )}
                      </div>
                      <div className="text-[11px] text-foreground/90 mb-3 font-medium">{q.descricaoObj}</div>
                      {/* Detalhe da condição */}
                      <div className="text-[10px] text-secondary/70 leading-relaxed mb-3">
                        {q.tipo === 'temporal' && diaDesc && (
                          <span>
                            {diasRestantes > 0
                              ? `⏳ Faltam ${diasRestantes} dias (dia ${diaDesc + (q.dias ?? 0)} )`
                              : '✓ Condição temporal cumprida'}
                            {q.semGuerra && state.guerra && ' · ⚔️ Paz necessária'}
                          </span>
                        )}
                        {q.tipo === 'recurso' && (q.recurso || q.recurso2) && (
                          <span>
                            {q.recurso && (
                              <span>
                                {state.recursos[q.recurso.tipo]} / {q.recurso.qtd} {q.recurso.tipo}
                                {state.recursos[q.recurso.tipo] >= q.recurso.qtd ? ' ✓' : ''}
                              </span>
                            )}
                            {q.recurso && q.recurso2 && <span> · </span>}
                            {q.recurso2 && (
                              <span>
                                {state.recursos[q.recurso2.tipo]} / {q.recurso2.qtd} {q.recurso2.tipo}
                                {state.recursos[q.recurso2.tipo] >= q.recurso2.qtd ? ' ✓' : ''}
                              </span>
                            )}
                          </span>
                        )}
                        {q.tipo === 'sacrificio' && est === 'descoberto' && q.custo && (
                          <span className="text-destructive/80">
                            Custo imediato ao aceitar: {q.custo.moral ? `-${q.custo.moral} moral` : ''}{q.custo.comida ? ` -${q.custo.comida} comida` : ''}{q.custo.ferro ? ` -${q.custo.ferro} ferro` : ''}
                          </span>
                        )}
                        {q.tipo === 'expedicao' && (
                          <span>
                            {q.profissoes ? q.profissoes.map(p => {
                              const temProf = state.npcs.some(n => n.vivo && getProfissao(n) === p);
                              return <span key={p} className={temProf ? 'text-success' : 'text-destructive/70'}>
                                {temProf ? '✓' : '✗'} {p}
                              </span>;
                            }).reduce<React.ReactNode[]>((acc, el, i) => i === 0 ? [el] : [...acc, ' · ', el], []) : null}
                            {q.npcsMinCombate && (
                              <span>
                                {state.npcs.filter(n => n.vivo && (getProfissao(n) === 'combatente' || getProfissao(n) === 'batedor' || getProfissao(n) === 'sentinela')).length}
                                {' '}/{' '}{q.npcsMinCombate} NPCs de combate
                              </span>
                            )}
                          </span>
                        )}
                      </div>
                      {/* Recompensa */}
                      <div className="flex items-center gap-2 border-t border-white/5 pt-2">
                        <span className="text-[9px] text-primary/60 tracking-widest">RECOMPENSA</span>
                        <span className="text-[10px] text-primary/90 font-medium">{q.recompensaDesc}</span>
                      </div>
                    </div>
                  )}

                  {/* Lore desbloqueado (pós-conclusão) */}
                  {est === 'concluido' && loreItem && (
                    <div className="rounded-sm p-4 border border-primary/30 bg-primary/5">
                      <div className="text-[9px] text-primary/60 tracking-widest mb-2 flex items-center gap-1">
                        <BookOpen size={9} /> FRAGMENTO REVELADO
                      </div>
                      <div className="text-[10px] text-primary/50 mb-1 font-cinzel">{loreItem.titulo}</div>
                      <p className="text-[11px] text-white/60 italic leading-relaxed">{loreItem.texto}</p>
                      <div className="mt-2 text-[9px] text-success/70 flex items-center gap-1">
                        <Zap size={8} /> ECO ATIVO: +{q.ecoBonus}% loot neste andar ao explorar
                      </div>
                    </div>
                  )}

                  {/* Eco ativo (sem lore guardado) */}
                  {est === 'concluido' && !loreItem && (
                    <div className="rounded-sm p-3 border border-success/30 bg-success/5 text-[10px] text-success/80 flex items-center gap-2">
                      <Zap size={10} /> ECO ATIVO neste andar: +{q.ecoBonus}% loot ao explorar.
                    </div>
                  )}

                  {/* Botão de ação */}
                  {est === 'descoberto' && (
                    <button
                      onClick={() => {
                        interagirHabitante(hf);
                        if (q.tipo !== 'sacrificio') {
                          // quest aceita, modal permanece aberto para mostrar estado atualizado
                        } else {
                          // sacrificio: fecha após aceitar pois quest vai para quest_ativa
                        }
                      }}
                      className="w-full h-12 bg-primary/20 border border-primary/50 text-primary font-cinzel font-bold tracking-[0.2em] rounded-sm touch-manipulation text-sm hover:bg-primary/30 transition-colors"
                    >
                      {q.tipo === 'sacrificio' ? 'PAGAR E ACEITAR' : 'ACEITAR MISSÃO'}
                    </button>
                  )}
                  {est === 'quest_ativa' && (
                    <button
                      onClick={() => { interagirHabitante(hf); }}
                      disabled={!completavel}
                      className={`w-full h-12 font-cinzel font-bold tracking-[0.2em] rounded-sm touch-manipulation text-sm transition-colors ${
                        completavel
                          ? 'bg-success/80 text-background hover:bg-success border-0 shadow-[0_0_10px_rgba(63,185,80,0.3)]'
                          : 'bg-card-border/30 text-white/30 border border-card-border cursor-not-allowed'
                      }`}
                    >
                      {completavel ? 'CONCLUIR MISSÃO' : 'AGUARDANDO CONDIÇÕES…'}
                    </button>
                  )}
                  {est === 'concluido' && (
                    <button
                      onClick={() => setHabitanteModalFloor(null)}
                      className="w-full h-12 bg-primary text-primary-foreground font-cinzel font-bold tracking-[0.2em] rounded-sm touch-manipulation text-sm"
                    >
                      FECHAR
                    </button>
                  )}
                </>
              );
            })()}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 transition-opacity" />
          <Dialog.Content className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md max-h-[85vh] bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-5 flex flex-col z-50 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)]">
            <div className="flex items-center justify-between mb-4 border-b border-primary/20 pb-2">
              <Dialog.Title className="text-xl font-cinzel font-bold text-primary tracking-widest">
                {isFarming ? `EXPLORAR ANDAR ${farmAndar}` : 'FORMAR GRUPO'}
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  aria-label="Fechar"
                  className="w-9 h-9 flex items-center justify-center rounded-sm border border-card-border text-secondary hover:text-foreground hover:border-primary/50 active:scale-95 transition-all touch-manipulation shrink-0"
                >
                  <X size={18} />
                </button>
              </Dialog.Close>
            </div>

            {/* Legenda do stat primário do bioma */}
            {biomaInfo && (
              <div className="flex items-center gap-2 px-1 mb-2 text-[9px] text-white/40 tracking-wider">
                <span>{biomaInfo.icone}</span>
                <span>Ordenado por <span className="text-white/60 font-bold">{statLabel[statPrimario]}</span> — stat primário de {biomaInfo.label}</span>
                {profissaoIdeal && <span className="ml-auto text-white/30">★ = {profissaoIdeal} ideal</span>}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 mb-5 custom-scrollbar pr-2">
              {eligiblesSorted.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm font-inter">Nenhum habitante apto para combate.</div>
              ) : (
                eligiblesSorted.map(n => {
                  const p = calcNpcPower(n);
                  const isSelected = selectedNpcs.includes(n.id);
                  const rarityColor = getRarityColorHex(n.raridade);
                  const isIdeal = profissaoIdeal && getProfissao(n) === profissaoIdeal;
                  const statVal = n[statPrimario as keyof typeof n] as number;
                  return (
                    <div
                      key={n.id}
                      className={`flex items-stretch gap-0 border transition-all cursor-pointer rounded-sm overflow-hidden ${isSelected ? 'border-primary bg-primary/5' : isIdeal ? 'border-success/40 bg-success/5 hover:border-success/60' : 'border-card-border bg-[#0D1117] hover:border-primary/40'}`}
                      onClick={() => handleToggle(n.id)}
                    >
                      <div className="w-1.5 shrink-0" style={{ backgroundColor: rarityColor }} />
                      <div className="flex-1 p-3 flex items-center gap-3">
                        <Checkbox.Root
                          checked={isSelected}
                          className={`w-5 h-5 border flex items-center justify-center shrink-0 rounded-sm ${isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-secondary bg-transparent'}`}
                        >
                          <Checkbox.Indicator>
                            <Check size={14} strokeWidth={3} />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-foreground">{n.nome}</span>
                              <span className="text-[10px]" style={{ color: rarityColor }}>{getRarityStars(n.raridade)}</span>
                              {isIdeal && <span className="text-[9px] text-success" title="Profissão ideal para este bioma">★</span>}
                            </div>
                            {/* Poder total à direita */}
                            <span className="text-primary font-bold text-sm font-cinzel">{p.toFixed(1)}</span>
                          </div>

                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[9px] px-1.5 py-[1px] bg-secondary/20 text-secondary border border-secondary/30 rounded-sm tracking-wider uppercase">
                                {n.habilidade}
                              </span>
                              {n.reforco && (
                                <span className="text-[9px] px-1.5 py-[1px] bg-blue-500/20 text-blue-300 border border-blue-400/40 rounded-sm tracking-wider uppercase flex items-center gap-1">
                                  <Shield size={9} /> REFORÇO{n.donoNome ? ` · ${n.donoNome}` : ''}
                                </span>
                              )}
                            </div>
                            {/* Stat primário do bioma destacado */}
                            <span className={`text-[10px] font-bold font-cinzel shrink-0 ${isIdeal ? 'text-success' : 'text-white/50'}`}>
                              {statLabel[statPrimario]} {statVal}
                            </span>
                          </div>

                          {/* Barra de fadiga */}
                          <div className="w-full bg-background h-1.5 flex rounded-sm overflow-hidden border border-white/5">
                            <div className={`h-full ${n.fadiga > 60 ? 'bg-destructive' : 'bg-success'}`} style={{width: `${100 - n.fadiga}%`}} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="space-y-4 bg-black/40 p-4 rounded-sm border border-primary/10">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary font-cinzel tracking-widest text-[11px]">PODER TOTAL</span>
                <span className={`font-bold font-cinzel text-lg flex items-center gap-2 ${groupPower >= floorData.difficulty ? 'text-success drop-shadow-[0_0_5px_rgba(63,185,80,0.5)]' : 'text-destructive'}`}>
                  <Swords size={16}/> {groupPower.toFixed(1)} <span className="text-xs text-muted-foreground">/ {floorData.difficulty}</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary font-cinzel tracking-widest text-[11px]">CUSTO DE SUPRIMENTOS</span>
                <span className={`font-bold font-inter text-base flex items-center gap-2 ${canAfford ? 'text-foreground' : 'text-destructive'}`}>
                  <Wheat size={16} className={canAfford ? 'text-warning' : 'text-destructive'}/> {cost} <span className="text-xs text-muted-foreground">/ {Math.floor(state.recursos.comida)}</span>
                </span>
              </div>

              <button
                onClick={handleConfirm}
                disabled={!canAfford || selectedNpcs.length === 0}
                className="w-full h-14 bg-primary text-primary-foreground font-cinzel font-bold tracking-[0.2em] text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2 rounded-sm shadow-[0_0_10px_rgba(212,175,55,0.2)] touch-manipulation"
              >
                {isFarming ? 'INICIAR EXPLORAÇÃO' : 'INICIAR ESCALADA'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

    </div>

    {/* ── Modal de resultado pós-expedição ─────────────────────────────── */}
    <Dialog.Root open={!!lastExpeditionResult} onOpenChange={open => { if (!open) clearExpeditionResult(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/90 backdrop-blur-md z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[95vw] max-w-md bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/30 p-5 flex flex-col z-50 rounded-sm shadow-[0_0_30px_rgba(0,0,0,0.8)] gap-4">
          {lastExpeditionResult && <ExpeditionResultCard result={lastExpeditionResult} onClose={clearExpeditionResult} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
    </>
  );
}

// ── Componente de card de resultado ──────────────────────────────────────────

function ExpeditionResultCard({ result, onClose }: { result: ExpeditionResult; onClose: () => void }) {
  const { vitoria, isFarming, floor, poder, dificuldade, loot, mortos, resgatado, habitanteDescoberto, bossEco, sussurro } = result;
  const pct = Math.min(100, Math.round((poder / dificuldade) * 100));

  return (
    <>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-xs font-cinzel tracking-[0.25em] mb-0.5 ${vitoria ? 'text-success' : 'text-destructive'}`}>
            {isFarming ? 'EXPLORAÇÃO' : 'EXPEDIÇÃO'} — ANDAR {floor}
          </div>
          <Dialog.Title className={`text-2xl font-cinzel font-bold tracking-widest ${vitoria ? 'text-success' : 'text-destructive'}`}>
            {vitoria ? '✓ VITÓRIA' : '✗ DERROTA'}
          </Dialog.Title>
        </div>
        <Dialog.Close asChild>
          <button className="w-9 h-9 flex items-center justify-center border border-card-border text-secondary hover:text-foreground rounded-sm touch-manipulation" onClick={onClose}>
            <X size={18} />
          </button>
        </Dialog.Close>
      </div>

      {/* Poder vs dificuldade */}
      <div className="bg-black/30 rounded-sm p-3 border border-white/5">
        <div className="flex justify-between text-[10px] text-secondary mb-1.5 tracking-widest">
          <span className="flex items-center gap-1"><Swords size={10} /> PODER</span>
          <span>{poder.toFixed(0)} / {dificuldade}</span>
        </div>
        <div className="w-full h-2 bg-background rounded-sm overflow-hidden border border-white/5">
          <div
            className={`h-full transition-all ${vitoria ? 'bg-success' : 'bg-destructive'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Loot */}
      <div>
        <div className="text-[10px] text-secondary tracking-widest mb-2 flex items-center gap-1">
          <Check size={10} /> {vitoria ? 'RECURSOS OBTIDOS' : 'RECURSOS RECUPERADOS (30%)'}
        </div>
        <div className="flex flex-wrap gap-2">
          {loot.comida  > 0 && <LootChip icon={Wheat}    color="text-warning"   label={`+${loot.comida} comida`} />}
          {loot.madeira > 0 && <LootChip icon={Trees}    color="text-success"   label={`+${loot.madeira} madeira`} />}
          {loot.pedra   > 0 && <LootChip icon={Mountain} color="text-secondary" label={`+${loot.pedra} pedra`} />}
          {loot.ferro   > 0 && <LootChip icon={Zap}      color="text-primary"   label={`+${loot.ferro} ferro`} />}
          {!loot.comida && !loot.madeira && !loot.pedra && !loot.ferro && (
            <span className="text-[10px] text-muted-foreground italic">Nenhum recurso obtido.</span>
          )}
        </div>
      </div>

      {/* Mortos */}
      {mortos.length > 0 && (
        <div className="bg-destructive/5 border border-destructive/20 rounded-sm p-3">
          <div className="text-[10px] text-destructive tracking-widest mb-2 flex items-center gap-1 font-bold">
            <Skull size={10} /> BAIXAS
          </div>
          <div className="flex flex-col gap-1">
            {mortos.map((m, i) => (
              <div key={i} className="text-[11px] text-destructive/80 flex items-center gap-2">
                <Skull size={9} className="shrink-0 opacity-60" /> {m.nome}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resgatado */}
      {resgatado && (
        <div className="bg-primary/5 border border-primary/30 rounded-sm p-3">
          <div className="text-[10px] text-primary tracking-widest mb-2 flex items-center gap-1 font-bold">
            <UserPlus size={10} /> SOBREVIVENTE ENCONTRADO
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-primary shrink-0" />
            <span className="text-sm font-bold text-foreground">{resgatado.nome}</span>
            <span className="text-[10px] text-primary/70 ml-1">{resgatado.raridade}</span>
          </div>
          <div className="text-[9px] text-secondary mt-1">Adicionado aos habitantes da cidadela.</div>
        </div>
      )}

      {/* Habitante descoberto */}
      {habitanteDescoberto && (
        <div className="bg-white/5 border border-white/20 rounded-sm p-3">
          <div className="text-[10px] text-white/60 tracking-widest mb-2 flex items-center gap-1 font-bold">
            👁 HABITANTE DETECTADO
          </div>
          <div className="text-sm font-bold text-foreground font-cinzel">{habitanteDescoberto}</div>
          <div className="text-[9px] text-secondary mt-1">Aguarda contato no histórico da Torre.</div>
        </div>
      )}

      {/* Eco do Capítulo (boss conquistado) */}
      {bossEco && (
        <div className="bg-primary/5 border border-primary/50 rounded-sm p-4">
          <div className="text-[9px] text-primary tracking-[0.25em] mb-2 flex items-center gap-1 font-bold font-cinzel">
            <BookOpen size={9} /> ECO DO CAPÍTULO DESBLOQUEADO
          </div>
          <div className="text-[10px] font-cinzel text-primary/80 mb-2">{bossEco.titulo}</div>
          <p className="text-[11px] text-white/55 italic leading-relaxed border-l border-primary/30 pl-3">{bossEco.texto}</p>
        </div>
      )}

      {/* Sussurro da Torre */}
      {sussurro && (
        <div className="bg-black/40 border border-white/15 rounded-sm p-4">
          <div className="text-[9px] text-white/50 tracking-[0.25em] mb-2 flex items-center gap-1 font-bold font-cinzel">
            🌀 SUSSURRO DA TORRE
          </div>
          <div className="text-[9px] text-white/35 font-cinzel mb-1.5">{sussurro.titulo}</div>
          <p className="text-[11px] text-white/55 italic leading-relaxed border-l border-white/10 pl-3">{sussurro.texto}</p>
          <div className="text-[8px] text-white/25 mt-2 tracking-widest">Registrado no Codex Obscuro.</div>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full h-12 bg-primary text-primary-foreground font-cinzel font-bold tracking-[0.2em] rounded-sm touch-manipulation mt-1"
      >
        CONTINUAR
      </button>
    </>
  );
}

function LootChip({ icon: Icon, color, label }: { icon: React.ComponentType<{ size?: number; className?: string }>; color: string; label: string }) {
  return (
    <span className={`flex items-center gap-1.5 px-2 py-1 rounded-sm bg-black/30 border border-white/5 text-[11px] font-bold ${color}`}>
      <Icon size={11} /> {label}
    </span>
  );
}
