import { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  BUILDINGS, getEfeitos, EdificioTipo, POSTO_AFIM, PROFISSOES,
  NPC, getProfissao, calcCustoGacha, GACHA_BATCH, GACHA_ODDS,
} from '../lib/game-data';
import {
  Wheat, Trees, Mountain, Zap, TrendingUp, TrendingDown, ArrowUp,
  Users, Hammer, Sparkles, X, Star,
} from 'lucide-react';

// ─── helpers de raridade ──────────────────────────────────────────────────────

const RARITY_COLOR: Record<string, string> = {
  Comum:   'var(--rarity-comum)',
  Incomum: 'var(--rarity-incomum)',
  Raro:    'var(--rarity-raro)',
  Épico:   'var(--rarity-epico)',
};

const RARITY_STARS: Record<string, string> = {
  Comum: '★', Incomum: '★★', Raro: '★★★', Épico: '★★★★',
};

const RARITY_GLOW: Record<string, string> = {
  Comum:   '',
  Incomum: 'shadow-[0_0_12px_rgba(46,213,115,0.35)]',
  Raro:    'shadow-[0_0_16px_rgba(74,158,255,0.45)]',
  Épico:   'shadow-[0_0_22px_rgba(212,175,55,0.55)]',
};

// ─── NPC gacha card ───────────────────────────────────────────────────────────

function GachaCard({ npc, revealed }: { npc: NPC; revealed: boolean }) {
  const color = RARITY_COLOR[npc.raridade] ?? 'var(--rarity-comum)';
  const glow  = RARITY_GLOW[npc.raridade] ?? '';

  return (
    <div
      className="relative flex-1 min-w-0"
      style={{
        transform:  revealed ? 'scale(1)'   : 'scale(0.88)',
        opacity:    revealed ? 1             : 0,
        transition: 'transform 0.45s cubic-bezier(.34,1.56,.64,1), opacity 0.35s ease',
      }}
    >
      {/* Card rarity glow border */}
      <div
        className={`h-full rounded-sm border-2 overflow-hidden flex flex-col ${glow}`}
        style={{ borderColor: color, background: 'linear-gradient(160deg,#1C2333 60%,#0D1117)' }}
      >
        {/* Rarity banner */}
        <div
          className="text-[9px] font-bold tracking-[0.25em] text-center py-1 font-cinzel"
          style={{ background: color, color: '#0D1117' }}
        >
          {npc.raridade.toUpperCase()}
        </div>

        {/* Avatar circle */}
        <div className="flex justify-center pt-3 pb-2">
          <div
            className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-cinzel font-bold text-xl text-background"
            style={{ borderColor: color, background: color }}
          >
            {npc.nome[0]}
          </div>
        </div>

        {/* Name + stars */}
        <div className="text-center px-2 pb-1">
          <div className="font-bold text-foreground text-sm truncate font-inter">{npc.nome}</div>
          <div className="text-[11px]" style={{ color }}>{RARITY_STARS[npc.raridade]}</div>
        </div>

        {/* Profession + habilidade */}
        <div className="flex flex-col items-center gap-1 px-2 pb-2">
          <span className="text-[9px] px-1.5 py-0.5 rounded-sm border font-bold tracking-wider uppercase"
            style={{ color, borderColor: color, background: `${color}18` }}>
            {PROFISSOES[getProfissao(npc)].nome}
          </span>
          <span className="text-[9px] text-secondary border border-white/10 px-1.5 py-0.5 rounded-sm uppercase tracking-wider bg-black/30">
            {npc.habilidade}
          </span>
        </div>

        {/* Stats mini-grid */}
        <div className="grid grid-cols-2 gap-px mx-2 mb-3 text-center text-[10px] bg-black/30 rounded-sm overflow-hidden border border-white/5">
          {([['FOR', npc.forca], ['AGI', npc.agilidade], ['INT', npc.inteligencia], ['RES', npc.resistencia]] as [string,number][]).map(([label, val]) => (
            <div key={label} className="bg-black/20 py-1">
              <div className="text-[8px] text-secondary tracking-widest">{label}</div>
              <div className="font-bold font-cinzel text-foreground">{val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Mystery (unrevealed) card ────────────────────────────────────────────────

function MysteryCard() {
  return (
    <div className="flex-1 min-w-0 rounded-sm border-2 border-primary/30 bg-gradient-to-b from-[#1C2333] to-[#0D1117] flex flex-col items-center justify-center gap-3 py-8 animate-pulse">
      <Sparkles size={28} className="text-primary/40" />
      <span className="font-cinzel font-bold text-primary/40 text-2xl tracking-widest">?</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function Citadel() {
  const { state, buildEdificio, invocarGacha } = useGame();

  const ef      = getEfeitos(state.edificios, state.npcs);
  const vivos   = state.npcs.filter(n => n.vivo).length;
  const slots   = ef.capPopulacao - vivos;
  const consumoComida = +(vivos * 1.2).toFixed(1);
  const saldoComida   = +(ef.comidaDia - consumoComida).toFixed(1);

  const custoGacha  = calcCustoGacha(vivos);
  const batchSize   = Math.min(GACHA_BATCH, slots);
  const semEspaco   = slots <= 0;
  const podeInvocar = !semEspaco
    && state.recursos.comida  >= custoGacha.comida
    && state.recursos.madeira >= custoGacha.madeira
    && state.recursos.ferro   >= custoGacha.ferro;

  // Gacha modal state
  const [gachaNpcs, setGachaNpcs]   = useState<NPC[] | null>(null);
  const [revealed,  setRevealed]    = useState<boolean[]>([]);

  const handleGacha = () => {
    const pulled = invocarGacha();
    if (pulled.length === 0) return;
    setGachaNpcs(pulled);
    setRevealed(pulled.map(() => false));
    pulled.forEach((_, i) => {
      setTimeout(() => {
        setRevealed(prev => prev.map((v, j) => (j === i ? true : v)));
      }, (i + 1) * 500);
    });
  };

  const closeModal = () => { setGachaNpcs(null); setRevealed([]); };

  // ── sub-components ──────────────────────────────────────────────────────────

  const getProgressColor = (current: number, max: number) => {
    const p = current / max;
    if (p > 0.9) return 'bg-destructive';
    if (p > 0.7) return 'bg-warning';
    if (p > 0.5) return 'bg-[#4A9EFF]';
    return 'bg-success';
  };

  const ResourceCard = ({ label, current, max, icon: Icon }: { label: string; current: number; max: number; icon: any }) => (
    <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 p-3 rounded-sm relative overflow-hidden flex flex-col justify-between h-[90px] shadow-md">
      <Icon className="absolute -right-2 -bottom-2 w-12 h-12 text-primary/10" />
      <div className="flex justify-between items-start z-10">
        <span className="text-[10px] text-secondary tracking-widest uppercase">{label}</span>
        <Icon size={14} className="text-primary/70" />
      </div>
      <div className="z-10">
        <div className="flex items-baseline gap-1 mb-1.5">
          <span className="text-xl font-bold font-cinzel text-foreground">{Math.floor(current)}</span>
          <span className="text-[10px] text-muted-foreground font-cinzel">/{max}</span>
        </div>
        <div className="w-full bg-background h-1.5 rounded-sm overflow-hidden border border-white/5">
          <div className={`h-full transition-all ${getProgressColor(current, max)}`}
            style={{ width: `${Math.min(100, (current / max) * 100)}%` }} />
        </div>
      </div>
    </div>
  );

  const CostChip = ({ have, need, icon: Icon }: { have: number; need: number; icon: any }) => (
    <span className={`px-1.5 py-0.5 rounded-sm flex items-center gap-1 text-[10px] font-bold ${
      have < need
        ? 'bg-destructive/10 text-destructive border border-destructive/30'
        : 'bg-background text-secondary border border-card-border'
    }`}>
      <Icon size={10} /> {need}
    </span>
  );

  const renderEdificio = (tipo: EdificioTipo) => {
    const def       = BUILDINGS[tipo];
    const exists    = state.edificios.find(e => e.tipo === tipo);
    const nivelAtual = exists?.nivel || 0;
    const isMax     = nivelAtual >= def.maxNivel;
    const efeitoAtual = nivelAtual > 0 ? def.niveis[nivelAtual - 1].resumo : null;
    const proximo   = isMax ? null : def.niveis[nivelAtual];
    const custo     = proximo?.custo;
    const built     = nivelAtual > 0;

    const canAfford = !!custo
      && (state.recursos.madeira >= (custo.madeira || 0))
      && (state.recursos.pedra   >= (custo.pedra   || 0))
      && (state.recursos.ferro   >= (custo.ferro   || 0));

    return (
      <div key={tipo}
        className={`bg-gradient-to-b from-[#1C2333] to-[#161B22] border ${
          canAfford ? 'border-primary/50 shadow-[0_0_10px_rgba(212,175,55,0.1)]' : 'border-card-border'
        } p-4 flex flex-col justify-between rounded-sm h-full relative overflow-hidden`}
      >
        {built && (
          <div className="absolute top-0 right-0 bg-primary/20 border-l border-b border-primary/30 text-[9px] text-primary font-bold tracking-widest px-2 py-1 rounded-bl-sm">
            NVL {nivelAtual}{isMax ? ' • MÁX' : ''}
          </div>
        )}
        <div className="mb-3">
          <div className="font-bold text-foreground font-cinzel text-lg">{def.nome.toUpperCase()}</div>
          <div className="text-[10px] text-secondary mt-1.5 leading-relaxed tracking-wide">{def.descricao}</div>
          {efeitoAtual && (
            <div className="text-[10px] text-success mt-2 font-bold tracking-wide flex items-center gap-1">
              <TrendingUp size={11} /> Atual: {efeitoAtual}
            </div>
          )}
          {built && POSTO_AFIM[tipo] && (() => {
            const afim    = POSTO_AFIM[tipo]!;
            const workers = state.npcs.filter(n => n.vivo && !n.emExpedicao && n.posto === tipo);
            return (
              <div className="text-[10px] mt-2 flex items-start gap-1 text-secondary">
                <Hammer size={11} className="text-primary/70 mt-0.5 shrink-0" />
                <span>
                  Trabalho ({PROFISSOES[afim].nome}): <span className="text-primary font-bold">{workers.length}/{nivelAtual}</span>
                  {workers.length > 0 && <span className="text-foreground/70"> — {workers.map(w => w.nome).join(', ')}</span>}
                </span>
              </div>
            );
          })()}
        </div>
        {isMax ? (
          <div className="w-full min-h-[48px] border border-primary/30 text-primary/70 text-xs tracking-[0.2em] font-cinzel font-bold rounded-sm flex items-center justify-center bg-primary/5">
            NÍVEL MÁXIMO
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-[10px] text-primary/90 tracking-wide flex items-center gap-1 font-bold">
              <ArrowUp size={11} /> {built ? `Nvl ${nivelAtual + 1}: ` : ''}{proximo!.resumo}
            </div>
            <div className="flex gap-2 flex-wrap">
              {custo!.madeira ? <CostChip have={state.recursos.madeira} need={custo!.madeira} icon={Trees} /> : null}
              {custo!.pedra   ? <CostChip have={state.recursos.pedra}   need={custo!.pedra}   icon={Mountain} /> : null}
              {custo!.ferro   ? <CostChip have={state.recursos.ferro}   need={custo!.ferro}   icon={Zap} /> : null}
            </div>
            <button
              disabled={!canAfford}
              onClick={() => buildEdificio(tipo)}
              className={`w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold transition-all rounded-sm touch-manipulation ${
                canAfford
                  ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]'
                  : 'border-card-border text-muted-foreground opacity-50 cursor-not-allowed bg-black/20'
              }`}
            >
              {built ? 'MELHORAR' : 'CONSTRUIR'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const buildingOrder: EdificioTipo[] = ['Alojamento', 'Fazenda', 'Fogueira', 'Enfermaria', 'Templo', 'Quartel', 'Armazem', 'Arquivo', 'Mirante'];

  return (
    <div className="p-4 space-y-8 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">CIDADELA</h2>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      {/* Armazém */}
      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2">
          ARMAZÉM DE RECURSOS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ResourceCard label="Comida"  current={state.recursos.comida}  max={state.recursos.capacidadeArmazem} icon={Wheat} />
          <ResourceCard label="Madeira" current={state.recursos.madeira} max={state.recursos.capacidadeArmazem} icon={Trees} />
          <ResourceCard label="Pedra"   current={state.recursos.pedra}   max={state.recursos.capacidadeArmazem} icon={Mountain} />
          <ResourceCard label="Ferro"   current={state.recursos.ferro}   max={state.recursos.capacidadeArmazem} icon={Zap} />
        </div>
      </section>

      {/* Balanço diário */}
      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
          BALANÇO DIÁRIO
        </h3>
        <div className="bg-gradient-to-b from-[#1C2333] to-[#161B22] border border-primary/20 rounded-sm p-4 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-secondary tracking-wide flex items-center gap-2">
              <Wheat size={14} className="text-warning" /> Produção de comida
            </span>
            <span className="font-cinzel font-bold text-success">+{ef.comidaDia}/dia</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-secondary tracking-wide flex items-center gap-2">
              <TrendingDown size={14} className="text-destructive" /> Consumo ({vivos} vivos)
            </span>
            <span className="font-cinzel font-bold text-destructive">-{consumoComida}/dia</span>
          </div>
          <div className="flex justify-between items-center text-sm border-t border-primary/10 pt-3">
            <span className="text-foreground tracking-wide font-bold flex items-center gap-2">
              {saldoComida >= 0 ? <TrendingUp size={14} className="text-success" /> : <TrendingDown size={14} className="text-destructive" />}
              Saldo de comida
            </span>
            <span className={`font-cinzel font-bold text-lg ${saldoComida >= 0 ? 'text-success' : 'text-destructive'}`}>
              {saldoComida >= 0 ? '+' : ''}{saldoComida}/dia
            </span>
          </div>
          {saldoComida < 0 && (
            <div className="text-[10px] text-destructive/90 italic pt-1">
              Saldo negativo: construa ou melhore a Fazenda, ou traga comida da Torre.
            </div>
          )}
          {(ef.moralDia > 0 || ef.poderBonus > 0) && (
            <div className="flex gap-4 flex-wrap border-t border-primary/10 pt-3 text-[11px]">
              {ef.moralDia   > 0 && <span className="text-secondary">Moral passivo: <span className="text-success font-bold">+{ef.moralDia}/dia</span></span>}
              {ef.poderBonus > 0 && <span className="text-secondary">Poder de expedição: <span className="text-primary font-bold">+{Math.round(ef.poderBonus * 100)}%</span></span>}
            </div>
          )}
        </div>
      </section>

      {/* ── RITUAL EM TRINDADE (gacha) ─────────────────────────────────────── */}
      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
          RITUAL EM TRINDADE
        </h3>

        <div className="bg-gradient-to-b from-[#231A2E] to-[#161B22] border border-primary/30 rounded-sm p-4 relative overflow-hidden">
          <Sparkles className="absolute -right-3 -bottom-3 w-16 h-16 text-primary/10 pointer-events-none" />

          {/* Pop counter */}
          <div className="flex justify-between items-center mb-3 relative z-10">
            <span className="text-secondary tracking-wide flex items-center gap-2 text-sm">
              <Users size={15} className="text-primary" /> População
            </span>
            <span className={`font-cinzel font-bold text-lg ${semEspaco ? 'text-warning' : 'text-foreground'}`}>
              {vivos} / {ef.capPopulacao}
            </span>
          </div>

          {/* Gacha odds preview */}
          <div className="flex gap-2 mb-3 relative z-10">
            {GACHA_ODDS.map(o => (
              <div key={o.raridade} className="flex-1 text-center">
                <div className="text-[9px] font-bold tracking-widest" style={{ color: RARITY_COLOR[o.raridade] }}>
                  {o.raridade.slice(0,3).toUpperCase()}
                </div>
                <div className="text-[9px] text-secondary">{o.peso}%</div>
              </div>
            ))}
          </div>

          {/* Cost */}
          <div className="flex gap-2 flex-wrap mb-3 relative z-10">
            <CostChip have={state.recursos.comida}  need={custoGacha.comida}  icon={Wheat} />
            <CostChip have={state.recursos.madeira} need={custoGacha.madeira} icon={Trees} />
            <CostChip have={state.recursos.ferro}   need={custoGacha.ferro}   icon={Zap} />
            <span className="text-[10px] text-primary/60 flex items-center ml-auto">
              → {batchSize}× sobreviventes
            </span>
          </div>

          <p className="text-[10px] text-secondary/70 leading-relaxed mb-3 relative z-10">
            Invoca {batchSize} sobrevivente{batchSize !== 1 ? 's' : ''} de uma vez — raridade por sorteio.
            Aumente o limite construindo o <span className="text-primary font-bold">Alojamento</span>.
          </p>

          <button
            disabled={!podeInvocar}
            onClick={handleGacha}
            className={`w-full min-h-[52px] border text-xs tracking-[0.2em] font-cinzel font-bold transition-all rounded-sm touch-manipulation relative z-10 flex items-center justify-center gap-2 ${
              podeInvocar
                ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                : 'border-card-border text-muted-foreground opacity-50 cursor-not-allowed bg-black/20'
            }`}
          >
            <Sparkles size={14} />
            {semEspaco ? 'ALOJAMENTO LOTADO' : `INVOCAR TRINDADE (${batchSize}×)`}
          </button>
        </div>
      </section>

      {/* Infraestrutura */}
      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
          INFRAESTRUTURA
        </h3>
        <p className="text-[10px] text-secondary/70 mb-4 -mt-2">
          Aloque moradores ociosos aos edifícios na aba HABITANTES para potencializar os efeitos.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {buildingOrder.map(tipo => renderEdificio(tipo))}
        </div>
      </section>

      {/* ── Modal de resultado do gacha (estilo GachaLancamento) ──────────────── */}
      {gachaNpcs && (
        <div
          className="fixed inset-0 z-50 bg-black/97 backdrop-blur-lg flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Linha superior dourada */}
          <div className="h-[1px] bg-gradient-to-r from-transparent via-primary/80 to-transparent shrink-0" />

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-primary/20 shrink-0">
            <div>
              <h2 className="font-cinzel font-bold text-primary tracking-[0.2em] text-sm leading-tight">
                RITUAL EM TRINDADE — CONCLUÍDO
              </h2>
              <p className="text-[10px] text-secondary/70 tracking-widest mt-0.5">
                {revealed.every(Boolean)
                  ? 'Toque em cada nome para ver os detalhes'
                  : `${revealed.filter(Boolean).length}/${gachaNpcs.length} sobreviventes revelados`}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="w-9 h-9 border border-card-border/60 text-secondary hover:text-foreground flex items-center justify-center rounded-sm touch-manipulation shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Cards — área principal */}
          <div className="flex-1 flex items-center justify-center px-4 min-h-0">
            <div className="flex gap-3 w-full max-w-sm">
              {gachaNpcs.map((npc, i) => (
                revealed[i]
                  ? <GachaCard key={npc.id} npc={npc} revealed={revealed[i]} />
                  : (
                    <div
                      key={i}
                      className="flex-1 min-w-0 rounded-sm border border-primary/40 bg-gradient-to-b from-[#1C1808] to-[#0E0D0B] flex flex-col items-center justify-center gap-4 py-12 cursor-pointer active:scale-[0.97] transition-transform touch-manipulation shadow-[0_0_20px_rgba(212,175,55,0.05)]"
                      onClick={() => {
                        const next = revealed.map((r, idx) => (idx === i ? true : r));
                        setRevealed(next);
                      }}
                    >
                      <div className="w-5 h-5 rotate-45 border border-primary/50" />
                      <span className="font-cinzel font-bold text-primary/50 text-3xl tracking-widest">?</span>
                      <span className="text-[9px] text-primary/30 tracking-[0.3em] uppercase">REVELAR</span>
                    </div>
                  )
              ))}
            </div>
          </div>

          {/* Resumo de raridades quando todos revelados */}
          {revealed.every(Boolean) && (
            <div className="px-5 py-3 border-t border-primary/10 flex flex-wrap gap-2 justify-center shrink-0">
              {gachaNpcs.map(npc => (
                <span
                  key={npc.id}
                  className="text-[10px] px-2.5 py-1 rounded-sm font-bold tracking-wider border flex items-center gap-1"
                  style={{ color: RARITY_COLOR[npc.raridade], borderColor: RARITY_COLOR[npc.raridade] + '60', background: RARITY_COLOR[npc.raridade] + '15' }}
                >
                  <Star size={8} fill="currentColor" /> {npc.nome} — {npc.raridade}
                </span>
              ))}
            </div>
          )}

          {/* Rodapé */}
          <div className="px-5 pb-6 shrink-0">
            {revealed.every(Boolean) ? (
              <button
                onClick={closeModal}
                className="w-full h-13 bg-primary hover:bg-primary/90 text-primary-foreground font-cinzel font-bold tracking-[0.2em] rounded-sm touch-manipulation shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all"
                style={{ minHeight: '52px' }}
              >
                ACEITAR TODOS E CONTINUAR
              </button>
            ) : (
              <button
                onClick={() => setRevealed([true, true, true])}
                className="w-full border border-primary/30 text-primary/60 font-cinzel text-[10px] tracking-widest py-3 rounded-sm hover:border-primary/60 hover:text-primary transition-all touch-manipulation"
              >
                REVELAR TODOS DE UMA VEZ
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
