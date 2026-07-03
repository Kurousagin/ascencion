import { useState, useEffect } from 'react';
import { useGame, ExpeditionResult } from '../context/GameContext';
import { FLOORS, calcNpcPower, getEfeitos, calcRecompensaAndar, calcCustoExpedicao } from '../lib/game-data';
import { Skull, ChevronUp, Swords, Wheat, Check, X, Trees, Mountain, Zap, Shield, RotateCcw, Sparkles, UserPlus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Checkbox from '@radix-ui/react-checkbox';

export function Tower() {
  const { state, sendExpedition, lastExpeditionResult, clearExpeditionResult } = useGame();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNpcs, setSelectedNpcs] = useState<string[]>([]);
  // null = modo avançar (andar atual); número = modo exploração (farm de andar passado)
  const [farmAndar, setFarmAndar] = useState<number | null>(null);

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
  const targetAndar = isFarming ? farmAndar! : state.andarAtual;
  const floorData = FLOORS[targetAndar - 1];
  const isBoss = floorData?.isBoss;

  const ef = getEfeitos(state.edificios);
  const recompensa = floorData ? calcRecompensaAndar(floorData.floor, floorData.tier) : null;

  const eligibles = state.npcs.filter(n => n.vivo && !n.emExpedicao && !n.emGuerra && n.fadiga < 90);

  const cost = calcCustoExpedicao(selectedNpcs.length, floorData?.tier || 1);
  const canAfford = state.recursos.comida >= cost;

  const group = state.npcs.filter(n => selectedNpcs.includes(n.id));
  const basePower = group.reduce((sum, n) => sum + calcNpcPower(n), 0);
  const groupPower = basePower * (1 + ef.poderBonus);

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

  if (state.andarAtual > 20) {
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

  return (
    <>
    <div className="p-4 space-y-6 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">TORRE OBSCURA</h2>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
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

        <div className="text-[10px] text-white/50 tracking-[0.2em] mb-1 font-inter relative z-10">
          {isFarming ? 'MODO EXPLORAÇÃO' : 'ALVO ATUAL'}
        </div>
        <div className="text-5xl font-bold text-white font-cinzel flex items-baseline gap-2 mb-2 drop-shadow-md relative z-10">
          {floorData.floor} <span className="text-xl text-white/70">ANDAR</span>
        </div>
        <div className="text-sm text-primary tracking-[0.2em] mb-6 font-cinzel glow-gold block w-max relative z-10">{floorData.tierName.toUpperCase()}</div>

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

      {/* Histórico / andares conquistados (clicáveis para farm) */}
      <div className="space-y-3 mt-10">
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-b border-primary/20 pb-2">
          HISTÓRICO DA ESCALADA
          {conquistados.length > 0 && (
            <span className="text-[9px] text-secondary normal-case tracking-normal ml-auto font-inter">toque para explorar</span>
          )}
        </h3>
        <div className="space-y-2">
          {conquistados.map(f => {
            const isSelected = farmAndar === f.floor;
            return (
              <button
                key={f.floor}
                onClick={() => setFarmAndar(isSelected ? null : f.floor)}
                className={`w-full flex justify-between items-center p-3 rounded-sm border-l-2 text-sm transition-all touch-manipulation text-left ${
                  isSelected
                    ? 'bg-secondary/10 border-secondary text-foreground'
                    : 'bg-gradient-to-r from-[#161B22] to-transparent border-card-border hover:border-primary/50'
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold font-cinzel text-foreground">ANDAR {f.floor}</span>
                  <span className="text-[10px] text-secondary tracking-widest">{f.tierName.toUpperCase()}</span>
                </div>
                <span className={`text-[10px] font-bold tracking-widest flex items-center gap-1 ${isSelected ? 'text-secondary' : 'text-primary'}`}>
                  {isSelected ? <><RotateCcw size={12} /> SELECIONADO</> : <><Check size={12} /> CONQUISTADO</>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

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

            <div className="flex-1 overflow-y-auto space-y-2 mb-5 custom-scrollbar pr-2">
              {eligibles.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 text-sm font-inter">Nenhum habitante apto para combate.</div>
              ) : (
                eligibles.map(n => {
                  const p = calcNpcPower(n);
                  const isSelected = selectedNpcs.includes(n.id);
                  const rarityColor = getRarityColorHex(n.raridade);
                  return (
                    <div
                      key={n.id}
                      className={`flex items-stretch gap-0 border transition-all cursor-pointer rounded-sm overflow-hidden ${isSelected ? 'border-primary bg-primary/5' : 'border-card-border bg-[#0D1117] hover:border-primary/40'}`}
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
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-foreground">{n.nome}</span>
                              <span className="text-[10px]" style={{ color: rarityColor }}>{getRarityStars(n.raridade)}</span>
                            </div>
                            <span className="text-primary font-bold text-sm font-cinzel">{p.toFixed(1)}</span>
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-[9px] px-1.5 py-[1px] bg-secondary/20 text-secondary border border-secondary/30 rounded-sm tracking-wider uppercase">
                              {n.habilidade}
                            </span>
                            {n.reforco && (
                              <span className="text-[9px] px-1.5 py-[1px] bg-blue-500/20 text-blue-300 border border-blue-400/40 rounded-sm tracking-wider uppercase flex items-center gap-1">
                                <Shield size={9} /> REFORÇO{n.donoNome ? ` · ${n.donoNome}` : ''}
                              </span>
                            )}
                          </div>

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
  const { vitoria, isFarming, floor, poder, dificuldade, loot, mortos, resgatado } = result;
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
