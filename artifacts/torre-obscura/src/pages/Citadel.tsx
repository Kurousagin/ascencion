import { useGame } from '../context/GameContext';
import { BUILDINGS, getEfeitos, EdificioTipo, POSTO_AFIM, PROFISSOES, calcCustoInvocacao } from '../lib/game-data';
import { Wheat, Trees, Mountain, Zap, TrendingUp, TrendingDown, ArrowUp, Users, Hammer, Sparkles } from 'lucide-react';

export function Citadel() {
  const { state, buildEdificio, invocarMorador } = useGame();

  const ef = getEfeitos(state.edificios, state.npcs);
  const vivos = state.npcs.filter(n => n.vivo).length;
  const consumoComida = +(vivos * 1.2).toFixed(1);
  const saldoComida = +(ef.comidaDia - consumoComida).toFixed(1);

  const custoInvoc = calcCustoInvocacao(vivos);
  const semEspaco = vivos >= ef.capPopulacao;
  const podeInvocar = !semEspaco &&
    state.recursos.comida >= custoInvoc.comida &&
    state.recursos.madeira >= custoInvoc.madeira &&
    state.recursos.ferro >= custoInvoc.ferro;

  const getProgressColor = (current: number, max: number) => {
    const p = current / max;
    if (p > 0.9) return 'bg-destructive';
    if (p > 0.7) return 'bg-warning';
    if (p > 0.5) return 'bg-[#4A9EFF]';
    return 'bg-success';
  };

  const ResourceCard = ({ label, current, max, icon: Icon }: { label: string, current: number, max: number, icon: any }) => (
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
          <div
            className={`h-full transition-all ${getProgressColor(current, max)}`}
            style={{ width: `${Math.min(100, (current / max) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );

  const CostChip = ({ have, need, icon: Icon }: { have: number, need: number, icon: any }) => (
    <span className={`px-1.5 py-0.5 rounded-sm flex items-center gap-1 ${have < need ? 'bg-destructive/10 text-destructive border border-destructive/30' : 'bg-background text-secondary border border-card-border'}`}>
      <Icon size={10} /> {need}
    </span>
  );

  const renderEdificio = (tipo: EdificioTipo) => {
    const def = BUILDINGS[tipo];
    const exists = state.edificios.find(e => e.tipo === tipo);
    const nivelAtual = exists?.nivel || 0;
    const isMax = nivelAtual >= def.maxNivel;
    const efeitoAtual = nivelAtual > 0 ? def.niveis[nivelAtual - 1].resumo : null;
    const proximo = isMax ? null : def.niveis[nivelAtual];
    const custo = proximo?.custo;

    const canAfford = !!custo &&
      (state.recursos.madeira >= (custo.madeira || 0)) &&
      (state.recursos.pedra >= (custo.pedra || 0)) &&
      (state.recursos.ferro >= (custo.ferro || 0));

    const built = nivelAtual > 0;

    return (
      <div
        key={tipo}
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
            const afim = POSTO_AFIM[tipo]!;
            const workers = state.npcs.filter(n => n.vivo && !n.emExpedicao && n.posto === tipo);
            return (
              <div className="text-[10px] mt-2 flex items-start gap-1 text-secondary">
                <Hammer size={11} className="text-primary/70 mt-0.5 shrink-0" />
                <span>
                  Trabalho ({PROFISSOES[afim].nome}): <span className="text-primary font-bold">{workers.length}/{nivelAtual}</span>
                  {workers.length > 0 && (
                    <span className="text-foreground/70"> — {workers.map(w => w.nome).join(', ')}</span>
                  )}
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
            <div className="flex gap-2 flex-wrap text-[10px] font-bold font-inter">
              {custo!.madeira ? <CostChip have={state.recursos.madeira} need={custo!.madeira} icon={Trees} /> : null}
              {custo!.pedra ? <CostChip have={state.recursos.pedra} need={custo!.pedra} icon={Mountain} /> : null}
              {custo!.ferro ? <CostChip have={state.recursos.ferro} need={custo!.ferro} icon={Zap} /> : null}
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

  const buildingOrder: EdificioTipo[] = ['Alojamento', 'Fazenda', 'Fogueira', 'Enfermaria', 'Templo', 'Quartel', 'Armazem'];

  return (
    <div className="p-4 space-y-8 pb-24 h-full overflow-y-auto custom-scrollbar">
      <header className="pb-3 border-b border-primary/30 relative">
        <h2 className="text-2xl font-cinzel font-bold tracking-widest text-primary">CIDADELA</h2>
        <div className="absolute bottom-0 left-0 w-1/3 gold-line" />
      </header>

      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2">
          ARMAZÉM DE RECURSOS
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ResourceCard label="Comida" current={state.recursos.comida} max={state.recursos.capacidadeArmazem} icon={Wheat} />
          <ResourceCard label="Madeira" current={state.recursos.madeira} max={state.recursos.capacidadeArmazem} icon={Trees} />
          <ResourceCard label="Pedra" current={state.recursos.pedra} max={state.recursos.capacidadeArmazem} icon={Mountain} />
          <ResourceCard label="Ferro" current={state.recursos.ferro} max={state.recursos.capacidadeArmazem} icon={Zap} />
        </div>
      </section>

      {/* Daily balance summary */}
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
              {ef.moralDia > 0 && <span className="text-secondary">Moral passivo: <span className="text-success font-bold">+{ef.moralDia}/dia</span></span>}
              {ef.poderBonus > 0 && <span className="text-secondary">Poder de expedição: <span className="text-primary font-bold">+{Math.round(ef.poderBonus * 100)}%</span></span>}
            </div>
          )}
        </div>
      </section>

      {/* Ritual de Invocação */}
      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
          RITUAL DE INVOCAÇÃO
        </h3>
        <div className="bg-gradient-to-b from-[#231A2E] to-[#161B22] border border-primary/30 rounded-sm p-4 relative overflow-hidden">
          <Sparkles className="absolute -right-3 -bottom-3 w-16 h-16 text-primary/10" />
          <div className="flex justify-between items-center mb-3 relative z-10">
            <span className="text-secondary tracking-wide flex items-center gap-2 text-sm">
              <Users size={15} className="text-primary" /> População
            </span>
            <span className={`font-cinzel font-bold text-lg ${semEspaco ? 'text-warning' : 'text-foreground'}`}>
              {vivos} / {ef.capPopulacao}
            </span>
          </div>
          <p className="text-[10px] text-secondary/80 leading-relaxed mb-3 relative z-10">
            Convoque um novo sobrevivente. O custo cresce a cada morador. Aumente o limite construindo o <span className="text-primary font-bold">Alojamento</span>.
          </p>
          <div className="flex gap-2 flex-wrap text-[10px] font-bold font-inter mb-3 relative z-10">
            <CostChip have={state.recursos.comida} need={custoInvoc.comida} icon={Wheat} />
            <CostChip have={state.recursos.madeira} need={custoInvoc.madeira} icon={Trees} />
            {custoInvoc.ferro > 0 && <CostChip have={state.recursos.ferro} need={custoInvoc.ferro} icon={Zap} />}
          </div>
          <button
            disabled={!podeInvocar}
            onClick={invocarMorador}
            className={`w-full min-h-[48px] border text-xs tracking-[0.2em] font-cinzel font-bold transition-all rounded-sm touch-manipulation relative z-10 flex items-center justify-center gap-2 ${
              podeInvocar
                ? 'border-primary text-primary hover:bg-primary hover:text-primary-foreground active:scale-[0.98]'
                : 'border-card-border text-muted-foreground opacity-50 cursor-not-allowed bg-black/20'
            }`}
          >
            <Sparkles size={14} /> {semEspaco ? 'ALOJAMENTO LOTADO' : 'INVOCAR SOBREVIVENTE'}
          </button>
        </div>
      </section>

      <section>
        <h3 className="text-xs font-cinzel text-primary tracking-widest mb-4 flex items-center gap-2 border-t border-primary/20 pt-6">
          INFRAESTRUTURA
        </h3>
        <p className="text-[10px] text-secondary/70 mb-4 -mt-2">Aloque moradores ociosos aos edifícios na aba HABITANTES para potencializar os efeitos.</p>
        <div className="grid grid-cols-2 gap-4">
          {buildingOrder.map(tipo => renderEdificio(tipo))}
        </div>
      </section>
    </div>
  );
}
